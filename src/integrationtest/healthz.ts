import { expect } from "chai";
import { beforeEach, describe, it } from "mocha";
import * as request from "request-promise";
import { testenv } from "./env";

describe("Healthz", () => {
  beforeEach(testenv.ready.bind(testenv));

  it("reports healthy", async () => {
    await testenv.ready();
    const resp = await request(`${testenv.host}/healthz`, {
      json: true,
    });
    expect(resp).to.deep.equal({ status: "ok", version: testenv.version });
  });
});
