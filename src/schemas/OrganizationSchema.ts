import * as Yup from "yup";

export const companyValidationSchema = Yup.object({
  org_name: Yup.string().required("Organization name is required"),
  org_address: Yup.string().required("Address is required"),
  billing_contact_name: Yup.string().required("Billing contact name is required"),
  billing_contact_email: Yup.string().email("Invalid email format").required("Billing email is required"),
  start_date: Yup.date().typeError("Enter a valid date").nullable(),
  benefit_plans: Yup.array(),
  admins: Yup.array()
    .of(Yup.string().email("Invalid email format"))
    .min(1, "At least one admin email is required"),
});


export interface CompanyFormValues {
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
  start_date: string | null;
  benefit_plans: string[];
  admins: string[];
}

export const initialCompanyValues: CompanyFormValues = {
  org_name: "",
  org_address: "",
  billing_contact_name: "",
  billing_contact_email: "",
  start_date: "",
  benefit_plans: [],
  admins: [],
};