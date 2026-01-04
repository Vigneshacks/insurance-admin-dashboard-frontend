import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useDashboard } from "../../../../../context/DashboardContext";
import { removeUser } from "../../../../../commonComponents/DeletePopUp";

const RemoveThisUser = ({ userId, onSuccess }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteUserFromContext } = useDashboard();

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      await deleteUserFromContext(userId);
      toast.success("User removed successfully");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to remove user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="mt-2 mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center text-sm font-medium text-red-600 hover:text-red-700"
          disabled={isDeleting}
        >
          <Trash2 className="mr-1 h-4 w-4" />

          Remove this user
        </button>
      </div>

      {removeUser({
        isOpen: isDialogOpen,
        onClose: () => setIsDialogOpen(false),
        onConfirm: handleDeleteUser,
      })}
    </>
  );
};

export default RemoveThisUser;
