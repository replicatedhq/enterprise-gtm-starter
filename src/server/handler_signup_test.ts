import { expect } from "chai";
import { describe, it } from "mocha";
import * as moment from "moment";
import { Mock, Times } from "typemoq";
import { ReplicatedVendorClient } from "../vendorclient/api";
import { Signup } from "./handler_signup";
import { PipedriveClient } from "./integration_pipedrive";
import { Params } from "./params";

describe("Signup", () => {
  it("processes a signup request", async () => {
    const client = Mock.ofType<ReplicatedVendorClient>();
    const pdClient = Mock.ofType(PipedriveClient);

    const now = moment();
    const expectedExpiration = now.clone();
    const trialExpirationDays = 2;
    expectedExpiration.add(trialExpirationDays, "day");

    const params: Params = {
      defaultSignupParams: {
        trialDurationDays: trialExpirationDays,
        clusterEnabled: false,
        expirationPolicy: "noupdate-norestart",
      },
    } as any;

    client
      .setup(x =>
        x.createLicense({
          assignee: "User at SomeBigBank (a@b.c)",
          licenseType: "trial",
          expirationDate: expectedExpiration.toDate(),
          expirationPolicy: "noupdate-norestart",
        }),
      )
      .returns(() => Promise.resolve({ Id: "some-customer" }))
      .verifiable(Times.once());

    client
      .setup(x =>
        x.downloadLicense({
          licenseId: "some-customer",
        }),
      )
      .returns(() => Promise.resolve("some-base64-encoded-string"))
      .verifiable(Times.once());

    const signup = new Signup(params, client.object, pdClient.object, () => now);

    const result = await signup.doTrialSignup({
      email: "a@b.c",
      name: "User",
      org: "SomeBigBank"
    });

    client.verifyAll();

    expect(result).to.equal("some-base64-encoded-string");
  });
});
