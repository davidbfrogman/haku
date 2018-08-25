"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_schema_1 = require("./configuration.schema");
class Config {
    static initialize() {
        // Load environment dependent configuration 
        var env = configuration_schema_1.ConfigurationSchema.convictSchema.get('env');
        configuration_schema_1.ConfigurationSchema.convictSchema.loadFile([
            './server/environments/all-environments.json',
            './server/environments/all-environments.secrets.json',
            './server/environments/' + env + '.json',
            './server/environments/' + env + '.secrets.json' // by seperating out our secrets, it's easier to determine what values we need to set by env variables.
        ]);
        // Perform validation 
        configuration_schema_1.ConfigurationSchema.convictSchema.validate({ allowed: 'strict' });
    }
}
Config.active = configuration_schema_1.ConfigurationSchema.convictSchema;
exports.Config = Config;
Config.initialize();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL2NvbmZpZy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpRUFBNkQ7QUFFN0Q7SUFFUyxNQUFNLENBQUMsVUFBVTtRQUN0Qiw0Q0FBNEM7UUFDNUMsSUFBSSxHQUFHLEdBQUcsMENBQW1CLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RCwwQ0FBbUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO1lBQ3ZDLDZDQUE2QztZQUM3QyxxREFBcUQ7WUFDckQsd0JBQXdCLEdBQUcsR0FBRyxHQUFHLE9BQU87WUFDeEMsd0JBQXdCLEdBQUcsR0FBRyxHQUFHLGVBQWUsQ0FBQyx1R0FBdUc7U0FDM0osQ0FBQyxDQUFDO1FBRUgsc0JBQXNCO1FBQ3RCLDBDQUFtQixDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztJQUNsRSxDQUFDOztBQWJhLGFBQU0sR0FBRywwQ0FBbUIsQ0FBQyxhQUFhLENBQUM7QUFEM0Qsd0JBZUM7QUFFRCxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMiLCJmaWxlIjoiY29uZmlnL2NvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjb252aWN0ID0gcmVxdWlyZSgnY29udmljdCcpO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblNjaGVtYSB9IGZyb20gJy4vY29uZmlndXJhdGlvbi5zY2hlbWEnO1xuXG5leHBvcnQgY2xhc3MgQ29uZmlne1xuICBwdWJsaWMgc3RhdGljIGFjdGl2ZSA9IENvbmZpZ3VyYXRpb25TY2hlbWEuY29udmljdFNjaGVtYTtcbiAgcHVibGljIHN0YXRpYyBpbml0aWFsaXplKCl7XG4gICAgLy8gTG9hZCBlbnZpcm9ubWVudCBkZXBlbmRlbnQgY29uZmlndXJhdGlvbiBcbiAgICB2YXIgZW52ID0gQ29uZmlndXJhdGlvblNjaGVtYS5jb252aWN0U2NoZW1hLmdldCgnZW52Jyk7XG4gICAgQ29uZmlndXJhdGlvblNjaGVtYS5jb252aWN0U2NoZW1hLmxvYWRGaWxlKFtcbiAgICAgICAgJy4vc2VydmVyL2Vudmlyb25tZW50cy9hbGwtZW52aXJvbm1lbnRzLmpzb24nLFxuICAgICAgICAnLi9zZXJ2ZXIvZW52aXJvbm1lbnRzL2FsbC1lbnZpcm9ubWVudHMuc2VjcmV0cy5qc29uJyxcbiAgICAgICAgJy4vc2VydmVyL2Vudmlyb25tZW50cy8nICsgZW52ICsgJy5qc29uJywgIC8vIExvYWQgdGhlIHJlZ3VsYXIgY29udmljdCBzZXR0aW5ncy5cbiAgICAgICAgJy4vc2VydmVyL2Vudmlyb25tZW50cy8nICsgZW52ICsgJy5zZWNyZXRzLmpzb24nIC8vIGJ5IHNlcGVyYXRpbmcgb3V0IG91ciBzZWNyZXRzLCBpdCdzIGVhc2llciB0byBkZXRlcm1pbmUgd2hhdCB2YWx1ZXMgd2UgbmVlZCB0byBzZXQgYnkgZW52IHZhcmlhYmxlcy5cbiAgICBdKTtcbiAgICBcbiAgICAvLyBQZXJmb3JtIHZhbGlkYXRpb24gXG4gICAgQ29uZmlndXJhdGlvblNjaGVtYS5jb252aWN0U2NoZW1hLnZhbGlkYXRlKHthbGxvd2VkOiAnc3RyaWN0J30pO1xuICB9XG59XG5cbkNvbmZpZy5pbml0aWFsaXplKCk7Il19
