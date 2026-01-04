import React, { useState } from 'react';
import { GoPencil } from "react-icons/go";
import Image7 from '../../../../assets/Image7.png';
import EditButton from './EditButton';
import InsuranceEditForm from '../../insurancePlans/forms/InsuranceEditForm';
import ThreeDotMenu from './ThreeDotMenu';

interface CompanyDetails {
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
  start_date: string;
  id: string;
  employee_count: number;
  admins: Array<{
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    role: string;
    id: string;
  }>;
  benefit_plans: Array<{
    plan_name: string;
    provider: string;
    coverage_type: string;
    start_date: string;
    renewal_date: string | null;
    id: string;
  }>;
  renewal_date: string | null;
}

type Props = {
  onEditClick: () => void;
  companyDetails: CompanyDetails;
};

const TopSectionWithCards = ({ onEditClick, companyDetails }: Props) => {
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string | null>(null);
  
  // Slice the benefit_plans array to show only the first two plans
  const visiblePlans = companyDetails.benefit_plans && companyDetails.benefit_plans.length > 0 
    ? companyDetails.benefit_plans.slice(0, 2) 
    : [];

  const getEffectiveDate = (startDate: string, renewalDate: string | null) => {
    const start = new Date(startDate);
    const end = renewalDate ? new Date(renewalDate) : null;
    const formattedStart = start.toLocaleDateString();
    const formattedEnd = end ? end.toLocaleDateString() : "Current";
    return `${formattedStart} - ${formattedEnd}`;
  };

  const handleEditInsurance = (insuranceId: string) => {
    setSelectedInsuranceId(insuranceId);
  };

  const handleCloseEditForm = () => {
    setSelectedInsuranceId(null);
  };
  const handleSeeAll = () => {
    // Implement the See All functionality here
    console.log("See all plans clicked");
    // You might want to navigate to a different page or show a modal with all plans
  };

  const handleAddNewPlan = () => {
    // Implement the Add New Plan functionality here
    console.log("Add new plan clicked");
    // You might want to show a form to add a new plan
  };

  return (
    <div className="mb-4 flex flex-row gap-5 max-lg:flex-wrap">
      <div className="container flex flex-col items-start pt-[0.9375rem] pr-[0.9375rem] pb-[0.9375rem] pl-[0.9375rem] w-[21.25rem] rounded-[0.625rem] border border-[#d8dadc] bg-white">
        <div className="header flex flex-col items-start self-stretch">
          <div className="flex justify-between items-center self-stretch">
            <div className="organization_information text-[#1e4477] text-[16px] font-medium text-base leading-6">
              Organization Information
            </div>
            <GoPencil
              className="cursor-pointer text-[#1E4477] hover:text-blue-800"
              onClick={onEditClick}
            />
          </div>
          <div className="w-[19.375rem] h-px bg-[#d8dadc] mt-2" />
        </div>

        <div className="content flex flex-col items-start self-stretch mt-4">
          {/* Billing Address */}
          <div className="address flex flex-col items-start">
            <div className="billing_address text-[#334155] font-medium text-xs leading-4">
              Billing Address
            </div>
            <div className="text-slate-700 text-xs leading-4 mt-1">
              {companyDetails.org_address}
            </div>
          </div>

          {/* Contact */}
          <div className="contact flex flex-col items-start mt-4">
            <div className="contact-1 text-slate-700 font-medium text-xs leading-4">
              Contact
            </div>
            <div className="email flex items-center gap-2 mt-1">
              <svg
                width={18}
                height={18}
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 7.25C10.5188 7.25 11.75 6.01878 11.75 4.5C11.75 2.98122 10.5188 1.75 9 1.75C7.48122 1.75 6.25 2.98122 6.25 4.5C6.25 6.01878 7.48122 7.25 9 7.25Z"
                  fill="white"
                />
                <path
                  d="M9 7.25C10.5188 7.25 11.75 6.01878 11.75 4.5C11.75 2.98122 10.5188 1.75 9 1.75C7.48122 1.75 6.25 2.98122 6.25 4.5C6.25 6.01878 7.48122 7.25 9 7.25Z"
                  stroke="#1E4477"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.7621 15.516C14.6221 15.245 15.0741 14.295 14.7091 13.471C13.7391 11.28 11.5501 9.75 9.0001 9.75C6.4501 9.75 4.2611 11.28 3.2911 13.471C2.9261 14.296 3.3781 15.245 4.2381 15.516C5.4631 15.902 7.0841 16.25 9.0001 16.25C10.9161 16.25 12.5371 15.902 13.7621 15.516Z"
                  stroke="#1E4477"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-slate-700 text-xs leading-4">
                {companyDetails.billing_contact_name}
              </div>
            </div>
            <div className="email-1 flex items-center gap-2 mt-1">
              <svg
                width={18}
                height={18}
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.75 5.64296L8.565 9.54C8.84 9.673 9.16 9.673 9.434 9.54L16.25 5.64239V5.25C16.25 4.14543 15.3546 3.25 14.25 3.25H3.75C2.64543 3.25 1.75 4.14543 1.75 5.25V5.64296Z"
                  fill="white"
                />
                <path
                  d="M1.75 5.75L8.517 9.483C8.818 9.649 9.182 9.649 9.483 9.483L16.25 5.75"
                  stroke="#1E4477"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.75 14.75H14.25C15.3546 14.75 16.25 13.8546 16.25 12.75V5.25C16.25 4.14543 15.3546 3.25 14.25 3.25H3.75C2.64543 3.25 1.75 4.14543 1.75 5.25V12.75C1.75 13.8546 2.64543 14.75 3.75 14.75Z"
                  stroke="#1E4477"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-slate-700 text-xs leading-4">
                {companyDetails.billing_contact_email}
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div className="contact-2 flex flex-col items-start mt-4">
            <div className="start_date text-slate-700 font-medium text-xs leading-4">
              Start Date
            </div>
            <div className="text-slate-700 text-xs leading-4 mt-1">
              {new Date(companyDetails.start_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-2 rounded-lg border border-gray-300 bg-white p-4 w-full">
        <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
          <h2 className="text-base font-semibold text-blue-900">Insurance Plans</h2>
          <ThreeDotMenu onSeeAll={handleSeeAll} onAddNewPlan={handleAddNewPlan} />
        </div>
        {visiblePlans.length > 0 ? (
          <div className="flex gap-4">
            {visiblePlans.map((plan) => (
              <div key={plan.id} className="flex-1 rounded-lg border border-gray-300 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={Image7} alt="Insurance icon" className="h-8 w-8" />
                    <span className="text-sm font-medium text-gray-900">{plan.plan_name}</span>
                  </div>
                  <EditButton onClick={() => handleEditInsurance(plan.id)} />
                </div>
                <div className="space-y-2 rounded-lg bg-gray-100 p-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium text-sm">Provider</span>
                    <span className="text-gray-700 text-sm">{plan.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium text-sm">Plan Type</span>
                    <span className="text-gray-700 text-sm">{plan.coverage_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium text-sm">Effective Date</span>
                    <span className="text-gray-700 text-sm">{getEffectiveDate(plan.start_date, plan.renewal_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium text-sm">Users Enrolled</span>
                    <span className="text-gray-700 text-sm">{companyDetails.employee_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#334155] text-[20px] font-roboto font-normal leading-[20px] tracking-[0.25px]">
            No insurance plan found for the organization
          </p>
        )}
      </div>
      {selectedInsuranceId && (
        <InsuranceEditForm insuranceId={selectedInsuranceId} onClose={handleCloseEditForm} />
      )}
    </div>
  );
};

export default TopSectionWithCards;