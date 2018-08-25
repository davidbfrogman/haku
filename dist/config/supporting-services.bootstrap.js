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
const config_1 = require("./config");
const constants_1 = require("../constants");
const superagent = require("superagent");
const util = require('util');
var bcrypt = require('bcrypt');
const log = require("winston");
const identity_api_service_1 = require("../services/identity.api.service");
// This is where we're going to bootstrap other services that we need to interact with.
// In this case we're talking to the identity service, and we need to make sure that it has the roles that we need.
class SupportingServicesBootstrap {
    static seed() {
        return __awaiter(this, void 0, void 0, function* () {
            //await this.seedIdentityApi();
        });
    }
    static seedIdentityApi() {
        return __awaiter(this, void 0, void 0, function* () {
            // We need to get a system user token so authenticate with the system user creds first
            try {
                const systemToken = yield identity_api_service_1.IdentityApiService.getSysToken();
                // Here we're going to seed the identity api with the roles that we require.
                this.seedRole(constants_1.CONST.USER_ROLE, 'Control over bucket list items, which are owned by their users', systemToken);
                this.seedRole(constants_1.CONST.GUEST_ROLE, 'This is for unauthenticated browsing', systemToken);
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    static seedRole(roleName, description, systemToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // first make sure they don't exist.  So we're going to query the roles endpoint and see if they're there
                const userRoleResponse = yield superagent
                    .post(`${config_1.Config.active.get('identityApiEndpoint')}${constants_1.CONST.ep.ROLES}${constants_1.CONST.ep.common.QUERY}`)
                    .set('x-access-token', systemToken)
                    .send({
                    "name": roleName,
                });
                if (userRoleResponse.body.length === 0) {
                    // In the future we really need to figure out what permissions we give to each one of these.
                    yield superagent
                        .post(`${config_1.Config.active.get('identityApiEndpoint')}${constants_1.CONST.ep.ROLES}`)
                        .set('x-access-token', systemToken)
                        .send({
                        "name": roleName,
                        "description": description,
                    });
                }
            }
            catch (err) {
                this.errorHandler(err);
            }
        });
    }
    static errorHandler(err) {
        log.error('There was a problem seeding data to the authentication API', {
            identityApiResponse: err && err.response && err.response.body ? err.response.body : err
        });
        throw ({
            message: 'There was a problem seeding data to the authentication API',
            identityApiResponse: err && err.response && err.response.body ? err.response.body : err
        });
    }
}
exports.SupportingServicesBootstrap = SupportingServicesBootstrap;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kYXZlYnJvd24vRG9jdW1lbnRzL2x5cmEvYWxlbWJpYy53ZWIvc2VydmVyL2NvbmZpZy9zdXBwb3J0aW5nLXNlcnZpY2VzLmJvb3RzdHJhcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEscUNBQWtDO0FBQ2xDLDRDQUFxQztBQUdyQyx5Q0FBeUM7QUFFekMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQiwrQkFBZ0M7QUFDaEMsMkVBQXNFO0FBRXRFLHVGQUF1RjtBQUN2RixtSEFBbUg7QUFDbkg7SUFFVyxNQUFNLENBQU8sSUFBSTs7WUFDcEIsK0JBQStCO1FBQ25DLENBQUM7S0FBQTtJQUVPLE1BQU0sQ0FBTyxlQUFlOztZQUNoQyxzRkFBc0Y7WUFDdEYsSUFBSSxDQUFDO2dCQUNELE1BQU0sV0FBVyxHQUFHLE1BQU0seUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBRTNELDRFQUE0RTtnQkFDNUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBSyxDQUFDLFNBQVMsRUFBRSxnRUFBZ0UsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDOUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBSyxDQUFDLFVBQVUsRUFBRSxzQ0FBc0MsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN6RixDQUFDO1lBQ0QsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDVCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLENBQUM7UUFDTCxDQUFDO0tBQUE7SUFFTyxNQUFNLENBQU8sUUFBUSxDQUFDLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxXQUFtQjs7WUFDcEYsSUFBRyxDQUFDO2dCQUNBLHlHQUF5RztnQkFDekcsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLFVBQVU7cUJBQ3hDLElBQUksQ0FBQyxHQUFHLGVBQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsaUJBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLGlCQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztxQkFDNUYsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQztxQkFDbEMsSUFBSSxDQUFDO29CQUNGLE1BQU0sRUFBRSxRQUFRO2lCQUNuQixDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6Qyw0RkFBNEY7b0JBQzVGLE1BQU0sVUFBVTt5QkFDWCxJQUFJLENBQUMsR0FBRyxlQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLGlCQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO3lCQUNwRSxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDO3lCQUNsQyxJQUFJLENBQUM7d0JBQ0YsTUFBTSxFQUFFLFFBQVE7d0JBQ2hCLGFBQWEsRUFBRSxXQUFXO3FCQUM3QixDQUFDLENBQUM7Z0JBQ1AsQ0FBQztZQUNMLENBQUM7WUFDRCxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDO2dCQUNSLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsQ0FBQztRQUVMLENBQUM7S0FBQTtJQUVPLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBTztRQUMvQixHQUFHLENBQUMsS0FBSyxDQUFDLDREQUE0RCxFQUFFO1lBQ3BFLG1CQUFtQixFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRztTQUMxRixDQUFDLENBQUM7UUFDSCxNQUFNLENBQUM7WUFDSCxPQUFPLEVBQUUsNERBQTREO1lBQ3JFLG1CQUFtQixFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRztTQUMxRixDQUFDLENBQUE7SUFDTixDQUFDO0NBQ0o7QUF4REQsa0VBd0RDIiwiZmlsZSI6ImNvbmZpZy9zdXBwb3J0aW5nLXNlcnZpY2VzLmJvb3RzdHJhcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbmZpZyB9IGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IHsgQ09OU1QgfSBmcm9tIFwiLi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgKiBhcyBlbnVtcyBmcm9tICcuLi9lbnVtZXJhdGlvbnMnO1xuXG5pbXBvcnQgKiBhcyBzdXBlcmFnZW50IGZyb20gXCJzdXBlcmFnZW50XCI7XG5cbmNvbnN0IHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG52YXIgYmNyeXB0ID0gcmVxdWlyZSgnYmNyeXB0Jyk7XG5pbXBvcnQgbG9nID0gcmVxdWlyZSgnd2luc3RvbicpO1xuaW1wb3J0IHsgSWRlbnRpdHlBcGlTZXJ2aWNlIH0gZnJvbSBcIi4uL3NlcnZpY2VzL2lkZW50aXR5LmFwaS5zZXJ2aWNlXCI7XG5cbi8vIFRoaXMgaXMgd2hlcmUgd2UncmUgZ29pbmcgdG8gYm9vdHN0cmFwIG90aGVyIHNlcnZpY2VzIHRoYXQgd2UgbmVlZCB0byBpbnRlcmFjdCB3aXRoLlxuLy8gSW4gdGhpcyBjYXNlIHdlJ3JlIHRhbGtpbmcgdG8gdGhlIGlkZW50aXR5IHNlcnZpY2UsIGFuZCB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGl0IGhhcyB0aGUgcm9sZXMgdGhhdCB3ZSBuZWVkLlxuZXhwb3J0IGNsYXNzIFN1cHBvcnRpbmdTZXJ2aWNlc0Jvb3RzdHJhcCB7XG5cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIHNlZWQoKSB7XG4gICAgICAgIC8vYXdhaXQgdGhpcy5zZWVkSWRlbnRpdHlBcGkoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBzZWVkSWRlbnRpdHlBcGkoKSB7XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gZ2V0IGEgc3lzdGVtIHVzZXIgdG9rZW4gc28gYXV0aGVudGljYXRlIHdpdGggdGhlIHN5c3RlbSB1c2VyIGNyZWRzIGZpcnN0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzeXN0ZW1Ub2tlbiA9IGF3YWl0IElkZW50aXR5QXBpU2VydmljZS5nZXRTeXNUb2tlbigpO1xuXG4gICAgICAgICAgICAvLyBIZXJlIHdlJ3JlIGdvaW5nIHRvIHNlZWQgdGhlIGlkZW50aXR5IGFwaSB3aXRoIHRoZSByb2xlcyB0aGF0IHdlIHJlcXVpcmUuXG4gICAgICAgICAgICB0aGlzLnNlZWRSb2xlKENPTlNULlVTRVJfUk9MRSwgJ0NvbnRyb2wgb3ZlciBidWNrZXQgbGlzdCBpdGVtcywgd2hpY2ggYXJlIG93bmVkIGJ5IHRoZWlyIHVzZXJzJywgc3lzdGVtVG9rZW4pO1xuICAgICAgICAgICAgdGhpcy5zZWVkUm9sZShDT05TVC5HVUVTVF9ST0xFLCAnVGhpcyBpcyBmb3IgdW5hdXRoZW50aWNhdGVkIGJyb3dzaW5nJywgc3lzdGVtVG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JIYW5kbGVyKGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBzZWVkUm9sZShyb2xlTmFtZTogc3RyaW5nLCBkZXNjcmlwdGlvbjogc3RyaW5nLCBzeXN0ZW1Ub2tlbjogc3RyaW5nKSB7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIC8vIGZpcnN0IG1ha2Ugc3VyZSB0aGV5IGRvbid0IGV4aXN0LiAgU28gd2UncmUgZ29pbmcgdG8gcXVlcnkgdGhlIHJvbGVzIGVuZHBvaW50IGFuZCBzZWUgaWYgdGhleSdyZSB0aGVyZVxuICAgICAgICAgICAgY29uc3QgdXNlclJvbGVSZXNwb25zZSA9IGF3YWl0IHN1cGVyYWdlbnRcbiAgICAgICAgICAgIC5wb3N0KGAke0NvbmZpZy5hY3RpdmUuZ2V0KCdpZGVudGl0eUFwaUVuZHBvaW50Jyl9JHtDT05TVC5lcC5ST0xFU30ke0NPTlNULmVwLmNvbW1vbi5RVUVSWX1gKVxuICAgICAgICAgICAgLnNldCgneC1hY2Nlc3MtdG9rZW4nLCBzeXN0ZW1Ub2tlbilcbiAgICAgICAgICAgIC5zZW5kKHtcbiAgICAgICAgICAgICAgICBcIm5hbWVcIjogcm9sZU5hbWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKHVzZXJSb2xlUmVzcG9uc2UuYm9keS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIC8vIEluIHRoZSBmdXR1cmUgd2UgcmVhbGx5IG5lZWQgdG8gZmlndXJlIG91dCB3aGF0IHBlcm1pc3Npb25zIHdlIGdpdmUgdG8gZWFjaCBvbmUgb2YgdGhlc2UuXG4gICAgICAgICAgICBhd2FpdCBzdXBlcmFnZW50XG4gICAgICAgICAgICAgICAgLnBvc3QoYCR7Q29uZmlnLmFjdGl2ZS5nZXQoJ2lkZW50aXR5QXBpRW5kcG9pbnQnKX0ke0NPTlNULmVwLlJPTEVTfWApXG4gICAgICAgICAgICAgICAgLnNldCgneC1hY2Nlc3MtdG9rZW4nLCBzeXN0ZW1Ub2tlbilcbiAgICAgICAgICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiByb2xlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKXtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JIYW5kbGVyKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZXJyb3JIYW5kbGVyKGVycjphbnkpe1xuICAgICAgICBsb2cuZXJyb3IoJ1RoZXJlIHdhcyBhIHByb2JsZW0gc2VlZGluZyBkYXRhIHRvIHRoZSBhdXRoZW50aWNhdGlvbiBBUEknLCB7XG4gICAgICAgICAgICBpZGVudGl0eUFwaVJlc3BvbnNlOiBlcnIgJiYgZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5ib2R5ID8gZXJyLnJlc3BvbnNlLmJvZHkgOiBlcnJcbiAgICAgICAgfSk7XG4gICAgICAgIHRocm93ICh7XG4gICAgICAgICAgICBtZXNzYWdlOiAnVGhlcmUgd2FzIGEgcHJvYmxlbSBzZWVkaW5nIGRhdGEgdG8gdGhlIGF1dGhlbnRpY2F0aW9uIEFQSScsXG4gICAgICAgICAgICBpZGVudGl0eUFwaVJlc3BvbnNlOiBlcnIgJiYgZXJyLnJlc3BvbnNlICYmIGVyci5yZXNwb25zZS5ib2R5ID8gZXJyLnJlc3BvbnNlLmJvZHkgOiBlcnJcbiAgICAgICAgfSlcbiAgICB9XG59Il19
