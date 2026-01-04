import {
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    OutlinedInput,
    Chip,
    InputAdornment,
} from "@mui/material";
import { FieldProps } from "formik";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React, { JSX } from "react";
import * as Yup from "yup";
import CalenderIcon from "../../../assets/Images/calenderIcon.svg"
import CloseIcon from '@mui/icons-material/Close';
import ArrowDownIcon from "../../../assets/Images/ArrowDownIcon.svg"
import ArrowUpIcon from "../../../assets/Images/ArrowUpIcon.svg"
import { format, isValid, parse } from "date-fns";

export interface FieldConfig {
    name: string;
    label: string;
    placeholder?: string;
    type: "number" | "email" | "phone" | "text" | "date" | "select" | "multi-select" | "custom";
    validation?: Yup.StringSchema<string | undefined, Yup.AnyObject, string | undefined>
    | Yup.DateSchema<Date | undefined, Yup.AnyObject, Date | undefined>
    | Yup.ArraySchema<string[], Yup.AnyObject, string[]> | any;
    startAdornment?: JSX.Element;
    options?: { label: string; value: string }[];
    customComponent?: any;
    disabled?: boolean;
    onChange?: (selectedValue: any) => void;
    rounded?: boolean;
}

interface FormFieldProps extends FieldProps {
    fieldConfig: FieldConfig;
}

