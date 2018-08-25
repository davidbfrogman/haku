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
//During the test the env variable is set to test
const database_1 = require("../config/database/database");
const models_1 = require("../models");
const log = require("winston");
const chai = require("chai");
let expect = chai.expect;
let should = chai.should();
chai.use(require('chai-http'));
class Cleanup {
    static clearDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            //await Database.connect();
            if (process.env.NODE_ENV === 'integration'
                && database_1.Database.databaseName.includes('integration')) {
                log.info('Clearing the database.');
                yield models_1.Notification.remove({});
                yield models_1.Bucket.remove({});
                yield models_1.BucketItem.remove({});
                yield models_1.User.remove({});
                yield models_1.EmailVerification.remove({});
                log.info('Database all clear');
            }
            else {
                throw ('The clear database method is trying to be run against a database that isnt integration');
            }
        });
    }
}
exports.Cleanup = Cleanup;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3Rlc3RzL2NsZWFudXAudXRpbC5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxpREFBaUQ7QUFDakQsMERBQXVEO0FBRXZELHNDQUFzRjtBQUl0RiwrQkFBK0I7QUFHL0IsNkJBQTZCO0FBRTdCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDekIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFHL0I7SUFFVyxNQUFNLENBQU8sYUFBYTs7WUFDN0IsMkJBQTJCO1lBQzNCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLGFBQWE7bUJBQ25DLG1CQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQ25ELENBQUMsQ0FBQyxDQUFDO2dCQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFDbkMsTUFBTSxxQkFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDOUIsTUFBTSxlQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLG1CQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLGFBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RCLE1BQU0sMEJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQyxHQUFHLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNGLE1BQU0sQ0FBQyx3RkFBd0YsQ0FBQyxDQUFDO1lBQ3JHLENBQUM7UUFDTCxDQUFDO0tBQUE7Q0FDSjtBQW5CRCwwQkFtQkMiLCJmaWxlIjoidGVzdHMvY2xlYW51cC51dGlsLnNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL0R1cmluZyB0aGUgdGVzdCB0aGUgZW52IHZhcmlhYmxlIGlzIHNldCB0byB0ZXN0XG5pbXBvcnQgeyBEYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS9kYXRhYmFzZSc7XG5pbXBvcnQgeyBBcHAsIHNlcnZlciB9IGZyb20gJy4uL3NlcnZlci1lbnRyeSc7XG5pbXBvcnQgeyBOb3RpZmljYXRpb24sIEJ1Y2tldCwgQnVja2V0SXRlbSwgVXNlciwgRW1haWxWZXJpZmljYXRpb24gfSBmcm9tICcuLi9tb2RlbHMnO1xuaW1wb3J0IHsgQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZyc7XG5pbXBvcnQgeyBIZWFsdGhTdGF0dXMgfSBmcm9tICcuLi9oZWFsdGgtc3RhdHVzJztcbmltcG9ydCBtb25nb29zZSA9IHJlcXVpcmUoJ21vbmdvb3NlJyk7XG5pbXBvcnQgKiBhcyBsb2cgZnJvbSAnd2luc3Rvbic7XG5cblxuaW1wb3J0ICogYXMgY2hhaSBmcm9tICdjaGFpJztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSBcIi4uL2NvbnN0YW50c1wiO1xubGV0IGV4cGVjdCA9IGNoYWkuZXhwZWN0O1xubGV0IHNob3VsZCA9IGNoYWkuc2hvdWxkKCk7XG5jaGFpLnVzZShyZXF1aXJlKCdjaGFpLWh0dHAnKSk7XG5pbXBvcnQgeyBzdWl0ZSwgdGVzdCwgY29udGV4dCwgfSBmcm9tIFwibW9jaGEtdHlwZXNjcmlwdFwiO1xuXG5leHBvcnQgY2xhc3MgQ2xlYW51cCB7XG4gICAgXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBjbGVhckRhdGFiYXNlKCkge1xuICAgICAgICAvL2F3YWl0IERhdGFiYXNlLmNvbm5lY3QoKTtcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnaW50ZWdyYXRpb24nXG4gICAgICAgICAgICAmJiBEYXRhYmFzZS5kYXRhYmFzZU5hbWUuaW5jbHVkZXMoJ2ludGVncmF0aW9uJylcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBsb2cuaW5mbygnQ2xlYXJpbmcgdGhlIGRhdGFiYXNlLicpO1xuICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9uLnJlbW92ZSh7fSk7XG4gICAgICAgICAgICBhd2FpdCBCdWNrZXQucmVtb3ZlKHt9KTtcbiAgICAgICAgICAgIGF3YWl0IEJ1Y2tldEl0ZW0ucmVtb3ZlKHt9KTtcbiAgICAgICAgICAgIGF3YWl0IFVzZXIucmVtb3ZlKHt9KTtcbiAgICAgICAgICAgIGF3YWl0IEVtYWlsVmVyaWZpY2F0aW9uLnJlbW92ZSh7fSk7XG4gICAgICAgICAgICBsb2cuaW5mbygnRGF0YWJhc2UgYWxsIGNsZWFyJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyAoJ1RoZSBjbGVhciBkYXRhYmFzZSBtZXRob2QgaXMgdHJ5aW5nIHRvIGJlIHJ1biBhZ2FpbnN0IGEgZGF0YWJhc2UgdGhhdCBpc250IGludGVncmF0aW9uJyk7XG4gICAgICAgIH1cbiAgICB9XG59Il19
