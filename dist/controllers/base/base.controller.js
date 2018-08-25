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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL2NvbnRyb2xsZXJzL2Jhc2UvYmFzZS5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFQSwrQkFBK0I7QUFDL0Isb0NBQXNJO0FBR3RJLCtDQUF3QztBQUN4QyxxREFBbUQ7QUFDbkQsb0RBQXlDO0FBQ3pDLCtEQUEwRDtBQUcxRDtJQVdJLGtIQUFrSDtJQUMzRyxhQUFhLENBQUMsT0FBZ0IsRUFBRSxRQUFrQixFQUFFLElBQWtCLEVBQUUsUUFBZ0I7UUFDM0YsSUFBSSxZQUFZLEdBQWtCLE9BQU8sQ0FBQyxpQkFBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDeEUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDakIsT0FBTyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQzVCLGFBQWEsRUFBRSw0QkFBYSxDQUFDLElBQUk7U0FDcEMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLGVBQWUsQ0FBQyxPQUFnQjtRQUNuQyxJQUFJLFlBQVksR0FBa0IsT0FBTyxDQUFDLGlCQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUN4RSxNQUFNLENBQUM7WUFDSCxPQUFPLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDNUIsYUFBYSxFQUFFLDRCQUFhLENBQUMsSUFBSTtTQUNwQyxDQUFBO0lBQ0wsQ0FBQztJQUVELGdIQUFnSDtJQUN6RyxPQUFPLENBQUMsT0FBZ0IsRUFBRSxRQUFrQixFQUFFLElBQWtCLEVBQUUsUUFBZ0I7UUFDckYscUNBQXFDO1FBQ3JDLDZGQUE2RjtRQUM3RixJQUFJLFlBQVksR0FBa0IsT0FBTyxDQUFDLGlCQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUV4RSwrRUFBK0U7UUFDL0UsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLE1BQU0sRUFBRSw0QkFB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QUMsOEJBQThCLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsZUFBZSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFFdEcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNyQixDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7WUFBQyxDQUFDO1FBQy9CLENBQUM7S0FBQTtDQUNKO0FBelVELHdDQXlVQyIsImZpbGUiOiJjb250cm9sbGVycy9iYXNlL2Jhc2UuY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRGdW5jdGlvbiwgUmVxdWVzdCwgUmVxdWVzdEhhbmRsZXIsIFJlcXVlc3RQYXJhbUhhbmRsZXIsIFJlc3BvbnNlLCBSb3V0ZXIgfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IERvY3VtZW50LCBEb2N1bWVudFF1ZXJ5LCBNb2RlbCwgU2NoZW1hIH0gZnJvbSAnbW9uZ29vc2UnO1xuaW1wb3J0ICogYXMgbG9nIGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IHsgSVZhbGlkYXRpb25FcnJvciwgU2VhcmNoQ3JpdGVyaWEsIElCYXNlTW9kZWwsIElCYXNlTW9kZWxEb2MsIElUb2tlblBheWxvYWQsIElPd25lZCwgSUxpa2VhYmxlLCBJT3duZXIgfSBmcm9tICcuLi8uLi9tb2RlbHMvJztcbmltcG9ydCB7IE9iamVjdElkIH0gZnJvbSAnYnNvbic7XG5pbXBvcnQgeyBCYXNlUmVwb3NpdG9yeSB9IGZyb20gXCIuLi8uLi9yZXBvc2l0b3JpZXMvXCI7XG5pbXBvcnQgeyBDT05TVCB9IGZyb20gXCIuLi8uLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IE93bmVyc2hpcFR5cGUgfSBmcm9tIFwiLi4vLi4vZW51bWVyYXRpb25zXCI7XG5pbXBvcnQgeyBBdXRoeiB9IGZyb20gXCIuLi9hdXRob3JpemF0aW9uXCI7XG5pbXBvcnQgeyBBcGlFcnJvckhhbmRsZXIgfSBmcm9tIFwiLi4vLi4vYXBpLWVycm9yLWhhbmRsZXJcIjtcbmltcG9ydCB7IElRdWVyeVJlc3BvbnNlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3F1ZXJ5LXJlc3BvbnNlLmludGVyZmFjZSc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlQ29udHJvbGxlciB7XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgcmVwb3NpdG9yeTogQmFzZVJlcG9zaXRvcnk8SUJhc2VNb2RlbERvYz47XG4gICAgcHVibGljIGFic3RyYWN0IGRlZmF1bHRQb3B1bGF0aW9uQXJndW1lbnQ6IG9iamVjdDtcblxuICAgIC8vIERldGVybWluZXMgd2hldGhlciB0aGUgYmFzZSBjbGFzcyB3aWxsIHRlc3Qgb3duZXJzaGlwXG4gICAgcHVibGljIGFic3RyYWN0IGlzT3duZXJzaGlwUmVxdWlyZWQ6IGJvb2xlYW47XG5cbiAgICAvLyBEZXRlcm1pbmVzIHdoYXQgcm9sZXMgb3duZXJzaGlwIHdpbGwgYmUgdGVzdGVkIHdpdGguICBOb3QgYWxsIHJvbGVzIHJlcXVpcmUgb3duZXJzaGlwLCBpZSBBZG1pbnNcbiAgICBwdWJsaWMgYWJzdHJhY3Qgcm9sZXNSZXF1aXJpbmdPd25lcnNoaXA6IEFycmF5PHN0cmluZz47XG5cbiAgICAvLyBJZiBpbXBsZW1lbnRlZCB0aGlzIHdpbGwgYmUgY2FsbGVkIG9uIGRvY3VtZW50IGNyZWF0aW9uLiAgVGhpcyB3aWxsIGFsbG93IHVzIHRvIGFkZCBvd25lcnNoaXAgYXQgY3JlYXRpb24gdGltZS5cbiAgICBwdWJsaWMgYWRkT3duZXJzaGlwcyhyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbiwgbW9kZWxEb2M6IElPd25lZCk6IHZvaWQge1xuICAgICAgICBsZXQgY3VycmVudFRva2VuOiBJVG9rZW5QYXlsb2FkID0gcmVxdWVzdFtDT05TVC5SRVFVRVNUX1RPS0VOX0xPQ0FUSU9OXTtcbiAgICAgICAgbW9kZWxEb2Mub3duZXJzLnB1c2goe1xuICAgICAgICAgICAgb3duZXJJZDogY3VycmVudFRva2VuLnVzZXJJZCxcbiAgICAgICAgICAgIG93bmVyc2hpcFR5cGU6IE93bmVyc2hpcFR5cGUudXNlclxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q3VycmVudE93bmVyKHJlcXVlc3Q6IFJlcXVlc3QpOiBJT3duZXJ7XG4gICAgICAgIGxldCBjdXJyZW50VG9rZW46IElUb2tlblBheWxvYWQgPSByZXF1ZXN0W0NPTlNULlJFUVVFU1RfVE9LRU5fTE9DQVRJT05dO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb3duZXJJZDogY3VycmVudFRva2VuLnVzZXJJZCxcbiAgICAgICAgICAgIG93bmVyc2hpcFR5cGU6IE93bmVyc2hpcFR5cGUudXNlclxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhlIGNoaWxkIGNsYXNzZXMgaW1wbGVtZW50YXRpb24gb2Ygb3duZXJzaGlwIHRlc3RpbmcuICBBbGxvd3MgZm9yIGNoaWxkIGNsYXNzZXMgdG8gdGVzdCB2YXJpb3VzIGRhdGEgcG9pbnRzLlxuICAgIHB1YmxpYyBpc093bmVyKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uLCBkb2N1bWVudDogSU93bmVkKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIFdlJ2xsIGFzc3VtZSB0aGlzIGlzIG9ubHkgZm9yIENSVURcbiAgICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHRva2VuLCBzbyB3ZSBjYW4gZ2V0IHRoZSBvd25lcklkIGluIHRoaXMgY2FzZSBvcmdhbml6YXRpb24gaWQgb2ZmIG9mIGhlcmUuXG4gICAgICAgIGxldCBjdXJyZW50VG9rZW46IElUb2tlblBheWxvYWQgPSByZXF1ZXN0W0NPTlNULlJFUVVFU1RfVE9LRU5fTE9DQVRJT05dO1xuXG4gICAgICAgIC8vIEZvciBub3cgd2UncmUganVzdCBnb2luZyB0byBjaGVjayB0aGF0IHRoZSBvd25lcnNoaXAgaXMgYXJvdW5kIG9yZ2FuaXphdGlvbi5cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNPd25lckluT3duZXJzaGlwKGRvY3VtZW50LCBjdXJyZW50VG9rZW4udXNlcklkLCBPd25lcnNoaXBUeXBlLnVzZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc093bmVySW5Pd25lcnNoaXAoZG9jdW1lbnQ6IElPd25lZCwgb3duZXJJZDogc3RyaW5nLCBvd25lcnNoaXBUeXBlOiBPd25lcnNoaXBUeXBlKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpc093bmVyOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKGRvY3VtZW50ICYmIGRvY3VtZW50Lm93bmVycykge1xuICAgICAgICAgICAgZG9jdW1lbnQub3duZXJzLmZvckVhY2goZG9jdW1lbnRPd25lcnNoaXBFbGVtZW50ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnRPd25lcnNoaXBFbGVtZW50Lm93bmVyc2hpcFR5cGUgPT09IG93bmVyc2hpcFR5cGVcbiAgICAgICAgICAgICAgICAgICAgLy8gT25lIG9mIHRoZXNlIGlzIGEgYnNvbiBpZCBvbiB0aGUgZG9jdW1lbnQsIHRoZSBvdGhlciBpcyBhIHN0cmluZywgc28gZG9uJ3QgdXNlIHRyaXBsZSBlcXVhbFxuICAgICAgICAgICAgICAgICAgICAmJiBkb2N1bWVudE93bmVyc2hpcEVsZW1lbnQub3duZXJJZCA9PSBvd25lcklkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzT3duZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGlzT3duZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGlzTW9kaWZpY2F0aW9uQWxsb3dlZChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICAvLyBJZiBvd25lcnNoaXAgaXMgcmVxdWlyZWQgd2UgbmVlZCB0byBtYWtlIHN1cmUgdGhlIHVzZXIgaGFzIHRoZSByaWdodHMgdG8gQ1JVRCB0aGlzIGl0ZW0uXG4gICAgICAgIGlmICh0aGlzLmlzT3duZXJzaGlwUmVxdWlyZWRcbiAgICAgICAgICAgICYmIHRoaXMucm9sZXNSZXF1aXJpbmdPd25lcnNoaXBcbiAgICAgICAgICAgICYmIHRoaXMucm9sZXNSZXF1aXJpbmdPd25lcnNoaXAubGVuZ3RoID4gMFxuICAgICAgICAgICAgJiYgKHJlcXVlc3RbQ09OU1QuUkVRVUVTVF9UT0tFTl9MT0NBVElPTl0gYXMgSVRva2VuUGF5bG9hZClcbiAgICAgICAgICAgICYmIChyZXF1ZXN0W0NPTlNULlJFUVVFU1RfVE9LRU5fTE9DQVRJT05dIGFzIElUb2tlblBheWxvYWQpLnJvbGVzXG4gICAgICAgICAgICAvLyBJcyB0aGUgdXNlciBhIHJvbGUsIHRoYXQgZXhpc3RzIGluIHRoZSByb2xlcyBhcnJheSB0aGF0IHJlcXVpcmVzIGFuIG93bmVyc2hpcCB0ZXN0LlxuICAgICAgICAgICAgJiYgQXV0aHouaXNNYXRjaEJldHdlZW5Sb2xlTGlzdHModGhpcy5yb2xlc1JlcXVpcmluZ093bmVyc2hpcCwgKHJlcXVlc3RbQ09OU1QuUkVRVUVTVF9UT0tFTl9MT0NBVElPTl0gYXMgSVRva2VuUGF5bG9hZCkucm9sZXMpXG4gICAgICAgICkge1xuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBnZXQgdGhlIGRvY3VtZW50IGJlZm9yZSB3ZSBjYW4gQ1JVRCBpdFxuICAgICAgICAgICAgbGV0IGRvY3VtZW50ID0gYXdhaXQgdGhpcy5yZXBvc2l0b3J5LnNpbmdsZSh0aGlzLmdldElkKHJlcXVlc3QpKTtcblxuICAgICAgICAgICAgLy8gVGhlIGZpcnN0IHRoaW5nIHdlIHVzdWFsbHkgZG8gd2hlbmV2ZXIgd2UncmUgdHJ5aW5nIHRvIHVwZGF0ZSwgZWRpdCwgZXRjLCBpcyBjaGVjayBvd25lcnNoaXAuIFxuICAgICAgICAgICAgLy8gd2UgbmVlZCB0byB0aHJvdyBhIDQwNCBpZiB3ZSBkaWRuJ3QgZmluZCB0aGUgZG9jdW1lbnQgd2hlbiB3ZSdyZSBjaGVja2luZyBvd25lcnNoaXAuXG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50KSB7IHRocm93IHsgbWVzc2FnZTogJ0l0ZW0gTm90IGZvdW5kJywgc3RhdHVzOiA0MDQgfTsgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNPd25lcihyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCwgZG9jdW1lbnQgYXMgSU93bmVkKSkge1xuICAgICAgICAgICAgICAgIEFwaUVycm9ySGFuZGxlci5zZW5kQXV0aEZhaWx1cmUocmVzcG9uc2UsIDQwMywgJ1lvdSBhcmUgbm90IGFsbG93ZWQgdG8gQ1JVRCB0aGlzIHJlc291cmNlLiBPd25lcnNoaXAgQ2hlY2sgZmFpbGVkLicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNBZG1pbihyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UpIHtcbiAgICAgICAgaWYgKEF1dGh6LmlzTWF0Y2hCZXR3ZWVuUm9sZUxpc3RzKFtDT05TVC5BRE1JTl9ST0xFXSwgKHJlcXVlc3RbQ09OU1QuUkVRVUVTVF9UT0tFTl9MT0NBVElPTl0gYXMgSVRva2VuUGF5bG9hZCkucm9sZXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIEFwaUVycm9ySGFuZGxlci5zZW5kQXV0aEZhaWx1cmUocmVzcG9uc2UsIDQwMywgJ09ubHkgQWRtaW5zIGNhbiBleGVjdXRlIHRoaXMgb3BlcmF0aW9uJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgaXNWYWxpZChtb2RlbDogSUJhc2VNb2RlbERvYyk6IFByb21pc2U8SVZhbGlkYXRpb25FcnJvcltdPiB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICBwdWJsaWMgYXN5bmMgcHJlQ3JlYXRlSG9vayhtb2RlbDogSUJhc2VNb2RlbERvYyk6IFByb21pc2U8SUJhc2VNb2RlbERvYz4ge1xuICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHByZVVwZGF0ZUhvb2sobW9kZWw6IElCYXNlTW9kZWxEb2MpOiBQcm9taXNlPElCYXNlTW9kZWxEb2M+IHtcbiAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyB1cGRhdGVWYWxpZGF0aW9uKG1vZGVsOiBJQmFzZU1vZGVsRG9jKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRJZChyZXF1ZXN0OiBSZXF1ZXN0KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QgJiYgcmVxdWVzdC5wYXJhbXMgPyByZXF1ZXN0LnBhcmFtc1snaWQnXSA6IG51bGw7XG4gICAgfVxuXG4gICAgcHVibGljIGJsYW5rKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0FkbWluKHJlcXVlc3QsIHJlc3BvbnNlKSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmpzb24odGhpcy5yZXBvc2l0b3J5LmJsYW5rKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpOyB9XG4gICAgfVxuXG4gICAgcHVibGljIHV0aWxpdHkocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQWRtaW4ocmVxdWVzdCwgcmVzcG9uc2UpKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuanNvbih7fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikgeyBuZXh0KGVycik7IH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzcG9uZFdpdGhWYWxpZGF0aW9uRXJyb3JzKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uLCB2YWxpZGF0aW9uRXJyb3JzOiBJVmFsaWRhdGlvbkVycm9yW10pOiB2b2lkIHtcbiAgICAgICAgcmVzcG9uc2Uuc3RhdHVzKDQxMikuanNvbih7XG4gICAgICAgICAgICB2YWxpZGF0aW9uRXJyb3I6ICdZb3VyIEl0ZW0gZGlkIG5vdCBwYXNzIHZhbGlkYXRpb24nLFxuICAgICAgICAgICAgdmFsaWRhdGlvbkVycm9yczogdmFsaWRhdGlvbkVycm9yc1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcXVlcnk8VCBleHRlbmRzIElCYXNlTW9kZWxEb2M+KHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKTogUHJvbWlzZTxJUXVlcnlSZXNwb25zZTxUPj4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaENyaXRlcmlhID0gbmV3IFNlYXJjaENyaXRlcmlhKHJlcXVlc3QsIG5leHQpO1xuXG4gICAgICAgICAgICAgICAgLy8gV2UncmUgZ29pbmcgdG8gcXVlcnkgZm9yIHRoZSBtb2RlbHMuXG4gICAgICAgICAgICAgICAgbGV0IG1vZGVsczogVFtdID0gYXdhaXQgdGhpcy5yZXBvc2l0b3J5LnF1ZXJ5KHJlcXVlc3QuYm9keSwgdGhpcy5kZWZhdWx0UG9wdWxhdGlvbkFyZ3VtZW50LCBzZWFyY2hDcml0ZXJpYSkgYXMgVFtdO1xuXG4gICAgICAgICAgICAgICAgLy8gQSBwYWdlciB3aWxsIG5lZWQgdG8ga25vdyB0aGUgdG90YWwgY291bnQgb2YgbW9kZWxzLCBiYXNlZCBvbiB0aGUgc2VhcmNoIHBhcmFtZXRlcnMuICBcbiAgICAgICAgICAgICAgICBsZXQgdG90YWxDb3VudCA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5zZWFyY2hpbmdDb3VudChyZXF1ZXN0LmJvZHkpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHF1ZXJ5UmVzcG9uc2U6IElRdWVyeVJlc3BvbnNlPFQ+ID0ge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzOiBtb2RlbHMsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGltaXQ6IHNlYXJjaENyaXRlcmlhLmxpbWl0LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2tpcDogc2VhcmNoQ3JpdGVyaWEuc2tpcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiB0b3RhbENvdW50LFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmpzb24ocXVlcnlSZXNwb25zZSk7XG5cbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhgUXVlcmllZCBmb3I6ICR7dGhpcy5yZXBvc2l0b3J5LmdldENvbGxlY3Rpb25OYW1lKCl9LCBGb3VuZDogJHttb2RlbHMubGVuZ3RofWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBxdWVyeVJlc3BvbnNlO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpOyB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGNsZWFyKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0FkbWluKHJlcXVlc3QsIHJlc3BvbnNlKSkge1xuICAgICAgICAgICAgICAgIGxldCBiZWZvcmU6IG51bWJlciA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5jb3VudChuZXcgU2VhcmNoQ3JpdGVyaWEocmVxdWVzdCwgbmV4dCkpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucmVwb3NpdG9yeS5jbGVhcihyZXF1ZXN0LmJvZHkpO1xuICAgICAgICAgICAgICAgIGxldCBhZnRlcjogbnVtYmVyID0gYXdhaXQgdGhpcy5yZXBvc2l0b3J5LmNvdW50KG5ldyBTZWFyY2hDcml0ZXJpYShyZXF1ZXN0LCBuZXh0KSk7XG5cbiAgICAgICAgICAgICAgICByZXNwb25zZS5qc29uKHtcbiAgICAgICAgICAgICAgICAgICAgQ29sbGVjdGlvbjogdGhpcy5yZXBvc2l0b3J5LmdldENvbGxlY3Rpb25OYW1lKCksXG4gICAgICAgICAgICAgICAgICAgIE1lc3NhZ2U6ICdBbGwgaXRlbXMgY2xlYXJlZCBmcm9tIGNvbGxlY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBDb3VudE9mSXRlbXNSZW1vdmVkOiBiZWZvcmUgLSBhZnRlclxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbG9nLmluZm8oYENsZWFyZWQgdGhlIGVudGlyZSBjb2xsZWN0aW9uOiAke3RoaXMucmVwb3NpdG9yeS5nZXRDb2xsZWN0aW9uTmFtZSgpfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpOyB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHByZURlc3Ryb3lIb29rKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uLCBkb2M6IElCYXNlTW9kZWxEb2MpOiBQcm9taXNlPElCYXNlTW9kZWxEb2M+e1xuICAgICAgICByZXR1cm4gZG9jO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBkZXN0cm95KHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uLCBzZW5kUmVzcG9uc2U6IGJvb2xlYW4gPSB0cnVlKTogUHJvbWlzZTxJQmFzZU1vZGVsRG9jPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoYXdhaXQgdGhpcy5pc01vZGlmaWNhdGlvbkFsbG93ZWQocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQpKSB7XG4gICAgICAgICAgICAgICAgLy8gQmVmb3JlIHdlIGRlc3Ryb3ksIHdlIHdhbnQgb3VyIGNvbnRyb2xsZXJzIHRvIGhhdmUgdGhlIG9wcG9ydHVuaXR5IHRvIGNsZWFudXAgYW55IHJlbGF0ZWQgZGF0YS5cbiAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSBhd2FpdCB0aGlzLnJlcG9zaXRvcnkuc2luZ2xlKHRoaXMuZ2V0SWQocmVxdWVzdCkpO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wcmVEZXN0cm95SG9vayhyZXF1ZXN0LHJlc3BvbnNlLG5leHQsZG9jKTtcblxuICAgICAgICAgICAgICAgIGxldCBkZWxldGVkTW9kZWwgPSBhd2FpdCB0aGlzLnJlcG9zaXRvcnkuZGVzdHJveSh0aGlzLmdldElkKHJlcXVlc3QpKTtcblxuICAgICAgICAgICAgICAgIGlmICghZGVsZXRlZE1vZGVsKSB7IHRocm93IHsgbWVzc2FnZTogXCJJdGVtIE5vdCBGb3VuZFwiLCBzdGF0dXM6IDQwNCB9OyB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmpzb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgSXRlbVJlbW92ZWRJZDogZGVsZXRlZE1vZGVsLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgSXRlbVJlbW92ZWQ6IGRlbGV0ZWRNb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbG9nLmluZm8oYFJlbW92ZWQgYTogJHt0aGlzLnJlcG9zaXRvcnkuZ2V0Q29sbGVjdGlvbk5hbWUoKX0sIElEOiAke3RoaXMuZ2V0SWQocmVxdWVzdCl9YCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGVsZXRlZE1vZGVsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpOyB9XG4gICAgfVxuXG4gICAgLy9VcGRhdGUgZnVsbCAvIHBhcnRpYWwsIGlzIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gcHV0IGFuZCBwYXRjaC5cbiAgICBwdWJsaWMgdXBkYXRlRnVsbChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbik6IFByb21pc2U8SUJhc2VNb2RlbERvYyB8IHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0LCB0cnVlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdXBkYXRlUGFydGlhbChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbik6IFByb21pc2U8SUJhc2VNb2RlbERvYyB8IHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXBkYXRlKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHVwZGF0ZShyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbiwgaXNGdWxsOiBib29sZWFuKTogUHJvbWlzZTxJQmFzZU1vZGVsRG9jPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoYXdhaXQgdGhpcy5pc01vZGlmaWNhdGlvbkFsbG93ZWQocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQpKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgbW9kZWwgPSBhd2FpdCB0aGlzLnByZVVwZGF0ZUhvb2sodGhpcy5yZXBvc2l0b3J5LmNyZWF0ZUZyb21Cb2R5KHJlcXVlc3QuYm9keSkpO1xuXG4gICAgICAgICAgICAgICAgLy9JIHRoaW5rIHZhbGlkYXRpb24gd2lsbCBicmVhayBvbiBwYXJ0aWFsIHVwZGF0ZXMuICBTb21ldGhpbmcgdG8gbG9vayBmb3IuXG4gICAgICAgICAgICAgICAgbGV0IHZhbGlkYXRpb25FcnJvcnMgPSBhd2FpdCB0aGlzLmlzVmFsaWQobW9kZWwpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcnMgJiYgdmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzcG9uZFdpdGhWYWxpZGF0aW9uRXJyb3JzKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0LCB2YWxpZGF0aW9uRXJyb3JzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gbm90aWNlIHRoYXQgd2UncmUgdXNpbmcgdGhlIHJlcXVlc3QgYm9keSBpbiB0aGUgc2V0IG9wZXJhdGlvbiBOT1QgdGhlIGl0ZW0gYWZ0ZXIgdGhlIHByZSB1cGRhdGUgaG9vay5cbiAgICAgICAgICAgICAgICBsZXQgdXBkYXRlQm9keTogYW55O1xuICAgICAgICAgICAgICAgIGlmIChpc0Z1bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaGVyZSB3ZSBoYXZlIGEgZnVsbCBkb2N1bWVudCwgc28gd2UgZG9uJ3QgbmVlZCB0aGUgc2V0IG9wZXJhdGlvblxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVCb2R5ID0gbW9kZWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBoZXJlIHNvbWVvbmUgb25seSBwYXNzZWQgaW4gYSBmZXcgZmllbGRzLCBzbyB3ZSB1c2UgdGhlIHNldCBvcGVyYXRpb24gdG8gb25seSBjaGFuZ2UgdGhlIGZpZWxkcyB0aGF0IHdlcmUgcGFzc2VkIGluLlxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVCb2R5ID0geyAkc2V0OiByZXF1ZXN0LmJvZHkgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG1vZGVsID0gYXdhaXQgdGhpcy5yZXBvc2l0b3J5LnVwZGF0ZSh0aGlzLmdldElkKHJlcXVlc3QpLCB1cGRhdGVCb2R5KTtcbiAgICAgICAgICAgICAgICBpZiAoIW1vZGVsKSB7IHRocm93IHsgbWVzc2FnZTogJ0l0ZW0gTm90IGZvdW5kJywgc3RhdHVzOiA0MDQgfTsgfVxuXG4gICAgICAgICAgICAgICAgcmVzcG9uc2Uuc3RhdHVzKDIwMikuanNvbihtb2RlbCk7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oYFVwZGF0ZWQgYTogJHt0aGlzLnJlcG9zaXRvcnkuZ2V0Q29sbGVjdGlvbk5hbWUoKX0sIElEOiAke21vZGVsLl9pZH1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikgeyBuZXh0KGVycikgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjcmVhdGUocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24sIHNlbmRSZXNwb25zZTogYm9vbGVhbiA9IHRydWUpOiBQcm9taXNlPElCYXNlTW9kZWxEb2M+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBtb2RlbCA9IGF3YWl0IHRoaXMucHJlQ3JlYXRlSG9vayh0aGlzLnJlcG9zaXRvcnkuY3JlYXRlRnJvbUJvZHkocmVxdWVzdC5ib2R5KSk7XG5cbiAgICAgICAgICAgIGxldCB2YWxpZGF0aW9uRXJyb3JzID0gYXdhaXQgdGhpcy5pc1ZhbGlkKG1vZGVsKTtcblxuICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcnMgJiYgdmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNwb25kV2l0aFZhbGlkYXRpb25FcnJvcnMocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQsIHZhbGlkYXRpb25FcnJvcnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmFkZE93bmVyc2hpcHMocmVxdWVzdCwgcmVzcG9uc2UsIG5leHQsIG1vZGVsIGFzIElPd25lZCk7XG5cbiAgICAgICAgICAgIG1vZGVsID0gYXdhaXQgdGhpcy5yZXBvc2l0b3J5LmNyZWF0ZShtb2RlbCk7XG5cbiAgICAgICAgICAgIGlmIChzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS5zdGF0dXMoMjAxKS5qc29uKG1vZGVsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9nLmluZm8oYENyZWF0ZWQgTmV3OiAke3RoaXMucmVwb3NpdG9yeS5nZXRDb2xsZWN0aW9uTmFtZSgpfSwgSUQ6ICR7bW9kZWwuX2lkfWApO1xuXG4gICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgIH0gY2F0Y2ggKGVycikgeyBuZXh0KGVycikgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjb3VudChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbik6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoQ3JpdGVyaWEgPSBuZXcgU2VhcmNoQ3JpdGVyaWEocmVxdWVzdCwgbmV4dCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY291bnQ6IG51bWJlciA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5jb3VudChzZWFyY2hDcml0ZXJpYSk7XG5cbiAgICAgICAgICAgICAgICByZXNwb25zZS5qc29uKHtcbiAgICAgICAgICAgICAgICAgICAgQ29sbGVjdGlvbk5hbWU6IHRoaXMucmVwb3NpdG9yeS5nZXRDb2xsZWN0aW9uTmFtZSgpLFxuICAgICAgICAgICAgICAgICAgICBDb2xsZWN0aW9uQ291bnQ6IGNvdW50LFxuICAgICAgICAgICAgICAgICAgICBTZWFyY2hDcml0ZXJpYTogc2VhcmNoQ3JpdGVyaWEuY3JpdGVyaWEsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhgRXhlY3V0ZWQgQ291bnQgT3BlcmF0aW9uOiAke3RoaXMucmVwb3NpdG9yeS5nZXRDb2xsZWN0aW9uTmFtZSgpfSwgQ291bnQ6ICR7Y291bnR9YCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycikgeyBuZXh0KGVycikgfVxuXG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGxpc3QocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPElCYXNlTW9kZWxEb2NbXT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCBtb2RlbHM6IElCYXNlTW9kZWxEb2NbXSA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5saXN0KG5ldyBTZWFyY2hDcml0ZXJpYShyZXF1ZXN0LCBuZXh0KSwgdGhpcy5kZWZhdWx0UG9wdWxhdGlvbkFyZ3VtZW50KTtcblxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmpzb24obW9kZWxzKTtcblxuICAgICAgICAgICAgICAgIGxvZy5pbmZvKGBFeGVjdXRlZCBMaXN0IE9wZXJhdGlvbjogJHt0aGlzLnJlcG9zaXRvcnkuZ2V0Q29sbGVjdGlvbk5hbWUoKX0sIENvdW50OiAke21vZGVscy5sZW5ndGh9YCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWxzO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgbGlzdEJ5T3duZXIocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPElCYXNlTW9kZWxEb2NbXT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCBtb2RlbHM6IElCYXNlTW9kZWxEb2NbXSA9IGF3YWl0IHRoaXMucmVwb3NpdG9yeS5saXN0QnlPd25lcihuZXcgU2VhcmNoQ3JpdGVyaWEocmVxdWVzdCwgbmV4dCksIHRoaXMuZ2V0Q3VycmVudE93bmVyKHJlcXVlc3QpLCB0aGlzLmRlZmF1bHRQb3B1bGF0aW9uQXJndW1lbnQpO1xuXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuanNvbihtb2RlbHMpO1xuXG4gICAgICAgICAgICAgICAgbG9nLmluZm8oYEV4ZWN1dGVkIExpc3QgT3BlcmF0aW9uOiAke3RoaXMucmVwb3NpdG9yeS5nZXRDb2xsZWN0aW9uTmFtZSgpfSwgQ291bnQ6ICR7bW9kZWxzLmxlbmd0aH1gKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbHM7XG4gICAgICAgIH0gY2F0Y2ggKGVycikgeyBuZXh0KGVycikgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzaW5nbGUocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiBQcm9taXNlPElCYXNlTW9kZWxEb2M+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgbW9kZWw6IElCYXNlTW9kZWxEb2MgPSBhd2FpdCB0aGlzLnJlcG9zaXRvcnkuc2luZ2xlKHRoaXMuZ2V0SWQocmVxdWVzdCksIHRoaXMuZGVmYXVsdFBvcHVsYXRpb25Bcmd1bWVudCk7XG4gICAgICAgICAgICAgICAgaWYgKCFtb2RlbClcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgKHsgbWVzc2FnZTogJ0l0ZW0gTm90IEZvdW5kJywgc3RhdHVzOiA0MDQgfSk7XG5cbiAgICAgICAgICAgICAgICByZXNwb25zZS5qc29uKG1vZGVsKTtcblxuICAgICAgICAgICAgICAgIGxvZy5pbmZvKGBFeGVjdXRlZCBTaW5nbGUgT3BlcmF0aW9uOiAke3RoaXMucmVwb3NpdG9yeS5nZXRDb2xsZWN0aW9uTmFtZSgpfSwgaXRlbS5faWQ6ICR7bW9kZWwuX2lkfWApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHsgbmV4dChlcnIpIH1cbiAgICB9XG59Il19
