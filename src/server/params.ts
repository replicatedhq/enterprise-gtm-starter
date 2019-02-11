import { ExpirationPolicy } from "../vendorclient/api";
import { getLoggerParams, LoggerParams } from "./logger";

export interface SignupDefaults {
  trialDurationDays: number;
  clusterEnabled: boolean;
  requireActivation: boolean;
  expirationPolicy: ExpirationPolicy;
}

export type VendorParams = {
  replicatedVendorAPIKey: string;
  replicatedVendorAppID: string;
  replicatedChannelID: string;
  replicatedVendorBaseURL: string;
  defaultSignupParams: SignupDefaults;
};

export type UIParams = {
  uiTitle: string;
  uiIntroMarkdown: string;
  uiInstallMarkdown: string;
  // allow for custom fields? or ConfigGroups?
};

export type Params = LoggerParams &
  VendorParams &
  UIParams & {
    port: number;
  };

export function getParams(): Params {
  const params = {
    replicatedVendorAPIKey: requireParam("REPLICATED_API_TOKEN"),
    replicatedVendorAppID: requireParam("REPLICATED_APP"),
    replicatedChannelID: requireParam("REPLICATED_CHANNEL_ID"),
    replicatedVendorBaseURL:
      process.env.REPLICATED_VENDORAPI_BASEURL ||
      "https://api.replicated.com/vendor/v1",
    port: Number(process.env.HTTP_PORT || "3000"),
    defaultSignupParams: {
      trialDurationDays: Number(process.env.SIGNUP_DEFAULT_TRIAL_LENGTH_DAYS || "30"),
      clusterEnabled: !!process.env.SIGNUP_DEFAULT_CLUSTER_ENABLED,
      requireActivation: !!process.env.SIGNUP_DEFAULT_REQUIRE_ACTIVATION,
      expirationPolicy:
        (process.env.SIGNUP_DEFAULT_EXPIRATION_POLICY as any) || "noupdate-stop", // todo validate
    },
    ...getUIParams(),
    ...getLoggerParams(),
  };
  if (params.defaultSignupParams.trialDurationDays < 1) {
    throw new Error("Invalid SIGNUP_DEFAULT_TRIAL_LENGTH_DAYS");
  }
  return params;
}


function requireParam(key: string): string {
  const param = process.env[key];
  if (!param) {
    throw new Error(`missing required parameter: ${key}`);
  }
  return param;
}

function getUIParams(): UIParams {
  return {
    uiTitle:
      process.env.SIGNUP_UI_TITLE === undefined
        ? "Super Big Tool Enterprise"
        : process.env.SIGNUP_UI_TITLE,
    uiIntroMarkdown:
      process.env.SIGNUP_INTRO_MARKDOWN ||
      `
## Try SuperBigTool for free
Whether you need the ease of the cloud or control behind your firewall, Super Big Tool has you covered.

- No obligation, 30-day free trial
- One-step integration with LDAP, Active Directory, or SAML
- Powering big tooling for more than 100,000 organizations

    
    `,
    uiInstallMarkdown:
      process.env.SIGNUP_INSTALL_MARKDOWN ||
      `
You can install your license on a Linux server with:

${"```"}
curl -sSLO install.sh https://get.replicated.com/kubernetes-init
sudo bash ./install.sh
${"```"}
    `,
  };
}

