import { logger } from "./logger";
import { getParams } from "./params";
import { Server } from "./server";

new Server(getParams()).start().catch(err => {
  logger.error({ msg: "failed to start", err: err });
  process.exit(1);
});

process.on("SIGINT", () => {
  logger.error({ msg: "interruped" });
  process.exit(137);
});
