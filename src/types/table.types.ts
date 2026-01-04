export type SortState = {
  key: string;
  ascending: boolean;
};

export interface CompanyDetails {
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
  start_date: string;
  admin_emails: string[];
  id: string;
}



export type TypeType = "user" | "organization" | "pending" | "request" | "view-only" | "insurance";
