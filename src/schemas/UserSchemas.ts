import * as Yup from "yup";


export const uservalidationSchema = Yup.object({
        name: Yup.string().required("Required"),
        dob: Yup.date().typeError("Enter a valid date").required("Required"),
        four_digit_ssn: Yup.string().matches(/^\d{4}$/, "Must enter 4 digits only").required("Required"),
        user_email: Yup.string().email("Invalid email").required("Required"),
        phone: Yup.number().typeError("Enter only numbers"),
        organization_name: Yup.string().required("Required"),
        start_date: Yup.date().typeError("Enter a valid date"),
        user_role: Yup.string().required("Required"),
        assigned_insurance: Yup.array(),
    });