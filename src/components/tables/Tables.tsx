import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Button,
} from "@mui/material";
import CompanyDetailsView from "../dashboard/forms/CompanyDetailsView";
import CompanyEditForm from "../dashboard/forms/CompanyEditForm";
import UserDetailsView from "../dashboard/forms/UserDetailsView";
import UserEditForm from "../dashboard/forms/components/UserEdit/UserEditForm";
import UserBox from "../tablemenu/UserBox";
import useTable from "./useTable";
import { TypeType } from "../../types/table.types";
import InsuranceEditForm from "../dashboard/insurancePlans/forms/InsuranceEditForm";
import GenericAvatar from "../../assets/Avatar";
import LabelChips from "../../assets/lablechips";
import ArrowIcon from "../../assets/SortIcon";
import Capsule from "../../assets/Capsule";
import {
  removeInsurancePlan,
  removeOrganization,
  removeUser,
} from "../../commonComponents/DeletePopUp";
import InsuranceForm from "../dashboard/forms/insuranceModuleForm/insuranceForm";
import CompanyForm from "../dashboard/forms/organizationModuleForm/organizationForm";

type Props = {
  nodes: any[];
  headers: string[];
  itemsPerPage?: number;
  className?: string;
  paginationClassName?: string;
  type: TypeType;
  onDataUpdate?: () => void;
  onViewClick?: (id: string) => void;
  onRowSelect?: (id: string) => void;
  selectedRows?: string[];
  renderRow?: (node: any) => React.ReactNode;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  showRoleToggle?: boolean;
  onToggleRole?: (id: string, currentRole: string) => void;
  onCustomEdit?: (id: string) => void;
};

