import * as moment from "moment";
import * as pipedrive from "pipedrive";
import * as request from "request-promise";
import { ReplicatedVendorClient } from "../vendorclient/api";
import { logger } from "./logger";
import { Params } from "./params";

export class Signup {
  private readonly clock: () => moment.Moment;

  constructor(
    private readonly params: Params,
    private readonly replicatedClient: ReplicatedVendorClient,
    clock?: () => moment.Moment,
  ) {
    this.clock = clock || moment;
  }

  handler(req, res): void {
    logger.info({msg: "received create request"});

    for (const field of ["email", "name", "org"]) {
      if (!req.body[field]) {
        res.status(400);
        res.json({error: {message: `missing or invalid parameters: ${field}`}});
        return;
      }
    }

    this.doTrialSignup(req.body)
      .then(license => {
        res.status(200);
        res.json({license});
      })
      .catch(err => {
        const {statusCode, message, type, stack} = err;
        logger.error({err: {statusCode, message, type, stack}});
        res.status(500);
        res.json({error: {code: "internal_server_error"}});
      });
  }

  async doTrialSignup(body: any): Promise<string> {
    const {name, org, email} = body;

    // create trial license

    const expirationDate = this.clock();
    expirationDate.add(this.params.defaultSignupParams.trialDurationDays, "day");
    const customer = await this.replicatedClient.createLicense({
      assignee: this.getLeadName(name, org, email),
      licenseType: "trial",
      expirationDate: expirationDate.toDate(),
      expirationPolicy: this.params.defaultSignupParams.expirationPolicy,
    });

    await this.fireIntegrations(name, org, email, customer);

    // download license body
    return this.replicatedClient.downloadLicense({licenseId: customer.Id});
  }

  private getLeadName(name: any, org: any, email: any) {
    return `${name} at ${org} (${email})`;
  }

  private async fireIntegrations(name: any, org: any, email: any, customer) {
    if (this.params.webhookEnabled) {
      logger.info({msg: "firing webhook"});
      const opts = {
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({name, org, email, replicated_customer_id: customer.Id}),
      };

      await request.post(`${this.params.webhookTarget}`, opts);
    }

    if (this.params.pipedriveEnabled) {
      const title = this.getLeadName(name, org, email); // this should get-or-create a contact and an org
      logger.info({msg: "creating deal in pipedrive", title});
      await new Promise((resolve, reject) => {
        pipedrive.Deals.add({ title }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }

    if (this.params.salesforceEnabled) {
      // todo create lead
      logger.info({msg: "skipping salesforce lead creation, not implemented"});
    }
  }
}
