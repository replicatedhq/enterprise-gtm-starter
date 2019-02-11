import * as waiton from "wait-on";

export const testenv = {
  // host: process.testenv.REPLICATED_API_HOST || "http://backend:3000",
  // version: process.testenv.VERSION || "dev",
  host: "http://backend:3000", // assumes we're running tests in the same cluster as API
  version: "dev",
  ready(): Promise<void> {
    return waiton({
      log: true,
      timeout: 30000,
      resources: [`${testenv.host}/healthz`],
    });
  },
};
