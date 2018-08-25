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
const AWS = require("aws-sdk");
const config_1 = require("../config/config");
const constants_1 = require("../constants");
const api_error_handler_1 = require("../api-error-handler");
const path = require("path");
const log = require("winston");
const enums = require("../enumerations");
const fs = require("async-file");
class AmazonS3Service {
    static uploadImageToS3(response, rawImageFile, imageType) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = null;
            try {
                data = yield fs.readFile(path.resolve(__dirname, '../../', `${constants_1.CONST.IMAGE_UPLOAD_PATH}${this.variationName(imageType, rawImageFile)}`));
            }
            catch (err) {
                api_error_handler_1.ApiErrorHandler.sendError(`Problem reading the contents of resized file back out. ${err}`, 500, response, null, err);
                return;
            }
            //while we still have easy access to the file we're going to send it up to s3.
            this.configureAws();
            const s3 = this.configureS3(rawImageFile.mimetype);
            try {
                let s3data = yield s3.putObject({
                    Body: data,
                    Bucket: config_1.Config.active.get('AlembicS3Bucket'),
                    Key: this.variationName(imageType, rawImageFile),
                    Metadata: {
                        ContentType: rawImageFile.mimetype
                    },
                    ContentType: rawImageFile.mimetype
                }).promise();
                log.info(`Uploaded image to s3:${JSON.stringify(s3data.$response.data)}`);
                return s3data;
            }
            catch (err) {
                api_error_handler_1.ApiErrorHandler.sendError(`Failure during s3 upload. ${err}`, 500, response, null, err);
            }
        });
    }
    static cleanAws(rawImageFile, imageType) {
        return __awaiter(this, void 0, void 0, function* () {
            this.configureAws();
            yield this.deleteFileFromS3(this.variationName(imageType, rawImageFile));
        });
    }
    static configureS3(mimeType) {
        const options = {
            apiVersion: '2006-03-01',
            params: {
                Bucket: config_1.Config.active.get('AlembicS3Bucket'),
                ACL: 'public-read',
                Metadata: {
                    ContentType: mimeType
                }
            }
        };
        return new AWS.S3(options);
    }
    static configureAws() {
        AWS.config.update({
            accessKeyId: config_1.Config.active.get('AWSAccessKey'),
            secretAccessKey: config_1.Config.active.get('AWSSecret'),
            region: 'us-east-2',
        });
    }
    static variationName(imageType, rawImageFile) {
        return `${enums.ImageType[imageType]}-${rawImageFile.filename}`;
    }
    static deleteFileFromS3(key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.configureAws();
            const s3 = this.configureS3(null);
            let s3data = yield s3.deleteObject({
                Bucket: config_1.Config.active.get('AlembicS3Bucket'),
                Key: key
            }).promise();
            log.info(`Cleanup: Deleted Object from S3: ${JSON.stringify(s3data.$response.data)}`);
            return s3data;
        });
    }
}
exports.AmazonS3Service = AmazonS3Service;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL3NlcnZpY2VzL2FtYXpvblMzLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLCtCQUErQjtBQUkvQiw2Q0FBMEM7QUFFMUMsNENBQXFDO0FBQ3JDLDREQUF1RDtBQUV2RCw2QkFBNkI7QUFHN0IsK0JBQWdDO0FBQ2hDLHlDQUF5QztBQUN6QyxpQ0FBaUM7QUFHakM7SUFFVyxNQUFNLENBQU8sZUFBZSxDQUFDLFFBQWtCLEVBQUUsWUFBd0IsRUFBRSxTQUEwQjs7WUFDeEcsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLElBQUksQ0FBQztnQkFDRCxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxHQUFHLGlCQUFLLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUksQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsbUNBQWUsQ0FBQyxTQUFTLENBQUMsMERBQTBELEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNySCxNQUFNLENBQUM7WUFDWCxDQUFDO1lBRUQsOEVBQThFO1lBRTlFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUVwQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVuRCxJQUFJLENBQUM7Z0JBQ0QsSUFBSSxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDO29CQUM1QixJQUFJLEVBQUUsSUFBSTtvQkFDVixNQUFNLEVBQUUs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cyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7IFJvdXRlciwgUmVxdWVzdCwgUmVzcG9uc2UsIFJlcXVlc3RQYXJhbUhhbmRsZXIsIE5leHRGdW5jdGlvbiwgUmVxdWVzdEhhbmRsZXIsIEFwcGxpY2F0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgbW9uZ29vc2UgPSByZXF1aXJlKCdtb25nb29zZScpO1xuaW1wb3J0IHsgU2NoZW1hLCBNb2RlbCwgRG9jdW1lbnQgfSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tICcuLi9jb25maWcvY29uZmlnJztcbmltcG9ydCB7IElUb2tlblBheWxvYWQsIElCYXNlTW9kZWxEb2MsIE11bHRlckZpbGUgfSBmcm9tICcuLi9tb2RlbHMvJztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSBcIi4uL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgQXBpRXJyb3JIYW5kbGVyIH0gZnJvbSBcIi4uL2FwaS1lcnJvci1oYW5kbGVyXCI7XG5pbXBvcnQgKiBhcyByaW1yYWYgZnJvbSAncmltcmFmJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBtdWx0ZXIgZnJvbSAnbXVsdGVyJztcbmltcG9ydCAqIGFzIHNoYXJwIGZyb20gJ3NoYXJwJztcbmltcG9ydCBsb2cgPSByZXF1aXJlKCd3aW5zdG9uJyk7XG5pbXBvcnQgKiBhcyBlbnVtcyBmcm9tICcuLi9lbnVtZXJhdGlvbnMnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnYXN5bmMtZmlsZSc7XG5pbXBvcnQgeyBTMyB9IGZyb20gJ2F3cy1zZGsnO1xuXG5leHBvcnQgY2xhc3MgQW1hem9uUzNTZXJ2aWNle1xuXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyB1cGxvYWRJbWFnZVRvUzMocmVzcG9uc2U6IFJlc3BvbnNlLCByYXdJbWFnZUZpbGU6IE11bHRlckZpbGUsIGltYWdlVHlwZTogZW51bXMuSW1hZ2VUeXBlKTogUHJvbWlzZTxTMy5QdXRPYmplY3RPdXRwdXQ+IHtcbiAgICAgICAgbGV0IGRhdGEgPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGF0YSA9IGF3YWl0IGZzLnJlYWRGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8nLCBgJHtDT05TVC5JTUFHRV9VUExPQURfUEFUSH0ke3RoaXMudmFyaWF0aW9uTmFtZShpbWFnZVR5cGUsIHJhd0ltYWdlRmlsZSl9YCkpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIEFwaUVycm9ySGFuZGxlci5zZW5kRXJyb3IoYFByb2JsZW0gcmVhZGluZyB0aGUgY29udGVudHMgb2YgcmVzaXplZCBmaWxlIGJhY2sgb3V0LiAke2Vycn1gLCA1MDAsIHJlc3BvbnNlLCBudWxsLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy93aGlsZSB3ZSBzdGlsbCBoYXZlIGVhc3kgYWNjZXNzIHRvIHRoZSBmaWxlIHdlJ3JlIGdvaW5nIHRvIHNlbmQgaXQgdXAgdG8gczMuXG5cbiAgICAgICAgdGhpcy5jb25maWd1cmVBd3MoKTtcblxuICAgICAgICBjb25zdCBzMyA9IHRoaXMuY29uZmlndXJlUzMocmF3SW1hZ2VGaWxlLm1pbWV0eXBlKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHMzZGF0YSA9IGF3YWl0IHMzLnB1dE9iamVjdCh7XG4gICAgICAgICAgICAgICAgQm9keTogZGF0YSxcbiAgICAgICAgICAgICAgICBCdWNrZXQ6IENvbmZpZy5hY3RpdmUuZ2V0KCdBbGVtYmljUzNCdWNrZXQnKSxcbiAgICAgICAgICAgICAgICBLZXk6IHRoaXMudmFyaWF0aW9uTmFtZShpbWFnZVR5cGUsIHJhd0ltYWdlRmlsZSksXG4gICAgICAgICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgQ29udGVudFR5cGU6IHJhd0ltYWdlRmlsZS5taW1ldHlwZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgQ29udGVudFR5cGU6IHJhd0ltYWdlRmlsZS5taW1ldHlwZVxuICAgICAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgICAgICBsb2cuaW5mbyhgVXBsb2FkZWQgaW1hZ2UgdG8gczM6JHtKU09OLnN0cmluZ2lmeShzM2RhdGEuJHJlc3BvbnNlLmRhdGEpfWApO1xuICAgICAgICAgICAgcmV0dXJuIHMzZGF0YTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBBcGlFcnJvckhhbmRsZXIuc2VuZEVycm9yKGBGYWlsdXJlIGR1cmluZyBzMyB1cGxvYWQuICR7ZXJyfWAsIDUwMCwgcmVzcG9uc2UsIG51bGwsIGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGNsZWFuQXdzKHJhd0ltYWdlRmlsZTogTXVsdGVyRmlsZSwgaW1hZ2VUeXBlOiBlbnVtcy5JbWFnZVR5cGUpe1xuICAgICAgICB0aGlzLmNvbmZpZ3VyZUF3cygpO1xuICAgICAgICBcbiAgICAgICAgYXdhaXQgdGhpcy5kZWxldGVGaWxlRnJvbVMzKHRoaXMudmFyaWF0aW9uTmFtZShpbWFnZVR5cGUsIHJhd0ltYWdlRmlsZSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGNvbmZpZ3VyZVMzKG1pbWVUeXBlOiBzdHJpbmcpOiBTM3tcbiAgICAgICAgY29uc3Qgb3B0aW9uczogUzMuQ2xpZW50Q29uZmlndXJhdGlvbiA9IHtcbiAgICAgICAgICAgIGFwaVZlcnNpb246ICcyMDA2LTAzLTAxJyxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIEJ1Y2tldDogQ29uZmlnLmFjdGl2ZS5nZXQoJ0FsZW1iaWNTM0J1Y2tldCcpLFxuICAgICAgICAgICAgICAgIEFDTDogJ3B1YmxpYy1yZWFkJyxcbiAgICAgICAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBDb250ZW50VHlwZTogbWltZVR5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBuZXcgQVdTLlMzKG9wdGlvbnMpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHN0YXRpYyBjb25maWd1cmVBd3MoKSB7XG4gICAgICAgIEFXUy5jb25maWcudXBkYXRlKHtcbiAgICAgICAgICAgIGFjY2Vzc0tleUlkOiBDb25maWcuYWN0aXZlLmdldCgnQVdTQWNjZXNzS2V5JyksXG4gICAgICAgICAgICBzZWNyZXRBY2Nlc3NLZXk6IENvbmZpZy5hY3RpdmUuZ2V0KCdBV1NTZWNyZXQnKSxcbiAgICAgICAgICAgIHJlZ2lvbjogJ3VzLWVhc3QtMicsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgdmFyaWF0aW9uTmFtZShpbWFnZVR5cGU6IGVudW1zLkltYWdlVHlwZSwgcmF3SW1hZ2VGaWxlOiBNdWx0ZXJGaWxlKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGAke2VudW1zLkltYWdlVHlwZVtpbWFnZVR5cGVdfS0ke3Jhd0ltYWdlRmlsZS5maWxlbmFtZX1gO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgZGVsZXRlRmlsZUZyb21TMyhrZXk6IHN0cmluZyk6IFByb21pc2U8UzMuRGVsZXRlT2JqZWN0T3V0cHV0PntcbiAgICAgICAgdGhpcy5jb25maWd1cmVBd3MoKTtcbiAgICAgICAgY29uc3QgczM6IFMzID0gdGhpcy5jb25maWd1cmVTMyhudWxsKVxuICAgICAgICBsZXQgczNkYXRhID0gYXdhaXQgczMuZGVsZXRlT2JqZWN0KHtcbiAgICAgICAgICAgIEJ1Y2tldDogQ29uZmlnLmFjdGl2ZS5nZXQoJ0FsZW1iaWNTM0J1Y2tldCcpLFxuICAgICAgICAgICAgS2V5OiBrZXlcbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIGxvZy5pbmZvKGBDbGVhbnVwOiBEZWxldGVkIE9iamVjdCBmcm9tIFMzOiAke0pTT04uc3RyaW5naWZ5KHMzZGF0YS4kcmVzcG9uc2UuZGF0YSl9YCk7XG5cbiAgICAgICAgcmV0dXJuIHMzZGF0YTtcbiAgICB9XG59Il19
