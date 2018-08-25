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
const _1 = require("../controllers/");
const base_router_1 = require("./base/base.router");
const constants_1 = require("../constants");
class UserRouter extends base_router_1.BaseRouter {
    constructor() {
        super();
        this.router = express_1.Router();
        this.controller = new _1.UserController();
        this.resource = constants_1.CONST.ep.USERS;
    }
    getRouter() {
        return super.getRouter()
            .patch(`${this.resource}/:id${constants_1.CONST.ep.INLINE_PASSWORD_CHANGE}`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield this.controller.updatePassword(request, response, next);
        }));
    }
}
exports.UserRouter = UserRouter;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL3JvdXRlcnMvdXNlci5yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFDQUFpQztBQUNqQyxzQ0FBaUQ7QUFHakQsb0RBQWdEO0FBQ2hELDRDQUFxQztBQUVyQyxnQkFBd0IsU0FBUSx3QkFBVTtJQUt0QztRQUNJLEtBQUssRUFBRSxDQUFDO1FBTEwsV0FBTSxHQUFXLGdCQUFNLEVBQUUsQ0FBQztRQUMxQixlQUFVLEdBQUcsSUFBSSxpQkFBYyxFQUFFLENBQUM7UUFLckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7SUFDbkMsQ0FBQztJQUVNLFNBQVM7UUFDWixNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTthQUN2QixLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxPQUFPLGlCQUFLLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ2hJLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUEsQ0FBQyxDQUFBO0lBQ04sQ0FBQztDQUNKO0FBaEJELGdDQWdCQyIsImZpbGUiOiJyb3V0ZXJzL3VzZXIucm91dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBVc2VyQ29udHJvbGxlciB9IGZyb20gJy4uL2NvbnRyb2xsZXJzLyc7XG5pbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSwgUmVxdWVzdEhhbmRsZXIsIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBSZXF1ZXN0SGFuZGxlclBhcmFtcywgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcy1zZXJ2ZS1zdGF0aWMtY29yZSc7XG5pbXBvcnQgeyBCYXNlUm91dGVyIH0gZnJvbSAnLi9iYXNlL2Jhc2Uucm91dGVyJztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuZXhwb3J0IGNsYXNzIFVzZXJSb3V0ZXIgZXh0ZW5kcyBCYXNlUm91dGVyIHtcbiAgICBwdWJsaWMgcm91dGVyOiBSb3V0ZXIgPSBSb3V0ZXIoKTtcbiAgICBwdWJsaWMgY29udHJvbGxlciA9IG5ldyBVc2VyQ29udHJvbGxlcigpO1xuICAgIHB1YmxpYyByZXNvdXJjZTogc3RyaW5nO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMucmVzb3VyY2UgPSBDT05TVC5lcC5VU0VSUztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Um91dGVyKCk6IFJvdXRlcntcbiAgICAgICAgcmV0dXJuIHN1cGVyLmdldFJvdXRlcigpXG4gICAgICAgIC5wYXRjaChgJHt0aGlzLnJlc291cmNlfS86aWQke0NPTlNULmVwLklOTElORV9QQVNTV09SRF9DSEFOR0V9YCwgYXN5bmMgKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNvbnRyb2xsZXIudXBkYXRlUGFzc3dvcmQocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQpO1xuICAgICAgICB9KVxuICAgIH1cbn0iXX0=
