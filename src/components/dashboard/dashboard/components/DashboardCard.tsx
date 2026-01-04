import React from "react";
import { IconType } from "react-icons";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

type Props = {
  Icon: IconType;
  label: string;
  value: string;
  link: string;
};

const DashboardCard: React.FC<Props> = ({ Icon, label, value, link }) => {
  return (
    <div className="flex w-[220px] flex-col justify-between">
      <div className="flex flex-col items-start justify-center rounded-t-lg border border-b-0 border-[#D8DADC] bg-white px-4 pt-3 pb-1">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-1">
            <Icon className="text-[#1E4477]" size={24} />
            <h3 className="text-xs font-semibold text-[#334155]">{label}</h3>
          </div>
          <p className="mb-1 text-xl text-[#334155]">{value}</p>
        </div>
      </div>

      {link && (
        <Link
          to={link}
          className="group flex w-full items-center justify-between rounded-b-lg border-x border-b border-[#D8DADC] bg-[#E8F3FF] px-2.5 py-1.5 hover:bg-blue-200"
        >
          <span className="text-xs font-bold text-[#1E4477]">View</span>
          <FaArrowRight className="text-[#1E4477] transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
};

export default DashboardCard;
