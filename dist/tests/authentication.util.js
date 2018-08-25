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
const server_entry_1 = require("../server-entry");
const constants_1 = require("../constants");
const supertest = require("supertest");
const chai = require("chai");
const log = require("winston");
const api = supertest.agent(server_entry_1.App.server);
const identityApi = null; // supertest(Config.active.get('identityApiEndpoint'));
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();
// We need to rename this so it doesn't collide with the authentication utility in the controllers folder.
class AuthUtil {
    static Initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.userToken == '') {
                try {
                    yield this.registerUser('testUser@lyraatlas.com');
                    // Now we've registered this user.  Let's authenticate them.
                    let auth = {
                        "email": "testUser@lyraatlas.com",
                        "password": "test1234"
                    };
                    let authResponse = yield api
                        .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.AUTHENTICATE}${constants_1.CONST.ep.LOCAL}${constants_1.CONST.ep.LOGIN}`)
                        .send(auth);
                    expect(authResponse.status).to.equal(200);
                    expect(authResponse.body.token).length.to.be.greaterThan(0);
                    this.userToken = authResponse.body.token;
                    this.decodedToken = authResponse.body.decoded;
                    let userId2 = yield this.registerUser('at@la.com');
                    let auth2 = {
                        "email": "at@la.com",
                        "password": "test1234"
                    };
                    let authResponse2 = yield api
                        .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.AUTHENTICATE}${constants_1.CONST.ep.LOCAL}${constants_1.CONST.ep.LOGIN}`)
                        .send(auth2);
                    this.userToken2 = authResponse2.body.token;
                    this.decodedToken2 = authResponse2.body.decoded;
                    return this.userToken;
                }
                catch (err) {
                    this.handleTestError(err);
                }
            }
        });
    }
    static registerUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            // We need to create a test user account.
            let user = {
                email: email,
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
            return registerResponse.body._id;
        });
    }
    static handleTestError(err) {
        log.error('There was an error during the authentication utitlity setup');
        log.error(err);
        throw err;
    }
}
AuthUtil.userToken = '';
AuthUtil.userToken2 = '';
exports.AuthUtil = AuthUtil;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3Rlc3RzL2F1dGhlbnRpY2F0aW9uLnV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLGtEQUE4QztBQUU5Qyw0Q0FBcUM7QUFHckMsdUNBQXVDO0FBQ3ZDLDZCQUE2QjtBQUM3QiwrQkFBZ0M7QUFLaEMsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxrQkFBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQSxDQUFDLHVEQUF1RDtBQUVoRixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUMzQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFN0IsMEdBQTBHO0FBQzFHO0lBUVcsTUFBTSxDQUFPLFVBQVU7O1lBQzFCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLENBQUEsQ0FBQztnQkFDckIsSUFBSSxDQUFDO29CQUNELE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO29CQUVsRCw0REFBNEQ7b0JBQzVELElBQUksSUFBSSxHQUFHO3dCQUNQLE9BQU8sRUFBRSx3QkFBd0I7d0JBQ2pDLFVBQVUsRUFBRSxVQUFVO3FCQUN6QixDQUFBO29CQUVELElBQUksWUFBWSxHQUFHLE1BQU0sR0FBRzt5QkFDdkIsSUFBSSxDQUFDLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLGlCQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLGlCQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFB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QUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFOUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBRU8sTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFRO1FBQ25DLEdBQUcsQ0FBQyxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQztRQUN6RSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsTUFBTSxHQUFHLENBQUM7SUFDZCxDQUFDOztBQTVFTSxrQkFBUyxHQUFXLEVBQUUsQ0FBQztBQUd2QixtQkFBVSxHQUFXLEVBQUUsQ0FBQztBQUxuQyw0QkErRUMiLCJmaWxlIjoidGVzdHMvYXV0aGVudGljYXRpb24udXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFiYXNlIH0gZnJvbSAnLi4vY29uZmlnL2RhdGFiYXNlL2RhdGFiYXNlJztcbmltcG9ydCB7IEFwcCwgc2VydmVyIH0gZnJvbSAnLi4vc2VydmVyLWVudHJ5JztcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcnO1xuaW1wb3J0IHsgQ09OU1QgfSBmcm9tIFwiLi4vY29uc3RhbnRzXCI7XG5cbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0ICogYXMgc3VwZXJ0ZXN0IGZyb20gJ3N1cGVydGVzdCc7XG5pbXBvcnQgKiBhcyBjaGFpIGZyb20gJ2NoYWknO1xuaW1wb3J0IGxvZyA9IHJlcXVpcmUoJ3dpbnN0b24nKTtcbmltcG9ydCB7IElkZW50aXR5QXBpU2VydmljZSB9IGZyb20gXCIuLi9zZXJ2aWNlcy9pZGVudGl0eS5hcGkuc2VydmljZVwiO1xuaW1wb3J0IHsgSVVzZXIgfSBmcm9tICcuLi9tb2RlbHMvdXNlci5pbnRlcmZhY2UnO1xuaW1wb3J0IHsgSVRva2VuUGF5bG9hZCB9IGZyb20gJy4uL21vZGVscyc7XG5cbmNvbnN0IGFwaSA9IHN1cGVydGVzdC5hZ2VudChBcHAuc2VydmVyKTtcbmNvbnN0IGlkZW50aXR5QXBpID0gbnVsbCAvLyBzdXBlcnRlc3QoQ29uZmlnLmFjdGl2ZS5nZXQoJ2lkZW50aXR5QXBpRW5kcG9pbnQnKSk7XG5cbmNvbnN0IG1vbmdvb3NlID0gcmVxdWlyZShcIm1vbmdvb3NlXCIpO1xuY29uc3QgZXhwZWN0ID0gY2hhaS5leHBlY3Q7XG5jb25zdCBzaG91bGQgPSBjaGFpLnNob3VsZCgpO1xuXG4vLyBXZSBuZWVkIHRvIHJlbmFtZSB0aGlzIHNvIGl0IGRvZXNuJ3QgY29sbGlkZSB3aXRoIHRoZSBhdXRoZW50aWNhdGlvbiB1dGlsaXR5IGluIHRoZSBjb250cm9sbGVycyBmb2xkZXIuXG5leHBvcnQgY2xhc3MgQXV0aFV0aWwge1xuXG4gICAgc3RhdGljIHVzZXJUb2tlbjogc3RyaW5nID0gJyc7XG4gICAgc3RhdGljIGRlY29kZWRUb2tlbjogSVRva2VuUGF5bG9hZDtcblxuICAgIHN0YXRpYyB1c2VyVG9rZW4yOiBzdHJpbmcgPSAnJztcbiAgICBzdGF0aWMgZGVjb2RlZFRva2VuMjogSVRva2VuUGF5bG9hZDtcblxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgSW5pdGlhbGl6ZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBpZih0aGlzLnVzZXJUb2tlbiA9PSAnJyl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucmVnaXN0ZXJVc2VyKCd0ZXN0VXNlckBseXJhYXRsYXMuY29tJyk7XG4gICAgXG4gICAgICAgICAgICAgICAgLy8gTm93IHdlJ3ZlIHJlZ2lzdGVyZWQgdGhpcyB1c2VyLiAgTGV0J3MgYXV0aGVudGljYXRlIHRoZW0uXG4gICAgICAgICAgICAgICAgbGV0IGF1dGggPSB7XG4gICAgICAgICAgICAgICAgICAgIFwiZW1haWxcIjogXCJ0ZXN0VXNlckBseXJhYXRsYXMuY29tXCIsXG4gICAgICAgICAgICAgICAgICAgIFwicGFzc3dvcmRcIjogXCJ0ZXN0MTIzNFwiXG4gICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgIGxldCBhdXRoUmVzcG9uc2UgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgICAgICAgICAgLnBvc3QoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5BVVRIRU5USUNBVEV9JHtDT05TVC5lcC5MT0NBTH0ke0NPTlNULmVwLkxPR0lOfWApXG4gICAgICAgICAgICAgICAgICAgIC5zZW5kKGF1dGgpO1xuICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChhdXRoUmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhdXRoUmVzcG9uc2UuYm9keS50b2tlbikubGVuZ3RoLnRvLmJlLmdyZWF0ZXJUaGFuKDApO1xuICAgIFxuICAgICAgICAgICAgICAgIHRoaXMudXNlclRva2VuID0gYXV0aFJlc3BvbnNlLmJvZHkudG9rZW47XG4gICAgICAgICAgICAgICAgdGhpcy5kZWNvZGVkVG9rZW4gPSBhdXRoUmVzcG9uc2UuYm9keS5kZWNvZGVkO1xuXG4gICAgICAgICAgICAgICAgbGV0IHVzZXJJZDIgPSBhd2FpdCB0aGlzLnJlZ2lzdGVyVXNlcignYXRAbGEuY29tJyk7XG4gICAgICAgICAgICAgICAgbGV0IGF1dGgyID0ge1xuICAgICAgICAgICAgICAgICAgICBcImVtYWlsXCI6IFwiYXRAbGEuY29tXCIsXG4gICAgICAgICAgICAgICAgICAgIFwicGFzc3dvcmRcIjogXCJ0ZXN0MTIzNFwiXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGF1dGhSZXNwb25zZTIgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkFVVEhFTlRJQ0FURX0ke0NPTlNULmVwLkxPQ0FMfSR7Q09OU1QuZXAuTE9HSU59YClcbiAgICAgICAgICAgICAgICAuc2VuZChhdXRoMik7XG4gICAgXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyVG9rZW4yID0gYXV0aFJlc3BvbnNlMi5ib2R5LnRva2VuO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVjb2RlZFRva2VuMiA9IGF1dGhSZXNwb25zZTIuYm9keS5kZWNvZGVkO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlclRva2VuO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVUZXN0RXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgcmVnaXN0ZXJVc2VyKGVtYWlsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIGNyZWF0ZSBhIHRlc3QgdXNlciBhY2NvdW50LlxuICAgICAgICBsZXQgdXNlcjogSVVzZXIgPSB7XG4gICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICBwYXNzd29yZDogJ3Rlc3QxMjM0JyxcbiAgICAgICAgICAgIGlzQWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgcm9sZXM6IFtDT05TVC5VU0VSX1JPTEVdLFxuICAgICAgICAgICAgaXNFbWFpbFZlcmlmaWVkOiB0cnVlLFxuICAgICAgICAgICAgZmlyc3ROYW1lOiBcIkRhdmVcIixcbiAgICAgICAgICAgIGxhc3ROYW1lOiBcIkJyb3duXCIsXG4gICAgICAgICAgICBpc1Rva2VuRXhwaXJlZDogZmFsc2VcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByZWdpc3RlclJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkFVVEhFTlRJQ0FURX0ke0NPTlNULmVwLkxPQ0FMfSR7Q09OU1QuZXAuUkVHSVNURVJ9YClcbiAgICAgICAgICAgIC5zZW5kKHVzZXIpO1xuXG4gICAgICAgIGV4cGVjdChyZWdpc3RlclJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAxKTtcbiAgICAgICAgZXhwZWN0KHJlZ2lzdGVyUmVzcG9uc2UuYm9keSkudG8uYmUuYW4oJ29iamVjdCcpO1xuICAgICAgICBleHBlY3QocmVnaXN0ZXJSZXNwb25zZS5ib2R5LnBhc3N3b3JkKS50by5iZS5lcXVhbCgnJyk7XG4gICAgICAgIGV4cGVjdChyZWdpc3RlclJlc3BvbnNlLmJvZHkuX2lkKS5sZW5ndGgudG8uYmUuZ3JlYXRlclRoYW4oMCk7XG5cbiAgICAgICAgcmV0dXJuIHJlZ2lzdGVyUmVzcG9uc2UuYm9keS5faWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaGFuZGxlVGVzdEVycm9yKGVycjogYW55KTogdm9pZCB7XG4gICAgICAgIGxvZy5lcnJvcignVGhlcmUgd2FzIGFuIGVycm9yIGR1cmluZyB0aGUgYXV0aGVudGljYXRpb24gdXRpdGxpdHkgc2V0dXAnKTtcbiAgICAgICAgbG9nLmVycm9yKGVycilcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbn0iXX0=
