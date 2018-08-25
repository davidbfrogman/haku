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
const server_entry_1 = require("../../server-entry");
const constants_1 = require("../../constants");
const cleanup_util_spec_1 = require("../cleanup.util.spec");
const mocha_typescript_1 = require("mocha-typescript");
const supertest = require("supertest");
const chai = require("chai");
const api = supertest.agent(server_entry_1.App.server);
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();
let AuthenticationTest = class AuthenticationTest {
    // First we need to get some users to work with from the identity service
    static before(done) {
        console.log('Testing Authentication');
        // This code should only be called if this test is run as a single test.  When run in the suite along with
        // bootstrap.util.spec this code is run by the bootstrap spec.
        // App.server.on('dbConnected', async () => {
        //     await Cleanup.clearDatabase();
        //     await DatabaseBootstrap.seed();
        //     // This will create, 2 users, an organization, and add the users to the correct roles.
        //     await AuthUtil.createIdentityApiTestData();
        //     done();
        // });
        //This done should be commented if you're going to run this as suite.only()
        done();
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
    register() {
        return __awaiter(this, void 0, void 0, function* () {
            let user = {
                email: 'asdfaou0987@lyra.com',
                password: 'test1234',
                isActive: true,
                roles: [constants_1.CONST.USER_ROLE],
                isEmailVerified: true,
                firstName: "Dave",
                lastName: "Brown",
                isTokenExpired: false
            };
            let registerResponse = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.AUTHENTICATE}${constants_1.CONST.ep.LOCAL}${constants_1.CONST.ep.REGISTER}`)
                .send(user);
            expect(registerResponse.status).to.equal(201);
            expect(registerResponse.body).to.be.an('object');
            expect(registerResponse.body.password).to.be.equal('');
            expect(registerResponse.body._id).length.to.be.greaterThan(0);
            return;
        });
    }
    authLocal() {
        return __awaiter(this, void 0, void 0, function* () {
            let creds = {
                email: 'asdfaou0987@lyra.com',
                password: 'test1234',
            };
            let authResponse = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.AUTHENTICATE}${constants_1.CONST.ep.LOCAL}${constants_1.CONST.ep.LOGIN}`)
                .send(creds);
            expect(authResponse.status).to.equal(200);
            expect(authResponse.body).to.be.an('object');
            expect(authResponse.body.token).length.to.be.greaterThan(0);
            return;
        });
    }
    wrongPasswordFail() {
        return __awaiter(this, void 0, void 0, function* () {
            let creds = {
                email: 'asdfaou0987@lyra.com',
                password: 'asdfasdfasdf',
            };
            let authResponse = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.AUTHENTICATE}${constants_1.CONST.ep.LOCAL}${constants_1.CONST.ep.LOGIN}`)
                .send(creds);
            expect(authResponse.status).to.equal(401);
            expect(authResponse.body).to.be.an('object');
            return;
        });
    }
};
__decorate([
    mocha_typescript_1.test('Just setting up a test for testing initialization')
], AuthenticationTest.prototype, "initialize", null);
__decorate([
    mocha_typescript_1.test('allow a user to register')
], AuthenticationTest.prototype, "register", null);
__decorate([
    mocha_typescript_1.test('allow a user to authenticate locally')
], AuthenticationTest.prototype, "authLocal", null);
__decorate([
    mocha_typescript_1.test('should fail if a user puts in the wrong password.')
], AuthenticationTest.prototype, "wrongPasswordFail", null);
AuthenticationTest = __decorate([
    mocha_typescript_1.suite('Authentication Tester -> ')
], AuthenticationTest);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3Rlc3RzL21vZGVscy9hdXRoZW50aWNhdGlvbi5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxxREFBaUQ7QUFHakQsK0NBQXdDO0FBRXhDLDREQUErQztBQUMvQyx1REFBK0M7QUFHL0MsdUNBQXVDO0FBQ3ZDLDZCQUE2QjtBQUU3QixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLGtCQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDM0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRzdCLElBQU0sa0JBQWtCLEdBQXhCO0lBRUkseUVBQXlFO0lBQ2xFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdEMsMEdBQTBHO1FBQzFHLDhEQUE4RDtRQUM5RCw2Q0FBNkM7UUFDN0MscUNBQXFDO1FBQ3JDLHNDQUFzQztRQUV0Qyw2RkFBNkY7UUFDN0Ysa0RBQWtEO1FBQ2xELGNBQWM7UUFDZCxNQUFNO1FBQ04sMkVBQTJFO1FBQzNFLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUVNLE1BQU0sQ0FBTyxLQUFLOztZQUNyQixNQUFNLDJCQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDbEMsQ0FBQztLQUFBO0lBR1ksVUFBVTs7WUFDbkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQztRQUNYLENBQUM7S0FBQTtJQUdZLFFBQVE7O1lBQ2pCLElBQUksSUFB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Qy9GLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVqQixNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUM7UUFDWCxDQUFDO0tBQUE7Q0FDSixDQUFBO0FBN0RHO0lBREMsdUJBQUksQ0FBQyxtREFBbUQsQ0FBQztvREFJekQ7QUFHRDtJQURDLHVCQUFJLENBQUMsMEJBQTBCLENBQUM7a0RBc0JoQztBQUdEO0lBREMsdUJBQUksQ0FBQyxzQ0FBc0MsQ0FBQzttREFlNUM7QUFHRDtJQURDLHVCQUFJLENBQUMsbURBQW1ELENBQUM7MkRBY3pEO0FBcEZDLGtCQUFrQjtJQUR2Qix3QkFBSyxDQUFDLDJCQUEyQixDQUFDO0dBQzdCLGtCQUFrQixDQXFGdkIiLCJmaWxlIjoidGVzdHMvbW9kZWxzL2F1dGhlbnRpY2F0aW9uLnNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhYmFzZSB9IGZyb20gJy4uLy4uL2NvbmZpZy9kYXRhYmFzZS9kYXRhYmFzZSc7XG5pbXBvcnQgeyBBcHAsIHNlcnZlciB9IGZyb20gJy4uLy4uL3NlcnZlci1lbnRyeSc7XG5pbXBvcnQgeyBCdWNrZXQsIElCdWNrZXQsIElUb2tlblBheWxvYWQsIElVc2VyIH0gZnJvbSAnLi4vLi4vbW9kZWxzJztcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25maWcnO1xuaW1wb3J0IHsgQ09OU1QgfSBmcm9tIFwiLi4vLi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBBdXRoVXRpbCB9IGZyb20gXCIuLi9hdXRoZW50aWNhdGlvbi51dGlsXCI7XG5pbXBvcnQgeyBDbGVhbnVwIH0gZnJvbSBcIi4uL2NsZWFudXAudXRpbC5zcGVjXCI7XG5pbXBvcnQgeyBzdWl0ZSwgdGVzdCB9IGZyb20gXCJtb2NoYS10eXBlc2NyaXB0XCI7XG5pbXBvcnQgeyBEYXRhYmFzZUJvb3RzdHJhcCB9IGZyb20gXCIuLi8uLi9jb25maWcvZGF0YWJhc2UvZGF0YWJhc2UtYm9vdHN0cmFwXCI7XG5cbmltcG9ydCAqIGFzIHN1cGVydGVzdCBmcm9tICdzdXBlcnRlc3QnO1xuaW1wb3J0ICogYXMgY2hhaSBmcm9tICdjaGFpJztcblxuY29uc3QgYXBpID0gc3VwZXJ0ZXN0LmFnZW50KEFwcC5zZXJ2ZXIpO1xuY29uc3QgbW9uZ29vc2UgPSByZXF1aXJlKFwibW9uZ29vc2VcIik7XG5jb25zdCBleHBlY3QgPSBjaGFpLmV4cGVjdDtcbmNvbnN0IHNob3VsZCA9IGNoYWkuc2hvdWxkKCk7XG5cbkBzdWl0ZSgnQXV0aGVudGljYXRpb24gVGVzdGVyIC0+ICcpXG5jbGFzcyBBdXRoZW50aWNhdGlvblRlc3Qge1xuXG4gICAgLy8gRmlyc3Qgd2UgbmVlZCB0byBnZXQgc29tZSB1c2VycyB0byB3b3JrIHdpdGggZnJvbSB0aGUgaWRlbnRpdHkgc2VydmljZVxuICAgIHB1YmxpYyBzdGF0aWMgYmVmb3JlKGRvbmUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Rlc3RpbmcgQXV0aGVudGljYXRpb24nKTtcbiAgICAgICAgLy8gVGhpcyBjb2RlIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBpZiB0aGlzIHRlc3QgaXMgcnVuIGFzIGEgc2luZ2xlIHRlc3QuICBXaGVuIHJ1biBpbiB0aGUgc3VpdGUgYWxvbmcgd2l0aFxuICAgICAgICAvLyBib290c3RyYXAudXRpbC5zcGVjIHRoaXMgY29kZSBpcyBydW4gYnkgdGhlIGJvb3RzdHJhcCBzcGVjLlxuICAgICAgICAvLyBBcHAuc2VydmVyLm9uKCdkYkNvbm5lY3RlZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gICAgIGF3YWl0IENsZWFudXAuY2xlYXJEYXRhYmFzZSgpO1xuICAgICAgICAvLyAgICAgYXdhaXQgRGF0YWJhc2VCb290c3RyYXAuc2VlZCgpO1xuXG4gICAgICAgIC8vICAgICAvLyBUaGlzIHdpbGwgY3JlYXRlLCAyIHVzZXJzLCBhbiBvcmdhbml6YXRpb24sIGFuZCBhZGQgdGhlIHVzZXJzIHRvIHRoZSBjb3JyZWN0IHJvbGVzLlxuICAgICAgICAvLyAgICAgYXdhaXQgQXV0aFV0aWwuY3JlYXRlSWRlbnRpdHlBcGlUZXN0RGF0YSgpO1xuICAgICAgICAvLyAgICAgZG9uZSgpO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy9UaGlzIGRvbmUgc2hvdWxkIGJlIGNvbW1lbnRlZCBpZiB5b3UncmUgZ29pbmcgdG8gcnVuIHRoaXMgYXMgc3VpdGUub25seSgpXG4gICAgICAgIGRvbmUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGFmdGVyKCkge1xuICAgICAgICBhd2FpdCBDbGVhbnVwLmNsZWFyRGF0YWJhc2UoKTtcbiAgICB9XG5cbiAgICBAdGVzdCgnSnVzdCBzZXR0aW5nIHVwIGEgdGVzdCBmb3IgdGVzdGluZyBpbml0aWFsaXphdGlvbicpXG4gICAgcHVibGljIGFzeW5jIGluaXRpYWxpemUoKSB7XG4gICAgICAgIGV4cGVjdCgxKS50by5iZS5lcXVhbCgxKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdhbGxvdyBhIHVzZXIgdG8gcmVnaXN0ZXInKVxuICAgIHB1YmxpYyBhc3luYyByZWdpc3RlcigpIHtcbiAgICAgICAgbGV0IHVzZXI6IElVc2VyID0ge1xuICAgICAgICAgICAgZW1haWw6ICdhc2RmYW91MDk4N0BseXJhLmNvbScsXG4gICAgICAgICAgICBwYXNzd29yZDogJ3Rlc3QxMjM0JyxcbiAgICAgICAgICAgIGlzQWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgcm9sZXM6IFtDT05TVC5VU0VSX1JPTEVdLFxuICAgICAgICAgICAgaXNFbWFpbFZlcmlmaWVkOiB0cnVlLFxuICAgICAgICAgICAgZmlyc3ROYW1lOiBcIkRhdmVcIixcbiAgICAgICAgICAgIGxhc3ROYW1lOiBcIkJyb3duXCIsXG4gICAgICAgICAgICBpc1Rva2VuRXhwaXJlZDogZmFsc2VcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByZWdpc3RlclJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkFVVEhFTlRJQ0FURX0ke0NPTlNULmVwLkxPQ0FMfSR7Q09OU1QuZXAuUkVHSVNURVJ9YClcbiAgICAgICAgICAgIC5zZW5kKHVzZXIpO1xuICAgICAgICBcbiAgICAgICAgZXhwZWN0KHJlZ2lzdGVyUmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDEpO1xuICAgICAgICBleHBlY3QocmVnaXN0ZXJSZXNwb25zZS5ib2R5KS50by5iZS5hbignb2JqZWN0Jyk7XG4gICAgICAgIGV4cGVjdChyZWdpc3RlclJlc3BvbnNlLmJvZHkucGFzc3dvcmQpLnRvLmJlLmVxdWFsKCcnKTtcbiAgICAgICAgZXhwZWN0KHJlZ2lzdGVyUmVzcG9uc2UuYm9keS5faWQpLmxlbmd0aC50by5iZS5ncmVhdGVyVGhhbigwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdhbGxvdyBhIHVzZXIgdG8gYXV0aGVudGljYXRlIGxvY2FsbHknKVxuICAgIHB1YmxpYyBhc3luYyBhdXRoTG9jYWwoKSB7XG4gICAgICAgIGxldCBjcmVkcyA9IHtcbiAgICAgICAgICAgIGVtYWlsOiAnYXNkZmFvdTA5ODdAbHlyYS5jb20nLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0MTIzNCcsXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYXV0aFJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkFVVEhFTlRJQ0FURX0ke0NPTlNULmVwLkxPQ0FMfSR7Q09OU1QuZXAuTE9HSU59YClcbiAgICAgICAgICAgIC5zZW5kKGNyZWRzKTtcblxuICAgICAgICBleHBlY3QoYXV0aFJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KGF1dGhSZXNwb25zZS5ib2R5KS50by5iZS5hbignb2JqZWN0Jyk7XG4gICAgICAgIGV4cGVjdChhdXRoUmVzcG9uc2UuYm9keS50b2tlbikubGVuZ3RoLnRvLmJlLmdyZWF0ZXJUaGFuKDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ3Nob3VsZCBmYWlsIGlmIGEgdXNlciBwdXRzIGluIHRoZSB3cm9uZyBwYXNzd29yZC4nKVxuICAgIHB1YmxpYyBhc3luYyB3cm9uZ1Bhc3N3b3JkRmFpbCgpIHtcbiAgICAgICAgbGV0IGNyZWRzID0ge1xuICAgICAgICAgICAgZW1haWw6ICdhc2RmYW91MDk4N0BseXJhLmNvbScsXG4gICAgICAgICAgICBwYXNzd29yZDogJ2FzZGZhc2RmYXNkZicsXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYXV0aFJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkFVVEhFTlRJQ0FURX0ke0NPTlNULmVwLkxPQ0FMfSR7Q09OU1QuZXAuTE9HSU59YClcbiAgICAgICAgICAgIC5zZW5kKGNyZWRzKTtcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdChhdXRoUmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCg0MDEpO1xuICAgICAgICBleHBlY3QoYXV0aFJlc3BvbnNlLmJvZHkpLnRvLmJlLmFuKCdvYmplY3QnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbn1cbiJdfQ==
