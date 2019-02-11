import * as moment from "moment";
import * as request from "request-promise";
import { logger } from "../server/logger";
import { Customer, CustomerCreateParams, ReplicatedVendorClient } from "./api";

export class VendorClient implements ReplicatedVendorClient {
  constructor(
    private readonly baseParams: {
      replicatedVendorAPIKey: string;
      replicatedVendorAppID: string;
      replicatedChannelID: string;
      replicatedVendorBaseURL: string;
    },
  ) {}

  async createLicense(params: CustomerCreateParams): Promise<Customer> {
    const expirationDate = moment(params.expirationDate).format("YYYY-MM-DD");
    const opts = {
      headers: {
        Authorization: this.baseParams.replicatedVendorAPIKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        app_id: this.baseParams.replicatedVendorAppID,
        channel_id: this.baseParams.replicatedChannelID,
        airgap_download_enabled: false,
        assignee: params.assignee,
        license_type: params.licenseType,
        expiration_date: expirationDate,
        expiration_policy: params.expirationPolicy,
      }),
    };

    logger.debug({ url: this.baseParams.replicatedVendorBaseURL, opts });

    const resp = await request.post(
      `${this.baseParams.replicatedVendorBaseURL}/license`,
      opts,
    );
    const body = JSON.parse(resp);
    logger.debug({ msg: "completed request", resp: body });
    return body;
  }

  async downloadLicense({ licenseId }: { licenseId: string }): Promise<string> {
    const opts = {
      headers: {
        Authorization: this.baseParams.replicatedVendorAPIKey,
        "content-type": "application/json",
      },
    };

    const resp = await request.get(
      `${this.baseParams.replicatedVendorBaseURL}/licensekey/${licenseId}`,
      opts,
    );

    logger.debug({ msg: "completed request", resp });
    return resp;
  }
}
