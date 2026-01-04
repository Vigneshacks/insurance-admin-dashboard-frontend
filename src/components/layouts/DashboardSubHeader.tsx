import { IconType } from "react-icons";

type Props = {
  Icon: IconType;
  label: string;
  callBackOnAdd: () => void;
  buttonLabel?: string; // Optional custom button label
};

const DashboardSubHeader = (props: Props) => {
  return (
    <div className="flex w-full flex-row items-center justify-between py-2">
      <div className="flex w-full flex-row items-center gap-2">
        <props.Icon size={24} />
        <span className="text-sm font-semibold font-roboto text-[#1E4477]">{props.label}</span>
      </div>
      <button
        onClick={props.callBackOnAdd}
        className="flex h-[28px] items-center gap-[5px] rounded-[5px] bg-[#1E4477] px-[10px] py-[5px] text-[11px] leading-[16px] font-medium tracking-[0.5px] text-white font-['Roboto'] whitespace-nowrap"
      >
        {props.buttonLabel || "Add New"}
      </button>
    </div>
  );
};

export default DashboardSubHeader;