import { useEffect, useMemo, useState, useRef } from "react";
import { SortState, TypeType } from "../../types/table.types";
import { toast } from "react-toastify";
import { useDashboard } from "../../context/DashboardContext";

import AssignInsuranceForm from "../dashboard/insurancePlans/forms/AssignInsuranceForm"; // Adjust the import path as needed

import TableMenuButton from "../tablemenu/TableMenu/TableMenuButton";
import { fetchCompanies } from "../../api/services/dashboardServices/organizationService";

type Input = {
  nodes: any[];
  headers: string[];
  itemsPerPage: number;
  onDataUpdate?: () => void;
  type: TypeType;
  onViewClick?: (id: string) => void;
  selectedRows: string[];
  onRowSelect?: (id: string) => void;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  showRoleToggle?: boolean;
  onToggleRole?: (id: string, currentRole: string) => void;
  onCustomEdit?: (id: string) => void;
};

/**
 * A hook that returns a table component.
 *
 */
const useTable = ({
  nodes,
  headers,
  itemsPerPage,
  onDataUpdate,
  type,
  onViewClick,
  selectedRows,
  onRowSelect,
  onApprove,
  onDeny,
  showRoleToggle,
  onToggleRole,
  onCustomEdit,
}: Input) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<SortState>({
    key: "",
    ascending: true,
  });
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [selectedRowForView, setSelectedRowForView] = useState<string | null>(
    null
  );
  const [selectedRowForEdit, setSelectedRowForEdit] = useState<string | null>(
    null
  );
  const [selectedRowForUserEdit, setSelectedRowForUserEdit] = useState<
    string | null
  >(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedRowForInsuranceEdit, setSelectedRowForInsuranceEdit] =
    useState<string | null>(null);
  // Add state for assign insurance form
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedInsuranceIds, setSelectedInsuranceIds] = useState<string[]>(
    []
  );
  const dashboard = useDashboard();
  const { deleteUserFromContext, deleteCompany, deleteInsurancePlan } =
    useDashboard();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      if (!rowToDelete) return;

      if (type === "user") {
        await deleteUserFromContext(rowToDelete.originalId || rowToDelete.id);
        toast.success("User deleted successfully");
      } else if (type === "organization") {
        await deleteCompany(rowToDelete.originalId || rowToDelete.id);
       // toast.success("Organization deleted successfully");
      } else if (type === "insurance") {
        await deleteInsurancePlan(rowToDelete.originalId || rowToDelete.id);
        toast.success("Insurance plan removed successfully");
      }

      // Close the menu
      setActiveMenu(null);

      // Refresh the data
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      let errorMessage = "Failed to delete";
      if (type === "user") {
        errorMessage = "Failed to delete user";
      } else if (type === "organization") {
        errorMessage = "Failed to delete organization";
      } else if (type === "insurance") {
        errorMessage = "Failed to remove insurance plan";
      }
      toast.error(errorMessage);
    }
  };

  // Handle menu click
  const handleMenuClick = (rowIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (activeMenu === rowIndex) {
      setActiveMenu(null);
      setMenuPosition(null);
      return;
    }

    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const scrollY = window.scrollY;

    // Position the menu to the right of the button
    setMenuPosition({
      top: rect.top + scrollY,
      left: rect.right + 10, // 10px gap between button and menu
    });
    setActiveMenu(rowIndex);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setMenuPosition(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const ids = nodes.map((node) => node.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      // Handle duplicates if needed
    }
  }, [nodes]);

  useEffect(() => {
    if (menuPosition && menuRef.current) {
      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Check if menu goes below viewport
      if (menuRect.bottom > viewportHeight) {
        setMenuPosition((prev) => ({
          ...prev!,
          top: prev!.top - (menuRect.bottom - viewportHeight) - 10,
        }));
      }

      // Check if menu goes off right edge of viewport
      if (menuRect.right > viewportWidth) {
        setMenuPosition((prev) => ({
          ...prev!,
          left: prev!.left - menuRect.width - 30, // Position to left of button instead
        }));
      }
    }
  }, [menuPosition]);

  // Handler for closing the assign form
  const handleCloseAssignForm = () => {
    setShowAssignForm(false);
    // Optionally refresh data
    if (onDataUpdate) {
      onDataUpdate();
    }
  };

  const getMenuOptions = () => {
    if (type === "pending" || type === "request") {
      return [
        {
          label: "View User",
          onClick: (row: any) => {
            if (onViewClick) {
              onViewClick(row.originalId || row.id);
            } else {
              setSelectedRowForView(row.originalId || row.id);
            }
          },
        },
        {
          label: "Approve Request",
          onClick: (row: any) => {
            if (onApprove) {
              onApprove(row.originalId || row.id);
              setActiveMenu(null);
            }
          },
        },
        {
          label: "Deny Request",
          onClick: (row: any) => {
            if (onDeny) {
              onDeny(row.originalId || row.id);
              setActiveMenu(null);
            }
          },
        },
      ];
    }

    if (type === "insurance") {
      return [
        {
          label: "Edit",
          onClick: (row: any) => {
            setSelectedRowForInsuranceEdit(row.originalId || row.id);
          },
        },
        {
          label: "Assign",
          onClick: (row: any) => {
            // Get the insurance ID
            const insuranceId = row.originalId || row.id;
            // Set the selected insurance ID in state
            setSelectedInsuranceIds([insuranceId]);
            // Show the assign form
            setShowAssignForm(true);
            setActiveMenu(null);
            setMenuPosition(null);
          },
        },
        {
          label: "Remove plan",
          onClick: (row: any) => {
            setRowToDelete(row); // Set the row to delete
            setShowDeleteDialog(true); // Open the delete dialog
            setActiveMenu(null); // Close the menu
            setMenuPosition(null); // Reset menu position
          },
        },
      ];
    }

    const baseOptions = [
      {
        label: "View",
        onClick: (row: any) => {
          if (onViewClick) {
            onViewClick(row.id);
          } else {
            setSelectedRowForView(row.id);
          }
        },
      },
      {
        label: "Edit",
        onClick: (row: any) => {
          if (type === "user" && onCustomEdit) {
            // Use custom edit for users in CompanyDetailsPage
            onCustomEdit(row.id);
            setActiveMenu(null);
            setMenuPosition(null);
          } else {
            // Use standard edit for non-user types or if no custom edit
            type === "user"
              ? setSelectedRowForUserEdit(row.id)
              : setSelectedRowForEdit(row.id);
          }
        },
      },
    ];

    // Add the role toggle option if showRoleToggle is true and type is user
    if (showRoleToggle && type === "user") {
      const roleToggleOption = {
        label: (row) =>
          row.role?.toLowerCase() === "admin"
            ? "Demote from admin"
            : "Promote to admin",
        onClick: (row: any) => {
          if (onToggleRole) {
            onToggleRole(row.id, row.role);
            setActiveMenu(null);
            setMenuPosition(null);
          }
        },
      };
      baseOptions.push(roleToggleOption);
    }

    // Add delete option based on type
    const deleteOption = {
      label: type === "organization" ? "Remove organization" : "Remove user",
      onClick: (row: any) => {
        console.log("Delete clicked for row:", row); // Debug log
        setRowToDelete(row);
        setShowDeleteDialog(true);
        setActiveMenu(null);
        setMenuPosition(null);
      },
    };

    return [...baseOptions, deleteOption];
  };

  // Update the renderMenu function to ensure row data is properly passed
  const renderMenu = (rowIndex: number, row: any) => {
    if (type === "view-only") {
      return null;
    }

    return (
      <div className="relative">
        <div className="flex justify-center">
          <button
            onClick={(e) => handleMenuClick(rowIndex, e)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 9.5C9.27614 9.5 9.5 9.27614 9.5 9C9.5 8.72386 9.27614 8.5 9 8.5C8.72386 8.5 8.5 8.72386 8.5 9C8.5 9.27614 8.72386 9.5 9 9.5Z"
                fill="#1E4477"
                stroke="#1E4477"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.25 9.5C3.52614 9.5 3.75 9.27614 3.75 9C3.75 8.72386 3.52614 8.5 3.25 8.5C2.97386 8.5 2.75 8.72386 2.75 9C2.75 9.27614 2.97386 9.5 3.25 9.5Z"
                fill="#1E4477"
                stroke="#1E4477"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.75 9.5C15.0261 9.5 15.25 9.27614 15.25 9C15.25 8.72386 15.0261 8.5 14.75 8.5C14.4739 8.5 14.25 8.72386 14.25 9C14.25 9.27614 14.4739 9.5 14.75 9.5Z"
                fill="#1E4477"
                stroke="#1E4477"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {activeMenu === rowIndex && menuPosition && (
            <div
              ref={menuRef}
              className="absolute z-50"
              style={{
                position: "fixed",
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                transform: "translateY(-50%)",
              }}
            >
              <div className="inline-flex flex-col items-end bg-white p-2.5">
                <div className="flex flex-col items-start gap-2.5 self-stretch pr-2">
                  <div className="flex w-[9.0625rem] flex-col items-start gap-2.5 rounded-[0.3125rem] border border-[#d8dadc] bg-white py-[0.3125rem]">
                    {getMenuOptions().map((option, index) => {
                      const label =
                        typeof option.label === "function"
                          ? option.label(row)
                          : option.label;

                      // Determine background and text colors based on the option label
                      const bgColor =
                        label === "Edit"
                          ? "#e8f3ff"
                          : label === "Remove plan" ||
                              label === "Remove organization" ||
                              label === "Remove user"
                            ? "#ffe8e8"
                            : label === "Promote to admin"
                              ? "#e8f3ff"
                              : label === "Demote from admin"
                                ? "#e8f3ff"
                                : "transparent";

                      const hoverBgColor =
                        label === "Remove plan" ||
                        label === "Remove organization" ||
                        label === "Remove user"
                          ? "#ffe8e8"
                          : "#e8f3ff";

                      const textColor =
                        label === "Remove plan" ||
                        label === "Remove organization" ||
                        label === "Remove user"
                          ? "#d21414"
                          : "#1e4477";

                      return (
                        <TableMenuButton
                          key={index}
                          label={label}
                          bgColor={bgColor}
                          hoverBgColor={hoverBgColor}
                          textColor={textColor}
                          onClick={() => {
                            option.onClick(row);
                            setActiveMenu(null);
                            setMenuPosition(null);
                          }}
                          row={row}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const rowColorMap: Record<string, string> = {
    admin: "1e4477",
    user: "0c6d5a",
    super_user: "1e4477",
    subscriber: "0c6d5a",
  };

  const sortedData = useMemo(() => {
    // For organization and user types, the data is already sorted from the API
    if ((type === "organization" || type === "user") && sortState.key) {
      return nodes;
    }

    // For other types or if there's no sort key, use client-side sorting
    if (!sortState.key) return nodes;

    return [...nodes].sort((a, b) => {
      const aValue = a[sortState.key];
      const bValue = b[sortState.key];

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortState.ascending
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      if (typeof aValue === "string") {
        return sortState.ascending
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortState.ascending ? aValue - bValue : bValue - aValue;
    });
  }, [nodes, sortState, type]);

  // Pagination logic
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Sort handler
  const headerToApiFieldMap: Record<string, string> = {
    name: "org_name",
    organization: "org_name",
    address: "org_address",
    contactname: "billing_contact_name",
    billingcontact: "billing_contact_name",
    email: "billing_contact_email",
    billingemail: "billing_contact_email",
    employees: "employee_count",
    startdate: "start_date",
    renewaldate: "renewal_date",
    // Add more mappings as needed
  };
  const handleSort = async (header: string) => {
    const normalizedKey = header.replace(/\s+/g, "").toLowerCase();

    // Toggle or set sort direction
    const ascending = sortState.key === normalizedKey ? !sortState.ascending : true;

    // Update local sort state
    setSortState({ key: normalizedKey, ascending });

    // Only fetch from API for organization type
    if (type === "organization") {
      try {
        setIsLoading(true);

        // Map the UI header to the API field name
        const apiFieldName = headerToApiFieldMap[normalizedKey] || normalizedKey;
        const direction = ascending ? "asc" : "desc";

        console.log(`Sorting by ${apiFieldName} in ${direction} order`);

        // Call API with correct parameters
        const data = await fetchCompanies(
          (currentPage - 1) * itemsPerPage, // skipCount 
          apiFieldName,
          direction
        );

        // Update nodes with new data if you have a setter for it
        // This depends on how your component is structured
        if (onDataUpdate) {
          onDataUpdate();
        }

      } catch (error) {
        console.error("Failed to fetch sorted data:", error);
        toast.error("Failed to sort organizations");
      } finally {
        setIsLoading(false);
      }
    } else if (type === "user") {
      // Use context for user sorting or implement similar API call
      dashboard.updateUserSort(normalizedKey, ascending);
      dashboard.loadUsers(true);
    }
  };

  // Visible pages calculation
  const getVisiblePages = () => {
    if (totalPages <= 0) return []; // Add this check

    const pages: number[] = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < 4) {
      if (currentPage < totalPages / 2) {
        endPage = Math.min(startPage + 4, totalPages);
      } else {
        startPage = Math.max(endPage - 4, 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const areAllVisibleRowsSelected = useMemo(() => {
    return paginatedData.every((row) => {
      const rowId = row.originalId || row.id;
      // Handle the case where selectedRows contains formatted IDs (e.g., "user_123")
      return (
        selectedRows.includes(rowId) || selectedRows.includes(`user_${rowId}`)
      );
    });
  }, [paginatedData, selectedRows]);

  /**
   * Toggles the selection state of all visible rows on the current page.
   *
   * - If all visible rows are already selected, it will deselect them.
   * - If not all visible rows are selected, it will select those that are not yet selected.
   *
   * It uses the `onRowSelect` callback to update the selection state.
   * The function respects the format of IDs, handling potential "user_" prefixes.
   */
  const handleSelectAllInPage = () => {
    if (!onRowSelect) return;

    const visibleRowIds = paginatedData.map((row) => {
      // Get the original ID without the "user_" prefix if it exists
      const id = row.originalId || row.id;
      return id.startsWith("user_") ? id.substring(5) : id;
    });

    if (areAllVisibleRowsSelected) {
      // Deselect all visible rows
      visibleRowIds.forEach((id) => onRowSelect(id));
    } else {
      // Select all visible rows that aren't already selected
      visibleRowIds.forEach((id) => {
        const formattedId = type === "user" ? `user_${id}` : id;
        if (!selectedRows.includes(formattedId)) {
          onRowSelect(id);
        }
      });
    }
  };

  const allHeaders = onRowSelect ? ["select", ...headers] : headers;

  // Render the assign insurance form if visible
  const renderAssignInsuranceForm = () => {
    if (showAssignForm) {
      return (
        <AssignInsuranceForm
          insuranceIds={selectedInsuranceIds}
          onClose={handleCloseAssignForm}
        />
      );
    }
    return null;
  };

  return {
    allHeaders,
    paginatedData,
    areAllVisibleRowsSelected,
    handleSelectAllInPage,
    sortState,
    handleSort,
    currentPage,
    rowColorMap,
    renderMenu,
    setCurrentPage,
    getVisiblePages,
    showDeleteDialog,
    setShowDeleteDialog,
    handleConfirmDelete,
    selectedRowForView,
    setSelectedRowForView,
    selectedRowForEdit,
    setSelectedRowForEdit,
    selectedRowForUserEdit,
    setSelectedRowForUserEdit,
    selectedRowForInsuranceEdit,
    setSelectedRowForInsuranceEdit,
    totalPages,
    // Add new fields for assign form
    showAssignForm,
    selectedInsuranceIds,
    renderAssignInsuranceForm,
  };
};

export default useTable;
