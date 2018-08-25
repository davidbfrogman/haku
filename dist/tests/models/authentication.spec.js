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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3Rlc3RzL21vZGVscy9hdXRoZW50aWNhdGlvbi5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxxREFBaUQ7QUFHakQsK0NBQXdDO0FBRXhDLDREQUErQztBQUMvQyx1REFBK0M7QUFHL0MsdUNBQXVDO0FBQ3ZDLDZCQUE2QjtBQUU3QixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLGtCQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDM0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRzdCLElBQU0sa0JBQWtCLEdBQXhCO0lBRUkseUVBQXlFO0lBQ2xFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdEMsMEdBQTBHO1FBQzFHLDhEQUE4RDtRQUM5RCw2Q0FBNkM7UUFDN0MscUNBQXFDO1FBQ3JDLHNDQUFzQztRQUV0Qyw2RkFBNkY7UUFDN0Ysa0RBQWtEO1FBQ2xELGNBQWM7UUFDZCxNQUFNO1FBQ04sMkVBQTJFO1FBQzNFLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUVNLE1BQU0sQ0FBTyxLQUFLOztZQUNyQixNQUFNLDJCQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDbEMsQ0FBQztLQUFBO0lBR1ksVUFBVTs7WUFDbkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQztRQUNYLENBQUM7S0FBQTtJQUdZLFFBQVE7O1lBQ2pCLElBQUksSUFB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Qy9GLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVqQixNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUM7UUFDWCxDQUFDO0tBQUE7Q0FDSixDQUFBO0FBN0RHO0lBREMsdUJBQUksQ0FBQyxtREFBbUQsQ0FBQztvREFJekQ7QUFHRDtJQURDLHVCQUFJLENBQUMsMEJBQTBCLENBQUM7a0RBc0JoQztBQUdEO0lBREMsdUJBQUksQ0FBQyxzQ0FBc0MsQ0FBQzttREFlNUM7QUFHRDtJQURDLHVCQUFJLENBQUMsbURBQW1ELENBQUM7MkRBY3pEO0FBcEZDLGtCQUFrQjtJQUR2Qix3QkFBSyxDQUFDLDJCQUEyQixDQUFDO0dBQzdCLGtCQUFrQixDQXFGdkIiLCJmaWxlIjoidGVzdHMvbW9kZWxzL2F1dGhlbnRpY2F0aW9uLnNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhYmFzZSB9IGZyb20gJy4uLy4uL2NvbmZpZy9kYXRhYmFzZS9kYXRhYmFzZSc7XG5pbXBvcnQgeyBBcHAsIHNlcnZlciB9IGZyb20gJy4uLy4uL3NlcnZlci1lbnRyeSc7XG5pbXBvcnQgeyBJVG9rZW5QYXlsb2FkLCBJVXNlciB9IGZyb20gJy4uLy4uL21vZGVscyc7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tICcuLi8uLi9jb25maWcvY29uZmlnJztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSBcIi4uLy4uL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgQXV0aFV0aWwgfSBmcm9tIFwiLi4vYXV0aGVudGljYXRpb24udXRpbFwiO1xuaW1wb3J0IHsgQ2xlYW51cCB9IGZyb20gXCIuLi9jbGVhbnVwLnV0aWwuc3BlY1wiO1xuaW1wb3J0IHsgc3VpdGUsIHRlc3QgfSBmcm9tIFwibW9jaGEtdHlwZXNjcmlwdFwiO1xuaW1wb3J0IHsgRGF0YWJhc2VCb290c3RyYXAgfSBmcm9tIFwiLi4vLi4vY29uZmlnL2RhdGFiYXNlL2RhdGFiYXNlLWJvb3RzdHJhcFwiO1xuXG5pbXBvcnQgKiBhcyBzdXBlcnRlc3QgZnJvbSAnc3VwZXJ0ZXN0JztcbmltcG9ydCAqIGFzIGNoYWkgZnJvbSAnY2hhaSc7XG5cbmNvbnN0IGFwaSA9IHN1cGVydGVzdC5hZ2VudChBcHAuc2VydmVyKTtcbmNvbnN0IG1vbmdvb3NlID0gcmVxdWlyZShcIm1vbmdvb3NlXCIpO1xuY29uc3QgZXhwZWN0ID0gY2hhaS5leHBlY3Q7XG5jb25zdCBzaG91bGQgPSBjaGFpLnNob3VsZCgpO1xuXG5Ac3VpdGUoJ0F1dGhlbnRpY2F0aW9uIFRlc3RlciAtPiAnKVxuY2xhc3MgQXV0aGVudGljYXRpb25UZXN0IHtcblxuICAgIC8vIEZpcnN0IHdlIG5lZWQgdG8gZ2V0IHNvbWUgdXNlcnMgdG8gd29yayB3aXRoIGZyb20gdGhlIGlkZW50aXR5IHNlcnZpY2VcbiAgICBwdWJsaWMgc3RhdGljIGJlZm9yZShkb25lKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdUZXN0aW5nIEF1dGhlbnRpY2F0aW9uJyk7XG4gICAgICAgIC8vIFRoaXMgY29kZSBzaG91bGQgb25seSBiZSBjYWxsZWQgaWYgdGhpcyB0ZXN0IGlzIHJ1biBhcyBhIHNpbmdsZSB0ZXN0LiAgV2hlbiBydW4gaW4gdGhlIHN1aXRlIGFsb25nIHdpdGhcbiAgICAgICAgLy8gYm9vdHN0cmFwLnV0aWwuc3BlYyB0aGlzIGNvZGUgaXMgcnVuIGJ5IHRoZSBib290c3RyYXAgc3BlYy5cbiAgICAgICAgLy8gQXBwLnNlcnZlci5vbignZGJDb25uZWN0ZWQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vICAgICBhd2FpdCBDbGVhbnVwLmNsZWFyRGF0YWJhc2UoKTtcbiAgICAgICAgLy8gICAgIGF3YWl0IERhdGFiYXNlQm9vdHN0cmFwLnNlZWQoKTtcblxuICAgICAgICAvLyAgICAgLy8gVGhpcyB3aWxsIGNyZWF0ZSwgMiB1c2VycywgYW4gb3JnYW5pemF0aW9uLCBhbmQgYWRkIHRoZSB1c2VycyB0byB0aGUgY29ycmVjdCByb2xlcy5cbiAgICAgICAgLy8gICAgIGF3YWl0IEF1dGhVdGlsLmNyZWF0ZUlkZW50aXR5QXBpVGVzdERhdGEoKTtcbiAgICAgICAgLy8gICAgIGRvbmUoKTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vVGhpcyBkb25lIHNob3VsZCBiZSBjb21tZW50ZWQgaWYgeW91J3JlIGdvaW5nIHRvIHJ1biB0aGlzIGFzIHN1aXRlLm9ubHkoKVxuICAgICAgICBkb25lKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBhZnRlcigpIHtcbiAgICAgICAgYXdhaXQgQ2xlYW51cC5jbGVhckRhdGFiYXNlKCk7XG4gICAgfVxuXG4gICAgQHRlc3QoJ0p1c3Qgc2V0dGluZyB1cCBhIHRlc3QgZm9yIHRlc3RpbmcgaW5pdGlhbGl6YXRpb24nKVxuICAgIHB1YmxpYyBhc3luYyBpbml0aWFsaXplKCkge1xuICAgICAgICBleHBlY3QoMSkudG8uYmUuZXF1YWwoMSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBAdGVzdCgnYWxsb3cgYSB1c2VyIHRvIHJlZ2lzdGVyJylcbiAgICBwdWJsaWMgYXN5bmMgcmVnaXN0ZXIoKSB7XG4gICAgICAgIGxldCB1c2VyOiBJVXNlciA9IHtcbiAgICAgICAgICAgIGVtYWlsOiAnYXNkZmFvdTA5ODdAbHlyYS5jb20nLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0MTIzNCcsXG4gICAgICAgICAgICBpc0FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIHJvbGVzOiBbQ09OU1QuVVNFUl9ST0xFXSxcbiAgICAgICAgICAgIGlzRW1haWxWZXJpZmllZDogdHJ1ZSxcbiAgICAgICAgICAgIGZpcnN0TmFtZTogXCJEYXZlXCIsXG4gICAgICAgICAgICBsYXN0TmFtZTogXCJCcm93blwiLFxuICAgICAgICAgICAgaXNUb2tlbkV4cGlyZWQ6IGZhbHNlXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVnaXN0ZXJSZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBvc3QoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5BVVRIRU5USUNBVEV9JHtDT05TVC5lcC5MT0NBTH0ke0NPTlNULmVwLlJFR0lTVEVSfWApXG4gICAgICAgICAgICAuc2VuZCh1c2VyKTtcbiAgICAgICAgXG4gICAgICAgIGV4cGVjdChyZWdpc3RlclJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAxKTtcbiAgICAgICAgZXhwZWN0KHJlZ2lzdGVyUmVzcG9uc2UuYm9keSkudG8uYmUuYW4oJ29iamVjdCcpO1xuICAgICAgICBleHBlY3QocmVnaXN0ZXJSZXNwb25zZS5ib2R5LnBhc3N3b3JkKS50by5iZS5lcXVhbCgnJyk7XG4gICAgICAgIGV4cGVjdChyZWdpc3RlclJlc3BvbnNlLmJvZHkuX2lkKS5sZW5ndGgudG8uYmUuZ3JlYXRlclRoYW4oMCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBAdGVzdCgnYWxsb3cgYSB1c2VyIHRvIGF1dGhlbnRpY2F0ZSBsb2NhbGx5JylcbiAgICBwdWJsaWMgYXN5bmMgYXV0aExvY2FsKCkge1xuICAgICAgICBsZXQgY3JlZHMgPSB7XG4gICAgICAgICAgICBlbWFpbDogJ2FzZGZhb3UwOTg3QGx5cmEuY29tJyxcbiAgICAgICAgICAgIHBhc3N3b3JkOiAndGVzdDEyMzQnLFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGF1dGhSZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBvc3QoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5BVVRIRU5USUNBVEV9JHtDT05TVC5lcC5MT0NBTH0ke0NPTlNULmVwLkxPR0lOfWApXG4gICAgICAgICAgICAuc2VuZChjcmVkcyk7XG5cbiAgICAgICAgZXhwZWN0KGF1dGhSZXNwb25zZS5zdGF0dXMpLnRvLmVxdWFsKDIwMCk7XG4gICAgICAgIGV4cGVjdChhdXRoUmVzcG9uc2UuYm9keSkudG8uYmUuYW4oJ29iamVjdCcpO1xuICAgICAgICBleHBlY3QoYXV0aFJlc3BvbnNlLmJvZHkudG9rZW4pLmxlbmd0aC50by5iZS5ncmVhdGVyVGhhbigwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdzaG91bGQgZmFpbCBpZiBhIHVzZXIgcHV0cyBpbiB0aGUgd3JvbmcgcGFzc3dvcmQuJylcbiAgICBwdWJsaWMgYXN5bmMgd3JvbmdQYXNzd29yZEZhaWwoKSB7XG4gICAgICAgIGxldCBjcmVkcyA9IHtcbiAgICAgICAgICAgIGVtYWlsOiAnYXNkZmFvdTA5ODdAbHlyYS5jb20nLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICdhc2RmYXNkZmFzZGYnLFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGF1dGhSZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBvc3QoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5BVVRIRU5USUNBVEV9JHtDT05TVC5lcC5MT0NBTH0ke0NPTlNULmVwLkxPR0lOfWApXG4gICAgICAgICAgICAuc2VuZChjcmVkcyk7XG4gICAgICAgIFxuICAgICAgICBleHBlY3QoYXV0aFJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoNDAxKTtcbiAgICAgICAgZXhwZWN0KGF1dGhSZXNwb25zZS5ib2R5KS50by5iZS5hbignb2JqZWN0Jyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59XG4iXX0=
