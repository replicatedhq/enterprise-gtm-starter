import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import { VendorClient } from "../vendorclient/impl";
import { Config } from "./handler_config";
import { Healthz } from "./handler_healthz";
import { Signup } from "./handler_signup";
import { logger } from "./logger";
import { Params } from "./params";

export class Server {
  constructor(private readonly params: Params) {}

  async start(): Promise<void> {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(
      bodyParser.urlencoded({
        extended: true,
      }),
    );

    const vendorClient = new VendorClient(this.params);

    const healthz = new Healthz(this.params);
    const config = new Config(this.params);
    const signup = new Signup(this.params, vendorClient);

    app.get("/healthz", healthz.handler.bind(healthz));
    app.get("/api/v1/config", config.handler.bind(config));
    app.post("/api/v1/signup", signup.handler.bind(signup));
    app.use(this.notfound);

    app.listen(this.params.port, () => {
      logger.info({ msg: "started", port: this.params.port });
    });
  }

  notfound(req, res): void {
    logger.info({ msg: "error: not found", path: req.path });
    res.status(404);
    res.json({ error: "Not Found" });
  }
}
