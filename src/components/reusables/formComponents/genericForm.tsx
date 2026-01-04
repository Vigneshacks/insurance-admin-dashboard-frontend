import { Formik, Form, Field, FormikHelpers } from "formik";
import { Button, Grid2 } from "@mui/material";
import * as Yup from "yup";
import FormField, { FieldConfig } from "./formInputFields";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ActionButtons from "../../dashboard/forms/components/UserEdit/FormComponents/ActionButtons";

interface GenericFormProps {
    fields: FieldConfig[];
    initialValues?: any;
    mode?: "create" | "edit" | "view";
    onSubmit?: (values: any) => void;
    submitButtonText?: string;
    onClose: any;
}

const GenericForm: React.FC<GenericFormProps> = ({
    fields,
    initialValues = {},
    mode = "create",
    onSubmit,
    submitButtonText,
    onClose
}) => {
    const validationSchema = Yup.object(
        fields.reduce((schema, field) => {
            if (field.validation) {
                schema[field.name] = field.validation;
            } else {
                // Default validation for required fields
                schema[field.name] = Yup.string();
            }
            return schema;
        }, {} as Record<string, Yup.AnySchema>)
    );

    const defaultValues = {
        ...Object.fromEntries(fields.map(({ name, type }) => [name, type === "multi-select" ? [] : ""])),
        ...initialValues,
    };


    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        try {
            // console.log("Form Submitted:", values);
            // API logic
            onSubmit?.(values);
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Formik
                initialValues={defaultValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({ isSubmitting, values }) => (
                    <Form className="flex flex-col h-full">
                        <Grid2 container spacing={2} sx={{ pt: 3, pb: 3, pl: 2.5, pr: 2.5, flexGrow: 1, overflowY: 'auto' }}>
                            {fields.map((fieldConfig) => (
                                <Grid2
                                    key={fieldConfig.name}
                                    sx={{ flexBasis: { xs: "100%", sm: "100%" } }}
                                >
                                    <Field
                                        name={fieldConfig.name}
                                        component={FormField}
                                        fieldConfig={{
                                            ...fieldConfig,
                                            disabled: mode === "view" || fieldConfig.disabled,
                                        }}
                                    />
                                </Grid2>
                            ))}
                        </Grid2>

                        <div className="flex justify-between items-center mt-4 px-3 pb-3 width-100%">
                            <ActionButtons
                                isSubmitting={isSubmitting}
                                disableSubmit={isSubmitting}
                                onClose={onClose}
                            />
                            {/* <Button onClick={onClose}>Cancel</Button>
                            {mode !== "view" && (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting}
                                    sx={{ mt: 2 }}
                                >
                                    {submitButtonText || (mode === "edit" ? "Save" : "Add")}
                                </Button>
                            )} */}
                        </div>
                        {/* Debug view - remove in production */}
                        {/* <pre style={{ fontSize: '10px', marginTop: '20px' }}>
                            Current Form Values: {JSON.stringify(values, null, 2)}
                        </pre> */}
                    </Form>
                )}
            </Formik>
        </LocalizationProvider>
    );
};

export default GenericForm;

