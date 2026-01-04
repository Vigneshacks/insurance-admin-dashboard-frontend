import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const BaseDialog: React.FC<React.PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
}>> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md m-4 bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};

export const RemoveOrganizationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <BaseDialog isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 bg-[#1e4477] rounded-t-lg">
        <h2 className="text-xl font-medium tracking-normal text-white">
          Remove Organization?
        </h2>
        <button 
          onClick={onClose}
          className="flex items-center justify-center w-6 h-6 text-white hover:opacity-80"
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.6667 5.3335L5.33334 18.6668" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.33334 5.3335L18.6667 18.6668" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-7">
        <p className="mb-6 text-sm text-slate-700">
          Are you sure you want to remove this organization and its users? They will lose access to Decipher. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 h-10 px-6 py-2 text-sm font-medium text-[#1e4477] bg-white border border-[#d8dadc] rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 h-10 px-6 py-2 text-sm font-medium text-white bg-[#1e4477] rounded-md hover:bg-[#1a3b68]"
          >
            Remove Organization
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export const RemoveUserDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <BaseDialog isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 bg-[#1e4477] rounded-t-lg">
        <h2 className="text-xl font-medium tracking-normal text-white">
          Remove User?
        </h2>
        <button 
          onClick={onClose}
          className="flex items-center justify-center w-6 h-6 text-white hover:opacity-80"
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.6667 5.3335L5.33334 18.6668" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.33334 5.3335L18.6667 18.6668" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-7">
        <p className="mb-6 text-sm text-slate-700">
          Are you sure you want to remove this user? They will lose access to Decipher. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 h-10 px-6 py-2 text-sm font-medium text-[#1e4477] bg-white border border-[#d8dadc] rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 h-10 px-6 py-2 text-sm font-medium text-white bg-[#1e4477] rounded-md hover:bg-[#1a3b68]"
          >
            Remove User
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};