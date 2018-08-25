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
const bucket_item_controller_1 = require("./bucket-item.controller");
class BucketControllerBase extends base_controller_1.BaseController {
    constructor() {
        super();
        this.defaultPopulationArgument = {
            path: "bucketItems"
        };
        this.rolesRequiringOwnership = [constants_1.CONST.GUEST_ROLE, constants_1.CONST.USER_ROLE];
        this.isOwnershipRequired = true;
        this.repository = new repositories_1.BucketRepository();
        this.bucketItemRepository = new repositories_1.BucketItemRepository();
        this.bucketItemController = new bucket_item_controller_1.BucketItemController();
    }
    preCreateHook(Bucket) {
        return __awaiter(this, void 0, void 0, function* () {
            Bucket.href = `${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}/${Bucket._id}`;
            return Bucket;
        });
    }
    preDestroyHook(request, response, next, bucket) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Before we can destroy the images related to this bucket's items. 
                // keep in mind this bucket item might have been added to someone else's bucket.
                // so we can only clean up the images on this guy if he's not a part of any other bucket.
                // this is generally what querying inside an array looks like. db.inventory.find( { tags: "red" } )
                if (bucket.bucketItems && bucket.bucketItems.length > 0) {
                    // For each of the bucket items on this bucket.
                    for (let i = 0; i < bucket.bucketItems.length; i++) {
                        const bucketItem = bucket.bucketItems[i];
                        // We need to check to see if this bucket item exists on any other buckets first. 
                        let otherBuckets = yield this.repository.query({
                            bucketItems: bucketItem._id
                        }, null, null);
                        // Now if we have other buckets, we're not going to delete the images,... but we'll delete them if there's no other buckets.
                        if (!otherBuckets || otherBuckets == null || otherBuckets.length <= 1) {
                            // here we know that this bucket item doesn't exist in anyone elses bucket.
                            // so we can go ahead and delete the images off of it. 
                            yield bucket_item_controller_1.BucketItemController.destroyImages(yield this.bucketItemRepository.single(bucketItem._id));
                            // For now we're not going to go an delete the bucket item.
                            // it's a pain, and it's probably not that big of a deal.  In theory we can write something that will spit out all the orphaned
                            // bucket items and delete those. 
                        }
                    }
                }
                return yield exports.BucketController.destroyImages(bucket);
            }
            catch (err) {
                next(err);
            }
        });
    }
    preSendResponseHook(Bucket) {
        return __awaiter(this, void 0, void 0, function* () {
            return Bucket;
        });
    }
}
exports.BucketControllerBase = BucketControllerBase;
// All of our mixin controllers.
exports.BucketController = images_controller_mixin_1.ImageControllerMixin(commentable_mixin_1.Commentable(likeable_mixin_1.Likeable(BucketControllerBase)));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL2NvbnRyb2xsZXJzL2J1Y2tldC5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSw0Q0FBcUM7QUFFckMsa0RBQXlFO0FBQ3pFLDREQUF3RDtBQUN4RCxnRUFBdUQ7QUFDdkQsNEVBQXNFO0FBQ3RFLDBEQUFpRDtBQUNqRCxxRUFBZ0U7QUFHaEUsMEJBQWtDLFNBQVEsZ0NBQWM7SUFZcEQ7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQVhMLDhCQUF5QixHQUFHO1lBQy9CLElBQUksRUFBRSxhQUFhO1NBQ3RCLENBQUM7UUFDSyw0QkFBdUIsR0FBRyxDQUFDLGlCQUFLLENBQUMsVUFBVSxFQUFFLGlCQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUQsd0JBQW1CLEdBQUcsSUFBSSxDQUFDO1FBRTNCLGVBQVUsR0FBRyxJQUFJLCtCQUFnQixFQUFFLENBQUM7UUFDcEMseUJBQW9CLEdBQUcsSUFBSSxtQ0FBb0IsRUFBRSxDQUFDO1FBQ2xELHlCQUFvQixHQUFJLElBQUksNkNBQW9CLEVBQUUsQ0FBQztJQUkxRCxDQUFDO0lBRVksYUFBYSxDQUFDLE1BQWtCOztZQUN6QyxNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLGlCQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxpQkFBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQy9FLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDbEIsQ0FBQztLQUFBO0lBRVksY0FBYyxDQUFDLE9BQWdCLEVBQUUsUUFBa0IsRUFBRSxJQUFrQixFQUFFLE1BQWtCOztZQUNwRyxJQUFJLENBQUM7Z0JBRUQsb0VBQW9FO2dCQUNwRSxnRkFBZ0Y7Z0JBQ2hGLHlGQUF5RjtnQkFDekYsbUdBQW1HO2dCQUNuRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RELCtDQUErQztvQkFDL0MsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUVqRCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBbUIsQ0FBQzt3QkFFM0Qsa0ZBQWtGO3dCQUNsRixJQUFJLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDOzRCQUMzQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUc7eUJBQzlCLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUVmLDRIQUE0SDt3QkFDNUgsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLElBQUksWUFBWSxJQUFJLElBQUksSUFBSSxZQUFZLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3BFLDJFQUEyRTs0QkFDM0UsdURBQXVEOzRCQUN2RCxNQUFNLDZDQUFvQixDQUFDLGFBQWEsQ0FBQyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7NEJBRWpHLDJEQUEyRDs0QkFDM0QsK0hBQStIOzRCQUMvSCxrQ0FBa0M7d0JBQ3RDLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO2dCQUVELE1BQU0sQ0FBQyxNQUFNLHdCQUFnQixDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUV4RCxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFBQyxDQUFDO1FBRWhDLENBQUM7S0FBQTtJQUVZLG1CQUFtQixDQUFDLE1BQWtCOztZQUMvQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2xCLENBQUM7S0FBQTtDQUNKO0FBN0RELG9EQTZEQztBQUVELGdDQUFnQztBQUNuQixRQUFBLGdCQUFnQixHQUFHLDhDQUFvQixDQUFDLCtCQUFXLENBQUMseUJBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJjb250cm9sbGVycy9idWNrZXQuY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRGdW5jdGlvbiwgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IElCdWNrZXREb2MsIElCdWNrZXRJdGVtRG9jIH0gZnJvbSAnLi4vbW9kZWxzJztcbmltcG9ydCB7IEJ1Y2tldEl0ZW1SZXBvc2l0b3J5LCBCdWNrZXRSZXBvc2l0b3J5IH0gZnJvbSBcIi4uL3JlcG9zaXRvcmllc1wiO1xuaW1wb3J0IHsgQmFzZUNvbnRyb2xsZXIgfSBmcm9tICcuL2Jhc2UvYmFzZS5jb250cm9sbGVyJztcbmltcG9ydCB7IENvbW1lbnRhYmxlIH0gZnJvbSAnLi9iYXNlL2NvbW1lbnRhYmxlLm1peGluJztcbmltcG9ydCB7IEltYWdlQ29udHJvbGxlck1peGluIH0gZnJvbSAnLi9iYXNlL2ltYWdlcy5jb250cm9sbGVyLm1peGluJztcbmltcG9ydCB7IExpa2VhYmxlIH0gZnJvbSAnLi9iYXNlL2xpa2VhYmxlLm1peGluJztcbmltcG9ydCB7IEJ1Y2tldEl0ZW1Db250cm9sbGVyIH0gZnJvbSAnLi9idWNrZXQtaXRlbS5jb250cm9sbGVyJztcbmltcG9ydCBtb25nb29zZSA9IHJlcXVpcmUoJ21vbmdvb3NlJyk7XG5cbmV4cG9ydCBjbGFzcyBCdWNrZXRDb250cm9sbGVyQmFzZSBleHRlbmRzIEJhc2VDb250cm9sbGVyIHtcblxuICAgIHB1YmxpYyBkZWZhdWx0UG9wdWxhdGlvbkFyZ3VtZW50ID0ge1xuICAgICAgICBwYXRoOiBcImJ1Y2tldEl0ZW1zXCJcbiAgICB9O1xuICAgIHB1YmxpYyByb2xlc1JlcXVpcmluZ093bmVyc2hpcCA9IFtDT05TVC5HVUVTVF9ST0xFLCBDT05TVC5VU0VSX1JPTEVdO1xuICAgIHB1YmxpYyBpc093bmVyc2hpcFJlcXVpcmVkID0gdHJ1ZTtcblxuICAgIHB1YmxpYyByZXBvc2l0b3J5ID0gbmV3IEJ1Y2tldFJlcG9zaXRvcnkoKTtcbiAgICBwdWJsaWMgYnVja2V0SXRlbVJlcG9zaXRvcnkgPSBuZXcgQnVja2V0SXRlbVJlcG9zaXRvcnkoKTtcbiAgICBwdWJsaWMgYnVja2V0SXRlbUNvbnRyb2xsZXIgPSDCoG5ldyBCdWNrZXRJdGVtQ29udHJvbGxlcigpO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHByZUNyZWF0ZUhvb2soQnVja2V0OiBJQnVja2V0RG9jKTogUHJvbWlzZTxJQnVja2V0RG9jPiB7XG4gICAgICAgIEJ1Y2tldC5ocmVmID0gYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRTfS8ke0J1Y2tldC5faWR9YDtcbiAgICAgICAgcmV0dXJuIEJ1Y2tldDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcHJlRGVzdHJveUhvb2socmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24sIGJ1Y2tldDogSUJ1Y2tldERvYyk6IFByb21pc2U8SUJ1Y2tldERvYz4ge1xuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAvLyBCZWZvcmUgd2UgY2FuIGRlc3Ryb3kgdGhlIGltYWdlcyByZWxhdGVkIHRvIHRoaXMgYnVja2V0J3MgaXRlbXMuIFxuICAgICAgICAgICAgLy8ga2VlcCBpbiBtaW5kIHRoaXMgYnVja2V0IGl0ZW0gbWlnaHQgaGF2ZSBiZWVuIGFkZGVkIHRvIHNvbWVvbmUgZWxzZSdzIGJ1Y2tldC5cbiAgICAgICAgICAgIC8vIHNvIHdlIGNhbiBvbmx5IGNsZWFuIHVwIHRoZSBpbWFnZXMgb24gdGhpcyBndXkgaWYgaGUncyBub3QgYSBwYXJ0IG9mIGFueSBvdGhlciBidWNrZXQuXG4gICAgICAgICAgICAvLyB0aGlzIGlzIGdlbmVyYWxseSB3aGF0IHF1ZXJ5aW5nIGluc2lkZSBhbiBhcnJheSBsb29rcyBsaWtlLiBkYi5pbnZlbnRvcnkuZmluZCggeyB0YWdzOiBcInJlZFwiIH0gKVxuICAgICAgICAgICAgaWYgKGJ1Y2tldC5idWNrZXRJdGVtcyAmJiBidWNrZXQuYnVja2V0SXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIEZvciBlYWNoIG9mIHRoZSBidWNrZXQgaXRlbXMgb24gdGhpcyBidWNrZXQuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWNrZXQuYnVja2V0SXRlbXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBidWNrZXRJdGVtID0gYnVja2V0LmJ1Y2tldEl0ZW1zW2ldIGFzIElCdWNrZXRJdGVtRG9jO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gY2hlY2sgdG8gc2VlIGlmIHRoaXMgYnVja2V0IGl0ZW0gZXhpc3RzIG9uIGFueSBvdGhlciBidWNrZXRzIGZpcnN0LiBcbiAgICAgICAgICAgICAgICAgICAgbGV0IG90aGVyQnVja2V0cyA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5xdWVyeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWNrZXRJdGVtczogYnVja2V0SXRlbS5faWRcbiAgICAgICAgICAgICAgICAgICAgfSwgbnVsbCwgbnVsbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gTm93IGlmIHdlIGhhdmUgb3RoZXIgYnVja2V0cywgd2UncmUgbm90IGdvaW5nIHRvIGRlbGV0ZSB0aGUgaW1hZ2VzLC4uLiBidXQgd2UnbGwgZGVsZXRlIHRoZW0gaWYgdGhlcmUncyBubyBvdGhlciBidWNrZXRzLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIW90aGVyQnVja2V0cyB8fCBvdGhlckJ1Y2tldHMgPT0gbnVsbCB8fCBvdGhlckJ1Y2tldHMubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhlcmUgd2Uga25vdyB0aGF0IHRoaXMgYnVja2V0IGl0ZW0gZG9lc24ndCBleGlzdCBpbiBhbnlvbmUgZWxzZXMgYnVja2V0LlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gd2UgY2FuIGdvIGFoZWFkIGFuZCBkZWxldGUgdGhlIGltYWdlcyBvZmYgb2YgaXQuIFxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgQnVja2V0SXRlbUNvbnRyb2xsZXIuZGVzdHJveUltYWdlcyhhd2FpdCB0aGlzLmJ1Y2tldEl0ZW1SZXBvc2l0b3J5LnNpbmdsZShidWNrZXRJdGVtLl9pZCkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3Igbm93IHdlJ3JlIG5vdCBnb2luZyB0byBnbyBhbiBkZWxldGUgdGhlIGJ1Y2tldCBpdGVtLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXQncyBhIHBhaW4sIGFuZCBpdCdzIHByb2JhYmx5IG5vdCB0aGF0IGJpZyBvZiBhIGRlYWwuICBJbiB0aGVvcnkgd2UgY2FuIHdyaXRlIHNvbWV0aGluZyB0aGF0IHdpbGwgc3BpdCBvdXQgYWxsIHRoZSBvcnBoYW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnVja2V0IGl0ZW1zIGFuZCBkZWxldGUgdGhvc2UuIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgQnVja2V0Q29udHJvbGxlci5kZXN0cm95SW1hZ2VzKGJ1Y2tldCk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IG5leHQoZXJyKTsgfVxuXG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHByZVNlbmRSZXNwb25zZUhvb2soQnVja2V0OiBJQnVja2V0RG9jKTogUHJvbWlzZTxJQnVja2V0RG9jPiB7XG4gICAgICAgIHJldHVybiBCdWNrZXQ7XG4gICAgfVxufVxuXG4vLyBBbGwgb2Ygb3VyIG1peGluIGNvbnRyb2xsZXJzLlxuZXhwb3J0IGNvbnN0IEJ1Y2tldENvbnRyb2xsZXIgPSBJbWFnZUNvbnRyb2xsZXJNaXhpbihDb21tZW50YWJsZShMaWtlYWJsZShCdWNrZXRDb250cm9sbGVyQmFzZSkpKTsiXX0=
