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
const constants_1 = require("../../constants");
const notification_utility_1 = require("../notifications/notification-utility");
function Likeable(Base) {
    return class extends Base {
        static addLike(request, response, next, controller, notificationType) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let itemId = controller.getId(request);
                    let item = yield controller.repository.single(itemId);
                    let currentToken = request[constants_1.CONST.REQUEST_TOKEN_LOCATION];
                    let likeableItem = item;
                    if (!likeableItem.likedBy) {
                        likeableItem.likedBy = new Array();
                    }
                    // Only add the likedBy if it doesn't already exist.
                    if (likeableItem.likedBy.indexOf(currentToken.userId) < 0) {
                        likeableItem.likedBy.push(currentToken.userId);
                        // Save the update to the database
                        yield controller.repository.save(item);
                        yield notification_utility_1.NotificationUtility.addNotification(notificationType, item, currentToken);
                    }
                    // Send the new product which is not a template back.
                    response.status(202).json(item);
                    return item;
                }
                catch (err) {
                    next(err);
                }
            });
        }
        static removeLike(request, response, next, controller) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let itemId = controller.getId(request);
                    let item = yield controller.repository.single(itemId);
                    let currentToken = request[constants_1.CONST.REQUEST_TOKEN_LOCATION];
                    let likeableItem = item;
                    if (!likeableItem.likedBy) {
                        likeableItem.likedBy = new Array();
                    }
                    likeableItem.likedBy = likeableItem.likedBy.filter(val => val != currentToken.userId);
                    // Save the update to the database
                    yield controller.repository.save(item);
                    // Send the new product which is not a template back.
                    response.status(200).json(item);
                    return item;
                }
                catch (err) {
                    next(err);
                }
            });
        }
    };
}
exports.Likeable = Likeable;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL2NvbnRyb2xsZXJzL2Jhc2UvbGlrZWFibGUubWl4aW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUtBLCtDQUF3QztBQUd4QyxnRkFBNEU7QUFJNUUsa0JBQW9ELElBQVc7SUFDM0QsTUFBTSxDQUFDLEtBQU0sU0FBUSxJQUFJO1FBRWQsTUFBTSxDQUFPLE9BQU8sQ0FBQyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxVQUEwQixFQUFFLGdCQUFrQzs7Z0JBQ2hKLElBQUksQ0FBQztvQkFDRCxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN2QyxJQUFJLElBQUksR0FBRyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUV0RCxJQUFJLFlBQVksR0FBa0IsT0FBTyxDQUFDLGlCQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztvQkFFeEUsSUFBSSxZQUFZLEdBQUksSUFBa0IsQ0FBQztvQkFFdkMsRUFBRSxDQUFBLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUEsQ0FBQzt3QkFDdEIsWUFBWSxDQUFDLE9BQU8sR0FBRyxJQUFJLEtBQUssRUFBVSxDQUFDO29CQUMvQyxDQUFDO29CQUVELG9EQUFvRDtvQkFDcEQsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hELFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFFL0Msa0NBQWtDO3dCQUNsQyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUV2QyxNQUFNLDBDQUFtQixDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQ3BGLENBQUM7b0JBRUQscURBQXFEO29CQUNyRCxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFaEMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEIsQ0FBQztnQkFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFBQyxDQUFDO1lBQ2hDLENBQUM7U0FBQTtRQUVNLE1BQU0sQ0FBTyxVQUFVLENBQUMsT0FBZ0IsRUFBRSxRQUFrQixFQUFFLElBQWtCLEVBQUUsVUFBMEI7O2dCQUMvRyxJQUFJLENBQUM7b0JBQ0QsSUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDdkMsSUFBSSxJQUFJLEdBQUcsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFFdEQsSUFBSSxZQUFZLEdBQWtCLE9BQU8sQ0FBQyxpQkFBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7b0JBRXhFLElBQUksWUFBWSxHQUFJLElBQWtCLENBQUM7b0JBRXZDLEVBQUUsQ0FBQSxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFBLENBQUM7d0JBQ3RCLFlBQVksQ0FBQyxPQUFPLEdBQUcsSUFBSSxLQUFLLEVBQVUsQ0FBQztvQkFDL0MsQ0FBQztvQkFFRCxZQUFZLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFFdEYsa0NBQWtDO29CQUNsQyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUV2QyxxREFBcUQ7b0JBQ3JELFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVoQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNoQixDQUFDO2dCQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLENBQUM7WUFDaEMsQ0FBQztTQUFBO0tBRUosQ0FBQztBQUNOLENBQUM7QUEzREQsNEJBMkRDIiwiZmlsZSI6ImNvbnRyb2xsZXJzL2Jhc2UvbGlrZWFibGUubWl4aW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJQnVja2V0RG9jLCBCdWNrZXQsIElUb2tlblBheWxvYWQsIElCYXNlTW9kZWwsIElCdWNrZXQsIElCYXNlTW9kZWxEb2MsIElMaWtlYWJsZSB9IGZyb20gJy4uLy4uL21vZGVscyc7XG5pbXBvcnQgeyBSb3V0ZXIsIFJlcXVlc3QsIFJlc3BvbnNlLCBSZXF1ZXN0UGFyYW1IYW5kbGVyLCBOZXh0RnVuY3Rpb24sIFJlcXVlc3RIYW5kbGVyIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgbW9uZ29vc2UgPSByZXF1aXJlKCdtb25nb29zZScpO1xuaW1wb3J0IHsgU2NoZW1hLCBNb2RlbCwgRG9jdW1lbnQgfSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgeyBCYXNlQ29udHJvbGxlciB9IGZyb20gJy4uL2Jhc2UvYmFzZS5jb250cm9sbGVyJztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IEJ1Y2tldFJlcG9zaXRvcnkgfSBmcm9tIFwiLi4vLi4vcmVwb3NpdG9yaWVzXCI7XG5pbXBvcnQgeyBPd25lcnNoaXBUeXBlLCBOb3RpZmljYXRpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2VudW1lcmF0aW9uc1wiO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9uVXRpbGl0eSB9IGZyb20gJy4uL25vdGlmaWNhdGlvbnMvbm90aWZpY2F0aW9uLXV0aWxpdHknO1xuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RvcjxUID0ge30+ID0gbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gVDtcblxuZXhwb3J0IGZ1bmN0aW9uIExpa2VhYmxlPFRCYXNlIGV4dGVuZHMgQ29uc3RydWN0b3I+KEJhc2U6IFRCYXNlKSB7XG4gICAgcmV0dXJuIGNsYXNzIGV4dGVuZHMgQmFzZSB7XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBhc3luYyBhZGRMaWtlKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uLCBjb250cm9sbGVyOiBCYXNlQ29udHJvbGxlciwgbm90aWZpY2F0aW9uVHlwZTogTm90aWZpY2F0aW9uVHlwZSk6IFByb21pc2U8SUJhc2VNb2RlbERvYz4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbUlkID0gY29udHJvbGxlci5nZXRJZChyZXF1ZXN0KTtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IGF3YWl0IGNvbnRyb2xsZXIucmVwb3NpdG9yeS5zaW5nbGUoaXRlbUlkKTtcblxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50VG9rZW46IElUb2tlblBheWxvYWQgPSByZXF1ZXN0W0NPTlNULlJFUVVFU1RfVE9LRU5fTE9DQVRJT05dO1xuXG4gICAgICAgICAgICAgICAgbGV0IGxpa2VhYmxlSXRlbSA9IChpdGVtIGFzIElMaWtlYWJsZSk7XG5cbiAgICAgICAgICAgICAgICBpZighbGlrZWFibGVJdGVtLmxpa2VkQnkpe1xuICAgICAgICAgICAgICAgICAgICBsaWtlYWJsZUl0ZW0ubGlrZWRCeSA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gT25seSBhZGQgdGhlIGxpa2VkQnkgaWYgaXQgZG9lc24ndCBhbHJlYWR5IGV4aXN0LlxuICAgICAgICAgICAgICAgIGlmIChsaWtlYWJsZUl0ZW0ubGlrZWRCeS5pbmRleE9mKGN1cnJlbnRUb2tlbi51c2VySWQpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBsaWtlYWJsZUl0ZW0ubGlrZWRCeS5wdXNoKGN1cnJlbnRUb2tlbi51c2VySWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIHVwZGF0ZSB0byB0aGUgZGF0YWJhc2VcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgY29udHJvbGxlci5yZXBvc2l0b3J5LnNhdmUoaXRlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9uVXRpbGl0eS5hZGROb3RpZmljYXRpb24obm90aWZpY2F0aW9uVHlwZSwgaXRlbSwgY3VycmVudFRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBTZW5kIHRoZSBuZXcgcHJvZHVjdCB3aGljaCBpcyBub3QgYSB0ZW1wbGF0ZSBiYWNrLlxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnN0YXR1cygyMDIpLmpzb24oaXRlbSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikgeyBuZXh0KGVycik7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgcmVtb3ZlTGlrZShyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbiwgY29udHJvbGxlcjogQmFzZUNvbnRyb2xsZXIpOiBQcm9taXNlPElCYXNlTW9kZWxEb2M+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW1JZCA9IGNvbnRyb2xsZXIuZ2V0SWQocmVxdWVzdCk7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBhd2FpdCBjb250cm9sbGVyLnJlcG9zaXRvcnkuc2luZ2xlKGl0ZW1JZCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudFRva2VuOiBJVG9rZW5QYXlsb2FkID0gcmVxdWVzdFtDT05TVC5SRVFVRVNUX1RPS0VOX0xPQ0FUSU9OXTtcblxuICAgICAgICAgICAgICAgIGxldCBsaWtlYWJsZUl0ZW0gPSAoaXRlbSBhcyBJTGlrZWFibGUpO1xuXG4gICAgICAgICAgICAgICAgaWYoIWxpa2VhYmxlSXRlbS5saWtlZEJ5KXtcbiAgICAgICAgICAgICAgICAgICAgbGlrZWFibGVJdGVtLmxpa2VkQnkgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxpa2VhYmxlSXRlbS5saWtlZEJ5ID0gbGlrZWFibGVJdGVtLmxpa2VkQnkuZmlsdGVyKHZhbCA9PiB2YWwgIT0gY3VycmVudFRva2VuLnVzZXJJZCk7XG5cbiAgICAgICAgICAgICAgICAvLyBTYXZlIHRoZSB1cGRhdGUgdG8gdGhlIGRhdGFiYXNlXG4gICAgICAgICAgICAgICAgYXdhaXQgY29udHJvbGxlci5yZXBvc2l0b3J5LnNhdmUoaXRlbSk7XG5cbiAgICAgICAgICAgICAgICAvLyBTZW5kIHRoZSBuZXcgcHJvZHVjdCB3aGljaCBpcyBub3QgYSB0ZW1wbGF0ZSBiYWNrLlxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnN0YXR1cygyMDApLmpzb24oaXRlbSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikgeyBuZXh0KGVycik7IH1cbiAgICAgICAgfVxuXG4gICAgfTtcbn0iXX0=
