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
const log = require("winston");
const _1 = require("../../models/");
const constants_1 = require("../../constants");
const enumerations_1 = require("../../enumerations");
const authorization_1 = require("../authorization");
const api_error_handler_1 = require("../../api-error-handler");
class BaseController {
    // If implemented this will be called on document creation.  This will allow us to add ownership at creation time.
    addOwnerships(request, response, next, modelDoc) {
        let currentToken = request[constants_1.CONST.REQUEST_TOKEN_LOCATION];
        modelDoc.owners.push({
            ownerId: currentToken.userId,
            ownershipType: enumerations_1.OwnershipType.user
        });
    }
    getCurrentOwner(request) {
        let currentToken = request[constants_1.CONST.REQUEST_TOKEN_LOCATION];
        return {
            ownerId: currentToken.userId,
            ownershipType: enumerations_1.OwnershipType.user
        };
    }
    // The child classes implementation of ownership testing.  Allows for child classes to test various data points.
    isOwner(request, response, next, document) {
        // We'll assume this is only for CRUD
        // Get the current token, so we can get the ownerId in this case organization id off of here.
        let currentToken = request[constants_1.CONST.REQUEST_TOKEN_LOCATION];
        // For now we're just going to check that the ownership is around organization.
        return this.isOwnerInOwnership(document, currentToken.userId, enumerations_1.OwnershipType.user);
    }
    isOwnerInOwnership(document, ownerId, ownershipType) {
        let isOwner = false;
        if (document && document.owners) {
            document.owners.forEach(documentOwnershipElement => {
                if (documentOwnershipElement.ownershipType === ownershipType
                    // One of these is a bson id on the document, the other is a string, so don't use triple equal
                    && documentOwnershipElement.ownerId == ownerId) {
                    isOwner = true;
                }
            });
        }
        return isOwner;
    }
    isModificationAllowed(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // If ownership is required we need to make sure the user has the rights to CRUD this item.
            if (this.isOwnershipRequired
                && this.rolesRequiringOwnership
                && this.rolesRequiringOwnership.length > 0
                && request[constants_1.CONST.REQUEST_TOKEN_LOCATION]
                && request[constants_1.CONST.REQUEST_TOKEN_LOCATION].roles
                // Is the user a role, that exists in the roles array that requires an ownership test.
                && authorization_1.Authz.isMatchBetweenRoleLists(this.rolesRequiringOwnership, request[constants_1.CONST.REQUEST_TOKEN_LOCATION].roles)) {
                // We need to get the document before we can CRUD it
                let document = yield this.repository.single(this.getId(request));
                // The first thing we usually do whenever we're trying to update, edit, etc, is check ownership. 
                // we need to throw a 404 if we didn't find the document when we're checking ownership.
                if (!document) {
                    throw { message: 'Item Not found', status: 404 };
                }
                if (!this.isOwner(request, response, next, document)) {
                    api_error_handler_1.ApiErrorHandler.sendAuthFailure(response, 403, 'You are not allowed to CRUD this resource. Ownership Check failed.');
                    return false;
                }
            }
            return true;
        });
    }
    isAdmin(request, response) {
        if (authorization_1.Authz.isMatchBetweenRoleLists([constants_1.CONST.ADMIN_ROLE], request[constants_1.CONST.REQUEST_TOKEN_LOCATION].roles)) {
            return true;
        }
        else {
            api_error_handler_1.ApiErrorHandler.sendAuthFailure(response, 403, 'Only Admins can execute this operation');
            return false;
        }
    }
    isValid(model) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    ;
    preCreateHook(model) {
        return __awaiter(this, void 0, void 0, function* () {
            return model;
        });
    }
    preUpdateHook(model) {
        return __awaiter(this, void 0, void 0, function* () {
            return model;
        });
    }
    updateValidation(model) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    getId(request) {
        return request && request.params ? request.params['id'] : null;
    }
    blank(request, response, next) {
        try {
            if (this.isAdmin(request, response)) {
                response.json(this.repository.blank());
            }
        }
        catch (err) {
            next(err);
        }
    }
    utility(request, response, next) {
        try {
            if (this.isAdmin(request, response)) {
                response.json({});
            }
        }
        catch (err) {
            next(err);
        }
    }
    respondWithValidationErrors(request, response, next, validationErrors) {
        response.status(412).json({
            validationError: 'Your Item did not pass validation',
            validationErrors: validationErrors
        });
    }
    query(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchCriteria = new _1.SearchCriteria(request, next);
                // We're going to query for the models.
                let models = yield this.repository.query(request.body, this.defaultPopulationArgument, searchCriteria);
                // A pager will need to know the total count of models, based on the search parameters.  
                let totalCount = yield this.repository.searchingCount(request.body);
                let queryResponse = {
                    results: models,
                    paging: {
                        limit: searchCriteria.limit,
                        skip: searchCriteria.skip,
                        count: totalCount,
                    }
                };
                response.json(queryResponse);
                log.info(`Queried for: ${this.repository.getCollectionName()}, Found: ${models.length}`);
                return queryResponse;
            }
            catch (err) {
                next(err);
            }
        });
    }
    clear(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.isAdmin(request, response)) {
                    let before = yield this.repository.count(new _1.SearchCriteria(request, next));
                    yield this.repository.clear(request.body);
                    let after = yield this.repository.count(new _1.SearchCriteria(request, next));
                    response.json({
                        Collection: this.repository.getCollectionName(),
                        Message: 'All items cleared from collection',
                        CountOfItemsRemoved: before - after
                    });
                    log.info(`Cleared the entire collection: ${this.repository.getCollectionName()}`);
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
    preDestroyHook(request, response, next, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            return doc;
        });
    }
    destroy(request, response, next, sendResponse = true) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (yield this.isModificationAllowed(request, response, next)) {
                    // Before we destroy, we want our controllers to have the opportunity to cleanup any related data.
                    const doc = yield this.repository.single(this.getId(request));
                    yield this.preDestroyHook(request, response, next, doc);
                    let deletedModel = yield this.repository.destroy(this.getId(request));
                    if (!deletedModel) {
                        throw { message: "Item Not Found", status: 404 };
                    }
                    if (sendResponse) {
                        response.json({
                            ItemRemovedId: deletedModel.id,
                            ItemRemoved: deletedModel,
                        });
                    }
                    log.info(`Removed a: ${this.repository.getCollectionName()}, ID: ${this.getId(request)}`);
                    return deletedModel;
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
    //Update full / partial, is the difference between put and patch.
    updateFull(request, response, next) {
        return this.update(request, response, next, true);
    }
    updatePartial(request, response, next) {
        return this.update(request, response, next, false);
    }
    update(request, response, next, isFull) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (yield this.isModificationAllowed(request, response, next)) {
                    let model = yield this.preUpdateHook(this.repository.createFromBody(request.body));
                    //I think validation will break on partial updates.  Something to look for.
                    let validationErrors = yield this.isValid(model);
                    if (validationErrors && validationErrors.length > 0) {
                        this.respondWithValidationErrors(request, response, next, validationErrors);
                        return null;
                    }
                    // notice that we're using the request body in the set operation NOT the item after the pre update hook.
                    let updateBody;
                    if (isFull) {
                        // here we have a full document, so we don't need the set operation
                        updateBody = model;
                    }
                    else {
                        // here someone only passed in a few fields, so we use the set operation to only change the fields that were passed in.
                        updateBody = { $set: request.body };
                    }
                    model = yield this.repository.update(this.getId(request), updateBody);
                    if (!model) {
                        throw { message: 'Item Not found', status: 404 };
                    }
                    response.status(202).json(model);
                    log.info(`Updated a: ${this.repository.getCollectionName()}, ID: ${model._id}`);
                    return model;
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
    create(request, response, next, sendResponse = true) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let model = yield this.preCreateHook(this.repository.createFromBody(request.body));
                let validationErrors = yield this.isValid(model);
                if (validationErrors && validationErrors.length > 0) {
                    this.respondWithValidationErrors(request, response, next, validationErrors);
                    return null;
                }
                this.addOwnerships(request, response, next, model);
                model = yield this.repository.create(model);
                if (sendResponse) {
                    response.status(201).json(model);
                }
                log.info(`Created New: ${this.repository.getCollectionName()}, ID: ${model._id}`);
                return model;
            }
            catch (err) {
                next(err);
            }
        });
    }
    count(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchCriteria = new _1.SearchCriteria(request, next);
                const count = yield this.repository.count(searchCriteria);
                response.json({
                    CollectionName: this.repository.getCollectionName(),
                    CollectionCount: count,
                    SearchCriteria: searchCriteria.criteria,
                });
                log.info(`Executed Count Operation: ${this.repository.getCollectionName()}, Count: ${count}`);
                return count;
            }
            catch (err) {
                next(err);
            }
        });
    }
    list(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let models = yield this.repository.list(new _1.SearchCriteria(request, next), this.defaultPopulationArgument);
                response.json(models);
                log.info(`Executed List Operation: ${this.repository.getCollectionName()}, Count: ${models.length}`);
                return models;
            }
            catch (err) {
                next(err);
            }
        });
    }
    listByOwner(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let models = yield this.repository.listByOwner(new _1.SearchCriteria(request, next), this.getCurrentOwner(request), this.defaultPopulationArgument);
                response.json(models);
                log.info(`Executed List Operation: ${this.repository.getCollectionName()}, Count: ${models.length}`);
                return models;
            }
            catch (err) {
                next(err);
            }
        });
    }
    single(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let model = yield this.repository.single(this.getId(request), this.defaultPopulationArgument);
                if (!model)
                    throw ({ message: 'Item Not Found', status: 404 });
                response.json(model);
                log.info(`Executed Single Operation: ${this.repository.getCollectionName()}, item._id: ${model._id}`);
                return model;
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.BaseController = BaseController;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL2NvbnRyb2xsZXJzL2Jhc2UvYmFzZS5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFQSwrQkFBK0I7QUFDL0Isb0NBQTJIO0FBRzNILCtDQUF3QztBQUN4QyxxREFBbUQ7QUFDbkQsb0RBQXlDO0FBQ3pDLCtEQUEwRDtBQUcxRDtJQVdJLGtIQUFrSDtJQUMzRyxhQUFhLENBQUMsT0FBZ0IsRUFBRSxRQUFrQixFQUFFLElBQWtCLEVBQUUsUUFBZ0I7UUFDM0YsSUFBSSxZQUFZLEdBQWtCLE9BQU8sQ0FBQyxpQkFBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDeEUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDakIsT0FBTyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQzVCLGFBQWEsRUFBRSw0QkFBYSxDQUFDLElBQUk7U0FDcEMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLGVBQWUsQ0FBQyxPQUFnQjtRQUNuQyxJQUFJLFlBQVksR0FBa0IsT0FBTyxDQUFDLGlCQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUN4RSxNQUFNLENBQUM7WUFDSCxPQUFPLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDNUIsYUFBYSxFQUFFLDRCQUFhLENBQUMsSUFBSTtTQUNwQyxDQUFBO0lBQ0wsQ0FBQztJQUVELGdIQUFnSDtJQUN6RyxPQUFPLENBQUMsT0FBZ0IsRUFBRSxRQUFrQixFQUFFLElBQWtCLEVBQUUsUUFBZ0I7UUFDckYscUNBQXFDO1FBQ3JDLDZGQUE2RjtRQUM3RixJQUFJLFlBQVksR0FBa0IsT0FBTyxDQUFDLGlCQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUV4RSwrRUFBK0U7UUFDL0UsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLE1BQU0sRUFBRSw0QkFBYSxDQUFDLElBQUks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QUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsZUFBZSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFFdEcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNyQixDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7WUFBQyxDQUFDO1FBQy9CLENBQUM7S0FBQTtDQUNKO0FBelVELHdDQXlVQyIsImZpbGUiOiJjb250cm9sbGVycy9iYXNlL2Jhc2UuY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRGdW5jdGlvbiwgUmVxdWVzdCwgUmVxdWVzdEhhbmRsZXIsIFJlcXVlc3RQYXJhbUhhbmRsZXIsIFJlc3BvbnNlLCBSb3V0ZXIgfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IERvY3VtZW50LCBEb2N1bWVudFF1ZXJ5LCBNb2RlbCwgU2NoZW1hIH0gZnJvbSAnbW9uZ29vc2UnO1xuaW1wb3J0ICogYXMgbG9nIGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IHsgSVZhbGlkYXRpb25FcnJvciwgU2VhcmNoQ3JpdGVyaWEsIElCYXNlTW9kZWwsIElCYXNlTW9kZWxEb2MsIElUb2tlblBheWxvYWQsIElPd25lZCwgSU93bmVyIH0gZnJvbSAnLi4vLi4vbW9kZWxzLyc7XG5pbXBvcnQgeyBPYmplY3RJZCB9IGZyb20gJ2Jzb24nO1xuaW1wb3J0IHsgQmFzZVJlcG9zaXRvcnkgfSBmcm9tIFwiLi4vLi4vcmVwb3NpdG9yaWVzL1wiO1xuaW1wb3J0IHsgQ09OU1QgfSBmcm9tIFwiLi4vLi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBPd25lcnNoaXBUeXBlIH0gZnJvbSBcIi4uLy4uL2VudW1lcmF0aW9uc1wiO1xuaW1wb3J0IHsgQXV0aHogfSBmcm9tIFwiLi4vYXV0aG9yaXphdGlvblwiO1xuaW1wb3J0IHsgQXBpRXJyb3JIYW5kbGVyIH0gZnJvbSBcIi4uLy4uL2FwaS1lcnJvci1oYW5kbGVyXCI7XG5pbXBvcnQgeyBJUXVlcnlSZXNwb25zZSB9IGZyb20gJy4uLy4uL21vZGVscy9xdWVyeS1yZXNwb25zZS5pbnRlcmZhY2UnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZUNvbnRyb2xsZXIge1xuXG4gICAgcHVibGljIGFic3RyYWN0IHJlcG9zaXRvcnk6IEJhc2VSZXBvc2l0b3J5PElCYXNlTW9kZWxEb2M+O1xuICAgIHB1YmxpYyBhYnN0cmFjdCBkZWZhdWx0UG9wdWxhdGlvbkFyZ3VtZW50OiBvYmplY3Q7XG5cbiAgICAvLyBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGJhc2UgY2xhc3Mgd2lsbCB0ZXN0IG93bmVyc2hpcFxuICAgIHB1YmxpYyBhYnN0cmFjdCBpc093bmVyc2hpcFJlcXVpcmVkOiBib29sZWFuO1xuXG4gICAgLy8gRGV0ZXJtaW5lcyB3aGF0IHJvbGVzIG93bmVyc2hpcCB3aWxsIGJlIHRlc3RlZCB3aXRoLiAgTm90IGFsbCByb2xlcyByZXF1aXJlIG93bmVyc2hpcCwgaWUgQWRtaW5zXG4gICAgcHVibGljIGFic3RyYWN0IHJvbGVzUmVxdWlyaW5nT3duZXJzaGlwOiBBcnJheTxzdHJpbmc+O1xuXG4gICAgLy8gSWYgaW1wbGVtZW50ZWQgdGhpcyB3aWxsIGJlIGNhbGxlZCBvbiBkb2N1bWVudCBjcmVhdGlvbi4gIFRoaXMgd2lsbCBhbGxvdyB1cyB0byBhZGQgb3duZXJzaGlwIGF0IGNyZWF0aW9uIHRpbWUuXG4gICAgcHVibGljIGFkZE93bmVyc2hpcHMocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24sIG1vZGVsRG9jOiBJT3duZWQpOiB2b2lkIHtcbiAgICAgICAgbGV0IGN1cnJlbnRUb2tlbjogSVRva2VuUGF5bG9hZCA9IHJlcXVlc3RbQ09OU1QuUkVRVUVTVF9UT0tFTl9MT0NBVElPTl07XG4gICAgICAgIG1vZGVsRG9jLm93bmVycy5wdXNoKHtcbiAgICAgICAgICAgIG93bmVySWQ6IGN1cnJlbnRUb2tlbi51c2VySWQsXG4gICAgICAgICAgICBvd25lcnNoaXBUeXBlOiBPd25lcnNoaXBUeXBlLnVzZXJcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEN1cnJlbnRPd25lcihyZXF1ZXN0OiBSZXF1ZXN0KTogSU93bmVye1xuICAgICAgICBsZXQgY3VycmVudFRva2VuOiBJVG9rZW5QYXlsb2FkID0gcmVxdWVzdFtDT05TVC5SRVFVRVNUX1RPS0VOX0xPQ0FUSU9OXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG93bmVySWQ6IGN1cnJlbnRUb2tlbi51c2VySWQsXG4gICAgICAgICAgICBvd25lcnNoaXBUeXBlOiBPd25lcnNoaXBUeXBlLnVzZXJcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoZSBjaGlsZCBjbGFzc2VzIGltcGxlbWVudGF0aW9uIG9mIG93bmVyc2hpcCB0ZXN0aW5nLiAgQWxsb3dzIGZvciBjaGlsZCBjbGFzc2VzIHRvIHRlc3QgdmFyaW91cyBkYXRhIHBvaW50cy5cbiAgICBwdWJsaWMgaXNPd25lcihyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbiwgZG9jdW1lbnQ6IElPd25lZCk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBXZSdsbCBhc3N1bWUgdGhpcyBpcyBvbmx5IGZvciBDUlVEXG4gICAgICAgIC8vIEdldCB0aGUgY3VycmVudCB0b2tlbiwgc28gd2UgY2FuIGdldCB0aGUgb3duZXJJZCBpbiB0aGlzIGNhc2Ugb3JnYW5pemF0aW9uIGlkIG9mZiBvZiBoZXJlLlxuICAgICAgICBsZXQgY3VycmVudFRva2VuOiBJVG9rZW5QYXlsb2FkID0gcmVxdWVzdFtDT05TVC5SRVFVRVNUX1RPS0VOX0xPQ0FUSU9OXTtcblxuICAgICAgICAvLyBGb3Igbm93IHdlJ3JlIGp1c3QgZ29pbmcgdG8gY2hlY2sgdGhhdCB0aGUgb3duZXJzaGlwIGlzIGFyb3VuZCBvcmdhbml6YXRpb24uXG4gICAgICAgIHJldHVybiB0aGlzLmlzT3duZXJJbk93bmVyc2hpcChkb2N1bWVudCwgY3VycmVudFRva2VuLnVzZXJJZCwgT3duZXJzaGlwVHlwZS51c2VyKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNPd25lckluT3duZXJzaGlwKGRvY3VtZW50OiBJT3duZWQsIG93bmVySWQ6IHN0cmluZywgb3duZXJzaGlwVHlwZTogT3duZXJzaGlwVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaXNPd25lcjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChkb2N1bWVudCAmJiBkb2N1bWVudC5vd25lcnMpIHtcbiAgICAgICAgICAgIGRvY3VtZW50Lm93bmVycy5mb3JFYWNoKGRvY3VtZW50T3duZXJzaGlwRWxlbWVudCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50T3duZXJzaGlwRWxlbWVudC5vd25lcnNoaXBUeXBlID09PSBvd25lcnNoaXBUeXBlXG4gICAgICAgICAgICAgICAgICAgIC8vIE9uZSBvZiB0aGVzZSBpcyBhIGJzb24gaWQgb24gdGhlIGRvY3VtZW50LCB0aGUgb3RoZXIgaXMgYSBzdHJpbmcsIHNvIGRvbid0IHVzZSB0cmlwbGUgZXF1YWxcbiAgICAgICAgICAgICAgICAgICAgJiYgZG9jdW1lbnRPd25lcnNoaXBFbGVtZW50Lm93bmVySWQgPT0gb3duZXJJZCkge1xuICAgICAgICAgICAgICAgICAgICBpc093bmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpc093bmVyO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBpc01vZGlmaWNhdGlvbkFsbG93ZWQocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgLy8gSWYgb3duZXJzaGlwIGlzIHJlcXVpcmVkIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoZSB1c2VyIGhhcyB0aGUgcmlnaHRzIHRvIENSVUQgdGhpcyBpdGVtLlxuICAgICAgICBpZiAodGhpcy5pc093bmVyc2hpcFJlcXVpcmVkXG4gICAgICAgICAgICAmJiB0aGlzLnJvbGVzUmVxdWlyaW5nT3duZXJzaGlwXG4gICAgICAgICAgICAmJiB0aGlzLnJvbGVzUmVxdWlyaW5nT3duZXJzaGlwLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICYmIChyZXF1ZXN0W0NPTlNULlJFUVVFU1RfVE9LRU5fTE9DQVRJT05dIGFzIElUb2tlblBheWxvYWQpXG4gICAgICAgICAgICAmJiAocmVxdWVzdFtDT05TVC5SRVFVRVNUX1RPS0VOX0xPQ0FUSU9OXSBhcyBJVG9rZW5QYXlsb2FkKS5yb2xlc1xuICAgICAgICAgICAgLy8gSXMgdGhlIHVzZXIgYSByb2xlLCB0aGF0IGV4aXN0cyBpbiB0aGUgcm9sZXMgYXJyYXkgdGhhdCByZXF1aXJlcyBhbiBvd25lcnNoaXAgdGVzdC5cbiAgICAgICAgICAgICYmIEF1dGh6LmlzTWF0Y2hCZXR3ZWVuUm9sZUxpc3RzKHRoaXMucm9sZXNSZXF1aXJpbmdPd25lcnNoaXAsIChyZXF1ZXN0W0NPTlNULlJFUVVFU1RfVE9LRU5fTE9DQVRJT05dIGFzIElUb2tlblBheWxvYWQpLnJvbGVzKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZ2V0IHRoZSBkb2N1bWVudCBiZWZvcmUgd2UgY2FuIENSVUQgaXRcbiAgICAgICAgICAgIGxldCBkb2N1bWVudCA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5zaW5nbGUodGhpcy5nZXRJZChyZXF1ZXN0KSk7XG5cbiAgICAgICAgICAgIC8vIFRoZSBmaXJzdCB0aGluZyB3ZSB1c3VhbGx5IGRvIHdoZW5ldmVyIHdlJ3JlIHRyeWluZyB0byB1cGRhdGUsIGVkaXQsIGV0YywgaXMgY2hlY2sgb3duZXJzaGlwLiBcbiAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gdGhyb3cgYSA0MDQgaWYgd2UgZGlkbid0IGZpbmQgdGhlIGRvY3VtZW50IHdoZW4gd2UncmUgY2hlY2tpbmcgb3duZXJzaGlwLlxuICAgICAgICAgICAgaWYgKCFkb2N1bWVudCkgeyB0aHJvdyB7IG1lc3NhZ2U6ICdJdGVtIE5vdCBmb3VuZCcsIHN0YXR1czogNDA0IH07IH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzT3duZXIocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQsIGRvY3VtZW50IGFzIElPd25lZCkpIHtcbiAgICAgICAgICAgICAgICBBcGlFcnJvckhhbmRsZXIuc2VuZEF1dGhGYWlsdXJlKHJlc3BvbnNlLCA0MDMsICdZb3UgYXJlIG5vdCBhbGxvd2VkIHRvIENSVUQgdGhpcyByZXNvdXJjZS4gT3duZXJzaGlwIENoZWNrIGZhaWxlZC4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIGlzQWRtaW4ocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChBdXRoei5pc01hdGNoQmV0d2VlblJvbGVMaXN0cyhbQ09OU1QuQURNSU5fUk9MRV0sIChyZXF1ZXN0W0NPTlNULlJFUVVFU1RfVE9LRU5fTE9DQVRJT05dIGFzIElUb2tlblBheWxvYWQpLnJvbGVzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBBcGlFcnJvckhhbmRsZXIuc2VuZEF1dGhGYWlsdXJlKHJlc3BvbnNlLCA0MDMsICdPbmx5IEFkbWlucyBjYW4gZXhlY3V0ZSB0aGlzIG9wZXJhdGlvbicpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGlzVmFsaWQobW9kZWw6IElCYXNlTW9kZWxEb2MpOiBQcm9taXNlPElWYWxpZGF0aW9uRXJyb3JbXT4ge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgcHVibGljIGFzeW5jIHByZUNyZWF0ZUhvb2sobW9kZWw6IElCYXNlTW9kZWxEb2MpOiBQcm9taXNlPElCYXNlTW9kZWxEb2M+IHtcbiAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBwcmVVcGRhdGVIb29rKG1vZGVsOiBJQmFzZU1vZGVsRG9jKTogUHJvbWlzZTxJQmFzZU1vZGVsRG9jPiB7XG4gICAgICAgIHJldHVybiBtb2RlbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdXBkYXRlVmFsaWRhdGlvbihtb2RlbDogSUJhc2VNb2RlbERvYykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0SWQocmVxdWVzdDogUmVxdWVzdCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0ICYmIHJlcXVlc3QucGFyYW1zID8gcmVxdWVzdC5wYXJhbXNbJ2lkJ10gOiBudWxsO1xuICAgIH1cblxuICAgIHB1YmxpYyBibGFuayhyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbik6IHZvaWQge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNBZG1pbihyZXF1ZXN0LCByZXNwb25zZSkpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS5qc29uKHRoaXMucmVwb3NpdG9yeS5ibGFuaygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IG5leHQoZXJyKTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyB1dGlsaXR5KHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0FkbWluKHJlcXVlc3QsIHJlc3BvbnNlKSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmpzb24oe30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpOyB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlc3BvbmRXaXRoVmFsaWRhdGlvbkVycm9ycyhyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbiwgdmFsaWRhdGlvbkVycm9yczogSVZhbGlkYXRpb25FcnJvcltdKTogdm9pZCB7XG4gICAgICAgIHJlc3BvbnNlLnN0YXR1cyg0MTIpLmpzb24oe1xuICAgICAgICAgICAgdmFsaWRhdGlvbkVycm9yOiAnWW91ciBJdGVtIGRpZCBub3QgcGFzcyB2YWxpZGF0aW9uJyxcbiAgICAgICAgICAgIHZhbGlkYXRpb25FcnJvcnM6IHZhbGlkYXRpb25FcnJvcnNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHF1ZXJ5PFQgZXh0ZW5kcyBJQmFzZU1vZGVsRG9jPihyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbik6IFByb21pc2U8SVF1ZXJ5UmVzcG9uc2U8VD4+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWFyY2hDcml0ZXJpYSA9IG5ldyBTZWFyY2hDcml0ZXJpYShyZXF1ZXN0LCBuZXh0KTtcblxuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGdvaW5nIHRvIHF1ZXJ5IGZvciB0aGUgbW9kZWxzLlxuICAgICAgICAgICAgICAgIGxldCBtb2RlbHM6IFRbXSA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5xdWVyeShyZXF1ZXN0LmJvZHksIHRoaXMuZGVmYXVsdFBvcHVsYXRpb25Bcmd1bWVudCwgc2VhcmNoQ3JpdGVyaWEpIGFzIFRbXTtcblxuICAgICAgICAgICAgICAgIC8vIEEgcGFnZXIgd2lsbCBuZWVkIHRvIGtub3cgdGhlIHRvdGFsIGNvdW50IG9mIG1vZGVscywgYmFzZWQgb24gdGhlIHNlYXJjaCBwYXJhbWV0ZXJzLiAgXG4gICAgICAgICAgICAgICAgbGV0IHRvdGFsQ291bnQgPSBhd2FpdCB0aGlzLnJlcG9zaXRvcnkuc2VhcmNoaW5nQ291bnQocmVxdWVzdC5ib2R5KTtcblxuICAgICAgICAgICAgICAgIGxldCBxdWVyeVJlc3BvbnNlOiBJUXVlcnlSZXNwb25zZTxUPiA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogbW9kZWxzLFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0OiBzZWFyY2hDcml0ZXJpYS5saW1pdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNraXA6IHNlYXJjaENyaXRlcmlhLnNraXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogdG90YWxDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNwb25zZS5qc29uKHF1ZXJ5UmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgbG9nLmluZm8oYFF1ZXJpZWQgZm9yOiAke3RoaXMucmVwb3NpdG9yeS5nZXRDb2xsZWN0aW9uTmFtZSgpfSwgRm91bmQ6ICR7bW9kZWxzLmxlbmd0aH1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcXVlcnlSZXNwb25zZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IG5leHQoZXJyKTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjbGVhcihyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNBZG1pbihyZXF1ZXN0LCByZXNwb25zZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmVmb3JlOiBudW1iZXIgPSBhd2FpdCB0aGlzLnJlcG9zaXRvcnkuY291bnQobmV3IFNlYXJjaENyaXRlcmlhKHJlcXVlc3QsIG5leHQpKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnJlcG9zaXRvcnkuY2xlYXIocmVxdWVzdC5ib2R5KTtcbiAgICAgICAgICAgICAgICBsZXQgYWZ0ZXI6IG51bWJlciA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5jb3VudChuZXcgU2VhcmNoQ3JpdGVyaWEocmVxdWVzdCwgbmV4dCkpO1xuXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuanNvbih7XG4gICAgICAgICAgICAgICAgICAgIENvbGxlY3Rpb246IHRoaXMucmVwb3NpdG9yeS5nZXRDb2xsZWN0aW9uTmFtZSgpLFxuICAgICAgICAgICAgICAgICAgICBNZXNzYWdlOiAnQWxsIGl0ZW1zIGNsZWFyZWQgZnJvbSBjb2xsZWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgQ291bnRPZkl0ZW1zUmVtb3ZlZDogYmVmb3JlIC0gYWZ0ZXJcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGxvZy5pbmZvKGBDbGVhcmVkIHRoZSBlbnRpcmUgY29sbGVjdGlvbjogJHt0aGlzLnJlcG9zaXRvcnkuZ2V0Q29sbGVjdGlvbk5hbWUoKX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IG5leHQoZXJyKTsgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBwcmVEZXN0cm95SG9vayhyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbiwgZG9jOiBJQmFzZU1vZGVsRG9jKTogUHJvbWlzZTxJQmFzZU1vZGVsRG9jPntcbiAgICAgICAgcmV0dXJuIGRvYztcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgZGVzdHJveShyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbiwgc2VuZFJlc3BvbnNlOiBib29sZWFuID0gdHJ1ZSk6IFByb21pc2U8SUJhc2VNb2RlbERvYz4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGF3YWl0IHRoaXMuaXNNb2RpZmljYXRpb25BbGxvd2VkKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0KSkge1xuICAgICAgICAgICAgICAgIC8vIEJlZm9yZSB3ZSBkZXN0cm95LCB3ZSB3YW50IG91ciBjb250cm9sbGVycyB0byBoYXZlIHRoZSBvcHBvcnR1bml0eSB0byBjbGVhbnVwIGFueSByZWxhdGVkIGRhdGEuXG4gICAgICAgICAgICAgICAgY29uc3QgZG9jID0gYXdhaXQgdGhpcy5yZXBvc2l0b3J5LnNpbmdsZSh0aGlzLmdldElkKHJlcXVlc3QpKTtcblxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucHJlRGVzdHJveUhvb2socmVxdWVzdCxyZXNwb25zZSxuZXh0LGRvYyk7XG5cbiAgICAgICAgICAgICAgICBsZXQgZGVsZXRlZE1vZGVsID0gYXdhaXQgdGhpcy5yZXBvc2l0b3J5LmRlc3Ryb3kodGhpcy5nZXRJZChyZXF1ZXN0KSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWRlbGV0ZWRNb2RlbCkgeyB0aHJvdyB7IG1lc3NhZ2U6IFwiSXRlbSBOb3QgRm91bmRcIiwgc3RhdHVzOiA0MDQgfTsgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5qc29uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEl0ZW1SZW1vdmVkSWQ6IGRlbGV0ZWRNb2RlbC5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIEl0ZW1SZW1vdmVkOiBkZWxldGVkTW9kZWwsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxvZy5pbmZvKGBSZW1vdmVkIGE6ICR7dGhpcy5yZXBvc2l0b3J5LmdldENvbGxlY3Rpb25OYW1lKCl9LCBJRDogJHt0aGlzLmdldElkKHJlcXVlc3QpfWApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlbGV0ZWRNb2RlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IG5leHQoZXJyKTsgfVxuICAgIH1cblxuICAgIC8vVXBkYXRlIGZ1bGwgLyBwYXJ0aWFsLCBpcyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHB1dCBhbmQgcGF0Y2guXG4gICAgcHVibGljIHVwZGF0ZUZ1bGwocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPElCYXNlTW9kZWxEb2MgfCB2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZShyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIHVwZGF0ZVBhcnRpYWwocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPElCYXNlTW9kZWxEb2MgfCB2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnVwZGF0ZShyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCwgZmFsc2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyB1cGRhdGUocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24sIGlzRnVsbDogYm9vbGVhbik6IFByb21pc2U8SUJhc2VNb2RlbERvYz4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGF3YWl0IHRoaXMuaXNNb2RpZmljYXRpb25BbGxvd2VkKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0KSkge1xuXG4gICAgICAgICAgICAgICAgbGV0IG1vZGVsID0gYXdhaXQgdGhpcy5wcmVVcGRhdGVIb29rKHRoaXMucmVwb3NpdG9yeS5jcmVhdGVGcm9tQm9keShyZXF1ZXN0LmJvZHkpKTtcblxuICAgICAgICAgICAgICAgIC8vSSB0aGluayB2YWxpZGF0aW9uIHdpbGwgYnJlYWsgb24gcGFydGlhbCB1cGRhdGVzLiAgU29tZXRoaW5nIHRvIGxvb2sgZm9yLlxuICAgICAgICAgICAgICAgIGxldCB2YWxpZGF0aW9uRXJyb3JzID0gYXdhaXQgdGhpcy5pc1ZhbGlkKG1vZGVsKTtcblxuICAgICAgICAgICAgICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzICYmIHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3BvbmRXaXRoVmFsaWRhdGlvbkVycm9ycyhyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCwgdmFsaWRhdGlvbkVycm9ycyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIG5vdGljZSB0aGF0IHdlJ3JlIHVzaW5nIHRoZSByZXF1ZXN0IGJvZHkgaW4gdGhlIHNldCBvcGVyYXRpb24gTk9UIHRoZSBpdGVtIGFmdGVyIHRoZSBwcmUgdXBkYXRlIGhvb2suXG4gICAgICAgICAgICAgICAgbGV0IHVwZGF0ZUJvZHk6IGFueTtcbiAgICAgICAgICAgICAgICBpZiAoaXNGdWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGhlcmUgd2UgaGF2ZSBhIGZ1bGwgZG9jdW1lbnQsIHNvIHdlIGRvbid0IG5lZWQgdGhlIHNldCBvcGVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQm9keSA9IG1vZGVsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaGVyZSBzb21lb25lIG9ubHkgcGFzc2VkIGluIGEgZmV3IGZpZWxkcywgc28gd2UgdXNlIHRoZSBzZXQgb3BlcmF0aW9uIHRvIG9ubHkgY2hhbmdlIHRoZSBmaWVsZHMgdGhhdCB3ZXJlIHBhc3NlZCBpbi5cbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQm9keSA9IHsgJHNldDogcmVxdWVzdC5ib2R5IH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtb2RlbCA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS51cGRhdGUodGhpcy5nZXRJZChyZXF1ZXN0KSwgdXBkYXRlQm9keSk7XG4gICAgICAgICAgICAgICAgaWYgKCFtb2RlbCkgeyB0aHJvdyB7IG1lc3NhZ2U6ICdJdGVtIE5vdCBmb3VuZCcsIHN0YXR1czogNDA0IH07IH1cblxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnN0YXR1cygyMDIpLmpzb24obW9kZWwpO1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKGBVcGRhdGVkIGE6ICR7dGhpcy5yZXBvc2l0b3J5LmdldENvbGxlY3Rpb25OYW1lKCl9LCBJRDogJHttb2RlbC5faWR9YCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgY3JlYXRlKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uLCBzZW5kUmVzcG9uc2U6IGJvb2xlYW4gPSB0cnVlKTogUHJvbWlzZTxJQmFzZU1vZGVsRG9jPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgbW9kZWwgPSBhd2FpdCB0aGlzLnByZUNyZWF0ZUhvb2sodGhpcy5yZXBvc2l0b3J5LmNyZWF0ZUZyb21Cb2R5KHJlcXVlc3QuYm9keSkpO1xuXG4gICAgICAgICAgICBsZXQgdmFsaWRhdGlvbkVycm9ycyA9IGF3YWl0IHRoaXMuaXNWYWxpZChtb2RlbCk7XG5cbiAgICAgICAgICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzICYmIHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVzcG9uZFdpdGhWYWxpZGF0aW9uRXJyb3JzKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0LCB2YWxpZGF0aW9uRXJyb3JzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5hZGRPd25lcnNoaXBzKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0LCBtb2RlbCBhcyBJT3duZWQpO1xuXG4gICAgICAgICAgICBtb2RlbCA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5jcmVhdGUobW9kZWwpO1xuXG4gICAgICAgICAgICBpZiAoc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2Uuc3RhdHVzKDIwMSkuanNvbihtb2RlbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZy5pbmZvKGBDcmVhdGVkIE5ldzogJHt0aGlzLnJlcG9zaXRvcnkuZ2V0Q29sbGVjdGlvbk5hbWUoKX0sIElEOiAke21vZGVsLl9pZH1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgY291bnQocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaENyaXRlcmlhID0gbmV3IFNlYXJjaENyaXRlcmlhKHJlcXVlc3QsIG5leHQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvdW50OiBudW1iZXIgPSBhd2FpdCB0aGlzLnJlcG9zaXRvcnkuY291bnQoc2VhcmNoQ3JpdGVyaWEpO1xuXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuanNvbih7XG4gICAgICAgICAgICAgICAgICAgIENvbGxlY3Rpb25OYW1lOiB0aGlzLnJlcG9zaXRvcnkuZ2V0Q29sbGVjdGlvbk5hbWUoKSxcbiAgICAgICAgICAgICAgICAgICAgQ29sbGVjdGlvbkNvdW50OiBjb3VudCxcbiAgICAgICAgICAgICAgICAgICAgU2VhcmNoQ3JpdGVyaWE6IHNlYXJjaENyaXRlcmlhLmNyaXRlcmlhLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbG9nLmluZm8oYEV4ZWN1dGVkIENvdW50IE9wZXJhdGlvbjogJHt0aGlzLnJlcG9zaXRvcnkuZ2V0Q29sbGVjdGlvbk5hbWUoKX0sIENvdW50OiAke2NvdW50fWApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpIH1cblxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBsaXN0KHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKTogUHJvbWlzZTxJQmFzZU1vZGVsRG9jW10+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgbW9kZWxzOiBJQmFzZU1vZGVsRG9jW10gPSBhd2FpdCB0aGlzLnJlcG9zaXRvcnkubGlzdChuZXcgU2VhcmNoQ3JpdGVyaWEocmVxdWVzdCwgbmV4dCksIHRoaXMuZGVmYXVsdFBvcHVsYXRpb25Bcmd1bWVudCk7XG5cbiAgICAgICAgICAgICAgICByZXNwb25zZS5qc29uKG1vZGVscyk7XG5cbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhgRXhlY3V0ZWQgTGlzdCBPcGVyYXRpb246ICR7dGhpcy5yZXBvc2l0b3J5LmdldENvbGxlY3Rpb25OYW1lKCl9LCBDb3VudDogJHttb2RlbHMubGVuZ3RofWApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVscztcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IG5leHQoZXJyKSB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGxpc3RCeU93bmVyKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKTogUHJvbWlzZTxJQmFzZU1vZGVsRG9jW10+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgbW9kZWxzOiBJQmFzZU1vZGVsRG9jW10gPSBhd2FpdCB0aGlzLnJlcG9zaXRvcnkubGlzdEJ5T3duZXIobmV3IFNlYXJjaENyaXRlcmlhKHJlcXVlc3QsIG5leHQpLCB0aGlzLmdldEN1cnJlbnRPd25lcihyZXF1ZXN0KSwgdGhpcy5kZWZhdWx0UG9wdWxhdGlvbkFyZ3VtZW50KTtcblxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmpzb24obW9kZWxzKTtcblxuICAgICAgICAgICAgICAgIGxvZy5pbmZvKGBFeGVjdXRlZCBMaXN0IE9wZXJhdGlvbjogJHt0aGlzLnJlcG9zaXRvcnkuZ2V0Q29sbGVjdGlvbk5hbWUoKX0sIENvdW50OiAke21vZGVscy5sZW5ndGh9YCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWxzO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2luZ2xlKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKTogUHJvbWlzZTxJQmFzZU1vZGVsRG9jPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IG1vZGVsOiBJQmFzZU1vZGVsRG9jID0gYXdhaXQgdGhpcy5yZXBvc2l0b3J5LnNpbmdsZSh0aGlzLmdldElkKHJlcXVlc3QpLCB0aGlzLmRlZmF1bHRQb3B1bGF0aW9uQXJndW1lbnQpO1xuICAgICAgICAgICAgICAgIGlmICghbW9kZWwpXG4gICAgICAgICAgICAgICAgICAgIHRocm93ICh7IG1lc3NhZ2U6ICdJdGVtIE5vdCBGb3VuZCcsIHN0YXR1czogNDA0IH0pO1xuXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuanNvbihtb2RlbCk7XG5cbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhgRXhlY3V0ZWQgU2luZ2xlIE9wZXJhdGlvbjogJHt0aGlzLnJlcG9zaXRvcnkuZ2V0Q29sbGVjdGlvbk5hbWUoKX0sIGl0ZW0uX2lkOiAke21vZGVsLl9pZH1gKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IG5leHQoZXJyKSB9XG4gICAgfVxufSJdfQ==
