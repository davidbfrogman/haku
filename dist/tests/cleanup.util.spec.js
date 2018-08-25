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
                yield models_1.User.remove({});
                log.info('Database all clear');
            }
            else {
                throw ('The clear database method is trying to be run against a database that isnt integration');
            }
        });
    }
}
exports.Cleanup = Cleanup;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3Rlc3RzL2NsZWFudXAudXRpbC5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxpREFBaUQ7QUFDakQsMERBQXVEO0FBRXZELHNDQUFpQztBQUlqQywrQkFBK0I7QUFHL0IsNkJBQTZCO0FBRTdCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDekIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFHL0I7SUFFVyxNQUFNLENBQU8sYUFBYTs7WUFDN0IsMkJBQTJCO1lBQzNCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLGFBQWE7bUJBQ25DLG1CQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQ25ELENBQUMsQ0FBQyxDQUFDO2dCQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFDbkMsTUFBTSxhQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN0QixHQUFHLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNGLE1BQU0sQ0FBQyx3RkFBd0YsQ0FBQyxDQUFDO1lBQ3JHLENBQUM7UUFDTCxDQUFDO0tBQUE7Q0FDSjtBQWZELDBCQWVDIiwiZmlsZSI6InRlc3RzL2NsZWFudXAudXRpbC5zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9EdXJpbmcgdGhlIHRlc3QgdGhlIGVudiB2YXJpYWJsZSBpcyBzZXQgdG8gdGVzdFxuaW1wb3J0IHsgRGF0YWJhc2UgfSBmcm9tICcuLi9jb25maWcvZGF0YWJhc2UvZGF0YWJhc2UnO1xuaW1wb3J0IHsgQXBwLCBzZXJ2ZXIgfSBmcm9tICcuLi9zZXJ2ZXItZW50cnknO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uL21vZGVscyc7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tICcuLi9jb25maWcvY29uZmlnJztcbmltcG9ydCB7IEhlYWx0aFN0YXR1cyB9IGZyb20gJy4uL2hlYWx0aC1zdGF0dXMnO1xuaW1wb3J0IG1vbmdvb3NlID0gcmVxdWlyZSgnbW9uZ29vc2UnKTtcbmltcG9ydCAqIGFzIGxvZyBmcm9tICd3aW5zdG9uJztcblxuXG5pbXBvcnQgKiBhcyBjaGFpIGZyb20gJ2NoYWknO1xuaW1wb3J0IHsgQ09OU1QgfSBmcm9tIFwiLi4vY29uc3RhbnRzXCI7XG5sZXQgZXhwZWN0ID0gY2hhaS5leHBlY3Q7XG5sZXQgc2hvdWxkID0gY2hhaS5zaG91bGQoKTtcbmNoYWkudXNlKHJlcXVpcmUoJ2NoYWktaHR0cCcpKTtcbmltcG9ydCB7IHN1aXRlLCB0ZXN0LCBjb250ZXh0LCB9IGZyb20gXCJtb2NoYS10eXBlc2NyaXB0XCI7XG5cbmV4cG9ydCBjbGFzcyBDbGVhbnVwIHtcbiAgICBcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGNsZWFyRGF0YWJhc2UoKSB7XG4gICAgICAgIC8vYXdhaXQgRGF0YWJhc2UuY29ubmVjdCgpO1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdpbnRlZ3JhdGlvbidcbiAgICAgICAgICAgICYmIERhdGFiYXNlLmRhdGFiYXNlTmFtZS5pbmNsdWRlcygnaW50ZWdyYXRpb24nKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGxvZy5pbmZvKCdDbGVhcmluZyB0aGUgZGF0YWJhc2UuJyk7XG4gICAgICAgICAgICBhd2FpdCBVc2VyLnJlbW92ZSh7fSk7XG4gICAgICAgICAgICBsb2cuaW5mbygnRGF0YWJhc2UgYWxsIGNsZWFyJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyAoJ1RoZSBjbGVhciBkYXRhYmFzZSBtZXRob2QgaXMgdHJ5aW5nIHRvIGJlIHJ1biBhZ2FpbnN0IGEgZGF0YWJhc2UgdGhhdCBpc250IGludGVncmF0aW9uJyk7XG4gICAgICAgIH1cbiAgICB9XG59Il19
