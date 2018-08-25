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
const constants_1 = require("../../constants");
const log = require("winston");
const superagent = require("superagent");
const index_1 = require("../index");
class BaseService {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }
    get(id, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${this.baseUrl}${this.endpoint}/${id}`;
                const response = yield superagent
                    .get(url)
                    .set(constants_1.CONST.TOKEN_HEADER_KEY, yield index_1.IdentityApiService.getSysToken())
                    .send(query);
                return response.body;
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    getList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${this.baseUrl}${this.endpoint}${constants_1.CONST.ep.common.QUERY}`;
                const response = yield superagent
                    .get(url)
                    .set(constants_1.CONST.TOKEN_HEADER_KEY, yield index_1.IdentityApiService.getSysToken())
                    .send(query);
                return response.body;
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${this.baseUrl}${this.endpoint}/${id}`;
                let response = yield superagent
                    .delete(url)
                    .set(constants_1.CONST.TOKEN_HEADER_KEY, yield index_1.IdentityApiService.getSysToken());
                return response.body;
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    deleteMany(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${this.baseUrl}${this.endpoint}`;
                let response = yield superagent
                    .delete(url)
                    .set(constants_1.CONST.TOKEN_HEADER_KEY, yield index_1.IdentityApiService.getSysToken())
                    .send(query);
                return response.body;
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    create(T) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${this.baseUrl}${this.endpoint}`;
                const response = yield superagent
                    .post(url)
                    .set(constants_1.CONST.TOKEN_HEADER_KEY, yield index_1.IdentityApiService.getSysToken())
                    .send(T);
                return response.body;
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    update(body, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${this.baseUrl}${this.endpoint}/${id}`;
                const response = yield superagent
                    .patch(url)
                    .set(constants_1.CONST.TOKEN_HEADER_KEY, yield index_1.IdentityApiService.getSysToken())
                    .send(body);
                return response.body;
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    createRaw(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield superagent
                    .post(`${this.baseUrl}${this.endpoint}`)
                    .set(constants_1.CONST.TOKEN_HEADER_KEY, yield index_1.IdentityApiService.getSysToken())
                    .send(body)
                    .catch(err => this.errorHandler(err));
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield superagent
                    .post(`${this.baseUrl}${this.endpoint}${constants_1.CONST.ep.common.QUERY}`)
                    .set(constants_1.CONST.TOKEN_HEADER_KEY, yield index_1.IdentityApiService.getSysToken())
                    .send(query)
                    .catch(err => this.errorHandler(err));
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    deleteSingle(queryBody) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let queryResponse = yield this.query(queryBody);
                // There should be only one model returned by this query, and if we don't get just one back
                // we're not going to delete anything.
                if (queryResponse.status === 200 && queryResponse.body.length === 1 && queryResponse.body[0]._id) {
                    return yield superagent
                        .delete(`${this.baseUrl}${this.endpoint}/${queryResponse.body[0]._id}`)
                        .set(constants_1.CONST.TOKEN_HEADER_KEY, yield index_1.IdentityApiService.getSysToken())
                        .catch(err => this.errorHandler(err));
                }
                // else{
                //     throw(`There was an error on delete single.  Your query didn't return just one result, or was an error.  Query ResponseBody: ${queryResponse.body}`);
                // }
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    errorHandler(err) {
        if (err) {
            log.error(`There was an error calling out to the ${this.apiName}`, {
                message: err.message ? err.message : 'null',
                status: err.status ? err.status : 'null',
                url: err.response && err.response.request && err.response.request.url ? err.response.request.url : 'null',
                text: err.response && err.response.text ? err.response.text : 'null',
                description: err.response && err.response.body && err.response.body.description ? err.response.body.description : 'null'
            });
            throw err;
        }
        return null;
    }
}
exports.BaseService = BaseService;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL3NlcnZpY2VzL2Jhc2UvYmFzZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSwrQ0FBd0M7QUFDeEMsK0JBQWdDO0FBRWhDLHlDQUF5QztBQUV6QyxvQ0FBOEM7QUFFOUM7SUFNSSxZQUFZLFFBQWdCO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFFWSxHQUFHLENBQXVCLEVBQVUsRUFBRSxLQUFXOztZQUMxRCxJQUFJLENBQUM7Z0JBQ0QsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksRUFBRSxFQUFFLENBQUM7Z0JBRXBELE1BQU0sUUFBUSxHQUFHLE1BQU0sVUFBVTtxQkFDNUIsR0FBRyxDQUFDLEdBQUcsQ0FBQztxQkFDUixHQUFHLENBQUMsaUJBQUssQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLDBCQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDO3FCQUNuRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRWpCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ3pCLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUE7WUFBQyxDQUFDO1FBQzVDLENBQUM7S0FBQTtJQUVZLE9BQU8sQ0FBdUIsS0FBYzs7WUFDckQsSUFBSSxDQUFDO2dCQUNELE1BQU0sR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLGlCQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDdEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxVQUFVO3FCQUM1QixHQUFH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cG9ydCB7IENvbmZpZyB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25maWcnO1xuaW1wb3J0IHsgQ09OU1QgfSBmcm9tIFwiLi4vLi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgbG9nID0gcmVxdWlyZSgnd2luc3RvbicpO1xuXG5pbXBvcnQgKiBhcyBzdXBlcmFnZW50IGZyb20gXCJzdXBlcmFnZW50XCI7XG5pbXBvcnQgeyBJQmFzZU1vZGVsIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2luZGV4JztcbmltcG9ydCB7IElkZW50aXR5QXBpU2VydmljZSB9IGZyb20gJy4uL2luZGV4JztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VTZXJ2aWNlIHtcblxuICAgIHByb3RlY3RlZCBhcGlOYW1lOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGJhc2VVcmw6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgZW5kcG9pbnQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGVuZHBvaW50OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5lbmRwb2ludCA9IGVuZHBvaW50O1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBnZXQ8VCBleHRlbmRzIElCYXNlTW9kZWw+KGlkOiBzdHJpbmcsIHF1ZXJ5PzogYW55KTogUHJvbWlzZTxUPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBgJHt0aGlzLmJhc2VVcmx9JHt0aGlzLmVuZHBvaW50fS8ke2lkfWA7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc3VwZXJhZ2VudFxuICAgICAgICAgICAgICAgIC5nZXQodXJsKVxuICAgICAgICAgICAgICAgIC5zZXQoQ09OU1QuVE9LRU5fSEVBREVSX0tFWSwgYXdhaXQgSWRlbnRpdHlBcGlTZXJ2aWNlLmdldFN5c1Rva2VuKCkpXG4gICAgICAgICAgICAgICAgLnNlbmQocXVlcnkpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuYm9keTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IHRoaXMuZXJyb3JIYW5kbGVyKGVycikgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBnZXRMaXN0PFQgZXh0ZW5kcyBJQmFzZU1vZGVsPihxdWVyeT86IE9iamVjdCk6IFByb21pc2U8VFtdPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBgJHt0aGlzLmJhc2VVcmx9JHt0aGlzLmVuZHBvaW50fSR7Q09OU1QuZXAuY29tbW9uLlFVRVJZfWA7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHN1cGVyYWdlbnRcbiAgICAgICAgICAgICAgICAuZ2V0KHVybClcbiAgICAgICAgICAgICAgICAuc2V0KENPTlNULlRPS0VOX0hFQURFUl9LRVksIGF3YWl0IElkZW50aXR5QXBpU2VydmljZS5nZXRTeXNUb2tlbigpKVxuICAgICAgICAgICAgICAgIC5zZW5kKHF1ZXJ5KTtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5ib2R5O1xuICAgICAgICB9IGNhdGNoIChlcnIpIHsgdGhpcy5lcnJvckhhbmRsZXIoZXJyKSB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGRlbGV0ZShpZDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGAke3RoaXMuYmFzZVVybH0ke3RoaXMuZW5kcG9pbnR9LyR7aWR9YDtcbiAgICAgICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHN1cGVyYWdlbnRcbiAgICAgICAgICAgICAgICAuZGVsZXRlKHVybClcbiAgICAgICAgICAgICAgICAuc2V0KENPTlNULlRPS0VOX0hFQURFUl9LRVksIGF3YWl0IElkZW50aXR5QXBpU2VydmljZS5nZXRTeXNUb2tlbigpKTtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5ib2R5O1xuICAgICAgICB9IGNhdGNoIChlcnIpIHsgdGhpcy5lcnJvckhhbmRsZXIoZXJyKSB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGRlbGV0ZU1hbnkocXVlcnk6IE9iamVjdCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBgJHt0aGlzLmJhc2VVcmx9JHt0aGlzLmVuZHBvaW50fWA7XG4gICAgICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBzdXBlcmFnZW50XG4gICAgICAgICAgICAgICAgLmRlbGV0ZSh1cmwpXG4gICAgICAgICAgICAgICAgLnNldChDT05TVC5UT0tFTl9IRUFERVJfS0VZLCBhd2FpdCBJZGVudGl0eUFwaVNlcnZpY2UuZ2V0U3lzVG9rZW4oKSlcbiAgICAgICAgICAgICAgICAuc2VuZChxdWVyeSlcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5ib2R5O1xuICAgICAgICB9IGNhdGNoIChlcnIpIHsgdGhpcy5lcnJvckhhbmRsZXIoZXJyKSB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGNyZWF0ZTxUIGV4dGVuZHMgSUJhc2VNb2RlbD4oVDogVCk6IFByb21pc2U8VD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYCR7dGhpcy5iYXNlVXJsfSR7dGhpcy5lbmRwb2ludH1gO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzdXBlcmFnZW50XG4gICAgICAgICAgICAgICAgLnBvc3QodXJsKVxuICAgICAgICAgICAgICAgIC5zZXQoQ09OU1QuVE9LRU5fSEVBREVSX0tFWSwgYXdhaXQgSWRlbnRpdHlBcGlTZXJ2aWNlLmdldFN5c1Rva2VuKCkpXG4gICAgICAgICAgICAgICAgLnNlbmQoVCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuYm9keTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IHRoaXMuZXJyb3JIYW5kbGVyKGVycikgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyB1cGRhdGU8VCBleHRlbmRzIElCYXNlTW9kZWw+KGJvZHk6IGFueSwgaWQ6IHN0cmluZyk6IFByb21pc2U8VD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYCR7dGhpcy5iYXNlVXJsfSR7dGhpcy5lbmRwb2ludH0vJHtpZH1gO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzdXBlcmFnZW50XG4gICAgICAgICAgICAgICAgLnBhdGNoKHVybClcbiAgICAgICAgICAgICAgICAuc2V0KENPTlNULlRPS0VOX0hFQURFUl9LRVksIGF3YWl0IElkZW50aXR5QXBpU2VydmljZS5nZXRTeXNUb2tlbigpKVxuICAgICAgICAgICAgICAgIC5zZW5kKGJvZHkpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmJvZHk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikgeyB0aGlzLmVycm9ySGFuZGxlcihlcnIpIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgY3JlYXRlUmF3KGJvZHk6IGFueSk6IFByb21pc2U8c3VwZXJhZ2VudC5SZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHN1cGVyYWdlbnRcbiAgICAgICAgICAgICAgICAucG9zdChgJHt0aGlzLmJhc2VVcmx9JHt0aGlzLmVuZHBvaW50fWApXG4gICAgICAgICAgICAgICAgLnNldChDT05TVC5UT0tFTl9IRUFERVJfS0VZLCBhd2FpdCBJZGVudGl0eUFwaVNlcnZpY2UuZ2V0U3lzVG9rZW4oKSlcbiAgICAgICAgICAgICAgICAuc2VuZChib2R5KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gdGhpcy5lcnJvckhhbmRsZXIoZXJyKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikgeyB0aGlzLmVycm9ySGFuZGxlcihlcnIpIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcXVlcnkocXVlcnk6IGFueSk6IFByb21pc2U8c3VwZXJhZ2VudC5SZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHN1cGVyYWdlbnRcbiAgICAgICAgICAgICAgICAucG9zdChgJHt0aGlzLmJhc2VVcmx9JHt0aGlzLmVuZHBvaW50fSR7Q09OU1QuZXAuY29tbW9uLlFVRVJZfWApXG4gICAgICAgICAgICAgICAgLnNldChDT05TVC5UT0tFTl9IRUFERVJfS0VZLCBhd2FpdCBJZGVudGl0eUFwaVNlcnZpY2UuZ2V0U3lzVG9rZW4oKSlcbiAgICAgICAgICAgICAgICAuc2VuZChxdWVyeSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHRoaXMuZXJyb3JIYW5kbGVyKGVycikpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHsgdGhpcy5lcnJvckhhbmRsZXIoZXJyKSB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGRlbGV0ZVNpbmdsZShxdWVyeUJvZHk6IGFueSk6IFByb21pc2U8c3VwZXJhZ2VudC5SZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5UmVzcG9uc2UgPSBhd2FpdCB0aGlzLnF1ZXJ5KHF1ZXJ5Qm9keSk7XG5cbiAgICAgICAgICAgIC8vIFRoZXJlIHNob3VsZCBiZSBvbmx5IG9uZSBtb2RlbCByZXR1cm5lZCBieSB0aGlzIHF1ZXJ5LCBhbmQgaWYgd2UgZG9uJ3QgZ2V0IGp1c3Qgb25lIGJhY2tcbiAgICAgICAgICAgIC8vIHdlJ3JlIG5vdCBnb2luZyB0byBkZWxldGUgYW55dGhpbmcuXG4gICAgICAgICAgICBpZiAocXVlcnlSZXNwb25zZS5zdGF0dXMgPT09IDIwMCAmJiBxdWVyeVJlc3BvbnNlLmJvZHkubGVuZ3RoID09PSAxICYmIHF1ZXJ5UmVzcG9uc2UuYm9keVswXS5faWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgc3VwZXJhZ2VudFxuICAgICAgICAgICAgICAgICAgICAuZGVsZXRlKGAke3RoaXMuYmFzZVVybH0ke3RoaXMuZW5kcG9pbnR9LyR7cXVlcnlSZXNwb25zZS5ib2R5WzBdLl9pZH1gKVxuICAgICAgICAgICAgICAgICAgICAuc2V0KENPTlNULlRPS0VOX0hFQURFUl9LRVksIGF3YWl0IElkZW50aXR5QXBpU2VydmljZS5nZXRTeXNUb2tlbigpKVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHRoaXMuZXJyb3JIYW5kbGVyKGVycikpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbHNle1xuICAgICAgICAgICAgLy8gICAgIHRocm93KGBUaGVyZSB3YXMgYW4gZXJyb3Igb24gZGVsZXRlIHNpbmdsZS4gIFlvdXIgcXVlcnkgZGlkbid0IHJldHVybiBqdXN0IG9uZSByZXN1bHQsIG9yIHdhcyBhbiBlcnJvci4gIFF1ZXJ5IFJlc3BvbnNlQm9keTogJHtxdWVyeVJlc3BvbnNlLmJvZHl9YCk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikgeyB0aGlzLmVycm9ySGFuZGxlcihlcnIpIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZXJyb3JIYW5kbGVyKGVycjogYW55KTogc3VwZXJhZ2VudC5SZXNwb25zZSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGxvZy5lcnJvcihgVGhlcmUgd2FzIGFuIGVycm9yIGNhbGxpbmcgb3V0IHRvIHRoZSAke3RoaXMuYXBpTmFtZX1gLCB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UgPyBlcnIubWVzc2FnZSA6ICdudWxsJyxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IGVyci5zdGF0dXMgPyBlcnIuc3RhdHVzIDogJ251bGwnLFxuICAgICAgICAgICAgICAgIHVybDogZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5yZXF1ZXN0ICYmIGVyci5yZXNwb25zZS5yZXF1ZXN0LnVybCA/IGVyci5yZXNwb25zZS5yZXF1ZXN0LnVybCA6ICdudWxsJyxcbiAgICAgICAgICAgICAgICB0ZXh0OiBlcnIucmVzcG9uc2UgJiYgZXJyLnJlc3BvbnNlLnRleHQgPyBlcnIucmVzcG9uc2UudGV4dCA6ICdudWxsJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5ib2R5ICYmIGVyci5yZXNwb25zZS5ib2R5LmRlc2NyaXB0aW9uID8gZXJyLnJlc3BvbnNlLmJvZHkuZGVzY3JpcHRpb24gOiAnbnVsbCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn0iXX0=
