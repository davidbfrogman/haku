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
const express_1 = require("express");
const base_router_1 = require("./base/base.router");
const constants_1 = require("../constants");
const authentication_controller_1 = require("../controllers/authentication.controller");
class AuthenticationRouter extends base_router_1.BaseRouter {
    constructor() {
        super();
        this.router = express_1.Router();
        this.controller = new authentication_controller_1.AuthenticationController();
        this.resource = constants_1.CONST.ep.AUTHENTICATE;
    }
    getRestrictedRouter() {
        return this.router
            .post(`${this.resource}${constants_1.CONST.ep.LOCAL}${constants_1.CONST.ep.LOGIN}`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield this.controller.authenticateLocal(request, response, next);
        }))
            .post(`${this.resource}${constants_1.CONST.ep.LOCAL}${constants_1.CONST.ep.REGISTER}`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield this.controller.register(request, response, next);
        }));
    }
}
exports.AuthenticationRouter = AuthenticationRouter;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3JvdXRlcnMvYXV0aGVudGljYXRpb24ucm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxxQ0FBaUM7QUFHakMsb0RBQWdEO0FBQ2hELDRDQUFxQztBQUNyQyx3RkFBb0Y7QUFTcEYsMEJBQWtDLFNBQVEsd0JBQVU7SUFNaEQ7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUxMLFdBQU0sR0FBVyxnQkFBTSxFQUFFLENBQUM7UUFDMUIsZUFBVSxHQUFHLElBQUksb0RBQXdCLEVBQUUsQ0FBQztRQUM1QyxhQUFRLEdBQVcsaUJBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDO0lBSWhELENBQUM7SUFFTSxtQkFBbUI7UUFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNO2FBR2IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQ3RELENBQU8sT0FBZ0IsRUFBRSxRQUFrQixFQUFFLElBQWtCLEVBQUUsRUFBRTtZQUMvRCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRSxDQUFDLENBQUEsQ0FBQzthQUVMLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLGlCQUFLLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQU8sT0FBZ0IsRUFBRSxRQUFrQixFQUFFLElBQWtCLEVBQUUsRUFBRTtZQUM5SCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNYLENBQUM7Q0FDSjtBQXZCRCxvREF1QkMiLCJmaWxlIjoicm91dGVycy9hdXRoZW50aWNhdGlvbi5yb3V0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IFJlcXVlc3QsIFJlc3BvbnNlLCBSZXF1ZXN0SGFuZGxlciwgfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IFJlcXVlc3RIYW5kbGVyUGFyYW1zLCBOZXh0RnVuY3Rpb24gfSBmcm9tICdleHByZXNzLXNlcnZlLXN0YXRpYy1jb3JlJztcbmltcG9ydCB7IEJhc2VSb3V0ZXIgfSBmcm9tICcuL2Jhc2UvYmFzZS5yb3V0ZXInO1xuaW1wb3J0IHsgQ09OU1QgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgQXV0aGVudGljYXRpb25Db250cm9sbGVyIH0gZnJvbSAnLi4vY29udHJvbGxlcnMvYXV0aGVudGljYXRpb24uY29udHJvbGxlcic7XG5pbXBvcnQgKiBhcyBwYXNzcG9ydCBmcm9tICdwYXNzcG9ydCc7XG5pbXBvcnQgKiBhcyBJbnN0YWdyYW1TdHJhdGVneSBmcm9tICdwYXNzcG9ydC1pbnN0YWdyYW0nO1xuaW1wb3J0ICogYXMgRmFjZWJvb2tTdHJhdGVneSBmcm9tICdwYXNzcG9ydC1mYWNlYm9vayc7XG5pbXBvcnQgKiBhcyBGYWNlYm9va1Rva2VuU3RyYXRlZ3kgZnJvbSAncGFzc3BvcnQtZmFjZWJvb2stdG9rZW4nO1xuaW1wb3J0IHsgQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZyc7XG5pbXBvcnQgeyBJVXNlciB9IGZyb20gJy4uL21vZGVscyc7XG5pbXBvcnQgeyBMb2dpblN0cmF0ZWd5IH0gZnJvbSAnLi4vZW51bWVyYXRpb25zJztcblxuZXhwb3J0IGNsYXNzIEF1dGhlbnRpY2F0aW9uUm91dGVyIGV4dGVuZHMgQmFzZVJvdXRlciB7XG5cbiAgICBwdWJsaWMgcm91dGVyOiBSb3V0ZXIgPSBSb3V0ZXIoKTtcbiAgICBwdWJsaWMgY29udHJvbGxlciA9IG5ldyBBdXRoZW50aWNhdGlvbkNvbnRyb2xsZXIoKTtcbiAgICBwdWJsaWMgcmVzb3VyY2U6IHN0cmluZyA9IENPTlNULmVwLkFVVEhFTlRJQ0FURTtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UmVzdHJpY3RlZFJvdXRlcigpOiBSb3V0ZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3V0ZXJcblxuICAgICAgICAgICAgLy8gVGhpcyBpcyBmb3IgdGhlIGxvY2FsIGxvZ2luIHNjaGVtZXMuXG4gICAgICAgICAgICAucG9zdChgJHt0aGlzLnJlc291cmNlfSR7Q09OU1QuZXAuTE9DQUx9JHtDT05TVC5lcC5MT0dJTn1gLFxuICAgICAgICAgICAgICAgIGFzeW5jIChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNvbnRyb2xsZXIuYXV0aGVudGljYXRlTG9jYWwocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvLyBUaGlzIGlzIGZvciByZWdpc3RlcmluZyBhIG5ldyB1c2VyIHdpdGggYSBsb2NhbCBzY2hlbWUuXG4gICAgICAgICAgICAucG9zdChgJHt0aGlzLnJlc291cmNlfSR7Q09OU1QuZXAuTE9DQUx9JHtDT05TVC5lcC5SRUdJU1RFUn1gLCBhc3luYyAocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNvbnRyb2xsZXIucmVnaXN0ZXIocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufSJdfQ==
