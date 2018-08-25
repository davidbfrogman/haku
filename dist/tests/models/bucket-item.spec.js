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
const chai = require("chai");
const mocha_typescript_1 = require("mocha-typescript");
const supertest = require("supertest");
const constants_1 = require("../../constants");
const server_entry_1 = require("../../server-entry");
const authentication_util_1 = require("../authentication.util");
const cleanup_util_spec_1 = require("../cleanup.util.spec");
const api = supertest.agent(server_entry_1.App.server);
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();
let BucketItemItemTester = class BucketItemItemTester {
    // First we need to get some users to work with from the identity service
    static before(done) {
        console.log('Testing bucketItem items');
        // This code should only be called if this test is run as a single test.  When run in the suite along with
        // product this code is run by the product test.
        // App.server.on('dbConnected', async () => {
        //     console.log('Got the dbConnected Signal, so now we can clear, and seed the database.' )
        //     await Cleanup.clearDatabase();
        //     console.log('About to seed the database');
        //     //await DatabaseBootstrap.seed();
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
    TestAbilityToCreateBucketItem() {
        return __awaiter(this, void 0, void 0, function* () {
            let bucketItem = {
                name: "Russia Is Amazing",
            };
            let response = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}`)
                .set(constants_1.CONST.TOKEN_HEADER_KEY, authentication_util_1.AuthUtil.userToken)
                .send(bucketItem);
            expect(response.status).to.equal(201);
            expect(response.body.name).to.be.equal(bucketItem.name);
            expect(response.body.owners[0].ownerId).to.be.equal(authentication_util_1.AuthUtil.decodedToken.userId);
            return;
        });
    }
    bucketItemList() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield api
                .get(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(200);
            expect(response.body.length).to.be.greaterThan(0); // List of all the bucketItems.
            return;
        });
    }
    getByIdWorking() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            let response = yield api
                .get(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('name');
            return;
        });
    }
    updateABucketItem() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            let bucketItemUpdate = {
                _id: `${createdId}`,
                name: "Daves Tulip",
            };
            let response = yield api
                .put(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketItemUpdate);
            expect(response.status).to.equal(202);
            expect(response.body.name).to.equal(bucketItemUpdate.name);
            return;
        });
    }
    updateABucketItemFailsWithAnotherUser() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            let bucketItemUpdate = {
                _id: `${createdId}`,
                name: "Daves Tulip",
            };
            let response = yield api
                .put(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken2)
                .send(bucketItemUpdate);
            // The server will respond with a 403 when the ownership check fails.    
            expect(response.status).to.equal(403);
            return;
        });
    }
    regularUsersCantCallClear() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}/clear`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send({});
            // The server will respond with a 403 when the ownership check fails.    
            expect(response.status).to.equal(403);
            return;
        });
    }
    AddALikeToABucketItem() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            let bucketItemUpdate = {};
            let response = yield api
                .patch(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.LIKES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketItemUpdate);
            console.dir(response.body);
            expect(response.status).to.equal(202);
            expect(response.body.likedBy.length).to.equal(1);
            expect(response.body.likedBy[0]).to.equal(authentication_util_1.AuthUtil.decodedToken.userId);
            // now we're checking the notifications.
            let response2 = yield api
                .get(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.NOTIFICATIONS}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response2.status).to.equal(200);
            expect(response2.body[0].bucketItem).to.equal(createdId);
            expect(response2.body[0].isRead).to.equal(false);
            return;
        });
    }
    AddLikeOnce() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            let bucketItemUpdate = {};
            let response2 = yield api
                .patch(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.LIKES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketItemUpdate);
            let response = yield api
                .patch(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.LIKES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketItemUpdate);
            expect(response.status).to.equal(202);
            expect(response.body.likedBy.length).to.equal(1);
            expect(response.body.likedBy[0]).to.equal(authentication_util_1.AuthUtil.decodedToken.userId);
            return;
        });
    }
    RemoveALikeFromABucketItem() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            let bucketItemUpdate = {};
            let response1 = yield api
                .patch(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.LIKES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketItemUpdate);
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.LIKES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketItemUpdate);
            //console.dir(response.body);
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('likedBy');
            expect(response.body.likedBy.length).to.equal(0);
            return;
        });
    }
    deleteABucketItem() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(200);
            expect(response.body.ItemRemovedId).to.be.equal(createdId);
            return;
        });
    }
    /*
        Here's the request, and how it's going to be shaped.
        {
            "bucketId": "123",
            "bucketItemId": "567"
        }
    */
    deleteABucketItemFromBucket() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            let createdBucketId = yield this.createBucket(authentication_util_1.AuthUtil.userToken);
            let singleBucketResponse = yield api
                .get(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/${createdBucketId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            let bucket = singleBucketResponse.body;
            bucket.bucketItems.push(createdId);
            let updateBucketResponse = yield api
                .patch(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/${createdBucketId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucket);
            let getBackSingle = yield api
                .get(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/${createdBucketId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(getBackSingle.status).to.equal(200);
            expect(getBackSingle.body.bucketItems.length).to.be.equal(1);
            console.dir(getBackSingle.body);
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.REMOVE_REFERENCES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send({
                "bucketId": createdBucketId,
                "bucketItemId": createdId
            });
            expect(response.status).to.equal(200);
            expect(response.body.ItemRemovedId).to.be.equal(createdId);
            let singleResponseForBucket = yield api
                .get(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/${createdBucketId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            //console.dir(singleResponseForBucket.body);
            expect(singleResponseForBucket.status).to.equal(200);
            expect(singleResponseForBucket.body.bucketItems.length).to.be.equal(0);
            return;
        });
    }
    onDeleteWithoutID404() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}/58f8c8caedf7292be80a90e4`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(404);
            return;
        });
    }
    onUpdateWithoutID404() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield api
                .put(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}/58f8c8caedf7292be80a90e4`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(404);
            return;
        });
    }
    deletingShouldAlsoDeleteTheImages() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            // Now we need to post a test image. 
            // './assets/testImage.jpg'
            let uploadResponse = yield api.post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.IMAGES}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .attach('file', './server/tests/assets/testImage.jpg');
            expect(uploadResponse.status).to.equal(200);
            // Now I want to check the response with regards to the images on the item.
            let singleResponse = yield api
                .get(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(singleResponse.body.images.length).to.be.greaterThan(0);
            expect(singleResponse.body.images[0].isActive).to.be.true;
            expect(singleResponse.body.images[0].variations.length).to.be.greaterThan(0);
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken);
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('ItemRemoved');
            expect(response.body).to.have.property('ItemRemovedId');
            expect(response.body.ItemRemovedId).to.be.equal(createdId);
            return;
        });
    }
    // Testing geo loc searching is working.  this will ensure we have the proper indexes in place.
    addGeoLocationData() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            // This should update this product to have a location near hearst tower
            let bucketItemUpdate = {
                _id: `${createdId}`,
                location: {
                    coordinates: [
                        -73.9888796,
                        40.7707493
                    ],
                    type: "Point"
                }
            };
            let response = yield api
                .put(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(bucketItemUpdate);
            expect(response.status).to.equal(202);
            let locationQuery = {
                "location": {
                    "$geoWithin": {
                        "$centerSphere": [
                            [
                                -73.98,
                                40.77
                            ],
                            2 / 3963.2 // this is 2 mile radius
                        ]
                    }
                }
            };
            // Now we're going to search for products in that location, and we should get this one back.
            let queryResponse = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.common.QUERY}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(locationQuery);
            expect(queryResponse.status).to.equal(200);
            expect(queryResponse.body.results).to.be.an('array');
            expect(queryResponse.body.results.length).to.equal(1); // make sure there is at least one product returned.
            return;
        });
    }
    AddComment() {
        return __awaiter(this, void 0, void 0, function* () {
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            const testComment = "This is a test comment";
            let addComment = {
                comment: testComment,
            };
            let response = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.COMMENTS}/${createdId}`)
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
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            const testComment = "This is a test comment";
            let addComment = {
                comment: testComment,
            };
            let responseAdd = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.COMMENTS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(addComment);
            const createdCommentId = responseAdd.body.comments[0]._id;
            const editedText = "Updated Text";
            let editComment = {
                comment: editedText,
                _id: createdCommentId,
            };
            let response = yield api
                .patch(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.COMMENTS}/${createdId}`)
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
            let createdId = yield this.createBucketItem(authentication_util_1.AuthUtil.userToken);
            const testComment = "This is a test comment";
            let addComment = {
                comment: testComment,
            };
            let responseAdd = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.COMMENTS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(addComment);
            const createdCommentId = responseAdd.body.comments[0]._id;
            let removeRequest = {
                _id: createdCommentId
            };
            let response = yield api
                .delete(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.COMMENTS}/${createdId}`)
                .set("x-access-token", authentication_util_1.AuthUtil.userToken)
                .send(removeRequest);
            expect(response.status).to.equal(200);
            expect(response.body.comments.length).to.equal(0);
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
    createBucketItem(authToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let bucketItem = {
                name: "Russia Is Amazing",
            };
            let createResponse = yield api
                .post(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}`)
                .set("x-access-token", authToken)
                .send(bucketItem);
            return createResponse.body._id;
        });
    }
};
__decorate([
    mocha_typescript_1.test('Just setting up a test for testing initialization')
], BucketItemItemTester.prototype, "initialize", null);
__decorate([
    mocha_typescript_1.test('creating new bucketItems should work')
], BucketItemItemTester.prototype, "TestAbilityToCreateBucketItem", null);
__decorate([
    mocha_typescript_1.test('should list all the bucketItems')
], BucketItemItemTester.prototype, "bucketItemList", null);
__decorate([
    mocha_typescript_1.test('making sure get bucketItem by id works')
], BucketItemItemTester.prototype, "getByIdWorking", null);
__decorate([
    mocha_typescript_1.test('it should update a bucketItem')
], BucketItemItemTester.prototype, "updateABucketItem", null);
__decorate([
    mocha_typescript_1.test('it should fail to update the bucketItem when tried by the user who doesnt own it')
], BucketItemItemTester.prototype, "updateABucketItemFailsWithAnotherUser", null);
__decorate([
    mocha_typescript_1.test('regular users cant call clear on the resource')
], BucketItemItemTester.prototype, "regularUsersCantCallClear", null);
__decorate([
    mocha_typescript_1.test('it should add a like to a bucketItem, and lodge a notification')
], BucketItemItemTester.prototype, "AddALikeToABucketItem", null);
__decorate([
    mocha_typescript_1.test('it should only add the like once')
], BucketItemItemTester.prototype, "AddLikeOnce", null);
__decorate([
    mocha_typescript_1.test('it should remove a like from a bucketItem')
], BucketItemItemTester.prototype, "RemoveALikeFromABucketItem", null);
__decorate([
    mocha_typescript_1.test('it should delete a bucketItem')
], BucketItemItemTester.prototype, "deleteABucketItem", null);
__decorate([
    mocha_typescript_1.test('it should delete a bucketItem off a bucket')
], BucketItemItemTester.prototype, "deleteABucketItemFromBucket", null);
__decorate([
    mocha_typescript_1.test('should return a 404 on delete when the ID isnt there')
], BucketItemItemTester.prototype, "onDeleteWithoutID404", null);
__decorate([
    mocha_typescript_1.test('should return a 404 on update when the ID isnt there')
], BucketItemItemTester.prototype, "onUpdateWithoutID404", null);
__decorate([
    mocha_typescript_1.test('create a bucketItem, add images, delete should delete images')
], BucketItemItemTester.prototype, "deletingShouldAlsoDeleteTheImages", null);
__decorate([
    mocha_typescript_1.test('geolocation searching working')
], BucketItemItemTester.prototype, "addGeoLocationData", null);
__decorate([
    mocha_typescript_1.test('it should add a comment to the item')
], BucketItemItemTester.prototype, "AddComment", null);
__decorate([
    mocha_typescript_1.test('it should edit a comment to the item')
], BucketItemItemTester.prototype, "EditComment", null);
__decorate([
    mocha_typescript_1.test('it should delete the comment from the item')
], BucketItemItemTester.prototype, "RemoveComment", null);
BucketItemItemTester = __decorate([
    mocha_typescript_1.suite('BucketItem Item Model -> ')
], BucketItemItemTester);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL3Rlc3RzL21vZGVscy9idWNrZXQtaXRlbS5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2QkFBNkI7QUFDN0IsdURBQStDO0FBQy9DLHVDQUF1QztBQUN2QywrQ0FBd0M7QUFFeEMscURBQXlDO0FBQ3pDLGdFQUFrRDtBQUNsRCw0REFBK0M7QUFHL0MsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxrQkFBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzNCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUc3QixJQUFNLG9CQUFvQixHQUExQjtJQUVJLHlFQUF5RTtJQUNsRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUk7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3hDLDBHQUEwRztRQUMxRyxnREFBZ0Q7UUFDaEQsNkNBQTZDO1FBQzdDLDhGQUE4RjtRQUM5RixxQ0FBcUM7UUFDckMsaURBQWlEO1FBQ2pELHdDQUF3QztRQUV4QywwREFBMEQ7UUFDMUQsNkZBQTZGO1FBQzdGLDRDQUE0QztRQUM1QyxtQ0FBbUM7UUFFbkMsY0FBYztRQUNkLE1BQU07UUFFTixJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFFTSxNQUFNLENBQU8sS0FBSzs7WUFDckIsTUFBTSwyQkFBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2xDLENBQUM7S0FBQTtJQUdZLFVBQVU7O1lBQ25CLE1BQU0sOEJBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM1QixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFB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QUMsK0JBQStCLENBQUM7NkRBV3JDO0FBVUQ7SUFEQyx1QkFBSSxDQUFDLDRDQUE0QyxDQUFDO3VFQWdEbEQ7QUFHRDtJQURDLHVCQUFJLENBQUMsc0RBQXNELENBQUM7Z0VBUTVEO0FBR0Q7SUFEQyx1QkFBSSxDQUFDLHNEQUFzRCxDQUFDO2dFQVE1RDtBQUdEO0lBREMsdUJBQUksQ0FBQyw4REFBOEQsQ0FBQzs2RUE4QnBFO0FBS0Q7SUFEQyx1QkFBSSxDQUFDLCtCQUErQixDQUFDOzhEQWlEckM7QUFJRDtJQURDLHVCQUFJLENBQUMscUNBQXFDLENBQUM7c0RBcUIzQztBQUdEO0lBREMsdUJBQUksQ0FBQyxzQ0FBc0MsQ0FBQzt1REFtQzVDO0FBR0Q7SUFEQyx1QkFBSSxDQUFDLDRDQUE0QyxDQUFDO3lEQTZCbEQ7QUFsZEMsb0JBQW9CO0lBRHpCLHdCQUFLLENBQUMsMkJBQTJCLENBQUM7R0FDN0Isb0JBQW9CLENBNmV6QiIsImZpbGUiOiJ0ZXN0cy9tb2RlbHMvYnVja2V0LWl0ZW0uc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNoYWkgZnJvbSAnY2hhaSc7XG5pbXBvcnQgeyBzdWl0ZSwgdGVzdCB9IGZyb20gXCJtb2NoYS10eXBlc2NyaXB0XCI7XG5pbXBvcnQgKiBhcyBzdXBlcnRlc3QgZnJvbSAnc3VwZXJ0ZXN0JztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSBcIi4uLy4uL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgSUJ1Y2tldCwgSUJ1Y2tldEl0ZW0sIElDb21tZW50YWJsZSB9IGZyb20gJy4uLy4uL21vZGVscyc7XG5pbXBvcnQgeyBBcHAgfSBmcm9tICcuLi8uLi9zZXJ2ZXItZW50cnknO1xuaW1wb3J0IHsgQXV0aFV0aWwgfSBmcm9tIFwiLi4vYXV0aGVudGljYXRpb24udXRpbFwiO1xuaW1wb3J0IHsgQ2xlYW51cCB9IGZyb20gXCIuLi9jbGVhbnVwLnV0aWwuc3BlY1wiO1xuXG5cbmNvbnN0IGFwaSA9IHN1cGVydGVzdC5hZ2VudChBcHAuc2VydmVyKTtcbmNvbnN0IG1vbmdvb3NlID0gcmVxdWlyZShcIm1vbmdvb3NlXCIpO1xuY29uc3QgZXhwZWN0ID0gY2hhaS5leHBlY3Q7XG5jb25zdCBzaG91bGQgPSBjaGFpLnNob3VsZCgpO1xuXG5Ac3VpdGUoJ0J1Y2tldEl0ZW0gSXRlbSBNb2RlbCAtPiAnKVxuY2xhc3MgQnVja2V0SXRlbUl0ZW1UZXN0ZXIge1xuXG4gICAgLy8gRmlyc3Qgd2UgbmVlZCB0byBnZXQgc29tZSB1c2VycyB0byB3b3JrIHdpdGggZnJvbSB0aGUgaWRlbnRpdHkgc2VydmljZVxuICAgIHB1YmxpYyBzdGF0aWMgYmVmb3JlKGRvbmUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Rlc3RpbmcgYnVja2V0SXRlbSBpdGVtcycpO1xuICAgICAgICAvLyBUaGlzIGNvZGUgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGlmIHRoaXMgdGVzdCBpcyBydW4gYXMgYSBzaW5nbGUgdGVzdC4gIFdoZW4gcnVuIGluIHRoZSBzdWl0ZSBhbG9uZyB3aXRoXG4gICAgICAgIC8vIHByb2R1Y3QgdGhpcyBjb2RlIGlzIHJ1biBieSB0aGUgcHJvZHVjdCB0ZXN0LlxuICAgICAgICAvLyBBcHAuc2VydmVyLm9uKCdkYkNvbm5lY3RlZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCdHb3QgdGhlIGRiQ29ubmVjdGVkIFNpZ25hbCwgc28gbm93IHdlIGNhbiBjbGVhciwgYW5kIHNlZWQgdGhlIGRhdGFiYXNlLicgKVxuICAgICAgICAvLyAgICAgYXdhaXQgQ2xlYW51cC5jbGVhckRhdGFiYXNlKCk7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnQWJvdXQgdG8gc2VlZCB0aGUgZGF0YWJhc2UnKTtcbiAgICAgICAgLy8gICAgIC8vYXdhaXQgRGF0YWJhc2VCb290c3RyYXAuc2VlZCgpO1xuXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnQWJvdXQgdG8gY3JlYXRlIGlkZW50aXR5IHRlc3QgZGF0YS4nKTtcbiAgICAgICAgLy8gICAgIC8vIFRoaXMgd2lsbCBjcmVhdGUsIDIgdXNlcnMsIGFuIG9yZ2FuaXphdGlvbiwgYW5kIGFkZCB0aGUgdXNlcnMgdG8gdGhlIGNvcnJlY3Qgcm9sZXMuXG4gICAgICAgIC8vICAgICBhd2FpdCBBdXRoVXRpbC5yZWdpc3RlclVzZXIoXCJkYXZlMlwiKTtcbiAgICAgICAgLy8gICAgIGF3YWl0IEF1dGhVdGlsLkluaXRpYWxpemUoKTtcblxuICAgICAgICAvLyAgICAgZG9uZSgpO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBhZnRlcigpIHtcbiAgICAgICAgYXdhaXQgQ2xlYW51cC5jbGVhckRhdGFiYXNlKCk7XG4gICAgfVxuXG4gICAgQHRlc3QoJ0p1c3Qgc2V0dGluZyB1cCBhIHRlc3QgZm9yIHRlc3RpbmcgaW5pdGlhbGl6YXRpb24nKVxuICAgIHB1YmxpYyBhc3luYyBpbml0aWFsaXplKCkge1xuICAgICAgICBhd2FpdCBBdXRoVXRpbC5Jbml0aWFsaXplKCk7XG4gICAgICAgIGV4cGVjdCgxKS50by5iZS5lcXVhbCgxKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdjcmVhdGluZyBuZXcgYnVja2V0SXRlbXMgc2hvdWxkIHdvcmsnKVxuICAgIHB1YmxpYyBhc3luYyBUZXN0QWJpbGl0eVRvQ3JlYXRlQnVja2V0SXRlbSgpIHtcbiAgICAgICAgbGV0IGJ1Y2tldEl0ZW06IElCdWNrZXRJdGVtID0ge1xuICAgICAgICAgICAgbmFtZTogXCJSdXNzaWEgSXMgQW1hemluZ1wiLFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVF9JVEVNU31gKVxuICAgICAgICAgICAgLnNldChDT05TVC5UT0tFTl9IRUFERVJfS0VZLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChidWNrZXRJdGVtKTtcblxuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDEpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5uYW1lKS50by5iZS5lcXVhbChidWNrZXRJdGVtLm5hbWUpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5vd25lcnNbMF0ub3duZXJJZCkudG8uYmUuZXF1YWwoQXV0aFV0aWwuZGVjb2RlZFRva2VuLnVzZXJJZCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBAdGVzdCgnc2hvdWxkIGxpc3QgYWxsIHRoZSBidWNrZXRJdGVtcycpXG4gICAgcHVibGljIGFzeW5jIGJ1Y2tldEl0ZW1MaXN0KCkge1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5nZXQoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRfSVRFTVN9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5zdGF0dXMpLnRvLmVxdWFsKDIwMCk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5ib2R5Lmxlbmd0aCkudG8uYmUuZ3JlYXRlclRoYW4oMCk7IC8vIExpc3Qgb2YgYWxsIHRoZSBidWNrZXRJdGVtcy5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdtYWtpbmcgc3VyZSBnZXQgYnVja2V0SXRlbSBieSBpZCB3b3JrcycpXG4gICAgcHVibGljIGFzeW5jIGdldEJ5SWRXb3JraW5nKCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXRJdGVtKEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAuZ2V0KGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUX0lURU1TfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkpLnRvLmhhdmUucHJvcGVydHkoJ25hbWUnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdpdCBzaG91bGQgdXBkYXRlIGEgYnVja2V0SXRlbScpXG4gICAgcHVibGljIGFzeW5jIHVwZGF0ZUFCdWNrZXRJdGVtKCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXRJdGVtKEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgbGV0IGJ1Y2tldEl0ZW1VcGRhdGUgPSB7XG4gICAgICAgICAgICBfaWQ6IGAke2NyZWF0ZWRJZH1gLFxuICAgICAgICAgICAgbmFtZTogXCJEYXZlcyBUdWxpcFwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnB1dChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVF9JVEVNU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChidWNrZXRJdGVtVXBkYXRlKTtcblxuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDIpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5uYW1lKS50by5lcXVhbChidWNrZXRJdGVtVXBkYXRlLm5hbWUpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ2l0IHNob3VsZCBmYWlsIHRvIHVwZGF0ZSB0aGUgYnVja2V0SXRlbSB3aGVuIHRyaWVkIGJ5IHRoZSB1c2VyIHdobyBkb2VzbnQgb3duIGl0JylcbiAgICBwdWJsaWMgYXN5bmMgdXBkYXRlQUJ1Y2tldEl0ZW1GYWlsc1dpdGhBbm90aGVyVXNlcigpIHtcbiAgICAgICAgbGV0IGNyZWF0ZWRJZCA9IGF3YWl0IHRoaXMuY3JlYXRlQnVja2V0SXRlbShBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGxldCBidWNrZXRJdGVtVXBkYXRlID0ge1xuICAgICAgICAgICAgX2lkOiBgJHtjcmVhdGVkSWR9YCxcbiAgICAgICAgICAgIG5hbWU6IFwiRGF2ZXMgVHVsaXBcIixcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5wdXQoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRfSVRFTVN9LyR7Y3JlYXRlZElkfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuMilcbiAgICAgICAgICAgIC5zZW5kKGJ1Y2tldEl0ZW1VcGRhdGUpO1xuXG4gICAgICAgIC8vIFRoZSBzZXJ2ZXIgd2lsbCByZXNwb25kIHdpdGggYSA0MDMgd2hlbiB0aGUgb3duZXJzaGlwIGNoZWNrIGZhaWxzLiAgICBcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoNDAzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdyZWd1bGFyIHVzZXJzIGNhbnQgY2FsbCBjbGVhciBvbiB0aGUgcmVzb3VyY2UnKVxuICAgIHB1YmxpYyBhc3luYyByZWd1bGFyVXNlcnNDYW50Q2FsbENsZWFyKCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXRJdGVtKEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAuZGVsZXRlKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUX0lURU1TfS9jbGVhcmApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKVxuICAgICAgICAgICAgLnNlbmQoe30pO1xuXG4gICAgICAgIC8vIFRoZSBzZXJ2ZXIgd2lsbCByZXNwb25kIHdpdGggYSA0MDMgd2hlbiB0aGUgb3duZXJzaGlwIGNoZWNrIGZhaWxzLiAgICBcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoNDAzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdpdCBzaG91bGQgYWRkIGEgbGlrZSB0byBhIGJ1Y2tldEl0ZW0sIGFuZCBsb2RnZSBhIG5vdGlmaWNhdGlvbicpXG4gICAgcHVibGljIGFzeW5jIEFkZEFMaWtlVG9BQnVja2V0SXRlbSgpIHtcbiAgICAgICAgbGV0IGNyZWF0ZWRJZCA9IGF3YWl0IHRoaXMuY3JlYXRlQnVja2V0SXRlbShBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGxldCBidWNrZXRJdGVtVXBkYXRlID0ge307XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucGF0Y2goYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRfSVRFTVN9JHtDT05TVC5lcC5MSUtFU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChidWNrZXRJdGVtVXBkYXRlKTtcblxuICAgICAgICBjb25zb2xlLmRpcihyZXNwb25zZS5ib2R5KTtcblxuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDIpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5saWtlZEJ5Lmxlbmd0aCkudG8uZXF1YWwoMSk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5ib2R5Lmxpa2VkQnlbMF0pLnRvLmVxdWFsKEF1dGhVdGlsLmRlY29kZWRUb2tlbi51c2VySWQpO1xuXG4gICAgICAgIC8vIG5vdyB3ZSdyZSBjaGVja2luZyB0aGUgbm90aWZpY2F0aW9ucy5cbiAgICAgICAgbGV0IHJlc3BvbnNlMiA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLmdldChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLk5PVElGSUNBVElPTlN9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGV4cGVjdChyZXNwb25zZTIuc3RhdHVzKS50by5lcXVhbCgyMDApO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UyLmJvZHlbMF0uYnVja2V0SXRlbSkudG8uZXF1YWwoY3JlYXRlZElkKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlMi5ib2R5WzBdLmlzUmVhZCkudG8uZXF1YWwoZmFsc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ2l0IHNob3VsZCBvbmx5IGFkZCB0aGUgbGlrZSBvbmNlJylcbiAgICBwdWJsaWMgYXN5bmMgQWRkTGlrZU9uY2UoKSB7XG4gICAgICAgIGxldCBjcmVhdGVkSWQgPSBhd2FpdCB0aGlzLmNyZWF0ZUJ1Y2tldEl0ZW0oQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICBsZXQgYnVja2V0SXRlbVVwZGF0ZSA9IHt9O1xuXG4gICAgICAgIGxldCByZXNwb25zZTIgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5wYXRjaChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVF9JVEVNU30ke0NPTlNULmVwLkxJS0VTfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbilcbiAgICAgICAgICAgIC5zZW5kKGJ1Y2tldEl0ZW1VcGRhdGUpO1xuXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBhdGNoKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUX0lURU1TfSR7Q09OU1QuZXAuTElLRVN9LyR7Y3JlYXRlZElkfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKVxuICAgICAgICAgICAgLnNlbmQoYnVja2V0SXRlbVVwZGF0ZSk7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAyKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkubGlrZWRCeS5sZW5ndGgpLnRvLmVxdWFsKDEpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5saWtlZEJ5WzBdKS50by5lcXVhbChBdXRoVXRpbC5kZWNvZGVkVG9rZW4udXNlcklkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdpdCBzaG91bGQgcmVtb3ZlIGEgbGlrZSBmcm9tIGEgYnVja2V0SXRlbScpXG4gICAgcHVibGljIGFzeW5jIFJlbW92ZUFMaWtlRnJvbUFCdWNrZXRJdGVtKCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXRJdGVtKEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgbGV0IGJ1Y2tldEl0ZW1VcGRhdGUgPSB7fTtcblxuICAgICAgICBsZXQgcmVzcG9uc2UxID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucGF0Y2goYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRfSVRFTVN9JHtDT05TVC5lcC5MSUtFU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChidWNrZXRJdGVtVXBkYXRlKTtcblxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5kZWxldGUoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRfSVRFTVN9JHtDT05TVC5lcC5MSUtFU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChidWNrZXRJdGVtVXBkYXRlKTtcblxuICAgICAgICAvL2NvbnNvbGUuZGlyKHJlc3BvbnNlLmJvZHkpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDApO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keSkudG8uaGF2ZS5wcm9wZXJ0eSgnbGlrZWRCeScpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5saWtlZEJ5Lmxlbmd0aCkudG8uZXF1YWwoMCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBAdGVzdCgnaXQgc2hvdWxkIGRlbGV0ZSBhIGJ1Y2tldEl0ZW0nKVxuICAgIHB1YmxpYyBhc3luYyBkZWxldGVBQnVja2V0SXRlbSgpIHtcbiAgICAgICAgbGV0IGNyZWF0ZWRJZCA9IGF3YWl0IHRoaXMuY3JlYXRlQnVja2V0SXRlbShBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLmRlbGV0ZShgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVF9JVEVNU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5zdGF0dXMpLnRvLmVxdWFsKDIwMCk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5ib2R5Lkl0ZW1SZW1vdmVkSWQpLnRvLmJlLmVxdWFsKGNyZWF0ZWRJZCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAgICBIZXJlJ3MgdGhlIHJlcXVlc3QsIGFuZCBob3cgaXQncyBnb2luZyB0byBiZSBzaGFwZWQuIFxuICAgICAgICB7XG4gICAgICAgICAgICBcImJ1Y2tldElkXCI6IFwiMTIzXCIsXG4gICAgICAgICAgICBcImJ1Y2tldEl0ZW1JZFwiOiBcIjU2N1wiIFxuICAgICAgICB9XG4gICAgKi9cbiAgICBAdGVzdCgnaXQgc2hvdWxkIGRlbGV0ZSBhIGJ1Y2tldEl0ZW0gb2ZmIGEgYnVja2V0JylcbiAgICBwdWJsaWMgYXN5bmMgZGVsZXRlQUJ1Y2tldEl0ZW1Gcm9tQnVja2V0KCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXRJdGVtKEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgbGV0IGNyZWF0ZWRCdWNrZXRJZCA9IGF3YWl0IHRoaXMuY3JlYXRlQnVja2V0KEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgbGV0IHNpbmdsZUJ1Y2tldFJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAuZ2V0KGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU30vJHtjcmVhdGVkQnVja2V0SWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGxldCBidWNrZXQgPSBzaW5nbGVCdWNrZXRSZXNwb25zZS5ib2R5IGFzIElCdWNrZXQ7XG5cbiAgICAgICAgKGJ1Y2tldC5idWNrZXRJdGVtcyBhcyBzdHJpbmdbXSkucHVzaChjcmVhdGVkSWQpO1xuXG4gICAgICAgIGxldCB1cGRhdGVCdWNrZXRSZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBhdGNoKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU30vJHtjcmVhdGVkQnVja2V0SWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChidWNrZXQpO1xuXG4gICAgICAgIGxldCBnZXRCYWNrU2luZ2xlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAuZ2V0KGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUU30vJHtjcmVhdGVkQnVja2V0SWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGV4cGVjdChnZXRCYWNrU2luZ2xlLnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KGdldEJhY2tTaW5nbGUuYm9keS5idWNrZXRJdGVtcy5sZW5ndGgpLnRvLmJlLmVxdWFsKDEpO1xuXG4gICAgICAgIGNvbnNvbGUuZGlyKGdldEJhY2tTaW5nbGUuYm9keSk7XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAuZGVsZXRlKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUX0lURU1TfSR7Q09OU1QuZXAuUkVNT1ZFX1JFRkVSRU5DRVN9LyR7Y3JlYXRlZElkfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKVxuICAgICAgICAgICAgLnNlbmQoe1xuICAgICAgICAgICAgICAgIFwiYnVja2V0SWRcIjogY3JlYXRlZEJ1Y2tldElkLFxuICAgICAgICAgICAgICAgIFwiYnVja2V0SXRlbUlkXCI6IGNyZWF0ZWRJZFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkuSXRlbVJlbW92ZWRJZCkudG8uYmUuZXF1YWwoY3JlYXRlZElkKTtcblxuICAgICAgICBsZXQgc2luZ2xlUmVzcG9uc2VGb3JCdWNrZXQgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5nZXQoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRTfS8ke2NyZWF0ZWRCdWNrZXRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbik7XG4gICAgICAgIC8vY29uc29sZS5kaXIoc2luZ2xlUmVzcG9uc2VGb3JCdWNrZXQuYm9keSk7XG5cbiAgICAgICAgZXhwZWN0KHNpbmdsZVJlc3BvbnNlRm9yQnVja2V0LnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KHNpbmdsZVJlc3BvbnNlRm9yQnVja2V0LmJvZHkuYnVja2V0SXRlbXMubGVuZ3RoKS50by5iZS5lcXVhbCgwKTtcblxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ3Nob3VsZCByZXR1cm4gYSA0MDQgb24gZGVsZXRlIHdoZW4gdGhlIElEIGlzbnQgdGhlcmUnKVxuICAgIHB1YmxpYyBhc3luYyBvbkRlbGV0ZVdpdGhvdXRJRDQwNCgpIHtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAuZGVsZXRlKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUX0lURU1TfS81OGY4YzhjYWVkZjcyOTJiZTgwYTkwZTRgKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoNDA0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdzaG91bGQgcmV0dXJuIGEgNDA0IG9uIHVwZGF0ZSB3aGVuIHRoZSBJRCBpc250IHRoZXJlJylcbiAgICBwdWJsaWMgYXN5bmMgb25VcGRhdGVXaXRob3V0SUQ0MDQoKSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnB1dChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVF9JVEVNU30vNThmOGM4Y2FlZGY3MjkyYmU4MGE5MGU0YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5zdGF0dXMpLnRvLmVxdWFsKDQwNCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBAdGVzdCgnY3JlYXRlIGEgYnVja2V0SXRlbSwgYWRkIGltYWdlcywgZGVsZXRlIHNob3VsZCBkZWxldGUgaW1hZ2VzJylcbiAgICBwdWJsaWMgYXN5bmMgZGVsZXRpbmdTaG91bGRBbHNvRGVsZXRlVGhlSW1hZ2VzKCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXRJdGVtKEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgLy8gTm93IHdlIG5lZWQgdG8gcG9zdCBhIHRlc3QgaW1hZ2UuIFxuICAgICAgICAvLyAnLi9hc3NldHMvdGVzdEltYWdlLmpwZydcbiAgICAgICAgbGV0IHVwbG9hZFJlc3BvbnNlID0gYXdhaXQgYXBpLnBvc3QoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRfSVRFTVN9JHtDT05TVC5lcC5JTUFHRVN9LyR7Y3JlYXRlZElkfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKVxuICAgICAgICAgICAgLmF0dGFjaCgnZmlsZScsICcuL3NlcnZlci90ZXN0cy9hc3NldHMvdGVzdEltYWdlLmpwZycpO1xuXG4gICAgICAgIGV4cGVjdCh1cGxvYWRSZXNwb25zZS5zdGF0dXMpLnRvLmVxdWFsKDIwMCk7XG5cbiAgICAgICAgLy8gTm93IEkgd2FudCB0byBjaGVjayB0aGUgcmVzcG9uc2Ugd2l0aCByZWdhcmRzIHRvIHRoZSBpbWFnZXMgb24gdGhlIGl0ZW0uXG4gICAgICAgIGxldCBzaW5nbGVSZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLmdldChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVF9JVEVNU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pO1xuXG4gICAgICAgIGV4cGVjdCgoc2luZ2xlUmVzcG9uc2UuYm9keSBhcyBJQnVja2V0SXRlbSkuaW1hZ2VzLmxlbmd0aCkudG8uYmUuZ3JlYXRlclRoYW4oMCk7XG4gICAgICAgIGV4cGVjdCgoc2luZ2xlUmVzcG9uc2UuYm9keSBhcyBJQnVja2V0SXRlbSkuaW1hZ2VzWzBdLmlzQWN0aXZlKS50by5iZS50cnVlO1xuICAgICAgICBleHBlY3QoKHNpbmdsZVJlc3BvbnNlLmJvZHkgYXMgSUJ1Y2tldEl0ZW0pLmltYWdlc1swXS52YXJpYXRpb25zLmxlbmd0aCkudG8uYmUuZ3JlYXRlclRoYW4oMCk7XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAuZGVsZXRlKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUX0lURU1TfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkpLnRvLmhhdmUucHJvcGVydHkoJ0l0ZW1SZW1vdmVkJyk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5ib2R5KS50by5oYXZlLnByb3BlcnR5KCdJdGVtUmVtb3ZlZElkJyk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5ib2R5Lkl0ZW1SZW1vdmVkSWQpLnRvLmJlLmVxdWFsKGNyZWF0ZWRJZCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cblxuICAgIC8vIFRlc3RpbmcgZ2VvIGxvYyBzZWFyY2hpbmcgaXMgd29ya2luZy4gIHRoaXMgd2lsbCBlbnN1cmUgd2UgaGF2ZSB0aGUgcHJvcGVyIGluZGV4ZXMgaW4gcGxhY2UuXG4gICAgQHRlc3QoJ2dlb2xvY2F0aW9uIHNlYXJjaGluZyB3b3JraW5nJylcbiAgICBwdWJsaWMgYXN5bmMgYWRkR2VvTG9jYXRpb25EYXRhKCkge1xuXG4gICAgICAgIGxldCBjcmVhdGVkSWQgPSBhd2FpdCB0aGlzLmNyZWF0ZUJ1Y2tldEl0ZW0oQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICAvLyBUaGlzIHNob3VsZCB1cGRhdGUgdGhpcyBwcm9kdWN0IHRvIGhhdmUgYSBsb2NhdGlvbiBuZWFyIGhlYXJzdCB0b3dlclxuICAgICAgICBsZXQgYnVja2V0SXRlbVVwZGF0ZSA9IHtcbiAgICAgICAgICAgIF9pZDogYCR7Y3JlYXRlZElkfWAsXG4gICAgICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgIC03My45ODg4Nzk2LFxuICAgICAgICAgICAgICAgICAgICA0MC43NzA3NDkzXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBvaW50XCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhcGlcbiAgICAgICAgICAgIC5wdXQoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRfSVRFTVN9LyR7Y3JlYXRlZElkfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKVxuICAgICAgICAgICAgLnNlbmQoYnVja2V0SXRlbVVwZGF0ZSk7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAyKTtcblxuICAgICAgICBsZXQgbG9jYXRpb25RdWVyeSA9IHtcbiAgICAgICAgICAgIFwibG9jYXRpb25cIjoge1xuICAgICAgICAgICAgICAgIFwiJGdlb1dpdGhpblwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiJGNlbnRlclNwaGVyZVwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLTczLjk4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDQwLjc3XG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgMiAvIDM5NjMuMiAvLyB0aGlzIGlzIDIgbWlsZSByYWRpdXNcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdyB3ZSdyZSBnb2luZyB0byBzZWFyY2ggZm9yIHByb2R1Y3RzIGluIHRoYXQgbG9jYXRpb24sIGFuZCB3ZSBzaG91bGQgZ2V0IHRoaXMgb25lIGJhY2suXG4gICAgICAgIGxldCBxdWVyeVJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVF9JVEVNU30ke0NPTlNULmVwLmNvbW1vbi5RVUVSWX1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbilcbiAgICAgICAgICAgIC5zZW5kKGxvY2F0aW9uUXVlcnkpO1xuXG4gICAgICAgIGV4cGVjdChxdWVyeVJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KHF1ZXJ5UmVzcG9uc2UuYm9keS5yZXN1bHRzKS50by5iZS5hbignYXJyYXknKTtcbiAgICAgICAgZXhwZWN0KHF1ZXJ5UmVzcG9uc2UuYm9keS5yZXN1bHRzLmxlbmd0aCkudG8uZXF1YWwoMSk7IC8vIG1ha2Ugc3VyZSB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgcHJvZHVjdCByZXR1cm5lZC5cblxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG5cbiAgICBAdGVzdCgnaXQgc2hvdWxkIGFkZCBhIGNvbW1lbnQgdG8gdGhlIGl0ZW0nKVxuICAgIHB1YmxpYyBhc3luYyBBZGRDb21tZW50KCkge1xuICAgICAgICBsZXQgY3JlYXRlZElkID0gYXdhaXQgdGhpcy5jcmVhdGVCdWNrZXRJdGVtKEF1dGhVdGlsLnVzZXJUb2tlbik7XG5cbiAgICAgICAgY29uc3QgdGVzdENvbW1lbnQgPSBcIlRoaXMgaXMgYSB0ZXN0IGNvbW1lbnRcIjtcblxuICAgICAgICBsZXQgYWRkQ29tbWVudCA9IHtcbiAgICAgICAgICAgIGNvbW1lbnQ6IHRlc3RDb21tZW50LFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBvc3QoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRfSVRFTVN9JHtDT05TVC5lcC5DT01NRU5UU30vJHtjcmVhdGVkSWR9YClcbiAgICAgICAgICAgIC5zZXQoXCJ4LWFjY2Vzcy10b2tlblwiLCBBdXRoVXRpbC51c2VyVG9rZW4pXG4gICAgICAgICAgICAuc2VuZChhZGRDb21tZW50KTtcblxuICAgICAgICBjb25zb2xlLmRpcihyZXNwb25zZS5ib2R5LmNvbW1lbnRzKTtcblxuICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzKS50by5lcXVhbCgyMDIpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5jb21tZW50cy5sZW5ndGgpLnRvLmVxdWFsKDEpO1xuICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keS5jb21tZW50c1swXS5jb21tZW50KS50by5lcXVhbCh0ZXN0Q29tbWVudCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBAdGVzdCgnaXQgc2hvdWxkIGVkaXQgYSBjb21tZW50IHRvIHRoZSBpdGVtJylcbiAgICBwdWJsaWMgYXN5bmMgRWRpdENvbW1lbnQoKSB7XG4gICAgICAgIGxldCBjcmVhdGVkSWQgPSBhd2FpdCB0aGlzLmNyZWF0ZUJ1Y2tldEl0ZW0oQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICBjb25zdCB0ZXN0Q29tbWVudCA9IFwiVGhpcyBpcyBhIHRlc3QgY29tbWVudFwiO1xuXG4gICAgICAgIGxldCBhZGRDb21tZW50ID0ge1xuICAgICAgICAgICAgY29tbWVudDogdGVzdENvbW1lbnQsXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlQWRkID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVF9JVEVNU30ke0NPTlNULmVwLkNPTU1FTlRTfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbilcbiAgICAgICAgICAgIC5zZW5kKGFkZENvbW1lbnQpO1xuXG4gICAgICAgIGNvbnN0IGNyZWF0ZWRDb21tZW50SWQgPSAocmVzcG9uc2VBZGQuYm9keSBhcyBJQ29tbWVudGFibGUpLmNvbW1lbnRzWzBdLl9pZDtcblxuICAgICAgICBjb25zdCBlZGl0ZWRUZXh0ID0gXCJVcGRhdGVkIFRleHRcIjtcblxuICAgICAgICBsZXQgZWRpdENvbW1lbnQgPSB7XG4gICAgICAgICAgICBjb21tZW50OiBlZGl0ZWRUZXh0LFxuICAgICAgICAgICAgX2lkOiBjcmVhdGVkQ29tbWVudElkLFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBhdGNoKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUX0lURU1TfSR7Q09OU1QuZXAuQ09NTUVOVFN9LyR7Y3JlYXRlZElkfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKVxuICAgICAgICAgICAgLnNlbmQoZWRpdENvbW1lbnQpO1xuXG4gICAgICAgIGNvbnNvbGUuZGlyKHJlc3BvbnNlLmJvZHkuY29tbWVudHMpO1xuXG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5zdGF0dXMpLnRvLmVxdWFsKDIwMCk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5ib2R5LmNvbW1lbnRzLmxlbmd0aCkudG8uZXF1YWwoMSk7XG4gICAgICAgIGV4cGVjdChyZXNwb25zZS5ib2R5LmNvbW1lbnRzWzBdLmNvbW1lbnQpLnRvLmVxdWFsKGVkaXRlZFRleHQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQHRlc3QoJ2l0IHNob3VsZCBkZWxldGUgdGhlIGNvbW1lbnQgZnJvbSB0aGUgaXRlbScpXG4gICAgcHVibGljIGFzeW5jIFJlbW92ZUNvbW1lbnQoKSB7XG4gICAgICAgIGxldCBjcmVhdGVkSWQgPSBhd2FpdCB0aGlzLmNyZWF0ZUJ1Y2tldEl0ZW0oQXV0aFV0aWwudXNlclRva2VuKTtcblxuICAgICAgICBjb25zdCB0ZXN0Q29tbWVudCA9IFwiVGhpcyBpcyBhIHRlc3QgY29tbWVudFwiO1xuXG4gICAgICAgIGxldCBhZGRDb21tZW50ID0ge1xuICAgICAgICAgICAgY29tbWVudDogdGVzdENvbW1lbnQsXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlQWRkID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVF9JVEVNU30ke0NPTlNULmVwLkNPTU1FTlRTfS8ke2NyZWF0ZWRJZH1gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIEF1dGhVdGlsLnVzZXJUb2tlbilcbiAgICAgICAgICAgIC5zZW5kKGFkZENvbW1lbnQpO1xuXG4gICAgICAgIGNvbnN0IGNyZWF0ZWRDb21tZW50SWQgPSAocmVzcG9uc2VBZGQuYm9keSBhcyBJQ29tbWVudGFibGUpLmNvbW1lbnRzWzBdLl9pZDtcblxuICAgICAgICBsZXQgcmVtb3ZlUmVxdWVzdCA9IHtcbiAgICAgICAgICAgIF9pZDogY3JlYXRlZENvbW1lbnRJZFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAuZGVsZXRlKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUX0lURU1TfSR7Q09OU1QuZXAuQ09NTUVOVFN9LyR7Y3JlYXRlZElkfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgQXV0aFV0aWwudXNlclRva2VuKVxuICAgICAgICAgICAgLnNlbmQocmVtb3ZlUmVxdWVzdCk7XG5cbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1cykudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkuY29tbWVudHMubGVuZ3RoKS50by5lcXVhbCgwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlQnVja2V0KGF1dGhUb2tlbjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgbGV0IGJ1Y2tldDogSUJ1Y2tldCA9IHtcbiAgICAgICAgICAgIG5hbWU6IFwiUnVzc2lhIElzIEFtYXppbmdcIixcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjcmVhdGVSZXNwb25zZSA9IGF3YWl0IGFwaVxuICAgICAgICAgICAgLnBvc3QoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRTfWApXG4gICAgICAgICAgICAuc2V0KFwieC1hY2Nlc3MtdG9rZW5cIiwgYXV0aFRva2VuKVxuICAgICAgICAgICAgLnNlbmQoYnVja2V0KTtcblxuICAgICAgICByZXR1cm4gY3JlYXRlUmVzcG9uc2UuYm9keS5faWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVCdWNrZXRJdGVtKGF1dGhUb2tlbjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgbGV0IGJ1Y2tldEl0ZW06IElCdWNrZXRJdGVtID0ge1xuICAgICAgICAgICAgbmFtZTogXCJSdXNzaWEgSXMgQW1hemluZ1wiLFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNyZWF0ZVJlc3BvbnNlID0gYXdhaXQgYXBpXG4gICAgICAgICAgICAucG9zdChgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVF9JVEVNU31gKVxuICAgICAgICAgICAgLnNldChcIngtYWNjZXNzLXRva2VuXCIsIGF1dGhUb2tlbilcbiAgICAgICAgICAgIC5zZW5kKGJ1Y2tldEl0ZW0pO1xuXG4gICAgICAgIHJldHVybiBjcmVhdGVSZXNwb25zZS5ib2R5Ll9pZDtcbiAgICB9XG59XG4iXX0=