const FormField: React.FC<FormFieldProps> = ({ field, form, fieldConfig }) => {
    const { name, label, type = "text", options, customComponent, placeholder, startAdornment, disabled = false, onChange, rounded = false } = fieldConfig;
    const error = Boolean(form.errors[name] && form.touched[name]);
    const helperText = error ? String(form.errors[name]) : "";
    const [open, setOpen] = React.useState(false);

    const handleMultiSelectChange = (event: any) => {
        const { value } = event.target;
        form.setFieldValue(name, typeof value === "string" ? value.split(",") : value);
    };

    const commonStyles = {
        "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#D8DADC" },
            "&:hover fieldset": { borderColor: "#18D9B3" },
            "&.Mui-focused fieldset": { borderColor: "#18D9B3", borderWidth: "1px" },
        },
        "& label": { color: "#1E4477", fontSize: "small", fontWeight: "400" },
        "& label.Mui-focused": { color: "#1E4477" },
        "& .MuiInputBase-root": { fontSize: "small" },
        width: "100%",
        // maxWidth: "550px",
        "& .MuiFormHelperText-root": { fontSize: "10px" }
    };

    switch (type) {
        case "text":
        case "number":
        case "email":
        case "phone":
            return (
                <TextField
                    {...field}
                    label={label}
                    type={type === "phone" ? "tel" : type}
                    fullWidth
                    multiline
                    disabled={disabled}
                    error={error}
                    placeholder={placeholder}
                    helperText={helperText}
                    slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                            startAdornment: startAdornment ? (
                                <InputAdornment style={{ width: 24, height: 24, color: "#1E4477" }} position="start">{startAdornment}</InputAdornment>
                            ) : null,
                        },
                    }}
                    sx={commonStyles}
                />
            );

        case "date":
            return (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        disabled={disabled}
                        label={label}
                        format="MM/dd/yy"
                        value={
                            // field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : null
                            field.value && isValid(parse(field.value, "yyyy-MM-dd", new Date()))
                                ? parse(field.value, "yyyy-MM-dd", new Date())
                                : null
                        }
                        onChange={(date) => {
                            if (date && isValid(date)) {
                                // Format for Backend (yyyy-MM-dd)
                                const formattedBackend = format(date, "yyyy-MM-dd");
                                form.setFieldValue(name, formattedBackend);
                            } else {
                                form.setFieldValue(name, ""); // Clear if invalid
                            }
                        }}
                        slots={{
                            openPickerIcon: () => <div className="p-2"> <img src={CalenderIcon} alt="Calendar" width={18} height={18} /></div>,
                        }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: error,
                                helperText: helperText,
                                sx: commonStyles,
                                placeholder: "MM/DD/YY",
                                InputLabelProps: { shrink: true },
                            },
                        }}
                    />
                </LocalizationProvider>
            );

        case "select":
            return (
                <FormControl fullWidth error={error} sx={commonStyles} disabled={disabled}>
                    <InputLabel id={`${name}-label`} shrink={true}>
                        {label}
                    </InputLabel>
                    <Select
                        {...field}
                        labelId={`${name}-label`}
                        id={`${name}-select`}
                        displayEmpty
                        disabled={disabled}
                        value={field.value || ""}
                        onChange={(event) => {
                            form.setFieldValue(name, event.target.value);
                            if (fieldConfig.onChange) fieldConfig.onChange(event.target.value); // Calling the external function
                        }}
                        onOpen={() => setOpen(true)}
                        onClose={() => setOpen(false)}
                        input={<OutlinedInput label={label} notched />}
                        sx={commonStyles}
                        IconComponent={(props) => (
                            <div
                                {...props}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen((prev) => !prev);
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%",
                                    width: "30px",
                                    position: "absolute",
                                    right: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                }}
                            >
                                {open ? (
                                    <img src={ArrowUpIcon} alt="Up" width={20} height={20} />
                                ) : (
                                    <img src={ArrowDownIcon} alt="Down" width={20} height={20} />
                                )}
                            </div>
                        )}

                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    maxHeight: 200,
                                    "& .MuiMenuItem-root": {
                                        fontSize: "12px",
                                        padding: "6px 12px",
                                    },
                                },
                            },
                        }}
                        renderValue={(selected) => {
                            const isRounded = rounded;
                            const selectedOption = options?.find((o) => o.value === selected)?.label;

                            return selected ? (
                                <span style={{ color: isRounded ? "#0C6D5A" : "#334155", backgroundColor: isRounded ? "#E8FBF7" : "transparent", padding: isRounded ? "5px 10px" : "0px", borderRadius: isRounded ? "15px" : "none", fontWeight: isRounded ? "500" : "400", fontSize: "12px" }}>
                                    {selectedOption}
                                </span>
                            ) : (
                                <span style={{ color: "#919191" }}>{placeholder || "Select a value"}</span>
                            )
                        }}
                    >
                        <MenuItem value="" disabled>
                            {placeholder || "Select a value"}
                        </MenuItem>
                        {options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                    {error && <p style={{ color: "#D32F2F", fontSize: "10px", margin: "3px 14px 0px", fontFamily: "Roboto" }}>{helperText}</p>}
                </FormControl>
            )
        case "multi-select":
            return (
                <FormControl fullWidth error={error} sx={commonStyles} disabled={disabled}>
                    <InputLabel id={`${name}-label`} shrink={true}>
                        {label}
                    </InputLabel>
                    <Select
                        {...field}
                        labelId={`${name}-label`}
                        id={`${name}-select`}
                        multiple
                        disabled={disabled}
                        displayEmpty
                        value={field.value || []}
                        onChange={handleMultiSelectChange}
                        onOpen={() => setOpen(true)}
                        onClose={() => setOpen(false)}
                        input={<OutlinedInput label={label} notched />}
                        IconComponent={(props) => (
                            <div
                                {...props}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevents the dropdown from closing when clicking the icon
                                    setOpen((prev) => !prev);
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%",
                                    width: "30px",
                                    position: "absolute",
                                    right: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                }}
                            >
                                {open ? (
                                    <img src={ArrowUpIcon} alt="Up" width={20} height={20} />
                                ) : (
                                    <img src={ArrowDownIcon} alt="Down" width={20} height={20} />
                                )}
                            </div>
                        )}
                        sx={commonStyles}
                        renderValue={(selected) =>
                            selected.length === 0 ? (
                                <span style={{ color: "#919191" }}>{placeholder || "Select options"}</span>
                            ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                    {selected.map((value: string) => (
                                        // <div key={value} onClick={(e) => e.stopPropagation()}>
                                        <Chip
                                            key={value}
                                            label={options?.find((o) => o.value === value)?.label}
                                            onDelete={(event) => {
                                                event.stopPropagation(); // Prevent dropdown from opening
                                                const newSelected = selected.filter((item: any) => item !== value);
                                                form.setFieldValue(name, newSelected);
                                            }}
                                            deleteIcon={
                                                <CloseIcon style={{ height: 15, width: 15, cursor: "pointer" }}
                                                    onMouseDown={(event: any) => event.stopPropagation()}
                                                />
                                            }
                                            sx={{
                                                backgroundColor: "#F3F4F6",
                                                color: "#494949",
                                                fontWeight: "500",
                                                fontSize: "11px",
                                                padding: "5px",
                                                display: "inline-flex",
                                                wordBreak: "break-word",
                                                wordWrap: "break-word",
                                                "& .MuiChip-deleteIcon": {
                                                    color: "#919191",
                                                    "&:hover": { color: "#ff4081" },
                                                },
                                            }}
                                        />
                                        // </div>
                                    ))}
                                </div>
                            )
                        }
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    maxHeight: 200,
                                    // maxWidth: 300,
                                    // overflowX: "scroll",
                                    "& .MuiMenuItem-root": {
                                        fontSize: "12px",
                                        padding: "6px 12px",
                                    },
                                },
                            },
                        }}
                    >
                        <MenuItem value="" disabled>
                            {placeholder || "Select options"}
                        </MenuItem>
                        {options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                    {error && <p style={{ color: "#D32F2F", fontSize: "10px", margin: "3px 14px 0px", fontFamily: "Roboto" }}>{helperText}</p>}
                </FormControl>
            );


        case "custom":
            return customComponent || null;

        default:
            return <TextField {...field} label={label} fullWidth error={error} helperText={helperText} />;
    }
};

export default FormField;
