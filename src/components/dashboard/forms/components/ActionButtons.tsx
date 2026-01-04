import cn from "../../../../utils/cn";

type Props = {
  containerClassName?: string;
  cancelClassName?: string;
  submitClassName?: string;
  isSubmitting: boolean;
  disableSubmit: boolean;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent) => Promise<void>;
  submittingText?: string;
  submitText?: string;
  cancelText?: string;
};

const ActionButtons = (props: Props) => {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 self-stretch pt-[0.9375rem] bg-white",
        props.containerClassName
      )}
    >
      {/* Cancel Button */}
      <div className="flex flex-col items-start flex-1">
        <div className="flex flex-col justify-center items-center gap-2 self-stretch h-10 rounded-[0.3125rem] border border-[#d8dadc] bg-white">
          <button
            type="button"
            onClick={props.onClose}
            className={cn(
              "state-layer flex justify-center items-center gap-2 self-stretch py-2 px-6 text-[14px] text-[#1e4477] text-center font-medium w-full",
              props.cancelClassName
            )}
            disabled={props.isSubmitting}
          >
            {props.cancelText || "Cancel"}
          </button>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex flex-col items-start flex-1">
        <div className="flex flex-col justify-center items-center gap-2 self-stretch h-10 rounded-[0.3125rem]">
          <button
            type="submit"
            className={cn(
              "state-layer flex justify-center items-center gap-2 self-stretch py-2 px-6 text-[14px] text-center font-medium w-full",
              props.disableSubmit || props.isSubmitting
                ? "bg-[#e3e3e4] text-[#919191]"
                : "bg-[#2B4C7E] text-white hover:bg-[#234066]",
              props.submitClassName
            )}
            disabled={props.disableSubmit || props.isSubmitting}
          >
            {props.isSubmitting
              ? props.submittingText || "Adding"
              : props.submitText || "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;