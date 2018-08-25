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
function Commentable(Base) {
    return class extends Base {
        static addComment(request, response, next, controller, notificationType) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let itemId = controller.getId(request);
                    let item = yield controller.repository.single(itemId);
                    let currentToken = request[constants_1.CONST.REQUEST_TOKEN_LOCATION];
                    let commentableItem = item;
                    commentableItem.comments.push({
                        comment: request.body.comment,
                        commentBy: currentToken.userId,
                        createdAt: new Date(),
                    });
                    // Save the update to the database
                    yield controller.repository.save(item);
                    yield notification_utility_1.NotificationUtility.addNotification(notificationType, item, currentToken);
                    // Send the added comment back
                    response.status(202).json(item);
                    return item;
                }
                catch (err) {
                    next(err);
                }
            });
        }
        static removeComment(request, response, next, controller) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let itemId = controller.getId(request);
                    let item = yield controller.repository.single(itemId);
                    let currentToken = request[constants_1.CONST.REQUEST_TOKEN_LOCATION];
                    let commentableItem = item;
                    commentableItem.comments = commentableItem.comments.filter((item) => {
                        item._id != request.body._id;
                    });
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
        static editComment(request, response, next, controller) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let itemId = controller.getId(request);
                    let item = yield controller.repository.single(itemId);
                    let currentToken = request[constants_1.CONST.REQUEST_TOKEN_LOCATION];
                    let commentableItem = item;
                    commentableItem.comments.map((comment) => {
                        if (comment._id == request.body._id) {
                            comment.comment = request.body.comment;
                            comment.modifiedAt = new Date();
                        }
                    });
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
exports.Commentable = Commentable;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL2NvbnRyb2xsZXJzL2Jhc2UvY29tbWVudGFibGUubWl4aW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLCtDQUF3QztBQUt4QyxnRkFBNEU7QUFLNUUscUJBQXVELElBQVc7SUFDOUQsTUFBTSxDQUFDLEtBQU0sU0FBUSxJQUFJO1FBRWQsTUFBTSxDQUFPLFVBQVUsQ0FBQyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxVQUEwQixFQUFFLGdCQUFrQzs7Z0JBQ25KLElBQUksQ0FBQztvQkFDRCxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN2QyxJQUFJLElBQUksR0FBRyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN0RCxJQUFJLFlBQVksR0FBa0IsT0FBTyxDQUFDLGlCQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztvQkFFeEUsSUFBSSxlQUFlLEdBQUksSUFBcUIsQ0FBQztvQkFFN0MsZUFBZSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7d0JBQzFCLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU87d0JBQzdCLFNBQVMsRUFBRSxZQUFZLENBQUMsTUFBTTt3QkFDOUIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO3FCQUN4QixDQUFDLENBQUE7b0JBRUYsa0NBQWtDO29CQUNsQyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUV2QyxNQUFNLDBDQUFtQixDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBQyxJQUFJLEVBQUMsWUFBWSxDQUFDLENBQUM7b0JBRTlFLDhCQUE4QjtvQkFDOUIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRWhDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQUMsQ0FBQztZQUNoQyxDQUFDO1NBQUE7UUFFTSxNQUFNLENBQU8sYUFBYSxDQUFDLE9BQWdCLEVBQUUsUUFBa0IsRUFBRSxJQUFrQixFQUFFLFVBQTBCOztnQkFDbEgsSUFBSSxDQUFDO29CQUNELElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3ZDLElBQUksSUFBSSxHQUFHLE1BQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBRXRELElBQUksWUFBWSxHQUFrQixPQUFPLENBQUMsaUJBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO29CQUV4RSxJQUFJLGVBQWUsR0FBSSxJQUFxQixDQUFDO29CQUU3QyxlQUFlLENBQUMsUUFBUSxHQUFHLGVBQWUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7d0JBQ2pFLElBQUksQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUE7b0JBQ2hDLENBQUMsQ0FBQyxDQUFDO29CQUVILGtDQUFrQztvQkFDbEMsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFdkMscURBQXFEO29CQUNyRCxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFaEMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEIsQ0FBQztnQkFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFBQyxDQUFDO1lBQ2hDLENBQUM7U0FBQTtRQUVNLE1BQU0sQ0FBTyxXQUFXLENBQUMsT0FBZ0IsRUFBRSxRQUFrQixFQUFFLElBQWtCLEVBQUUsVUFBMEI7O2dCQUNoSCxJQUFJLENBQUM7b0JBQ0QsSUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDdkMsSUFBSSxJQUFJLEdBQUcsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFFdEQsSUFBSSxZQUFZLEdBQWtCLE9BQU8sQ0FBQyxpQkFBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7b0JBRXhFLElBQUksZUFBZSxHQUFJLElBQXFCLENBQUM7b0JBRTdDLGVBQWUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7d0JBQ3RDLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDOzRCQUNoQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFBOzRCQUN0QyxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7d0JBQ3BDLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBRUgsa0NBQWtDO29CQUNsQyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUV2QyxxREFBcUQ7b0JBQ3JELFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVoQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNoQixDQUFDO2dCQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLENBQUM7WUFDaEMsQ0FBQztTQUFBO0tBRUosQ0FBQztBQUNOLENBQUM7QUEvRUQsa0NBK0VDIiwiZmlsZSI6ImNvbnRyb2xsZXJzL2Jhc2UvY29tbWVudGFibGUubWl4aW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0RnVuY3Rpb24sIFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBDT05TVCB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBOb3RpZmljYXRpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2VudW1lcmF0aW9uc1wiO1xuaW1wb3J0IHsgSUJhc2VNb2RlbERvYywgSVRva2VuUGF5bG9hZCB9IGZyb20gJy4uLy4uL21vZGVscyc7XG5pbXBvcnQgeyBJQ29tbWVudGFibGUgfSBmcm9tICcuLi8uLi9tb2RlbHMvY29tbWVudGFibGUuaW50ZXJmYWNlJztcbmltcG9ydCB7IEJhc2VDb250cm9sbGVyIH0gZnJvbSAnLi4vYmFzZS9iYXNlLmNvbnRyb2xsZXInO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9uVXRpbGl0eSB9IGZyb20gJy4uL25vdGlmaWNhdGlvbnMvbm90aWZpY2F0aW9uLXV0aWxpdHknO1xuaW1wb3J0IG1vbmdvb3NlID0gcmVxdWlyZSgnbW9uZ29vc2UnKTtcblxuZXhwb3J0IHR5cGUgQ29uc3RydWN0b3I8VCA9IHt9PiA9IG5ldyAoLi4uYXJnczogYW55W10pID0+IFQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBDb21tZW50YWJsZTxUQmFzZSBleHRlbmRzIENvbnN0cnVjdG9yPihCYXNlOiBUQmFzZSkge1xuICAgIHJldHVybiBjbGFzcyBleHRlbmRzIEJhc2Uge1xuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgYWRkQ29tbWVudChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbiwgY29udHJvbGxlcjogQmFzZUNvbnRyb2xsZXIsIG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUpOiBQcm9taXNlPElCYXNlTW9kZWxEb2M+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW1JZCA9IGNvbnRyb2xsZXIuZ2V0SWQocmVxdWVzdCk7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBhd2FpdCBjb250cm9sbGVyLnJlcG9zaXRvcnkuc2luZ2xlKGl0ZW1JZCk7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRUb2tlbjogSVRva2VuUGF5bG9hZCA9IHJlcXVlc3RbQ09OU1QuUkVRVUVTVF9UT0tFTl9MT0NBVElPTl07XG5cbiAgICAgICAgICAgICAgICBsZXQgY29tbWVudGFibGVJdGVtID0gKGl0ZW0gYXMgSUNvbW1lbnRhYmxlKTtcblxuICAgICAgICAgICAgICAgIGNvbW1lbnRhYmxlSXRlbS5jb21tZW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudDogcmVxdWVzdC5ib2R5LmNvbW1lbnQsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnRCeTogY3VycmVudFRva2VuLnVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgXG4gICAgICAgICAgICAgICAgLy8gU2F2ZSB0aGUgdXBkYXRlIHRvIHRoZSBkYXRhYmFzZVxuICAgICAgICAgICAgICAgIGF3YWl0IGNvbnRyb2xsZXIucmVwb3NpdG9yeS5zYXZlKGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9uVXRpbGl0eS5hZGROb3RpZmljYXRpb24obm90aWZpY2F0aW9uVHlwZSxpdGVtLGN1cnJlbnRUb2tlbik7XG4gICAgXG4gICAgICAgICAgICAgICAgLy8gU2VuZCB0aGUgYWRkZWQgY29tbWVudCBiYWNrXG4gICAgICAgICAgICAgICAgcmVzcG9uc2Uuc3RhdHVzKDIwMikuanNvbihpdGVtKTtcbiAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikgeyBuZXh0KGVycik7IH1cbiAgICAgICAgfVxuICAgIFxuICAgICAgICBwdWJsaWMgc3RhdGljIGFzeW5jIHJlbW92ZUNvbW1lbnQocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24sIGNvbnRyb2xsZXI6IEJhc2VDb250cm9sbGVyKTogUHJvbWlzZTxJQmFzZU1vZGVsRG9jPiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCBpdGVtSWQgPSBjb250cm9sbGVyLmdldElkKHJlcXVlc3QpO1xuICAgICAgICAgICAgICAgIGxldCBpdGVtID0gYXdhaXQgY29udHJvbGxlci5yZXBvc2l0b3J5LnNpbmdsZShpdGVtSWQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50VG9rZW46IElUb2tlblBheWxvYWQgPSByZXF1ZXN0W0NPTlNULlJFUVVFU1RfVE9LRU5fTE9DQVRJT05dO1xuICAgIFxuICAgICAgICAgICAgICAgIGxldCBjb21tZW50YWJsZUl0ZW0gPSAoaXRlbSBhcyBJQ29tbWVudGFibGUpO1xuXG4gICAgICAgICAgICAgICAgY29tbWVudGFibGVJdGVtLmNvbW1lbnRzID0gY29tbWVudGFibGVJdGVtLmNvbW1lbnRzLmZpbHRlciggKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5faWQgIT0gcmVxdWVzdC5ib2R5Ll9pZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIHVwZGF0ZSB0byB0aGUgZGF0YWJhc2VcbiAgICAgICAgICAgICAgICBhd2FpdCBjb250cm9sbGVyLnJlcG9zaXRvcnkuc2F2ZShpdGVtKTtcbiAgICBcbiAgICAgICAgICAgICAgICAvLyBTZW5kIHRoZSBuZXcgcHJvZHVjdCB3aGljaCBpcyBub3QgYSB0ZW1wbGF0ZSBiYWNrLlxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnN0YXR1cygyMDApLmpzb24oaXRlbSk7XG4gICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpOyB9XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcHVibGljIHN0YXRpYyBhc3luYyBlZGl0Q29tbWVudChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbiwgY29udHJvbGxlcjogQmFzZUNvbnRyb2xsZXIpOiBQcm9taXNlPElCYXNlTW9kZWxEb2M+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW1JZCA9IGNvbnRyb2xsZXIuZ2V0SWQocmVxdWVzdCk7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSBhd2FpdCBjb250cm9sbGVyLnJlcG9zaXRvcnkuc2luZ2xlKGl0ZW1JZCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRUb2tlbjogSVRva2VuUGF5bG9hZCA9IHJlcXVlc3RbQ09OU1QuUkVRVUVTVF9UT0tFTl9MT0NBVElPTl07XG4gICAgXG4gICAgICAgICAgICAgICAgbGV0IGNvbW1lbnRhYmxlSXRlbSA9IChpdGVtIGFzIElDb21tZW50YWJsZSk7XG5cbiAgICAgICAgICAgICAgICBjb21tZW50YWJsZUl0ZW0uY29tbWVudHMubWFwKCAoY29tbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihjb21tZW50Ll9pZCA9PSByZXF1ZXN0LmJvZHkuX2lkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQuY29tbWVudCA9IHJlcXVlc3QuYm9keS5jb21tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tZW50Lm1vZGlmaWVkQXQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICAgICAgICAgLy8gU2F2ZSB0aGUgdXBkYXRlIHRvIHRoZSBkYXRhYmFzZVxuICAgICAgICAgICAgICAgIGF3YWl0IGNvbnRyb2xsZXIucmVwb3NpdG9yeS5zYXZlKGl0ZW0pO1xuICAgIFxuICAgICAgICAgICAgICAgIC8vIFNlbmQgdGhlIG5ldyBwcm9kdWN0IHdoaWNoIGlzIG5vdCBhIHRlbXBsYXRlIGJhY2suXG4gICAgICAgICAgICAgICAgcmVzcG9uc2Uuc3RhdHVzKDIwMCkuanNvbihpdGVtKTtcbiAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikgeyBuZXh0KGVycik7IH1cbiAgICAgICAgfVxuXG4gICAgfTtcbn0iXX0=
