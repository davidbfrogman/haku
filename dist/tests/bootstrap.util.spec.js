"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_entry_1 = require("../server-entry");
const authentication_util_1 = require("./authentication.util");
const cleanup_util_spec_1 = require("./cleanup.util.spec");
const mocha_typescript_1 = require("mocha-typescript");
const database_bootstrap_1 = require("../config/database/database-bootstrap");
const supertest = require("supertest");
const chai = require("chai");
const api = supertest.agent(server_entry_1.App.server);
const mongoose = require("mongoose");
//mongoose.set('debug', true);
const expect = chai.expect;
const should = chai.should();
let BootstrapTest = class BootstrapTest {
    // First we need to get some users to work with from the identity service
    static before(done) {
        console.log('Testing bootstrap');
        // This code should only be called if this test is run as a single test.  When run in the suite along with
        // product this code is run by the product test.
        server_entry_1.App.server.on('dbConnected', () => __awaiter(this, void 0, void 0, function* () {
            console.log('Got the dbConnected Signal, so now we can clear, and seed the database.');
            yield cleanup_util_spec_1.Cleanup.clearDatabase();
            console.log('About to seed the database');
            yield database_bootstrap_1.DatabaseBootstrap.seed();
            console.log('About to create identity test data.');
            // This will create, 2 users, an organization, and add the users to the correct roles.
            yield authentication_util_1.AuthUtil.registerUser("dave2");
            yield authentication_util_1.AuthUtil.Initialize();
            done();
        }));
    }
    static after() {
        return __awaiter(this, void 0, void 0, function* () {
            yield cleanup_util_spec_1.Cleanup.clearDatabase();
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            expect(1).to.be.equal(1);
            return;
        });
    }
};
__decorate([
    mocha_typescript_1.test('Just setting up a test for testing initialization')
], BootstrapTest.prototype, "initialize", null);
BootstrapTest = __decorate([
    mocha_typescript_1.suite('Bootstrap Suite -> ')
], BootstrapTest);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3Rlc3RzL2Jvb3RzdHJhcC51dGlsLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLGtEQUE4QztBQUk5QywrREFBZ0Q7QUFDaEQsMkRBQThDO0FBQzlDLHVEQUErQztBQUMvQyw4RUFBMEU7QUFFMUUsdUNBQXVDO0FBQ3ZDLDZCQUE2QjtBQUU3QixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLGtCQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLDhCQUE4QjtBQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzNCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUc3QixJQUFNLGFBQWEsR0FBbkI7SUFFSSx5RUFBeUU7SUFDbEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1FBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNqQywwR0FBMEc7UUFDMUcsZ0RBQWdEO1FBQ2hELGtCQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsR0FBUyxFQUFFO1lBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMseUVBQXlFLENBQUUsQ0FBQTtZQUN2RixNQUFNLDJCQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sc0NBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1lBQ25ELHNGQUFzRjtZQUN0RixNQUFNLDhCQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sOEJBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM1QixJQUFJLEVBQUUsQ0FBQztRQUNYLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sTUFBTSxDQUFPLEtBQUs7O1lBQ3JCLE1BQU0sMkJBQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNsQyxDQUFDO0tBQUE7SUFHWSxVQUFVOztZQUNuQixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDO1FBQ1gsQ0FBQztLQUFBO0NBQ0osQ0FBQTtBQUpHO0lBREMsdUJBQUksQ0FBQyxtREFBbUQsQ0FBQzsrQ0FJekQ7QUE3QkMsYUFBYTtJQURsQix3QkFBSyxDQUFDLHFCQUFxQixDQUFDO0dBQ3ZCLGFBQWEsQ0E4QmxCIiwiZmlsZSI6InRlc3RzL2Jvb3RzdHJhcC51dGlsLnNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhYmFzZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS9kYXRhYmFzZSc7XG5pbXBvcnQgeyBBcHAsIHNlcnZlciB9IGZyb20gJy4uL3NlcnZlci1lbnRyeSc7XG5pbXBvcnQgeyBJVG9rZW5QYXlsb2FkIH0gZnJvbSAnLi4vbW9kZWxzJztcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcnO1xuaW1wb3J0IHsgQ09OU1QgfSBmcm9tIFwiLi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBBdXRoVXRpbH0gZnJvbSBcIi4vYXV0aGVudGljYXRpb24udXRpbFwiO1xuaW1wb3J0IHsgQ2xlYW51cCB9IGZyb20gXCIuL2NsZWFudXAudXRpbC5zcGVjXCI7XG5pbXBvcnQgeyBzdWl0ZSwgdGVzdCB9IGZyb20gXCJtb2NoYS10eXBlc2NyaXB0XCI7XG5pbXBvcnQgeyBEYXRhYmFzZUJvb3RzdHJhcCB9IGZyb20gXCIuLi9jb25maWcvZGF0YWJhc2UvZGF0YWJhc2UtYm9vdHN0cmFwXCI7XG5cbmltcG9ydCAqIGFzIHN1cGVydGVzdCBmcm9tICdzdXBlcnRlc3QnO1xuaW1wb3J0ICogYXMgY2hhaSBmcm9tICdjaGFpJztcblxuY29uc3QgYXBpID0gc3VwZXJ0ZXN0LmFnZW50KEFwcC5zZXJ2ZXIpO1xuY29uc3QgbW9uZ29vc2UgPSByZXF1aXJlKFwibW9uZ29vc2VcIik7XG4vL21vbmdvb3NlLnNldCgnZGVidWcnLCB0cnVlKTtcbmNvbnN0IGV4cGVjdCA9IGNoYWkuZXhwZWN0O1xuY29uc3Qgc2hvdWxkID0gY2hhaS5zaG91bGQoKTtcblxuQHN1aXRlKCdCb290c3RyYXAgU3VpdGUgLT4gJylcbmNsYXNzIEJvb3RzdHJhcFRlc3Qge1xuXG4gICAgLy8gRmlyc3Qgd2UgbmVlZCB0byBnZXQgc29tZSB1c2VycyB0byB3b3JrIHdpdGggZnJvbSB0aGUgaWRlbnRpdHkgc2VydmljZVxuICAgIHB1YmxpYyBzdGF0aWMgYmVmb3JlKGRvbmUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Rlc3RpbmcgYm9vdHN0cmFwJyk7XG4gICAgICAgIC8vIFRoaXMgY29kZSBzaG91bGQgb25seSBiZSBjYWxsZWQgaWYgdGhpcyB0ZXN0IGlzIHJ1biBhcyBhIHNpbmdsZSB0ZXN0LiAgV2hlbiBydW4gaW4gdGhlIHN1aXRlIGFsb25nIHdpdGhcbiAgICAgICAgLy8gcHJvZHVjdCB0aGlzIGNvZGUgaXMgcnVuIGJ5IHRoZSBwcm9kdWN0IHRlc3QuXG4gICAgICAgIEFwcC5zZXJ2ZXIub24oJ2RiQ29ubmVjdGVkJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0dvdCB0aGUgZGJDb25uZWN0ZWQgU2lnbmFsLCBzbyBub3cgd2UgY2FuIGNsZWFyLCBhbmQgc2VlZCB0aGUgZGF0YWJhc2UuJyApXG4gICAgICAgICAgICBhd2FpdCBDbGVhbnVwLmNsZWFyRGF0YWJhc2UoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBYm91dCB0byBzZWVkIHRoZSBkYXRhYmFzZScpO1xuICAgICAgICAgICAgYXdhaXQgRGF0YWJhc2VCb290c3RyYXAuc2VlZCgpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQWJvdXQgdG8gY3JlYXRlIGlkZW50aXR5IHRlc3QgZGF0YS4nKTtcbiAgICAgICAgICAgIC8vIFRoaXMgd2lsbCBjcmVhdGUsIDIgdXNlcnMsIGFuIG9yZ2FuaXphdGlvbiwgYW5kIGFkZCB0aGUgdXNlcnMgdG8gdGhlIGNvcnJlY3Qgcm9sZXMuXG4gICAgICAgICAgICBhd2FpdCBBdXRoVXRpbC5yZWdpc3RlclVzZXIoXCJkYXZlMlwiKTtcbiAgICAgICAgICAgIGF3YWl0IEF1dGhVdGlsLkluaXRpYWxpemUoKTtcbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBhZnRlcigpIHtcbiAgICAgICAgYXdhaXQgQ2xlYW51cC5jbGVhckRhdGFiYXNlKCk7XG4gICAgfVxuXG4gICAgQHRlc3QoJ0p1c3Qgc2V0dGluZyB1cCBhIHRlc3QgZm9yIHRlc3RpbmcgaW5pdGlhbGl6YXRpb24nKVxuICAgIHB1YmxpYyBhc3luYyBpbml0aWFsaXplKCkge1xuICAgICAgICBleHBlY3QoMSkudG8uYmUuZXF1YWwoMSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59XG4iXX0=
