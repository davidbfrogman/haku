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
const fs = require("async-file");
const path = require("path");
const sharp = require("sharp");
const api_error_handler_1 = require("../../api-error-handler");
const config_1 = require("../../config/config");
const constants_1 = require("../../constants");
const enums = require("../../enumerations");
const index_1 = require("../../services/index");
const log = require("winston");
function ImageControllerMixin(Base) {
    return _a = class extends Base {
            constructor() {
                super(...arguments);
                this.DefaultContentImageStyles = [{
                        imageType: enums.ImageType.thumbnail, height: 150, width: 150,
                    },
                    {
                        imageType: enums.ImageType.medium, height: 500,
                    },
                    {
                        imageType: enums.ImageType.large, height: 1024,
                    }
                ];
            }
            static imageTransformer(request, response, next, controller, imageStyles) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        if (request && request.files && request.files[0]) {
                            // Grab the multer file off the request.  
                            const rawImageFile = request.files[0];
                            try {
                                //Now we go get the product
                                let itemDoc = yield controller.repository.single(request.params['id']);
                                let itemWithImage = itemDoc;
                                const sharpImageDetails = new Array();
                                for (let imageStyle of imageStyles) {
                                    imageStyle.output = yield this.generateVariation(imageStyle.imageType, rawImageFile, response, imageStyle.width, imageStyle.height, imageStyle.quality);
                                }
                                // figure out what the maximum product image order number is, and add one to it. 
                                const nextOrderNum = this.getNextOrderNumber(itemWithImage) + 10;
                                let image = {
                                    isActive: true,
                                    order: nextOrderNum,
                                    variations: new Array()
                                };
                                imageStyles.forEach(imageStyle => {
                                    this.addVariation(image, rawImageFile, imageStyle.output, imageStyle.imageType, nextOrderNum);
                                });
                                itemDoc = yield controller.repository.single(request.params['id']);
                                itemWithImage = itemDoc;
                                // If this is the first image, we're going to create a new array.
                                if (!itemWithImage.images) {
                                    itemWithImage.images = new Array();
                                }
                                itemWithImage.images.push(image);
                                // Save the updated product.
                                const updatedItem = yield controller.repository.save(itemDoc);
                                response.status(200).json(updatedItem);
                            }
                            catch (err) {
                                this.rollbackItemImages(rawImageFile, true, imageStyles);
                                api_error_handler_1.ApiErrorHandler.sendError(`Error during image processing. ${err}`, 500, response, null, err);
                            }
                            finally {
                                this.rollbackItemImages(rawImageFile, false, imageStyles);
                            }
                        }
                        else {
                            api_error_handler_1.ApiErrorHandler.sendError(`File wasn't present on the request.  Are you sure you sent the file with field named 'file'`, 500, response, null, null);
                        }
                        // Don't forget to call next here... who knows what the next handler will want to do. 
                        next();
                    }
                    catch (err) {
                        api_error_handler_1.ApiErrorHandler.sendError(`Image Uploading / Resizing failed. Bucket Items - ${err}`, 500, response, null, err);
                    }
                });
            }
            static getNextOrderNumber(product) {
                if (product && product.images && product.images.length > 0) {
                    let max = 0;
                    product.images.forEach(image => {
                        max = Math.max(max, image.order);
                    });
                    return ++max;
                }
                return 0;
            }
            static addVariation(image, file, sharpInfo, type, order) {
                image.variations.push({
                    type: type,
                    height: sharpInfo.height,
                    width: sharpInfo.width,
                    // I want to end up with : dev-cdn.lyraatlas.com/filename.jpg
                    url: `${config_1.Config.active.get('CDNLocation')}${'.lyraatlas.com'}/${index_1.AmazonS3Service.variationName(type, file)}`,
                    key: index_1.AmazonS3Service.variationName(type, file)
                });
                return image;
            }
            static generateVariation(imageType, rawImageFile, response, width = null, height = null, quality = 80) {
                return __awaiter(this, void 0, void 0, function* () {
                    // If you don't turn off cache when you're trying to cleanup the files, you won't be able to deconste the file.
                    sharp.cache(false);
                    const outputInfo = yield sharp(path.resolve(__dirname, this.uploadDirectoryRootLocation, `${constants_1.CONST.IMAGE_UPLOAD_PATH}${rawImageFile.filename}`))
                        .resize(width, height)
                        .crop(sharp.gravity.center)
                        .toFormat(sharp.format.png, {
                        quality: quality,
                    })
                        .toFile(`${constants_1.CONST.IMAGE_UPLOAD_PATH}${index_1.AmazonS3Service.variationName(imageType, rawImageFile)}`);
                    yield index_1.AmazonS3Service.uploadImageToS3(response, rawImageFile, imageType);
                    return outputInfo;
                });
            }
            static rollbackItemImages(rawImageFile, cleanS3, imageStyles) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        // first we're going to try and clean up the image file that was uploaded to the server.
                        yield fs.delete(path.resolve(__dirname, this.uploadDirectoryRootLocation, `${constants_1.CONST.IMAGE_UPLOAD_PATH}${rawImageFile.filename}`));
                    }
                    catch (err) {
                        log.error(`SWALLOWING! There was an error trying to delete the file that was created during upload.
            Upload path could fill. filename: ${rawImageFile.filename}  Exception: ${err}`);
                    }
                    imageStyles.forEach(imageStyle => {
                        try {
                            this.rollbackVariations(rawImageFile, imageStyle.imageType, cleanS3);
                        }
                        catch (err) {
                            log.error(`SWALLOWING!  There was an error trying to cleanup the files from the server, and S3.
                Upload path could fill. filename: ${rawImageFile.filename}  Exception: ${err}`);
                        }
                    });
                });
            }
            static rollbackVariations(rawImageFile, imageType, cleanS3) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        // now we're going to try and clean up all the variations that were created.
                        yield fs.delete(path.resolve(__dirname, this.uploadDirectoryRootLocation, `${constants_1.CONST.IMAGE_UPLOAD_PATH}${index_1.AmazonS3Service.variationName(imageType, rawImageFile)}`));
                    }
                    catch (err) {
                        log.error(`SWALLOWING! While trying to cleanup image variations there was an error. filename: ${index_1.AmazonS3Service.variationName(imageType, rawImageFile)}
             Exception: ${err}`);
                    }
                    try {
                        if (cleanS3) {
                            index_1.AmazonS3Service.cleanAws(rawImageFile, imageType);
                        }
                    }
                    catch (err) {
                        log.error(`SWALLOWING! Exception while trying to clean the image from S3 KEY: ${index_1.AmazonS3Service.variationName(imageType, rawImageFile)}
            Exception: ${err}`);
                    }
                });
            }
            deleteImage(request, response, next, controller) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const itemId = yield controller.getId(request);
                        const imageId = request && request.params ? request.params['imageId'] : null;
                        const itemDoc = yield controller.repository.single(itemId);
                        const itemWithImages = itemDoc;
                        //now we need to get the product image this request is referring to.
                        const imageIndex = itemWithImages.images.findIndex((image) => {
                            return image._id == imageId;
                        });
                        if (imageIndex >= 0) {
                            itemWithImages.images[imageIndex].variations.forEach((variation) => __awaiter(this, void 0, void 0, function* () {
                                yield index_1.AmazonS3Service.deleteFileFromS3(variation.key);
                            }));
                            itemWithImages.images.splice(imageIndex, 1);
                            yield controller.repository.save(itemDoc);
                            response.status(200).json(itemWithImages.images);
                            return itemDoc;
                        }
                        else {
                            throw { message: "Image not found.", status: 404 };
                        }
                    }
                    catch (err) {
                        next(err);
                    }
                });
            }
            static destroyImages(itemDoc) {
                return __awaiter(this, void 0, void 0, function* () {
                    // First we go out and get the model from the database
                    const itemWithImages = itemDoc;
                    if (!itemDoc) {
                        throw { message: "Item Not Found, In Destroy Image Hook", status: 404 };
                    }
                    // These really wordy for loops are needed, because those mongoose arrays don't always behave with a foreach.
                    // We're only going to delete the product images if this is a product template.
                    if (itemWithImages && itemWithImages.images) {
                        for (var i = 0; i < itemWithImages.images.length; i++) {
                            var image = itemWithImages.images[i];
                            if (image.variations && image.variations.length > 0) {
                                for (var j = 0; j < image.variations.length; j++) {
                                    var variation = image.variations[j];
                                    yield index_1.AmazonS3Service.deleteFileFromS3(variation.key);
                                }
                            }
                        }
                    }
                    return itemDoc;
                });
            }
        },
        _a.uploadDirectoryRootLocation = '../../../',
        _a;
    var _a;
}
exports.ImageControllerMixin = ImageControllerMixin;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL2NvbnRyb2xsZXJzL2Jhc2UvaW1hZ2VzLmNvbnRyb2xsZXIubWl4aW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUVqQyw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLCtEQUEwRDtBQUMxRCxnREFBNkM7QUFDN0MsK0NBQXdDO0FBQ3hDLDRDQUE0QztBQUk1QyxnREFBdUQ7QUFHdkQsK0JBQWdDO0FBV2hDLDhCQUFnRSxJQUFXO0lBQ3ZFLE1BQU0sTUFBQyxLQUFNLFNBQVEsSUFBSTtZQUFsQjs7Z0JBRUksOEJBQXlCLEdBQWtCLENBQUM7d0JBQy9DLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHO3FCQUNoRTtvQkFDRDt3QkFDSSxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUc7cUJBQ2pEO29CQUNEO3dCQUNJLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSTtxQkFDakQ7aUJBQ0EsQ0FBQTtZQTRNTCxDQUFDO1lBeE1VLE1BQU0sQ0FBTyxnQkFBZ0IsQ0FBQyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0IsRUFBRSxVQUEwQixFQUFFLFdBQTBCOztvQkFDakosSUFBSSxDQUFDO3dCQUNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMvQywwQ0FBMEM7NEJBQzFDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFlLENBQUM7NEJBQ3BELElBQUksQ0FBQztnQ0FDRCwyQkFBMkI7Z0NBQzNCLElB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R0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUNwRCxJQUFJLEtBQUssR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNyQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2xELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQ0FDL0MsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQ0FDcEMsTUFBTSx1QkFBZSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQ0FDMUQsQ0FBQzs0QkFDTCxDQUFDO3dCQUNMLENBQUM7b0JBQ0wsQ0FBQztvQkFDRCxNQUFNLENBQUMsT0FBTyxDQUFBO2dCQUNsQixDQUFDO2FBQUE7U0FDSjtRQTFNdUIsOEJBQTJCLEdBQVcsV0FBWTtXQTBNekU7O0FBQ0wsQ0FBQztBQXpORCxvREF5TkMiLCJmaWxlIjoiY29udHJvbGxlcnMvYmFzZS9pbWFnZXMuY29udHJvbGxlci5taXhpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2FzeW5jLWZpbGUnO1xuaW1wb3J0IHsgTmV4dEZ1bmN0aW9uLCBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHNoYXJwIGZyb20gJ3NoYXJwJztcbmltcG9ydCB7IEFwaUVycm9ySGFuZGxlciB9IGZyb20gXCIuLi8uLi9hcGktZXJyb3ItaGFuZGxlclwiO1xuaW1wb3J0IHsgQ29uZmlnIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbmZpZyc7XG5pbXBvcnQgeyBDT05TVCB9IGZyb20gXCIuLi8uLi9jb25zdGFudHNcIjtcbmltcG9ydCAqIGFzIGVudW1zIGZyb20gJy4uLy4uL2VudW1lcmF0aW9ucyc7XG5pbXBvcnQgeyBNdWx0ZXJGaWxlIH0gZnJvbSAnLi4vLi4vbW9kZWxzJztcbmltcG9ydCB7IElCYXNlTW9kZWxEb2MsIElIYXNJbWFnZXMgfSBmcm9tICcuLi8uLi9tb2RlbHMvJztcbmltcG9ydCB7IElJbWFnZSwgSUltYWdlVmFyaWF0aW9uIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2ltYWdlLmludGVyZmFjZSc7XG5pbXBvcnQgeyBBbWF6b25TM1NlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9pbmRleCc7XG5pbXBvcnQgeyBCYXNlQ29udHJvbGxlciB9IGZyb20gJy4vYmFzZS5jb250cm9sbGVyJztcbmltcG9ydCBtb25nb29zZSA9IHJlcXVpcmUoJ21vbmdvb3NlJyk7XG5pbXBvcnQgbG9nID0gcmVxdWlyZSgnd2luc3RvbicpO1xuZXhwb3J0IHR5cGUgQ29uc3RydWN0b3I8VCA9IHt9PiA9IG5ldyAoLi4uYXJnczogYW55W10pID0+IFQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUltYWdlU3R5bGUge1xuICAgIGltYWdlVHlwZTogZW51bXMuSW1hZ2VUeXBlO1xuICAgIGhlaWdodD86IG51bWJlcjtcbiAgICB3aWR0aD86IG51bWJlcjtcbiAgICBxdWFsaXR5PzogbnVtYmVyO1xuICAgIG91dHB1dD86IHNoYXJwLk91dHB1dEluZm87XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbWFnZUNvbnRyb2xsZXJNaXhpbjxUQmFzZSBleHRlbmRzIENvbnN0cnVjdG9yPihCYXNlOiBUQmFzZSkge1xuICAgIHJldHVybiBjbGFzcyBleHRlbmRzIEJhc2Uge1xuXG4gICAgICAgIHB1YmxpYyBEZWZhdWx0Q29udGVudEltYWdlU3R5bGVzOiBJSW1hZ2VTdHlsZVtdID0gW3tcbiAgICAgICAgICAgIGltYWdlVHlwZTogZW51bXMuSW1hZ2VUeXBlLnRodW1ibmFpbCwgaGVpZ2h0OiAxNTAsIHdpZHRoOiAxNTAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGltYWdlVHlwZTogZW51bXMuSW1hZ2VUeXBlLm1lZGl1bSwgaGVpZ2h0OiA1MDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGltYWdlVHlwZTogZW51bXMuSW1hZ2VUeXBlLmxhcmdlLCBoZWlnaHQ6IDEwMjQsXG4gICAgICAgIH1cbiAgICAgICAgXVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY29uc3QgdXBsb2FkRGlyZWN0b3J5Um9vdExvY2F0aW9uOiBzdHJpbmcgPSAnLi4vLi4vLi4vJztcblxuICAgICAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGltYWdlVHJhbnNmb3JtZXIocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24sIGNvbnRyb2xsZXI6IEJhc2VDb250cm9sbGVyLCBpbWFnZVN0eWxlczogSUltYWdlU3R5bGVbXSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdCAmJiByZXF1ZXN0LmZpbGVzICYmIHJlcXVlc3QuZmlsZXNbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gR3JhYiB0aGUgbXVsdGVyIGZpbGUgb2ZmIHRoZSByZXF1ZXN0LiAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhd0ltYWdlRmlsZSA9IHJlcXVlc3QuZmlsZXNbMF0gYXMgTXVsdGVyRmlsZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vTm93IHdlIGdvIGdldCB0aGUgcHJvZHVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW1Eb2MgPSBhd2FpdCBjb250cm9sbGVyLnJlcG9zaXRvcnkuc2luZ2xlKHJlcXVlc3QucGFyYW1zWydpZCddKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpdGVtV2l0aEltYWdlID0gaXRlbURvYyBhcyBJSGFzSW1hZ2VzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaGFycEltYWdlRGV0YWlsczogc2hhcnAuT3V0cHV0SW5mb1tdID0gbmV3IEFycmF5PHNoYXJwLk91dHB1dEluZm8+KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaW1hZ2VTdHlsZSBvZiBpbWFnZVN0eWxlcyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VTdHlsZS5vdXRwdXQgPSBhd2FpdCB0aGlzLmdlbmVyYXRlVmFyaWF0aW9uKGltYWdlU3R5bGUuaW1hZ2VUeXBlLCByYXdJbWFnZUZpbGUsIHJlc3BvbnNlLCBpbWFnZVN0eWxlLndpZHRoLCBpbWFnZVN0eWxlLmhlaWdodCwgaW1hZ2VTdHlsZS5xdWFsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmlndXJlIG91dCB3aGF0IHRoZSBtYXhpbXVtIHByb2R1Y3QgaW1hZ2Ugb3JkZXIgbnVtYmVyIGlzLCBhbmQgYWRkIG9uZSB0byBpdC4gXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0T3JkZXJOdW0gPSB0aGlzLmdldE5leHRPcmRlck51bWJlcihpdGVtV2l0aEltYWdlKSArIDEwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2U6IElJbWFnZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogbmV4dE9yZGVyTnVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhdGlvbnM6IG5ldyBBcnJheTxJSW1hZ2VWYXJpYXRpb24+KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VTdHlsZXMuZm9yRWFjaChpbWFnZVN0eWxlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFZhcmlhdGlvbihpbWFnZSwgcmF3SW1hZ2VGaWxlLCBpbWFnZVN0eWxlLm91dHB1dCwgaW1hZ2VTdHlsZS5pbWFnZVR5cGUsIG5leHRPcmRlck51bSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtRG9jID0gYXdhaXQgY29udHJvbGxlci5yZXBvc2l0b3J5LnNpbmdsZShyZXF1ZXN0LnBhcmFtc1snaWQnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtV2l0aEltYWdlID0gaXRlbURvYyBhcyBJSGFzSW1hZ2VzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCBpbWFnZSwgd2UncmUgZ29pbmcgdG8gY3JlYXRlIGEgbmV3IGFycmF5LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdGVtV2l0aEltYWdlLmltYWdlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1XaXRoSW1hZ2UuaW1hZ2VzID0gbmV3IEFycmF5PElJbWFnZT4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVdpdGhJbWFnZS5pbWFnZXMucHVzaChpbWFnZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIHVwZGF0ZWQgcHJvZHVjdC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRJdGVtID0gYXdhaXQgY29udHJvbGxlci5yZXBvc2l0b3J5LnNhdmUoaXRlbURvYyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnN0YXR1cygyMDApLmpzb24odXBkYXRlZEl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm9sbGJhY2tJdGVtSW1hZ2VzKHJhd0ltYWdlRmlsZSwgdHJ1ZSwgaW1hZ2VTdHlsZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgQXBpRXJyb3JIYW5kbGVyLnNlbmRFcnJvcihgRXJyb3IgZHVyaW5nIGltYWdlIHByb2Nlc3NpbmcuICR7ZXJyfWAsIDUwMCwgcmVzcG9uc2UsIG51bGwsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvbGxiYWNrSXRlbUltYWdlcyhyYXdJbWFnZUZpbGUsIGZhbHNlLCBpbWFnZVN0eWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIEFwaUVycm9ySGFuZGxlci5zZW5kRXJyb3IoYEZpbGUgd2Fzbid0IHByZXNlbnQgb24gdGhlIHJlcXVlc3QuICBBcmUgeW91IHN1cmUgeW91IHNlbnQgdGhlIGZpbGUgd2l0aCBmaWVsZCBuYW1lZCAnZmlsZSdgLCA1MDAsIHJlc3BvbnNlLCBudWxsLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRG9uJ3QgZm9yZ2V0IHRvIGNhbGwgbmV4dCBoZXJlLi4uIHdobyBrbm93cyB3aGF0IHRoZSBuZXh0IGhhbmRsZXIgd2lsbCB3YW50IHRvIGRvLiBcbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBBcGlFcnJvckhhbmRsZXIuc2VuZEVycm9yKGBJbWFnZSBVcGxvYWRpbmcgLyBSZXNpemluZyBmYWlsZWQuIEJ1Y2tldCBJdGVtcyAtICR7ZXJyfWAsIDUwMCwgcmVzcG9uc2UsIG51bGwsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldE5leHRPcmRlck51bWJlcihwcm9kdWN0OiBJSGFzSW1hZ2VzKTogbnVtYmVyIHtcbiAgICAgICAgICAgIGlmIChwcm9kdWN0ICYmIHByb2R1Y3QuaW1hZ2VzICYmIHByb2R1Y3QuaW1hZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgbWF4ID0gMDtcbiAgICAgICAgICAgICAgICBwcm9kdWN0LmltYWdlcy5mb3JFYWNoKGltYWdlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gTWF0aC5tYXgobWF4LCBpbWFnZS5vcmRlcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICsrbWF4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGFkZFZhcmlhdGlvbihpbWFnZTogSUltYWdlLCBmaWxlOiBNdWx0ZXJGaWxlLCBzaGFycEluZm86IHNoYXJwLk91dHB1dEluZm8sIHR5cGU6IGVudW1zLkltYWdlVHlwZSwgb3JkZXI6IG51bWJlcik6IElJbWFnZSB7XG4gICAgICAgICAgICBpbWFnZS52YXJpYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBzaGFycEluZm8uaGVpZ2h0LFxuICAgICAgICAgICAgICAgIHdpZHRoOiBzaGFycEluZm8ud2lkdGgsXG4gICAgICAgICAgICAgICAgLy8gSSB3YW50IHRvIGVuZCB1cCB3aXRoIDogZGV2LWNkbi5seXJhYXRsYXMuY29tL2ZpbGVuYW1lLmpwZ1xuICAgICAgICAgICAgICAgIHVybDogYCR7Q29uZmlnLmFjdGl2ZS5nZXQoJ0NETkxvY2F0aW9uJyl9JHsnLmx5cmFhdGxhcy5jb20nfS8ke0FtYXpvblMzU2VydmljZS52YXJpYXRpb25OYW1lKHR5cGUsIGZpbGUpfWAsXG4gICAgICAgICAgICAgICAga2V5OiBBbWF6b25TM1NlcnZpY2UudmFyaWF0aW9uTmFtZSh0eXBlLCBmaWxlKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gaW1hZ2U7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGdlbmVyYXRlVmFyaWF0aW9uKFxuICAgICAgICAgICAgaW1hZ2VUeXBlOiBlbnVtcy5JbWFnZVR5cGUsXG4gICAgICAgICAgICByYXdJbWFnZUZpbGU6IE11bHRlckZpbGUsXG4gICAgICAgICAgICByZXNwb25zZTogUmVzcG9uc2UsXG4gICAgICAgICAgICB3aWR0aDogbnVtYmVyID0gbnVsbCxcbiAgICAgICAgICAgIGhlaWdodDogbnVtYmVyID0gbnVsbCxcbiAgICAgICAgICAgIHF1YWxpdHk6IG51bWJlciA9IDgwXG4gICAgICAgICk6IFByb21pc2U8c2hhcnAuT3V0cHV0SW5mbyB8IGFueT4ge1xuICAgICAgICAgICAgLy8gSWYgeW91IGRvbid0IHR1cm4gb2ZmIGNhY2hlIHdoZW4geW91J3JlIHRyeWluZyB0byBjbGVhbnVwIHRoZSBmaWxlcywgeW91IHdvbid0IGJlIGFibGUgdG8gZGVjb25zdGUgdGhlIGZpbGUuXG4gICAgICAgICAgICBzaGFycC5jYWNoZShmYWxzZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IG91dHB1dEluZm86IHNoYXJwLk91dHB1dEluZm8gPSBhd2FpdCBzaGFycChwYXRoLnJlc29sdmUoX19kaXJuYW1lLCB0aGlzLnVwbG9hZERpcmVjdG9yeVJvb3RMb2NhdGlvbiwgYCR7Q09OU1QuSU1BR0VfVVBMT0FEX1BBVEh9JHtyYXdJbWFnZUZpbGUuZmlsZW5hbWV9YCkpXG4gICAgICAgICAgICAgICAgLnJlc2l6ZSh3aWR0aCwgaGVpZ2h0KVxuICAgICAgICAgICAgICAgIC5jcm9wKHNoYXJwLmdyYXZpdHkuY2VudGVyKVxuICAgICAgICAgICAgICAgIC50b0Zvcm1hdChzaGFycC5mb3JtYXQucG5nLCB7XG4gICAgICAgICAgICAgICAgICAgIHF1YWxpdHk6IHF1YWxpdHksXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudG9GaWxlKGAke0NPTlNULklNQUdFX1VQTE9BRF9QQVRIfSR7QW1hem9uUzNTZXJ2aWNlLnZhcmlhdGlvbk5hbWUoaW1hZ2VUeXBlLCByYXdJbWFnZUZpbGUpfWApO1xuXG4gICAgICAgICAgICBhd2FpdCBBbWF6b25TM1NlcnZpY2UudXBsb2FkSW1hZ2VUb1MzKHJlc3BvbnNlLCByYXdJbWFnZUZpbGUsIGltYWdlVHlwZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXRJbmZvO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBhc3luYyByb2xsYmFja0l0ZW1JbWFnZXMocmF3SW1hZ2VGaWxlOiBNdWx0ZXJGaWxlLCBjbGVhblMzOiBib29sZWFuLCBpbWFnZVN0eWxlczogSUltYWdlU3R5bGVbXSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCB3ZSdyZSBnb2luZyB0byB0cnkgYW5kIGNsZWFuIHVwIHRoZSBpbWFnZSBmaWxlIHRoYXQgd2FzIHVwbG9hZGVkIHRvIHRoZSBzZXJ2ZXIuXG4gICAgICAgICAgICAgICAgYXdhaXQgZnMuZGVsZXRlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIHRoaXMudXBsb2FkRGlyZWN0b3J5Um9vdExvY2F0aW9uLCBgJHtDT05TVC5JTUFHRV9VUExPQURfUEFUSH0ke3Jhd0ltYWdlRmlsZS5maWxlbmFtZX1gKSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2cuZXJyb3IoYFNXQUxMT1dJTkchIFRoZXJlIHdhcyBhbiBlcnJvciB0cnlpbmcgdG8gZGVsZXRlIHRoZSBmaWxlIHRoYXQgd2FzIGNyZWF0ZWQgZHVyaW5nIHVwbG9hZC5cbiAgICAgICAgICAgIFVwbG9hZCBwYXRoIGNvdWxkIGZpbGwuIGZpbGVuYW1lOiAke3Jhd0ltYWdlRmlsZS5maWxlbmFtZX0gIEV4Y2VwdGlvbjogJHtlcnJ9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGltYWdlU3R5bGVzLmZvckVhY2goaW1hZ2VTdHlsZSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb2xsYmFja1ZhcmlhdGlvbnMocmF3SW1hZ2VGaWxlLCBpbWFnZVN0eWxlLmltYWdlVHlwZSwgY2xlYW5TMyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihgU1dBTExPV0lORyEgIFRoZXJlIHdhcyBhbiBlcnJvciB0cnlpbmcgdG8gY2xlYW51cCB0aGUgZmlsZXMgZnJvbSB0aGUgc2VydmVyLCBhbmQgUzMuXG4gICAgICAgICAgICAgICAgVXBsb2FkIHBhdGggY291bGQgZmlsbC4gZmlsZW5hbWU6ICR7cmF3SW1hZ2VGaWxlLmZpbGVuYW1lfSAgRXhjZXB0aW9uOiAke2Vycn1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBhc3luYyByb2xsYmFja1ZhcmlhdGlvbnMocmF3SW1hZ2VGaWxlOiBNdWx0ZXJGaWxlLCBpbWFnZVR5cGU6IGVudW1zLkltYWdlVHlwZSwgY2xlYW5TMzogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBub3cgd2UncmUgZ29pbmcgdG8gdHJ5IGFuZCBjbGVhbiB1cCBhbGwgdGhlIHZhcmlhdGlvbnMgdGhhdCB3ZXJlIGNyZWF0ZWQuXG4gICAgICAgICAgICAgICAgYXdhaXQgZnMuZGVsZXRlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIHRoaXMudXBsb2FkRGlyZWN0b3J5Um9vdExvY2F0aW9uLCBgJHtDT05TVC5JTUFHRV9VUExPQURfUEFUSH0ke0FtYXpvblMzU2VydmljZS52YXJpYXRpb25OYW1lKGltYWdlVHlwZSwgcmF3SW1hZ2VGaWxlKX1gKSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2cuZXJyb3IoYFNXQUxMT1dJTkchIFdoaWxlIHRyeWluZyB0byBjbGVhbnVwIGltYWdlIHZhcmlhdGlvbnMgdGhlcmUgd2FzIGFuIGVycm9yLiBmaWxlbmFtZTogJHtBbWF6b25TM1NlcnZpY2UudmFyaWF0aW9uTmFtZShpbWFnZVR5cGUsIHJhd0ltYWdlRmlsZSl9XG4gICAgICAgICAgICAgRXhjZXB0aW9uOiAke2Vycn1gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoY2xlYW5TMykge1xuICAgICAgICAgICAgICAgICAgICBBbWF6b25TM1NlcnZpY2UuY2xlYW5Bd3MocmF3SW1hZ2VGaWxlLCBpbWFnZVR5cGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGxvZy5lcnJvcihgU1dBTExPV0lORyEgRXhjZXB0aW9uIHdoaWxlIHRyeWluZyB0byBjbGVhbiB0aGUgaW1hZ2UgZnJvbSBTMyBLRVk6ICR7QW1hem9uUzNTZXJ2aWNlLnZhcmlhdGlvbk5hbWUoaW1hZ2VUeXBlLCByYXdJbWFnZUZpbGUpfVxuICAgICAgICAgICAgRXhjZXB0aW9uOiAke2Vycn1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBhc3luYyBkZWxldGVJbWFnZShyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbiwgY29udHJvbGxlcjogQmFzZUNvbnRyb2xsZXIpOiBQcm9taXNlPElCYXNlTW9kZWxEb2M+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbUlkID0gYXdhaXQgY29udHJvbGxlci5nZXRJZChyZXF1ZXN0KTtcbiAgICAgICAgICAgICAgICBjb25zdCBpbWFnZUlkID0gcmVxdWVzdCAmJiByZXF1ZXN0LnBhcmFtcyA/IHJlcXVlc3QucGFyYW1zWydpbWFnZUlkJ10gOiBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1Eb2MgPSBhd2FpdCBjb250cm9sbGVyLnJlcG9zaXRvcnkuc2luZ2xlKGl0ZW1JZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbVdpdGhJbWFnZXMgPSBpdGVtRG9jIGFzIElIYXNJbWFnZXM7XG5cbiAgICAgICAgICAgICAgICAvL25vdyB3ZSBuZWVkIHRvIGdldCB0aGUgcHJvZHVjdCBpbWFnZSB0aGlzIHJlcXVlc3QgaXMgcmVmZXJyaW5nIHRvLlxuICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlSW5kZXggPSBpdGVtV2l0aEltYWdlcy5pbWFnZXMuZmluZEluZGV4KChpbWFnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW1hZ2UuX2lkID09IGltYWdlSWQ7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW1hZ2VJbmRleCA+PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaXRlbVdpdGhJbWFnZXMuaW1hZ2VzW2ltYWdlSW5kZXhdLnZhcmlhdGlvbnMuZm9yRWFjaChhc3luYyAodmFyaWF0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBBbWF6b25TM1NlcnZpY2UuZGVsZXRlRmlsZUZyb21TMyh2YXJpYXRpb24ua2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaXRlbVdpdGhJbWFnZXMuaW1hZ2VzLnNwbGljZShpbWFnZUluZGV4LCAxKTtcblxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBjb250cm9sbGVyLnJlcG9zaXRvcnkuc2F2ZShpdGVtRG9jKTtcblxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5zdGF0dXMoMjAwKS5qc29uKGl0ZW1XaXRoSW1hZ2VzLmltYWdlcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1Eb2M7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgeyBtZXNzYWdlOiBcIkltYWdlIG5vdCBmb3VuZC5cIiwgc3RhdHVzOiA0MDQgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikgeyBuZXh0KGVycik7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZGVzdHJveUltYWdlcyhpdGVtRG9jOiBJQmFzZU1vZGVsRG9jKTogUHJvbWlzZTxJQmFzZU1vZGVsRG9jPiB7XG4gICAgICAgICAgICAvLyBGaXJzdCB3ZSBnbyBvdXQgYW5kIGdldCB0aGUgbW9kZWwgZnJvbSB0aGUgZGF0YWJhc2VcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1XaXRoSW1hZ2VzID0gaXRlbURvYyBhcyBJSGFzSW1hZ2VzO1xuXG4gICAgICAgICAgICBpZiAoIWl0ZW1Eb2MpIHsgdGhyb3cgeyBtZXNzYWdlOiBcIkl0ZW0gTm90IEZvdW5kLCBJbiBEZXN0cm95IEltYWdlIEhvb2tcIiwgc3RhdHVzOiA0MDQgfTsgfVxuXG4gICAgICAgICAgICAvLyBUaGVzZSByZWFsbHkgd29yZHkgZm9yIGxvb3BzIGFyZSBuZWVkZWQsIGJlY2F1c2UgdGhvc2UgbW9uZ29vc2UgYXJyYXlzIGRvbid0IGFsd2F5cyBiZWhhdmUgd2l0aCBhIGZvcmVhY2guXG4gICAgICAgICAgICAvLyBXZSdyZSBvbmx5IGdvaW5nIHRvIGRlbGV0ZSB0aGUgcHJvZHVjdCBpbWFnZXMgaWYgdGhpcyBpcyBhIHByb2R1Y3QgdGVtcGxhdGUuXG4gICAgICAgICAgICBpZiAoaXRlbVdpdGhJbWFnZXMgJiYgaXRlbVdpdGhJbWFnZXMuaW1hZ2VzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtV2l0aEltYWdlcy5pbWFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGltYWdlID0gaXRlbVdpdGhJbWFnZXMuaW1hZ2VzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2UudmFyaWF0aW9ucyAmJiBpbWFnZS52YXJpYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaW1hZ2UudmFyaWF0aW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YXJpYXRpb24gPSBpbWFnZS52YXJpYXRpb25zW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEFtYXpvblMzU2VydmljZS5kZWxldGVGaWxlRnJvbVMzKHZhcmlhdGlvbi5rZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGl0ZW1Eb2NcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
