import * as moment from "moment";
import * as Pipedrive from "pipedrive";
import { logger } from "./logger";
import { Params } from "./params";

export class PipedriveClient {
  private readonly pipedrive: Pipedrive.Client;

  constructor(
    private readonly params: Params,
  ) {
    this.pipedrive = this.params && this.params.pipedriveEnabled && new Pipedrive.Client(
      this.params.pipedriveAPIToken,
      {strictMode: true},
    );
  }

  async createPipedriveDeal(name: any, org: any, email: any): Promise<void> {
    if (!this.pipedrive) {
      throw new Error("Pipedrive integration not enabled, client was not initialized")
    }

    logger.info({msg: "creating deal in pipedrive", name, org, email});

    const orgId = await this.getOrCreateOrg(org);
    const personId = await this.getOrCreatePerson(orgId, name, email);
    const dealId = await this.getOrCreateDeal(orgId, personId, org);

    const noteContent = `User ${name} (${email}) at ${org} downloaded a trial license on ${moment()}`;

    await new Promise<any[]>((resolve, reject) => {
      this.pipedrive.Notes.add({
        deal_id: dealId,
        org_id: orgId,
        person_id: personId,
        content: noteContent,
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private async getOrCreateOrg(org: any): Promise<string> {
    const orgs: any[] = await new Promise<any[]>((resolve, reject) => {
      this.pipedrive.Organizations.find({term: org, limit: 1}, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    logger.debug({orgs});

    if (orgs.length > 0) {
      return orgs[0].id
    }

    const newOrg: any = await new Promise<any>((resolve, reject) => {
      this.pipedrive.Organizations.add({name: org}, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    return newOrg.id;
  }

  private async getOrCreatePerson(orgId: string, name: any, email: any): Promise<string> {
    const persons: any[] = await new Promise<any[]>((resolve, reject) => {
      this.pipedrive.Persons.find({term: email, search_by_email: true}, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    logger.debug({persons});
    if (persons.length > 0) {
      return persons[0].id;
    }

    const newPerson: any = await new Promise<any>((resolve, reject) => {
      this.pipedrive.Persons.add({name, email: [email], org_id: orgId}, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    return newPerson.id;
  }

  private async getOrCreateDeal(orgId: string, personId: string, org: string): Promise<string> {
    const existingDeals = await new Promise<any[]>((resolve, reject) => {
      this.pipedrive.Deals.find({
        term: org,
        org_id: orgId,
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    logger.debug({existingDeals});

    if (existingDeals.length > 0) {
      await new Promise<any>((resolve, reject) => {
        existingDeals[0].addParticipant({person_id: personId}, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        })
      });
      return existingDeals[0].id;
    }

    const newDeal = await new Promise<any>((resolve, reject) => {
      this.pipedrive.Deals.add({
        title: org,
        org_id: orgId,
        person_id: personId
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    return newDeal.id;
  }
}