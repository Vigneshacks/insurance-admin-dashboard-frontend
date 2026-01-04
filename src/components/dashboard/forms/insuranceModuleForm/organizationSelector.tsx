import React, { useState, useEffect } from 'react';
import { FieldArray, FormikErrors, useFormikContext } from 'formik';
import {
    Box,
    Checkbox,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchCompanies } from '../../../../api/services/dashboardServices/organizationService';
import { format, isValid, parse } from 'date-fns';
import NoBox from '../../insurancePlans/forms/components/NoBox';
import ArrowUpIcon from "../../../../assets/Images/ArrowUpIcon.svg";
import ArrowDownIcon from "../../../../assets/Images/ArrowDownIcon.svg";
import { withErrorBoundary } from 'react-error-boundary';

export interface SelectedOrganization {
    id: string | number;
    text: string;
    effectiveStartDate: string | null;
    effectiveEndDate: string | null;
}

interface FormValues {
    selectedOrganizations: SelectedOrganization[];
}

const OrganizationSelector = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [organizations, setOrganizations] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    const { values, setFieldValue, errors, touched } = useFormikContext<FormValues>();

    const selectedOrganizations = values.selectedOrganizations || [];

    useEffect(() => {
        const fetchOrganizations = async () => {
            setLoading(true);
            try {
                const response = await fetchCompanies(0);
                console.log("Raw fetchCompanies response:", response);
                setOrganizations(response ? response : []);
            } catch (error) {
                console.error('Error fetching organizations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrganizations();
    }, []);

    // Check if an organization is selected
    const isSelected = (id: number) => {
        return selectedOrganizations.some(org => org.id === id);
    };

    const handleSelect = (id: number) => {
        const updatedOrganizations = [...selectedOrganizations];

        // Add newly selected organizations
        if (!isSelected(id)) {
            const org = organizations.find((o: any) => o.id === id);
            if (org) {
                updatedOrganizations.push({
                    id: org.id,
                    text: org.org_name,
                    effectiveStartDate: "",
                    effectiveEndDate: "",
                });
            }
        } else {
            // Remove unselected organizations
            setFieldValue(
                "selectedOrganizations",
                updatedOrganizations.filter((org) => org.id !== id)
            );
            return;
        }

        setFieldValue("selectedOrganizations", updatedOrganizations);
    };

    const handleToggle = () => setMenuOpen((prev) => !prev);

    return (
        <Box sx={{ mb: 3 }}>
            <label className="text-[14px] font-['Roboto'] text-[#334155]">Assign this insurance plan to an organization</label>
            {selectedOrganizations?.length === 0 ? (
                <NoBox mode="assignPlan" />
            ) : (
                <TableContainer component={Paper} sx={{ mb: 2, border: "1px solid #D8DADC", boxShadow: "none" }}>
                    <Table size="small">
                        <TableHead style={{ backgroundColor: "#F3F4F6" }}>
                            <TableRow style={{ width: "100%" }}>
                                <TableCell style={{ fontSize: "11px", padding: "5px 10px", color: "#919191" }}>Organization</TableCell>
                                <TableCell style={{ fontSize: "11px", padding: "5px", color: "#919191" }}>Effective Start Date*</TableCell>
                                <TableCell style={{ fontSize: "11px", padding: "5px", color: "#919191" }} >Effective End Date</TableCell>
                                <TableCell style={{ padding: "0" }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <FieldArray
                                name="selectedOrganizations"
                                render={arrayHelpers => (
                                    <>
                                        {selectedOrganizations.map((org, index) => (
                                            <TableRow key={org.id}>
                                                <TableCell style={{ padding: "5px 10px", color: "#334155", fontSize: "11px" }}>{org.text}</TableCell>
                                                <TableCell style={{ padding: "5px 10px 5px 5px" }}>
                                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                        <DatePicker
                                                            sx={{
                                                                '& .MuiInputBase-root': {
                                                                    height: '28px',
                                                                    minWidth: '95px',
                                                                    backgroundColor: "#F3F4F6",
                                                                    '& .MuiInputBase-input': {
                                                                        padding: '2px 2px 2px 5px',
                                                                        fontSize: '11px',
                                                                    }
                                                                },
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    border: "1px dashed #D8DADC",
                                                                    // borderWidth: '1px',
                                                                },
                                                                '& .MuiIconButton-root': {
                                                                    padding: '2px',
                                                                    width: '20px',
                                                                    height: '20px',
                                                                },
                                                                '& .MuiSvgIcon-root': {
                                                                    fontSize: '15px',
                                                                    padding: "0px"
                                                                }
                                                            }}
                                                            value={
                                                                org.effectiveStartDate && isValid(parse(org.effectiveStartDate, "yyyy-MM-dd", new Date()))
                                                                    ? parse(org.effectiveStartDate, "yyyy-MM-dd", new Date())
                                                                    : null
                                                            }
                                                            onChange={(date) => {
                                                                if (date && isValid(date)) {
                                                                    const formattedBackend = format(date, "yyyy-MM-dd");
                                                                    setFieldValue(`selectedOrganizations[${index}].effectiveStartDate`, formattedBackend);
                                                                } else {
                                                                    setFieldValue(`selectedOrganizations[${index}].effectiveStartDate`, "");// Clear if invalid
                                                                }

                                                            }}
                                                            format="MM/dd/yy"
                                                            slotProps={{
                                                                textField: {
                                                                    placeholder: "MM/DD/YY",
                                                                    size: 'small',
                                                                    error: Boolean(
                                                                        touched.selectedOrganizations?.[index]?.effectiveStartDate &&
                                                                        (errors.selectedOrganizations as FormikErrors<SelectedOrganization[]>)?.[index]?.effectiveStartDate
                                                                    ),
                                                                    helperText:
                                                                        touched.selectedOrganizations?.[index]?.effectiveStartDate &&
                                                                            (errors.selectedOrganizations as FormikErrors<SelectedOrganization[]>)?.[index]?.effectiveStartDate
                                                                            ? String(
                                                                                (errors.selectedOrganizations as FormikErrors<SelectedOrganization[]>)[index]?.effectiveStartDate
                                                                            )
                                                                            : '',
                                                                },
                                                            }}
                                                        />
                                                    </LocalizationProvider>
                                                </TableCell>
                                                <TableCell style={{ padding: "5px" }}>
                                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                        <DatePicker
                                                            sx={{
                                                                '& .MuiInputBase-root': {
                                                                    height: '28px',
                                                                    minWidth: '95px',
                                                                    backgroundColor: "#F3F4F6",
                                                                    '& .MuiInputBase-input': {
                                                                        padding: '2px 2px 2px 5px',
                                                                        fontSize: '11px',
                                                                    }
                                                                },
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    border: "1px dashed #D8DADC",
                                                                    // borderWidth: '1px',
                                                                },
                                                                '& .MuiIconButton-root': { // CSS for calendar icon button & for making icon smaller
                                                                    padding: '1px',
                                                                    width: '20px',
                                                                    height: '20px',
                                                                },
                                                                '& .MuiSvgIcon-root': { // Target the calendar icon itself
                                                                    fontSize: '15px',
                                                                    padding: "0px"  // Make the icon smaller
                                                                }
                                                            }}
                                                            value={
                                                                org.effectiveEndDate && isValid(parse(org.effectiveEndDate, "yyyy-MM-dd", new Date()))
                                                                    ? parse(org.effectiveEndDate, "yyyy-MM-dd", new Date())
                                                                    : null
                                                            }
                                                            onChange={(date) => {
                                                                if (date && isValid(date)) {
                                                                    const formattedBackend = format(date, "yyyy-MM-dd");
                                                                    setFieldValue(`selectedOrganizations[${index}].effectiveEndDate`, formattedBackend);
                                                                } else {
                                                                    setFieldValue(`selectedOrganizations[${index}].effectiveEndDate`, "");// Clear if invalid
                                                                }
                                                            }}
                                                            format='MM/dd/yy'
                                                            slotProps={{
                                                                textField: {
                                                                    placeholder: "MM/DD/YY",
                                                                    size: 'small',
                                                                    InputProps: {
                                                                        style: { fontSize: '11px' }
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </LocalizationProvider>
                                                </TableCell>
                                                <TableCell style={{ padding: "0" }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => arrayHelpers.remove(index)}
                                                        aria-label="delete"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                )}
                            />
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <div style={{ display: "flex", width: "100%", flexDirection: "column", marginTop: "10px" }} >
                <div
                    className="rounded-t-[4px] border border-[#d8dadc] h-[24px] hover:cursor-pointer hover:bg-[#d8dadc]"
                    style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "20px 15px" }}
                    onClick={handleToggle}
                >
                    <span className={`text-[14px] font-['Roboto'] flex-1 ${selectedOrganizations.length > 0 ? 'text-[#334155]' : 'text-[#919191]'}`} >
                        {selectedOrganizations.length > 0
                            ? `${selectedOrganizations.length} selected`
                            : "Select organization(s)"}
                    </span>
                    {menuOpen ? (
                        <img src={ArrowUpIcon} alt="Up" width={20} height={20} />
                    ) : (
                        <img src={ArrowDownIcon} alt="Down" width={20} height={20} />
                    )}
                </div>
                {menuOpen && (
                    <div
                        className='max-h-[250px] w-full overflow-auto text-xs border p-1 border-t-0 border-[#D8DADC] rounded-b-[5px]'
                    >
                        {organizations.map((org: any) => (
                            <label
                                key={org.id}
                                className="flex items-center gap-0 cursor-pointer hover:bg-gray-100"
                            >
                                <Checkbox
                                    checked={isSelected(org.id)}
                                    onChange={() => handleSelect(org.id)}
                                    size="small"
                                    sx={{
                                        '&.Mui-checked .MuiSvgIcon-root': {
                                            color: '#18D9B3',
                                        },
                                        '&.MuiCheckbox-root': {
                                            color: '#D8DADC',
                                        },
                                    }}
                                />
                                <span
                                // className="text-[12px] text-[#334155] font-['Roboto'] leading-[16px] tracking-[0.4px] whitespace-nowrap overflow-hidden text-ellipsis !text-black !block"
                                >{org.org_name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </Box>
    );
};

export default withErrorBoundary(OrganizationSelector, {
    fallback: <div>Error Loading</div>,
    onError(error, info) {
        console.log(error)
    },
});