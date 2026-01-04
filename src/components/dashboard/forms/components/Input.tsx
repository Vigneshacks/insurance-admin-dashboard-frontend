import { type ChangeEvent, type FocusEvent, memo } from "react";
import cn from "../../../../utils/cn";

type InputProps<T = Record<string, any>> = {
  formData: T;
  type?: "text" | "email" | "password" | "date" | "tel";
  valueName: string;
  required?: boolean; // Make this optional with a default value
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  label: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  placeholder?: string;
  complex: boolean;
  textarea?: boolean;
  children?: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement, Element>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement, Element>) => void;
};

const CustomCalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
  >
    <path
      d="M2.25 4.75C2.25 3.64543 3.14543 2.75 4.25 2.75H13.75C14.8546 2.75 15.75 3.64543 15.75 4.75V6.25H2.25V4.75Z"
      fill="white"
    />
    <path
      d="M5.75 2.75V0.75"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.25 2.75V0.75"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.75 2.75H4.25C3.14543 2.75 2.25 3.64543 2.25 4.75V13.25C2.25 14.3546 3.14543 15.25 4.25 15.25H13.75C14.8546 15.25 15.75 14.3546 15.75 13.25V4.75C15.75 3.64543 14.8546 2.75 13.75 2.75Z"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.25 6.25H15.75"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.25 11.75C11.8023 11.75 12.25 11.3023 12.25 10.75C12.25 10.1977 11.8023 9.75 11.25 9.75C10.6977 9.75 10.25 10.1977 10.25 10.75C10.25 11.3023 10.6977 11.75 11.25 11.75Z"
      fill="#1E4477"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InputField = memo(
  ({
    textarea,
    valueName,
    placeholder,
    inputClassName,
    formData,
    handleChange,
    type,
    onFocus,
    onBlur,
    onKeyDown,
    required,
    inputRef, // Add required prop here
  }: Pick<
    InputProps,
    | "textarea"
    | "valueName"
    | "placeholder"
    | "inputClassName"
    | "formData"
    | "handleChange"
    | "type"
    | "onFocus"
    | "onBlur"
    | "required"
    | "inputRef" // Add to Pick type
    | "onKeyDown" // Add to Pick type
  >) => {
    const inputStyles =
      "font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155]";

    if (textarea) {
      return (
        <textarea
          id={valueName}
          name={valueName}
          placeholder={placeholder || "Enter value here..."}
          className={cn(
            "h-full w-full resize-none px-[0.9375rem] py-1 focus:outline-none",
            inputStyles,
            inputClassName
          )}
          value={formData[valueName]}
          onChange={handleChange}
          required={required} // Use the prop value instead of hardcoding
        />
      );
    }

    return (
      <input
        id={valueName}
        type={type || "text"}
        name={valueName}
        placeholder={placeholder || "Enter value here..."}
        className={cn(
          "w-full px-[0.9375rem] py-1 focus:outline-none",
          inputStyles,
          inputClassName
        )}
        value={formData[valueName]}
        onChange={handleChange}
        required={required} // Use the prop value instead of hardcoding
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        ref={inputRef}
      />
    );
  }
);

const Input = (props: InputProps) => {
  // Default value for required
  const isRequired = props.required !== undefined ? props.required : true;

  // If this input is a date field and has children, replace Calendar icon with custom one
  const renderChildren = () => {
    if (props.valueName === "startDate" || props.valueName === "endDate") {
      return (
        <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
          <CustomCalendarIcon />
        </div>
      );
    }
    return props.children;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-start self-stretch",
        props.containerClassName
      )}
    >
      <div className="relative flex h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-white">
        <label
          htmlFor={props.valueName}
          className={cn(
            "absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]",
            props.labelClassName
          )}
        >
          {props.label}
          {isRequired && <span>*</span>}
        </label>

        {!props.complex ? (
          <div className="content flex h-12 w-full items-center gap-2.5 py-1">
            <InputField {...props} required={isRequired} />
          </div>
        ) : (
          <div className="content relative flex h-12 w-full items-center gap-2.5 py-1 pr-[0.9375rem]">
            <InputField {...props} required={isRequired} />
            {renderChildren()}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Input);
