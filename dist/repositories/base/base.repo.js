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
class BaseRepository {
    save(document) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield document.save();
        });
    }
    createFromInterface(model) {
        return new this.mongooseModelInstance(model);
    }
    createFromBody(body) {
        return new this.mongooseModelInstance(body);
    }
    getCollectionName() {
        return this.mongooseModelInstance.collection.name;
    }
    single(id, populationArgument) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.mongooseModelInstance.findById(id);
            query = populationArgument ? query.populate(populationArgument) : query;
            return yield query;
        });
    }
    list(searchCriteria, populationArgument) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.mongooseModelInstance.find()
                .skip(searchCriteria.skip)
                .limit(searchCriteria.limit)
                .sort(searchCriteria.sort);
            query = populationArgument ? query.populate(populationArgument) : query;
            return yield query;
        });
    }
    listByOwner(searchCriteria, owner, populationArgument) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = this.mongooseModelInstance.find({ 'owners.ownerId': owner.ownerId, 'owners.ownershipType': owner.ownershipType })
                .skip(searchCriteria.skip)
                .limit(searchCriteria.limit)
                .sort(searchCriteria.sort);
            query = populationArgument ? query.populate(populationArgument) : query;
            return yield query;
        });
    }
    blank() {
        return new this.mongooseModelInstance();
    }
    count(searchCriteria) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.mongooseModelInstance
                .find(searchCriteria.criteria)
                .count();
        });
    }
    searchingCount(searchBody) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.mongooseModelInstance
                .find(searchBody)
                .count();
        });
    }
    create(model) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield model.save();
        });
    }
    update(id, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.mongooseModelInstance.findByIdAndUpdate(id, body, { new: true });
        });
    }
    destroy(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.mongooseModelInstance.findByIdAndRemove(id);
        });
    }
    clear(searchBody) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.mongooseModelInstance.remove(searchBody);
        });
    }
    query(searchBody, populationArgument, searchCriteria) {
        return __awaiter(this, void 0, void 0, function* () {
            this.recursivlyConvertRegexes(searchBody);
            let query;
            query = searchCriteria
                ? this.mongooseModelInstance.find(searchBody).skip(searchCriteria.skip).limit(searchCriteria.limit)
                : this.mongooseModelInstance.find(searchBody);
            query = populationArgument ? query.populate(populationArgument) : query;
            return yield query;
        });
    }
    recursivlyConvertRegexes(requestBody) {
        if (requestBody instanceof Array) {
            for (var i = 0; i < requestBody.length; ++i) {
                this.recursivlyConvertRegexes(requestBody[i]);
            }
        }
        let keysArray = Object.keys(requestBody);
        for (var index = 0; index < keysArray.length; index++) {
            var currentKey = keysArray[index];
            var element = requestBody[currentKey];
            if ((element instanceof Object || element instanceof Array) && Object.keys(element).length > 0) {
                this.recursivlyConvertRegexes(element);
            }
            else {
                if (currentKey === '$regex') {
                    requestBody[currentKey] = new RegExp(requestBody[currentKey], 'i');
                    return;
                }
            }
        }
    }
}
exports.BaseRepository = BaseRepository;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2hha3Uvc2VydmVyL3JlcG9zaXRvcmllcy9iYXNlL2Jhc2UucmVwby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBS0E7SUFJaUIsSUFBSSxDQUFDLFFBQW1COztZQUNqQyxNQUFNLENBQUMsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztLQUFBO0lBRU0sbUJBQW1CLENBQUMsS0FBaUI7UUFDeEMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTSxjQUFjLENBQUMsSUFBWTtRQUM5QixNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVNLGlCQUFpQjtRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFDdEQsQ0FBQztJQUVZLE1BQU0sQ0FBQyxFQUFVLEVBQUUsa0JBQXdCOztZQUNwRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDeEUsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQ3ZCLENBQUM7S0FBQTtJQUVZLElBQUksQ0FBQyxjQUE4QixFQUFFLGtCQUF3Qjs7WUFDdEUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRTtpQkFDeEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7aUJBQ3pCLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO2lCQUMzQixJQUFJLENB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QztnQkFDWCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUFuSEQsd0NBbUhDIiwiZmlsZSI6InJlcG9zaXRvcmllcy9iYXNlL2Jhc2UucmVwby5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgTW9kZWwsIERvY3VtZW50IH0gZnJvbSBcIm1vbmdvb3NlXCI7XG5pbXBvcnQgeyBTZWFyY2hDcml0ZXJpYSwgSUJhc2VNb2RlbCwgSUJhc2VNb2RlbERvYywgSU93bmVyIH0gZnJvbSBcIi4uLy4uL21vZGVscy9pbmRleFwiO1xuaW1wb3J0IGxvZyA9IHJlcXVpcmUoJ3dpbnN0b24nKTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VSZXBvc2l0b3J5PElNb2RlbERvYyBleHRlbmRzIElCYXNlTW9kZWxEb2M+e1xuXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IG1vbmdvb3NlTW9kZWxJbnN0YW5jZTogTW9kZWw8SU1vZGVsRG9jPjtcblxuICAgIHB1YmxpYyBhc3luYyBzYXZlKGRvY3VtZW50OiBJTW9kZWxEb2MpOiBQcm9taXNlPElNb2RlbERvYz4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgZG9jdW1lbnQuc2F2ZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVGcm9tSW50ZXJmYWNlKG1vZGVsOiBJQmFzZU1vZGVsKTogSU1vZGVsRG9jIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLm1vbmdvb3NlTW9kZWxJbnN0YW5jZShtb2RlbCk7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZUZyb21Cb2R5KGJvZHk6IG9iamVjdCk6IElNb2RlbERvYyB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcy5tb25nb29zZU1vZGVsSW5zdGFuY2UoYm9keSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvbGxlY3Rpb25OYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vbmdvb3NlTW9kZWxJbnN0YW5jZS5jb2xsZWN0aW9uLm5hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHNpbmdsZShpZDogc3RyaW5nLCBwb3B1bGF0aW9uQXJndW1lbnQ/OiBhbnkpOiBQcm9taXNlPElNb2RlbERvYz4ge1xuICAgICAgICBsZXQgcXVlcnkgPSB0aGlzLm1vbmdvb3NlTW9kZWxJbnN0YW5jZS5maW5kQnlJZChpZCk7XG4gICAgICAgIHF1ZXJ5ID0gcG9wdWxhdGlvbkFyZ3VtZW50ID8gcXVlcnkucG9wdWxhdGUocG9wdWxhdGlvbkFyZ3VtZW50KSA6IHF1ZXJ5O1xuICAgICAgICByZXR1cm4gYXdhaXQgcXVlcnk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGxpc3Qoc2VhcmNoQ3JpdGVyaWE6IFNlYXJjaENyaXRlcmlhLCBwb3B1bGF0aW9uQXJndW1lbnQ/OiBhbnkpOiBQcm9taXNlPElNb2RlbERvY1tdPiB7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMubW9uZ29vc2VNb2RlbEluc3RhbmNlLmZpbmQoKVxuICAgICAgICAgICAgLnNraXAoc2VhcmNoQ3JpdGVyaWEuc2tpcClcbiAgICAgICAgICAgIC5saW1pdChzZWFyY2hDcml0ZXJpYS5saW1pdClcbiAgICAgICAgICAgIC5zb3J0KHNlYXJjaENyaXRlcmlhLnNvcnQpO1xuXG4gICAgICAgIHF1ZXJ5ID0gcG9wdWxhdGlvbkFyZ3VtZW50ID8gcXVlcnkucG9wdWxhdGUocG9wdWxhdGlvbkFyZ3VtZW50KSA6IHF1ZXJ5O1xuXG4gICAgICAgIHJldHVybiBhd2FpdCBxdWVyeTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgbGlzdEJ5T3duZXIoc2VhcmNoQ3JpdGVyaWE6IFNlYXJjaENyaXRlcmlhLCBvd25lcjogSU93bmVyLCBwb3B1bGF0aW9uQXJndW1lbnQ/OiBhbnkpOiBQcm9taXNlPElNb2RlbERvY1tdPiB7XG4gICAgICAgIGxldCBxdWVyeSA9IHRoaXMubW9uZ29vc2VNb2RlbEluc3RhbmNlLmZpbmQoXG4gICAgICAgICAgICB7ICdvd25lcnMub3duZXJJZCc6IG93bmVyLm93bmVySWQsICdvd25lcnMub3duZXJzaGlwVHlwZSc6IG93bmVyLm93bmVyc2hpcFR5cGUgfVxuICAgICAgICApXG4gICAgICAgICAgICAuc2tpcChzZWFyY2hDcml0ZXJpYS5za2lwKVxuICAgICAgICAgICAgLmxpbWl0KHNlYXJjaENyaXRlcmlhLmxpbWl0KVxuICAgICAgICAgICAgLnNvcnQoc2VhcmNoQ3JpdGVyaWEuc29ydCk7XG5cbiAgICAgICAgcXVlcnkgPSBwb3B1bGF0aW9uQXJndW1lbnQgPyBxdWVyeS5wb3B1bGF0ZShwb3B1bGF0aW9uQXJndW1lbnQpIDogcXVlcnk7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IHF1ZXJ5O1xuICAgIH1cblxuICAgIHB1YmxpYyBibGFuaygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLm1vbmdvb3NlTW9kZWxJbnN0YW5jZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjb3VudChzZWFyY2hDcml0ZXJpYTogU2VhcmNoQ3JpdGVyaWEpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5tb25nb29zZU1vZGVsSW5zdGFuY2VcbiAgICAgICAgICAgIC5maW5kKHNlYXJjaENyaXRlcmlhLmNyaXRlcmlhKVxuICAgICAgICAgICAgLmNvdW50KCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHNlYXJjaGluZ0NvdW50KHNlYXJjaEJvZHk6IGFueSk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLm1vbmdvb3NlTW9kZWxJbnN0YW5jZVxuICAgICAgICAgICAgLmZpbmQoc2VhcmNoQm9keSlcbiAgICAgICAgICAgIC5jb3VudCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjcmVhdGUobW9kZWw6IElNb2RlbERvYyk6IFByb21pc2U8SU1vZGVsRG9jPiB7XG4gICAgICAgIHJldHVybiBhd2FpdCBtb2RlbC5zYXZlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHVwZGF0ZShpZDogc3RyaW5nLCBib2R5OiBhbnkpOiBQcm9taXNlPElNb2RlbERvYz4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5tb25nb29zZU1vZGVsSW5zdGFuY2UuZmluZEJ5SWRBbmRVcGRhdGUoaWQsIGJvZHksIHsgbmV3OiB0cnVlIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBkZXN0cm95KGlkOiBzdHJpbmcpOiBQcm9taXNlPElNb2RlbERvYz4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5tb25nb29zZU1vZGVsSW5zdGFuY2UuZmluZEJ5SWRBbmRSZW1vdmUoaWQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjbGVhcihzZWFyY2hCb2R5OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMubW9uZ29vc2VNb2RlbEluc3RhbmNlLnJlbW92ZShzZWFyY2hCb2R5KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcXVlcnkoc2VhcmNoQm9keTogYW55LCBwb3B1bGF0aW9uQXJndW1lbnQ6IGFueSwgc2VhcmNoQ3JpdGVyaWE6IFNlYXJjaENyaXRlcmlhKTogUHJvbWlzZTxJTW9kZWxEb2NbXT4ge1xuICAgICAgICB0aGlzLnJlY3Vyc2l2bHlDb252ZXJ0UmVnZXhlcyhzZWFyY2hCb2R5KTtcbiAgICAgICAgbGV0IHF1ZXJ5O1xuXG4gICAgICAgIHF1ZXJ5ID0gc2VhcmNoQ3JpdGVyaWEgXG4gICAgICAgICAgICA/ICAgdGhpcy5tb25nb29zZU1vZGVsSW5zdGFuY2UuZmluZChzZWFyY2hCb2R5KS5za2lwKHNlYXJjaENyaXRlcmlhLnNraXApLmxpbWl0KHNlYXJjaENyaXRlcmlhLmxpbWl0KVxuICAgICAgICAgICAgOiAgIHRoaXMubW9uZ29vc2VNb2RlbEluc3RhbmNlLmZpbmQoc2VhcmNoQm9keSk7XG5cbiAgICAgICAgcXVlcnkgPSBwb3B1bGF0aW9uQXJndW1lbnQgPyBxdWVyeS5wb3B1bGF0ZShwb3B1bGF0aW9uQXJndW1lbnQpIDogcXVlcnk7XG4gICAgICAgIHJldHVybiBhd2FpdCBxdWVyeTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVjdXJzaXZseUNvbnZlcnRSZWdleGVzKHJlcXVlc3RCb2R5OiBhbnkpIHtcbiAgICAgICAgaWYgKHJlcXVlc3RCb2R5IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVxdWVzdEJvZHkubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3Vyc2l2bHlDb252ZXJ0UmVnZXhlcyhyZXF1ZXN0Qm9keVtpXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQga2V5c0FycmF5ID0gT2JqZWN0LmtleXMocmVxdWVzdEJvZHkpO1xuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwga2V5c0FycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzQXJyYXlbaW5kZXhdO1xuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSByZXF1ZXN0Qm9keVtjdXJyZW50S2V5XTtcbiAgICAgICAgICAgIGlmICgoZWxlbWVudCBpbnN0YW5jZW9mIE9iamVjdCB8fCBlbGVtZW50IGluc3RhbmNlb2YgQXJyYXkpICYmIE9iamVjdC5rZXlzKGVsZW1lbnQpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3Vyc2l2bHlDb252ZXJ0UmVnZXhlcyhlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50S2V5ID09PSAnJHJlZ2V4Jykge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Qm9keVtjdXJyZW50S2V5XSA9IG5ldyBSZWdFeHAocmVxdWVzdEJvZHlbY3VycmVudEtleV0sICdpJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59Il19
