import { Router } from 'express';
import { MLController } from '../controllers/';
import { Request, Response, RequestHandler, } from 'express';
import { RequestHandlerParams, NextFunction } from 'express-serve-static-core';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';

export class MLRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new MLController();
    public resource: string;

    public constructor(){
        super();
        this.resource = CONST.ep.ML;
    }

    public getRouter(): Router{
        return super.getRouter()
        .post(`${this.resource}/load`, async (request: Request, response: Response, next: NextFunction) => {
            await this.controller.loadDataSet(request, response, next);
        })
        .post(`${this.resource}/train`, async (request: Request, response: Response, next: NextFunction) => {
            await this.controller.train(request, response, next);
        })
        .post(`${this.resource}/predict`, async (request: Request, response: Response, next: NextFunction) => {
            await this.controller.predict(request, response, next);
        })
    }
}