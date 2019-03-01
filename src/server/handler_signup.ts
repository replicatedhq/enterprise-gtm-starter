import * as moment from "moment";
import * as request from "request-promise";
import { ReplicatedVendorClient } from "../vendorclient/api";
import { PipedriveClient } from "./integration_pipedrive";
import { logger } from "./logger";
import { Params } from "./params";

export class Signup {
  private readonly clock: () => moment.Moment;

  constructor(
    private readonly params: Params,
    private readonly replicatedClient: ReplicatedVendorClient,
    private readonly pipedriveClient: PipedriveClient,
    clock?: () => moment.Moment, ) {
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

  private async fireIntegrations(name: any, org: any, email: any, customer): Promise<void> {
    if (this.params.webhookEnabled) {
      await this.deliverWebhook(name, org, email, customer);
    }

    if (this.params.pipedriveEnabled) {
      await this.pipedriveClient.createPipedriveDeal(name, org, email);
    }

    if (this.params.salesforceEnabled) {
      // todo create lead
      logger.info({msg: "skipping salesforce lead creation, not implemented"});
    }
  }

  private async deliverWebhook(name: any, org: any, email: any, customer): Promise<void> {
    logger.info({msg: "firing webhook", target: this.params.webhookTarget});
    const opts = {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({name, org, email, replicated_customer_id: customer.Id}),
    };

    await request.post(`${this.params.webhookTarget}`, opts);
  }


}
