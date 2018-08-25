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
const mongoose = require("mongoose");
exports.mongoose = mongoose;
const health_status_1 = require("../../health-status");
const config_1 = require("../config");
const log = require("winston");
mongoose.Promise = require('bluebird');
class Database {
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const connectionOptions = {
                useNewUrlParser: true,
                // These two setting should help remove the 'Mongoose Topology destroyed error`
                // sets how many times to try reconnecting
                reconnectTries: Number.MAX_VALUE,
                // sets the delay between every retry (milliseconds)
                reconnectInterval: 10000
            };
            if (!health_status_1.HealthStatus.isDatabaseConnected) {
                try {
                    yield mongoose.connect(config_1.Config.active.get('mongoConnectionString'), connectionOptions);
                    this.databaseName = mongoose.connection.db.databaseName;
                    log.info(`Connected To Mongo Database: ${mongoose.connection.db.databaseName}`);
                    health_status_1.HealthStatus.isDatabaseConnected = true;
                }
                catch (err) {
                    log.info('error while trying to connect with mongodb', err);
                    health_status_1.HealthStatus.isDatabaseConnected = false;
                }
            }
        });
    }
}
Database.databaseName = '';
exports.Database = Database;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL2NvbmZpZy9kYXRhYmFzZS9kYXRhYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEscUNBQXNDO0FBbUM3Qiw0QkFBUTtBQWxDakIsdURBQW1EO0FBQ25ELHNDQUFtQztBQUNuQywrQkFBZ0M7QUFDaEMsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFdkM7SUFHVyxNQUFNLENBQU8sT0FBTzs7WUFFdkIsTUFBTSxpQkFBaUIsR0FBUTtnQkFDM0IsZUFBZSxFQUFFLElBQUk7Z0JBQ3JCLCtFQUErRTtnQkFDL0UsMENBQTBDO2dCQUMxQyxjQUFjLEVBQUUsTUFBTSxDQUFDLFNBQVM7Z0JBQ2hDLG9EQUFvRDtnQkFDcEQsaUJBQWlCLEVBQUUsS0FBSzthQUMxQixDQUFBO1lBQ0QsRUFBRSxDQUFBLENBQUMsQ0FBQyw0QkFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUEsQ0FBQztnQkFDbEMsSUFBRyxDQUFDO29CQUNELE1BQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxlQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUM7b0JBQ3RGLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDO29CQUV4RCxHQUFHLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO29CQUNoRiw0QkFBWSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztnQkFDNUMsQ0FBQztnQkFDRCxLQUFLLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO29CQUNQLEdBQUcsQ0FBQyxJQUFJLENBQUMsNENBQTRDLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQzVELDRCQUFZLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO2dCQUM3QyxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7S0FBQTs7QUF4QmEscUJBQVksR0FBVyxFQUFFLENBQUM7QUFGNUMsNEJBMkJDIiwiZmlsZSI6ImNvbmZpZy9kYXRhYmFzZS9kYXRhYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSA9IHJlcXVpcmUoJ21vbmdvb3NlJyk7XG5pbXBvcnQgeyBIZWFsdGhTdGF0dXMgfSBmcm9tICcuLi8uLi9oZWFsdGgtc3RhdHVzJztcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQgbG9nID0gcmVxdWlyZSgnd2luc3RvbicpO1xubW9uZ29vc2UuUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7IFxuXG5leHBvcnQgY2xhc3MgRGF0YWJhc2Uge1xuXG4gICAgcHVibGljIHN0YXRpYyBkYXRhYmFzZU5hbWU6IHN0cmluZyA9ICcnO1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgY29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgICAgICBjb25zdCBjb25uZWN0aW9uT3B0aW9uczogYW55ID0geyBcbiAgICAgICAgICAgIHVzZU5ld1VybFBhcnNlcjogdHJ1ZSxcbiAgICAgICAgICAgIC8vIFRoZXNlIHR3byBzZXR0aW5nIHNob3VsZCBoZWxwIHJlbW92ZSB0aGUgJ01vbmdvb3NlIFRvcG9sb2d5IGRlc3Ryb3llZCBlcnJvcmBcbiAgICAgICAgICAgIC8vIHNldHMgaG93IG1hbnkgdGltZXMgdG8gdHJ5IHJlY29ubmVjdGluZ1xuICAgICAgICAgICAgcmVjb25uZWN0VHJpZXM6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICAvLyBzZXRzIHRoZSBkZWxheSBiZXR3ZWVuIGV2ZXJ5IHJldHJ5IChtaWxsaXNlY29uZHMpXG4gICAgICAgICAgICByZWNvbm5lY3RJbnRlcnZhbDogMTAwMDAgXG4gICAgICAgICB9XG4gICAgICAgICBpZighSGVhbHRoU3RhdHVzLmlzRGF0YWJhc2VDb25uZWN0ZWQpe1xuICAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBhd2FpdCBtb25nb29zZS5jb25uZWN0KENvbmZpZy5hY3RpdmUuZ2V0KCdtb25nb0Nvbm5lY3Rpb25TdHJpbmcnKSwgY29ubmVjdGlvbk9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YWJhc2VOYW1lID0gbW9uZ29vc2UuY29ubmVjdGlvbi5kYi5kYXRhYmFzZU5hbWU7XG5cbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhgQ29ubmVjdGVkIFRvIE1vbmdvIERhdGFiYXNlOiAke21vbmdvb3NlLmNvbm5lY3Rpb24uZGIuZGF0YWJhc2VOYW1lfWApO1xuICAgICAgICAgICAgICAgIEhlYWx0aFN0YXR1cy5pc0RhdGFiYXNlQ29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oJ2Vycm9yIHdoaWxlIHRyeWluZyB0byBjb25uZWN0IHdpdGggbW9uZ29kYicsIGVycik7XG4gICAgICAgICAgICAgICAgSGVhbHRoU3RhdHVzLmlzRGF0YWJhc2VDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IHsgbW9uZ29vc2UgfTtcbiJdfQ==
