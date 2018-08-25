"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BucketType;
(function (BucketType) {
    BucketType[BucketType["country"] = 1] = "country";
    BucketType[BucketType["activity"] = 2] = "activity";
    BucketType[BucketType["continent"] = 3] = "continent";
})(BucketType = exports.BucketType || (exports.BucketType = {}));
var LoginStrategy;
(function (LoginStrategy) {
    LoginStrategy[LoginStrategy["Local"] = 1] = "Local";
    LoginStrategy[LoginStrategy["Facebook"] = 2] = "Facebook";
    LoginStrategy[LoginStrategy["Instagram"] = 3] = "Instagram";
    LoginStrategy[LoginStrategy["Google"] = 4] = "Google";
})(LoginStrategy = exports.LoginStrategy || (exports.LoginStrategy = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType[NotificationType["BucketLiked"] = 1] = "BucketLiked";
    NotificationType[NotificationType["BucketItemLiked"] = 2] = "BucketItemLiked";
    NotificationType[NotificationType["BucketCommentAded"] = 3] = "BucketCommentAded";
    NotificationType[NotificationType["BucketItemCommentAdded"] = 4] = "BucketItemCommentAdded";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
var PushNotificationType;
(function (PushNotificationType) {
    PushNotificationType[PushNotificationType["orderSent"] = 1] = "orderSent";
    PushNotificationType[PushNotificationType["orderAccepted"] = 2] = "orderAccepted";
    PushNotificationType[PushNotificationType["orderRejected"] = 3] = "orderRejected";
    PushNotificationType[PushNotificationType["orderPickupArriving"] = 4] = "orderPickupArriving";
    PushNotificationType[PushNotificationType["orderPickedUp"] = 5] = "orderPickedUp";
    PushNotificationType[PushNotificationType["orderDelivered"] = 6] = "orderDelivered";
})(PushNotificationType = exports.PushNotificationType || (exports.PushNotificationType = {}));
var OwnershipType;
(function (OwnershipType) {
    OwnershipType[OwnershipType["user"] = 3] = "user";
})(OwnershipType = exports.OwnershipType || (exports.OwnershipType = {}));
var ProductType;
(function (ProductType) {
    ProductType[ProductType["stem"] = 1] = "stem";
    ProductType[ProductType["pottedPlant"] = 2] = "pottedPlant";
    ProductType[ProductType["tool"] = 3] = "tool";
})(ProductType = exports.ProductType || (exports.ProductType = {}));
var ImageType;
(function (ImageType) {
    ImageType[ImageType["icon"] = 1] = "icon";
    ImageType[ImageType["thumbnail"] = 2] = "thumbnail";
    ImageType[ImageType["small"] = 3] = "small";
    ImageType[ImageType["medium"] = 4] = "medium";
    ImageType[ImageType["large"] = 5] = "large";
    ImageType[ImageType["raw"] = 6] = "raw";
})(ImageType = exports.ImageType || (exports.ImageType = {}));
var AddressType;
(function (AddressType) {
    AddressType[AddressType["pickup"] = 1] = "pickup";
    AddressType[AddressType["business"] = 2] = "business";
    AddressType[AddressType["billing"] = 3] = "billing";
})(AddressType = exports.AddressType || (exports.AddressType = {}));
var EmailType;
(function (EmailType) {
    EmailType[EmailType["pickup"] = 1] = "pickup";
    EmailType[EmailType["business"] = 2] = "business";
    EmailType[EmailType["billing"] = 3] = "billing";
})(EmailType = exports.EmailType || (exports.EmailType = {}));
var ContactType;
(function (ContactType) {
    ContactType[ContactType["pickup"] = 1] = "pickup";
    ContactType[ContactType["business"] = 2] = "business";
    ContactType[ContactType["billing"] = 3] = "billing";
})(ContactType = exports.ContactType || (exports.ContactType = {}));
var TeamMemberType;
(function (TeamMemberType) {
    TeamMemberType[TeamMemberType["member"] = 1] = "member";
    TeamMemberType[TeamMemberType["owner"] = 2] = "owner";
})(TeamMemberType = exports.TeamMemberType || (exports.TeamMemberType = {}));
var PhoneType;
(function (PhoneType) {
    PhoneType[PhoneType["pickup"] = 1] = "pickup";
    PhoneType[PhoneType["business"] = 2] = "business";
    PhoneType[PhoneType["billing"] = 3] = "billing";
})(PhoneType = exports.PhoneType || (exports.PhoneType = {}));
var PrimaryColor;
(function (PrimaryColor) {
    PrimaryColor[PrimaryColor["red"] = 1] = "red";
    PrimaryColor[PrimaryColor["blue"] = 2] = "blue";
    PrimaryColor[PrimaryColor["green"] = 3] = "green";
    PrimaryColor[PrimaryColor["white"] = 4] = "white";
    PrimaryColor[PrimaryColor["brown"] = 5] = "brown";
    PrimaryColor[PrimaryColor["orange"] = 6] = "orange";
    PrimaryColor[PrimaryColor["yellow"] = 7] = "yellow";
    PrimaryColor[PrimaryColor["purple"] = 8] = "purple";
    PrimaryColor[PrimaryColor["black"] = 9] = "black";
    PrimaryColor[PrimaryColor["other"] = 10] = "other";
})(PrimaryColor = exports.PrimaryColor || (exports.PrimaryColor = {}));
class EnumHelper {
    static getValuesFromEnum(e) {
        let keys = Object.keys(e);
        let enumValues = new Array();
        keys.forEach(key => {
            enumValues.push(e[key]);
        });
        return enumValues;
    }
}
exports.EnumHelper = EnumHelper;
//Enum Parsing - Remember basically you really need to cast it as string for it to work. 
//var colorId = <string>myOtherObject.colorId; // Force string value here
//var color: Color = Color[colorId]; // Fixes lookup here. 

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL2VudW1lcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQVksVUFJWDtBQUpELFdBQVksVUFBVTtJQUNsQixpREFBVyxDQUFBO0lBQ1gsbURBQVksQ0FBQTtJQUNaLHFEQUFhLENBQUE7QUFDakIsQ0FBQyxFQUpXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBSXJCO0FBRUQsSUFBWSxhQUtYO0FBTEQsV0FBWSxhQUFhO0lBQ3JCLG1EQUFTLENBQUE7SUFDVCx5REFBWSxDQUFBO0lBQ1osMkRBQWEsQ0FBQTtJQUNiLHFEQUFVLENBQUE7QUFDZCxDQUFDLEVBTFcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFLeEI7QUFFRCxJQUFZLGdCQUtYO0FBTEQsV0FBWSxnQkFBZ0I7SUFDeEIscUVBQWUsQ0FBQTtJQUNmLDZFQUFtQixDQUFBO0lBQ25CLGlGQUFxQixDQUFBO0lBQ3JCLDJGQUEwQixDQUFBO0FBQzlCLENBQUMsRUFMVyxnQkFBZ0IsR0FBaEIsd0JBQWdCLEtBQWhCLHdCQUFnQixRQUszQjtBQUVELElBQVksb0JBT1g7QUFQRCxXQUFZLG9CQUFvQjtJQUM1Qix5RUFBYSxDQUFBO0lBQ2IsaUZBQWlCLENBQUE7SUFDakIsaUZBQWlCLENBQUE7SUFDakIsNkZBQXVCLENBQUE7SUFDdkIsaUZBQWlCLENBQUE7SUFDakIsbUZBQWtCLENBQUE7QUFDdEIsQ0FBQyxFQVBXLG9CQUFvQixHQUFwQiw0QkFBb0IsS0FBcEIsNEJBQW9CLFFBTy9CO0FBRUQsSUFBWSxhQUVYO0FBRkQsV0FBWSxhQUFhO0lBQ3JCLGlEQUFRLENBQUE7QUFDWixDQUFDLEVBRlcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFFeEI7QUFFRCxJQUFZLFdBSVg7QUFKRCxXQUFZLFdBQVc7SUFDbkIsNkNBQVEsQ0FBQTtJQUNSLDJEQUFlLENBQUE7SUFDZiw2Q0FBUSxDQUFBO0FBQ1osQ0FBQyxFQUpXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBSXRCO0FBRUQsSUFBWSxTQU9YO0FBUEQsV0FBWSxTQUFTO0lBQ2pCLHlDQUFRLENBQUE7SUFDUixtREFBYSxDQUFBO0lBQ2IsMkNBQVMsQ0FBQTtJQUNULDZDQUFVLENBQUE7SUFDViwyQ0FBUyxDQUFBO0lBQ1QsdUNBQU8sQ0FBQTtBQUNYLENBQUMsRUFQVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQU9wQjtBQUVELElBQVksV0FJWDtBQUpELFdBQVksV0FBVztJQUNuQixpREFBVSxDQUFBO0lBQ1YscURBQVksQ0FBQTtJQUNaLG1EQUFXLENBQUE7QUFDZixDQUFDLEVBSlcsV0FBVyxHQUFYLG1CQUFXLEtBQVgsbUJBQVcsUUFJdEI7QUFFRCxJQUFZLFNBSVg7QUFKRCxXQUFZLFNBQVM7SUFDakIsNkNBQVUsQ0FBQTtJQUNWLGlEQUFZLENBQUE7SUFDWiwrQ0FBVyxDQUFBO0FBQ2YsQ0FBQyxFQUpXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBSXBCO0FBRUQsSUFBWSxXQUlYO0FBSkQsV0FBWSxXQUFXO0lBQ25CLGlEQUFVLENBQUE7SUFDVixxREFBWSxDQUFBO0lBQ1osbURBQVcsQ0FBQTtBQUNmLENBQUMsRUFKVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQUl0QjtBQUVELElBQVksY0FHWDtBQUhELFdBQVksY0FBYztJQUN0Qix1REFBVSxDQUFBO0lBQ1YscURBQVMsQ0FBQTtBQUNiLENBQUMsRUFIVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQUd6QjtBQUVELElBQVksU0FJWDtBQUpELFdBQVksU0FBUztJQUNqQiw2Q0FBVSxDQUFBO0lBQ1YsaURBQVksQ0FBQTtJQUNaLCtDQUFXLENBQUE7QUFDZixDQUFDLEVBSlcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFJcEI7QUFFRCxJQUFZLFlBV1g7QUFYRCxXQUFZLFlBQVk7SUFDcEIsNkNBQU8sQ0FBQTtJQUNQLCtDQUFRLENBQUE7SUFDUixpREFBUyxDQUFBO0lBQ1QsaURBQVMsQ0FBQTtJQUNULGlEQUFTLENBQUE7SUFDVCxtREFBVSxDQUFBO0lBQ1YsbURBQVUsQ0FBQTtJQUNWLG1EQUFVLENBQUE7SUFDVixpREFBUyxDQUFBO0lBQ1Qsa0RBQVUsQ0FBQTtBQUNkLENBQUMsRUFYVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQVd2QjtBQUVEO0lBQ1csTUFBTSxDQUFDLGlCQUFpQixDQUFJLENBQUk7UUFDbkMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLFVBQVUsR0FBRyxJQUFJLEtBQUssRUFBVSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDZixVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0NBQ0o7QUFURCxnQ0FTQztBQUVELHlGQUF5RjtBQUN6Rix5RUFBeUU7QUFDekUsMERBQTBEIiwiZmlsZSI6ImVudW1lcmF0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIEJ1Y2tldFR5cGUge1xuICAgIGNvdW50cnkgPSAxLFxuICAgIGFjdGl2aXR5ID0gMixcbiAgICBjb250aW5lbnQgPSAzLFxufVxuXG5leHBvcnQgZW51bSBMb2dpblN0cmF0ZWd5IHtcbiAgICBMb2NhbCA9IDEsXG4gICAgRmFjZWJvb2sgPSAyLFxuICAgIEluc3RhZ3JhbSA9IDMsXG4gICAgR29vZ2xlID0gNFxufVxuXG5leHBvcnQgZW51bSBOb3RpZmljYXRpb25UeXBlIHtcbiAgICBCdWNrZXRMaWtlZCA9IDEsXG4gICAgQnVja2V0SXRlbUxpa2VkID0gMixcbiAgICBCdWNrZXRDb21tZW50QWRlZCA9IDMsXG4gICAgQnVja2V0SXRlbUNvbW1lbnRBZGRlZCA9IDQsXG59XG5cbmV4cG9ydCBlbnVtIFB1c2hOb3RpZmljYXRpb25UeXBlIHtcbiAgICBvcmRlclNlbnQgPSAxLFxuICAgIG9yZGVyQWNjZXB0ZWQgPSAyLFxuICAgIG9yZGVyUmVqZWN0ZWQgPSAzLFxuICAgIG9yZGVyUGlja3VwQXJyaXZpbmcgPSA0LFxuICAgIG9yZGVyUGlja2VkVXAgPSA1LFxuICAgIG9yZGVyRGVsaXZlcmVkID0gNixcbn1cblxuZXhwb3J0IGVudW0gT3duZXJzaGlwVHlwZSB7XG4gICAgdXNlciA9IDNcbn1cblxuZXhwb3J0IGVudW0gUHJvZHVjdFR5cGUge1xuICAgIHN0ZW0gPSAxLFxuICAgIHBvdHRlZFBsYW50ID0gMixcbiAgICB0b29sID0gM1xufVxuXG5leHBvcnQgZW51bSBJbWFnZVR5cGUge1xuICAgIGljb24gPSAxLFxuICAgIHRodW1ibmFpbCA9IDIsXG4gICAgc21hbGwgPSAzLFxuICAgIG1lZGl1bSA9IDQsXG4gICAgbGFyZ2UgPSA1LFxuICAgIHJhdyA9IDZcbn1cblxuZXhwb3J0IGVudW0gQWRkcmVzc1R5cGUge1xuICAgIHBpY2t1cCA9IDEsXG4gICAgYnVzaW5lc3MgPSAyLFxuICAgIGJpbGxpbmcgPSAzLFxufVxuXG5leHBvcnQgZW51bSBFbWFpbFR5cGUge1xuICAgIHBpY2t1cCA9IDEsXG4gICAgYnVzaW5lc3MgPSAyLFxuICAgIGJpbGxpbmcgPSAzLFxufVxuXG5leHBvcnQgZW51bSBDb250YWN0VHlwZSB7XG4gICAgcGlja3VwID0gMSxcbiAgICBidXNpbmVzcyA9IDIsXG4gICAgYmlsbGluZyA9IDMsXG59XG5cbmV4cG9ydCBlbnVtIFRlYW1NZW1iZXJUeXBlIHtcbiAgICBtZW1iZXIgPSAxLFxuICAgIG93bmVyID0gMixcbn1cblxuZXhwb3J0IGVudW0gUGhvbmVUeXBlIHtcbiAgICBwaWNrdXAgPSAxLFxuICAgIGJ1c2luZXNzID0gMixcbiAgICBiaWxsaW5nID0gMyxcbn1cblxuZXhwb3J0IGVudW0gUHJpbWFyeUNvbG9yIHtcbiAgICByZWQgPSAxLFxuICAgIGJsdWUgPSAyLFxuICAgIGdyZWVuID0gMyxcbiAgICB3aGl0ZSA9IDQsXG4gICAgYnJvd24gPSA1LFxuICAgIG9yYW5nZSA9IDYsXG4gICAgeWVsbG93ID0gNyxcbiAgICBwdXJwbGUgPSA4LFxuICAgIGJsYWNrID0gOSxcbiAgICBvdGhlciA9IDEwLFxufVxuXG5leHBvcnQgY2xhc3MgRW51bUhlbHBlciB7XG4gICAgcHVibGljIHN0YXRpYyBnZXRWYWx1ZXNGcm9tRW51bTxFPihlOiBFKTogQXJyYXk8TnVtYmVyPiB7XG4gICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMoZSk7XG4gICAgICAgIGxldCBlbnVtVmFsdWVzID0gbmV3IEFycmF5PE51bWJlcj4oKTtcbiAgICAgICAga2V5cy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICBlbnVtVmFsdWVzLnB1c2goZVtrZXldKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBlbnVtVmFsdWVzO1xuICAgIH1cbn1cblxuLy9FbnVtIFBhcnNpbmcgLSBSZW1lbWJlciBiYXNpY2FsbHkgeW91IHJlYWxseSBuZWVkIHRvIGNhc3QgaXQgYXMgc3RyaW5nIGZvciBpdCB0byB3b3JrLiBcbi8vdmFyIGNvbG9ySWQgPSA8c3RyaW5nPm15T3RoZXJPYmplY3QuY29sb3JJZDsgLy8gRm9yY2Ugc3RyaW5nIHZhbHVlIGhlcmVcbi8vdmFyIGNvbG9yOiBDb2xvciA9IENvbG9yW2NvbG9ySWRdOyAvLyBGaXhlcyBsb29rdXAgaGVyZS4iXX0=
