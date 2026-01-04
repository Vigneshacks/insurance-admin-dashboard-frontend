import { ConfirmationDialog, ConfirmationDialogProps } from "./CommonModal";

// Preset configurations for common use cases
export const removeOrganization = (
  props: Omit<
    ConfirmationDialogProps,
    "title" | "message" | "confirmButtonText"
  >
) => (
  <ConfirmationDialog
    {...props}
    title="Remove Organization?"
    message="Are you sure you want to remove this organization and its users? They will lose access to Decipher. This action cannot be undone."
    confirmButtonText="Remove Organization"
  />
);

export const removeUser = (
  props: Omit<
    ConfirmationDialogProps,
    "title" | "message" | "confirmButtonText"
  >
) => (
  <ConfirmationDialog
    {...props}
    title="Remove User?"
    message="Are you sure you want to remove this user? They will lose access to Decipher. This action cannot be undone."
    confirmButtonText="Remove User"
  />
);

export const removeInsurancePlan = (
  props: Omit<
    ConfirmationDialogProps,
    "title" | "message" | "confirmButtonText"
  >
) => (
  <ConfirmationDialog
    {...props}
    title="Remove Insurance Plan?"
    message="Are you sure you want to remove this insurance plan? All assigned organizations and users will lose access to view or manage this plan. This action cannot be undone."
    confirmButtonText="Remove Plan"
  />
);
