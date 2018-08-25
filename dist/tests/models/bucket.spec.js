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
const authentication_util_1 = require("../authentication.util");
const cleanup_util_spec_1 = require("../cleanup.util.spec");
const mocha_typescript_1 = require("mocha-typescript");
const supertest = require("supertest");
const chai = require("chai");
const api = supertest.agent(server_entry_1.App.server);
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();
let BucketTest = class BucketTest {
    // First we need to get some users to work with from the identity service
    static before(done) {
        console.log('Testing buckets');
        // This code should only be called if this test is run as a single test.  When run in the suite along with
        // product this code is run by the product test.
        // App.server.on('dbConnected', async () => {
        //     console.log('Got the dbConnected Signal, so now we can clear, and seed the database.' )
        //     await Cleanup.clearDatabase();
        //     console.log('About to seed the database');
        //     await DatabaseBootstrap.seed();
        //     console.log('About to create identity test data.');
        //     // This will create, 2 users, an organization, and add the users to the correct roles.
        //     await AuthUtil.registerUser("dave2");
        //     await AuthUtil.Initialize();
        //     done();
        // });
        done();
    }
    static after() {
        return __awaiter(this, void 0, void 0, function* () {
            yield cleanup_util_spec_1.Cleanup.clearDatabase();
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield authentication_util_1.AuthUtil.Initialize();
            expect(1).to.be.equal(1);
            return;
        });
    }
    TestAbilityToCreateBucket() {
        return __awaiter(this, void 0, void 0, function* () {
            let bucket = {
                name: "Russia Is Amazing",
            };
            let response = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}`)
                .set(constants_1.CONST.TOKEN_HEADER_KEY, authentication_util_1.AuthUtil.userToken)
                .send(bucket);
            expect(response.status).to.equal(201);
            expect(response.body.name).to.be.equal(bucket.name);
            expect(response.body.owners[0].ownerId).to.be.equal(authentication_util_1.AuthUtil.decodedToken.userId);
            return;
        });
    }
    bucketList() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield api
                .get(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(200);
            expect(response.body.length).to.be.greaterThan(0); // List of all the buckets.
            return;
        });
    }
    getByIdWorking() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            let response = yield api
                .get(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('name');
            return;
        });
    }
    updateABucket() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            let bucketUpdate = {
                _id: `${createdId}`,
                name: "Daves Tulip",
            };
            let response = yield api
                .put(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketUpdate);
            expect(response.status).to.equal(202);
            expect(response.body.name).to.equal(bucketUpdate.name);
            return;
        });
    }
    updateABucketFailsWithAnotherUser() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            let bucketUpdate = {
                _id: `${createdId}`,
                name: "Daves Tulip",
            };
            let response = yield api
                .put(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken2)
                .send(bucketUpdate);
            // The server will respond with a 403 when the ownership check fails.    
            expect(response.status).to.equal(403);
            return;
        });
    }
    regularUsersCantCallClear() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/clear`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send({});
            // The server will respond with a 403 when the ownership check fails.    
            expect(response.status).to.equal(403);
            return;
        });
    }
    AddALikeToABucket() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            let bucketUpdate = {};
            let response = yield api
                .patch(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.LIKES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketUpdate);
            expect(response.status).to.equal(202);
            expect(response.body.likedBy.length).to.equal(1);
            expect(response.body.likedBy[0]).to.equal(authentication_util_1.AuthUtil.decodedToken.userId);
            // now we're checking the notifications.
            let response2 = yield api
                .get(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.NOTIFICATIONS}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response2.status).to.equal(200);
            expect(response2.body[0].bucket).to.equal(createdId);
            expect(response2.body[0].isRead).to.equal(false);
            return;
        });
    }
    AddLikeOnce() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            let bucketUpdate = {};
            let response2 = yield api
                .patch(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.LIKES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketUpdate);
            let response = yield api
                .patch(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.LIKES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketUpdate);
            expect(response.status).to.equal(202);
            expect(response.body.likedBy.length).to.equal(1);
            expect(response.body.likedBy[0]).to.equal(authentication_util_1.AuthUtil.decodedToken.userId);
            return;
        });
    }
    AddComment() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            const testComment = "This is a test comment";
            let addComment = {
                comment: testComment,
            };
            let response = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.COMMENTS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(addComment);
            console.dir(response.body.comments);
            expect(response.status).to.equal(202);
            expect(response.body.comments.length).to.equal(1);
            expect(response.body.comments[0].comment).to.equal(testComment);
            return;
        });
    }
    EditComment() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            const testComment = "This is a test comment";
            let addComment = {
                comment: testComment,
            };
            let responseAdd = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.COMMENTS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(addComment);
            const createdCommentId = responseAdd.body.comments[0]._id;
            const editedText = "Updated Text";
            let editComment = {
                comment: editedText,
                _id: createdCommentId,
            };
            let response = yield api
                .patch(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.COMMENTS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(editComment);
            console.dir(response.body.comments);
            expect(response.status).to.equal(200);
            expect(response.body.comments.length).to.equal(1);
            expect(response.body.comments[0].comment).to.equal(editedText);
            return;
        });
    }
    RemoveComment() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            const testComment = "This is a test comment";
            let addComment = {
                comment: testComment,
            };
            let responseAdd = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.COMMENTS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(addComment);
            const createdCommentId = responseAdd.body.comments[0]._id;
            let removeRequest = {
                _id: createdCommentId
            };
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.COMMENTS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(removeRequest);
            expect(response.status).to.equal(200);
            expect(response.body.comments.length).to.equal(0);
            return;
        });
    }
    RemoveALikeFromABucket() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            let bucketUpdate = {};
            let response1 = yield api
                .patch(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.LIKES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketUpdate);
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.LIKES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketUpdate);
            //console.dir(response.body);
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('likedBy');
            expect(response.body.likedBy.length).to.equal(0);
            return;
        });
    }
    deleteABucket() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(200);
            expect(response.body.ItemRemovedId).to.be.equal(createdId);
            return;
        });
    }
    onDeleteWithoutID404() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/58f8c8caedf7292be80a90e4`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(404);
            return;
        });
    }
    onUpdateWithoutID404() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield api
                .put(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/58f8c8caedf7292be80a90e4`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(404);
            return;
        });
    }
    deletingShouldAlsoDeleteTheImages() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            // Now we need to post a test image. 
            // './assets/testImage.jpg'
            let uploadResponse = yield api.post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.IMAGES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .attach('file', './server/tests/assets/testImage.jpg');
            expect(uploadResponse.status).to.equal(200);
            // Now I want to check the response with regards to the images on the item.
            let singleResponse = yield api
                .get(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(singleResponse.body.images.length).to.be.greaterThan(0);
            expect(singleResponse.body.images[0].isActive).to.be.true;
            expect(singleResponse.body.images[0].variations.length).to.be.greaterThan(0);
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('ItemRemoved');
            expect(response.body).to.have.property('ItemRemovedId');
            expect(response.body.ItemRemovedId).to.be.equal(createdId);
            return;
        });
    }
    createBucket(authToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let bucket = {
                name: "Russia Is Amazing",
            };
            let createResponse = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}`)
                .set("x-access-token", authToken)
                .send(bucket);
            return createResponse.body._id;
        });
    }
};
__decorate([
    mocha_typescript_1.test('Just setting up a test for testing initialization')
], BucketTest.prototype, "initialize", null);
__decorate([
    mocha_typescript_1.test('creating new buckets should work')
], BucketTest.prototype, "TestAbilityToCreateBucket", null);
__decorate([
    mocha_typescript_1.test('should list all the buckets')
], BucketTest.prototype, "bucketList", null);
__decorate([
    mocha_typescript_1.test('making sure get bucket by id works')
], BucketTest.prototype, "getByIdWorking", null);
__decorate([
    mocha_typescript_1.test('it should update a bucket')
], BucketTest.prototype, "updateABucket", null);
__decorate([
    mocha_typescript_1.test('it should fail to update the bucket when tried by the user who doesnt own it')
], BucketTest.prototype, "updateABucketFailsWithAnotherUser", null);
__decorate([
    mocha_typescript_1.test('regular users cant call clear on the resource')
], BucketTest.prototype, "regularUsersCantCallClear", null);
__decorate([
    mocha_typescript_1.test('it should add a like to a bucket, and lodge a notification')
], BucketTest.prototype, "AddALikeToABucket", null);
__decorate([
    mocha_typescript_1.test('it should only add the like once')
], BucketTest.prototype, "AddLikeOnce", null);
__decorate([
    mocha_typescript_1.test('it should only add a comment to the item')
], BucketTest.prototype, "AddComment", null);
__decorate([
    mocha_typescript_1.test('it should only edit a comment to the item')
], BucketTest.prototype, "EditComment", null);
__decorate([
    mocha_typescript_1.test('it should only delete the comment from the item')
], BucketTest.prototype, "RemoveComment", null);
__decorate([
    mocha_typescript_1.test('it should remove a like from a bucket')
], BucketTest.prototype, "RemoveALikeFromABucket", null);
__decorate([
    mocha_typescript_1.test('it should delete a bucket')
], BucketTest.prototype, "deleteABucket", null);
__decorate([
    mocha_typescript_1.test('should return a 404 on delete when the ID isnt there')
], BucketTest.prototype, "onDeleteWithoutID404", null);
__decorate([
    mocha_typescript_1.test('should return a 404 on update when the ID isnt there')
], BucketTest.prototype, "onUpdateWithoutID404", null);
__decorate([
    mocha_typescript_1.test('create a bucket, add images, delete should delete images')
], BucketTest.prototype, "deletingShouldAlsoDeleteTheImages", null);
BucketTest = __decorate([
    mocha_typescript_1.suite('Bucket Model -> ')
], BucketTest);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3Rlc3RzL21vZGVscy9idWNrZXQuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EscURBQWlEO0FBR2pELCtDQUF3QztBQUN4QyxnRUFBa0Q7QUFDbEQsNERBQStDO0FBQy9DLHVEQUErQztBQUcvQyx1Q0FBdUM7QUFDdkMsNkJBQTZCO0FBRTdCLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsa0JBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUMzQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFHN0IsSUFBTSxVQUFVLEdBQWhCO0lBRUkseUVBQXlFO0lBQ2xFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDL0IsMEdBQTBHO1FBQzFHLGdEQUFnRDtRQUNoRCw2Q0FBNkM7UUFDN0MsOEZBQThGO1FBQzlGLHFDQUFxQztRQUNyQyxpREFBaUQ7UUFDakQsc0NBQXNDO1FBRXRDLDBEQUEwRDtRQUMxRCw2RkFBNkY7UUFDN0YsNENBQTRDO1FBQzVDLG1DQUFtQztRQUVuQyxjQUFjO1FBQ2QsTUFBTTtRQUVOLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUVNLE1BQU0sQ0FBTyxLQUFLOztZQUNyQixNQUFNLDJCQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDbEMsQ0FBQztLQUFBO0lBR1ksVUFBVTs7WUFDbkIsTUFBTSw4QkFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtB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dGVudCI6WyJpbXBvcnQgeyBEYXRhYmFzZSB9IGZyb20gJy4uLy4uL2NvbmZpZy9kYXRhYmFzZS9kYXRhYmFzZSc7XG5pbXBvcnQgeyBBcHAsIHNlcnZlciB9IGZyb20gJy4uLy4uL3NlcnZlci1lbnRyeSc7XG5pbXBvcnQgeyBCdWNrZXQsIElCdWNrZXQsIElUb2tlblBheWxvYWQsIElDb21tZW50YWJsZSB9IGZyb20gJy4uLy4uL21vZGVscyc7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tICcuLi8uLi9jb25maWcvY29uZmlnJztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSBcIi4uLy4uL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgQXV0aFV0aWwgfSBmcm9tIFwiLi4vYXV0aGVudGljYXRpb24udXRpbFwiO1xuaW1wb3J0IHsgQ2xlYW51cCB9IGZyb20gXCIuLi9jbGVhbnVwLnV0aWwuc3BlY1wiO1xuaW1wb3J0IHsgc3VpdGUsIHRlc3QgfSBmcm9tIFwibW9jaGEtdHlwZXNjcmlwdFwiO1xuaW1wb3J0IHsgRGF0YWJhc2VCb290c3RyYXAgfSBmcm9tIFwiLi4vLi4vY29uZmlnL2RhdGFiYXNlL2RhdGFiYXNlLWJvb3RzdHJhcFwiO1xuXG5pbXBvcnQgKiBhcyBzdXBlcnRlc3QgZnJvbSAnc3VwZXJ0ZXN0JztcbmltcG9ydCAqIGFzIGNoYWkgZnJvbSAnY2hhaSc7XG5cbmNvbnN0IGFwaSA9IHN1cGVydGVzdC5hZ2VudChBcHAuc2VydmVyKTtcbmNvbnN0IG1vbmdvb3NlID0gcmVxdWlyZShcIm1vbmdvb3NlXCIpO1xuY29uc3QgZXhwZWN0ID0gY2hhaS5leHBlY3Q7XG5jb25zdCBzaG91bGQgPSBjaGFpLnNob3VsZCgpO1xuXG5Ac3VpdGUoJ0J1Y2tldCBNb2RlbCAtPiAnKVxuY2xhc3MgQnVja2V0VGVzdCB7XG5cbiAgICAvLyBGaXJzdCB3ZSBuZWVkIHRvIGdldCBzb21lIHVzZXJzIHRvIHdvcmsgd2l0aCBmcm9tIHRoZSBpZGVudGl0eSBzZXJ2aWNlXG4gICAgcHVibGljIHN0YXRpYyBiZWZvcmUoZG9uZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnVGVzdGluZyBidWNrZXRzJyk7XG4gICAgICAgIC8vIFRoaXMgY29kZSBzaG91bGQgb25seSBiZSBjYWxsZWQgaWYgdGhpcyB0ZXN0IGlzIHJ1biBhcyBhIHNpbmdsZSB0ZXN0LiAgV2hlbiBydW4gaW4gdGhlIHN1aXRlIGFsb25nIHdpdGhcbiAgICAgICAgLy8gcHJvZHVjdCB0aGlzIGNvZGUgaXMgcnVuIGJ5IHRoZSBwcm9kdWN0IHRlc3QuXG4gICAgICAgIC8vIEFwcC5zZXJ2ZXIub24oJ2RiQ29ubmVjdGVkJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ0dvdCB0aGUgZGJDb25uZWN0ZWQgU2lnbmFsLCBzbyBub3cgd2UgY2FuIGNsZWFyLCBhbmQgc2VlZCB0aGUgZGF0YWJhc2UuJyApXG4gICAgICAgIC8vICAgICBhd2FpdCBDbGVhbnVwLmNsZWFyRGF0YWJhc2UoKTtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCdBYm91dCB0byBzZWVkIHRoZSBkYXRhYmFzZScpO1xuICAgICAgICAvLyAgICAgYXdhaXQgRGF0YWJhc2VCb290c3RyYXAuc2VlZCgpO1xuXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnQWJvdXQgdG8gY3JlYXRlIGlkZW50aXR5IHRlc3QgZGF0YS4nKTtcbiAgICAgICAgLy8gICAgIC8vIFRoaXMgd2lsbCBjcmVhdGUsIDIgdXNlcnMsIGFuIG9yZ2FuaXphdGlvbiwgYW5kIGFkZCB0aGUgdXNlcnMgdG8gdGhlIGNvcnJlY3Qgcm9sZXMuXG4gICAgICAgIC8vICAgICBhd2FpdCBBdXRoVXRpbC5yZWdpc3RlclVzZXIoXCJkYXZlMlwiKTtcbiAgICAgICAgLy8gICAgIGF3YWl0IEF1dGhVdGlsLkluaXRpYWxpemUoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAvLyAgICAgZG9uZSgpO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBhZnRlcigpIHtcbiAgICAgICAgYXdhaXQgQ2xlYW51cC5jbGVhckRhdGFiYXNlKCk7XG4gICAgfVxuXG4gICAgQHRlc3QoJ0p1c3Qgc2V0dGluZyB1cCBhIHRlc3QgZm9yIHRlc3RpbmcgaW5pdGlhbGl6YXRpb24nKVxuICAgIHB1YmxpYyBhc3luYyBpbml0aWFsaXplKCkge1xuICAgICAgICBhd2FpdCBBdXRoVXRpbC5Jbml0aWFsaXplKCk7XG4gICAgICAgIGV4cGVjdCgxKS50by5iZS5lcXVhbCgxKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdjcmVhdGluZyBuZXcgYnVja2V0cyBzaG91bGQgd29yaycpXG4gICAgcHVibGljIGFzeW5jIFRlc3RBYmlsaXR5VG9DcmVhdGVCdWNrZXQoKSB7XG4gICAgICAgIGxldCBidWNrZXQ6IElCdWNrZXQgPSB7XG4gICAgICAgICAgICBuYW1lOiBcIlJ1c3NpYSBJcyBBbWF6aW5nXCIsXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5wb3N0KGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU31gKVxuICAgICAgICAgICAgLnNldChDT05TVC5UT0tFTl9IRUFERVJfS0VZLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChidWNrZXQpO1xuXG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5zdGF0dXMpLnRvLmVxdWFsKDIwMSk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5ib2R5Lm5hbWUpLnRvLmJlLmVxdWFsKGJ1Y2tldC5uYW1lKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkub3duZXJzWzBdLm93bmVySWQpLnRvLmJlLmVxdWFsKEF1dGhVdGlsLmRlY29kZWRUb2tlbi51c2VySWQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ3Nob3VsZCBsaXN0IGFsbCB0aGUgYnVja2V0cycpXG4gICAgcHVibGljIGFzeW5jIGJ1Y2tldExpc3QoKSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLmdldChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLiBCVUNLRVRTfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDApO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5sZW5ndGgpLnRvLmJlLmdyZWF0ZXJUaGFuKDApOyAvLyBMaXN0IG9mIGFsbCB0aGUgYnVja2V0cy5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdtYWtpbmcgc3VyZSBnZXQgYnVja2V0IGJ5IGlkIHdvcmtzJylcbiAgICBwdWJsaWMgYXN5bmMgZ2V0QnlJZFdvcmtpbmcoKSB7XG4gICAgICAgIGxldCBjcmVhdGVkSWQgPSBhd2FpdCB0aGlzLmNyZWF0ZUJ1Y2tldChBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLmdldChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVFN9LyR7Y3JlYXRlZElkfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDApO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keSkudG8uaGF2ZS5wcm9wZXJ0eSgnbmFtZScpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ2l0IHNob3VsZCB1cGRhdGUgYSBidWNrZXQnKVxuICAgIHB1YmxpYyBhc3luYyB1cGRhdGVBQnVja2V0KCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXQoQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICBsZXQgYnVja2V0VXBkYXRlID0ge1xuICAgICAgICAgICAgX2lkOiBgJHtjcmVhdGVkSWR9YCxcbiAgICAgICAgICAgIG5hbWU6IFwiRGF2ZXMgVHVsaXBcIixcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5wdXQoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRTfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbilcbiAgICAgICAgICAgIC5zZW5kKGJ1Y2tldFVwZGF0ZSk7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAyKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkubmFtZSkudG8uZXF1YWwoYnVja2V0VXBkYXRlLm5hbWUpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ2l0IHNob3VsZCBmYWlsIHRvIHVwZGF0ZSB0aGUgYnVja2V0IHdoZW4gdHJpZWQgYnkgdGhlIHVzZXIgd2hvIGRvZXNudCBvd24gaXQnKVxuICAgIHB1YmxpYyBhc3luYyB1cGRhdGVBQnVja2V0RmFpbHNXaXRoQW5vdGhlclVzZXIoKSB7XG4gICAgICAgIGxldCBjcmVhdGVkSWQgPSBhd2FpdCB0aGlzLmNyZWF0ZUJ1Y2tldChBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGxldCBidWNrZXRVcGRhdGUgPSB7XG4gICAgICAgICAgICBfaWQ6IGAke2NyZWF0ZWRJZH1gLFxuICAgICAgICAgICAgbmFtZTogXCJEYXZlcyBUdWxpcFwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnB1dChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVFN9LyR7Y3JlYXRlZElkfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuMilcbiAgICAgICAgICAgIC5zZW5kKGJ1Y2tldFVwZGF0ZSk7XG5cbiAgICAgICAgLy8gVGhlIHNlcnZlciB3aWxsIHJlc3BvbmQgd2l0aCBhIDQwMyB3aGVuIHRoZSBvd25lcnNoaXAgY2hlY2sgZmFpbHMuICAgIFxuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCg0MDMpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ3JlZ3VsYXIgdXNlcnMgY2FudCBjYWxsIGNsZWFyIG9uIHRoZSByZXNvdXJjZScpXG4gICAgcHVibGljIGFzeW5jIHJlZ3VsYXJVc2Vyc0NhbnRDYWxsQ2xlYXIoKSB7XG4gICAgICAgIGxldCBjcmVhdGVkSWQgPSBhd2FpdCB0aGlzLmNyZWF0ZUJ1Y2tldChBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLmRlbGV0ZShgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVFN9L2NsZWFyYClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZCh7fSk7XG5cbiAgICAgICAgLy8gVGhlIHNlcnZlciB3aWxsIHJlc3BvbmQgd2l0aCBhIDQwMyB3aGVuIHRoZSBvd25lcnNoaXAgY2hlY2sgZmFpbHMuICAgIFxuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCg0MDMpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ2l0IHNob3VsZCBhZGQgYSBsaWtlIHRvIGEgYnVja2V0LCBhbmQgbG9kZ2UgYSBub3RpZmljYXRpb24nKVxuICAgIHB1YmxpYyBhc3luYyBBZGRBTGlrZVRvQUJ1Y2tldCgpIHtcbiAgICAgICAgbGV0IGNyZWF0ZWRJZCA9IGF3YWl0IHRoaXMuY3JlYXRlQnVja2V0KEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgbGV0IGJ1Y2tldFVwZGF0ZSA9IHt9O1xuXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBhdGNoKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU30ke0NPTlNULmVwLkxJS0VTfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbilcbiAgICAgICAgICAgIC5zZW5kKGJ1Y2tldFVwZGF0ZSk7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAyKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkubGlrZWRCeS5sZW5ndGgpLnRvLmVxdWFsKDEpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5saWtlZEJ5WzBdKS50by5lcXVhbChBdXRoVXRpbC5kZWNvZGVkVG9rZW4udXNlcklkKTtcblxuICAgICAgICAvLyBub3cgd2UncmUgY2hlY2tpbmcgdGhlIG5vdGlmaWNhdGlvbnMuXG4gICAgICAgIGxldCByZXNwb25zZTIgPSBhd2FpdCBhcGlcbiAgICAgICAgLmdldChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLk5PVElGSUNBVElPTlN9YClcbiAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlMi5zdGF0dXMpLnRvLmVxdWFsKDIwMCk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZTIuYm9keVswXS5idWNrZXQpLnRvLmVxdWFsKGNyZWF0ZWRJZCk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZTIuYm9keVswXS5pc1JlYWQpLnRvLmVxdWFsKGZhbHNlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdpdCBzaG91bGQgb25seSBhZGQgdGhlIGxpa2Ugb25jZScpXG4gICAgcHVibGljIGFzeW5jIEFkZExpa2VPbmNlKCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXQoQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICBsZXQgYnVja2V0VXBkYXRlID0ge307XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlMiA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBhdGNoKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU30ke0NPTlNULmVwLkxJS0VTfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbilcbiAgICAgICAgICAgIC5zZW5kKGJ1Y2tldFVwZGF0ZSk7XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucGF0Y2goYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRTfSR7Q09OU1QuZXAuTElLRVN9LyR7Y3JlYXRlZElkfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKVxuICAgICAgICAgICAgLnNlbmQoYnVja2V0VXBkYXRlKTtcblxuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDIpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5saWtlZEJ5Lmxlbmd0aCkudG8uZXF1YWwoMSk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5ib2R5Lmxpa2VkQnlbMF0pLnRvLmVxdWFsKEF1dGhVdGlsLmRlY29kZWRUb2tlbi51c2VySWQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ2l0IHNob3VsZCBvbmx5IGFkZCBhIGNvbW1lbnQgdG8gdGhlIGl0ZW0nKVxuICAgIHB1YmxpYyBhc3luYyBBZGRDb21tZW50KCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXQoQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICBjb25zdCB0ZXN0Q29tbWVudCA9IFwiVGhpcyBpcyBhIHRlc3QgY29tbWVudFwiO1xuXG4gICAgICAgIGxldCBhZGRDb21tZW50ID0ge1xuICAgICAgICAgICAgY29tbWVudDogdGVzdENvbW1lbnQsXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVFN9JHtDT05TVC5lcC5DT01NRU5UU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChhZGRDb21tZW50KTtcblxuICAgICAgICBjb25zb2xlLmRpcihyZXNwb25zZS5ib2R5LmNvbW1lbnRzKTtcblxuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDIpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5jb21tZW50cy5sZW5ndGgpLnRvLmVxdWFsKDEpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5jb21tZW50c1swXS5jb21tZW50KS50by5lcXVhbCh0ZXN0Q29tbWVudCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBAdGVzdCgnaXQgc2hvdWxkIG9ubHkgZWRpdCBhIGNvbW1lbnQgdG8gdGhlIGl0ZW0nKVxuICAgIHB1YmxpYyBhc3luYyBFZGl0Q29tbWVudCgpIHtcbiAgICAgICAgbGV0IGNyZWF0ZWRJZCA9IGF3YWl0IHRoaXMuY3JlYXRlQnVja2V0KEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgY29uc3QgdGVzdENvbW1lbnQgPSBcIlRoaXMgaXMgYSB0ZXN0IGNvbW1lbnRcIjtcblxuICAgICAgICBsZXQgYWRkQ29tbWVudCA9IHtcbiAgICAgICAgICAgIGNvbW1lbnQ6IHRlc3RDb21tZW50LFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCByZXNwb25zZUFkZCA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBvc3QoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRTfSR7Q09OU1QuZXAuQ09NTUVOVFN9LyR7Y3JlYXRlZElkfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKVxuICAgICAgICAgICAgLnNlbmQoYWRkQ29tbWVudCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjcmVhdGVkQ29tbWVudElkID0gKHJlc3BvbnNlQWRkLmJvZHkgYXMgSUNvbW1lbnRhYmxlKS5jb21tZW50c1swXS5faWQ7XG5cbiAgICAgICAgY29uc3QgZWRpdGVkVGV4dCA9IFwiVXBkYXRlZCBUZXh0XCI7XG5cbiAgICAgICAgbGV0IGVkaXRDb21tZW50ID0ge1xuICAgICAgICAgICAgY29tbWVudDogZWRpdGVkVGV4dCxcbiAgICAgICAgICAgIF9pZDogY3JlYXRlZENvbW1lbnRJZCxcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5wYXRjaChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVFN9JHtDT05TVC5lcC5DT01NRU5UU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChlZGl0Q29tbWVudCk7XG5cbiAgICAgICAgY29uc29sZS5kaXIocmVzcG9uc2UuYm9keS5jb21tZW50cyk7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkuY29tbWVudHMubGVuZ3RoKS50by5lcXVhbCgxKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkuY29tbWVudHNbMF0uY29tbWVudCkudG8uZXF1YWwoZWRpdGVkVGV4dCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBAdGVzdCgnaXQgc2hvdWxkIG9ubHkgZGVsZXRlIHRoZSBjb21tZW50IGZyb20gdGhlIGl0ZW0nKVxuICAgIHB1YmxpYyBhc3luYyBSZW1vdmVDb21tZW50KCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXQoQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICBjb25zdCB0ZXN0Q29tbWVudCA9IFwiVGhpcyBpcyBhIHRlc3QgY29tbWVudFwiO1xuXG4gICAgICAgIGxldCBhZGRDb21tZW50ID0ge1xuICAgICAgICAgICAgY29tbWVudDogdGVzdENvbW1lbnQsXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlQWRkID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVFN9JHtDT05TVC5lcC5DT01NRU5UU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChhZGRDb21tZW50KTtcblxuICAgICAgICBjb25zdCBjcmVhdGVkQ29tbWVudElkID0gKHJlc3BvbnNlQWRkLmJvZHkgYXMgSUNvbW1lbnRhYmxlKS5jb21tZW50c1swXS5faWQ7XG5cbiAgICAgICAgbGV0IHJlbW92ZVJlcXVlc3QgPSB7XG4gICAgICAgICAgICBfaWQ6IGNyZWF0ZWRDb21tZW50SWRcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAuZGVsZXRlKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU30ke0NPTlNULmVwLkNPTU1FTlRTfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKVxuICAgICAgICAuc2VuZChyZW1vdmVSZXF1ZXN0KTtcblxuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDApO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5jb21tZW50cy5sZW5ndGgpLnRvLmVxdWFsKDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ2l0IHNob3VsZCByZW1vdmUgYSBsaWtlIGZyb20gYSBidWNrZXQnKVxuICAgIHB1YmxpYyBhc3luYyBSZW1vdmVBTGlrZUZyb21BQnVja2V0KCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXQoQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICBsZXQgYnVja2V0VXBkYXRlID0ge307XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlMSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBhdGNoKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU30ke0NPTlNULmVwLkxJS0VTfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbilcbiAgICAgICAgICAgIC5zZW5kKGJ1Y2tldFVwZGF0ZSk7XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAuZGVsZXRlKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU30ke0NPTlNULmVwLkxJS0VTfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbilcbiAgICAgICAgICAgIC5zZW5kKGJ1Y2tldFVwZGF0ZSk7XG5cbiAgICAgICAgLy9jb25zb2xlLmRpcihyZXNwb25zZS5ib2R5KTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkpLnRvLmhhdmUucHJvcGVydHkoJ2xpa2VkQnknKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkubGlrZWRCeS5sZW5ndGgpLnRvLmVxdWFsKDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ2l0IHNob3VsZCBkZWxldGUgYSBidWNrZXQnKVxuICAgIHB1YmxpYyBhc3luYyBkZWxldGVBQnVja2V0KCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXQoQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5kZWxldGUoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRTfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkuSXRlbVJlbW92ZWRJZCkudG8uYmUuZXF1YWwoY3JlYXRlZElkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuXG4gICAgQHRlc3QoJ3Nob3VsZCByZXR1cm4gYSA0MDQgb24gZGVsZXRlIHdoZW4gdGhlIElEIGlzbnQgdGhlcmUnKVxuICAgIHB1YmxpYyBhc3luYyBvbkRlbGV0ZVdpdGhvdXRJRDQwNCgpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAuZGVsZXRlKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU30vNThmOGM4Y2FlZGY3MjkyYmU4MGE5MGU0YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5zdGF0dXMpLnRvLmVxdWFsKDQwNCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBAdGVzdCgnc2hvdWxkIHJldHVybiBhIDQwNCBvbiB1cGRhdGUgd2hlbiB0aGUgSUQgaXNudCB0aGVyZScpXG4gICAgcHVibGljIGFzeW5jIG9uVXBkYXRlV2l0aG91dElENDA0KCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5wdXQoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRTfS81OGY4YzhjYWVkZjcyOTJiZTgwYTkwZTRgKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoNDA0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdjcmVhdGUgYSBidWNrZXQsIGFkZCBpbWFnZXMsIGRlbGV0ZSBzaG91bGQgZGVsZXRlIGltYWdlcycpXG4gICAgcHVibGljIGFzeW5jIGRlbGV0aW5nU2hvdWxkQWxzb0RlbGV0ZVRoZUltYWdlcygpIHtcbiAgICAgICAgbGV0IGNyZWF0ZWRJZCA9IGF3YWl0IHRoaXMuY3JlYXRlQnVja2V0KEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgLy8gTm93IHdlIG5lZWQgdG8gcG9zdCBhIHRlc3QgaW1hZ2UuIFxuICAgICAgICAvLyAnLi9hc3NldHMvdGVzdEltYWdlLmpwZydcbiAgICAgICAgbGV0IHVwbG9hZFJlc3BvbnNlID0gIGF3YWl0IGFwaS5wb3N0KGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU30ke0NPTlNULmVwLklNQUdFU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbilcbiAgICAgICAgLmF0dGFjaCgnZmlsZScsICcuL3NlcnZlci90ZXN0cy9hc3NldHMvdGVzdEltYWdlLmpwZycpO1xuXG4gICAgICAgIGV4cGVjdCh1cGxvYWRSZXNwb25zZS5zdGF0dXMpLnRvLmVxdWFsKDIwMCk7XG5cbiAgICAgICAgLy8gTm93IEkgd2FudCB0byBjaGVjayB0aGUgcmVzcG9uc2Ugd2l0aCByZWdhcmRzIHRvIHRoZSBpbWFnZXMgb24gdGhlIGl0ZW0uXG4gICAgICAgIGxldCBzaW5nbGVSZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAuZ2V0KGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgZXhwZWN0KChzaW5nbGVSZXNwb25zZS5ib2R5IGFzIElCdWNrZXQpLmltYWdlcy5sZW5ndGgpLnRvLmJlLmdyZWF0ZXJUaGFuKDApO1xuICAgICAgICBleHBlY3QoKHNpbmdsZVJlc3BvbnNlLmJvZHkgYXMgSUJ1Y2tldCkuaW1hZ2VzWzBdLmlzQWN0aXZlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QoKHNpbmdsZVJlc3BvbnNlLmJvZHkgYXMgSUJ1Y2tldCkuaW1hZ2VzWzBdLnZhcmlhdGlvbnMubGVuZ3RoKS50by5iZS5ncmVhdGVyVGhhbigwKTtcblxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5kZWxldGUoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRTfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkpLnRvLmhhdmUucHJvcGVydHkoJ0l0ZW1SZW1vdmVkJyk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5ib2R5KS50by5oYXZlLnByb3BlcnR5KCdJdGVtUmVtb3ZlZElkJyk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5ib2R5Lkl0ZW1SZW1vdmVkSWQpLnRvLmJlLmVxdWFsKGNyZWF0ZWRJZCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZUJ1Y2tldChhdXRoVG9rZW46IHN0cmluZyk6UHJvbWlzZTxzdHJpbmc+e1xuICAgICAgICBsZXQgYnVja2V0OiBJQnVja2V0ID0ge1xuICAgICAgICAgICAgbmFtZTogXCJSdXNzaWEgSXMgQW1hemluZ1wiLFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNyZWF0ZVJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVFN9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBhdXRoVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChidWNrZXQpO1xuXG4gICAgICAgIHJldHVybiBjcmVhdGVSZXNwb25zZS5ib2R5Ll9pZDtcbiAgICB9XG59XG4iXX0=
