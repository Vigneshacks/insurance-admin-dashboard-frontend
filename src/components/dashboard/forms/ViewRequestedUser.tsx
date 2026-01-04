import React, { useState, useEffect } from "react";
import { fetchEmployeeRequestDetails } from "../../../services/axios";
import FormField, { FieldConfig } from "../../reusables/formComponents/formInputFields";
import { Formik, Form, Field } from "formik";
import { Grid2 } from "@mui/material";

interface RequestedUser {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  ssn_last4: string;
}

interface MemberGroupMaster {
  org_name: string;
}

interface RequestDetails {
  id: string;
  status: string;
  created_at: string;
  requested_user: RequestedUser;
  member_group_master: MemberGroupMaster;
}

interface UserProfileProps {
  requestId: string;
  onClose: () => void;
  onApprove?: (id: string) => void; // Optional onApprove function
}


// Header Component
const Header = () => (
  <div className="p-4 bg-[#E3E3E4] text-[#334155]">
    <h1 className="text-xl font-normal">User Profile</h1>
  </div>
);

const UserProfile: React.FC<UserProfileProps> = ({ requestId, onClose, onApprove }) => {
  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequestDetails = async () => {
      try {
        setIsLoading(true);
        const data = await fetchEmployeeRequestDetails(requestId);
        setRequestDetails(data);
      } catch (error) {
        setError("Failed to load user details");
      } finally {
        setIsLoading(false);
      }
    };

    loadRequestDetails();
  }, [requestId]);

  const formatDate = (dateString: string) => {

    try {
      const [year, month, day] = dateString.split("-");
      if (!year || !month || !day) return "Not set";
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isNaN(date.getTime()) ? "Not set" : `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`;
    } catch {
      return "";
    }
  };

  const initialValues = requestDetails
    ? {
      name: `${requestDetails.requested_user.first_name || ""} ${requestDetails.requested_user.last_name || ""}`.trim(),
      dob: formatDate(requestDetails.requested_user.date_of_birth),
      four_digit_ssn: requestDetails.requested_user.ssn_last4,
      user_email: requestDetails.requested_user.email,
      phone: requestDetails.requested_user.phone,
      organization_name: requestDetails.member_group_master.org_name,
      request_date: formatDate(requestDetails.created_at),
    }
    : {
      name: "",
      dob: "",
      four_digit_ssn: "",
      user_email: "",
      phone: "",
      organization_name: "",
      request_date: "",
    };

  const formFields: FieldConfig[] = [
    {
      name: "name",
      label: "Name",
      placeholder: "Name",
      type: "text",
      disabled: true,
    },
    {
      name: "dob",
      label: "Date of Birth",
      placeholder: "Select Date",
      type: "text",
      disabled: true,
    },
    {
      name: "four_digit_ssn",
      label: "Last 4 Digits of SSN",
      placeholder: "0000",
      type: "text",
      disabled: true,
    },
    {
      name: "user_email",
      label: "Email",
      placeholder: "sallyjenkins@corp.com",
      type: "text",
      disabled: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      placeholder: "(000) 000-0000",
      type: "text",
      disabled: true,
    },
    {
      name: "organization_name",
      label: "Organization",
      placeholder: "Select Organization",
      type: "text",
      disabled: true,
    },
    {
      name: "request_date",
      label: "Request Date",
      placeholder: "Select Date",
      type: "text",
      disabled: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="fixed top-0 right-0 h-screen w-[35%] bg-white shadow-lg">
        <Header />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !requestDetails) {
    return (
      <div className="fixed top-0 right-0 h-screen w-[35%] bg-white shadow-lg">
        <Header />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p className="text-red-500">Error loading user details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 right-0 z-40 h-screen w-[35%] bg-white shadow-lg">
      <Header />
      <div className="flex h-[calc(100vh-64px)] flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Formik initialValues={initialValues} onSubmit={() => { }} enableReinitialize>
            {() => (
              <Form className="flex flex-col h-full">
                <Grid2 container spacing={2} sx={{ pt: 3, pb: 3, pl: 2.5, pr: 2.5, flexGrow: 1, overflowY: "auto" }}>
                  {formFields.map((field) => (
                    <Grid2 key={field.name} sx={{ flexBasis: { xs: "100%", sm: "100%" } }}>
                      <Field
                        name={field.name}
                        component={FormField}
                        fieldConfig={field}
                      />
                    </Grid2>
                  ))}
                </Grid2>
              </Form>
            )}
          </Formik>
        </div>
        <div className="p-3 flex gap-2">
          <button
            onClick={onClose}
            className="state-layer flex w-full items-center justify-center gap-2 self-stretch px-6 py-2 text-center text-[14px] rounded-[0.2125rem] font-medium text-[#1e4477] cursor-pointer border border-[#d8dadc]"
          >
            Back
          </button>
          {onApprove && (
            <button
              onClick={() => onApprove(requestId)}
              className="state-layer flex w-full items-center justify-center gap-2 self-stretch px-6 py-2 text-center text-[14px] rounded-[0.2125rem] font-medium cursor-pointer 
                                                    bg-[#1E4477] text-white hover:bg-[#234066]"
            >
              Approve Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;