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
const constants_1 = require("../constants");
const repositories_1 = require("../repositories");
const base_controller_1 = require("./base/base.controller");
const commentable_mixin_1 = require("./base/commentable.mixin");
const images_controller_mixin_1 = require("./base/images.controller.mixin");
const likeable_mixin_1 = require("./base/likeable.mixin");
class BucketItemControllerBase extends base_controller_1.BaseController {
    constructor() {
        super();
        this.defaultPopulationArgument = null;
        this.rolesRequiringOwnership = [constants_1.CONST.GUEST_ROLE, constants_1.CONST.USER_ROLE];
        this.isOwnershipRequired = true;
        this.repository = new repositories_1.BucketItemRepository();
        this.bucketRepo = new repositories_1.BucketRepository();
    }
    /*
    Here's the request, and how it's going to be shaped.
    // bucketItemId will also need to be on the path  /bucket-items/id
    // this will be how we can check for ownership.
        {
            "bucketId": "123",
            "bucketItemId": "567"
        }
    */
    deleteFromBucket(request, response, next) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (yield _super("isModificationAllowed").call(this, request, response, next)) {
                    // Before we destroy, we want our controllers to have the opportunity to cleanup any related data.
                    const bucketItemDoc = yield this.repository.single(_super("getId").call(this, request));
                    const bucketDoc = yield this.bucketRepo.single(request.body.bucketId);
                    if (!bucketDoc) {
                        throw { message: "Bucket Not Found", status: 404 };
                    }
                    if (!bucketItemDoc) {
                        throw { message: "Bucket Item Not Found", status: 404 };
                    }
                    // We're going to clean this up off the bucket first, because if we don't find it on the bucket, then we probably shouldn't be deleting the item for it.
                    const index = bucketDoc.bucketItems.findIndex(item => {
                        return item[`_id`] == request.body.bucketItemId;
                    });
                    bucketDoc.bucketItems.splice(index, 1);
                    this.bucketRepo.update(bucketDoc.id, bucketDoc);
                    return _super("destroy").call(this, request, response, next);
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
    preCreateHook(BucketItem) {
        return __awaiter(this, void 0, void 0, function* () {
            BucketItem.href = `${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}/${BucketItem._id}`;
            return BucketItem;
        });
    }
    preSendResponseHook(BucketItem) {
        return __awaiter(this, void 0, void 0, function* () {
            return BucketItem;
        });
    }
    preDestroyHook(request, response, next, bucketItem) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield exports.BucketItemController.destroyImages(bucketItem);
        });
    }
}
exports.BucketItemControllerBase = BucketItemControllerBase;
// All of our mixin controllers.
exports.BucketItemController = images_controller_mixin_1.ImageControllerMixin(commentable_mixin_1.Commentable(likeable_mixin_1.Likeable(BucketItemControllerBase)));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL2NvbnRyb2xsZXJzL2J1Y2tldC1pdGVtLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLDRDQUFxQztBQUVyQyxrREFBeUU7QUFDekUsNERBQXdEO0FBQ3hELGdFQUF1RDtBQUN2RCw0RUFBc0U7QUFDdEUsMERBQWlEO0FBR2pELDhCQUFzQyxTQUFRLGdDQUFjO0lBU3hEO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFSTCw4QkFBeUIsR0FBRyxJQUFJLENBQUM7UUFDakMsNEJBQXVCLEdBQUcsQ0FBQyxpQkFBSyxDQUFDLFVBQVUsRUFBRSxpQkFBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlELHdCQUFtQixHQUFHLElBQUksQ0FBQztRQUUzQixlQUFVLEdBQUcsSUFBSSxtQ0FBb0IsRUFBRSxDQUFDO1FBQ3hDLGVBQVUsR0FBRyxJQUFJLCtCQUFnQixFQUFFLENBQUM7SUFJM0MsQ0FBQztJQUVEOzs7Ozs7OztNQVFFO0lBQ1csZ0JBQWdCLENBQUMsT0FBZ0IsRUFBRSxRQUFrQixFQUFFLElBQWtCOzs7WUFDbEYsSUFBSSxDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sK0JBQTJCLFlBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdELGtHQUFrRztvQkFDbEcsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxlQUFXLFlBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3pFLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFFdEUsRUFBRSxDQUFBLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDO29CQUFBLENBQUM7b0JBQ3JFLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzt3QkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQztvQkFBQyxDQUFDO29CQUVoRix3SkFBd0o7b0JBQ3hKLE1BQU0sS0FBSyxHQUFJLFNBQVMsQ0FBQyxXQUFnQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDdkUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztvQkFDcEQsQ0FBQyxDQUFDLENBQUM7b0JBRUgsU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO29CQUV0QyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUUvQyxNQUFNLENBQUMsaUJBQWEsWUFBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLElBQUksRUFBRTtnQkFDaEQsQ0FBQztZQUNMLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUFDLENBQUM7UUFDaEMsQ0FBQztLQUFBO0lBRVksYUFBYSxDQUFDLFVBQTBCOztZQUNqRCxVQUFVLENBQUMsSUFBSSxHQUFHLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLGlCQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLElBQUksVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzVGLE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUFBO0lBRVksbUJBQW1CLENBQUMsVUFBMEI7O1lBQ3ZELE1BQU0sQ0FBQyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUFBO0lBRVksY0FBYyxDQUFDLE9BQWdCLEVBQUUsUUFBa0IsRUFBRSxJQUFrQixFQUFFLFVBQTBCOztZQUM1RyxNQUFNLENBQUMsTUFBTSw0QkFBb0IsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEUsQ0FBQztLQUFBO0NBQ0o7QUExREQsNERBMERDO0FBRUQsZ0NBQWdDO0FBQ25CLFFBQUEsb0JBQW9CLEdBQUcsOENBQW9CLENBQUMsK0JBQVcsQ0FBQyx5QkFBUSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6ImNvbnRyb2xsZXJzL2J1Y2tldC1pdGVtLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0RnVuY3Rpb24sIFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBDT05TVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBJQnVja2V0SXRlbURvYyB9IGZyb20gJy4uL21vZGVscyc7XG5pbXBvcnQgeyBCdWNrZXRJdGVtUmVwb3NpdG9yeSwgQnVja2V0UmVwb3NpdG9yeSB9IGZyb20gXCIuLi9yZXBvc2l0b3JpZXNcIjtcbmltcG9ydCB7IEJhc2VDb250cm9sbGVyIH0gZnJvbSAnLi9iYXNlL2Jhc2UuY29udHJvbGxlcic7XG5pbXBvcnQgeyBDb21tZW50YWJsZSB9IGZyb20gJy4vYmFzZS9jb21tZW50YWJsZS5taXhpbic7XG5pbXBvcnQgeyBJbWFnZUNvbnRyb2xsZXJNaXhpbiB9IGZyb20gJy4vYmFzZS9pbWFnZXMuY29udHJvbGxlci5taXhpbic7XG5pbXBvcnQgeyBMaWtlYWJsZSB9IGZyb20gJy4vYmFzZS9saWtlYWJsZS5taXhpbic7XG5pbXBvcnQgbW9uZ29vc2UgPSByZXF1aXJlKCdtb25nb29zZScpO1xuXG5leHBvcnQgY2xhc3MgQnVja2V0SXRlbUNvbnRyb2xsZXJCYXNlIGV4dGVuZHMgQmFzZUNvbnRyb2xsZXIge1xuXG4gICAgcHVibGljIGRlZmF1bHRQb3B1bGF0aW9uQXJndW1lbnQgPSBudWxsO1xuICAgIHB1YmxpYyByb2xlc1JlcXVpcmluZ093bmVyc2hpcCA9IFtDT05TVC5HVUVTVF9ST0xFLCBDT05TVC5VU0VSX1JPTEVdO1xuICAgIHB1YmxpYyBpc093bmVyc2hpcFJlcXVpcmVkID0gdHJ1ZTtcblxuICAgIHB1YmxpYyByZXBvc2l0b3J5ID0gbmV3IEJ1Y2tldEl0ZW1SZXBvc2l0b3J5KCk7XG4gICAgcHVibGljIGJ1Y2tldFJlcG8gPSBuZXcgQnVja2V0UmVwb3NpdG9yeSgpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgLypcbiAgICBIZXJlJ3MgdGhlIHJlcXVlc3QsIGFuZCBob3cgaXQncyBnb2luZyB0byBiZSBzaGFwZWQuIFxuICAgIC8vIGJ1Y2tldEl0ZW1JZCB3aWxsIGFsc28gbmVlZCB0byBiZSBvbiB0aGUgcGF0aCAgL2J1Y2tldC1pdGVtcy9pZFxuICAgIC8vIHRoaXMgd2lsbCBiZSBob3cgd2UgY2FuIGNoZWNrIGZvciBvd25lcnNoaXAuIFxuICAgICAgICB7XG4gICAgICAgICAgICBcImJ1Y2tldElkXCI6IFwiMTIzXCIsXG4gICAgICAgICAgICBcImJ1Y2tldEl0ZW1JZFwiOiBcIjU2N1wiIFxuICAgICAgICB9XG4gICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZGVsZXRlRnJvbUJ1Y2tldChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbik6IFByb21pc2U8SUJ1Y2tldEl0ZW1Eb2M+e1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGF3YWl0IHN1cGVyLmlzTW9kaWZpY2F0aW9uQWxsb3dlZChyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCkpIHtcbiAgICAgICAgICAgICAgICAvLyBCZWZvcmUgd2UgZGVzdHJveSwgd2Ugd2FudCBvdXIgY29udHJvbGxlcnMgdG8gaGF2ZSB0aGUgb3Bwb3J0dW5pdHkgdG8gY2xlYW51cCBhbnkgcmVsYXRlZCBkYXRhLlxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1Y2tldEl0ZW1Eb2MgPSBhd2FpdCB0aGlzLnJlcG9zaXRvcnkuc2luZ2xlKHN1cGVyLmdldElkKHJlcXVlc3QpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBidWNrZXREb2MgPSBhd2FpdCB0aGlzLmJ1Y2tldFJlcG8uc2luZ2xlKHJlcXVlc3QuYm9keS5idWNrZXRJZCk7XG5cbiAgICAgICAgICAgICAgICBpZighYnVja2V0RG9jKSB7IHRocm93IHsgbWVzc2FnZTogXCJCdWNrZXQgTm90IEZvdW5kXCIsIHN0YXR1czogNDA0IH07fVxuICAgICAgICAgICAgICAgIGlmICghYnVja2V0SXRlbURvYykgeyB0aHJvdyB7IG1lc3NhZ2U6IFwiQnVja2V0IEl0ZW0gTm90IEZvdW5kXCIsIHN0YXR1czogNDA0IH07IH1cblxuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGdvaW5nIHRvIGNsZWFuIHRoaXMgdXAgb2ZmIHRoZSBidWNrZXQgZmlyc3QsIGJlY2F1c2UgaWYgd2UgZG9uJ3QgZmluZCBpdCBvbiB0aGUgYnVja2V0LCB0aGVuIHdlIHByb2JhYmx5IHNob3VsZG4ndCBiZSBkZWxldGluZyB0aGUgaXRlbSBmb3IgaXQuXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSAoYnVja2V0RG9jLmJ1Y2tldEl0ZW1zIGFzIElCdWNrZXRJdGVtRG9jW10pLmZpbmRJbmRleChpdGVtID0+e1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbVtgX2lkYF0gPT0gcmVxdWVzdC5ib2R5LmJ1Y2tldEl0ZW1JZDtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGJ1Y2tldERvYy5idWNrZXRJdGVtcy5zcGxpY2UoaW5kZXgsMSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmJ1Y2tldFJlcG8udXBkYXRlKGJ1Y2tldERvYy5pZCxidWNrZXREb2MpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1cGVyLmRlc3Ryb3kocmVxdWVzdCxyZXNwb25zZSxuZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IG5leHQoZXJyKTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBwcmVDcmVhdGVIb29rKEJ1Y2tldEl0ZW06IElCdWNrZXRJdGVtRG9jKTogUHJvbWlzZTxJQnVja2V0SXRlbURvYz4ge1xuICAgICAgICBCdWNrZXRJdGVtLmhyZWYgPSBgJHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX0ke0NPTlNULmVwLkJVQ0tFVF9JVEVNU30vJHtCdWNrZXRJdGVtLl9pZH1gO1xuICAgICAgICByZXR1cm4gQnVja2V0SXRlbTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcHJlU2VuZFJlc3BvbnNlSG9vayhCdWNrZXRJdGVtOiBJQnVja2V0SXRlbURvYyk6IFByb21pc2U8SUJ1Y2tldEl0ZW1Eb2M+IHtcbiAgICAgICAgcmV0dXJuIEJ1Y2tldEl0ZW07XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHByZURlc3Ryb3lIb29rKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uLCBidWNrZXRJdGVtOiBJQnVja2V0SXRlbURvYyk6IFByb21pc2U8SUJ1Y2tldEl0ZW1Eb2M+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IEJ1Y2tldEl0ZW1Db250cm9sbGVyLmRlc3Ryb3lJbWFnZXMoYnVja2V0SXRlbSk7XG4gICAgfVxufVxuXG4vLyBBbGwgb2Ygb3VyIG1peGluIGNvbnRyb2xsZXJzLlxuZXhwb3J0IGNvbnN0IEJ1Y2tldEl0ZW1Db250cm9sbGVyID0gSW1hZ2VDb250cm9sbGVyTWl4aW4oQ29tbWVudGFibGUoTGlrZWFibGUoQnVja2V0SXRlbUNvbnRyb2xsZXJCYXNlKSkpO1xuIl19
