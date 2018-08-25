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
const newRelic = require('newrelic'); //  Has to be the first line of this file. 
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const helmet = require("helmet");
const routers = require("./routers");
const passport = require("passport");
const body_parser_1 = require("body-parser");
const database_1 = require("./config/database/database");
const database_bootstrap_1 = require("./config/database/database-bootstrap");
const constants_1 = require("./constants");
const config_1 = require("./config/config");
const api_error_handler_1 = require("./api-error-handler");
const health_status_1 = require("./health-status");
const supporting_services_bootstrap_1 = require("./config/supporting-services.bootstrap");
const methodOverride = require("method-override");
const log = require("winston");
const authorization_1 = require("./controllers/authorization");
const path = require("path");
const cors = require("cors");
const authentication_controller_1 = require("./controllers/authentication.controller");
const multer_configuration_1 = require("./config/multer.configuration");
const identity_api_service_1 = require("./services/identity.api.service");
const routers_1 = require("./routers");
// Creates and configures an ExpressJS web server.
class Application {
    // Run configuration methods on the Express instance.
    constructor() {
        log.info('Starting up Express Server.');
        this.checkEnvironment();
        this.express = express();
        this.logging(); // Initialize logging 
        this.healthcheck(); // Router for the healthcheck
        this.connectDatabase(); // Setup database connection
        this.seedSupportingServices(); // We want to make sure that anything this service needs exists in other services.
        this.loggingClientEndpoint();
        //this.authenticateSystemUser(); // This will speed up situations where 
        this.initPassport(); // here's where we're going to setup all our passport handlers.
        this.middleware(); // Setup the middleware - compression, etc...
        this.secure(); // Turn on security measures
        this.swagger(); // Serve up swagger, this is before authentication, as swagger is open
        this.routes(); // Setup routers for all the controllers
        this.client(); // This will serve the client angular application, will serve all static files.
        this.handlers(); // Any additional handlers, home page, etc.
        this.initErrorHandler(); // This global error handler, will handle 404s for us, and any other errors.  It has to be LAST in the stack.
        this.server = this.express.listen(config_1.Config.active.get('port'), () => {
            log.info(`Listening on port: ${config_1.Config.active.get('port')}`);
            log.info(`Current version ${process.env.npm_package_version}`);
            log.info(`App Name ${process.env.npm_package_name}`);
        });
    }
    initPassport() {
        return __awaiter(this, void 0, void 0, function* () {
            this.express.use(passport.initialize());
            // Here we should also configure all of our middleware strategies for passport.  Facebook, instagram, twitter, gmail, etc.
        });
    }
    // At startup, we're going to automatically authenticate the system user, so we can use that token
    authenticateSystemUser() {
        return __awaiter(this, void 0, void 0, function* () {
            // we're not going to auth the system user, there is no system user.
            yield identity_api_service_1.IdentityApiService.getSysToken();
            log.info(`System user has been authenticated.`);
        });
    }
    // Here we're going to make sure that the environment is setup.  
    // We're also going to double check that nothing goofy is going on.
    checkEnvironment() {
        if (!process.env.NODE_ENV) {
            throw JSON.stringify({
                error: 'You must have a node environment set: NODE_ENV',
                message: 'You can set a node environemnt using set NODE_ENV development. Be sure to close and reopen any active console windows',
            });
        }
        else {
            log.info(`Current Environment set via environment variables (NODE_ENV):${process.env.NODE_ENV}`);
        }
        health_status_1.HealthStatus.isEnvironmentVariableSet = true;
    }
    // We want to configure logging so that if we're outputting it to the console
    // it's nice and colorized, otherwise we remove that transport.
    logging() {
        if (config_1.Config.active.get('isConsoleLoggingActive')) {
            log.remove(log.transports.Console);
            log.add(log.transports.Console, { colorize: config_1.Config.active.get('isConsoleColored') });
            // If we can use colors, for instance when running locally, we want to use them.
            // Out on the server though, for real logs, the colors will add weird tokens, that we don't want showing up in our logs.
            if (config_1.Config.active.get('isConsoleColored')) {
                this.express.use(morgan('dev', {
                    skip: this.skipHealthCheck
                })); // Using morgan middleware for logging all requests.  the 'dev' here is just a particular format.
            }
            else {
                morgan.token('environment', () => {
                    return process.env.NODE_ENV;
                });
                this.express.use(morgan(':date :environment :method :url :status :response-time ms :res[content-length]', {
                    skip: this.skipHealthCheck
                }));
            }
        }
        else {
            log.remove(log.transports.Console);
        }
        health_status_1.HealthStatus.isLoggingInitialized = true;
    }
    // Because we really don't need to fill the logs with a ton of health check 200's we're going to skip
    // logging the 200 health checks.  if they are 500's and something went wrong that's a different story and we'll log them.
    skipHealthCheck(request, response) {
        return request.originalUrl.includes('healthcheck') && response.statusCode === 200;
    }
    initErrorHandler() {
        log.info('Instantiating Default Error Handler Route');
        this.express.use((error, request, response, next) => {
            api_error_handler_1.ApiErrorHandler.HandleApiError(error, request, response, next);
        });
        health_status_1.HealthStatus.isApiErrorHandlerInitialized = true;
    }
    healthcheck() {
        this.express.get('/healthcheck', (request, response) => {
            const isSetupComplete = health_status_1.HealthStatus.isHealthy();
            response.statusCode = isSetupComplete ? 200 : 500;
            response.json({
                ApplicationName: process.env.npm_package_name,
                StatusCode: isSetupComplete ? 200 : 500,
                SetupComplete: isSetupComplete,
                Version: process.env.npm_package_version
            });
        });
    }
    loggingClientEndpoint() {
        this.express.post('/clientlogs', (request, response) => {
            log.log(request.body.level, request.body.message);
        });
    }
    connectDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            yield database_1.Database.connect();
            yield database_bootstrap_1.DatabaseBootstrap.seed();
            health_status_1.HealthStatus.isDatabaseSeeded = true;
            log.info('Completed Setup, boostrapped database, database now online');
            this.server.emit("dbConnected"); // Used by the unit tests to prevent them from starting until the database is connected. 
        });
    }
    seedSupportingServices() {
        return __awaiter(this, void 0, void 0, function* () {
            yield supporting_services_bootstrap_1.SupportingServicesBootstrap.seed();
            log.info('Supporting services have been seeded, all ancillary data has been created');
            health_status_1.HealthStatus.isSupportingServicesSeeded = true;
        });
    }
    secure() {
        this.express.use(helmet()); //Protecting the app from a lot of vulnerabilities turn on when you want to use TLS.
        health_status_1.HealthStatus.isSecured = true;
    }
    // This will allow us to serve the static homepage for our swagger definition
    // along with the swagger ui explorer.
    swagger() {
        log.info('Initializing Swagger');
        this.express.use(constants_1.CONST.ep.API_DOCS, express.static(__dirname + '/swagger/swagger-ui'));
        this.express.use(constants_1.CONST.ep.API_SWAGGER_DEF, express.static(__dirname + '/swagger/'));
    }
    client() {
        log.info('Initializing Client');
        // this allows you to see the files uploaded in dev http://localhost:8080/uploads/067e2ad8ca80503b9ae41c9c06855a9a-1afd01789a7015a436d35c6914236865-1493816227467.jpeg
        this.express.use('/uploads', express.static(path.resolve(__dirname, '../img-uploads/')));
        this.express.use(express.static(path.join(__dirname, '../client/dist/' + config_1.Config.active.get('clientDistFolder') + '/')));
        this.express.use('*', express.static(path.join(__dirname, '../client/dist/' + config_1.Config.active.get('clientDistFolder') + '/index.html')));
    }
    // Configure Express middleware.
    middleware() {
        log.info('Initializing Middleware');
        this.express.disable('x-powered-by');
        this.express.use(body_parser_1.json());
        this.express.use(body_parser_1.urlencoded({ extended: true }));
        this.express.use(methodOverride(function (req) {
            if (req.body && typeof req.body === 'object' && '_method' in req.body) {
                // look in urlencoded POST bodies and delete it
                const method = req.body._method;
                delete req.body._method;
                return method;
            }
        }));
        // compress all requests
        this.express.use(compression());
        // enable cors
        this.express.use(cors());
    }
    routes() {
        log.info('Initializing Routers');
        this.express.use(constants_1.CONST.ep.API + constants_1.CONST.ep.V1, new routers.AuthenticationRouter().getRestrictedRouter());
        // Now we lock up the rest.
        this.express.use('/api/*', new authentication_controller_1.AuthenticationController().authMiddleware);
        this.express.use(constants_1.CONST.ep.API + constants_1.CONST.ep.V1, authorization_1.Authz.permit(constants_1.CONST.ADMIN_ROLE, constants_1.CONST.USER_ROLE), new routers.BucketRouter().getRouter());
        this.express.use(constants_1.CONST.ep.API + constants_1.CONST.ep.V1, authorization_1.Authz.permit(constants_1.CONST.ADMIN_ROLE, constants_1.CONST.USER_ROLE), new routers.BucketItemRouter().getRouter());
        this.express.use(constants_1.CONST.ep.API + constants_1.CONST.ep.V1, authorization_1.Authz.permit(constants_1.CONST.ADMIN_ROLE, constants_1.CONST.USER_ROLE), new routers.UserRouter().getRouter());
        this.express.use(constants_1.CONST.ep.API + constants_1.CONST.ep.V1, authorization_1.Authz.permit(constants_1.CONST.ADMIN_ROLE, constants_1.CONST.USER_ROLE), new routers.NotificationRouter().getRouter());
        this.express.use(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.IMAGES}/:id`, authorization_1.Authz.permit(constants_1.CONST.ADMIN_ROLE, constants_1.CONST.USER_ROLE), new multer_configuration_1.MulterConfiguration().uploader.array('file'), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield new routers_1.BucketRouter().ImageHandler(req, res, next);
        }));
        this.express.use(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.IMAGES}/:id`, authorization_1.Authz.permit(constants_1.CONST.ADMIN_ROLE, constants_1.CONST.USER_ROLE), new multer_configuration_1.MulterConfiguration().uploader.array('file'), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            yield new routers_1.BucketItemRouter().ImageHandler(req, res, next);
        }));
    }
    // We want to return a json response that will at least be helpful for 
    // the root route of our api.
    handlers() {
        log.info('Initializing Handlers');
        this.express.get('/api', (request, response) => {
            response.json({
                name: config_1.Config.active.get('name'),
                description: 'Alembic Web Application',
                APIVersion: constants_1.CONST.ep.V1,
                DocumentationLocation: `${request.protocol}://${request.get('host')}${constants_1.CONST.ep.API_DOCS}`,
                APILocation: `${request.protocol}://${request.get('host')}${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}`,
                Healthcheck: `${request.protocol}://${request.get('host')}/healthcheck`
            });
        });
        this.express.get('*', function (req, res, next) {
            throw ({ message: `No router was found for your request, page not found.  Requested Page: ${req.originalUrl}`, status: 404 });
        });
    }
}
exports.default = new Application();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsMkNBQTJDO0FBQ2pGLG1DQUFtQztBQUVuQywyQ0FBMkM7QUFDM0MsaUNBQWlDO0FBRWpDLGlDQUFpQztBQUNqQyxxQ0FBcUM7QUFFckMscUNBQXFDO0FBS3JDLDZDQUFvRDtBQUNwRCx5REFBZ0U7QUFDaEUsNkVBQXlFO0FBQ3pFLDJDQUFvQztBQUNwQyw0Q0FBeUM7QUFFekMsMkRBQXNEO0FBQ3RELG1EQUErQztBQUMvQywwRkFBcUY7QUFFckYsa0RBQW1EO0FBQ25ELCtCQUFnQztBQUVoQywrREFBb0Q7QUFDcEQsNkJBQThCO0FBQzlCLDZCQUE2QjtBQUM3Qix1RkFBbUY7QUFDbkYsd0VBQW9FO0FBRXBFLDBFQUFxRTtBQUVyRSx1Q0FBaUY7QUFHakYsa0RBQWtEO0FBQ2xEO0lBTUkscURBQXFEO0lBQ3JEO1FBQ0ksR0FBRyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXhCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQU0sc0JBQXNCO1FBQzNDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFFLDZCQUE2QjtRQUNsRCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyw0QkFBNEI7UUFDcEQsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBRSxrRkFBa0Y7UUFDbEgsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDN0Isd0VBQXdFO1FBQ3hFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLCtEQUErRDtRQUNwRixJ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QUFXLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWM7YUFDMUUsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUk7WUFDMUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLDBFQUEwRSxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDbEksQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFDRCxrQkFBZSxJQUFJLFdBQVcsRUFBRSxDQUFDIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IG5ld1JlbGljID0gcmVxdWlyZSgnbmV3cmVsaWMnKTsgLy8gIEhhcyB0byBiZSB0aGUgZmlyc3QgbGluZSBvZiB0aGlzIGZpbGUuIFxuaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyBjb21wcmVzc2lvbiBmcm9tICdjb21wcmVzc2lvbic7XG5pbXBvcnQgKiBhcyBtb3JnYW4gZnJvbSAnbW9yZ2FuJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIGhlbG1ldCBmcm9tICdoZWxtZXQnO1xuaW1wb3J0ICogYXMgcm91dGVycyBmcm9tICcuL3JvdXRlcnMnO1xuXG5pbXBvcnQgKiBhcyBwYXNzcG9ydCBmcm9tICdwYXNzcG9ydCc7XG5pbXBvcnQgeyBTdHJhdGVneSBhcyBsb2NhbCwgSVN0cmF0ZWd5T3B0aW9ucyB9IGZyb20gJ3Bhc3Nwb3J0LWxvY2FsJztcblxuaW1wb3J0IHsgT2JqZWN0SWQgfSBmcm9tICdic29uJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGpzb24sIHVybGVuY29kZWQsIHJhdyB9IGZyb20gJ2JvZHktcGFyc2VyJztcbmltcG9ydCB7IG1vbmdvb3NlLCBEYXRhYmFzZSB9IGZyb20gJy4vY29uZmlnL2RhdGFiYXNlL2RhdGFiYXNlJztcbmltcG9ydCB7IERhdGFiYXNlQm9vdHN0cmFwIH0gZnJvbSAnLi9jb25maWcvZGF0YWJhc2UvZGF0YWJhc2UtYm9vdHN0cmFwJztcbmltcG9ydCB7IENPTlNUIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgQ29uZmlnIH0gZnJvbSAnLi9jb25maWcvY29uZmlnJztcbmltcG9ydCB7IFJvdXRlciwgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBBcGlFcnJvckhhbmRsZXIgfSBmcm9tICcuL2FwaS1lcnJvci1oYW5kbGVyJztcbmltcG9ydCB7IEhlYWx0aFN0YXR1cyB9IGZyb20gJy4vaGVhbHRoLXN0YXR1cyc7XG5pbXBvcnQgeyBTdXBwb3J0aW5nU2VydmljZXNCb290c3RyYXAgfSBmcm9tICcuL2NvbmZpZy9zdXBwb3J0aW5nLXNlcnZpY2VzLmJvb3RzdHJhcCc7XG5cbmltcG9ydCBtZXRob2RPdmVycmlkZSA9IHJlcXVpcmUoJ21ldGhvZC1vdmVycmlkZScpO1xuaW1wb3J0IGxvZyA9IHJlcXVpcmUoJ3dpbnN0b24nKTtcblxuaW1wb3J0IHsgQXV0aHogfSBmcm9tIFwiLi9jb250cm9sbGVycy9hdXRob3JpemF0aW9uXCI7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCBjb3JzID0gcmVxdWlyZSgnY29ycycpXG5pbXBvcnQgeyBBdXRoZW50aWNhdGlvbkNvbnRyb2xsZXIgfSBmcm9tICcuL2NvbnRyb2xsZXJzL2F1dGhlbnRpY2F0aW9uLmNvbnRyb2xsZXInO1xuaW1wb3J0IHsgTXVsdGVyQ29uZmlndXJhdGlvbiB9IGZyb20gJy4vY29uZmlnL211bHRlci5jb25maWd1cmF0aW9uJztcbmltcG9ydCB7IEltYWdlVXBsb2FkQ29udHJvbGxlciwgQnVja2V0Q29udHJvbGxlciwgQnVja2V0SXRlbUNvbnRyb2xsZXIgfSBmcm9tICcuL2NvbnRyb2xsZXJzL2luZGV4JztcbmltcG9ydCB7IElkZW50aXR5QXBpU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvaWRlbnRpdHkuYXBpLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vbW9kZWxzL2luZGV4JztcbmltcG9ydCB7IEJ1Y2tldFJvdXRlciwgQXV0aGVudGljYXRpb25Sb3V0ZXIsIEJ1Y2tldEl0ZW1Sb3V0ZXIgfSBmcm9tICcuL3JvdXRlcnMnO1xuaW1wb3J0IHsgSW1hZ2VDb250cm9sbGVyTWl4aW4gfSBmcm9tICcuL2NvbnRyb2xsZXJzL2Jhc2UvaW1hZ2VzLmNvbnRyb2xsZXIubWl4aW4nO1xuXG4vLyBDcmVhdGVzIGFuZCBjb25maWd1cmVzIGFuIEV4cHJlc3NKUyB3ZWIgc2VydmVyLlxuY2xhc3MgQXBwbGljYXRpb24ge1xuICAgIC8vIHJlZiB0byBFeHByZXNzIGluc3RhbmNlXG4gICAgcHVibGljIGV4cHJlc3M6IGV4cHJlc3MuQXBwbGljYXRpb247XG4gICAgcHVibGljIGN1cnJlbnREYXRhYmFzZTogRGF0YWJhc2U7XG4gICAgcHVibGljIHNlcnZlcjogaHR0cC5TZXJ2ZXI7XG5cbiAgICAvLyBSdW4gY29uZmlndXJhdGlvbiBtZXRob2RzIG9uIHRoZSBFeHByZXNzIGluc3RhbmNlLlxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBsb2cuaW5mbygnU3RhcnRpbmcgdXAgRXhwcmVzcyBTZXJ2ZXIuJyk7XG5cbiAgICAgICAgdGhpcy5jaGVja0Vudmlyb25tZW50KCk7XG5cbiAgICAgICAgdGhpcy5leHByZXNzID0gZXhwcmVzcygpO1xuICAgICAgICB0aGlzLmxvZ2dpbmcoKTsgICAgICAvLyBJbml0aWFsaXplIGxvZ2dpbmcgXG4gICAgICAgIHRoaXMuaGVhbHRoY2hlY2soKTsgIC8vIFJvdXRlciBmb3IgdGhlIGhlYWx0aGNoZWNrXG4gICAgICAgIHRoaXMuY29ubmVjdERhdGFiYXNlKCk7IC8vIFNldHVwIGRhdGFiYXNlIGNvbm5lY3Rpb25cbiAgICAgICAgdGhpcy5zZWVkU3VwcG9ydGluZ1NlcnZpY2VzKCk7ICAvLyBXZSB3YW50IHRvIG1ha2Ugc3VyZSB0aGF0IGFueXRoaW5nIHRoaXMgc2VydmljZSBuZWVkcyBleGlzdHMgaW4gb3RoZXIgc2VydmljZXMuXG4gICAgICAgIHRoaXMubG9nZ2luZ0NsaWVudEVuZHBvaW50KCk7XG4gICAgICAgIC8vdGhpcy5hdXRoZW50aWNhdGVTeXN0ZW1Vc2VyKCk7IC8vIFRoaXMgd2lsbCBzcGVlZCB1cCBzaXR1YXRpb25zIHdoZXJlIFxuICAgICAgICB0aGlzLmluaXRQYXNzcG9ydCgpOyAvLyBoZXJlJ3Mgd2hlcmUgd2UncmUgZ29pbmcgdG8gc2V0dXAgYWxsIG91ciBwYXNzcG9ydCBoYW5kbGVycy5cbiAgICAgICAgdGhpcy5taWRkbGV3YXJlKCk7ICAgLy8gU2V0dXAgdGhlIG1pZGRsZXdhcmUgLSBjb21wcmVzc2lvbiwgZXRjLi4uXG4gICAgICAgIHRoaXMuc2VjdXJlKCk7ICAgICAgIC8vIFR1cm4gb24gc2VjdXJpdHkgbWVhc3VyZXNcbiAgICAgICAgdGhpcy5zd2FnZ2VyKCk7ICAgICAgLy8gU2VydmUgdXAgc3dhZ2dlciwgdGhpcyBpcyBiZWZvcmUgYXV0aGVudGljYXRpb24sIGFzIHN3YWdnZXIgaXMgb3BlblxuICAgICAgICB0aGlzLnJvdXRlcygpOyAgICAgICAvLyBTZXR1cCByb3V0ZXJzIGZvciBhbGwgdGhlIGNvbnRyb2xsZXJzXG4gICAgICAgIHRoaXMuY2xpZW50KCk7ICAgICAgIC8vIFRoaXMgd2lsbCBzZXJ2ZSB0aGUgY2xpZW50IGFuZ3VsYXIgYXBwbGljYXRpb24sIHdpbGwgc2VydmUgYWxsIHN0YXRpYyBmaWxlcy5cbiAgICAgICAgdGhpcy5oYW5kbGVycygpOyAgICAgLy8gQW55IGFkZGl0aW9uYWwgaGFuZGxlcnMsIGhvbWUgcGFnZSwgZXRjLlxuICAgICAgICB0aGlzLmluaXRFcnJvckhhbmRsZXIoKTsgLy8gVGhpcyBnbG9iYWwgZXJyb3IgaGFuZGxlciwgd2lsbCBoYW5kbGUgNDA0cyBmb3IgdXMsIGFuZCBhbnkgb3RoZXIgZXJyb3JzLiAgSXQgaGFzIHRvIGJlIExBU1QgaW4gdGhlIHN0YWNrLlxuXG4gICAgICAgIHRoaXMuc2VydmVyID0gdGhpcy5leHByZXNzLmxpc3RlbihDb25maWcuYWN0aXZlLmdldCgncG9ydCcpLCAoKSA9PiB7XG4gICAgICAgICAgICBsb2cuaW5mbyhgTGlzdGVuaW5nIG9uIHBvcnQ6ICR7Q29uZmlnLmFjdGl2ZS5nZXQoJ3BvcnQnKX1gKTtcbiAgICAgICAgICAgIGxvZy5pbmZvKGBDdXJyZW50IHZlcnNpb24gJHtwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9ufWApO1xuICAgICAgICAgICAgbG9nLmluZm8oYEFwcCBOYW1lICR7cHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfbmFtZX1gKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBpbml0UGFzc3BvcnQoKSB7XG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UocGFzc3BvcnQuaW5pdGlhbGl6ZSgpKTtcbiAgICAgICAgLy8gSGVyZSB3ZSBzaG91bGQgYWxzbyBjb25maWd1cmUgYWxsIG9mIG91ciBtaWRkbGV3YXJlIHN0cmF0ZWdpZXMgZm9yIHBhc3Nwb3J0LiAgRmFjZWJvb2ssIGluc3RhZ3JhbSwgdHdpdHRlciwgZ21haWwsIGV0Yy5cbiAgICB9XG5cbiAgICAvLyBBdCBzdGFydHVwLCB3ZSdyZSBnb2luZyB0byBhdXRvbWF0aWNhbGx5IGF1dGhlbnRpY2F0ZSB0aGUgc3lzdGVtIHVzZXIsIHNvIHdlIGNhbiB1c2UgdGhhdCB0b2tlblxuICAgIHByaXZhdGUgYXN5bmMgYXV0aGVudGljYXRlU3lzdGVtVXNlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgLy8gd2UncmUgbm90IGdvaW5nIHRvIGF1dGggdGhlIHN5c3RlbSB1c2VyLCB0aGVyZSBpcyBubyBzeXN0ZW0gdXNlci5cbiAgICAgICAgYXdhaXQgSWRlbnRpdHlBcGlTZXJ2aWNlLmdldFN5c1Rva2VuKCk7XG4gICAgICAgIGxvZy5pbmZvKGBTeXN0ZW0gdXNlciBoYXMgYmVlbiBhdXRoZW50aWNhdGVkLmApO1xuICAgIH1cblxuICAgIC8vIEhlcmUgd2UncmUgZ29pbmcgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGVudmlyb25tZW50IGlzIHNldHVwLiAgXG4gICAgLy8gV2UncmUgYWxzbyBnb2luZyB0byBkb3VibGUgY2hlY2sgdGhhdCBub3RoaW5nIGdvb2Z5IGlzIGdvaW5nIG9uLlxuICAgIHByaXZhdGUgY2hlY2tFbnZpcm9ubWVudCgpIHtcbiAgICAgICAgaWYgKCFwcm9jZXNzLmVudi5OT0RFX0VOVikge1xuICAgICAgICAgICAgdGhyb3cgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGVycm9yOiAnWW91IG11c3QgaGF2ZSBhIG5vZGUgZW52aXJvbm1lbnQgc2V0OiBOT0RFX0VOVicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ1lvdSBjYW4gc2V0IGEgbm9kZSBlbnZpcm9uZW1udCB1c2luZyBzZXQgTk9ERV9FTlYgZGV2ZWxvcG1lbnQuIEJlIHN1cmUgdG8gY2xvc2UgYW5kIHJlb3BlbiBhbnkgYWN0aXZlIGNvbnNvbGUgd2luZG93cycsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxvZy5pbmZvKGBDdXJyZW50IEVudmlyb25tZW50IHNldCB2aWEgZW52aXJvbm1lbnQgdmFyaWFibGVzIChOT0RFX0VOVik6JHtwcm9jZXNzLmVudi5OT0RFX0VOVn1gKTtcbiAgICAgICAgfVxuICAgICAgICBIZWFsdGhTdGF0dXMuaXNFbnZpcm9ubWVudFZhcmlhYmxlU2V0ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBXZSB3YW50IHRvIGNvbmZpZ3VyZSBsb2dnaW5nIHNvIHRoYXQgaWYgd2UncmUgb3V0cHV0dGluZyBpdCB0byB0aGUgY29uc29sZVxuICAgIC8vIGl0J3MgbmljZSBhbmQgY29sb3JpemVkLCBvdGhlcndpc2Ugd2UgcmVtb3ZlIHRoYXQgdHJhbnNwb3J0LlxuICAgIHByaXZhdGUgbG9nZ2luZygpOiB2b2lkIHtcbiAgICAgICAgaWYgKENvbmZpZy5hY3RpdmUuZ2V0KCdpc0NvbnNvbGVMb2dnaW5nQWN0aXZlJykpIHtcbiAgICAgICAgICAgIGxvZy5yZW1vdmUobG9nLnRyYW5zcG9ydHMuQ29uc29sZSk7XG4gICAgICAgICAgICBsb2cuYWRkKGxvZy50cmFuc3BvcnRzLkNvbnNvbGUsIHsgY29sb3JpemU6IENvbmZpZy5hY3RpdmUuZ2V0KCdpc0NvbnNvbGVDb2xvcmVkJykgfSk7XG5cbiAgICAgICAgICAgIC8vIElmIHdlIGNhbiB1c2UgY29sb3JzLCBmb3IgaW5zdGFuY2Ugd2hlbiBydW5uaW5nIGxvY2FsbHksIHdlIHdhbnQgdG8gdXNlIHRoZW0uXG4gICAgICAgICAgICAvLyBPdXQgb24gdGhlIHNlcnZlciB0aG91Z2gsIGZvciByZWFsIGxvZ3MsIHRoZSBjb2xvcnMgd2lsbCBhZGQgd2VpcmQgdG9rZW5zLCB0aGF0IHdlIGRvbid0IHdhbnQgc2hvd2luZyB1cCBpbiBvdXIgbG9ncy5cbiAgICAgICAgICAgIGlmIChDb25maWcuYWN0aXZlLmdldCgnaXNDb25zb2xlQ29sb3JlZCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5leHByZXNzLnVzZShtb3JnYW4oJ2RldicsIHtcbiAgICAgICAgICAgICAgICAgICAgc2tpcDogdGhpcy5za2lwSGVhbHRoQ2hlY2tcbiAgICAgICAgICAgICAgICB9KSk7IC8vIFVzaW5nIG1vcmdhbiBtaWRkbGV3YXJlIGZvciBsb2dnaW5nIGFsbCByZXF1ZXN0cy4gIHRoZSAnZGV2JyBoZXJlIGlzIGp1c3QgYSBwYXJ0aWN1bGFyIGZvcm1hdC5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgdGhpcyBpcyBtb3N0IGxpa2VseSBsb2dnaW5nIHNvbWV3aGVyZSB3aGVyZSBjb2xvcnMgd291bGQgYmUgYmFkLiAgRm9yIGluc3RhbmNlIG9mZiBvbiB0aGUgYWN0dWFsXG4gICAgICAgICAgICAvLyBTZXJ2ZXIsIGluIHdoaWNoIGNhc2Ugd2UgZG9uJ3Qgd2FudCBjb2xvcnMsIGFuZCB3ZSBuZWVkIHRvIGtub3cgdGhlIGVudmlyb25lbWVudC5cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vcmdhbi50b2tlbignZW52aXJvbm1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9jZXNzLmVudi5OT0RFX0VOVjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cHJlc3MudXNlKG1vcmdhbignOmRhdGUgOmVudmlyb25tZW50IDptZXRob2QgOnVybCA6c3RhdHVzIDpyZXNwb25zZS10aW1lIG1zIDpyZXNbY29udGVudC1sZW5ndGhdJywge1xuICAgICAgICAgICAgICAgICAgICBza2lwOiB0aGlzLnNraXBIZWFsdGhDaGVja1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxvZy5yZW1vdmUobG9nLnRyYW5zcG9ydHMuQ29uc29sZSk7XG4gICAgICAgIH1cbiAgICAgICAgSGVhbHRoU3RhdHVzLmlzTG9nZ2luZ0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBCZWNhdXNlIHdlIHJlYWxseSBkb24ndCBuZWVkIHRvIGZpbGwgdGhlIGxvZ3Mgd2l0aCBhIHRvbiBvZiBoZWFsdGggY2hlY2sgMjAwJ3Mgd2UncmUgZ29pbmcgdG8gc2tpcFxuICAgIC8vIGxvZ2dpbmcgdGhlIDIwMCBoZWFsdGggY2hlY2tzLiAgaWYgdGhleSBhcmUgNTAwJ3MgYW5kIHNvbWV0aGluZyB3ZW50IHdyb25nIHRoYXQncyBhIGRpZmZlcmVudCBzdG9yeSBhbmQgd2UnbGwgbG9nIHRoZW0uXG4gICAgcHJpdmF0ZSBza2lwSGVhbHRoQ2hlY2socmVxdWVzdDogZXhwcmVzcy5SZXF1ZXN0LCByZXNwb25zZTogZXhwcmVzcy5SZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gcmVxdWVzdC5vcmlnaW5hbFVybC5pbmNsdWRlcygnaGVhbHRoY2hlY2snKSAmJiByZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDA7XG4gICAgfVxuXG4gICAgaW5pdEVycm9ySGFuZGxlcigpOiBhbnkge1xuICAgICAgICBsb2cuaW5mbygnSW5zdGFudGlhdGluZyBEZWZhdWx0IEVycm9yIEhhbmRsZXIgUm91dGUnKTtcbiAgICAgICAgdGhpcy5leHByZXNzLnVzZSgoZXJyb3I6IEVycm9yICYgeyBzdGF0dXM6IG51bWJlciB9LCByZXF1ZXN0OiBleHByZXNzLlJlcXVlc3QsIHJlc3BvbnNlOiBleHByZXNzLlJlc3BvbnNlLCBuZXh0OiBleHByZXNzLk5leHRGdW5jdGlvbik6IHZvaWQgPT4ge1xuICAgICAgICAgICAgQXBpRXJyb3JIYW5kbGVyLkhhbmRsZUFwaUVycm9yKGVycm9yLCByZXF1ZXN0LCByZXNwb25zZSwgbmV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgICBIZWFsdGhTdGF0dXMuaXNBcGlFcnJvckhhbmRsZXJJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoZWFsdGhjaGVjaygpIHtcbiAgICAgICAgdGhpcy5leHByZXNzLmdldCgnL2hlYWx0aGNoZWNrJywgKHJlcXVlc3Q6IGV4cHJlc3MuUmVxdWVzdCwgcmVzcG9uc2U6IGV4cHJlc3MuUmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzU2V0dXBDb21wbGV0ZSA9IEhlYWx0aFN0YXR1cy5pc0hlYWx0aHkoKTtcbiAgICAgICAgICAgIHJlc3BvbnNlLnN0YXR1c0NvZGUgPSBpc1NldHVwQ29tcGxldGUgPyAyMDAgOiA1MDA7XG4gICAgICAgICAgICByZXNwb25zZS5qc29uKHtcbiAgICAgICAgICAgICAgICBBcHBsaWNhdGlvbk5hbWU6IHByb2Nlc3MuZW52Lm5wbV9wYWNrYWdlX25hbWUsXG4gICAgICAgICAgICAgICAgU3RhdHVzQ29kZTogaXNTZXR1cENvbXBsZXRlID8gMjAwIDogNTAwLFxuICAgICAgICAgICAgICAgIFNldHVwQ29tcGxldGU6IGlzU2V0dXBDb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBWZXJzaW9uOiBwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2dnaW5nQ2xpZW50RW5kcG9pbnQoKSB7XG4gICAgICAgIHRoaXMuZXhwcmVzcy5wb3N0KCcvY2xpZW50bG9ncycsIChyZXF1ZXN0OiBleHByZXNzLlJlcXVlc3QsIHJlc3BvbnNlOiBleHByZXNzLlJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBsb2cubG9nKHJlcXVlc3QuYm9keS5sZXZlbCwgcmVxdWVzdC5ib2R5Lm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNvbm5lY3REYXRhYmFzZSgpIHtcbiAgICAgICAgYXdhaXQgRGF0YWJhc2UuY29ubmVjdCgpO1xuICAgICAgICBhd2FpdCBEYXRhYmFzZUJvb3RzdHJhcC5zZWVkKCk7XG4gICAgICAgIEhlYWx0aFN0YXR1cy5pc0RhdGFiYXNlU2VlZGVkID0gdHJ1ZTtcbiAgICAgICAgbG9nLmluZm8oJ0NvbXBsZXRlZCBTZXR1cCwgYm9vc3RyYXBwZWQgZGF0YWJhc2UsIGRhdGFiYXNlIG5vdyBvbmxpbmUnKTtcbiAgICAgICAgdGhpcy5zZXJ2ZXIuZW1pdChcImRiQ29ubmVjdGVkXCIpOyAgLy8gVXNlZCBieSB0aGUgdW5pdCB0ZXN0cyB0byBwcmV2ZW50IHRoZW0gZnJvbSBzdGFydGluZyB1bnRpbCB0aGUgZGF0YWJhc2UgaXMgY29ubmVjdGVkLiBcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHNlZWRTdXBwb3J0aW5nU2VydmljZXMoKSB7XG4gICAgICAgIGF3YWl0IFN1cHBvcnRpbmdTZXJ2aWNlc0Jvb3RzdHJhcC5zZWVkKCk7XG4gICAgICAgIGxvZy5pbmZvKCdTdXBwb3J0aW5nIHNlcnZpY2VzIGhhdmUgYmVlbiBzZWVkZWQsIGFsbCBhbmNpbGxhcnkgZGF0YSBoYXMgYmVlbiBjcmVhdGVkJyk7XG4gICAgICAgIEhlYWx0aFN0YXR1cy5pc1N1cHBvcnRpbmdTZXJ2aWNlc1NlZWRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZWN1cmUoKSB7XG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoaGVsbWV0KCkpOyAvL1Byb3RlY3RpbmcgdGhlIGFwcCBmcm9tIGEgbG90IG9mIHZ1bG5lcmFiaWxpdGllcyB0dXJuIG9uIHdoZW4geW91IHdhbnQgdG8gdXNlIFRMUy5cbiAgICAgICAgSGVhbHRoU3RhdHVzLmlzU2VjdXJlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gVGhpcyB3aWxsIGFsbG93IHVzIHRvIHNlcnZlIHRoZSBzdGF0aWMgaG9tZXBhZ2UgZm9yIG91ciBzd2FnZ2VyIGRlZmluaXRpb25cbiAgICAvLyBhbG9uZyB3aXRoIHRoZSBzd2FnZ2VyIHVpIGV4cGxvcmVyLlxuICAgIHByaXZhdGUgc3dhZ2dlcigpOiB2b2lkIHtcbiAgICAgICAgbG9nLmluZm8oJ0luaXRpYWxpemluZyBTd2FnZ2VyJyk7XG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoQ09OU1QuZXAuQVBJX0RPQ1MsIGV4cHJlc3Muc3RhdGljKF9fZGlybmFtZSArICcvc3dhZ2dlci9zd2FnZ2VyLXVpJykpO1xuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKENPTlNULmVwLkFQSV9TV0FHR0VSX0RFRiwgZXhwcmVzcy5zdGF0aWMoX19kaXJuYW1lICsgJy9zd2FnZ2VyLycpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNsaWVudCgpOiB2b2lkIHtcbiAgICAgICAgbG9nLmluZm8oJ0luaXRpYWxpemluZyBDbGllbnQnKTtcblxuICAgICAgICAvLyB0aGlzIGFsbG93cyB5b3UgdG8gc2VlIHRoZSBmaWxlcyB1cGxvYWRlZCBpbiBkZXYgaHR0cDovL2xvY2FsaG9zdDo4MDgwL3VwbG9hZHMvMDY3ZTJhZDhjYTgwNTAzYjlhZTQxYzljMDY4NTVhOWEtMWFmZDAxNzg5YTcwMTVhNDM2ZDM1YzY5MTQyMzY4NjUtMTQ5MzgxNjIyNzQ2Ny5qcGVnXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoJy91cGxvYWRzJywgZXhwcmVzcy5zdGF0aWMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2ltZy11cGxvYWRzLycpKSk7XG5cbiAgICAgICAgdGhpcy5leHByZXNzLnVzZShleHByZXNzLnN0YXRpYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vY2xpZW50L2Rpc3QvJyArIENvbmZpZy5hY3RpdmUuZ2V0KCdjbGllbnREaXN0Rm9sZGVyJykgKyAnLycpKSk7XG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoJyonLCBleHByZXNzLnN0YXRpYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vY2xpZW50L2Rpc3QvJyArIENvbmZpZy5hY3RpdmUuZ2V0KCdjbGllbnREaXN0Rm9sZGVyJykgKyAnL2luZGV4Lmh0bWwnKSkpO1xuICAgIH1cblxuICAgIC8vIENvbmZpZ3VyZSBFeHByZXNzIG1pZGRsZXdhcmUuXG4gICAgcHJpdmF0ZSBtaWRkbGV3YXJlKCk6IHZvaWQge1xuICAgICAgICBsb2cuaW5mbygnSW5pdGlhbGl6aW5nIE1pZGRsZXdhcmUnKTtcbiAgICAgICAgdGhpcy5leHByZXNzLmRpc2FibGUoJ3gtcG93ZXJlZC1ieScpO1xuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKGpzb24oKSk7XG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UodXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlIH0pKTtcbiAgICAgICAgdGhpcy5leHByZXNzLnVzZShtZXRob2RPdmVycmlkZShmdW5jdGlvbiAocmVxKSB7XG4gICAgICAgICAgICBpZiAocmVxLmJvZHkgJiYgdHlwZW9mIHJlcS5ib2R5ID09PSAnb2JqZWN0JyAmJiAnX21ldGhvZCcgaW4gcmVxLmJvZHkpIHtcbiAgICAgICAgICAgICAgICAvLyBsb29rIGluIHVybGVuY29kZWQgUE9TVCBib2RpZXMgYW5kIGRlbGV0ZSBpdFxuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IHJlcS5ib2R5Ll9tZXRob2Q7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHJlcS5ib2R5Ll9tZXRob2Q7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ldGhvZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICAvLyBjb21wcmVzcyBhbGwgcmVxdWVzdHNcbiAgICAgICAgdGhpcy5leHByZXNzLnVzZShjb21wcmVzc2lvbigpKTtcbiAgICAgICAgLy8gZW5hYmxlIGNvcnNcbiAgICAgICAgdGhpcy5leHByZXNzLnVzZShjb3JzKCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcm91dGVzKCk6IHZvaWQge1xuICAgICAgICBsb2cuaW5mbygnSW5pdGlhbGl6aW5nIFJvdXRlcnMnKTtcblxuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKENPTlNULmVwLkFQSSArIENPTlNULmVwLlYxLCBuZXcgcm91dGVycy5BdXRoZW50aWNhdGlvblJvdXRlcigpLmdldFJlc3RyaWN0ZWRSb3V0ZXIoKSk7XG5cbiAgICAgICAgLy8gTm93IHdlIGxvY2sgdXAgdGhlIHJlc3QuXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoJy9hcGkvKicsIG5ldyBBdXRoZW50aWNhdGlvbkNvbnRyb2xsZXIoKS5hdXRoTWlkZGxld2FyZSk7XG5cbiAgICAgICAgdGhpcy5leHByZXNzLnVzZShDT05TVC5lcC5BUEkgKyBDT05TVC5lcC5WMSwgQXV0aHoucGVybWl0KENPTlNULkFETUlOX1JPTEUsIENPTlNULlVTRVJfUk9MRSksIG5ldyByb3V0ZXJzLkJ1Y2tldFJvdXRlcigpLmdldFJvdXRlcigpKTtcbiAgICAgICAgdGhpcy5leHByZXNzLnVzZShDT05TVC5lcC5BUEkgKyBDT05TVC5lcC5WMSwgQXV0aHoucGVybWl0KENPTlNULkFETUlOX1JPTEUsIENPTlNULlVTRVJfUk9MRSksIG5ldyByb3V0ZXJzLkJ1Y2tldEl0ZW1Sb3V0ZXIoKS5nZXRSb3V0ZXIoKSk7XG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoQ09OU1QuZXAuQVBJICsgQ09OU1QuZXAuVjEsIEF1dGh6LnBlcm1pdChDT05TVC5BRE1JTl9ST0xFLCBDT05TVC5VU0VSX1JPTEUpLCBuZXcgcm91dGVycy5Vc2VyUm91dGVyKCkuZ2V0Um91dGVyKCkpO1xuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKENPTlNULmVwLkFQSSArIENPTlNULmVwLlYxLCBBdXRoei5wZXJtaXQoQ09OU1QuQURNSU5fUk9MRSwgQ09OU1QuVVNFUl9ST0xFKSwgbmV3IHJvdXRlcnMuTm90aWZpY2F0aW9uUm91dGVyKCkuZ2V0Um91dGVyKCkpO1xuXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRTfSR7Q09OU1QuZXAuSU1BR0VTfS86aWRgLFxuICAgICAgICAgICAgQXV0aHoucGVybWl0KENPTlNULkFETUlOX1JPTEUsIENPTlNULlVTRVJfUk9MRSksXG4gICAgICAgICAgICBuZXcgTXVsdGVyQ29uZmlndXJhdGlvbigpLnVwbG9hZGVyLmFycmF5KCdmaWxlJyksXG4gICAgICAgICAgICBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgQnVja2V0Um91dGVyKCkuSW1hZ2VIYW5kbGVyKHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKGAke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfSR7Q09OU1QuZXAuQlVDS0VUX0lURU1TfSR7Q09OU1QuZXAuSU1BR0VTfS86aWRgLFxuICAgICAgICAgICAgQXV0aHoucGVybWl0KENPTlNULkFETUlOX1JPTEUsIENPTlNULlVTRVJfUk9MRSksXG4gICAgICAgICAgICBuZXcgTXVsdGVyQ29uZmlndXJhdGlvbigpLnVwbG9hZGVyLmFycmF5KCdmaWxlJyksXG4gICAgICAgICAgICBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgQnVja2V0SXRlbVJvdXRlcigpLkltYWdlSGFuZGxlcihyZXEsIHJlcywgbmV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gV2Ugd2FudCB0byByZXR1cm4gYSBqc29uIHJlc3BvbnNlIHRoYXQgd2lsbCBhdCBsZWFzdCBiZSBoZWxwZnVsIGZvciBcbiAgICAvLyB0aGUgcm9vdCByb3V0ZSBvZiBvdXIgYXBpLlxuICAgIHByaXZhdGUgaGFuZGxlcnMoKTogdm9pZCB7XG4gICAgICAgIGxvZy5pbmZvKCdJbml0aWFsaXppbmcgSGFuZGxlcnMnKTtcbiAgICAgICAgdGhpcy5leHByZXNzLmdldCgnL2FwaScsIChyZXF1ZXN0OiBleHByZXNzLlJlcXVlc3QsIHJlc3BvbnNlOiBleHByZXNzLlJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICByZXNwb25zZS5qc29uKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBDb25maWcuYWN0aXZlLmdldCgnbmFtZScpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQWxlbWJpYyBXZWIgQXBwbGljYXRpb24nLFxuICAgICAgICAgICAgICAgIEFQSVZlcnNpb246IENPTlNULmVwLlYxLFxuICAgICAgICAgICAgICAgIERvY3VtZW50YXRpb25Mb2NhdGlvbjogYCR7cmVxdWVzdC5wcm90b2NvbH06Ly8ke3JlcXVlc3QuZ2V0KCdob3N0Jyl9JHtDT05TVC5lcC5BUElfRE9DU31gLFxuICAgICAgICAgICAgICAgIEFQSUxvY2F0aW9uOiBgJHtyZXF1ZXN0LnByb3RvY29sfTovLyR7cmVxdWVzdC5nZXQoJ2hvc3QnKX0ke0NPTlNULmVwLkFQSX0ke0NPTlNULmVwLlYxfWAsXG4gICAgICAgICAgICAgICAgSGVhbHRoY2hlY2s6IGAke3JlcXVlc3QucHJvdG9jb2x9Oi8vJHtyZXF1ZXN0LmdldCgnaG9zdCcpfS9oZWFsdGhjaGVja2BcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZXhwcmVzcy5nZXQoJyonLCBmdW5jdGlvbiAocmVxLCByZXMsIG5leHQpIHtcbiAgICAgICAgICAgIHRocm93ICh7IG1lc3NhZ2U6IGBObyByb3V0ZXIgd2FzIGZvdW5kIGZvciB5b3VyIHJlcXVlc3QsIHBhZ2Ugbm90IGZvdW5kLiAgUmVxdWVzdGVkIFBhZ2U6ICR7cmVxLm9yaWdpbmFsVXJsfWAsIHN0YXR1czogNDA0IH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBuZXcgQXBwbGljYXRpb24oKTsiXX0=
