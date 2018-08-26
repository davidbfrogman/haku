import { NextFunction, Request, Response } from 'express';
import { RandomForestClassifier as RFClassifier } from 'ml-random-forest';
import * as path from 'path';
import { CONST } from '../constants';
import { IUserDoc } from '../models';
import { UserRepository } from "../repositories";
import { BaseController } from './base/base.controller';
let IrisDataset = require('ml-dataset-iris');
import mongoose = require('mongoose');
const csv = require('csvtojson');

/*
  We need an api endpoint that will allow us to upload data sets.  Set the column labels, and types of each field. 
  This api endpoint should store those in mongo.  Allowing crud on those data sets. 

  Another endpoint which will take a data set id, an algorithm, and train a model.
  Additional parameters can be specified, like how many iterations, and any hyper parameters.  This will return a json version of the model.
  It will also store the model in the database.  Other things like accuracy will be returned, and stored in the database along with the model. 

  The last endpoint will allow you to get a prediction.  This will take in the features to predict on, and return a prediction with a given model.
*/
export class MLController extends BaseController {

    public defaultPopulationArgument = null;
    public rolesRequiringOwnership = [];
    public isOwnershipRequired = false;
    private csvFilePath = path.resolve(__dirname, '../data/sortinghat.csv'); // Data
    private heaaders = ['css' , 'win','nav-agent' , 'label']; //If you change the name of the last thing here from 'label' ... you'll break other stuff.
    private data;
    private X = [];
    private y = [];
    private trainingSetY = [];
    private trainingSetX = [];
    private testSetX = [];
    private testSetY = [];

    public repository = new UserRepository();

    constructor() {
        super();
    }

    public async loadDataSet(request: Request, response: Response, next: NextFunction): Promise<ITrainingResponse> {

        await this.processCsvFile();

        // var options = {
        // gainFunction: 'gini',
        // maxDepth: 10,
        // minNumSamples: 30
        // };

        // var classifier = new DTClassifier(options);
        // classifier.train(this.trainingSetX, this.trainingSetY);
        // var predictions = classifier.predict(this.trainingSetX);

        var options = {
            seed: 42,
            maxFeatures: .7, // A percentage based float of the number of features to use on each estimator
            replacement: true,
            useSampleBagging: false, // use bagging over training samples.
            nEstimators: 6
        };

        var classifier = new RFClassifier(options);
        console.log(`About to start training`);
        classifier.train(this.trainingSetX, this.trainingSetY);
        //console.dir(classifier);
        console.log(`Done Doing the training`);

        var predictions: Array<any> = classifier.predict(this.testSetX);
        console.log(`Done doing the predictions based on the data set.`);
        // //console.dir(result);

        // let numberCorrect = 0;
        // for (let i = 0; i < predictions.length; i++) {
        //     const element = predictions[i];
        //     if(element == labels[i]){
        //         ++numberCorrect;
        //     }
        // }

        // console.log(numberCorrect/predictions.length);
        // let trainingResponse: ITrainingResponse = {
        //     Accuracy: +(numberCorrect/predictions.length * 100.0).toFixed(2),
        //     CorrectAnswers: numberCorrect,
        //     Samples: predictions.length
        // }

        let trainingResponse: ITrainingResponse = this.calclulatePrecision(predictions, this.testSetY);
        console.dir(trainingResponse);

        response.status(201);
        response.send(
            trainingResponse
        );
        return trainingResponse;

    }

    private async processCsvFile(){
        //css ,  json , perf , win , label
        this.data = await csv({noheader: true, headers: this.heaaders})
            .fromFile(this.csvFilePath)
            .on('error',(err)=>{
                console.log(err)
            })
            .on('json', (jsonObj) => {
                //console.log(jsonObj);
                this.data.push(jsonObj); // Push each object to data Array
            })
            .on('done', (error) => {
                console.dir(error);
            });
        this.data = this.shuffleArray(this.data);
        this.dressData();
        //console.dir(this.data);
    }

    private shuffleArray(array: Array<any>){
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    private dressData(){
        let types = new Set(); // To gather UNIQUE classes
        let seperationSize = 0.9 * this.data.length;
        this.data.forEach((row) => {
            //console.log(`About to log ${row.label} as a type`);
            types.add(row.label); // TODO: This is a bit of a hack, because my header is named label, this works,... it won't always.
        });
        let typesArray = [...types]; // To save the different types of classes.
        console.dir(`Types ${typesArray}`);
        console.log(`Total #of types ${typesArray.length}`);

        this.data.forEach((row) => {
            let rowArray, typeNumber;
             //css ,  json , perf , win , label
            rowArray = Object.keys(row).map(key => (row[key])).slice(0, this.heaaders.length-1); // We don't use the 2 first elements, which are the type (i.e class) and the specimen number (i.e ID)
            //console.log(rowArray);
            typeNumber = typesArray.indexOf(row.label); // This is a hack!!!! should have some consistent way of discovering what value is the label in the row.
            //console.log(typeNumber);

            this.X.push(rowArray);
            this.y.push(typeNumber);
        });

        this.trainingSetX = this.X.slice(0, seperationSize);
        this.trainingSetY = this.y.slice(0, seperationSize);
        this.testSetX = this.X.slice(seperationSize);
        this.testSetY = this.y.slice(seperationSize);

        // console.log("here's the training set x");
        // console.dir(this.trainingSetX);
        // console.log("Here's the training set y");
        // console.dir(this.trainingSetY);
    }

    private calclulatePrecision(predictions: Array<any>, labels: Array<any>): ITrainingResponse{

        let numberCorrect = 0;
        for (let i = 0; i < predictions.length; i++) {
            const element = predictions[i];
            if(element == labels[i]){
                ++numberCorrect;
            }
        }

        return  {
            Accuracy: +(numberCorrect/predictions.length * 100.0).toFixed(2),
            CorrectAnswers: numberCorrect,
            Samples: predictions.length
        }
    }

    public train(request: Request, response: Response, next: NextFunction): void {


    }

    public predict(request: Request, response: Response, next: NextFunction): void {


    }

    public async preCreateHook(User: IUserDoc): Promise<IUserDoc> {
        User.href = `${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/${User._id}`;
        return User;
    }

    public async preSendResponseHook(User: IUserDoc): Promise<IUserDoc> {
        return User;
    }
}

interface IDataLoadResponse {
    rowsLoaded: number,
}

interface ITrainingDataRequest {
    trainingDataSet: ITrainingDataSet
}

interface ITrainRequest {
    optimizer: string, //sgd or gd for now.
    learningRate: number,
    iterations: number,
}

interface ITrainingResponse {
    CorrectAnswers: number,
    Samples: number,
    Accuracy: number,
}

interface ITrainingDataSet {
    featureColumnNames: Array<string>;
    rows: Array<ITrainingRow>;
}

interface ITrainingRow {
    data: Array<any>;
    label: any;
}