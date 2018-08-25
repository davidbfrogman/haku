"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const database_1 = require("../config/database/database");
const enums = require("../enumerations");
const BucketItemSchema = new mongoose_1.Schema({
    owners: [{
            _id: { auto: false },
            ownerId: { type: mongoose_1.Schema.Types.ObjectId },
            ownershipType: { type: Number, enum: [enums.EnumHelper.getValuesFromEnum(enums.OwnershipType)] },
        }],
    likedBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'user' }],
    comments: [{
            commentBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user' },
            comment: { type: String },
            createdAt: { type: Date },
            modifiedAt: { type: Date },
        }],
    // What the mongo compass query looks like: {"productLocation":{"$geoWithin":{"$centerSphere":[[40.76665209596496,-73.98568992400604],4.4717033545255673e-7]}}}
    // The order here is Longitude, and then Latitude.
    location: { 'type': { type: String, enum: "Point", default: "Point" }, coordinates: { type: [Number], default: [0, 0] } },
    images: [{
            order: { type: Number },
            isActive: { type: Boolean },
            variations: [{
                    type: { type: Number, enum: [enums.EnumHelper.getValuesFromEnum(enums.ImageType)] },
                    url: { type: String },
                    width: { type: Number },
                    height: { type: Number },
                    key: { type: String },
                }],
        }],
    name: { type: String },
    description: { type: String },
    href: { type: String }
}, { timestamps: true });
BucketItemSchema.index({ location: '2dsphere' });
//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
BucketItemSchema.pre('save', function (next) {
    //If there's any validators, this field requires validation.
    next();
});
// This will compile the schema for the object, and place it in this Instance.
exports.BucketItem = database_1.mongoose.model('bucket-item', BucketItemSchema);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL21vZGVscy9idWNrZXQtaXRlbS5pbnRlcmZhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBa0M7QUFDbEMsMERBQXVEO0FBQ3ZELHlDQUF5QztBQWdCekMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDaEMsTUFBTSxFQUFFLENBQUM7WUFDTCxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ3BCLE9BQU8sRUFBRyxFQUFFLElBQUksRUFBRSxpQkFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7WUFDekMsYUFBYSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFO1NBQ25HLENBQUM7SUFDRixPQUFPLEVBQUUsQ0FBQyxFQUFDLElBQUksRUFBRSxpQkFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBQyxDQUFDO0lBQ3JELFFBQVEsRUFBRSxDQUFDO1lBQ1AsU0FBUyxFQUFFLEVBQUMsSUFBSSxFQUFFLGlCQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFDO1lBQ3JELE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDekIsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtZQUN6QixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO1NBQzdCLENBQUM7SUFDRiwrSkFBK0o7SUFDL0osa0RBQWtEO0lBQ2xELFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFDLEVBQUUsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7SUFDdEgsTUFBTSxFQUFFLENBQUM7WUFDTCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO1lBQ3ZCLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7WUFDM0IsVUFBVSxFQUFFLENBQUM7b0JBQ1QsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFO29CQUNuRixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO29CQUNyQixLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO29CQUN2QixNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO29CQUN4QixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDO2lCQUN0QixDQUFDO1NBQ0wsQ0FBQztJQUNGLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7SUFDdEIsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtJQUM3QixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO0NBQ3pCLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUV6QixnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQztBQUUvQyxvR0FBb0c7QUFDcEcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLElBQUk7SUFDdkMsNERBQTREO0lBQzVELElBQUksRUFBRSxDQUFDO0FBQ1gsQ0FBQyxDQUFDLENBQUM7QUFFSCw4RUFBOEU7QUFDakUsUUFBQSxVQUFVLEdBQUcsbUJBQVEsQ0FBQyxLQUFLLENBQWlCLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDIiwiZmlsZSI6Im1vZGVscy9idWNrZXQtaXRlbS5pbnRlcmZhY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTY2hlbWEgfSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgeyBtb25nb29zZSB9IGZyb20gJy4uL2NvbmZpZy9kYXRhYmFzZS9kYXRhYmFzZSc7XG5pbXBvcnQgKiBhcyBlbnVtcyBmcm9tIFwiLi4vZW51bWVyYXRpb25zXCI7XG5pbXBvcnQgeyBJQ29tbWVudGFibGUgfSBmcm9tICcuL2NvbW1lbnRhYmxlLmludGVyZmFjZSc7XG5pbXBvcnQgeyBJSGFzTG9jYXRpb24gfSBmcm9tICcuL2hhcy1sb2NhdGlvbi5pbnRlcmZhY2UnO1xuaW1wb3J0IHsgSUJhc2VNb2RlbCwgSUJhc2VNb2RlbERvYywgSUhhc0ltYWdlcywgSUxpa2VhYmxlLCBJT3duZWQsIElUaW1lU3RhbXBlZCB9IGZyb20gXCIuL2luZGV4XCI7XG5cblxuZXhwb3J0IGludGVyZmFjZSBJQnVja2V0SXRlbSBleHRlbmRzIElCYXNlTW9kZWwsIElMaWtlYWJsZSwgSU93bmVkLCBJVGltZVN0YW1wZWQsIElDb21tZW50YWJsZSwgSUhhc0ltYWdlcywgSUhhc0xvY2F0aW9uIHtcbiAgICBuYW1lPzogc3RyaW5nLFxuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nLFxuICAgIGhyZWY/OiBzdHJpbmcsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUJ1Y2tldEl0ZW1Eb2MgZXh0ZW5kcyBJQnVja2V0SXRlbSwgSUJhc2VNb2RlbERvYyB7XG5cbn1cblxuY29uc3QgQnVja2V0SXRlbVNjaGVtYSA9IG5ldyBTY2hlbWEoe1xuICAgIG93bmVyczogW3tcbiAgICAgICAgX2lkOiB7IGF1dG86IGZhbHNlIH0sXG4gICAgICAgIG93bmVySWQ6ICB7IHR5cGU6IFNjaGVtYS5UeXBlcy5PYmplY3RJZCB9LFxuICAgICAgICBvd25lcnNoaXBUeXBlOiB7IHR5cGU6IE51bWJlciwgZW51bTogW2VudW1zLkVudW1IZWxwZXIuZ2V0VmFsdWVzRnJvbUVudW0oZW51bXMuT3duZXJzaGlwVHlwZSldIH0sXG4gICAgfV0sXG4gICAgbGlrZWRCeTogW3t0eXBlOiBTY2hlbWEuVHlwZXMuT2JqZWN0SWQsIHJlZjogJ3VzZXInfV0sXG4gICAgY29tbWVudHM6IFt7XG4gICAgICAgIGNvbW1lbnRCeToge3R5cGU6IFNjaGVtYS5UeXBlcy5PYmplY3RJZCwgcmVmOiAndXNlcid9LFxuICAgICAgICBjb21tZW50OiB7IHR5cGU6IFN0cmluZyB9LFxuICAgICAgICBjcmVhdGVkQXQ6IHsgdHlwZTogRGF0ZSB9LFxuICAgICAgICBtb2RpZmllZEF0OiB7IHR5cGU6IERhdGUgfSxcbiAgICB9XSxcbiAgICAvLyBXaGF0IHRoZSBtb25nbyBjb21wYXNzIHF1ZXJ5IGxvb2tzIGxpa2U6IHtcInByb2R1Y3RMb2NhdGlvblwiOntcIiRnZW9XaXRoaW5cIjp7XCIkY2VudGVyU3BoZXJlXCI6W1s0MC43NjY2NTIwOTU5NjQ5NiwtNzMuOTg1Njg5OTI0MDA2MDRdLDQuNDcxNzAzMzU0NTI1NTY3M2UtN119fX1cbiAgICAvLyBUaGUgb3JkZXIgaGVyZSBpcyBMb25naXR1ZGUsIGFuZCB0aGVuIExhdGl0dWRlLlxuICAgIGxvY2F0aW9uOiB7ICd0eXBlJzoge3R5cGU6IFN0cmluZywgZW51bTogXCJQb2ludFwiLCBkZWZhdWx0OiBcIlBvaW50XCJ9LCBjb29yZGluYXRlczogeyB0eXBlOiBbTnVtYmVyXSwgZGVmYXVsdDogWzAsMF0gfSB9LFxuICAgIGltYWdlczogW3tcbiAgICAgICAgb3JkZXI6IHsgdHlwZTogTnVtYmVyIH0sXG4gICAgICAgIGlzQWN0aXZlOiB7IHR5cGU6IEJvb2xlYW4gfSxcbiAgICAgICAgdmFyaWF0aW9uczogW3tcbiAgICAgICAgICAgIHR5cGU6IHsgdHlwZTogTnVtYmVyLCBlbnVtOiBbZW51bXMuRW51bUhlbHBlci5nZXRWYWx1ZXNGcm9tRW51bShlbnVtcy5JbWFnZVR5cGUpXSB9LFxuICAgICAgICAgICAgdXJsOiB7IHR5cGU6IFN0cmluZyB9LFxuICAgICAgICAgICAgd2lkdGg6IHsgdHlwZTogTnVtYmVyIH0sXG4gICAgICAgICAgICBoZWlnaHQ6IHsgdHlwZTogTnVtYmVyIH0sXG4gICAgICAgICAgICBrZXk6IHt0eXBlOiBTdHJpbmd9LFxuICAgICAgICB9XSxcbiAgICB9XSxcbiAgICBuYW1lOiB7IHR5cGU6IFN0cmluZyB9LFxuICAgIGRlc2NyaXB0aW9uOiB7IHR5cGU6IFN0cmluZyB9LFxuICAgIGhyZWY6IHsgdHlwZTogU3RyaW5nIH1cbn0sIHsgdGltZXN0YW1wczogdHJ1ZSB9KTtcblxuQnVja2V0SXRlbVNjaGVtYS5pbmRleCh7bG9jYXRpb246ICcyZHNwaGVyZSd9KTtcblxuLy9JZiB5b3UgZG8gYW55IHByZSBzYXZlIG1ldGhvZHMsIGFuZCB5b3UgdXNlIGZhdCBhcnJvdyBzeW50YXggJ3RoaXMnIGRvZXNuJ3QgcmVmZXIgdG8gdGhlIGRvY3VtZW50LlxuQnVja2V0SXRlbVNjaGVtYS5wcmUoJ3NhdmUnLCBmdW5jdGlvbiAobmV4dCkge1xuICAgIC8vSWYgdGhlcmUncyBhbnkgdmFsaWRhdG9ycywgdGhpcyBmaWVsZCByZXF1aXJlcyB2YWxpZGF0aW9uLlxuICAgIG5leHQoKTtcbn0pO1xuXG4vLyBUaGlzIHdpbGwgY29tcGlsZSB0aGUgc2NoZW1hIGZvciB0aGUgb2JqZWN0LCBhbmQgcGxhY2UgaXQgaW4gdGhpcyBJbnN0YW5jZS5cbmV4cG9ydCBjb25zdCBCdWNrZXRJdGVtID0gbW9uZ29vc2UubW9kZWw8SUJ1Y2tldEl0ZW1Eb2M+KCdidWNrZXQtaXRlbScsIEJ1Y2tldEl0ZW1TY2hlbWEpOyJdfQ==