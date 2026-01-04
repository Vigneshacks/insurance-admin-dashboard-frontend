import React from "react";
import { Trash2, Pencil } from "lucide-react";
import { fetchCompanyDetails } from "../../../services/axios";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import cn from "../../../utils/cn";
import CompanyEditForm from "./CompanyEditForm";
import { removeOrganization } from "../../../commonComponents/DeletePopUp";

import { useDashboard } from "../../../context/DashboardContext";

interface CompanyAdmin {
  email: string;
  role: string;
  status: string;
}

interface CompanyDetails {
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
  id: string;
  employee_count: number;
  admins: CompanyAdmin[];
  benefit_plans: any[];
  start_date: string;
  renewal_date: string | null;
}

interface CompanyDetailsViewProps {
  companyId: string;
  onClose: () => void;
}

// Header Component - Matching the style from UserDetailsView
const Header = () => (
  <div className="flex items-center gap-2.5 self-stretch bg-[#e3e3e4] pt-[1.5625rem] pr-[1.5625rem] pb-[1.5625rem] pl-[1.5625rem]">
    <div className="view_organization_information text-center font-['Roboto'] text-[22px] leading-[28px] text-slate-700">
      Organization Information
    </div>
  </div>
);

// ReadOnly Input Component - Styled to match the UserDetailsView inputs
const ReadOnlyInput = ({
  label,
  value,
  containerClassName,
}: {
  label: string;
  value: string | number;
  containerClassName?: string;
}) => (
  <div
    className={cn(
      "mx-6 mb-5 flex flex-col items-start self-stretch",
      containerClassName
    )}
  >
    <div className="relative flex h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-[#f9fafb]">
      <label className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]">
        {label}
      </label>

      <div className="content relative flex h-12 w-full items-center gap-2.5 py-1">
        <div className="font-roboto w-full px-[0.9375rem] py-1 text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155]">
          {value}
        </div>
      </div>
    </div>
  </div>
);

const CompanyDetailsView: React.FC<CompanyDetailsViewProps> = ({
  companyId,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<CompanyDetails | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteCompany } = useDashboard();

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const response = await fetchCompanyDetails(companyId);
        setDetails(response);
      } catch (error) {
        toast.error("Failed to fetch organization details");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [companyId]);

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleEditClose = () => {
    setShowEditForm(false);
    // Optionally reload details to reflect any changes
    const reloadDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchCompanyDetails(companyId);
        setDetails(response);
      } catch (error) {
        toast.error("Failed to refresh organization details");
      } finally {
        setLoading(false);
      }
    };
    reloadDetails();
  };

  if (showEditForm) {
    return <CompanyEditForm companyId={companyId} onClose={handleEditClose} />;
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteCompany(companyId);
     // toast.success("Organization deleted successfully");
      onClose(); // Close the details view after successful deletion
    } catch (error) {
      toast.error("Failed to delete organization");
    }
  };

  if (loading) {
    return (
      <div className="fixed top-0 right-0 h-screen w-[35%] bg-white shadow-lg">
        <Header />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p className="text-gray-600">Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Not set";
      return date.toLocaleDateString();
    } catch {
      return "Not set";
    }
  };

  return (
    <div className="fixed top-0 right-0 z-40 h-screen w-[35%] bg-white shadow-lg">
      <Header />

      <div className="flex h-[calc(100vh-64px)] flex-col justify-between overflow-hidden pt-5">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 pt-2">
            {/* Organization */}
            <ReadOnlyInput
              label="Organization"
              value={details.org_name || ""}
            />

            {/* Address */}
            <ReadOnlyInput label="Address" value={details.org_address || ""} />

            {/* Billing Contact */}
            <ReadOnlyInput
              label="Billing Contact"
              value={details.billing_contact_name || ""}
            />

            {/* Billing Email */}
            <ReadOnlyInput
              label="Billing Email"
              value={details.billing_contact_email || ""}
            />

            {/* Employee Count */}
            <ReadOnlyInput
              label="Employee Count"
              value={details.employee_count || 0}
            />

            {/* Start Date */}
            <ReadOnlyInput
              label="Start Date"
              value={formatDate(details.start_date)}
            />

            {/* Renewal Date */}
            <ReadOnlyInput
              label="Renewal Date"
              value={formatDate(details.renewal_date)}
            />

            {/* Admin Emails */}
            <div className="mx-6 mb-5 flex flex-col items-start self-stretch">
              <div className="relative flex min-h-[3.5rem] flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-[#f9fafb]">
                <label className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]">
                  Admin Emails
                </label>

                <div className="w-full px-[0.9375rem] py-3">
                  <div className="flex flex-wrap gap-2">
                    {details.admins && details.admins.length > 0 ? (
                      details.admins.map((admin) => (
                        <div
                          key={admin.email}
                          className="flex items-center rounded-md bg-gray-100 px-2 py-1"
                        >
                          <span className="text-xs">{admin.email}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">
                        No admins assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-6 flex justify-end pt-2">
              <button
                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Remove this Organization
              </button>
            </div>

            {/* Added extra space here for better gap before buttons - matches user details view */}
            <div className="h-8"></div>
          </div>
        </div>

        {/* Action Buttons - Updated styling to match user details view */}
        <div className="mt-auto mb-6 p-2">
          <div className="flex gap-6">
            <button
              onClick={onClose}
              className="ml-6 flex h-10 flex-1 items-center justify-center gap-1 rounded-md border border-[#d8dadc] bg-white px-6 py-2.5 text-sm leading-5 font-medium text-[#1e4477] transition-colors hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleEditClick}
              className="mr-6 flex h-10 flex-1 items-center justify-center gap-1 rounded-md bg-[#1e4477] px-6 py-2.5 text-sm leading-5 font-medium text-white transition-colors hover:bg-[#163660]"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {removeOrganization({
        isOpen: showDeleteDialog,
        onClose: () => setShowDeleteDialog(false),
        onConfirm: handleConfirmDelete,
      })}
    </div>
  );
};

export default CompanyDetailsView;
