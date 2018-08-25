import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';
import * as express from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { Config } from '../config/config';
import { ITokenPayload, IBaseModelDoc, IUserDoc, User, SearchCriteria, IUser, IOwned, IOwner } from '../models/';
import { CONST } from "../constants";
import { ApiErrorHandler } from "../api-error-handler";
import * as log from 'winston';
import { BaseController } from './base/base.controller';
import { BaseRepository, UserRepository } from '../repositories/index';
import * as moment from 'moment';
import * as enums from '../enumerations';


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export interface IConfigureUser{
    (profile: any) : IUser
}

export class AuthenticationController extends BaseController{

    public repository: UserRepository = new UserRepository();
    public defaultPopulationArgument: object;
    public isOwnershipRequired: boolean = true;  
    public rolesRequiringOwnership: string[] = [''];

    public AuthenticationController(){ }

    private saltRounds: Number = 5;
    private tokenExpiration: string = '24h';

    public async authenticateLocal(request: Request, response: Response, next: NextFunction): Promise<any> {
        try {
            const user :IUserDoc = await this.repository.getUserForPasswordCheck(request.body.email);

            if(!user.isActive){
                ApiErrorHandler.sendAuthFailure(response, 401, 'User is no longer active.');
            }
            const passwordResult = await bcrypt.compare(request.body.password, user.password);
            if (passwordResult === false) {
                ApiErrorHandler.sendAuthFailure(response, 401, 'Authentication Failed');
                return;
            }
            request.user = user;

            await this.sendTokenResponse(request,response,next);

        } catch (err) { ApiErrorHandler.sendAuthFailure(response, 401, err); }
    }

    public async sendTokenResponse(request: Request, response: Response, next: NextFunction): Promise<any> {
        try {
            const user = request.user;
            // notice how we're not doing a password check in this case. 

            // There's basically a soft expiration time on this token, which is set with moment,
            // and a hard expiration time set on this token with jwt sign.  
            const tokenPayload: ITokenPayload = {
                userId: user.id,
                // We're just going to put the name of the role on the token.
                roles: user.roles,
                email: user.email,
                expiresAt: moment().add(moment.duration(1, 'day')).format(CONST.MOMENT_DATE_FORMAT)
            };

            const token = jwt.sign(tokenPayload, Config.active.get('jwtSecretToken'), {
                expiresIn: '25h'
            });

            // We're adding the decoded details because the jsonwebtoken library doesn't work on mobile. 
            // that's a problem, because we want to get the user id off the token, for update requests.
            response.json({
                authenticated: true,
                message: 'Successfully created jwt authentication token.',
                expiresAt: tokenPayload.expiresAt,
                token: token,
                decoded: tokenPayload
            });
        } catch (err) { ApiErrorHandler.sendAuthFailure(response, 401, err); }
    }

    public async register(request: Request, response: Response, next: NextFunction): Promise<any> {
        try {
            // First we have to check if the email address is unique
            if (await this.repository.findUserByEmail(request.body.email)) {
                ApiErrorHandler.sendError('That user email already exists', 400, response, CONST.errorCodes.EMAIL_TAKEN);
                return;
            }
            if (!request.body.password || request.body.password.length < 6) {
                ApiErrorHandler.sendError('Password must be supplied, and be at least 6 chars', 400, response, CONST.errorCodes.PASSWORD_FAILED_CHECKS);
                return;
            }

            let user: IUserDoc = this.repository.createFromBody(request.body);

            // now we need to do a few things to this user.
            // first up hash the password
            user.password = await bcrypt.hash(user.password, CONST.SALT_ROUNDS);

            // Next we need to add this user to the guest role.  Basically no permissions.
            user.roles.push(CONST.USER_ROLE);
            user.isEmailVerified = false;

            user = await user.save();

            //Now that we have an id, we're going to update the user again, with their ownership of themselves.
            user.owners = new Array<IOwner>();

            // You have to add yourself as an owner, otherwise you can't make changes to your profile. 
            user.owners.push({
                ownerId: user.id,
                ownershipType: enums.OwnershipType.user
            });

            await this.repository.update(user.id,user);

            // // if there was a problem sending the email verification email.
            // // we're going to delete the newly created user, and return an error  this will make sure people can still try and register with the same email.
            // try {
            //     // If we're in the test environment, shoot the emails off to our test email address.
            //     if (Config.active.get('sendEmailToTestAccount')) {
            //         // Now we shoot off a notification to mandrill
            //         await EmailVerificationNotification.sendVerificationEmail(Config.active.get('emailToUseForTesting'), emailVerificationDoc.id, request);
            //     }
            //     else {
            //         // Now we shoot off a notification to mandrill
            //         await EmailVerificationNotification.sendVerificationEmail(user.email, emailVerificationDoc.id, request);
            //     }
            // }
            // catch (err) {
            //     await user.remove();
            //     await emailVerificationDoc.remove();
            //     throw err;
            // }

            //Clean up the user before we return it to the register call;
            user.password = '';
            response.status(201).json(user);
        }
        catch (err) { ApiErrorHandler.sendError('There was an error with registratrion', 400, response, null, err); }
    }

    public authMiddleware(request: Request, response: Response, next: NextFunction): Response {
        try {
            const token = request.headers['x-access-token'];
            //console.log(token);
            if (token) {
                // verifies secret and checks exp
                //Rewrite to use async or something 
                jwt.verify(token, Config.active.get('jwtSecretToken'), (err, decoded) => {
                    if (err) {
                        log.error(JSON.stringify(err)); 
                        ApiErrorHandler.sendAuthFailure(response, 401, `Failed to authenticate token. The timer *may* have expired on this token. err: ${err}`); 
                    }
                    else {
                        var token: ITokenPayload = decoded;
                        request[CONST.REQUEST_TOKEN_LOCATION] = token;
                        next();
                    }
                });
            } else {
                //No token, send auth failure
                return ApiErrorHandler.sendAuthFailure(response, 403, 'No Authentication Token Provided');
            }
        } catch (err) {
            ApiErrorHandler.sendAuthFailure(response, 401, "Authentication Failed");
        }
    }
}
