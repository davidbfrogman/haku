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
const index_1 = require("../models/index");
const index_2 = require("./index");
class UserRepository extends index_2.BaseRepository {
    constructor() {
        super();
        this.mongooseModelInstance = index_1.User;
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.mongooseModelInstance.findOne({ email: email });
        });
    }
    getUserForPasswordCheck(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.mongooseModelInstance.findOne({ email: email })
                .select('+password');
        });
    }
    updatePassword(id, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.mongooseModelInstance.findById(id).select('+password');
            user.password = hashedPassword;
            return yield user.save();
        });
    }
}
exports.UserRepository = UserRepository;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL3JlcG9zaXRvcmllcy91c2VyLnJlcG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDJDQUFpRDtBQUVqRCxtQ0FBeUM7QUFFekMsb0JBQTRCLFNBQVEsc0JBQXdCO0lBR3hEO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFIRiwwQkFBcUIsR0FBb0IsWUFBSSxDQUFDO0lBSXhELENBQUM7SUFFWSxlQUFlLENBQUMsS0FBYTs7WUFDdEMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7S0FBQTtJQUVZLHVCQUF1QixDQUFDLEtBQWE7O1lBQzlDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7aUJBQzVELE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3QixDQUFDO0tBQUE7SUFFWSxjQUFjLENBQUMsRUFBVSxFQUFFLGNBQXNCOztZQUMxRCxJQUFJLElBQUksR0FBYSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZGLElBQUksQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3QixDQUFDO0tBQUE7Q0FDSjtBQXJCRCx3Q0FxQkMiLCJmaWxlIjoicmVwb3NpdG9yaWVzL3VzZXIucmVwby5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFVzZXIsIElVc2VyRG9jIH0gZnJvbSBcIi4uL21vZGVscy9pbmRleFwiO1xuaW1wb3J0IHsgTW9kZWwgfSBmcm9tIFwibW9uZ29vc2VcIjtcbmltcG9ydCB7IEJhc2VSZXBvc2l0b3J5IH0gZnJvbSBcIi4vaW5kZXhcIjtcblxuZXhwb3J0IGNsYXNzIFVzZXJSZXBvc2l0b3J5IGV4dGVuZHMgQmFzZVJlcG9zaXRvcnk8SVVzZXJEb2M+e1xuICAgIHByb3RlY3RlZCBtb25nb29zZU1vZGVsSW5zdGFuY2U6IE1vZGVsPElVc2VyRG9jPiA9IFVzZXI7XG4gICAgXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBmaW5kVXNlckJ5RW1haWwoZW1haWw6IHN0cmluZyk6IFByb21pc2U8SVVzZXJEb2M+e1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5tb25nb29zZU1vZGVsSW5zdGFuY2UuZmluZE9uZSh7ZW1haWw6IGVtYWlsfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGdldFVzZXJGb3JQYXNzd29yZENoZWNrKGVtYWlsOiBzdHJpbmcpOiBQcm9taXNlPElVc2VyRG9jPiB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLm1vbmdvb3NlTW9kZWxJbnN0YW5jZS5maW5kT25lKHsgZW1haWw6IGVtYWlsIH0pXG4gICAgICAgICAgICAuc2VsZWN0KCcrcGFzc3dvcmQnKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdXBkYXRlUGFzc3dvcmQoaWQ6IHN0cmluZywgaGFzaGVkUGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8SVVzZXJEb2M+IHtcbiAgICAgICAgbGV0IHVzZXI6IElVc2VyRG9jID0gYXdhaXQgdGhpcy5tb25nb29zZU1vZGVsSW5zdGFuY2UuZmluZEJ5SWQoaWQpLnNlbGVjdCgnK3Bhc3N3b3JkJyk7XG4gICAgICAgIHVzZXIucGFzc3dvcmQgPSBoYXNoZWRQYXNzd29yZDtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHVzZXIuc2F2ZSgpO1xuICAgIH1cbn0iXX0=
