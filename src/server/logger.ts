import * as fs from "fs";
import * as pino from "pino";

export interface LoggerParams {
  logLevel: string;
  logFile?: string;
  logPretty: boolean;
  version: string;
}

export function getLoggerParams(): LoggerParams {
  return {
    logLevel: process.env.PINO_LOG_LEVEL || process.env.LOG_LEVEL || "info",
    logFile: process.env.PINO_LOG_FILE,
    logPretty: !!process.env.PINO_LOG_PRETTY,
    version: process.env.VERSION || "unknown",
  };
}

function initLoggerFromEnv(): any {
  const params = getLoggerParams();

  const dest = params.logFile ? fs.createWriteStream(params.logFile) : process.stdout;

  const component = "gotomarket-backend";
  const options = {
    name: component,
    level: params.logLevel,
    prettyPrint: params.logPretty,
  };

  return pino(options, dest).child({
    version: params.version,
  });
}

export const logger = initLoggerFromEnv();
