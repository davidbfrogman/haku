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
const config_1 = require("../config/config");
const constants_1 = require("../constants");
const api_error_handler_1 = require("../api-error-handler");
const path = require("path");
const sharp = require("sharp");
const log = require("winston");
const enums = require("../enumerations");
const fs = require("async-file");
const index_1 = require("../services/index");
class ImageUploadController {
    imageUploadMiddleware(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Because this is created as a middleware this doesn't point to the class.
                yield new ImageUploadController().handler(request, response, next);
                next();
            }
            catch (err) {
                api_error_handler_1.ApiErrorHandler.sendError(`Image Uploading / Resizing failed. ${err}`, 500, response, null, err);
            }
        });
    }
    handler(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (request && request.files && request.files[0]) {
                // Grab the multer file off the request.  
                const rawImageFile = request.files[0];
                try {
                    // //Now we go get the product
                    // const product = await new ProductRepository().single(request.params['id']);
                    // // Create image variations
                    // const raw = await this.generateVariation(enums.ImageType.raw, rawImageFile, response);
                    // const thumb = await this.generateVariation(enums.ImageType.thumbnail, rawImageFile, response, 150, 150);
                    // const icon = await this.generateVariation(enums.ImageType.icon, rawImageFile, response, 50, 50, 50);
                    // const small = await this.generateVariation(enums.ImageType.small, rawImageFile, response, 300);
                    // const medium = await this.generateVariation(enums.ImageType.medium, rawImageFile, response, 500);
                    // const large = await this.generateVariation(enums.ImageType.large, rawImageFile, response, 1024);
                    // // figure out what the maximum product image order number is, and add one to it. 
                    // const nextOrderNum = this.getNextOrderNumber(product) + 10;
                    // let image: IImage = {
                    //     isActive: true,
                    //     order: nextOrderNum,
                    //     variations: new Array<IImageVariation>()
                    // }
                    // // Add the product images.
                    // this.addVariation(image, rawImageFile, raw, enums.ImageType.raw, nextOrderNum);
                    // this.addVariation(image, rawImageFile, thumb, enums.ImageType.thumbnail, nextOrderNum);
                    // this.addVariation(image, rawImageFile, icon, enums.ImageType.icon, nextOrderNum);
                    // this.addVariation(image, rawImageFile, small, enums.ImageType.small, nextOrderNum);
                    // this.addVariation(image, rawImageFile, medium, enums.ImageType.medium, nextOrderNum);
                    // this.addVariation(image, rawImageFile, large, enums.ImageType.large, nextOrderNum);
                    // // If this is the first image, we're going to create a new array.
                    // if(!product.images){
                    //     product.images = new Array<IImage>();
                    // }
                    // product.images.push(image);
                    // // Save the updated product.
                    // const updatedProduct = await new ProductRepository().save(product);
                    // response.status(200).json(updatedProduct);
                }
                catch (err) {
                    this.rollbackProductImages(rawImageFile, true);
                    api_error_handler_1.ApiErrorHandler.sendError(`Error during image processing. ${err}`, 500, response, null, err);
                }
                finally {
                    this.rollbackProductImages(rawImageFile, false);
                }
            }
            else {
                api_error_handler_1.ApiErrorHandler.sendError(`File wasn't present on the request.  Are you sure you sent the file with field named 'file'`, 500, response, null, null);
            }
        });
    }
    // public getNextOrderNumber(product: IProduct): number {
    //     if (product && product.images && product.images.length > 0) {
    //         let max = 0;
    //         product.images.forEach(image => {
    //             max = Math.max(max, image.order);
    //         });
    //         return ++max;
    //     }
    //     return 0;
    // }
    addVariation(image, file, sharpInfo, type, order) {
        image.variations.push({
            type: type,
            height: sharpInfo.height,
            width: sharpInfo.width,
            url: `${config_1.Config.active.get('ProductImageURLLocationRoot')}${config_1.Config.active.get('ProductImageBucketName')}/${index_1.AmazonS3Service.variationName(type, file)}`,
            key: index_1.AmazonS3Service.variationName(type, file)
        });
        return image;
    }
    generateVariation(imageType, rawImageFile, response, width = null, height = null, quality = 80) {
        return __awaiter(this, void 0, void 0, function* () {
            // If you don't turn off cache when you're trying to cleanup the files, you won't be able to deconste the file.
            sharp.cache(false);
            const outputInfo = yield sharp(path.resolve(__dirname, '../../', `${constants_1.CONST.IMAGE_UPLOAD_PATH}${rawImageFile.filename}`))
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
    rollbackProductImages(rawImageFile, cleanS3) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // first we're going to try and clean up the image file that was uploaded to the server.
                yield fs.delete(path.resolve(__dirname, '../../', `${constants_1.CONST.IMAGE_UPLOAD_PATH}${rawImageFile.filename}`));
            }
            catch (err) {
                log.error(`SWALLOWING! There was an error trying to delete the file that was created during upload.
            Upload path could fill. filename: ${rawImageFile.filename}  Exception: ${err}`);
            }
            try {
                // Now we're going to try and cleanup the images on s3
                //while we still have easy access to the file we're going to send it up to s3.
                this.rollbackImageVariations(rawImageFile, enums.ImageType.raw, cleanS3);
                this.rollbackImageVariations(rawImageFile, enums.ImageType.icon, cleanS3);
                this.rollbackImageVariations(rawImageFile, enums.ImageType.thumbnail, cleanS3);
                this.rollbackImageVariations(rawImageFile, enums.ImageType.small, cleanS3);
                this.rollbackImageVariations(rawImageFile, enums.ImageType.medium, cleanS3);
                this.rollbackImageVariations(rawImageFile, enums.ImageType.large, cleanS3);
            }
            catch (err) {
                log.error(`SWALLOWING!  There was an error trying to cleanup the files from the server, and S3.
            Upload path could fill. filename: ${rawImageFile.filename}  Exception: ${err}`);
            }
        });
    }
    rollbackImageVariations(rawImageFile, imageType, cleanS3) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // now we're going to try and clean up all the variations that were created.
                yield fs.delete(path.resolve(__dirname, '../../', `${constants_1.CONST.IMAGE_UPLOAD_PATH}${index_1.AmazonS3Service.variationName(imageType, rawImageFile)}`));
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
}
exports.ImageUploadController = ImageUploadController;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL2NvbnRyb2xsZXJzL2ltYWdlLXVwbG9hZC5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFHQSw2Q0FBMEM7QUFFMUMsNENBQXFDO0FBQ3JDLDREQUF1RDtBQUV2RCw2QkFBNkI7QUFFN0IsK0JBQStCO0FBQy9CLCtCQUFnQztBQUNoQyx5Q0FBeUM7QUFFekMsaUNBQWlDO0FBRWpDLDZDQUFvRDtBQUdwRDtJQUVpQixxQkFBcUIsQ0FBQyxPQUFnQixFQUFFLFFBQWtCLEVBQUUsSUFBa0I7O1lBQ3ZGLElBQUksQ0FBQztnQkFDRCwyRUFBMkU7Z0JBQzNFLE1BQU0sSUFBSSxxQkFBcUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNuRSxJQUFJLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNYLG1DQUFlLENBQUMsU0FBUyxDQUFDLHNDQUFzQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNyRyxDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBRVksT0FBTyxDQUFDLE9BQWdCLEVBQUUsUUFBa0IsRUFBRSxJQUFrQjs7WUFFekUsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLDBDQUEwQztnQkFDMUMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQWUsQ0FBQztnQkFDcEQsSUFBSSxDQUFDO29CQUNELDhCQUE4QjtvQkFDOUIsOEVBQThFO29CQUU5RSw2QkFBNkI7b0JBQzdCLHlGQUF5RjtvQkFDekYsMkdBQTJHO29CQUMzRyx1R0FBdUc7b0JBQ3ZHLGtHQUFrRztvQkFDbEcsb0dBQW9HO29CQUNwRyxtR0FBbUc7b0JBRW5HLG9GQUFvRjtvQkFDcEYsOERBQThEO29CQUU5RCx3QkFBd0I7b0JBQ3hCLHNCQUFzQjtvQkFDdEIsMkJBQTJCO29CQUMzQiwrQ0FBK0M7b0JBQy9DLElBQUk7b0JBRUosNkJBQTZCO29CQUM3QixrRkFBa0Y7b0JBQ2xGLDBGQUEwRjtvQkFDMUYsb0ZBQW9GO29CQUNwRixzRkFBc0Y7b0JBQ3RGLHdGQUF3RjtvQkFDeEYsc0ZBQXNGO29CQUV0RixvRUFBb0U7b0JBQ3BFLHVCQUF1QjtvQkFDdkIsNENBQTRDO29CQUM1QyxJQUFJO29CQUVKLDhCQUE4QjtvQkFFOUIsK0JBQStCO29CQUMvQixzRUFBc0U7b0JBRXRFLDZDQUE2QztnQkFDakQsQ0FBQztnQkFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNYLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQy9DLG1DQUFlLENBQUMsU0FBUyxDQUFDLGtDQUFrQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDakcsQ0FBQzt3QkFDTyxDQUFDO29CQUNMLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3BELENBQUM7WUFDTCxDQUFDO1lBQ0QsSUFBSSxDQUFDLENBQUM7Z0JBQ0YsbUNBQWUsQ0FBQyxTQUFTLENBQUMsNkZBQTZGLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEosQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVELHlEQUF5RDtJQUN6RCxvRUFBb0U7SUFDcEUsdUJBQXVCO0lBQ3ZCLDRDQUE0QztJQUM1QyxnREFBZ0Q7SUFDaEQsY0FBYztJQUNkLHdCQUF3QjtJQUN4QixRQUFRO0lBQ1IsZ0JBQWdCO0lBQ2hCLElBQUk7SUFFRyxZQUFZLENBQUMsS0FBYSxFQUFFLElBQWdCLEVBQUUsU0FBMkIsRUFBRSxJQUFxQixFQUFFLEtBQWE7UUFDbEgsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7WUFDbEIsSUFBSSxFQUFFLElBQUk7WUFDVixNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU07WUFDeEIsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLO1lBQ3RCLEdBQUcsRUFBRSxHQUFHLGVBQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLEdBQUcsZUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsSUFBSSx1QkFBZSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDckosR0FBRyxFQUFFLHVCQUFlLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7U0FDakQsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRVksaUJBQWlCLENBQUMsU0FBMEIsRUFBRSxZQUF3QixFQUFFLFFBQWtCLEVBQUUsUUFBZ0IsSUFBSSxFQUFFLFNBQWlCLElBQUksRUFBRSxVQUFrQixFQUFFOztZQUN0SywrR0FBK0c7WUFDL0csS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVuQixNQUFNLFVBQVUsR0FBcUIsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEdBQUcsaUJBQUssQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztpQkFDcEksTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7aUJBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztpQkFDMUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO2dCQUN4QixPQUFPLEVBQUUsT0FBTzthQUNuQixDQUFDO2lCQUNELE1BQU0sQ0FBQyxHQUFHLGlCQUFLLENBQUMsaUJBQWlCLEdBQUcsdUJBQWUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVuRyxNQUFNLHVCQUFlLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFekUsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUN0QixDQUFDO0tBQUE7SUFFWSxxQkFBcUIsQ0FBQyxZQUF3QixFQUFFLE9BQWdCOztZQUN6RSxJQUFJLENBQUM7Z0JBQ0Qsd0ZBQXdGO2dCQUN4RixNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEdBQUcsaUJBQUssQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdHLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0RBQzBCLFlBQVksQ0FBQyxRQUFRLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3BGLENBQUM7WUFFRCxJQUFJLENBQUM7Z0JBQ0Qsc0RBQXNEO2dCQUN0RCw4RUFBOEU7Z0JBQzlFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3pFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQy9FLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzNFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzVFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFL0UsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsR0FBRyxDQUFDLEtBQUssQ0FBQztnREFDMEIsWUFBWSxDQUFDLFFBQVEsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDcEYsQ0FBQztRQUVMLENBQUM7S0FBQTtJQUVZLHVCQUF1QixDQUFDLFlBQXdCLEVBQUUsU0FBMEIsRUFBRSxPQUFnQjs7WUFDdkcsSUFBSSxDQUFDO2dCQUNELDRFQUE0RTtnQkFDNUUsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxHQUFHLGlCQUFLLENBQUMsaUJBQWlCLEdBQUcsdUJBQWUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlJLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxLQUFLLENBQUMsc0ZBQXNGLHVCQUFlLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUM7MEJBQ3hJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDekIsQ0FBQztZQUVELElBQUksQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNWLHVCQUFlLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztZQUNMLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEdBQUcsQ0FBQyxLQUFLLENBQUMsc0VBQXNFLHVCQUFlLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUM7eUJBQ3pILEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDeEIsQ0FBQztRQUNMLENBQUM7S0FBQTtDQUNKO0FBekpELHNEQXlKQyIsImZpbGUiOiJjb250cm9sbGVycy9pbWFnZS11cGxvYWQuY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJvdXRlciwgUmVxdWVzdCwgUmVzcG9uc2UsIFJlcXVlc3RQYXJhbUhhbmRsZXIsIE5leHRGdW5jdGlvbiwgUmVxdWVzdEhhbmRsZXIsIEFwcGxpY2F0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgbW9uZ29vc2UgPSByZXF1aXJlKCdtb25nb29zZScpO1xuaW1wb3J0IHsgU2NoZW1hLCBNb2RlbCwgRG9jdW1lbnQgfSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tICcuLi9jb25maWcvY29uZmlnJztcbmltcG9ydCB7IElUb2tlblBheWxvYWQsIElCYXNlTW9kZWxEb2MgfSBmcm9tICcuLi9tb2RlbHMvJztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSBcIi4uL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgQXBpRXJyb3JIYW5kbGVyIH0gZnJvbSBcIi4uL2FwaS1lcnJvci1oYW5kbGVyXCI7XG5pbXBvcnQgKiBhcyByaW1yYWYgZnJvbSAncmltcmFmJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBtdWx0ZXIgZnJvbSAnbXVsdGVyJztcbmltcG9ydCAqIGFzIHNoYXJwIGZyb20gJ3NoYXJwJztcbmltcG9ydCBsb2cgPSByZXF1aXJlKCd3aW5zdG9uJyk7XG5pbXBvcnQgKiBhcyBlbnVtcyBmcm9tICcuLi9lbnVtZXJhdGlvbnMnO1xuaW1wb3J0ICogYXMgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnYXN5bmMtZmlsZSc7XG5pbXBvcnQgeyBNdWx0ZXJGaWxlIH0gZnJvbSAnLi4vbW9kZWxzJztcbmltcG9ydCB7IEFtYXpvblMzU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2luZGV4JztcbmltcG9ydCB7IElJbWFnZSwgSUltYWdlVmFyaWF0aW9uIH0gZnJvbSAnLi4vbW9kZWxzL2ltYWdlLmludGVyZmFjZSc7XG5cbmV4cG9ydCBjbGFzcyBJbWFnZVVwbG9hZENvbnRyb2xsZXIge1xuXG4gICAgcHVibGljIGFzeW5jIGltYWdlVXBsb2FkTWlkZGxld2FyZShyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQmVjYXVzZSB0aGlzIGlzIGNyZWF0ZWQgYXMgYSBtaWRkbGV3YXJlIHRoaXMgZG9lc24ndCBwb2ludCB0byB0aGUgY2xhc3MuXG4gICAgICAgICAgICBhd2FpdCBuZXcgSW1hZ2VVcGxvYWRDb250cm9sbGVyKCkuaGFuZGxlcihyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCk7XG4gICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgQXBpRXJyb3JIYW5kbGVyLnNlbmRFcnJvcihgSW1hZ2UgVXBsb2FkaW5nIC8gUmVzaXppbmcgZmFpbGVkLiAke2Vycn1gLCA1MDAsIHJlc3BvbnNlLCBudWxsLCBlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGhhbmRsZXIocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pIHtcblxuICAgICAgICBpZiAocmVxdWVzdCAmJiByZXF1ZXN0LmZpbGVzICYmIHJlcXVlc3QuZmlsZXNbMF0pIHtcbiAgICAgICAgICAgIC8vIEdyYWIgdGhlIG11bHRlciBmaWxlIG9mZiB0aGUgcmVxdWVzdC4gIFxuICAgICAgICAgICAgY29uc3QgcmF3SW1hZ2VGaWxlID0gcmVxdWVzdC5maWxlc1swXSBhcyBNdWx0ZXJGaWxlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyAvL05vdyB3ZSBnbyBnZXQgdGhlIHByb2R1Y3RcbiAgICAgICAgICAgICAgICAvLyBjb25zdCBwcm9kdWN0ID0gYXdhaXQgbmV3IFByb2R1Y3RSZXBvc2l0b3J5KCkuc2luZ2xlKHJlcXVlc3QucGFyYW1zWydpZCddKTtcblxuICAgICAgICAgICAgICAgIC8vIC8vIENyZWF0ZSBpbWFnZSB2YXJpYXRpb25zXG4gICAgICAgICAgICAgICAgLy8gY29uc3QgcmF3ID0gYXdhaXQgdGhpcy5nZW5lcmF0ZVZhcmlhdGlvbihlbnVtcy5JbWFnZVR5cGUucmF3LCByYXdJbWFnZUZpbGUsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zdCB0aHVtYiA9IGF3YWl0IHRoaXMuZ2VuZXJhdGVWYXJpYXRpb24oZW51bXMuSW1hZ2VUeXBlLnRodW1ibmFpbCwgcmF3SW1hZ2VGaWxlLCByZXNwb25zZSwgMTUwLCAxNTApO1xuICAgICAgICAgICAgICAgIC8vIGNvbnN0IGljb24gPSBhd2FpdCB0aGlzLmdlbmVyYXRlVmFyaWF0aW9uKGVudW1zLkltYWdlVHlwZS5pY29uLCByYXdJbWFnZUZpbGUsIHJlc3BvbnNlLCA1MCwgNTAsIDUwKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zdCBzbWFsbCA9IGF3YWl0IHRoaXMuZ2VuZXJhdGVWYXJpYXRpb24oZW51bXMuSW1hZ2VUeXBlLnNtYWxsLCByYXdJbWFnZUZpbGUsIHJlc3BvbnNlLCAzMDApO1xuICAgICAgICAgICAgICAgIC8vIGNvbnN0IG1lZGl1bSA9IGF3YWl0IHRoaXMuZ2VuZXJhdGVWYXJpYXRpb24oZW51bXMuSW1hZ2VUeXBlLm1lZGl1bSwgcmF3SW1hZ2VGaWxlLCByZXNwb25zZSwgNTAwKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zdCBsYXJnZSA9IGF3YWl0IHRoaXMuZ2VuZXJhdGVWYXJpYXRpb24oZW51bXMuSW1hZ2VUeXBlLmxhcmdlLCByYXdJbWFnZUZpbGUsIHJlc3BvbnNlLCAxMDI0KTtcblxuICAgICAgICAgICAgICAgIC8vIC8vIGZpZ3VyZSBvdXQgd2hhdCB0aGUgbWF4aW11bSBwcm9kdWN0IGltYWdlIG9yZGVyIG51bWJlciBpcywgYW5kIGFkZCBvbmUgdG8gaXQuIFxuICAgICAgICAgICAgICAgIC8vIGNvbnN0IG5leHRPcmRlck51bSA9IHRoaXMuZ2V0TmV4dE9yZGVyTnVtYmVyKHByb2R1Y3QpICsgMTA7XG5cbiAgICAgICAgICAgICAgICAvLyBsZXQgaW1hZ2U6IElJbWFnZSA9IHtcbiAgICAgICAgICAgICAgICAvLyAgICAgaXNBY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgLy8gICAgIG9yZGVyOiBuZXh0T3JkZXJOdW0sXG4gICAgICAgICAgICAgICAgLy8gICAgIHZhcmlhdGlvbnM6IG5ldyBBcnJheTxJSW1hZ2VWYXJpYXRpb24+KClcbiAgICAgICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgICAgICAvLyAvLyBBZGQgdGhlIHByb2R1Y3QgaW1hZ2VzLlxuICAgICAgICAgICAgICAgIC8vIHRoaXMuYWRkVmFyaWF0aW9uKGltYWdlLCByYXdJbWFnZUZpbGUsIHJhdywgZW51bXMuSW1hZ2VUeXBlLnJhdywgbmV4dE9yZGVyTnVtKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmFkZFZhcmlhdGlvbihpbWFnZSwgcmF3SW1hZ2VGaWxlLCB0aHVtYiwgZW51bXMuSW1hZ2VUeXBlLnRodW1ibmFpbCwgbmV4dE9yZGVyTnVtKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmFkZFZhcmlhdGlvbihpbWFnZSwgcmF3SW1hZ2VGaWxlLCBpY29uLCBlbnVtcy5JbWFnZVR5cGUuaWNvbiwgbmV4dE9yZGVyTnVtKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmFkZFZhcmlhdGlvbihpbWFnZSwgcmF3SW1hZ2VGaWxlLCBzbWFsbCwgZW51bXMuSW1hZ2VUeXBlLnNtYWxsLCBuZXh0T3JkZXJOdW0pO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuYWRkVmFyaWF0aW9uKGltYWdlLCByYXdJbWFnZUZpbGUsIG1lZGl1bSwgZW51bXMuSW1hZ2VUeXBlLm1lZGl1bSwgbmV4dE9yZGVyTnVtKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmFkZFZhcmlhdGlvbihpbWFnZSwgcmF3SW1hZ2VGaWxlLCBsYXJnZSwgZW51bXMuSW1hZ2VUeXBlLmxhcmdlLCBuZXh0T3JkZXJOdW0pO1xuXG4gICAgICAgICAgICAgICAgLy8gLy8gSWYgdGhpcyBpcyB0aGUgZmlyc3QgaW1hZ2UsIHdlJ3JlIGdvaW5nIHRvIGNyZWF0ZSBhIG5ldyBhcnJheS5cbiAgICAgICAgICAgICAgICAvLyBpZighcHJvZHVjdC5pbWFnZXMpe1xuICAgICAgICAgICAgICAgIC8vICAgICBwcm9kdWN0LmltYWdlcyA9IG5ldyBBcnJheTxJSW1hZ2U+KCk7XG4gICAgICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAgICAgLy8gcHJvZHVjdC5pbWFnZXMucHVzaChpbWFnZSk7XG5cbiAgICAgICAgICAgICAgICAvLyAvLyBTYXZlIHRoZSB1cGRhdGVkIHByb2R1Y3QuXG4gICAgICAgICAgICAgICAgLy8gY29uc3QgdXBkYXRlZFByb2R1Y3QgPSBhd2FpdCBuZXcgUHJvZHVjdFJlcG9zaXRvcnkoKS5zYXZlKHByb2R1Y3QpO1xuXG4gICAgICAgICAgICAgICAgLy8gcmVzcG9uc2Uuc3RhdHVzKDIwMCkuanNvbih1cGRhdGVkUHJvZHVjdCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvbGxiYWNrUHJvZHVjdEltYWdlcyhyYXdJbWFnZUZpbGUsIHRydWUpO1xuICAgICAgICAgICAgICAgIEFwaUVycm9ySGFuZGxlci5zZW5kRXJyb3IoYEVycm9yIGR1cmluZyBpbWFnZSBwcm9jZXNzaW5nLiAke2Vycn1gLCA1MDAsIHJlc3BvbnNlLCBudWxsLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb2xsYmFja1Byb2R1Y3RJbWFnZXMocmF3SW1hZ2VGaWxlLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBBcGlFcnJvckhhbmRsZXIuc2VuZEVycm9yKGBGaWxlIHdhc24ndCBwcmVzZW50IG9uIHRoZSByZXF1ZXN0LiAgQXJlIHlvdSBzdXJlIHlvdSBzZW50IHRoZSBmaWxlIHdpdGggZmllbGQgbmFtZWQgJ2ZpbGUnYCwgNTAwLCByZXNwb25zZSwgbnVsbCwgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBwdWJsaWMgZ2V0TmV4dE9yZGVyTnVtYmVyKHByb2R1Y3Q6IElQcm9kdWN0KTogbnVtYmVyIHtcbiAgICAvLyAgICAgaWYgKHByb2R1Y3QgJiYgcHJvZHVjdC5pbWFnZXMgJiYgcHJvZHVjdC5pbWFnZXMubGVuZ3RoID4gMCkge1xuICAgIC8vICAgICAgICAgbGV0IG1heCA9IDA7XG4gICAgLy8gICAgICAgICBwcm9kdWN0LmltYWdlcy5mb3JFYWNoKGltYWdlID0+IHtcbiAgICAvLyAgICAgICAgICAgICBtYXggPSBNYXRoLm1heChtYXgsIGltYWdlLm9yZGVyKTtcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICAgICAgcmV0dXJuICsrbWF4O1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIHJldHVybiAwO1xuICAgIC8vIH1cblxuICAgIHB1YmxpYyBhZGRWYXJpYXRpb24oaW1hZ2U6IElJbWFnZSwgZmlsZTogTXVsdGVyRmlsZSwgc2hhcnBJbmZvOiBzaGFycC5PdXRwdXRJbmZvLCB0eXBlOiBlbnVtcy5JbWFnZVR5cGUsIG9yZGVyOiBudW1iZXIpOiBJSW1hZ2Uge1xuICAgICAgICBpbWFnZS52YXJpYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIGhlaWdodDogc2hhcnBJbmZvLmhlaWdodCxcbiAgICAgICAgICAgIHdpZHRoOiBzaGFycEluZm8ud2lkdGgsXG4gICAgICAgICAgICB1cmw6IGAke0NvbmZpZy5hY3RpdmUuZ2V0KCdQcm9kdWN0SW1hZ2VVUkxMb2NhdGlvblJvb3QnKX0ke0NvbmZpZy5hY3RpdmUuZ2V0KCdQcm9kdWN0SW1hZ2VCdWNrZXROYW1lJyl9LyR7QW1hem9uUzNTZXJ2aWNlLnZhcmlhdGlvbk5hbWUodHlwZSwgZmlsZSl9YCxcbiAgICAgICAgICAgIGtleTogQW1hem9uUzNTZXJ2aWNlLnZhcmlhdGlvbk5hbWUodHlwZSwgZmlsZSlcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBpbWFnZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZ2VuZXJhdGVWYXJpYXRpb24oaW1hZ2VUeXBlOiBlbnVtcy5JbWFnZVR5cGUsIHJhd0ltYWdlRmlsZTogTXVsdGVyRmlsZSwgcmVzcG9uc2U6IFJlc3BvbnNlLCB3aWR0aDogbnVtYmVyID0gbnVsbCwgaGVpZ2h0OiBudW1iZXIgPSBudWxsLCBxdWFsaXR5OiBudW1iZXIgPSA4MCk6IFByb21pc2U8c2hhcnAuT3V0cHV0SW5mbyB8IGFueT4ge1xuICAgICAgICAvLyBJZiB5b3UgZG9uJ3QgdHVybiBvZmYgY2FjaGUgd2hlbiB5b3UncmUgdHJ5aW5nIHRvIGNsZWFudXAgdGhlIGZpbGVzLCB5b3Ugd29uJ3QgYmUgYWJsZSB0byBkZWNvbnN0ZSB0aGUgZmlsZS5cbiAgICAgICAgc2hhcnAuY2FjaGUoZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IG91dHB1dEluZm86IHNoYXJwLk91dHB1dEluZm8gPSBhd2FpdCBzaGFycChwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vJywgYCR7Q09OU1QuSU1BR0VfVVBMT0FEX1BBVEh9JHtyYXdJbWFnZUZpbGUuZmlsZW5hbWV9YCkpXG4gICAgICAgICAgICAucmVzaXplKHdpZHRoLCBoZWlnaHQpXG4gICAgICAgICAgICAuY3JvcChzaGFycC5ncmF2aXR5LmNlbnRlcilcbiAgICAgICAgICAgIC50b0Zvcm1hdChzaGFycC5mb3JtYXQucG5nLCB7XG4gICAgICAgICAgICAgICAgcXVhbGl0eTogcXVhbGl0eSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudG9GaWxlKGAke0NPTlNULklNQUdFX1VQTE9BRF9QQVRIfSR7QW1hem9uUzNTZXJ2aWNlLnZhcmlhdGlvbk5hbWUoaW1hZ2VUeXBlLCByYXdJbWFnZUZpbGUpfWApO1xuXG4gICAgICAgIGF3YWl0IEFtYXpvblMzU2VydmljZS51cGxvYWRJbWFnZVRvUzMocmVzcG9uc2UsIHJhd0ltYWdlRmlsZSwgaW1hZ2VUeXBlKTtcblxuICAgICAgICByZXR1cm4gb3V0cHV0SW5mbztcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tQcm9kdWN0SW1hZ2VzKHJhd0ltYWdlRmlsZTogTXVsdGVyRmlsZSwgY2xlYW5TMzogYm9vbGVhbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gZmlyc3Qgd2UncmUgZ29pbmcgdG8gdHJ5IGFuZCBjbGVhbiB1cCB0aGUgaW1hZ2UgZmlsZSB0aGF0IHdhcyB1cGxvYWRlZCB0byB0aGUgc2VydmVyLlxuICAgICAgICAgICAgYXdhaXQgZnMuZGVsZXRlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8nLCBgJHtDT05TVC5JTUFHRV9VUExPQURfUEFUSH0ke3Jhd0ltYWdlRmlsZS5maWxlbmFtZX1gKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nLmVycm9yKGBTV0FMTE9XSU5HISBUaGVyZSB3YXMgYW4gZXJyb3IgdHJ5aW5nIHRvIGRlbGV0ZSB0aGUgZmlsZSB0aGF0IHdhcyBjcmVhdGVkIGR1cmluZyB1cGxvYWQuXG4gICAgICAgICAgICBVcGxvYWQgcGF0aCBjb3VsZCBmaWxsLiBmaWxlbmFtZTogJHtyYXdJbWFnZUZpbGUuZmlsZW5hbWV9ICBFeGNlcHRpb246ICR7ZXJyfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIE5vdyB3ZSdyZSBnb2luZyB0byB0cnkgYW5kIGNsZWFudXAgdGhlIGltYWdlcyBvbiBzM1xuICAgICAgICAgICAgLy93aGlsZSB3ZSBzdGlsbCBoYXZlIGVhc3kgYWNjZXNzIHRvIHRoZSBmaWxlIHdlJ3JlIGdvaW5nIHRvIHNlbmQgaXQgdXAgdG8gczMuXG4gICAgICAgICAgICB0aGlzLnJvbGxiYWNrSW1hZ2VWYXJpYXRpb25zKHJhd0ltYWdlRmlsZSwgZW51bXMuSW1hZ2VUeXBlLnJhdywgY2xlYW5TMyk7XG4gICAgICAgICAgICB0aGlzLnJvbGxiYWNrSW1hZ2VWYXJpYXRpb25zKHJhd0ltYWdlRmlsZSwgZW51bXMuSW1hZ2VUeXBlLmljb24sIGNsZWFuUzMpO1xuICAgICAgICAgICAgdGhpcy5yb2xsYmFja0ltYWdlVmFyaWF0aW9ucyhyYXdJbWFnZUZpbGUsIGVudW1zLkltYWdlVHlwZS50aHVtYm5haWwsIGNsZWFuUzMpO1xuICAgICAgICAgICAgdGhpcy5yb2xsYmFja0ltYWdlVmFyaWF0aW9ucyhyYXdJbWFnZUZpbGUsIGVudW1zLkltYWdlVHlwZS5zbWFsbCwgY2xlYW5TMyk7XG4gICAgICAgICAgICB0aGlzLnJvbGxiYWNrSW1hZ2VWYXJpYXRpb25zKHJhd0ltYWdlRmlsZSwgZW51bXMuSW1hZ2VUeXBlLm1lZGl1bSwgY2xlYW5TMyk7XG4gICAgICAgICAgICB0aGlzLnJvbGxiYWNrSW1hZ2VWYXJpYXRpb25zKHJhd0ltYWdlRmlsZSwgZW51bXMuSW1hZ2VUeXBlLmxhcmdlLCBjbGVhblMzKTtcblxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxvZy5lcnJvcihgU1dBTExPV0lORyEgIFRoZXJlIHdhcyBhbiBlcnJvciB0cnlpbmcgdG8gY2xlYW51cCB0aGUgZmlsZXMgZnJvbSB0aGUgc2VydmVyLCBhbmQgUzMuXG4gICAgICAgICAgICBVcGxvYWQgcGF0aCBjb3VsZCBmaWxsLiBmaWxlbmFtZTogJHtyYXdJbWFnZUZpbGUuZmlsZW5hbWV9ICBFeGNlcHRpb246ICR7ZXJyfWApO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tJbWFnZVZhcmlhdGlvbnMocmF3SW1hZ2VGaWxlOiBNdWx0ZXJGaWxlLCBpbWFnZVR5cGU6IGVudW1zLkltYWdlVHlwZSwgY2xlYW5TMzogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gbm93IHdlJ3JlIGdvaW5nIHRvIHRyeSBhbmQgY2xlYW4gdXAgYWxsIHRoZSB2YXJpYXRpb25zIHRoYXQgd2VyZSBjcmVhdGVkLlxuICAgICAgICAgICAgYXdhaXQgZnMuZGVsZXRlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8nLCBgJHtDT05TVC5JTUFHRV9VUExPQURfUEFUSH0ke0FtYXpvblMzU2VydmljZS52YXJpYXRpb25OYW1lKGltYWdlVHlwZSwgcmF3SW1hZ2VGaWxlKX1gKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nLmVycm9yKGBTV0FMTE9XSU5HISBXaGlsZSB0cnlpbmcgdG8gY2xlYW51cCBpbWFnZSB2YXJpYXRpb25zIHRoZXJlIHdhcyBhbiBlcnJvci4gZmlsZW5hbWU6ICR7QW1hem9uUzNTZXJ2aWNlLnZhcmlhdGlvbk5hbWUoaW1hZ2VUeXBlLCByYXdJbWFnZUZpbGUpfVxuICAgICAgICAgICAgIEV4Y2VwdGlvbjogJHtlcnJ9YCk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGNsZWFuUzMpIHtcbiAgICAgICAgICAgICAgICBBbWF6b25TM1NlcnZpY2UuY2xlYW5Bd3MocmF3SW1hZ2VGaWxlLCBpbWFnZVR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxvZy5lcnJvcihgU1dBTExPV0lORyEgRXhjZXB0aW9uIHdoaWxlIHRyeWluZyB0byBjbGVhbiB0aGUgaW1hZ2UgZnJvbSBTMyBLRVk6ICR7QW1hem9uUzNTZXJ2aWNlLnZhcmlhdGlvbk5hbWUoaW1hZ2VUeXBlLCByYXdJbWFnZUZpbGUpfVxuICAgICAgICAgICAgRXhjZXB0aW9uOiAke2Vycn1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
