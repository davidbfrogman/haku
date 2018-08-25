"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config/config");
const constants_1 = require("../constants");
const api_error_handler_1 = require("../api-error-handler");
const log = require("winston");
const base_controller_1 = require("./base/base.controller");
const index_1 = require("../repositories/index");
const moment = require("moment");
const enums = require("../enumerations");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
class AuthenticationController extends base_controller_1.BaseController {
    constructor() {
        super(...arguments);
        this.repository = new index_1.UserRepository();
        this.isOwnershipRequired = true;
        this.rolesRequiringOwnership = [''];
        this.saltRounds = 5;
        this.tokenExpiration = '24h';
    }
    AuthenticationController() { }
    authenticateLocal(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.repository.getUserForPasswordCheck(request.body.email);
                if (!user.isActive) {
                    api_error_handler_1.ApiErrorHandler.sendAuthFailure(response, 401, 'User is no longer active.');
                }
                const passwordResult = yield bcrypt.compare(request.body.password, user.password);
                if (passwordResult === false) {
                    api_error_handler_1.ApiErrorHandler.sendAuthFailure(response, 401, 'Authentication Failed');
                    return;
                }
                request.user = user;
                yield this.sendTokenResponse(request, response, next);
            }
            catch (err) {
                api_error_handler_1.ApiErrorHandler.sendAuthFailure(response, 401, err);
            }
        });
    }
    sendTokenResponse(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = request.user;
                // notice how we're not doing a password check in this case. 
                // There's basically a soft expiration time on this token, which is set with moment,
                // and a hard expiration time set on this token with jwt sign.  
                const tokenPayload = {
                    userId: user.id,
                    // We're just going to put the name of the role on the token.
                    roles: user.roles,
                    email: user.email,
                    expiresAt: moment().add(moment.duration(1, 'day')).format(constants_1.CONST.MOMENT_DATE_FORMAT)
                };
                const token = jwt.sign(tokenPayload, config_1.Config.active.get('jwtSecretToken'), {
                    expiresIn: '25h'
                });
                // We're adding the decoded details because the jsonwebtoken library doesn't work on mobile. 
                // that's a problem, because we want to get the user id off the token, for update requests.
                response.json({
                    authenticated: true,
                    message: 'Successfully created jwt authentication token.',
                    expiresAt: tokenPayload.expiresAt,
                    token: token,
                    decoded: tokenPayload
                });
            }
            catch (err) {
                api_error_handler_1.ApiErrorHandler.sendAuthFailure(response, 401, err);
            }
        });
    }
    register(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First we have to check if the email address is unique
                if (yield this.repository.findUserByEmail(request.body.email)) {
                    api_error_handler_1.ApiErrorHandler.sendError('That user email already exists', 400, response, constants_1.CONST.errorCodes.EMAIL_TAKEN);
                    return;
                }
                if (!request.body.password || request.body.password.length < 6) {
                    api_error_handler_1.ApiErrorHandler.sendError('Password must be supplied, and be at least 6 chars', 400, response, constants_1.CONST.errorCodes.PASSWORD_FAILED_CHECKS);
                    return;
                }
                let user = this.repository.createFromBody(request.body);
                // now we need to do a few things to this user.
                // first up hash the password
                user.password = yield bcrypt.hash(user.password, constants_1.CONST.SALT_ROUNDS);
                // Next we need to add this user to the guest role.  Basically no permissions.
                user.roles.push(constants_1.CONST.USER_ROLE);
                user.isEmailVerified = false;
                user = yield user.save();
                //Now that we have an id, we're going to update the user again, with their ownership of themselves.
                user.owners = new Array();
                // You have to add yourself as an owner, otherwise you can't make changes to your profile. 
                user.owners.push({
                    ownerId: user.id,
                    ownershipType: enums.OwnershipType.user
                });
                yield this.repository.update(user.id, user);
                // // if there was a problem sending the email verification email.
                // // we're going to delete the newly created user, and return an error  this will make sure people can still try and register with the same email.
                // try {
                //     // If we're in the test environment, shoot the emails off to our test email address.
                //     if (Config.active.get('sendEmailToTestAccount')) {
                //         // Now we shoot off a notification to mandrill
                //         await EmailVerificationNotification.sendVerificationEmail(Config.active.get('emailToUseForTesting'), emailVerificationDoc.id, request);
                //     }
                //     else {
                //         // Now we shoot off a notification to mandrill
                //         await EmailVerificationNotification.sendVerificationEmail(user.email, emailVerificationDoc.id, request);
                //     }
                // }
                // catch (err) {
                //     await user.remove();
                //     await emailVerificationDoc.remove();
                //     throw err;
                // }
                //Clean up the user before we return it to the register call;
                user.password = '';
                response.status(201).json(user);
            }
            catch (err) {
                api_error_handler_1.ApiErrorHandler.sendError('There was an error with registratrion', 400, response, null, err);
            }
        });
    }
    authMiddleware(request, response, next) {
        try {
            const token = request.headers['x-access-token'];
            //console.log(token);
            if (token) {
                // verifies secret and checks exp
                //Rewrite to use async or something 
                jwt.verify(token, config_1.Config.active.get('jwtSecretToken'), (err, decoded) => {
                    if (err) {
                        log.error(JSON.stringify(err));
                        api_error_handler_1.ApiErrorHandler.sendAuthFailure(response, 401, `Failed to authenticate token. The timer *may* have expired on this token. err: ${err}`);
                    }
                    else {
                        var token = decoded;
                        request[constants_1.CONST.REQUEST_TOKEN_LOCATION] = token;
                        next();
                    }
                });
            }
            else {
                //No token, send auth failure
                return api_error_handler_1.ApiErrorHandler.sendAuthFailure(response, 403, 'No Authentication Token Provided');
            }
        }
        catch (err) {
            api_error_handler_1.ApiErrorHandler.sendAuthFailure(response, 401, "Authentication Failed");
        }
    }
}
exports.AuthenticationController = AuthenticationController;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL2NvbnRyb2xsZXJzL2F1dGhlbnRpY2F0aW9uLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUlBLDZDQUEwQztBQUUxQyw0Q0FBcUM7QUFDckMsNERBQXVEO0FBQ3ZELCtCQUErQjtBQUMvQiw0REFBd0Q7QUFDeEQsaURBQXVFO0FBQ3ZFLGlDQUFpQztBQUNqQyx5Q0FBeUM7QUFHekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQU1wQyw4QkFBc0MsU0FBUSxnQ0FBYztJQUE1RDs7UUFFVyxlQUFVLEdBQW1CLElBQUksc0JBQWMsRUFBRSxDQUFDO1FBRWxELHdCQUFtQixHQUFZLElBQUksQ0FBQztRQUNwQyw0QkFBdUIsR0FBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBSXhDLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFDdkIsb0JBQWUsR0FBVyxLQUFLLENBQUM7SUEySTVDLENBQUM7SUE5SVUsd0JBQXdCLEtBQUksQ0FBQztJQUt2QixpQkFBaUIsQ0FBQyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0I7O1lBQ25GLElBQUksQ0FBQztnQkFDRCxNQUFNLElBQUksR0FBYSxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFekYsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUEsQ0FBQztvQkFDZixtQ0FBZSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLDJCQUEyQixDQUFDLENBQUM7Z0JBQ2hGLENBQUM7Z0JBQ0QsTUFBTSxjQUFjLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FB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QUFzQixDQUFDLEdBQUcsS0FBSyxDQUFDO3dCQUM5QyxJQUFJLEVBQUUsQ0FBQztvQkFDWCxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLDZCQUE2QjtnQkFDN0IsTUFBTSxDQUFDLG1DQUFlLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztZQUM5RixDQUFDO1FBQ0wsQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDWCxtQ0FBZSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFDNUUsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQXJKRCw0REFxSkMiLCJmaWxlIjoiY29udHJvbGxlcnMvYXV0aGVudGljYXRpb24uY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJvdXRlciwgUmVxdWVzdCwgUmVzcG9uc2UsIFJlcXVlc3RQYXJhbUhhbmRsZXIsIE5leHRGdW5jdGlvbiwgUmVxdWVzdEhhbmRsZXIsIEFwcGxpY2F0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgKiBhcyBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IG1vbmdvb3NlID0gcmVxdWlyZSgnbW9uZ29vc2UnKTtcbmltcG9ydCB7IFNjaGVtYSwgTW9kZWwsIERvY3VtZW50IH0gZnJvbSAnbW9uZ29vc2UnO1xuaW1wb3J0IHsgQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZyc7XG5pbXBvcnQgeyBJVG9rZW5QYXlsb2FkLCBJQmFzZU1vZGVsRG9jLCBJVXNlckRvYywgVXNlciwgU2VhcmNoQ3JpdGVyaWEsIElVc2VyLCBJT3duZWQsIElPd25lciB9IGZyb20gJy4uL21vZGVscy8nO1xuaW1wb3J0IHsgQ09OU1QgfSBmcm9tIFwiLi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBBcGlFcnJvckhhbmRsZXIgfSBmcm9tIFwiLi4vYXBpLWVycm9yLWhhbmRsZXJcIjtcbmltcG9ydCAqIGFzIGxvZyBmcm9tICd3aW5zdG9uJztcbmltcG9ydCB7IEJhc2VDb250cm9sbGVyIH0gZnJvbSAnLi9iYXNlL2Jhc2UuY29udHJvbGxlcic7XG5pbXBvcnQgeyBCYXNlUmVwb3NpdG9yeSwgVXNlclJlcG9zaXRvcnkgfSBmcm9tICcuLi9yZXBvc2l0b3JpZXMvaW5kZXgnO1xuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgKiBhcyBlbnVtcyBmcm9tICcuLi9lbnVtZXJhdGlvbnMnO1xuXG5cbmNvbnN0IGJjcnlwdCA9IHJlcXVpcmUoJ2JjcnlwdCcpO1xuY29uc3Qgand0ID0gcmVxdWlyZSgnanNvbndlYnRva2VuJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbmZpZ3VyZVVzZXJ7XG4gICAgKHByb2ZpbGU6IGFueSkgOiBJVXNlclxufVxuXG5leHBvcnQgY2xhc3MgQXV0aGVudGljYXRpb25Db250cm9sbGVyIGV4dGVuZHMgQmFzZUNvbnRyb2xsZXJ7XG5cbiAgICBwdWJsaWMgcmVwb3NpdG9yeTogVXNlclJlcG9zaXRvcnkgPSBuZXcgVXNlclJlcG9zaXRvcnkoKTtcbiAgICBwdWJsaWMgZGVmYXVsdFBvcHVsYXRpb25Bcmd1bWVudDogb2JqZWN0O1xuICAgIHB1YmxpYyBpc093bmVyc2hpcFJlcXVpcmVkOiBib29sZWFuID0gdHJ1ZTsgIFxuICAgIHB1YmxpYyByb2xlc1JlcXVpcmluZ093bmVyc2hpcDogc3RyaW5nW10gPSBbJyddO1xuXG4gICAgcHVibGljIEF1dGhlbnRpY2F0aW9uQ29udHJvbGxlcigpeyB9XG5cbiAgICBwcml2YXRlIHNhbHRSb3VuZHM6IE51bWJlciA9IDU7XG4gICAgcHJpdmF0ZSB0b2tlbkV4cGlyYXRpb246IHN0cmluZyA9ICcyNGgnO1xuXG4gICAgcHVibGljIGFzeW5jIGF1dGhlbnRpY2F0ZUxvY2FsKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXIgOklVc2VyRG9jID0gYXdhaXQgdGhpcy5yZXBvc2l0b3J5LmdldFVzZXJGb3JQYXNzd29yZENoZWNrKHJlcXVlc3QuYm9keS5lbWFpbCk7XG5cbiAgICAgICAgICAgIGlmKCF1c2VyLmlzQWN0aXZlKXtcbiAgICAgICAgICAgICAgICBBcGlFcnJvckhhbmRsZXIuc2VuZEF1dGhGYWlsdXJlKHJlc3BvbnNlLCA0MDEsICdVc2VyIGlzIG5vIGxvbmdlciBhY3RpdmUuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYXNzd29yZFJlc3VsdCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHJlcXVlc3QuYm9keS5wYXNzd29yZCwgdXNlci5wYXNzd29yZCk7XG4gICAgICAgICAgICBpZiAocGFzc3dvcmRSZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgQXBpRXJyb3JIYW5kbGVyLnNlbmRBdXRoRmFpbHVyZShyZXNwb25zZSwgNDAxLCAnQXV0aGVudGljYXRpb24gRmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxdWVzdC51c2VyID0gdXNlcjtcblxuICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kVG9rZW5SZXNwb25zZShyZXF1ZXN0LHJlc3BvbnNlLG5leHQpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycikgeyBBcGlFcnJvckhhbmRsZXIuc2VuZEF1dGhGYWlsdXJlKHJlc3BvbnNlLCA0MDEsIGVycik7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2VuZFRva2VuUmVzcG9uc2UocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdXNlciA9IHJlcXVlc3QudXNlcjtcbiAgICAgICAgICAgIC8vIG5vdGljZSBob3cgd2UncmUgbm90IGRvaW5nIGEgcGFzc3dvcmQgY2hlY2sgaW4gdGhpcyBjYXNlLiBcblxuICAgICAgICAgICAgLy8gVGhlcmUncyBiYXNpY2FsbHkgYSBzb2Z0IGV4cGlyYXRpb24gdGltZSBvbiB0aGlzIHRva2VuLCB3aGljaCBpcyBzZXQgd2l0aCBtb21lbnQsXG4gICAgICAgICAgICAvLyBhbmQgYSBoYXJkIGV4cGlyYXRpb24gdGltZSBzZXQgb24gdGhpcyB0b2tlbiB3aXRoIGp3dCBzaWduLiAgXG4gICAgICAgICAgICBjb25zdCB0b2tlblBheWxvYWQ6IElUb2tlblBheWxvYWQgPSB7XG4gICAgICAgICAgICAgICAgdXNlcklkOiB1c2VyLmlkLFxuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGp1c3QgZ29pbmcgdG8gcHV0IHRoZSBuYW1lIG9mIHRoZSByb2xlIG9uIHRoZSB0b2tlbi5cbiAgICAgICAgICAgICAgICByb2xlczogdXNlci5yb2xlcyxcbiAgICAgICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICAgICAgICBleHBpcmVzQXQ6IG1vbWVudCgpLmFkZChtb21lbnQuZHVyYXRpb24oMSwgJ2RheScpKS5mb3JtYXQoQ09OU1QuTU9NRU5UX0RBVEVfRk9STUFUKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdG9rZW4gPSBqd3Quc2lnbih0b2tlblBheWxvYWQsIENvbmZpZy5hY3RpdmUuZ2V0KCdqd3RTZWNyZXRUb2tlbicpLCB7XG4gICAgICAgICAgICAgICAgZXhwaXJlc0luOiAnMjVoJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFdlJ3JlIGFkZGluZyB0aGUgZGVjb2RlZCBkZXRhaWxzIGJlY2F1c2UgdGhlIGpzb253ZWJ0b2tlbiBsaWJyYXJ5IGRvZXNuJ3Qgd29yayBvbiBtb2JpbGUuIFxuICAgICAgICAgICAgLy8gdGhhdCdzIGEgcHJvYmxlbSwgYmVjYXVzZSB3ZSB3YW50IHRvIGdldCB0aGUgdXNlciBpZCBvZmYgdGhlIHRva2VuLCBmb3IgdXBkYXRlIHJlcXVlc3RzLlxuICAgICAgICAgICAgcmVzcG9uc2UuanNvbih7XG4gICAgICAgICAgICAgICAgYXV0aGVudGljYXRlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnU3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgand0IGF1dGhlbnRpY2F0aW9uIHRva2VuLicsXG4gICAgICAgICAgICAgICAgZXhwaXJlc0F0OiB0b2tlblBheWxvYWQuZXhwaXJlc0F0LFxuICAgICAgICAgICAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgICAgICAgICAgICBkZWNvZGVkOiB0b2tlblBheWxvYWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHsgQXBpRXJyb3JIYW5kbGVyLnNlbmRBdXRoRmFpbHVyZShyZXNwb25zZSwgNDAxLCBlcnIpOyB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHJlZ2lzdGVyKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEZpcnN0IHdlIGhhdmUgdG8gY2hlY2sgaWYgdGhlIGVtYWlsIGFkZHJlc3MgaXMgdW5pcXVlXG4gICAgICAgICAgICBpZiAoYXdhaXQgdGhpcy5yZXBvc2l0b3J5LmZpbmRVc2VyQnlFbWFpbChyZXF1ZXN0LmJvZHkuZW1haWwpKSB7XG4gICAgICAgICAgICAgICAgQXBpRXJyb3JIYW5kbGVyLnNlbmRFcnJvcignVGhhdCB1c2VyIGVtYWlsIGFscmVhZHkgZXhpc3RzJywgNDAwLCByZXNwb25zZSwgQ09OU1QuZXJyb3JDb2Rlcy5FTUFJTF9UQUtFTik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyZXF1ZXN0LmJvZHkucGFzc3dvcmQgfHwgcmVxdWVzdC5ib2R5LnBhc3N3b3JkLmxlbmd0aCA8IDYpIHtcbiAgICAgICAgICAgICAgICBBcGlFcnJvckhhbmRsZXIuc2VuZEVycm9yKCdQYXNzd29yZCBtdXN0IGJlIHN1cHBsaWVkLCBhbmQgYmUgYXQgbGVhc3QgNiBjaGFycycsIDQwMCwgcmVzcG9uc2UsIENPTlNULmVycm9yQ29kZXMuUEFTU1dPUkRfRkFJTEVEX0NIRUNLUyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdXNlcjogSVVzZXJEb2MgPSB0aGlzLnJlcG9zaXRvcnkuY3JlYXRlRnJvbUJvZHkocmVxdWVzdC5ib2R5KTtcblxuICAgICAgICAgICAgLy8gbm93IHdlIG5lZWQgdG8gZG8gYSBmZXcgdGhpbmdzIHRvIHRoaXMgdXNlci5cbiAgICAgICAgICAgIC8vIGZpcnN0IHVwIGhhc2ggdGhlIHBhc3N3b3JkXG4gICAgICAgICAgICB1c2VyLnBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2godXNlci5wYXNzd29yZCwgQ09OU1QuU0FMVF9ST1VORFMpO1xuXG4gICAgICAgICAgICAvLyBOZXh0IHdlIG5lZWQgdG8gYWRkIHRoaXMgdXNlciB0byB0aGUgZ3Vlc3Qgcm9sZS4gIEJhc2ljYWxseSBubyBwZXJtaXNzaW9ucy5cbiAgICAgICAgICAgIHVzZXIucm9sZXMucHVzaChDT05TVC5VU0VSX1JPTEUpO1xuICAgICAgICAgICAgdXNlci5pc0VtYWlsVmVyaWZpZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgdXNlciA9IGF3YWl0IHVzZXIuc2F2ZSgpO1xuXG4gICAgICAgICAgICAvL05vdyB0aGF0IHdlIGhhdmUgYW4gaWQsIHdlJ3JlIGdvaW5nIHRvIHVwZGF0ZSB0aGUgdXNlciBhZ2Fpbiwgd2l0aCB0aGVpciBvd25lcnNoaXAgb2YgdGhlbXNlbHZlcy5cbiAgICAgICAgICAgIHVzZXIub3duZXJzID0gbmV3IEFycmF5PElPd25lcj4oKTtcblxuICAgICAgICAgICAgLy8gWW91IGhhdmUgdG8gYWRkIHlvdXJzZWxmIGFzIGFuIG93bmVyLCBvdGhlcndpc2UgeW91IGNhbid0IG1ha2UgY2hhbmdlcyB0byB5b3VyIHByb2ZpbGUuIFxuICAgICAgICAgICAgdXNlci5vd25lcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgb3duZXJJZDogdXNlci5pZCxcbiAgICAgICAgICAgICAgICBvd25lcnNoaXBUeXBlOiBlbnVtcy5Pd25lcnNoaXBUeXBlLnVzZXJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJlcG9zaXRvcnkudXBkYXRlKHVzZXIuaWQsdXNlcik7XG5cbiAgICAgICAgICAgIC8vIC8vIGlmIHRoZXJlIHdhcyBhIHByb2JsZW0gc2VuZGluZyB0aGUgZW1haWwgdmVyaWZpY2F0aW9uIGVtYWlsLlxuICAgICAgICAgICAgLy8gLy8gd2UncmUgZ29pbmcgdG8gZGVsZXRlIHRoZSBuZXdseSBjcmVhdGVkIHVzZXIsIGFuZCByZXR1cm4gYW4gZXJyb3IgIHRoaXMgd2lsbCBtYWtlIHN1cmUgcGVvcGxlIGNhbiBzdGlsbCB0cnkgYW5kIHJlZ2lzdGVyIHdpdGggdGhlIHNhbWUgZW1haWwuXG4gICAgICAgICAgICAvLyB0cnkge1xuICAgICAgICAgICAgLy8gICAgIC8vIElmIHdlJ3JlIGluIHRoZSB0ZXN0IGVudmlyb25tZW50LCBzaG9vdCB0aGUgZW1haWxzIG9mZiB0byBvdXIgdGVzdCBlbWFpbCBhZGRyZXNzLlxuICAgICAgICAgICAgLy8gICAgIGlmIChDb25maWcuYWN0aXZlLmdldCgnc2VuZEVtYWlsVG9UZXN0QWNjb3VudCcpKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIC8vIE5vdyB3ZSBzaG9vdCBvZmYgYSBub3RpZmljYXRpb24gdG8gbWFuZHJpbGxcbiAgICAgICAgICAgIC8vICAgICAgICAgYXdhaXQgRW1haWxWZXJpZmljYXRpb25Ob3RpZmljYXRpb24uc2VuZFZlcmlmaWNhdGlvbkVtYWlsKENvbmZpZy5hY3RpdmUuZ2V0KCdlbWFpbFRvVXNlRm9yVGVzdGluZycpLCBlbWFpbFZlcmlmaWNhdGlvbkRvYy5pZCwgcmVxdWVzdCk7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gICAgICAgICAvLyBOb3cgd2Ugc2hvb3Qgb2ZmIGEgbm90aWZpY2F0aW9uIHRvIG1hbmRyaWxsXG4gICAgICAgICAgICAvLyAgICAgICAgIGF3YWl0IEVtYWlsVmVyaWZpY2F0aW9uTm90aWZpY2F0aW9uLnNlbmRWZXJpZmljYXRpb25FbWFpbCh1c2VyLmVtYWlsLCBlbWFpbFZlcmlmaWNhdGlvbkRvYy5pZCwgcmVxdWVzdCk7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gICAgIGF3YWl0IHVzZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICAvLyAgICAgYXdhaXQgZW1haWxWZXJpZmljYXRpb25Eb2MucmVtb3ZlKCk7XG4gICAgICAgICAgICAvLyAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAvL0NsZWFuIHVwIHRoZSB1c2VyIGJlZm9yZSB3ZSByZXR1cm4gaXQgdG8gdGhlIHJlZ2lzdGVyIGNhbGw7XG4gICAgICAgICAgICB1c2VyLnBhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICByZXNwb25zZS5zdGF0dXMoMjAxKS5qc29uKHVzZXIpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHsgQXBpRXJyb3JIYW5kbGVyLnNlbmRFcnJvcignVGhlcmUgd2FzIGFuIGVycm9yIHdpdGggcmVnaXN0cmF0cmlvbicsIDQwMCwgcmVzcG9uc2UsIG51bGwsIGVycik7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXV0aE1pZGRsZXdhcmUocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiBSZXNwb25zZSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IHJlcXVlc3QuaGVhZGVyc1sneC1hY2Nlc3MtdG9rZW4nXTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2codG9rZW4pO1xuICAgICAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgICAgICAgLy8gdmVyaWZpZXMgc2VjcmV0IGFuZCBjaGVja3MgZXhwXG4gICAgICAgICAgICAgICAgLy9SZXdyaXRlIHRvIHVzZSBhc3luYyBvciBzb21ldGhpbmcgXG4gICAgICAgICAgICAgICAgand0LnZlcmlmeSh0b2tlbiwgQ29uZmlnLmFjdGl2ZS5nZXQoJ2p3dFNlY3JldFRva2VuJyksIChlcnIsIGRlY29kZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKEpTT04uc3RyaW5naWZ5KGVycikpOyBcbiAgICAgICAgICAgICAgICAgICAgICAgIEFwaUVycm9ySGFuZGxlci5zZW5kQXV0aEZhaWx1cmUocmVzcG9uc2UsIDQwMSwgYEZhaWxlZCB0byBhdXRoZW50aWNhdGUgdG9rZW4uIFRoZSB0aW1lciAqbWF5KiBoYXZlIGV4cGlyZWQgb24gdGhpcyB0b2tlbi4gZXJyOiAke2Vycn1gKTsgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG9rZW46IElUb2tlblBheWxvYWQgPSBkZWNvZGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdFtDT05TVC5SRVFVRVNUX1RPS0VOX0xPQ0FUSU9OXSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vTm8gdG9rZW4sIHNlbmQgYXV0aCBmYWlsdXJlXG4gICAgICAgICAgICAgICAgcmV0dXJuIEFwaUVycm9ySGFuZGxlci5zZW5kQXV0aEZhaWx1cmUocmVzcG9uc2UsIDQwMywgJ05vIEF1dGhlbnRpY2F0aW9uIFRva2VuIFByb3ZpZGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgQXBpRXJyb3JIYW5kbGVyLnNlbmRBdXRoRmFpbHVyZShyZXNwb25zZSwgNDAxLCBcIkF1dGhlbnRpY2F0aW9uIEZhaWxlZFwiKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
