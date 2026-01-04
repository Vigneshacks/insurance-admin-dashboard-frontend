import { useState } from "react";

const InsuranceForm = ({ onClose }: { onClose: () => void }) => {
  const [selectedOrgs] = useState(["ACME Corp", "Super Corp"]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const Header = () => (
    <div className="flex items-center gap-2.5 self-stretch bg-[#1e4477] p-6 text-center text-xl font-medium text-white">
      Assign Insurance Plan
    </div>
  );

  const CalendarIcon = () => (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M2.25 4.75C2.25 3.64543 3.14543 2.75 4.25 2.75H13.75C14.8546 2.75 15.75 3.64543 15.75 4.75V6.25H2.25V4.75Z"
        fill="white"
      />
      <path
        d="M5.75 2.75V0.75M12.25 2.75V0.75M13.75 2.75H4.25C3.14543 2.75 2.25 3.64543 2.25 4.75V13.25C2.25 14.3546 3.14543 15.25 4.25 15.25H13.75C14.8546 15.25 15.75 14.3546 15.75 13.25V4.75C15.75 3.64543 14.8546 2.75 13.75 2.75ZM2.25 6.25H15.75"
        stroke="#1E4477"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const DeleteIcon = () => (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        d="M13.6051 4.75L13.0991 14.355C13.0431 15.417 12.1651 16.25 11.1021 16.25H6.89704C5.83304 16.25 4.95604 15.417 4.90004 14.355L4.39404 4.75"
        stroke="#1E4477"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.75 4.75H15.25M6.75 4.75V2.75C6.75 2.198 7.198 1.75 7.75 1.75H10.25C10.802 1.75 11.25 2.198 11.25 2.75V4.75"
        stroke="#1E4477"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="flex h-[1024px] w-[600px] flex-col bg-white">
      <Header />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 text-sm text-slate-700">
          Assign this insurance plan to an organization
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[180px_120px_120px_auto] rounded-t border border-[#d8dadc] bg-gray-100 p-2 text-xs font-medium text-[#919191]">
          <div>Organization</div>
          <div>Effective Start Date</div>
          <div>Effective End Date</div>
          <div></div>
        </div>

        {/* Table Rows */}
        {selectedOrgs.map((org, index) => (
          <div
            key={org}
            className={`grid grid-cols-[180px_120px_120px_auto] items-center border-x border-b border-[#d8dadc] p-2 ${index === selectedOrgs.length - 1 ? "rounded-b" : ""}`}
          >
            <div className="text-xs text-slate-700">{org}</div>
            <div className="flex items-center gap-2 rounded border border-dashed border-[#d8dadc] bg-gray-100 p-1">
              <CalendarIcon />
              <span className="text-xs text-[#1e4477]">12/20/24</span>
            </div>
            <div className="flex items-center gap-2 rounded border border-dashed border-[#d8dadc] bg-gray-100 p-1">
              <CalendarIcon />
              <span className="text-xs text-[#1e4477]">
                {org === "ACME Corp" ? "12/21/25" : "mm/dd/yy"}
              </span>
            </div>
            <div className="flex justify-end">
              <DeleteIcon />
            </div>
          </div>
        ))}

        {/* Organization Dropdown */}
        <div className="mt-4">
          <div
            className="flex cursor-pointer items-center justify-between rounded-t border border-[#d8dadc] p-4"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-[#919191]">Select organization(s)</span>
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.3332 8.66699L11.9998 17.0003L3.6665 8.66699"
                stroke="#1E4477"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {isDropdownOpen && (
            <div className="rounded-b border-x border-b border-[#d8dadc]">
              {["ACME Corp", "Bob Corp", "Super Corp"].map((org) => (
                <div key={org} className="flex items-center gap-2 p-4">
                  <div
                    className={`h-4 w-4 rounded-sm ${selectedOrgs.includes(org) ? "bg-[#18d9b3]" : "border border-[#d8dadc]"}`}
                  />
                  <span className="text-xs text-slate-700">{org}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex gap-2 p-6">
        <button
          className="rounded border border-[#d8dadc] px-6 py-2 font-medium text-[#1e4477]"
          onClick={onClose}
        >
          Cancel
        </button>
        <button className="rounded bg-[#1e4477] px-6 py-2 font-medium text-white">
          Assign
        </button>
      </div>
    </div>
  );
};

export default InsuranceForm;
