import { ConfirmationDialog, ConfirmationDialogProps } from "./CommonModal";

export const SaveInsurancePlan = (
  props: Omit<
    ConfirmationDialogProps,
    "title" | "message" | "confirmButtonText"
  >
) => (
  <ConfirmationDialog
    {...props}
    title="Save Custom Changes?"
    message="You are about to make changes to a Decipher pre-imported plan. If you proceed, we’ll save a copy of this as a custom plan for you."
    confirmButtonText="Save changes"
  />
);
