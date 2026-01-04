import React, { useState, useEffect } from "react";
import { Trash2, Pencil } from "lucide-react";
import { fetchUserDetails, deleteUser } from "../../../services/axios";
import { toast } from "react-toastify";
import UserEditForm from "./components/UserEdit/UserEditForm";
import cn from "../../../utils/cn";
import { removeUser } from "../../../commonComponents/DeletePopUp";
import UserForm from "./userModuleForm/userForm";

interface MemberGroup {
  id: string;
  org_name: string;
}

interface BenefitPlan {
  name?: string;
  type?: string;
  plan_name?: string;
  plan_grp?: string;
  ribbon_plan_id?: string | null;
  max_individual_oop?: string | null;
  max_family_oop?: string | null;
  individual_deductible?: string | null;
  family_deductible?: string | null;
  plan_email?: string | null;
  service_phone_number?: string | null;
  nurseline_phone_number?: string | null;
  provider?: string;
  notes?: string;
  plan_mailing_address?: string | null;
  benefit_plan_document_folder_uri?: string | null;
  max_individual_oon_oop?: string | null;
  max_family_oon_oop?: string | null;
  individual_deductible_oon?: string | null;
  family_deductible_oon?: string | null;
  coverage_type?: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

interface UserDetails {
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string;
  role: string;
  date_of_birth: string | null;
  ssn_last4: string | null;
  member_group: MemberGroup;
  start_date: string;
  benefit_plan: BenefitPlan[] | null;
  assigned_insurance: string | null; // Keeping for backward compatibility
}

interface UserDetailsViewProps {
  userId: string;
  onClose: () => void;
}

// Header Component - Matching the style from UserEditForm
const Header = () => (
  <div className="flex items-center gap-2.5 self-stretch bg-[#e3e3e4] pt-[1.5625rem] pr-[1.5625rem] pb-[1.5625rem] pl-[1.5625rem]">
    <div className="view_user_information text-center font-['Roboto'] text-[22px] leading-[28px] text-slate-700">
      User Information
    </div>
  </div>
);

// Role Chip Component - Matching the style from UserEditForm
const RoleChip = ({ role }: { role: string }) => {
  let bgColor = "bg-[#e8fbf7]";
  let textColor = "text-[#0c6d5a]";

  if (role.toLowerCase() === "admin") {
    bgColor = "bg-[#e8f3ff]";
    textColor = "text-[#1e4477]";
  }

  return (
    <div
      className={`flex h-7 items-center justify-center rounded-full px-2 pt-[0.3125rem] pb-[0.3125rem] ${bgColor} font-['Roboto'] text-[11px] leading-[16px] font-medium ${textColor} whitespace-nowrap`}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </div>
  );
};

// ReadOnly Input Component - Styled to match the edit form inputs
const ReadOnlyInput = ({
  label,
  value,
  containerClassName,
  isRole = false,
}: {
  label: string;
  value: string | number | React.ReactNode;
  containerClassName?: string;
  isRole?: boolean;
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
        {isRole ? (
          <div className="px-[0.9375rem] py-1">
            <RoleChip role={value.toString()} />
          </div>
        ) : (
          <div className="font-roboto w-full overflow-hidden px-[0.9375rem] py-1 text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155]">
            {value}
          </div>
        )}
      </div>
    </div>
  </div>
);

const UserDetailsView: React.FC<UserDetailsViewProps> = ({
  userId,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const response = await fetchUserDetails(userId);
        console.log("User Details Response:", response);
        setDetails(response);
      } catch (error) {
        toast.error("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [userId]);

  const handleDelete = async () => {
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      onClose(); // Close the details view after successful deletion
    } catch (error) {
      toast.error("Failed to delete user");
    }
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <div className="fixed top-0 right-0 h-screen w-[35%] bg-white shadow-lg">
        <Header />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    try {
      // Split the date string to handle YYYY-MM-DD format
      const [year, month, day] = dateString.split("-");
      if (!year || !month || !day) return "Not set";

      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isNaN(date.getTime())) return "Not set";

      return date.toLocaleDateString();
    } catch {
      return "Not set";
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleEditFormClose = () => {
    setShowEditForm(false);
    onClose(); // Close the details view when edit form is closed
  };

  if (showEditForm) {
    return <UserForm mode="edit" userId={userId} onClose={handleEditFormClose} />;
  }

  const formatRoleForDisplay = (apiRole: string): string => {
    return apiRole === "subscriber" ? "user" : apiRole;
  };

  // Improved function to format insurance plans for display
  const formatInsurancePlans = () => {
    // Add debug log to check what benefit_plan contains
    console.log("Benefit Plan data:", details.benefit_plan);

    // Check if benefit_plan exists and is an array with elements
    if (!details.benefit_plan) {
      return "Not assigned";
    }

    if (!Array.isArray(details.benefit_plan)) {
      console.log("Benefit plan is not an array:", details.benefit_plan);
      // If it's a string (maybe from legacy data), return it directly
      return typeof details.benefit_plan === "string"
        ? details.benefit_plan
        : "Not assigned";
    }

    if (details.benefit_plan.length === 0) {
      return "Not assigned";
    }

    // Map the benefit plans to a list of plan names
    return (
      <>
        {details.benefit_plan.map((plan, index) => {
          // Use name or plan_name or type, whichever is available (priority: name, then plan_name, then type)
          const planName =
            plan.name || plan.plan_name || plan.type || "Unknown Plan";
          return (
            <div key={plan.id || index} className="mb-1 last:mb-0">
              {planName}
            </div>
          );
        })}
      </>
    );
  };

  return (
    // <div className="fixed top-0 right-0 z-40 h-screen w-[35%] bg-white shadow-lg">
    //   <Header />

    //   <div className="flex h-[calc(100vh-64px)] flex-col justify-between overflow-hidden pt-5">
    //     <div className="flex-1 overflow-y-auto">
    //       <div className="space-y-3 pt-2">
    //         {/* Name */}
    //         <ReadOnlyInput
    //           label="Name"
    //           value={`${details.first_name || ""} ${details.last_name || ""}`}
    //         />

    //         {/* Date of Birth */}
    //         <ReadOnlyInput
    //           label="Date of Birth"
    //           value={formatDate(details.date_of_birth)}
    //         />

    //         {/* SSN Last 4 */}
    //         <ReadOnlyInput
    //           label="Last 4 digits of SSN"
    //           value={details.ssn_last4 || "Not set"}
    //         />

    //         {/* Email */}
    //         <ReadOnlyInput label="Email" value={details.email || ""} />

    //         {/* Phone */}
    //         <ReadOnlyInput label="Phone Number" value={details.phone || ""} />

    //         {/* Organization */}
    //         <ReadOnlyInput
    //           label="Organization"
    //           value={details.member_group?.org_name || "Not assigned"}
    //         />

    //         {/* Start Date */}
    //         <ReadOnlyInput
    //           label="Start Date"
    //           value={formatDate(details.start_date)}
    //         />

    //         {/* Role */}
    //         <ReadOnlyInput
    //           label="Role"
    //           value={formatRoleForDisplay(details.role) || ""}
    //           isRole={true}
    //         />

    //         {/* Benefit Plan (Assigned Insurance Plans) */}
    //         <ReadOnlyInput
    //           label="Assigned Insurance Plans"
    //           value={formatInsurancePlans()}
    //         />

    //         <div className="mx-6 flex justify-end pt-2">
    //           <button
    //             className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
    //             onClick={() => setShowDeleteDialog(true)}
    //           >
    //             <Trash2 className="h-4 w-4" />
    //             Remove this User
    //           </button>
    //         </div>

    //         {/* Added extra space here for better gap before buttons - matches edit form */}
    //         <div className="h-8"></div>
    //       </div>
    //     </div>

    //     {/* Action Buttons - Updated styling to match edit form */}
    //     <div className="mt-auto mb-6 p-2">
    //       <div className="flex gap-6">
    //         <button
    //           onClick={onClose}
    //           className="ml-6 flex h-10 flex-1 items-center justify-center gap-1 rounded-md border border-[#d8dadc] bg-white px-6 py-2.5 text-sm leading-5 font-medium text-[#1e4477] transition-colors hover:bg-gray-50"
    //         >
    //           Back
    //         </button>
    //         <button
    //           onClick={handleEdit}
    //           className="mr-6 flex h-10 flex-1 items-center justify-center gap-1 rounded-md bg-[#1e4477] px-6 py-2.5 text-sm leading-5 font-medium text-white transition-colors hover:bg-[#163660]"
    //         >
    //           <Pencil className="h-4 w-4" />
    //           Edit
    //         </button>
    //       </div>
    //     </div>
    //   </div>

    //   {removeUser({
    //     isOpen: showDeleteDialog,
    //     onClose: () => setShowDeleteDialog(false),
    //     onConfirm: handleDelete,
    //   })}
    // </div>
    <UserForm mode="view" onClose={onClose} userId={userId} />
  );
};

export default UserDetailsView;
