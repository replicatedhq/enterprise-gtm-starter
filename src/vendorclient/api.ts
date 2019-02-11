export interface Customer {
  Id: string;
}

export type CustomerType = "dev" | "trial" | "prod";
export type ExpirationPolicy = "ignore" | "noupdate-norestart" | "noupdate-stop";

export interface CustomerCreateParams {
  assignee: string;
  licenseType: CustomerType;
  expirationPolicy: ExpirationPolicy;
  expirationDate: Date;
}

export interface ReplicatedVendorClient {
  createLicense(params: CustomerCreateParams): Promise<Customer>;

  downloadLicense({ licenseId }: { licenseId: string }): Promise<string>;
}
