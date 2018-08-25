import { Router } from 'express';
import { Request, Response, RequestHandler, } from 'express';
import { RequestHandlerParams, NextFunction } from 'express-serve-static-core';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';
import { AuthenticationController } from '../controllers/authentication.controller';
import * as passport from 'passport';
import * as InstagramStrategy from 'passport-instagram';
import * as FacebookStrategy from 'passport-facebook';
import * as FacebookTokenStrategy from 'passport-facebook-token';
import { Config } from '../config/config';
import { IUser } from '../models';
import { LoginStrategy } from '../enumerations';

export class AuthenticationRouter extends BaseRouter {

    public router: Router = Router();
    public controller = new AuthenticationController();
    public resource: string = CONST.ep.AUTHENTICATE;

    public constructor() {
        super();
    }

    public getRestrictedRouter(): Router {
        return this.router

            // This is for the local login schemes.
            .post(`${this.resource}${CONST.ep.LOCAL}${CONST.ep.LOGIN}`,
                async (request: Request, response: Response, next: NextFunction) => {
                    await this.controller.authenticateLocal(request, response, next);
                })
            // This is for registering a new user with a local scheme.
            .post(`${this.resource}${CONST.ep.LOCAL}${CONST.ep.REGISTER}`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.register(request, response, next);
            });
    }
}