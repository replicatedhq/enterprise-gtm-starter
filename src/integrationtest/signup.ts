import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import * as moment from "moment";
import * as request from "request-promise";

import { testenv } from "./env";

describe("Signup", () => {
  beforeEach(testenv.ready.bind(testenv));
  it("generates a license", async () => {
    const email = `dexter+gtm-${moment().format(
      "YYYY-MM-DD--HH-mm-ss",
    )}@replicated.com`;
    const resp = await request.post(`${testenv.host}/api/v1/signup`, {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // decode the response, make sure it has an id, etc
    const target = JSON.parse(resp);
    const buff = new Buffer(target.license, "base64");
    const decoded = JSON.parse(buff.toString("utf-8"));

    // check that it has our expected properties
    expect(decoded.id).not.to.be.empty;
    expect(decoded.private_key).not.to.be.empty;
    expect(decoded.public_pgp_key).not.to.be.empty;
    expect(decoded.registry_token).not.to.be.empty;
  });
});
