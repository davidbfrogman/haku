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
const cleanup_util_spec_1 = require("../cleanup.util.spec");
const mocha_typescript_1 = require("mocha-typescript");
const bijection_encoder_1 = require("../../utils/bijection-encoder");
const supertest = require("supertest");
const chai = require("chai");
const api = supertest.agent(server_entry_1.App.server);
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();
let IdEncoderTest = class IdEncoderTest {
    // First we need to get some users to work with from the identity service
    static before(done) {
        console.log('Testing ID encoding and decoding');
        done();
    }
    // This guy doesn't do anything with the database, but the next test is expecting a clean database.
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
    idEncoderTest() {
        return __awaiter(this, void 0, void 0, function* () {
            for (var index = 10000000; index < 10005000; index++) {
                expect(bijection_encoder_1.BijectionEncoder.decode(bijection_encoder_1.BijectionEncoder.encode(index))).to.equal(index);
            }
        });
    }
};
__decorate([
    mocha_typescript_1.test('Just setting up a test for testing initialization')
], IdEncoderTest.prototype, "initialize", null);
__decorate([
    mocha_typescript_1.test('Making sure nothing has gone wrong with our order id encoder')
], IdEncoderTest.prototype, "idEncoderTest", null);
IdEncoderTest = __decorate([
    mocha_typescript_1.suite('ID encoder test')
], IdEncoderTest);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3Rlc3RzL21vZGVscy9iaWplY3Rpb24tZW5jb2Rlci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxxREFBaUQ7QUFDakQsNERBQStDO0FBQy9DLHVEQUErQztBQUUvQyxxRUFBaUU7QUFFakUsdUNBQXVDO0FBQ3ZDLDZCQUE2QjtBQUc3QixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLGtCQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDM0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRzdCLElBQU0sYUFBYSxHQUFuQjtJQUVJLHlFQUF5RTtJQUNsRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUk7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ2hELElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUVELG1HQUFtRztJQUM1RixNQUFNLENBQU8sS0FBSzs7WUFDckIsTUFBTSwyQkFBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2xDLENBQUM7S0FBQTtJQUdZLFVBQVU7O1lBQ25CLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixNQUFNLENBQUM7UUFDWCxDQUFDO0tBQUE7SUFHWSxhQUFhOztZQUN0QixHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxRQUFRLEVBQUUsS0FBSyxHQUFHLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUNuRCxNQUFNLENBQUMsb0NBQWdCLENBQUMsTUFBTSxDQUFDLG9DQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwRixDQUFDO1FBQ0wsQ0FBQztLQUFBO0NBQ0osQ0FBQTtBQVhHO0lBREMsdUJBQUksQ0FBQyxtREFBbUQsQ0FBQzsrQ0FJekQ7QUFHRDtJQURDLHVCQUFJLENBQUMsOERBQThELENBQUM7a0RBS3BFO0FBeEJDLGFBQWE7SUFEbEIsd0JBQUssQ0FBQyxpQkFBaUIsQ0FBQztHQUNuQixhQUFhLENBeUJsQiIsImZpbGUiOiJ0ZXN0cy9tb2RlbHMvYmlqZWN0aW9uLWVuY29kZXIuc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFiYXNlIH0gZnJvbSAnLi4vLi4vY29uZmlnL2RhdGFiYXNlL2RhdGFiYXNlJztcbmltcG9ydCB7IEFwcCwgc2VydmVyIH0gZnJvbSAnLi4vLi4vc2VydmVyLWVudHJ5JztcbmltcG9ydCB7IENsZWFudXAgfSBmcm9tIFwiLi4vY2xlYW51cC51dGlsLnNwZWNcIjtcbmltcG9ydCB7IHN1aXRlLCB0ZXN0IH0gZnJvbSBcIm1vY2hhLXR5cGVzY3JpcHRcIjtcbmltcG9ydCB7IERhdGFiYXNlQm9vdHN0cmFwIH0gZnJvbSBcIi4uLy4uL2NvbmZpZy9kYXRhYmFzZS9kYXRhYmFzZS1ib290c3RyYXBcIjtcbmltcG9ydCB7IEJpamVjdGlvbkVuY29kZXIgfSBmcm9tICcuLi8uLi91dGlscy9iaWplY3Rpb24tZW5jb2Rlcic7XG5cbmltcG9ydCAqIGFzIHN1cGVydGVzdCBmcm9tICdzdXBlcnRlc3QnO1xuaW1wb3J0ICogYXMgY2hhaSBmcm9tICdjaGFpJztcbmltcG9ydCB7IElkZW50aXR5QXBpU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2luZGV4JztcblxuY29uc3QgYXBpID0gc3VwZXJ0ZXN0LmFnZW50KEFwcC5zZXJ2ZXIpO1xuY29uc3QgbW9uZ29vc2UgPSByZXF1aXJlKFwibW9uZ29vc2VcIik7XG5jb25zdCBleHBlY3QgPSBjaGFpLmV4cGVjdDtcbmNvbnN0IHNob3VsZCA9IGNoYWkuc2hvdWxkKCk7XG5cbkBzdWl0ZSgnSUQgZW5jb2RlciB0ZXN0JylcbmNsYXNzIElkRW5jb2RlclRlc3Qge1xuXG4gICAgLy8gRmlyc3Qgd2UgbmVlZCB0byBnZXQgc29tZSB1c2VycyB0byB3b3JrIHdpdGggZnJvbSB0aGUgaWRlbnRpdHkgc2VydmljZVxuICAgIHB1YmxpYyBzdGF0aWMgYmVmb3JlKGRvbmUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Rlc3RpbmcgSUQgZW5jb2RpbmcgYW5kIGRlY29kaW5nJyk7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGd1eSBkb2Vzbid0IGRvIGFueXRoaW5nIHdpdGggdGhlIGRhdGFiYXNlLCBidXQgdGhlIG5leHQgdGVzdCBpcyBleHBlY3RpbmcgYSBjbGVhbiBkYXRhYmFzZS5cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGFmdGVyKCkge1xuICAgICAgICBhd2FpdCBDbGVhbnVwLmNsZWFyRGF0YWJhc2UoKTtcbiAgICB9XG5cbiAgICBAdGVzdCgnSnVzdCBzZXR0aW5nIHVwIGEgdGVzdCBmb3IgdGVzdGluZyBpbml0aWFsaXphdGlvbicpXG4gICAgcHVibGljIGFzeW5jIGluaXRpYWxpemUoKSB7XG4gICAgICAgIGV4cGVjdCgxKS50by5iZS5lcXVhbCgxKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEB0ZXN0KCdNYWtpbmcgc3VyZSBub3RoaW5nIGhhcyBnb25lIHdyb25nIHdpdGggb3VyIG9yZGVyIGlkIGVuY29kZXInKVxuICAgIHB1YmxpYyBhc3luYyBpZEVuY29kZXJUZXN0KCkge1xuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDEwMDAwMDAwOyBpbmRleCA8IDEwMDA1MDAwOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBleHBlY3QoQmlqZWN0aW9uRW5jb2Rlci5kZWNvZGUoQmlqZWN0aW9uRW5jb2Rlci5lbmNvZGUoaW5kZXgpKSkudG8uZXF1YWwoaW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19
