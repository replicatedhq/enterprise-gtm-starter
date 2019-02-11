import * as moment from "moment";
import { ReplicatedVendorClient } from "../vendorclient/api";
import { logger } from "./logger";
import { Params, SignupDefaults } from "./params";

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
    logger.info({ msg: "received create request" });

    if (!req.body.email) {
      res.status(400);
      res.json({ error: { message: "missing or invalid parameters: email" } });
      return;
    }

    this.doTrialSignup(req.body)
      .then(license => {
        res.status(200);
        res.json({ license });
      })
      .catch(err => {
        const { statusCode, message, type, stack } = err;
        logger.error({ err: { statusCode, message, type, stack } });
        res.status(500);
        res.json({ error: { code: "internal_server_error" } });
      });
  }

  async doTrialSignup(body: any): Promise<string> {
    // read form, parse passthrough fields
    const form: SignupDefaults & { email: string } = {
      ...this.params.defaultSignupParams,
      ...body,
    };

    const expirationDate = this.clock();
    expirationDate.add(this.params.defaultSignupParams.trialDurationDays, "day");
    // create trial license
    const customer = await this.replicatedClient.createLicense({
      assignee: form.email,
      licenseType: "trial",
      expirationDate: expirationDate.toDate(),
      expirationPolicy: this.params.defaultSignupParams.expirationPolicy,
    });

    // todo fire integrations

    // download license body
    return this.replicatedClient.downloadLicense({ licenseId: customer.Id });
  }
}
