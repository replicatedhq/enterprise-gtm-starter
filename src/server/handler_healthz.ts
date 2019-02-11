import { Params } from "./params";

export class Healthz {
  constructor(private readonly params: Params) {}

  handler(req, res): void {
    res.json({
      status: "ok",
      version: this.params.version,
    });
  }
}
