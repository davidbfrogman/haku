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
const constants_1 = require("../constants");
const _1 = require("../controllers/");
const enums = require("../enumerations");
const enumerations_1 = require("../enumerations");
const base_router_1 = require("./base/base.router");
class BucketItemRouter extends base_router_1.BaseRouter {
    constructor() {
        super();
        this.router = express_1.Router();
        this.controller = new _1.BucketItemController();
        this.imageStyles = [{
                imageType: enums.ImageType.thumbnail, height: 150, width: 150,
            },
            {
                imageType: enums.ImageType.medium, height: 500,
            },
            {
                imageType: enums.ImageType.large, height: 1024,
            }];
        this.resource = constants_1.CONST.ep.BUCKET_ITEMS;
    }
    ImageHandler(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // For some reason this.controller is not defined at this stage in the pipeline.
            yield _1.BucketItemController.imageTransformer(request, response, next, this.controller, this.imageStyles);
        });
    }
    getRouter() {
        return super.getRouter()
            .delete(`${this.resource}${constants_1.CONST.ep.REMOVE_REFERENCES}/:id`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield this.controller.deleteFromBucket(request, response, next);
        }))
            .patch(`${this.resource}${constants_1.CONST.ep.LIKES}/:id`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield _1.BucketItemController.addLike(request, response, next, this.controller, enumerations_1.NotificationType.BucketItemLiked);
        }))
            .delete(`${this.resource}${constants_1.CONST.ep.LIKES}/:id`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield _1.BucketItemController.removeLike(request, response, next, this.controller);
        }))
            .post(`${this.resource}${constants_1.CONST.ep.COMMENTS}/:id`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield _1.BucketItemController.addComment(request, response, next, this.controller, enumerations_1.NotificationType.BucketItemCommentAdded);
        }))
            .delete(`${this.resource}${constants_1.CONST.ep.COMMENTS}/:id`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield _1.BucketItemController.removeComment(request, response, next, this.controller);
        }))
            .patch(`${this.resource}${constants_1.CONST.ep.COMMENTS}/:id`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield _1.BucketItemController.editComment(request, response, next, this.controller);
        }))
            .delete(`${this.resource}${constants_1.CONST.ep.IMAGES}/:id/:imageId`, (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            yield this.controller.deleteImage(request, response, next, this.controller);
        }));
    }
}
exports.BucketItemRouter = BucketItemRouter;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL3JvdXRlcnMvYnVja2V0LWl0ZW0ucm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxxQ0FBb0Q7QUFFcEQsNENBQXFDO0FBQ3JDLHNDQUF1RDtBQUN2RCx5Q0FBeUM7QUFDekMsa0RBQW1EO0FBQ25ELG9EQUFnRDtBQUVoRCxzQkFBOEIsU0FBUSx3QkFBVTtJQWU1QztRQUNJLEtBQUssRUFBRSxDQUFDO1FBZkwsV0FBTSxHQUFXLGdCQUFNLEVBQUUsQ0FBQztRQUMxQixlQUFVLEdBQUcsSUFBSSx1QkFBb0IsRUFBRSxDQUFDO1FBR3hDLGdCQUFXLEdBQUcsQ0FBQztnQkFDbEIsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUc7YUFDaEU7WUFDRDtnQkFDSSxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUc7YUFDakQ7WUFDRDtnQkFDSSxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUk7YUFDakQsQ0FBQyxDQUFDO1FBSUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUM7SUFDMUMsQ0FBQztJQUVZLFlBQVksQ0FBQyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0I7O1lBQzlFLGdGQUFnRjtZQUNoRixNQUFNLHVCQUFvQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVHLENBQUM7S0FBQTtJQUVNLFNBQVM7UUFFWixNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTthQUVuQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLGlCQUFLLENBQUMsRUFBRSxDQUFDLGlCQUFpQixNQUFNLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQzVILE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BFLENBQUMsQ0FBQSxDQUFDO2FBQ0QsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLE1BQU0sRUFBRSxDQUFPLE9BQWdCLEVBQUUsUUFBa0IsRUFBRSxJQUFrQixFQUFFLEVBQUU7WUFDL0csTUFBTSx1QkFBb0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSwrQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNuSCxDQUFDLENBQUEsQ0FBQzthQUNELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxNQUFNLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ2hILE1BQU0sdUJBQW9CLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNwRixDQUFDLENBQUEsQ0FBQzthQUNELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxNQUFNLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ2pILE1BQU0sdUJBQW9CLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsK0JBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUM3SCxDQUFDLENBQUEsQ0FBQzthQUNELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxNQUFNLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ25ILE1BQU0sdUJBQW9CLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RixDQUFDLENBQUEsQ0FBQzthQUNELEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxNQUFNLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ2xILE1BQU0sdUJBQW9CLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRixDQUFDLENBQUEsQ0FBQzthQUNELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxlQUFlLEVBQUUsQ0FBTyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQzFILE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hGLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDWCxDQUFDO0NBQ0o7QUFuREQsNENBbURDIiwiZmlsZSI6InJvdXRlcnMvYnVja2V0LWl0ZW0ucm91dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UsIFJvdXRlciB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcy1zZXJ2ZS1zdGF0aWMtY29yZSc7XG5pbXBvcnQgeyBDT05TVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBCdWNrZXRJdGVtQ29udHJvbGxlciB9IGZyb20gJy4uL2NvbnRyb2xsZXJzLyc7XG5pbXBvcnQgKiBhcyBlbnVtcyBmcm9tICcuLi9lbnVtZXJhdGlvbnMnO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9uVHlwZSB9IGZyb20gJy4uL2VudW1lcmF0aW9ucyc7XG5pbXBvcnQgeyBCYXNlUm91dGVyIH0gZnJvbSAnLi9iYXNlL2Jhc2Uucm91dGVyJztcblxuZXhwb3J0IGNsYXNzIEJ1Y2tldEl0ZW1Sb3V0ZXIgZXh0ZW5kcyBCYXNlUm91dGVyIHtcbiAgICBwdWJsaWMgcm91dGVyOiBSb3V0ZXIgPSBSb3V0ZXIoKTtcbiAgICBwdWJsaWMgY29udHJvbGxlciA9IG5ldyBCdWNrZXRJdGVtQ29udHJvbGxlcigpO1xuICAgIHB1YmxpYyByZXNvdXJjZTogc3RyaW5nO1xuXG4gICAgcHVibGljIGltYWdlU3R5bGVzID0gW3tcbiAgICAgICAgaW1hZ2VUeXBlOiBlbnVtcy5JbWFnZVR5cGUudGh1bWJuYWlsLCBoZWlnaHQ6IDE1MCwgd2lkdGg6IDE1MCxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaW1hZ2VUeXBlOiBlbnVtcy5JbWFnZVR5cGUubWVkaXVtLCBoZWlnaHQ6IDUwMCxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaW1hZ2VUeXBlOiBlbnVtcy5JbWFnZVR5cGUubGFyZ2UsIGhlaWdodDogMTAyNCxcbiAgICB9XTtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5yZXNvdXJjZSA9IENPTlNULmVwLkJVQ0tFVF9JVEVNUztcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgSW1hZ2VIYW5kbGVyKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSB7XG4gICAgICAgIC8vIEZvciBzb21lIHJlYXNvbiB0aGlzLmNvbnRyb2xsZXIgaXMgbm90IGRlZmluZWQgYXQgdGhpcyBzdGFnZSBpbiB0aGUgcGlwZWxpbmUuXG4gICAgICAgIGF3YWl0IEJ1Y2tldEl0ZW1Db250cm9sbGVyLmltYWdlVHJhbnNmb3JtZXIocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQsIHRoaXMuY29udHJvbGxlciwgdGhpcy5pbWFnZVN0eWxlcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFJvdXRlcigpOiBSb3V0ZXIge1xuXG4gICAgICAgIHJldHVybiBzdXBlci5nZXRSb3V0ZXIoKVxuICAgICAgICAgICAgLy8gUmVtb3ZlcyBhIHNpbmdsZSByZXNvdXJjZSBieSBpZFxuICAgICAgICAgICAgLmRlbGV0ZShgJHt0aGlzLnJlc291cmNlfSR7Q09OU1QuZXAuUkVNT1ZFX1JFRkVSRU5DRVN9LzppZGAsIGFzeW5jIChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuY29udHJvbGxlci5kZWxldGVGcm9tQnVja2V0KHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAucGF0Y2goYCR7dGhpcy5yZXNvdXJjZX0ke0NPTlNULmVwLkxJS0VTfS86aWRgLCBhc3luYyAocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBCdWNrZXRJdGVtQ29udHJvbGxlci5hZGRMaWtlKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0LCB0aGlzLmNvbnRyb2xsZXIsIE5vdGlmaWNhdGlvblR5cGUuQnVja2V0SXRlbUxpa2VkKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZGVsZXRlKGAke3RoaXMucmVzb3VyY2V9JHtDT05TVC5lcC5MSUtFU30vOmlkYCwgYXN5bmMgKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgYXdhaXQgQnVja2V0SXRlbUNvbnRyb2xsZXIucmVtb3ZlTGlrZShyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCwgdGhpcy5jb250cm9sbGVyKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAucG9zdChgJHt0aGlzLnJlc291cmNlfSR7Q09OU1QuZXAuQ09NTUVOVFN9LzppZGAsIGFzeW5jIChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGF3YWl0IEJ1Y2tldEl0ZW1Db250cm9sbGVyLmFkZENvbW1lbnQocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQsIHRoaXMuY29udHJvbGxlciwgTm90aWZpY2F0aW9uVHlwZS5CdWNrZXRJdGVtQ29tbWVudEFkZGVkKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZGVsZXRlKGAke3RoaXMucmVzb3VyY2V9JHtDT05TVC5lcC5DT01NRU5UU30vOmlkYCwgYXN5bmMgKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgYXdhaXQgQnVja2V0SXRlbUNvbnRyb2xsZXIucmVtb3ZlQ29tbWVudChyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCwgdGhpcy5jb250cm9sbGVyKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAucGF0Y2goYCR7dGhpcy5yZXNvdXJjZX0ke0NPTlNULmVwLkNPTU1FTlRTfS86aWRgLCBhc3luYyAocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBCdWNrZXRJdGVtQ29udHJvbGxlci5lZGl0Q29tbWVudChyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCwgdGhpcy5jb250cm9sbGVyKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZGVsZXRlKGAke3RoaXMucmVzb3VyY2V9JHtDT05TVC5lcC5JTUFHRVN9LzppZC86aW1hZ2VJZGAsIGFzeW5jIChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuY29udHJvbGxlci5kZWxldGVJbWFnZShyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCwgdGhpcy5jb250cm9sbGVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn0iXX0=
