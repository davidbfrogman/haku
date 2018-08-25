"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const fs = require("fs");
const mime = require("mime");
const multer = require("multer");
const log = require("winston");
const constants_1 = require("../constants");
class MulterConfiguration {
    constructor() {
        this.storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, `${constants_1.CONST.IMAGE_UPLOAD_PATH}`);
            },
            filename: this.fileName,
        });
        this.uploader = multer({
            storage: this.storage,
            fileFilter: this.fileFilter,
            limits: {
                fileSize: 10000000,
                files: 10 //maximum  of 10 files at a time
            },
        });
        this.ensureUploadFolderExists();
    }
    ensureUploadFolderExists() {
        try {
            var dir = constants_1.CONST.IMAGE_UPLOAD_PATH;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
        }
        catch (err) {
            throw (JSON.stringify({
                message: 'There was an error creating the default file upload directory.  Check Multer.',
                error: err
            }));
        }
    }
    fileName(req, file, cb) {
        crypto.pseudoRandomBytes(16, (err, raw) => {
            let fileName = file.originalname;
            // I'm slicing off the extention, so that the image name is easier to read, although this might
            // lead to problems later, if for some reason there is a file named 'a.y'
            // first trim off the extension with .jpg etc...
            let tokens = fileName.split(new RegExp('\.[^.]+$'));
            if (tokens.length != 2) {
                log.error('A bad file was uploaded in multer: here are the tokens that broke it:' + tokens);
                return cb(new Error('The file you tried to upload was not named in a standard format. filename.jpeg is expected.'), false);
            }
            // Here we're trimming the filename down to 15 chars.  I don't want ridiculously long filenames.
            tokens[0] = tokens[0].trim().substring(0, Math.min(tokens[0].length, 15));
            cb(null, `${tokens[0]}-${raw.toString('hex')}-${Date.now()}.${mime.getExtension(file.mimetype)}`);
        });
    }
    fileFilter(req, file, cb) {
        // accept image only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg|)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}
exports.MulterConfiguration = MulterConfiguration;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL2NvbmZpZy9tdWx0ZXIuY29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFpQztBQUNqQyx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQywrQkFBK0I7QUFDL0IsNENBQXFDO0FBR3JDO0lBQ0k7UUFJTyxZQUFPLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUNoQyxXQUFXLEVBQUUsVUFBVSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQ2hDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxpQkFBSyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtZQUMxQyxDQUFDO1lBQ0QsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQzFCLENBQUMsQ0FBQztRQUVJLGFBQVEsR0FBRyxNQUFNLENBQUM7WUFDckIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ3JCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtZQUMzQixNQUFNLEVBQUU7Z0JBQ0osUUFBUSxFQUFHLFFBQVE7Z0JBQ25CLEtBQUssRUFBRSxFQUFFLENBQUMsZ0NBQWdDO2FBQzdDO1NBQ0osQ0FBQyxDQUFDO1FBakJDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFrQk0sd0JBQXdCO1FBQzNCLElBQUcsQ0FBQztZQUNBLElBQUksR0FBRyxHQUFHLGlCQUFLLENBQUMsaUJBQWlCLENBQUM7WUFDbEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUEsQ0FBQztnQkFDckIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QixDQUFDO1FBQ0wsQ0FBQztRQUNELEtBQUssQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUM7WUFDUCxNQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDakIsT0FBTyxFQUFFLCtFQUErRTtnQkFDeEYsS0FBSyxFQUFFLEdBQUc7YUFDYixDQUFDLENBQUMsQ0FBQztRQUNSLENBQUM7SUFDTCxDQUFDO0lBRU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUN6QixNQUFNLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ3RDLElBQUksUUFBUSxHQUFXLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDekMsK0ZBQStGO1lBQy9GLHlFQUF5RTtZQUN6RSxnREFBZ0Q7WUFDaEQsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3BELEVBQUUsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQ3RCLENBQUM7Z0JBQ0csR0FBRyxDQUFDLEtBQUssQ0FBQyx1RUFBdUUsR0FBRyxNQUFNLENBQUMsQ0FBQztnQkFDNUYsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyw2RkFBNkYsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQy9ILENBQUM7WUFDRCxnR0FBZ0c7WUFDaEcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQ3ZFLEVBQUUsQ0FBQyxJQUFJLEVBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JHLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLFVBQVUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDM0Isb0JBQW9CO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFDRCxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25CLENBQUM7Q0FDSjtBQTdERCxrREE2REMiLCJmaWxlIjoiY29uZmlnL211bHRlci5jb25maWd1cmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBtaW1lIGZyb20gJ21pbWUnO1xuaW1wb3J0ICogYXMgbXVsdGVyIGZyb20gJ211bHRlcic7XG5pbXBvcnQgKiBhcyBsb2cgZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyBDT05TVCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cblxuZXhwb3J0IGNsYXNzIE11bHRlckNvbmZpZ3VyYXRpb257XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuZW5zdXJlVXBsb2FkRm9sZGVyRXhpc3RzKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3JhZ2UgPSBtdWx0ZXIuZGlza1N0b3JhZ2Uoe1xuICAgICAgICBkZXN0aW5hdGlvbjogZnVuY3Rpb24gKHJlcSwgZmlsZSwgY2IpIHtcbiAgICAgICAgICAgIGNiKG51bGwsIGAke0NPTlNULklNQUdFX1VQTE9BRF9QQVRIfWApXG4gICAgICAgIH0sXG4gICAgICAgIGZpbGVuYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgIH0pO1xuXG4gICAgcHVibGljIHVwbG9hZGVyID0gbXVsdGVyKHtcbiAgICAgICAgc3RvcmFnZTogdGhpcy5zdG9yYWdlLFxuICAgICAgICBmaWxlRmlsdGVyOiB0aGlzLmZpbGVGaWx0ZXIsXG4gICAgICAgIGxpbWl0czoge1xuICAgICAgICAgICAgZmlsZVNpemUgOiAxMDAwMDAwMCwgLy8xMG1iIGxpbWl0IG9uIGZpbGVzaXplLCB0aGlzIG51bWJlciBpcyBpbiBieXRlc1xuICAgICAgICAgICAgZmlsZXM6IDEwIC8vbWF4aW11bSAgb2YgMTAgZmlsZXMgYXQgYSB0aW1lXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBwdWJsaWMgZW5zdXJlVXBsb2FkRm9sZGVyRXhpc3RzKCl7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHZhciBkaXIgPSBDT05TVC5JTUFHRV9VUExPQURfUEFUSDtcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhkaXIpKXtcbiAgICAgICAgICAgICAgICBmcy5ta2RpclN5bmMoZGlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaChlcnIpe1xuICAgICAgICAgICAgdGhyb3coSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGVyZSB3YXMgYW4gZXJyb3IgY3JlYXRpbmcgdGhlIGRlZmF1bHQgZmlsZSB1cGxvYWQgZGlyZWN0b3J5LiAgQ2hlY2sgTXVsdGVyLicsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGZpbGVOYW1lKHJlcSwgZmlsZSwgY2IpIHtcbiAgICAgICAgY3J5cHRvLnBzZXVkb1JhbmRvbUJ5dGVzKDE2LCAoZXJyLCByYXcpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWxlTmFtZTogc3RyaW5nID0gZmlsZS5vcmlnaW5hbG5hbWU7XG4gICAgICAgICAgICAvLyBJJ20gc2xpY2luZyBvZmYgdGhlIGV4dGVudGlvbiwgc28gdGhhdCB0aGUgaW1hZ2UgbmFtZSBpcyBlYXNpZXIgdG8gcmVhZCwgYWx0aG91Z2ggdGhpcyBtaWdodFxuICAgICAgICAgICAgLy8gbGVhZCB0byBwcm9ibGVtcyBsYXRlciwgaWYgZm9yIHNvbWUgcmVhc29uIHRoZXJlIGlzIGEgZmlsZSBuYW1lZCAnYS55J1xuICAgICAgICAgICAgLy8gZmlyc3QgdHJpbSBvZmYgdGhlIGV4dGVuc2lvbiB3aXRoIC5qcGcgZXRjLi4uXG4gICAgICAgICAgICBsZXQgdG9rZW5zID0gZmlsZU5hbWUuc3BsaXQobmV3IFJlZ0V4cCgnXFwuW14uXSskJykpO1xuICAgICAgICAgICAgaWYodG9rZW5zLmxlbmd0aCAhPSAyKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvZy5lcnJvcignQSBiYWQgZmlsZSB3YXMgdXBsb2FkZWQgaW4gbXVsdGVyOiBoZXJlIGFyZSB0aGUgdG9rZW5zIHRoYXQgYnJva2UgaXQ6JyArIHRva2Vucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiKG5ldyBFcnJvcignVGhlIGZpbGUgeW91IHRyaWVkIHRvIHVwbG9hZCB3YXMgbm90IG5hbWVkIGluIGEgc3RhbmRhcmQgZm9ybWF0LiBmaWxlbmFtZS5qcGVnIGlzIGV4cGVjdGVkLicpLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBIZXJlIHdlJ3JlIHRyaW1taW5nIHRoZSBmaWxlbmFtZSBkb3duIHRvIDE1IGNoYXJzLiAgSSBkb24ndCB3YW50IHJpZGljdWxvdXNseSBsb25nIGZpbGVuYW1lcy5cbiAgICAgICAgICAgIHRva2Vuc1swXSA9IHRva2Vuc1swXS50cmltKCkuc3Vic3RyaW5nKDAsTWF0aC5taW4odG9rZW5zWzBdLmxlbmd0aCwxNSkpXG4gICAgICAgICAgICBjYihudWxsLGAke3Rva2Vuc1swXX0tJHtyYXcudG9TdHJpbmcoJ2hleCcpfS0ke0RhdGUubm93KCl9LiR7bWltZS5nZXRFeHRlbnNpb24oZmlsZS5taW1ldHlwZSl9YCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBmaWxlRmlsdGVyKHJlcSwgZmlsZSwgY2IpIHtcbiAgICAgICAgLy8gYWNjZXB0IGltYWdlIG9ubHlcbiAgICAgICAgaWYgKCFmaWxlLm9yaWdpbmFsbmFtZS5tYXRjaCgvXFwuKGpwZ3xqcGVnfHBuZ3xnaWZ8c3ZnfCkkLykpIHtcbiAgICAgICAgICAgIHJldHVybiBjYihuZXcgRXJyb3IoJ09ubHkgaW1hZ2UgZmlsZXMgYXJlIGFsbG93ZWQhJyksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBjYihudWxsLCB0cnVlKTtcbiAgICB9XG59XG4iXX0=
