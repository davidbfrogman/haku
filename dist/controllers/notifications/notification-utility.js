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
const repositories_1 = require("../../repositories");
const enumerations_1 = require("../../enumerations");
class NotificationUtility {
    static addNotification(notificationType, item, currentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            // Now we also want to notify the owner of this item.  So we're going to add a notification for 
            // that user that someone added a comment on their item.
            let owned = item;
            let owner = owned.owners.find(owner => {
                return owner.ownershipType == enumerations_1.OwnershipType.user;
            });
            // now in theory there is going to be multiple owners.  In practice this isn't really true though. 
            let notificationRepo = new repositories_1.NotificationRepository();
            let notification = {
                type: notificationType,
                isActionable: false,
                isRead: false,
                notifiedBy: currentToken.userId,
                createdBy: owner.ownerId,
                isSystem: false,
            };
            switch (+notificationType) {
                case enumerations_1.NotificationType.BucketCommentAded:
                case enumerations_1.NotificationType.BucketLiked:
                    notification.bucket = item.id;
                    break;
                case enumerations_1.NotificationType.BucketItemCommentAdded:
                case enumerations_1.NotificationType.BucketItemLiked:
                    notification.bucketItem = item.id;
                    break;
                default:
                    break;
            }
            let notificationDoc = notificationRepo.createFromInterface(notification);
            yield notificationRepo.save(notificationDoc);
        });
    }
}
exports.NotificationUtility = NotificationUtility;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL2NvbnRyb2xsZXJzL25vdGlmaWNhdGlvbnMvbm90aWZpY2F0aW9uLXV0aWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQU1BLHFEQUE4RTtBQUM5RSxxREFBcUU7QUFHckU7SUFFVyxNQUFNLENBQU8sZUFBZSxDQUFDLGdCQUFrQyxFQUFFLElBQW1CLEVBQUUsWUFBMEI7O1lBQ25ILGdHQUFnRztZQUNoRyx3REFBd0Q7WUFDeEQsSUFBSSxLQUFLLEdBQUcsSUFBYyxDQUFDO1lBRTNCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNsQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSw0QkFBYSxDQUFDLElBQUksQ0FBQztZQUNyRCxDQUFDLENBQUMsQ0FBQztZQUVILG1HQUFtRztZQUNuRyxJQUFJLGdCQUFnQixHQUFHLElBQUkscUNBQXNCLEVBQUUsQ0FBQztZQUVwRCxJQUFJLFlBQVksR0FBa0I7Z0JBQzlCLElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLFlBQVksRUFBRSxLQUFLO2dCQUNuQixNQUFNLEVBQUUsS0FBSztnQkFDYixVQUFVLEVBQUUsWUFBWSxDQUFDLE1BQU07Z0JBQy9CLFNBQVMsRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDeEIsUUFBUSxFQUFFLEtBQUs7YUFDbEIsQ0FBQTtZQUVELE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixLQUFLLCtCQUFnQixDQUFDLGlCQUFpQixDQUFDO2dCQUN4QyxLQUFLLCtCQUFnQixDQUFDLFdBQVc7b0JBQ3pCLFlBQVksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDbEMsS0FBSyxDQUFDO2dCQUNWLEtBQUssK0JBQWdCLENBQUMsc0JBQXNCLENBQUM7Z0JBQzdDLEtBQUssK0JBQWdCLENBQUMsZUFBZTtvQkFDakMsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUNsQyxLQUFLLENBQUM7Z0JBQ1Y7b0JBQ0ksS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELElBQUksZUFBZSxHQUFHLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXpFLE1BQU0sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2pELENBQUM7S0FBQTtDQUNKO0FBeENELGtEQXdDQyIsImZpbGUiOiJjb250cm9sbGVycy9ub3RpZmljYXRpb25zL25vdGlmaWNhdGlvbi11dGlsaXR5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSUJ1Y2tldERvYywgQnVja2V0LCBJVG9rZW5QYXlsb2FkLCBJQmFzZU1vZGVsLCBJQnVja2V0LCBJQmFzZU1vZGVsRG9jLCBJTGlrZWFibGUsIElOb3RpZmljYXRpb25Eb2MsIElPd25lZCwgSU5vdGlmaWNhdGlvbiwgQnVja2V0SXRlbSB9IGZyb20gJy4uLy4uL21vZGVscyc7XG5pbXBvcnQgeyBSb3V0ZXIsIFJlcXVlc3QsIFJlc3BvbnNlLCBSZXF1ZXN0UGFyYW1IYW5kbGVyLCBOZXh0RnVuY3Rpb24sIFJlcXVlc3RIYW5kbGVyIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgbW9uZ29vc2UgPSByZXF1aXJlKCdtb25nb29zZScpO1xuaW1wb3J0IHsgU2NoZW1hLCBNb2RlbCwgRG9jdW1lbnQgfSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgeyBCYXNlQ29udHJvbGxlciB9IGZyb20gJy4uL2Jhc2UvYmFzZS5jb250cm9sbGVyJztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJztcbmltcG9ydCB7IEJ1Y2tldFJlcG9zaXRvcnksIE5vdGlmaWNhdGlvblJlcG9zaXRvcnkgfSBmcm9tIFwiLi4vLi4vcmVwb3NpdG9yaWVzXCI7XG5pbXBvcnQgeyBPd25lcnNoaXBUeXBlLCBOb3RpZmljYXRpb25UeXBlIH0gZnJvbSBcIi4uLy4uL2VudW1lcmF0aW9uc1wiO1xuaW1wb3J0IHsgSUNvbW1lbnRhYmxlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2NvbW1lbnRhYmxlLmludGVyZmFjZSc7XG5cbmV4cG9ydCBjbGFzcyBOb3RpZmljYXRpb25VdGlsaXR5IHtcblxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgYWRkTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvblR5cGU6IE5vdGlmaWNhdGlvblR5cGUsIGl0ZW06IElCYXNlTW9kZWxEb2MsIGN1cnJlbnRUb2tlbjpJVG9rZW5QYXlsb2FkKSB7XG4gICAgICAgIC8vIE5vdyB3ZSBhbHNvIHdhbnQgdG8gbm90aWZ5IHRoZSBvd25lciBvZiB0aGlzIGl0ZW0uICBTbyB3ZSdyZSBnb2luZyB0byBhZGQgYSBub3RpZmljYXRpb24gZm9yIFxuICAgICAgICAvLyB0aGF0IHVzZXIgdGhhdCBzb21lb25lIGFkZGVkIGEgY29tbWVudCBvbiB0aGVpciBpdGVtLlxuICAgICAgICBsZXQgb3duZWQgPSBpdGVtIGFzIElPd25lZDtcblxuICAgICAgICBsZXQgb3duZXIgPSBvd25lZC5vd25lcnMuZmluZChvd25lciA9PiB7XG4gICAgICAgICAgICByZXR1cm4gb3duZXIub3duZXJzaGlwVHlwZSA9PSBPd25lcnNoaXBUeXBlLnVzZXI7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG5vdyBpbiB0aGVvcnkgdGhlcmUgaXMgZ29pbmcgdG8gYmUgbXVsdGlwbGUgb3duZXJzLiAgSW4gcHJhY3RpY2UgdGhpcyBpc24ndCByZWFsbHkgdHJ1ZSB0aG91Z2guIFxuICAgICAgICBsZXQgbm90aWZpY2F0aW9uUmVwbyA9IG5ldyBOb3RpZmljYXRpb25SZXBvc2l0b3J5KCk7XG5cbiAgICAgICAgbGV0IG5vdGlmaWNhdGlvbjogSU5vdGlmaWNhdGlvbiA9IHtcbiAgICAgICAgICAgIHR5cGU6IG5vdGlmaWNhdGlvblR5cGUsXG4gICAgICAgICAgICBpc0FjdGlvbmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgaXNSZWFkOiBmYWxzZSxcbiAgICAgICAgICAgIG5vdGlmaWVkQnk6IGN1cnJlbnRUb2tlbi51c2VySWQsXG4gICAgICAgICAgICBjcmVhdGVkQnk6IG93bmVyLm93bmVySWQsXG4gICAgICAgICAgICBpc1N5c3RlbTogZmFsc2UsXG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKCtub3RpZmljYXRpb25UeXBlKSB7XG4gICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblR5cGUuQnVja2V0Q29tbWVudEFkZWQ6XG4gICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblR5cGUuQnVja2V0TGlrZWQ6XG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5idWNrZXQgPSBpdGVtLmlkO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOb3RpZmljYXRpb25UeXBlLkJ1Y2tldEl0ZW1Db21tZW50QWRkZWQ6XG4gICAgICAgICAgICBjYXNlIE5vdGlmaWNhdGlvblR5cGUuQnVja2V0SXRlbUxpa2VkOlxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5idWNrZXRJdGVtID0gaXRlbS5pZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbm90aWZpY2F0aW9uRG9jID0gbm90aWZpY2F0aW9uUmVwby5jcmVhdGVGcm9tSW50ZXJmYWNlKG5vdGlmaWNhdGlvbik7XG5cbiAgICAgICAgYXdhaXQgbm90aWZpY2F0aW9uUmVwby5zYXZlKG5vdGlmaWNhdGlvbkRvYyk7XG4gICAgfVxufVxuIl19
