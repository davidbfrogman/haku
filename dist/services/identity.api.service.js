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
const moment = require("moment");
const superagent = require("superagent");
const log = require("winston");
const base_service_1 = require("./base/base.service");
const jwt = require('jsonwebtoken');
class IdentityApiService extends base_service_1.BaseService {
    constructor(endpoint) {
        super(endpoint);
        super.baseUrl = config_1.Config.active.get('identityApiEndpoint');
        super.apiName = 'Identity.Api.Service';
    }
    ;
    static getSysToken() {
        return __awaiter(this, void 0, void 0, function* () {
            //If the systemToken is null, or the system token is close to expiring, go get a new system token.
            if (!this.currentSystemToken ||
                moment().isAfter(moment(this.currentSystemTokenExpiresAt, constants_1.CONST.MOMENT_DATE_FORMAT).subtract(1, 'h'))) {
                const token = yield new IdentityApiService(constants_1.CONST.ep.AUTHENTICATE).authenticateUser("system@alembic.com", config_1.Config.active.get('systemUserPassword'));
                // We're just going to decode the token.  DON'T just trust tokens from anyone.  This isn't from a user, it's from our 
                // identity service.
                let decoded = jwt.decode(token);
                this.currentSystemToken = token;
                this.currentSystemTokenExpiresAt = decoded.expiresAt;
            }
            return this.currentSystemToken;
        });
    }
    // This will authenticate a user, and return their auth token from the identity api.
    // mostly used for testing purposes.  don't authenticate a user from this microservice.
    authenticateUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            // We don't need to add a x-access-token here because the register endpoint is open.
            try {
                log.info('Authenticating a user:' + email);
                let response = yield superagent
                    .post(`${this.baseUrl}${constants_1.CONST.ep.AUTHENTICATE}`)
                    .send({
                    email: email,
                    password: password,
                });
                return response.body.token;
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    // This will register a user.
    registerUser(body) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            // We don't need to add a x-access-token here because the register endpoint is open.
            try {
                console.log('registering user ' + `${this.baseUrl}${constants_1.CONST.ep.REGISTER}`);
                let response = yield superagent
                    .post(`${this.baseUrl}${constants_1.CONST.ep.REGISTER}`)
                    .send(body);
                return response;
            }
            catch (err) {
                _super("errorHandler").call(this, err);
            }
        });
    }
}
exports.IdentityApiService = IdentityApiService;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3NlcnZpY2VzL2lkZW50aXR5LmFwaS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSw2Q0FBMEM7QUFDMUMsNENBQXFDO0FBRXJDLGlDQUFpQztBQUNqQyx5Q0FBeUM7QUFFekMsK0JBQStCO0FBQy9CLHNEQUFrRDtBQUVsRCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFcEMsd0JBQWdDLFNBQVEsMEJBQVc7SUFLL0MsWUFBWSxRQUFnQjtRQUN4QixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxlQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3pELEtBQUssQ0FBQyxPQUFPLEdBQUcsc0JBQXNCLENBQUM7SUFDM0MsQ0FBQztJQUFBLENBQUM7SUFFSyxNQUFNLENBQU8sV0FBVzs7WUFDM0Isa0dBQWtHO1lBQ2xHLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQjtnQkFDeEIsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsaUJBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXhHLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxrQkFBa0IsQ0FBQyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxlQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7Z0JBRWxKLHNIQUFzSDtnQkFDdEgsb0JBQW9CO2dCQUNwQixJQUFJLE9BQU8sR0FBa0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFL0MsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztnQkFDaEMsSUFBSSxDQUFDLDJCQUEyQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDekQsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDbkMsQ0FBQztLQUFBO0lBRUQsb0ZBQW9GO0lBQ3BGLHVGQUF1RjtJQUMxRSxnQkFBZ0IsQ0FBQyxLQUFhLEVBQUUsUUFBZ0I7O1lBQ3pELG9GQUFvRjtZQUNwRixJQUFJLENBQUM7Z0JBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxLQUFLLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxRQUFRLEdBQXdCLE1BQU0sVUFBVTtxQkFDL0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztxQkFDL0MsSUFBSSxDQUFDO29CQUNGLEtBQUssRUFBRSxLQUFLO29CQUNaLFFBQVEsRUFBRSxRQUFRO2lCQUNyQixDQUFDLENBQUM7Z0JBRVAsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQy9CLENBQUM7WUFDRCxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNULElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVELDZCQUE2QjtJQUNoQixZQUFZLENBQUMsSUFBUzs7O1lBQy9CLG9GQUFvRjtZQUNwRixJQUFJLENBQUM7Z0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtnQkFDeEUsSUFBSSxRQUFRLEdBQXdCLE1BQU0sVUFBVTtxQkFDL0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztxQkFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVoQixNQUFNLENBQUMsUUFBUSxDQUFDO1lBQ3BCLENBQUM7WUFDRCxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNULHNCQUFrQixZQUFDLEdBQUcsRUFBRTtZQUM1QixDQUFDO1FBQ0wsQ0FBQztLQUFBO0NBRUo7QUFoRUQsZ0RBZ0VDIiwiZmlsZSI6InNlcnZpY2VzL2lkZW50aXR5LmFwaS5zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZyc7XG5pbXBvcnQgeyBDT05TVCB9IGZyb20gXCIuLi9jb25zdGFudHNcIjtcblxuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgKiBhcyBzdXBlcmFnZW50IGZyb20gXCJzdXBlcmFnZW50XCI7XG5cbmltcG9ydCAqIGFzIGxvZyBmcm9tICd3aW5zdG9uJztcbmltcG9ydCB7IEJhc2VTZXJ2aWNlIH0gZnJvbSBcIi4vYmFzZS9iYXNlLnNlcnZpY2VcIjtcbmltcG9ydCB7IElUb2tlblBheWxvYWR9IGZyb20gJy4uL21vZGVscy9pbmRleCc7XG5jb25zdCBqd3QgPSByZXF1aXJlKCdqc29ud2VidG9rZW4nKTtcblxuZXhwb3J0IGNsYXNzIElkZW50aXR5QXBpU2VydmljZSBleHRlbmRzIEJhc2VTZXJ2aWNlIHtcblxuICAgIHByaXZhdGUgc3RhdGljIGN1cnJlbnRTeXN0ZW1Ub2tlbjogc3RyaW5nO1xuICAgIHByaXZhdGUgc3RhdGljIGN1cnJlbnRTeXN0ZW1Ub2tlbkV4cGlyZXNBdDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoZW5kcG9pbnQ6IHN0cmluZykge1xuICAgICAgICBzdXBlcihlbmRwb2ludCk7XG4gICAgICAgIHN1cGVyLmJhc2VVcmwgPSBDb25maWcuYWN0aXZlLmdldCgnaWRlbnRpdHlBcGlFbmRwb2ludCcpO1xuICAgICAgICBzdXBlci5hcGlOYW1lID0gJ0lkZW50aXR5LkFwaS5TZXJ2aWNlJztcbiAgICB9O1xuXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBnZXRTeXNUb2tlbigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICAvL0lmIHRoZSBzeXN0ZW1Ub2tlbiBpcyBudWxsLCBvciB0aGUgc3lzdGVtIHRva2VuIGlzIGNsb3NlIHRvIGV4cGlyaW5nLCBnbyBnZXQgYSBuZXcgc3lzdGVtIHRva2VuLlxuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFN5c3RlbVRva2VuIHx8XG4gICAgICAgICAgICBtb21lbnQoKS5pc0FmdGVyKG1vbWVudCh0aGlzLmN1cnJlbnRTeXN0ZW1Ub2tlbkV4cGlyZXNBdCwgQ09OU1QuTU9NRU5UX0RBVEVfRk9STUFUKS5zdWJ0cmFjdCgxLCAnaCcpKSkge1xuXG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IGF3YWl0IG5ldyBJZGVudGl0eUFwaVNlcnZpY2UoQ09OU1QuZXAuQVVUSEVOVElDQVRFKS5hdXRoZW50aWNhdGVVc2VyKFwic3lzdGVtQGFsZW1iaWMuY29tXCIsIENvbmZpZy5hY3RpdmUuZ2V0KCdzeXN0ZW1Vc2VyUGFzc3dvcmQnKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFdlJ3JlIGp1c3QgZ29pbmcgdG8gZGVjb2RlIHRoZSB0b2tlbi4gIERPTidUIGp1c3QgdHJ1c3QgdG9rZW5zIGZyb20gYW55b25lLiAgVGhpcyBpc24ndCBmcm9tIGEgdXNlciwgaXQncyBmcm9tIG91ciBcbiAgICAgICAgICAgIC8vIGlkZW50aXR5IHNlcnZpY2UuXG4gICAgICAgICAgICBsZXQgZGVjb2RlZDogSVRva2VuUGF5bG9hZCA9IGp3dC5kZWNvZGUodG9rZW4pO1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTeXN0ZW1Ub2tlbiA9IHRva2VuO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3lzdGVtVG9rZW5FeHBpcmVzQXQgPSBkZWNvZGVkLmV4cGlyZXNBdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U3lzdGVtVG9rZW47XG4gICAgfVxuICAgIFxuICAgIC8vIFRoaXMgd2lsbCBhdXRoZW50aWNhdGUgYSB1c2VyLCBhbmQgcmV0dXJuIHRoZWlyIGF1dGggdG9rZW4gZnJvbSB0aGUgaWRlbnRpdHkgYXBpLlxuICAgIC8vIG1vc3RseSB1c2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzLiAgZG9uJ3QgYXV0aGVudGljYXRlIGEgdXNlciBmcm9tIHRoaXMgbWljcm9zZXJ2aWNlLlxuICAgIHB1YmxpYyBhc3luYyBhdXRoZW50aWNhdGVVc2VyKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGFkZCBhIHgtYWNjZXNzLXRva2VuIGhlcmUgYmVjYXVzZSB0aGUgcmVnaXN0ZXIgZW5kcG9pbnQgaXMgb3Blbi5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZy5pbmZvKCdBdXRoZW50aWNhdGluZyBhIHVzZXI6JyArIGVtYWlsKTtcbiAgICAgICAgICAgIGxldCByZXNwb25zZTogc3VwZXJhZ2VudC5SZXNwb25zZSA9IGF3YWl0IHN1cGVyYWdlbnRcbiAgICAgICAgICAgICAgICAucG9zdChgJHt0aGlzLmJhc2VVcmx9JHtDT05TVC5lcC5BVVRIRU5USUNBVEV9YClcbiAgICAgICAgICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuYm9keS50b2tlbjtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ySGFuZGxlcihlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhpcyB3aWxsIHJlZ2lzdGVyIGEgdXNlci5cbiAgICBwdWJsaWMgYXN5bmMgcmVnaXN0ZXJVc2VyKGJvZHk6IGFueSk6IFByb21pc2U8c3VwZXJhZ2VudC5SZXNwb25zZT4ge1xuICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGFkZCBhIHgtYWNjZXNzLXRva2VuIGhlcmUgYmVjYXVzZSB0aGUgcmVnaXN0ZXIgZW5kcG9pbnQgaXMgb3Blbi5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZWdpc3RlcmluZyB1c2VyICcgKyBgJHt0aGlzLmJhc2VVcmx9JHtDT05TVC5lcC5SRUdJU1RFUn1gKVxuICAgICAgICAgICAgbGV0IHJlc3BvbnNlOiBzdXBlcmFnZW50LlJlc3BvbnNlID0gYXdhaXQgc3VwZXJhZ2VudFxuICAgICAgICAgICAgICAgIC5wb3N0KGAke3RoaXMuYmFzZVVybH0ke0NPTlNULmVwLlJFR0lTVEVSfWApXG4gICAgICAgICAgICAgICAgLnNlbmQoYm9keSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzdXBlci5lcnJvckhhbmRsZXIoZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxufSJdfQ==
