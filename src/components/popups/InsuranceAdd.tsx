import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InsuranceAddForm from "../dashboard/insurancePlans/forms/InsuranceAddForm";
import {
  PencilIcon,
  SearchIcon,
  CloseIcon,
} from "../../assets/SearchInsuranceIcons"; // Import icons from separate file
import InsuranceForm from "../dashboard/forms/insuranceModuleForm/insuranceForm";

// Types
type InsurancePlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type OptionCardProps = {
  title: string;
  description: string;
  buttonText: string;
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
};

// Reusable option card component with icon above the title
const OptionCard = ({
  title,
  description,
  buttonText,
  onClick,
  icon,
}: OptionCardProps) => (
  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-[#d8dadc] bg-white p-4">
    <div className="mb-4">{icon}</div>
    <div className="mb-4 text-center">
      <div className="font-roboto mb-1 text-sm leading-5 font-medium text-[#1e4477]">
        {title}
      </div>
      <div className="font-roboto text-xs leading-4 text-[#1e4477]">
        {description}
      </div>
    </div>
    <button
      onClick={onClick}
      className="mb-4 h-7 rounded bg-[#1e4477] px-2 text-xs font-medium text-white"
    >
      {buttonText}
    </button>
  </div>
);

// Main modal component
const InsurancePlanModal = ({ isOpen, onClose }: InsurancePlanModalProps) => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen && !showAddForm) return null;

  const handleManualAdd = () => {
    setShowAddForm(true);
  };

  const handleSearch = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to backdrop
    onClose();
    navigate("/insurance-systems");
  };

  const handleAddFormClose = () => {
    setShowAddForm(false);
    onClose();
  };

  if (showAddForm) {
    return <InsuranceForm mode="create" onClose={handleAddFormClose} />
    // <InsuranceAddForm onClose={handleAddFormClose} />;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
          {/* Modal header */}
          <div className="flex items-center justify-between gap-2.5 rounded-t-lg bg-[#1e4477] p-6">
            <div className="font-roboto text-2xl leading-7 text-white">
              Add Insurance Plan
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Modal content */}
          <div className="flex flex-col items-center justify-end self-stretch p-7">
            <div className="font-roboto mb-5 self-stretch text-sm leading-5 text-slate-700">
              Add a new insurance plan to manage and assign to organizations and
              users
            </div>

            <div className="flex items-start gap-5 self-stretch">
              <OptionCard
                title="Manually add a new plan"
                description="Create a new insurance plan manually by entering the details of the plan"
                buttonText="I'll add it myself"
                onClick={handleManualAdd}
                icon={<PencilIcon />}
              />

              <OptionCard
                title="Search for a plan"
                description="Search and choose from a list of insurance plans that are already in Decipher"
                buttonText="Search for a plan"
                onClick={handleSearch}
                icon={<SearchIcon />}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InsurancePlanModal;
