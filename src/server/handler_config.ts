import { logger } from "./logger";
import { Params } from "./params";

export class Config {
  constructor(private readonly params: Params) {}

  handler(req, res): void {
    logger.debug({ msg: "received config request" });

    const { uiTitle, uiIntroMarkdown, uiInstallMarkdown } = this.params;

    res.status(200);
    res.json({
      title: uiTitle,
      introMarkdown: uiIntroMarkdown,
      installMarkdown: uiInstallMarkdown,
    });
  }
}
