import cn from "../../../../utils/cn";

type Props = {
  formData: any;
  onAddElement: () => void;
  children: React.ReactNode;
  label: string;
  required: boolean;
  value: string;
  tempValue: string;
  onTempValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  type: "text" | "email" | "password" | "date";
  labelClassName?: string;
};

const InputMultiSelect = (props: Props) => {
  return (
    <div className="flex flex-col items-start self-stretch">
      <div className="relative flex h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-white">
        <label
          htmlFor={props.value}
          className={cn(
            "absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]",
            props.labelClassName
          )}
        >
          {props.label}
          {props.required && <span>*</span>}
        </label>

        <div className="content relative flex h-12 w-full items-center gap-2.5 py-1 pr-[0.9375rem]">
          <input
            type={props.type || "text"}
            placeholder={props.placeholder}
            className="font-roboto w-full px-[0.9375rem] py-1 text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155] focus:outline-none"
            value={props.tempValue}
            onChange={props.onTempValueChange}
            onKeyDown={props.onKeyDown}
          />
          <div
            onClick={props.onAddElement}
            className="absolute top-1/2 right-3 -translate-y-1/2 transform cursor-pointer text-[#1e4477]"
          >
            →
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">{props.children}</div>
    </div>
  );
};

export default InputMultiSelect;
