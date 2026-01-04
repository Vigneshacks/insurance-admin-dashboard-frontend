import React from "react";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText?: string;
}

const BaseDialog: React.FC<
  React.PropsWithChildren<{
    isOpen: boolean;
    onClose: () => void;
  }>
> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative m-4 h-[248px] w-full max-w-[600px] bg-white shadow-lg">
        {children}
      </div>
    </div>
  );
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  cancelButtonText = "Cancel",
}) => {
  return (
    <BaseDialog isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex h-[78px] w-full items-center justify-between bg-[#1e4477] px-6 py-6">
        <h2 className="text-xl font-medium tracking-normal text-white">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center text-white hover:opacity-80"
        >
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.6667 5.3335L5.33334 18.6668"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.33334 5.3335L18.6667 18.6668"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="font-['Roboto'] text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155]">
          {message}
        </p>
        <div className="mt-6 flex gap-[10px]">
          <button
            onClick={onClose}
            className="h-[40px] w-[270px] rounded-md border border-[#d8dadc] bg-white px-6 py-2 text-sm font-medium text-[#1e4477] hover:bg-gray-50"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="h-[40px] w-[270px] rounded-md bg-[#1e4477] px-6 py-2 text-sm font-medium text-white hover:bg-[#1a3b68]"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};
