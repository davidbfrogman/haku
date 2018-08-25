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
const express_1 = require("express");
const _1 = require("../controllers/");
const base_router_1 = require("./base/base.router");
const constants_1 = require("../constants");
const enumerations_1 = require("../enumerations");
const enums = require("../enumerations");
class BucketRouter extends base_router_1.BaseRouter {
    constructor() {
        super();
        this.router = express_1.Router();
        this.controller = new _1.BucketController();
        this.imageStyles = [{
                imageType: enums.ImageType.thumbnail, height: 150, width: 150,
            },
            {
                imageType: enums.ImageType.medium, height: 500,
            },
            {
                imageType: enums.ImageType.large, height: 1024,
            }];
        this.resource = constants_1.CONST.ep.BUCKETS;
    }
    ImageHandler(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // We're basically injecting a controller, and a set of image styles in the router.
            yield _1.BucketController.imageTransformer(request, response, next, this.controller, this.imageStyles);
        });
    }
    getRouter() {
        return super.getRouter()
            .patch(`${this.resource}${constants_1.CONST.ep.LIKES}/:id`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield _1.BucketController.addLike(request, response, next, this.controller, enumerations_1.NotificationType.BucketLiked);
        }))
            .delete(`${this.resource}${constants_1.CONST.ep.LIKES}/:id`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield _1.BucketController.removeLike(request, response, next, this.controller);
        }))
            .post(`${this.resource}${constants_1.CONST.ep.COMMENTS}/:id`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield _1.BucketController.addComment(request, response, next, this.controller, enumerations_1.NotificationType.BucketCommentAded);
        }))
            .delete(`${this.resource}${constants_1.CONST.ep.COMMENTS}/:id`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield _1.BucketController.removeComment(request, response, next, this.controller);
        }))
            .patch(`${this.resource}${constants_1.CONST.ep.COMMENTS}/:id`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield _1.BucketController.editComment(request, response, next, this.controller);
        }))
            .delete(`${this.resource}${constants_1.CONST.ep.IMAGES}/:id/:imageId`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield this.controller.deleteImage(request, response, next, this.controller);
        }));
    }
}
exports.BucketRouter = BucketRouter;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL3JvdXRlcnMvYnVja2V0LnJvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEscUNBQWlDO0FBQ2pDLHNDQUFtRDtBQUduRCxvREFBZ0Q7QUFDaEQsNENBQXFDO0FBQ3JDLGtEQUFtRDtBQUNuRCx5Q0FBeUM7QUFHekMsa0JBQTBCLFNBQVEsd0JBQVU7SUFLeEM7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUxMLFdBQU0sR0FBVyxnQkFBTSxFQUFFLENBQUM7UUFDMUIsZUFBVSxHQUFHLElBQUksbUJBQWdCLEVBQUUsQ0FBQztRQVFwQyxnQkFBVyxHQUFHLENBQUM7Z0JBQ2xCLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHO2FBQ2hFO1lBQ0Q7Z0JBQ0ksU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHO2FBQ2pEO1lBQ0Q7Z0JBQ0ksU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJO2FBQ2pELENBQUMsQ0FBQztRQVhDLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO0lBQ3JDLENBQUM7SUFZWSxZQUFZLENBQUMsT0FBZ0IsRUFBRSxRQUFrQixFQUFFLElBQWtCOztZQUM5RSxtRkFBbUY7WUFDbkYsTUFBTSxtQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRyxDQUFDO0tBQUE7SUFFTSxTQUFTO1FBQ1osTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7YUFDdkIsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLE1BQU0sRUFBRSxDQUFPLE9BQWdCLEVBQUUsUUFBa0IsRUFBRSxJQUFrQixFQUFFLEVBQUU7WUFDL0csTUFBTSxtQkFBZ0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSwrQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4RyxDQUFDLENBQUEsQ0FBQzthQUNELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxNQUFNLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ2hILE1BQU0sbUJBQWdCLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM3RSxDQUFDLENBQUEsQ0FBQzthQUNELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxNQUFNLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ2pILE1BQU0sbUJBQWdCLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsK0JBQWdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNqSCxDQUFDLENBQUEsQ0FBQzthQUNELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxNQUFNLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ25ILE1BQU0sbUJBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRixDQUFDLENBQUEsQ0FBQzthQUNELEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxNQUFNLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ2xILE1BQU0sbUJBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RSxDQUFDLENBQUEsQ0FBQzthQUNELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxlQUFlLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQzFILE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hGLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUE5Q0Qsb0NBOENDIiwiZmlsZSI6InJvdXRlcnMvYnVja2V0LnJvdXRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJvdXRlciB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgQnVja2V0Q29udHJvbGxlciB9IGZyb20gJy4uL2NvbnRyb2xsZXJzLyc7XG5pbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSwgUmVxdWVzdEhhbmRsZXIsIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBSZXF1ZXN0SGFuZGxlclBhcmFtcywgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcy1zZXJ2ZS1zdGF0aWMtY29yZSc7XG5pbXBvcnQgeyBCYXNlUm91dGVyIH0gZnJvbSAnLi9iYXNlL2Jhc2Uucm91dGVyJztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IE5vdGlmaWNhdGlvblR5cGUgfSBmcm9tICcuLi9lbnVtZXJhdGlvbnMnO1xuaW1wb3J0ICogYXMgZW51bXMgZnJvbSAnLi4vZW51bWVyYXRpb25zJztcbmltcG9ydCB7IElJbWFnZVN0eWxlIH0gZnJvbSAnLi4vY29udHJvbGxlcnMvYmFzZS9pbWFnZXMuY29udHJvbGxlci5taXhpbic7XG5cbmV4cG9ydCBjbGFzcyBCdWNrZXRSb3V0ZXIgZXh0ZW5kcyBCYXNlUm91dGVyIHtcbiAgICBwdWJsaWMgcm91dGVyOiBSb3V0ZXIgPSBSb3V0ZXIoKTtcbiAgICBwdWJsaWMgY29udHJvbGxlciA9IG5ldyBCdWNrZXRDb250cm9sbGVyKCk7XG4gICAgcHVibGljIHJlc291cmNlOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5yZXNvdXJjZSA9IENPTlNULmVwLkJVQ0tFVFM7XG4gICAgfVxuXG4gICAgcHVibGljIGltYWdlU3R5bGVzID0gW3tcbiAgICAgICAgaW1hZ2VUeXBlOiBlbnVtcy5JbWFnZVR5cGUudGh1bWJuYWlsLCBoZWlnaHQ6IDE1MCwgd2lkdGg6IDE1MCxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaW1hZ2VUeXBlOiBlbnVtcy5JbWFnZVR5cGUubWVkaXVtLCBoZWlnaHQ6IDUwMCxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaW1hZ2VUeXBlOiBlbnVtcy5JbWFnZVR5cGUubGFyZ2UsIGhlaWdodDogMTAyNCxcbiAgICB9XTtcblxuICAgIHB1YmxpYyBhc3luYyBJbWFnZUhhbmRsZXIocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pIHtcbiAgICAgICAgLy8gV2UncmUgYmFzaWNhbGx5IGluamVjdGluZyBhIGNvbnRyb2xsZXIsIGFuZCBhIHNldCBvZiBpbWFnZSBzdHlsZXMgaW4gdGhlIHJvdXRlci5cbiAgICAgICAgYXdhaXQgQnVja2V0Q29udHJvbGxlci5pbWFnZVRyYW5zZm9ybWVyKHJlcXVlc3QscmVzcG9uc2UsbmV4dCwgdGhpcy5jb250cm9sbGVyLHRoaXMuaW1hZ2VTdHlsZXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRSb3V0ZXIoKTogUm91dGVye1xuICAgICAgICByZXR1cm4gc3VwZXIuZ2V0Um91dGVyKClcbiAgICAgICAgLnBhdGNoKGAke3RoaXMucmVzb3VyY2V9JHtDT05TVC5lcC5MSUtFU30vOmlkYCwgYXN5bmMgKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCBCdWNrZXRDb250cm9sbGVyLmFkZExpa2UocmVxdWVzdCxyZXNwb25zZSxuZXh0LHRoaXMuY29udHJvbGxlciwgTm90aWZpY2F0aW9uVHlwZS5CdWNrZXRMaWtlZCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5kZWxldGUoYCR7dGhpcy5yZXNvdXJjZX0ke0NPTlNULmVwLkxJS0VTfS86aWRgLCBhc3luYyAocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGF3YWl0IEJ1Y2tldENvbnRyb2xsZXIucmVtb3ZlTGlrZShyZXF1ZXN0LHJlc3BvbnNlLG5leHQsdGhpcy5jb250cm9sbGVyKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnBvc3QoYCR7dGhpcy5yZXNvdXJjZX0ke0NPTlNULmVwLkNPTU1FTlRTfS86aWRgLCBhc3luYyAocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGF3YWl0IEJ1Y2tldENvbnRyb2xsZXIuYWRkQ29tbWVudChyZXF1ZXN0LHJlc3BvbnNlLG5leHQsdGhpcy5jb250cm9sbGVyLCBOb3RpZmljYXRpb25UeXBlLkJ1Y2tldENvbW1lbnRBZGVkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmRlbGV0ZShgJHt0aGlzLnJlc291cmNlfSR7Q09OU1QuZXAuQ09NTUVOVFN9LzppZGAsIGFzeW5jIChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikgPT4ge1xuICAgICAgICAgICAgYXdhaXQgQnVja2V0Q29udHJvbGxlci5yZW1vdmVDb21tZW50KHJlcXVlc3QscmVzcG9uc2UsbmV4dCx0aGlzLmNvbnRyb2xsZXIpO1xuICAgICAgICB9KVxuICAgICAgICAucGF0Y2goYCR7dGhpcy5yZXNvdXJjZX0ke0NPTlNULmVwLkNPTU1FTlRTfS86aWRgLCBhc3luYyAocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGF3YWl0IEJ1Y2tldENvbnRyb2xsZXIuZWRpdENvbW1lbnQocmVxdWVzdCxyZXNwb25zZSxuZXh0LHRoaXMuY29udHJvbGxlcik7XG4gICAgICAgIH0pXG4gICAgICAgIC5kZWxldGUoYCR7dGhpcy5yZXNvdXJjZX0ke0NPTlNULmVwLklNQUdFU30vOmlkLzppbWFnZUlkYCwgYXN5bmMgKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNvbnRyb2xsZXIuZGVsZXRlSW1hZ2UocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQsIHRoaXMuY29udHJvbGxlcik7XG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=
