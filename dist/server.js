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
        this.express.use(constants_1.CONST.ep.API + constants_1.CONST.ep.V1, authorization_1.Authz.permit(constants_1.CONST.ADMIN_ROLE, constants_1.CONST.USER_ROLE), new routers.UserRouter().getRouter());
        this.express.use(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKETS}${constants_1.CONST.ep.IMAGES}/:id`, authorization_1.Authz.permit(constants_1.CONST.ADMIN_ROLE, constants_1.CONST.USER_ROLE), new multer_configuration_1.MulterConfiguration().uploader.array('file'), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            //await new BucketRouter().ImageHandler(req, res, next);
        }));
        this.express.use(`${constants_1.CONST.ep.API}${constants_1.CONST.ep.V1}${constants_1.CONST.ep.BUCKET_ITEMS}${constants_1.CONST.ep.IMAGES}/:id`, authorization_1.Authz.permit(constants_1.CONST.ADMIN_ROLE, constants_1.CONST.USER_ROLE), new multer_configuration_1.MulterConfiguration().uploader.array('file'), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            //await new BucketItemRouter().ImageHandler(req, res, next);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsMkNBQTJDO0FBQ2pGLG1DQUFtQztBQUVuQywyQ0FBMkM7QUFDM0MsaUNBQWlDO0FBRWpDLGlDQUFpQztBQUNqQyxxQ0FBcUM7QUFFckMscUNBQXFDO0FBSXJDLDZDQUFvRDtBQUNwRCx5REFBZ0U7QUFDaEUsNkVBQXlFO0FBQ3pFLDJDQUFvQztBQUNwQyw0Q0FBeUM7QUFFekMsMkRBQXNEO0FBQ3RELG1EQUErQztBQUMvQywwRkFBcUY7QUFFckYsa0RBQW1EO0FBQ25ELCtCQUFnQztBQUVoQywrREFBb0Q7QUFDcEQsNkJBQThCO0FBQzlCLDZCQUE2QjtBQUM3Qix1RkFBbUY7QUFDbkYsd0VBQW9FO0FBT3BFLGtEQUFrRDtBQUNsRDtJQU1JLHFEQUFxRDtJQUNyRDtRQUNJLEdBQUcsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUV4QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV4QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFNLHNCQUFzQjtRQUMzQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBRSw2QkFBNkI7UUFDbEQsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsNEJBQTRCO1FBQ3BELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUUsa0ZBQWtGO1FBQ2xILElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLCtEQUErRDtRQUNwRixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBRyw2Q0FBNkM7UUFDbEUsSUFBSSxDQUFD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O2FBQzFFLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJO1lBQzFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSwwRUFBMEUsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2xJLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBQ0Qsa0JBQWUsSUFBSSxXQUFXLEVBQUUsQ0FBQyIsImZpbGUiOiJzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBuZXdSZWxpYyA9IHJlcXVpcmUoJ25ld3JlbGljJyk7IC8vICBIYXMgdG8gYmUgdGhlIGZpcnN0IGxpbmUgb2YgdGhpcyBmaWxlLiBcbmltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgY29tcHJlc3Npb24gZnJvbSAnY29tcHJlc3Npb24nO1xuaW1wb3J0ICogYXMgbW9yZ2FuIGZyb20gJ21vcmdhbic7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBoZWxtZXQgZnJvbSAnaGVsbWV0JztcbmltcG9ydCAqIGFzIHJvdXRlcnMgZnJvbSAnLi9yb3V0ZXJzJztcblxuaW1wb3J0ICogYXMgcGFzc3BvcnQgZnJvbSAncGFzc3BvcnQnO1xuXG5pbXBvcnQgeyBPYmplY3RJZCB9IGZyb20gJ2Jzb24nO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsganNvbiwgdXJsZW5jb2RlZCwgcmF3IH0gZnJvbSAnYm9keS1wYXJzZXInO1xuaW1wb3J0IHsgbW9uZ29vc2UsIERhdGFiYXNlIH0gZnJvbSAnLi9jb25maWcvZGF0YWJhc2UvZGF0YWJhc2UnO1xuaW1wb3J0IHsgRGF0YWJhc2VCb290c3RyYXAgfSBmcm9tICcuL2NvbmZpZy9kYXRhYmFzZS9kYXRhYmFzZS1ib290c3RyYXAnO1xuaW1wb3J0IHsgQ09OU1QgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZy9jb25maWcnO1xuaW1wb3J0IHsgUm91dGVyLCBOZXh0RnVuY3Rpb24gfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IEFwaUVycm9ySGFuZGxlciB9IGZyb20gJy4vYXBpLWVycm9yLWhhbmRsZXInO1xuaW1wb3J0IHsgSGVhbHRoU3RhdHVzIH0gZnJvbSAnLi9oZWFsdGgtc3RhdHVzJztcbmltcG9ydCB7IFN1cHBvcnRpbmdTZXJ2aWNlc0Jvb3RzdHJhcCB9IGZyb20gJy4vY29uZmlnL3N1cHBvcnRpbmctc2VydmljZXMuYm9vdHN0cmFwJztcblxuaW1wb3J0IG1ldGhvZE92ZXJyaWRlID0gcmVxdWlyZSgnbWV0aG9kLW92ZXJyaWRlJyk7XG5pbXBvcnQgbG9nID0gcmVxdWlyZSgnd2luc3RvbicpO1xuXG5pbXBvcnQgeyBBdXRoeiB9IGZyb20gXCIuL2NvbnRyb2xsZXJzL2F1dGhvcml6YXRpb25cIjtcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuaW1wb3J0IGNvcnMgPSByZXF1aXJlKCdjb3JzJylcbmltcG9ydCB7IEF1dGhlbnRpY2F0aW9uQ29udHJvbGxlciB9IGZyb20gJy4vY29udHJvbGxlcnMvYXV0aGVudGljYXRpb24uY29udHJvbGxlcic7XG5pbXBvcnQgeyBNdWx0ZXJDb25maWd1cmF0aW9uIH0gZnJvbSAnLi9jb25maWcvbXVsdGVyLmNvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHsgfSBmcm9tICcuL2NvbnRyb2xsZXJzL2luZGV4JztcbmltcG9ydCB7IElkZW50aXR5QXBpU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvaWRlbnRpdHkuYXBpLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vbW9kZWxzL2luZGV4JztcbmltcG9ydCB7ICBBdXRoZW50aWNhdGlvblJvdXRlciB9IGZyb20gJy4vcm91dGVycyc7XG5cblxuLy8gQ3JlYXRlcyBhbmQgY29uZmlndXJlcyBhbiBFeHByZXNzSlMgd2ViIHNlcnZlci5cbmNsYXNzIEFwcGxpY2F0aW9uIHtcbiAgICAvLyByZWYgdG8gRXhwcmVzcyBpbnN0YW5jZVxuICAgIHB1YmxpYyBleHByZXNzOiBleHByZXNzLkFwcGxpY2F0aW9uO1xuICAgIHB1YmxpYyBjdXJyZW50RGF0YWJhc2U6IERhdGFiYXNlO1xuICAgIHB1YmxpYyBzZXJ2ZXI6IGh0dHAuU2VydmVyO1xuXG4gICAgLy8gUnVuIGNvbmZpZ3VyYXRpb24gbWV0aG9kcyBvbiB0aGUgRXhwcmVzcyBpbnN0YW5jZS5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgbG9nLmluZm8oJ1N0YXJ0aW5nIHVwIEV4cHJlc3MgU2VydmVyLicpO1xuXG4gICAgICAgIHRoaXMuY2hlY2tFbnZpcm9ubWVudCgpO1xuXG4gICAgICAgIHRoaXMuZXhwcmVzcyA9IGV4cHJlc3MoKTtcbiAgICAgICAgdGhpcy5sb2dnaW5nKCk7ICAgICAgLy8gSW5pdGlhbGl6ZSBsb2dnaW5nIFxuICAgICAgICB0aGlzLmhlYWx0aGNoZWNrKCk7ICAvLyBSb3V0ZXIgZm9yIHRoZSBoZWFsdGhjaGVja1xuICAgICAgICB0aGlzLmNvbm5lY3REYXRhYmFzZSgpOyAvLyBTZXR1cCBkYXRhYmFzZSBjb25uZWN0aW9uXG4gICAgICAgIHRoaXMuc2VlZFN1cHBvcnRpbmdTZXJ2aWNlcygpOyAgLy8gV2Ugd2FudCB0byBtYWtlIHN1cmUgdGhhdCBhbnl0aGluZyB0aGlzIHNlcnZpY2UgbmVlZHMgZXhpc3RzIGluIG90aGVyIHNlcnZpY2VzLlxuICAgICAgICB0aGlzLmxvZ2dpbmdDbGllbnRFbmRwb2ludCgpO1xuICAgICAgICB0aGlzLmluaXRQYXNzcG9ydCgpOyAvLyBoZXJlJ3Mgd2hlcmUgd2UncmUgZ29pbmcgdG8gc2V0dXAgYWxsIG91ciBwYXNzcG9ydCBoYW5kbGVycy5cbiAgICAgICAgdGhpcy5taWRkbGV3YXJlKCk7ICAgLy8gU2V0dXAgdGhlIG1pZGRsZXdhcmUgLSBjb21wcmVzc2lvbiwgZXRjLi4uXG4gICAgICAgIHRoaXMuc2VjdXJlKCk7ICAgICAgIC8vIFR1cm4gb24gc2VjdXJpdHkgbWVhc3VyZXNcbiAgICAgICAgdGhpcy5zd2FnZ2VyKCk7ICAgICAgLy8gU2VydmUgdXAgc3dhZ2dlciwgdGhpcyBpcyBiZWZvcmUgYXV0aGVudGljYXRpb24sIGFzIHN3YWdnZXIgaXMgb3BlblxuICAgICAgICB0aGlzLnJvdXRlcygpOyAgICAgICAvLyBTZXR1cCByb3V0ZXJzIGZvciBhbGwgdGhlIGNvbnRyb2xsZXJzXG4gICAgICAgIHRoaXMuY2xpZW50KCk7ICAgICAgIC8vIFRoaXMgd2lsbCBzZXJ2ZSB0aGUgY2xpZW50IGFuZ3VsYXIgYXBwbGljYXRpb24sIHdpbGwgc2VydmUgYWxsIHN0YXRpYyBmaWxlcy5cbiAgICAgICAgdGhpcy5oYW5kbGVycygpOyAgICAgLy8gQW55IGFkZGl0aW9uYWwgaGFuZGxlcnMsIGhvbWUgcGFnZSwgZXRjLlxuICAgICAgICB0aGlzLmluaXRFcnJvckhhbmRsZXIoKTsgLy8gVGhpcyBnbG9iYWwgZXJyb3IgaGFuZGxlciwgd2lsbCBoYW5kbGUgNDA0cyBmb3IgdXMsIGFuZCBhbnkgb3RoZXIgZXJyb3JzLiAgSXQgaGFzIHRvIGJlIExBU1QgaW4gdGhlIHN0YWNrLlxuXG4gICAgICAgIHRoaXMuc2VydmVyID0gdGhpcy5leHByZXNzLmxpc3RlbihDb25maWcuYWN0aXZlLmdldCgncG9ydCcpLCAoKSA9PiB7XG4gICAgICAgICAgICBsb2cuaW5mbyhgTGlzdGVuaW5nIG9uIHBvcnQ6ICR7Q29uZmlnLmFjdGl2ZS5nZXQoJ3BvcnQnKX1gKTtcbiAgICAgICAgICAgIGxvZy5pbmZvKGBDdXJyZW50IHZlcnNpb24gJHtwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9ufWApO1xuICAgICAgICAgICAgbG9nLmluZm8oYEFwcCBOYW1lICR7cHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfbmFtZX1gKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBpbml0UGFzc3BvcnQoKSB7XG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UocGFzc3BvcnQuaW5pdGlhbGl6ZSgpKTtcbiAgICAgICAgLy8gSGVyZSB3ZSBzaG91bGQgYWxzbyBjb25maWd1cmUgYWxsIG9mIG91ciBtaWRkbGV3YXJlIHN0cmF0ZWdpZXMgZm9yIHBhc3Nwb3J0LiAgRmFjZWJvb2ssIGluc3RhZ3JhbSwgdHdpdHRlciwgZ21haWwsIGV0Yy5cbiAgICB9XG5cbiAgICAvLyBIZXJlIHdlJ3JlIGdvaW5nIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBlbnZpcm9ubWVudCBpcyBzZXR1cC4gIFxuICAgIC8vIFdlJ3JlIGFsc28gZ29pbmcgdG8gZG91YmxlIGNoZWNrIHRoYXQgbm90aGluZyBnb29meSBpcyBnb2luZyBvbi5cbiAgICBwcml2YXRlIGNoZWNrRW52aXJvbm1lbnQoKSB7XG4gICAgICAgIGlmICghcHJvY2Vzcy5lbnYuTk9ERV9FTlYpIHtcbiAgICAgICAgICAgIHRocm93IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBlcnJvcjogJ1lvdSBtdXN0IGhhdmUgYSBub2RlIGVudmlyb25tZW50IHNldDogTk9ERV9FTlYnLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdZb3UgY2FuIHNldCBhIG5vZGUgZW52aXJvbmVtbnQgdXNpbmcgc2V0IE5PREVfRU5WIGRldmVsb3BtZW50LiBCZSBzdXJlIHRvIGNsb3NlIGFuZCByZW9wZW4gYW55IGFjdGl2ZSBjb25zb2xlIHdpbmRvd3MnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsb2cuaW5mbyhgQ3VycmVudCBFbnZpcm9ubWVudCBzZXQgdmlhIGVudmlyb25tZW50IHZhcmlhYmxlcyAoTk9ERV9FTlYpOiR7cHJvY2Vzcy5lbnYuTk9ERV9FTlZ9YCk7XG4gICAgICAgIH1cbiAgICAgICAgSGVhbHRoU3RhdHVzLmlzRW52aXJvbm1lbnRWYXJpYWJsZVNldCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gV2Ugd2FudCB0byBjb25maWd1cmUgbG9nZ2luZyBzbyB0aGF0IGlmIHdlJ3JlIG91dHB1dHRpbmcgaXQgdG8gdGhlIGNvbnNvbGVcbiAgICAvLyBpdCdzIG5pY2UgYW5kIGNvbG9yaXplZCwgb3RoZXJ3aXNlIHdlIHJlbW92ZSB0aGF0IHRyYW5zcG9ydC5cbiAgICBwcml2YXRlIGxvZ2dpbmcoKTogdm9pZCB7XG4gICAgICAgIGlmIChDb25maWcuYWN0aXZlLmdldCgnaXNDb25zb2xlTG9nZ2luZ0FjdGl2ZScpKSB7XG4gICAgICAgICAgICBsb2cucmVtb3ZlKGxvZy50cmFuc3BvcnRzLkNvbnNvbGUpO1xuICAgICAgICAgICAgbG9nLmFkZChsb2cudHJhbnNwb3J0cy5Db25zb2xlLCB7IGNvbG9yaXplOiBDb25maWcuYWN0aXZlLmdldCgnaXNDb25zb2xlQ29sb3JlZCcpIH0pO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSBjYW4gdXNlIGNvbG9ycywgZm9yIGluc3RhbmNlIHdoZW4gcnVubmluZyBsb2NhbGx5LCB3ZSB3YW50IHRvIHVzZSB0aGVtLlxuICAgICAgICAgICAgLy8gT3V0IG9uIHRoZSBzZXJ2ZXIgdGhvdWdoLCBmb3IgcmVhbCBsb2dzLCB0aGUgY29sb3JzIHdpbGwgYWRkIHdlaXJkIHRva2VucywgdGhhdCB3ZSBkb24ndCB3YW50IHNob3dpbmcgdXAgaW4gb3VyIGxvZ3MuXG4gICAgICAgICAgICBpZiAoQ29uZmlnLmFjdGl2ZS5nZXQoJ2lzQ29uc29sZUNvbG9yZWQnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhwcmVzcy51c2UobW9yZ2FuKCdkZXYnLCB7XG4gICAgICAgICAgICAgICAgICAgIHNraXA6IHRoaXMuc2tpcEhlYWx0aENoZWNrXG4gICAgICAgICAgICAgICAgfSkpOyAvLyBVc2luZyBtb3JnYW4gbWlkZGxld2FyZSBmb3IgbG9nZ2luZyBhbGwgcmVxdWVzdHMuICB0aGUgJ2RldicgaGVyZSBpcyBqdXN0IGEgcGFydGljdWxhciBmb3JtYXQuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBPdGhlcndpc2UsIHRoaXMgaXMgbW9zdCBsaWtlbHkgbG9nZ2luZyBzb21ld2hlcmUgd2hlcmUgY29sb3JzIHdvdWxkIGJlIGJhZC4gIEZvciBpbnN0YW5jZSBvZmYgb24gdGhlIGFjdHVhbFxuICAgICAgICAgICAgLy8gU2VydmVyLCBpbiB3aGljaCBjYXNlIHdlIGRvbid0IHdhbnQgY29sb3JzLCBhbmQgd2UgbmVlZCB0byBrbm93IHRoZSBlbnZpcm9uZW1lbnQuXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBtb3JnYW4udG9rZW4oJ2Vudmlyb25tZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvY2Vzcy5lbnYuTk9ERV9FTlY7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5leHByZXNzLnVzZShtb3JnYW4oJzpkYXRlIDplbnZpcm9ubWVudCA6bWV0aG9kIDp1cmwgOnN0YXR1cyA6cmVzcG9uc2UtdGltZSBtcyA6cmVzW2NvbnRlbnQtbGVuZ3RoXScsIHtcbiAgICAgICAgICAgICAgICAgICAgc2tpcDogdGhpcy5za2lwSGVhbHRoQ2hlY2tcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsb2cucmVtb3ZlKGxvZy50cmFuc3BvcnRzLkNvbnNvbGUpO1xuICAgICAgICB9XG4gICAgICAgIEhlYWx0aFN0YXR1cy5pc0xvZ2dpbmdJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gQmVjYXVzZSB3ZSByZWFsbHkgZG9uJ3QgbmVlZCB0byBmaWxsIHRoZSBsb2dzIHdpdGggYSB0b24gb2YgaGVhbHRoIGNoZWNrIDIwMCdzIHdlJ3JlIGdvaW5nIHRvIHNraXBcbiAgICAvLyBsb2dnaW5nIHRoZSAyMDAgaGVhbHRoIGNoZWNrcy4gIGlmIHRoZXkgYXJlIDUwMCdzIGFuZCBzb21ldGhpbmcgd2VudCB3cm9uZyB0aGF0J3MgYSBkaWZmZXJlbnQgc3RvcnkgYW5kIHdlJ2xsIGxvZyB0aGVtLlxuICAgIHByaXZhdGUgc2tpcEhlYWx0aENoZWNrKHJlcXVlc3Q6IGV4cHJlc3MuUmVxdWVzdCwgcmVzcG9uc2U6IGV4cHJlc3MuUmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3Qub3JpZ2luYWxVcmwuaW5jbHVkZXMoJ2hlYWx0aGNoZWNrJykgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PT0gMjAwO1xuICAgIH1cblxuICAgIGluaXRFcnJvckhhbmRsZXIoKTogYW55IHtcbiAgICAgICAgbG9nLmluZm8oJ0luc3RhbnRpYXRpbmcgRGVmYXVsdCBFcnJvciBIYW5kbGVyIFJvdXRlJyk7XG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoKGVycm9yOiBFcnJvciAmIHsgc3RhdHVzOiBudW1iZXIgfSwgcmVxdWVzdDogZXhwcmVzcy5SZXF1ZXN0LCByZXNwb25zZTogZXhwcmVzcy5SZXNwb25zZSwgbmV4dDogZXhwcmVzcy5OZXh0RnVuY3Rpb24pOiB2b2lkID0+IHtcbiAgICAgICAgICAgIEFwaUVycm9ySGFuZGxlci5IYW5kbGVBcGlFcnJvcihlcnJvciwgcmVxdWVzdCwgcmVzcG9uc2UsIG5leHQpO1xuICAgICAgICB9KTtcbiAgICAgICAgSGVhbHRoU3RhdHVzLmlzQXBpRXJyb3JIYW5kbGVySW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGVhbHRoY2hlY2soKSB7XG4gICAgICAgIHRoaXMuZXhwcmVzcy5nZXQoJy9oZWFsdGhjaGVjaycsIChyZXF1ZXN0OiBleHByZXNzLlJlcXVlc3QsIHJlc3BvbnNlOiBleHByZXNzLlJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpc1NldHVwQ29tcGxldGUgPSBIZWFsdGhTdGF0dXMuaXNIZWFsdGh5KCk7XG4gICAgICAgICAgICByZXNwb25zZS5zdGF0dXNDb2RlID0gaXNTZXR1cENvbXBsZXRlID8gMjAwIDogNTAwO1xuICAgICAgICAgICAgcmVzcG9uc2UuanNvbih7XG4gICAgICAgICAgICAgICAgQXBwbGljYXRpb25OYW1lOiBwcm9jZXNzLmVudi5ucG1fcGFja2FnZV9uYW1lLFxuICAgICAgICAgICAgICAgIFN0YXR1c0NvZGU6IGlzU2V0dXBDb21wbGV0ZSA/IDIwMCA6IDUwMCxcbiAgICAgICAgICAgICAgICBTZXR1cENvbXBsZXRlOiBpc1NldHVwQ29tcGxldGUsXG4gICAgICAgICAgICAgICAgVmVyc2lvbjogcHJvY2Vzcy5lbnYubnBtX3BhY2thZ2VfdmVyc2lvblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9nZ2luZ0NsaWVudEVuZHBvaW50KCkge1xuICAgICAgICB0aGlzLmV4cHJlc3MucG9zdCgnL2NsaWVudGxvZ3MnLCAocmVxdWVzdDogZXhwcmVzcy5SZXF1ZXN0LCByZXNwb25zZTogZXhwcmVzcy5SZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgbG9nLmxvZyhyZXF1ZXN0LmJvZHkubGV2ZWwsIHJlcXVlc3QuYm9keS5tZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjb25uZWN0RGF0YWJhc2UoKSB7XG4gICAgICAgIGF3YWl0IERhdGFiYXNlLmNvbm5lY3QoKTtcbiAgICAgICAgYXdhaXQgRGF0YWJhc2VCb290c3RyYXAuc2VlZCgpO1xuICAgICAgICBIZWFsdGhTdGF0dXMuaXNEYXRhYmFzZVNlZWRlZCA9IHRydWU7XG4gICAgICAgIGxvZy5pbmZvKCdDb21wbGV0ZWQgU2V0dXAsIGJvb3N0cmFwcGVkIGRhdGFiYXNlLCBkYXRhYmFzZSBub3cgb25saW5lJyk7XG4gICAgICAgIHRoaXMuc2VydmVyLmVtaXQoXCJkYkNvbm5lY3RlZFwiKTsgIC8vIFVzZWQgYnkgdGhlIHVuaXQgdGVzdHMgdG8gcHJldmVudCB0aGVtIGZyb20gc3RhcnRpbmcgdW50aWwgdGhlIGRhdGFiYXNlIGlzIGNvbm5lY3RlZC4gXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzZWVkU3VwcG9ydGluZ1NlcnZpY2VzKCkge1xuICAgICAgICBhd2FpdCBTdXBwb3J0aW5nU2VydmljZXNCb290c3RyYXAuc2VlZCgpO1xuICAgICAgICBsb2cuaW5mbygnU3VwcG9ydGluZyBzZXJ2aWNlcyBoYXZlIGJlZW4gc2VlZGVkLCBhbGwgYW5jaWxsYXJ5IGRhdGEgaGFzIGJlZW4gY3JlYXRlZCcpO1xuICAgICAgICBIZWFsdGhTdGF0dXMuaXNTdXBwb3J0aW5nU2VydmljZXNTZWVkZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VjdXJlKCkge1xuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKGhlbG1ldCgpKTsgLy9Qcm90ZWN0aW5nIHRoZSBhcHAgZnJvbSBhIGxvdCBvZiB2dWxuZXJhYmlsaXRpZXMgdHVybiBvbiB3aGVuIHlvdSB3YW50IHRvIHVzZSBUTFMuXG4gICAgICAgIEhlYWx0aFN0YXR1cy5pc1NlY3VyZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFRoaXMgd2lsbCBhbGxvdyB1cyB0byBzZXJ2ZSB0aGUgc3RhdGljIGhvbWVwYWdlIGZvciBvdXIgc3dhZ2dlciBkZWZpbml0aW9uXG4gICAgLy8gYWxvbmcgd2l0aCB0aGUgc3dhZ2dlciB1aSBleHBsb3Jlci5cbiAgICBwcml2YXRlIHN3YWdnZXIoKTogdm9pZCB7XG4gICAgICAgIGxvZy5pbmZvKCdJbml0aWFsaXppbmcgU3dhZ2dlcicpO1xuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKENPTlNULmVwLkFQSV9ET0NTLCBleHByZXNzLnN0YXRpYyhfX2Rpcm5hbWUgKyAnL3N3YWdnZXIvc3dhZ2dlci11aScpKTtcbiAgICAgICAgdGhpcy5leHByZXNzLnVzZShDT05TVC5lcC5BUElfU1dBR0dFUl9ERUYsIGV4cHJlc3Muc3RhdGljKF9fZGlybmFtZSArICcvc3dhZ2dlci8nKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjbGllbnQoKTogdm9pZCB7XG4gICAgICAgIGxvZy5pbmZvKCdJbml0aWFsaXppbmcgQ2xpZW50Jyk7XG5cbiAgICAgICAgLy8gdGhpcyBhbGxvd3MgeW91IHRvIHNlZSB0aGUgZmlsZXMgdXBsb2FkZWQgaW4gZGV2IGh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC91cGxvYWRzLzA2N2UyYWQ4Y2E4MDUwM2I5YWU0MWM5YzA2ODU1YTlhLTFhZmQwMTc4OWE3MDE1YTQzNmQzNWM2OTE0MjM2ODY1LTE0OTM4MTYyMjc0NjcuanBlZ1xuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKCcvdXBsb2FkcycsIGV4cHJlc3Muc3RhdGljKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9pbWctdXBsb2Fkcy8nKSkpO1xuXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoZXhwcmVzcy5zdGF0aWMocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2NsaWVudC9kaXN0LycgKyBDb25maWcuYWN0aXZlLmdldCgnY2xpZW50RGlzdEZvbGRlcicpICsgJy8nKSkpO1xuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKCcqJywgZXhwcmVzcy5zdGF0aWMocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2NsaWVudC9kaXN0LycgKyBDb25maWcuYWN0aXZlLmdldCgnY2xpZW50RGlzdEZvbGRlcicpICsgJy9pbmRleC5odG1sJykpKTtcbiAgICB9XG5cbiAgICAvLyBDb25maWd1cmUgRXhwcmVzcyBtaWRkbGV3YXJlLlxuICAgIHByaXZhdGUgbWlkZGxld2FyZSgpOiB2b2lkIHtcbiAgICAgICAgbG9nLmluZm8oJ0luaXRpYWxpemluZyBNaWRkbGV3YXJlJyk7XG4gICAgICAgIHRoaXMuZXhwcmVzcy5kaXNhYmxlKCd4LXBvd2VyZWQtYnknKTtcbiAgICAgICAgdGhpcy5leHByZXNzLnVzZShqc29uKCkpO1xuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKHVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSk7XG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UobWV0aG9kT3ZlcnJpZGUoZnVuY3Rpb24gKHJlcSkge1xuICAgICAgICAgICAgaWYgKHJlcS5ib2R5ICYmIHR5cGVvZiByZXEuYm9keSA9PT0gJ29iamVjdCcgJiYgJ19tZXRob2QnIGluIHJlcS5ib2R5KSB7XG4gICAgICAgICAgICAgICAgLy8gbG9vayBpbiB1cmxlbmNvZGVkIFBPU1QgYm9kaWVzIGFuZCBkZWxldGUgaXRcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRob2QgPSByZXEuYm9keS5fbWV0aG9kO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXEuYm9keS5fbWV0aG9kO1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXRob2Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgLy8gY29tcHJlc3MgYWxsIHJlcXVlc3RzXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoY29tcHJlc3Npb24oKSk7XG4gICAgICAgIC8vIGVuYWJsZSBjb3JzXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoY29ycygpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJvdXRlcygpOiB2b2lkIHtcbiAgICAgICAgbG9nLmluZm8oJ0luaXRpYWxpemluZyBSb3V0ZXJzJyk7XG5cbiAgICAgICAgdGhpcy5leHByZXNzLnVzZShDT05TVC5lcC5BUEkgKyBDT05TVC5lcC5WMSwgbmV3IHJvdXRlcnMuQXV0aGVudGljYXRpb25Sb3V0ZXIoKS5nZXRSZXN0cmljdGVkUm91dGVyKCkpO1xuXG4gICAgICAgIC8vIE5vdyB3ZSBsb2NrIHVwIHRoZSByZXN0LlxuICAgICAgICB0aGlzLmV4cHJlc3MudXNlKCcvYXBpLyonLCBuZXcgQXV0aGVudGljYXRpb25Db250cm9sbGVyKCkuYXV0aE1pZGRsZXdhcmUpO1xuXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoQ09OU1QuZXAuQVBJICsgQ09OU1QuZXAuVjEsIEF1dGh6LnBlcm1pdChDT05TVC5BRE1JTl9ST0xFLCBDT05TVC5VU0VSX1JPTEUpLCBuZXcgcm91dGVycy5Vc2VyUm91dGVyKCkuZ2V0Um91dGVyKCkpO1xuXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRTfSR7Q09OU1QuZXAuSU1BR0VTfS86aWRgLFxuICAgICAgICAgICAgQXV0aHoucGVybWl0KENPTlNULkFETUlOX1JPTEUsIENPTlNULlVTRVJfUk9MRSksXG4gICAgICAgICAgICBuZXcgTXVsdGVyQ29uZmlndXJhdGlvbigpLnVwbG9hZGVyLmFycmF5KCdmaWxlJyksXG4gICAgICAgICAgICBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICAvL2F3YWl0IG5ldyBCdWNrZXRSb3V0ZXIoKS5JbWFnZUhhbmRsZXIocmVxLCByZXMsIG5leHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuZXhwcmVzcy51c2UoYCR7Q09OU1QuZXAuQVBJfSR7Q09OU1QuZXAuVjF9JHtDT05TVC5lcC5CVUNLRVRfSVRFTVN9JHtDT05TVC5lcC5JTUFHRVN9LzppZGAsXG4gICAgICAgICAgICBBdXRoei5wZXJtaXQoQ09OU1QuQURNSU5fUk9MRSwgQ09OU1QuVVNFUl9ST0xFKSxcbiAgICAgICAgICAgIG5ldyBNdWx0ZXJDb25maWd1cmF0aW9uKCkudXBsb2FkZXIuYXJyYXkoJ2ZpbGUnKSxcbiAgICAgICAgICAgIGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vYXdhaXQgbmV3IEJ1Y2tldEl0ZW1Sb3V0ZXIoKS5JbWFnZUhhbmRsZXIocmVxLCByZXMsIG5leHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIFdlIHdhbnQgdG8gcmV0dXJuIGEganNvbiByZXNwb25zZSB0aGF0IHdpbGwgYXQgbGVhc3QgYmUgaGVscGZ1bCBmb3IgXG4gICAgLy8gdGhlIHJvb3Qgcm91dGUgb2Ygb3VyIGFwaS5cbiAgICBwcml2YXRlIGhhbmRsZXJzKCk6IHZvaWQge1xuICAgICAgICBsb2cuaW5mbygnSW5pdGlhbGl6aW5nIEhhbmRsZXJzJyk7XG4gICAgICAgIHRoaXMuZXhwcmVzcy5nZXQoJy9hcGknLCAocmVxdWVzdDogZXhwcmVzcy5SZXF1ZXN0LCByZXNwb25zZTogZXhwcmVzcy5SZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmVzcG9uc2UuanNvbih7XG4gICAgICAgICAgICAgICAgbmFtZTogQ29uZmlnLmFjdGl2ZS5nZXQoJ25hbWUnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FsZW1iaWMgV2ViIEFwcGxpY2F0aW9uJyxcbiAgICAgICAgICAgICAgICBBUElWZXJzaW9uOiBDT05TVC5lcC5WMSxcbiAgICAgICAgICAgICAgICBEb2N1bWVudGF0aW9uTG9jYXRpb246IGAke3JlcXVlc3QucHJvdG9jb2x9Oi8vJHtyZXF1ZXN0LmdldCgnaG9zdCcpfSR7Q09OU1QuZXAuQVBJX0RPQ1N9YCxcbiAgICAgICAgICAgICAgICBBUElMb2NhdGlvbjogYCR7cmVxdWVzdC5wcm90b2NvbH06Ly8ke3JlcXVlc3QuZ2V0KCdob3N0Jyl9JHtDT05TVC5lcC5BUEl9JHtDT05TVC5lcC5WMX1gLFxuICAgICAgICAgICAgICAgIEhlYWx0aGNoZWNrOiBgJHtyZXF1ZXN0LnByb3RvY29sfTovLyR7cmVxdWVzdC5nZXQoJ2hvc3QnKX0vaGVhbHRoY2hlY2tgXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmV4cHJlc3MuZ2V0KCcqJywgZnVuY3Rpb24gKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICAgICAgICB0aHJvdyAoeyBtZXNzYWdlOiBgTm8gcm91dGVyIHdhcyBmb3VuZCBmb3IgeW91ciByZXF1ZXN0LCBwYWdlIG5vdCBmb3VuZC4gIFJlcXVlc3RlZCBQYWdlOiAke3JlcS5vcmlnaW5hbFVybH1gLCBzdGF0dXM6IDQwNCB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgbmV3IEFwcGxpY2F0aW9uKCk7Il19