const Tables: React.FC<Props> = ({
  nodes,
  headers,
  itemsPerPage = 3,
  className,
  type,
  onDataUpdate,
  onViewClick,
  onRowSelect,
  selectedRows = [],
  onApprove,
  onDeny,
  paginationClassName,
  showRoleToggle,
  onToggleRole,
  onCustomEdit,
}) => {
  const {
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
    renderAssignInsuranceForm,
  } = useTable({
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
  });

  // Helper function to safely check if a value is a string and has length
  const isStringWithLength = (value: any, minLength: number): boolean => {
    return (
      typeof value === "string" && value.length > minLength && value !== "--"
    );
  };

  return (
    <div className="relative">
      <div className={`table-container flex h-full flex-col ${className}`}>
        <div className="overflow-x-auto overflow-y-hidden">
          <Table
            sx={{
              minWidth: "100%",
              borderCollapse: "collapse",
              "& .MuiTableCell-root": {
                padding: "8px 20px", // Reduced vertical padding from 16px to 8px
                fontFamily: "Roboto, sans-serif",
                fontSize: "12px",
                lineHeight: "16px",
                color: "#334155",
                borderBottom: "1px solid #d8dadc",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  "& .MuiTableCell-head": {
                    backgroundColor: "#fff",
                    color: "#334155",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "16px",
                    borderBottom: "1px solid #d8dadc",
                  },
                }}
              >
                {allHeaders.map((header, index) => {
                  if (header === "select") {
                    return (
                      <TableCell key={index} sx={{ width: "48px" }}>
                        <Checkbox
                          checked={
                            paginatedData.length > 0 && areAllVisibleRowsSelected
                          }
                          onChange={handleSelectAllInPage}
                          sx={{
                            color: "#d1d5db",
                            "&.Mui-checked": { color: "#2563eb" },
                          }}
                        />
                      </TableCell>
                    );
                  }
                  if (header === "Actions") {
                    return (
                      <TableCell
                        key={header}
                        sx={{ width: "144px", color: "#1e4477" }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{header}</span>
                        </div>
                      </TableCell>
                    );
                  }
                  const key = header.replace(/\s+/g, "").toLowerCase();
                  const isSorted = sortState.key === key;

                  // Set fixed widths for specific columns
                  let columnWidth = "";
                  switch (key) {
                    case "name":
                    case "planname":
                      columnWidth = "200px";
                      break;
                    case "organization":
                      columnWidth = "170px";
                      break;
                    case "users":
                      columnWidth = "100px";
                      break;
                    case "billingcontact":
                      columnWidth = "150px";
                      break;
                    case "billingemail":
                      columnWidth = "150px";
                      break;
                    case "employees":
                      columnWidth = "120px";
                      break;
                    case "address":
                      columnWidth = "200px";
                      break;
                    case "contactname":
                      columnWidth = "180px";
                      break;
                    case "provider":
                      columnWidth = "170px";
                      break;
                    case "email":
                      columnWidth = "220px";
                      break;
                    case "createdat":
                    case "assignedinsuranceplans":
                      columnWidth = "220px";
                      break;
                    case "startdate":
                      columnWidth = "140px";
                      break;
                    case "preset":
                      columnWidth = "150px";
                      break;
                    case "plantype":
                      columnWidth = "100px";
                      break;
                    case "activeorganizations":
                      columnWidth = "160px";
                      break;
                    case "notes":
                      columnWidth = "200px";
                      break;
                    case "type":
                    case "role":
                      columnWidth = "120px";
                      break;
                    default:
                      columnWidth = "160px";
                  }

                  return (
                    <TableCell
                      key={header}
                      onClick={() => handleSort(header)}
                      sx={{
                        width: columnWidth,
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#e8f3ff" },
                      }}
                    >
                      <div className="flex items-center">
                        <span className="truncate">{header}</span>
                        <div className="ml-1.5">
                          {isSorted ? (
                            sortState.ascending ? (
                              <div className="rotate-180 transform">
                                <ArrowIcon className="text-blue-900" />
                              </div>
                            ) : (
                              <div>
                                <ArrowIcon className="text-blue-900" />
                              </div>
                            )
                          ) : (
                            <div>
                              <ArrowIcon className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell sx={{ width: "40px" }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={`row-${row.id}-${rowIndex}-${currentPage}`}
                  sx={{
                    "&:hover": { backgroundColor: "#e8f3ff" },
                    transition: "background-color 0.15s",
                  }}
                >
                  {allHeaders.map((header, colIndex) => {
                    if (header === "select") {
                      const rowId = row.originalId || row.id;
                      const isSelected =
                        selectedRows.includes(rowId) ||
                        selectedRows.includes(`user_${rowId}`);
                      return (
                        <TableCell key="select-cell" sx={{ width: "48px" }}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => onRowSelect?.(rowId)}
                            sx={{
                              color: "#d1d5db",
                              "&.Mui-checked": { color: "#2563eb" },
                            }}
                          />
                        </TableCell>
                      );
                    }

                    const key = header.replace(/\s+/g, "").toLowerCase();
                    const value = row[key];

                    // Match the column widths from headers
                    let columnWidth = "";
                    switch (key) {
                      case "name":
                      case "planname":
                        columnWidth = "200px";
                        break;
                      case "employees":
                        columnWidth = "120px";
                        break;
                      case "address":
                        columnWidth = "200px";
                        break;
                      case "contactname":
                        columnWidth = "180px";
                        break;
                      case "provider":
                        columnWidth = "170px";
                        break;
                      case "email":
                        columnWidth = "220px";
                        break;
                      case "createdat":
                      case "renewaldate":
                      case "startdate":
                        columnWidth = "100px";
                        break;
                      case "preset":
                        columnWidth = "140px";
                        break;
                      case "plantype":
                        columnWidth = "120px";
                        break;
                      case "activeorganizations":
                        columnWidth = "130px";
                        break;
                      case "notes":
                        columnWidth = "200px";
                        break;
                      case "type":
                      case "role":
                        columnWidth = "120px";
                        break;
                      default:
                        columnWidth = "160px";
                    }

                    return (
                      <TableCell
                        key={`cell-${row.id}-${colIndex}-${currentPage}`}
                        sx={{
                          width: columnWidth,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {key === "name" || key === "requestedusers" ? (
                          <div className="flex items-center">
                            <GenericAvatar />
                            <span className="ml-5">{value}</span>
                          </div>
                        ) : key === "assignedinsuranceplans" ||
                          key === "insuranceplans" ? (
                          <div className="flex items-center gap-2.5">
                            {value && Array.isArray(value)
                              ? value.map((plan, index) => (
                                  <Capsule key={index}>{plan}</Capsule>
                                ))
                              : value}
                          </div>
                        ) : key === "planname" ? (
                          <div className="group relative">
                            <div className="break-words whitespace-normal">
                              {value}
                            </div>
                            {isStringWithLength(value, 20) && (
                              <div className="absolute z-10 -mt-1 ml-14 hidden min-w-max rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
                                {value}
                              </div>
                            )}
                          </div>
                        ) : key === "role" ? (
                          <UserBox
                            color={
                              rowColorMap[
                                typeof value === "string"
                                  ? value.toLowerCase()
                                  : ""
                              ]
                            }
                          >
                            {value}
                          </UserBox>
                        ) : key === "preset" && value === "Standard Plan" ? (
                          <LabelChips>{value}</LabelChips>
                        ) : key === "address" ? (
                          <div className="break-words whitespace-normal">
                            {value}
                          </div>
                        ) : key === "notes" ? (
                          <div className="group relative">
                            <div className="break-words whitespace-normal">
                              {value}
                            </div>
                            {isStringWithLength(value, 15) && (
                              <div className="absolute z-10 -mt-1 ml-14 hidden max-w-xs min-w-max rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
                                {value}
                              </div>
                            )}
                          </div>
                        ) : key === "provider" ? (
                          <div className="group relative">
                            <div className="break-words whitespace-normal">
                              {value}
                            </div>
                            {isStringWithLength(value, 15) && (
                              <div className="absolute z-10 -mt-1 ml-14 hidden min-w-max rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
                                {value}
                              </div>
                            )}
                          </div>
                        ) : value instanceof Date ? (
                          value.toLocaleDateString()
                        ) : (
                          value
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell sx={{ width: "40px" }}>
                    {renderMenu(rowIndex, row)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div
        className={
          paginationClassName || "mt-4 flex items-center justify-center gap-1"
        }
      >
        {totalPages > 0 && (
          <>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              startIcon={<FaArrowLeft />}
              sx={{
                mr: "50px",
                textTransform: " none",
                fontSize: "12px",
                color: currentPage === 1 ? "#9ca3af" : "#2563eb",
                "&:hover": {
                  color: currentPage === 1 ? "#9ca3af" : "#1e40af",
                },
              }}
            >
              Previous
            </Button>

            {getVisiblePages().length > 0 ? (
              getVisiblePages().map((pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  sx={{
                    minWidth: "26px",
                    height: "26px",
                    mx: "5px",
                    fontSize: "12px",
                    color: currentPage === pageNum ? "#fff" : "#2563eb",
                    backgroundColor:
                      currentPage === pageNum ? "#1e4477" : "transparent",
                    "&:hover": {
                      backgroundColor:
                        currentPage === pageNum ? "#1e4477" : "#e8f3ff",
                      color: currentPage === pageNum ? "#fff" : "#1e40af",
                    },
                    borderRadius: "4px",
                  }}
                >
                  {pageNum}
                </Button>
              ))
            ) : (
              <span className="text-xs text-gray-500">No pages</span>
            )}

            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              endIcon={<FaArrowRight />}
              sx={{
                ml: "50px",
                textTransform: "none",
                fontSize: "12px",
                color: currentPage === totalPages ? "#9ca3af" : "#2563eb",
                "&:hover": {
                  color: currentPage === totalPages ? "#9ca3af" : "#1e40af",
                },
              }}
            >
              Next
            </Button>
          </>
        )}
      </div>

      {showDeleteDialog &&
        (type === "organization"
          ? removeOrganization({
              isOpen: true,
              onClose: () => setShowDeleteDialog(false),
              onConfirm: handleConfirmDelete,
            })
          : type === "user"
          ? removeUser({
              isOpen: true,
              onClose: () => setShowDeleteDialog(false),
              onConfirm: handleConfirmDelete,
            })
          : type === "insurance"
          ? removeInsurancePlan({
              isOpen: true,
              onClose: () => setShowDeleteDialog(false),
              onConfirm: handleConfirmDelete,
            })
          : null)}

      {!onViewClick && (
        <>
          {selectedRowForView && type === "organization" && (
            <CompanyDetailsView
              companyId={selectedRowForView}
              onClose={() => setSelectedRowForView(null)}
            />
          )}
          {selectedRowForView && type === "user" && (
            <UserDetailsView
              userId={selectedRowForView}
              onClose={() => setSelectedRowForView(null)}
            />
          )}
          {(selectedRowForInsuranceEdit || selectedRowForEdit) &&
            type === "insurance" && (
              <InsuranceForm
                mode="edit"
                insuranceId={selectedRowForInsuranceEdit || selectedRowForEdit || ""}
                onClose={() => {
                  setSelectedRowForInsuranceEdit(null);
                  setSelectedRowForEdit(null);
                }}
              />
            )}
        </>
      )}

      {selectedRowForEdit && (
        <CompanyEditForm
          companyId={selectedRowForEdit}
          onClose={() => setSelectedRowForEdit(null)}
        />
      )}

      {selectedRowForUserEdit && (
        <UserEditForm
          userId={selectedRowForUserEdit}
          onClose={() => setSelectedRowForUserEdit(null)}
        />
      )}
      {renderAssignInsuranceForm()}
    </div>
  );
};

export default Tables;