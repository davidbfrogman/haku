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
const base_controller_1 = require("./base/base.controller");
const constants_1 = require("../constants");
const repositories_1 = require("../repositories");
const api_error_handler_1 = require("../api-error-handler");
const bcrypt = require('bcrypt');
class UserController extends base_controller_1.BaseController {
    constructor() {
        super();
        this.defaultPopulationArgument = null;
        this.rolesRequiringOwnership = [constants_1.CONST.GUEST_ROLE, constants_1.CONST.USER_ROLE];
        this.isOwnershipRequired = true;
        this.repository = new repositories_1.UserRepository();
    }
    updatePassword(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (yield this.isModificationAllowed(request, response, next)) {
                    // first we need to get the user from the request.
                    const emailFilledOutUser = yield this.repository.single(this.getId(request));
                    const user = yield this.repository.getUserForPasswordCheck(emailFilledOutUser.email);
                    // now we have a user, with their password, we're going to validate their password.
                    const passwordResult = yield bcrypt.compare(request.body.oldPassword, user.password);
                    if (passwordResult === false) {
                        api_error_handler_1.ApiErrorHandler.sendAuthFailure(response, 401, `Old Password Didn't match.  Password update error.`);
                        return;
                    }
                    // If the user successfully suplied the old password, we're going to update with the new password. 
                    user.password = yield bcrypt.hash(request.body.newPassword, constants_1.CONST.SALT_ROUNDS);
                    yield this.repository.updatePassword(user.id, user.password);
                    user.password = '';
                    response.status(202).json(user);
                    return user;
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
    preCreateHook(User) {
        return __awaiter(this, void 0, void 0, function* () {
            User.href = `${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.USERS}/${User._id}`;
            return User;
        });
    }
    preSendResponseHook(User) {
        return __awaiter(this, void 0, void 0, function* () {
            return User;
        });
    }
}
exports.UserController = UserController;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL2NvbnRyb2xsZXJzL3VzZXIuY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBSUEsNERBQXdEO0FBQ3hELDRDQUFxQztBQUNyQyxrREFBaUQ7QUFFakQsNERBQXVEO0FBQ3ZELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUdqQyxvQkFBNEIsU0FBUSxnQ0FBYztJQVE5QztRQUNJLEtBQUssRUFBRSxDQUFDO1FBUEwsOEJBQXlCLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLDRCQUF1QixHQUFHLENBQUMsaUJBQUssQ0FBQyxVQUFVLEVBQUUsaUJBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5RCx3QkFBbUIsR0FBRyxJQUFJLENBQUM7UUFFM0IsZUFBVSxHQUFHLElBQUksNkJBQWMsRUFBRSxDQUFDO0lBSXpDLENBQUM7SUFFWSxjQUFjLENBQUMsT0FBZ0IsRUFBRSxRQUFrQixFQUFFLElBQWtCOztZQUNoRixJQUFHLENBQUM7Z0JBQ0EsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVELGtEQUFrRDtvQkFDbEQsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFFN0UsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUVyRixtRkFBbUY7b0JBQ25GLE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3JGLEVBQUUsQ0FBQyxDQUFDLGNBQWMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUMzQixtQ0FBZSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLG9EQUFvRCxDQUFDLENBQUM7d0JBQ3JHLE1BQU0sQ0FBQztvQkFDWCxDQUFDO29CQUVELG1HQUFtRztvQkFDbkcsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsaUJBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFFL0UsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFN0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7b0JBRW5CLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNoQixDQUFDO1lBQ0wsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsQ0FBQztRQUNoQyxDQUFDO0tBQUE7SUFFWSxhQUFhLENBQUMsSUFBYzs7WUFDckMsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLGlCQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN6RSxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FBQTtJQUVZLG1CQUFtQixDQUFDLElBQWM7O1lBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUFBO0NBQ0o7QUFoREQsd0NBZ0RDIiwiZmlsZSI6ImNvbnRyb2xsZXJzL3VzZXIuY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElVc2VyRG9jLCBVc2VyLCBJVG9rZW5QYXlsb2FkLCBJQmFzZU1vZGVsLCBJVXNlciwgSUJhc2VNb2RlbERvYyB9IGZyb20gJy4uL21vZGVscyc7XG5pbXBvcnQgeyBSb3V0ZXIsIFJlcXVlc3QsIFJlc3BvbnNlLCBSZXF1ZXN0UGFyYW1IYW5kbGVyLCBOZXh0RnVuY3Rpb24sIFJlcXVlc3RIYW5kbGVyIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgbW9uZ29vc2UgPSByZXF1aXJlKCdtb25nb29zZScpO1xuaW1wb3J0IHsgU2NoZW1hLCBNb2RlbCwgRG9jdW1lbnQgfSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgeyBCYXNlQ29udHJvbGxlciB9IGZyb20gJy4vYmFzZS9iYXNlLmNvbnRyb2xsZXInO1xuaW1wb3J0IHsgQ09OU1QgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgVXNlclJlcG9zaXRvcnkgfSBmcm9tIFwiLi4vcmVwb3NpdG9yaWVzXCI7XG5pbXBvcnQgeyBPd25lcnNoaXBUeXBlIH0gZnJvbSBcIi4uL2VudW1lcmF0aW9uc1wiO1xuaW1wb3J0IHsgQXBpRXJyb3JIYW5kbGVyIH0gZnJvbSAnLi4vYXBpLWVycm9yLWhhbmRsZXInO1xuY29uc3QgYmNyeXB0ID0gcmVxdWlyZSgnYmNyeXB0Jyk7XG5cblxuZXhwb3J0IGNsYXNzIFVzZXJDb250cm9sbGVyIGV4dGVuZHMgQmFzZUNvbnRyb2xsZXIge1xuXG4gICAgcHVibGljIGRlZmF1bHRQb3B1bGF0aW9uQXJndW1lbnQgPSBudWxsO1xuICAgIHB1YmxpYyByb2xlc1JlcXVpcmluZ093bmVyc2hpcCA9IFtDT05TVC5HVUVTVF9ST0xFLCBDT05TVC5VU0VSX1JPTEVdO1xuICAgIHB1YmxpYyBpc093bmVyc2hpcFJlcXVpcmVkID0gdHJ1ZTtcblxuICAgIHB1YmxpYyByZXBvc2l0b3J5ID0gbmV3IFVzZXJSZXBvc2l0b3J5KCk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdXBkYXRlUGFzc3dvcmQocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPElVc2VyPiB7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGlmIChhd2FpdCB0aGlzLmlzTW9kaWZpY2F0aW9uQWxsb3dlZChyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCkpIHtcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCB3ZSBuZWVkIHRvIGdldCB0aGUgdXNlciBmcm9tIHRoZSByZXF1ZXN0LlxuICAgICAgICAgICAgICAgIGNvbnN0IGVtYWlsRmlsbGVkT3V0VXNlciA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5zaW5nbGUodGhpcy5nZXRJZChyZXF1ZXN0KSk7XG4gICAgXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5nZXRVc2VyRm9yUGFzc3dvcmRDaGVjayhlbWFpbEZpbGxlZE91dFVzZXIuZW1haWwpO1xuICAgIFxuICAgICAgICAgICAgICAgIC8vIG5vdyB3ZSBoYXZlIGEgdXNlciwgd2l0aCB0aGVpciBwYXNzd29yZCwgd2UncmUgZ29pbmcgdG8gdmFsaWRhdGUgdGhlaXIgcGFzc3dvcmQuXG4gICAgICAgICAgICAgICAgY29uc3QgcGFzc3dvcmRSZXN1bHQgPSBhd2FpdCBiY3J5cHQuY29tcGFyZShyZXF1ZXN0LmJvZHkub2xkUGFzc3dvcmQsIHVzZXIucGFzc3dvcmQpO1xuICAgICAgICAgICAgICAgIGlmIChwYXNzd29yZFJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgQXBpRXJyb3JIYW5kbGVyLnNlbmRBdXRoRmFpbHVyZShyZXNwb25zZSwgNDAxLCBgT2xkIFBhc3N3b3JkIERpZG4ndCBtYXRjaC4gIFBhc3N3b3JkIHVwZGF0ZSBlcnJvci5gKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgdXNlciBzdWNjZXNzZnVsbHkgc3VwbGllZCB0aGUgb2xkIHBhc3N3b3JkLCB3ZSdyZSBnb2luZyB0byB1cGRhdGUgd2l0aCB0aGUgbmV3IHBhc3N3b3JkLiBcbiAgICAgICAgICAgICAgICB1c2VyLnBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2gocmVxdWVzdC5ib2R5Lm5ld1Bhc3N3b3JkLCBDT05TVC5TQUxUX1JPVU5EUyk7XG4gICAgXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZXBvc2l0b3J5LnVwZGF0ZVBhc3N3b3JkKHVzZXIuaWQsIHVzZXIucGFzc3dvcmQpO1xuICAgIFxuICAgICAgICAgICAgICAgIHVzZXIucGFzc3dvcmQgPSAnJztcbiAgICBcbiAgICAgICAgICAgICAgICByZXNwb25zZS5zdGF0dXMoMjAyKS5qc29uKHVzZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB1c2VyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpOyB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHByZUNyZWF0ZUhvb2soVXNlcjogSVVzZXJEb2MpOiBQcm9taXNlPElVc2VyRG9jPiB7XG4gICAgICAgIFVzZXIuaHJlZiA9IGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuVVNFUlN9LyR7VXNlci5faWR9YDtcbiAgICAgICAgcmV0dXJuIFVzZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHByZVNlbmRSZXNwb25zZUhvb2soVXNlcjogSVVzZXJEb2MpOiBQcm9taXNlPElVc2VyRG9jPiB7XG4gICAgICAgIHJldHVybiBVc2VyO1xuICAgIH1cbn1cbiJdfQ==
