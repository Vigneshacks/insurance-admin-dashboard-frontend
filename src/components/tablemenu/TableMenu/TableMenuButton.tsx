import cn from "../../../utils/cn";

// TableMenuButton updated with your existing implementation
type TableMenuButtonProps = {
  onClick: (row: any) => void;
  label: string;
  row: any;
  bgColor: string;
  hoverBgColor: string;
  textColor: string;
};

const TableMenuButton = ({ onClick, label, row,  hoverBgColor, textColor }: TableMenuButtonProps) => {
  return (
    <div
      onClick={() => onClick(row)}
      className={cn(
        "flex h-8 cursor-pointer items-center self-stretch rounded-[0.3125rem] px-2",
        label === "View" ? "bg-[#e8f3ff]" : "bg-transparent",
        label === "View" ? "hover:bg-[#e8f3ff]" : `hover:bg-[${hoverBgColor}]`
      )}
    >
      <span
        className="text-[11px] leading-4 font-medium tracking-[0.5px]"
        style={{ color: textColor }}
      >
        {label}
      </span>
    </div>
  );
};
export default TableMenuButton;
