import cn from "../../../../../../utils/cn";

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
        "flex items-start gap-2.5 self-stretch bg-white pt-[0.9375rem]",
        props.containerClassName
      )}
    >
      {/* Cancel Button */}
      <div className="flex flex-1 flex-col items-start">
        <div className="flex h-10 flex-col items-center justify-center gap-2 self-stretch rounded-[0.3125rem] border border-[#d8dadc] bg-white">
          <button
            type="button"
            onClick={props.onClose}
            className={cn(
              "state-layer flex w-full items-center justify-center gap-2 self-stretch px-6 py-2 text-center text-[14px] font-medium text-[#1e4477]",
              props.cancelClassName
            )}
            disabled={props.isSubmitting}
          >
            {props.cancelText || "Cancel"}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-1 flex-col items-start">
        <div className="flex h-10 flex-col items-center justify-center gap-2 self-stretch rounded-[0.3125rem]">
          <button
            type="submit"
            className={cn(
              "state-layer flex w-full items-center justify-center gap-2 self-stretch px-6 py-2 text-center text-[14px] font-medium",
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
