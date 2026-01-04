import { SubPagesType } from "../Requests";

const RequestPageNavbar = function ({
  subPages,
  currentlyActive,
  setCurrentlyActive,
}: {
  subPages: { id: SubPagesType; label: string }[];
  currentlyActive: SubPagesType;
  setCurrentlyActive: (page: SubPagesType) => void;
}) {
  return (
    <div className="flex items-start self-stretch">
      {subPages.map((subPage) => (
        <button
          key={subPage.id}
          className={`flex justify-center items-center gap-2.5 
            pl-[3.125rem] pr-[3.125rem] p-2 
            rounded-tl-[0.625rem] rounded-tr-[0.625rem] 
            border-t border-r border-l border-[#d8dadc]
            font-['Roboto'] text-[12px] leading-[16px] font-medium
            ${
              currentlyActive === subPage.id
                ? "bg-white text-slate-700"
                : "bg-[#e3e3e4] text-[#919191]"
            }`}
          onClick={() => setCurrentlyActive(subPage.id)}
        >
          {subPage.label}
        </button>
      ))}
    </div>
  );
};

export default RequestPageNavbar;