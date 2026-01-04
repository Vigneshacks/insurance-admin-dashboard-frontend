import { Field, ErrorMessage, useField } from "formik";
import { TextField, MenuItem, Select, FormControl, InputLabel, Checkbox, ListItemText, OutlinedInput } from "@mui/material";

export interface FieldConfig {
    name: string | number | any;
    label: string | any;
    placeholder?: string | any;
    type: "text" | "email" | "date" | "select" | "multi-select" | any;
    options?: { label: string; value: string }[];
    disabled?: boolean;
    onChange?: (value: string | string[]) => void;
}

const GenericFormField: React.FC<FieldConfig> = ({ name, label, placeholder, type, options = [], disabled, onChange }) => {
    const [field, meta, helpers] = useField(name);

    const handleChange = (event: any) => {
        const value = event.target.value;
        helpers.setValue(value);
        if (onChange) onChange(value);
    };

    return (
        <FormControl fullWidth margin="normal" disabled={disabled}>
            {type !== "multi-select" && <InputLabel shrink>{label}</InputLabel>}

            {type === "text" || type === "email" || type === "date" ? (
                <TextField
                    {...field}
                    type={type}
                    placeholder={placeholder}
                    fullWidth
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched && meta.error}
                />
            ) : type === "select" ? (
                <Select {...field} onChange={handleChange} displayEmpty fullWidth>
                    <MenuItem value="" disabled>
                        {placeholder}
                    </MenuItem>
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            ) : type === "multi-select" ? (
                <Select
                    multiple
                    {...field}
                    onChange={handleChange}
                    input={<OutlinedInput />}
                    renderValue={(selected) =>
                        (selected as string[]).map(
                            (value) => options.find((opt) => opt.value === value)?.label
                        ).join(", ")
                    }
                    fullWidth
                >
                    {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            <Checkbox checked={(field.value || []).includes(option.value)} />
                            <ListItemText primary={option.label} />
                        </MenuItem>
                    ))}
                </Select>
            ) : null}

            <ErrorMessage name={name} component="div" />
        </FormControl>
    );
};

export default GenericFormField;
