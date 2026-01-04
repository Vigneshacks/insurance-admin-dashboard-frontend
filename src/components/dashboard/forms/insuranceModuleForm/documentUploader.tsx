import React, { useState, useRef } from "react";
import { useField, useFormikContext } from "formik";
import {
    Menu,
    MenuItem,
    IconButton,
    Snackbar,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography
} from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { CheckIcon } from "lucide-react";
import UploadIcon from "../../../../assets/Images/UploadIcon.svg"
import NoBox from "../../insurancePlans/forms/components/NoBox";
import { format } from "date-fns";
import { withErrorBoundary } from "react-error-boundary"

interface UploadedFile {
    file?: File;
    fileUrl?: any;
    fileName: string;
    id: string; // Unique ID for each file
    updatedDate: Date | number | string; // Date when the file was uploaded or last modified
}

interface FileUploadProps {
    name: string;
    allowDuplicates?: boolean; // Option to allow or prevent duplicate files
    dateFormat?: "iso" | "localized"; // Format for the date
}

const FileUpload: React.FC<FileUploadProps> = ({
    name,
    allowDuplicates = false,
    dateFormat = "localized"
}) => {
    const { setFieldValue, values } = useFormikContext<any>();
    const [field, meta] = useField(name);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [editingFile, setEditingFile] = useState<string | null>(null);
    const [newFileName, setNewFileName] = useState<string>("");
    const [currentFileId, setCurrentFileId] = useState<string | null>(null);
    const [alertOpen, setAlertOpen] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const files: UploadedFile[] = values[name] || [];

    // Generate unique ID
    const generateUniqueId = (): string => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };

    const getCurrentDate = (): string => {
        const now = new Date();
        return now.toISOString().split('T')[0]; // Returns yyyy-mm-dd
    };

    // Check if file with same name exists
    const fileNameExists = (fileName: string): boolean => {
        return files.some(file => file.fileName === fileName);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, fileId: string) => {
        setAnchorEl(event.currentTarget);
        setCurrentFileId(fileId);
        setEditingFile(null); // Reset rename field when opening menu
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFiles = Array.from(event.target.files);
            let newFiles: UploadedFile[] = [];
            let duplicatesFound = false;
            const currentDate = getCurrentDate();

            selectedFiles.forEach(file => {
                if (!allowDuplicates && fileNameExists(file.name)) {
                    duplicatesFound = true;
                    setAlertMessage(`File "${file.name}" already exists. Duplicate files are not allowed.`);
                    setAlertOpen(true);
                } else {
                    newFiles.push({
                        file,
                        fileName: file.name,
                        id: generateUniqueId(),
                        updatedDate: currentDate
                    });
                }
            });
            if (newFiles.length > 0) {
                setFieldValue(name, [...files, ...newFiles]);
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // Delete File
    const handleDelete = () => {
        if (currentFileId) {
            setFieldValue(name, files.filter((file) => file.id !== currentFileId));
            handleMenuClose();
        }
    };

    const handleReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (currentFileId && event.target.files && event.target.files.length > 0) {
            const newFile = event.target.files[0];
            const currentDate = getCurrentDate();

            // Check if the new filename already exists (except for the current file)
            const fileWithSameNameExists = files.some(
                file => file.fileName === newFile.name && file.id !== currentFileId
            );

            if (!allowDuplicates && fileWithSameNameExists) {
                setAlertMessage(`File "${newFile.name}" already exists. Duplicate files are not allowed.`);
                setAlertOpen(true);
                handleMenuClose();
                return;
            }

            setFieldValue(
                name,
                files.map((file) =>
                    file.id === currentFileId ? {
                        file: newFile,
                        fileName: newFile.name,
                        id: file.id,  // Keep the same ID
                        updatedDate: currentDate,  // Update the date
                        fileUrl: undefined
                    } : file
                )
            );
        }
        handleMenuClose();
    };

    // Enable Rename Mode
    const enableRenameMode = () => {
        if (currentFileId) {
            const currentFile = files.find(file => file.id === currentFileId);
            if (currentFile) {
                setEditingFile(currentFile.id);
                setNewFileName(currentFile.fileName.substring(0, currentFile.fileName.lastIndexOf("."))); // Exclude extension from edit
                handleMenuClose();
            }
        }
    };

    const handleRenameSave = (fileId: string) => {
        const currentFile = files.find(file => file.id === fileId);
        if (!currentFile) return;

        const extension = currentFile.fileName.slice(currentFile.fileName.lastIndexOf("."));
        const newFullFileName = newFileName + extension;
        const currentDate = getCurrentDate();

        // Checkinf if new filename already exists (except for thes current file)
        const fileWithSameNameExists = files.some(
            file => file.fileName === newFullFileName && file.id !== fileId
        );

        if (!allowDuplicates && fileWithSameNameExists) {
            setAlertMessage(`Cannot rename: File "${newFullFileName}" already exists.`);
            setAlertOpen(true);
            setEditingFile(null);
            return;
        }
        setFieldValue(
            name,
            files.map((file) =>
                file.id === fileId
                    ? {
                        ...file,
                        fileName: newFullFileName,
                        updatedDate: currentDate  // Update the date when renamed
                    }
                    : file
            )
        );
        setEditingFile(null);
    };

    // View File
    // const handleView = () => {
    //     if (currentFileId) {
    //         const fileToView = files.find((file) => file.id === currentFileId);
    //         if (fileToView) {
    //             const fileURL = URL.createObjectURL(fileToView.file);
    //             window.open(fileURL, "_blank");
    //         }
    //     }
    //     handleMenuClose();
    // };
    const handleView = () => {
        if (currentFileId) {
            const fileToView = files.find((file) => file.id === currentFileId);
            if (fileToView) {
                // If it's a File object
                if (fileToView.file) {
                    const fileURL = URL.createObjectURL(fileToView.file);
                    window.open(fileURL, "_blank");
                }
                // If it's a URL string
                else if (fileToView.fileUrl) {
                    window.open(fileToView.fileUrl, "_blank");
                } else {
                    setAlertMessage("Cannot view this file. File data is missing.");
                    setAlertOpen(true);
                }
            }
        }
        handleMenuClose();
    };

    const handleCloseAlert = () => {
        setAlertOpen(false);
    };

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <label className="text-[14px] font-['Roboto'] text-[#334155]">Add Plan Documents*</label>
                <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    id="file-upload"
                    ref={fileInputRef}
                />
                <label style={{ color: "#1E4477", fontSize: "12px", fontWeight: "500", cursor: "pointer", display: "flex", flexDirection: "row" }} htmlFor="file-upload">
                    <img src={UploadIcon} /> <span> Upload File</span>
                </label>
            </div>

            {/* MUI Table for File List */}
            {files?.length === 0 ? (
                <NoBox mode="documentUpload" />
            ) : (
                <TableContainer component={Paper} sx={{ mb: 2, border: "1px solid #D8DADC", boxShadow: "none" }}>
                    <Table size="small">
                        <TableHead style={{ backgroundColor: "#F3F4F6" }}>
                            <TableRow>
                                <TableCell width="55%" style={{ fontSize: "11px", color: "#919191" }}>Name</TableCell>
                                <TableCell width="35%" style={{ fontSize: "11px", color: "#919191" }}>Updated Date</TableCell>
                                <TableCell width="10%" align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {files.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: "#334155", fontSize: "11px" }}>
                                        <Typography color="text.secondary">No files uploaded</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                files.map((file) => (
                                    <TableRow
                                        key={file.id}
                                        sx={editingFile === file.id ? { backgroundColor: 'rgba(0, 0, 0, 0.04)' } : {}}
                                    >
                                        {editingFile === file.id ? (
                                            // Rename Mode
                                            <TableCell colSpan={2} sx={{ color: "#334155", fontSize: "11px" }}>
                                                <input
                                                    style={{ fontSize: "11px", color: "#334155" }}
                                                    className="flex-1 text-xs text-[#334155] w-full outline-none"
                                                    value={newFileName}
                                                    onChange={(e) => setNewFileName(e.target.value)}
                                                    autoFocus
                                                />
                                            </TableCell>
                                        ) : (
                                            // Normal Mode - Display name and date
                                            <>
                                                <TableCell
                                                    sx={{
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'normal',
                                                        color: "#334155", fontSize: "11px"
                                                    }}
                                                >
                                                    {file.fileName}
                                                </TableCell>
                                                <TableCell sx={{ color: "#334155", fontSize: "11px" }}>
                                                    {file.updatedDate ? format(new Date(file?.updatedDate), "MM/dd/yy") : ""}
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell align="right" sx={{ padding: "10px" }}>
                                            {editingFile === file.id ? (
                                                <IconButton onClick={() => handleRenameSave(file.id)} size="small">
                                                    <CheckIcon size={16} />
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, file.id)}
                                                >
                                                    <MoreHorizIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {meta.touched && meta.error && (
                <p style={{ color: "#D32F2F", fontSize: "10px", margin: "3px 14px 0px", fontFamily: "Roboto" }}>
                    {meta.error}
                </p>
            )}

            {/* Menu Item popup */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{
                    paper: {
                        style: {
                            minWidth: "145px",
                            borderRadius: 5,
                            boxShadow: "none",
                            padding: "0 5px",
                            border: "1px solid #D8DADC"
                        },
                    },
                }}
            >
                <MenuItem
                    onClick={handleView}
                    sx={{
                        fontWeight: "500",
                        fontSize: "11px",
                        color: "#1E4477",
                        "&:hover": { backgroundColor: "#E8F3FF" },
                    }}
                >
                    View
                </MenuItem>
                <MenuItem
                    onClick={enableRenameMode}
                    sx={{
                        fontWeight: "500",
                        fontSize: "11px",
                        color: "#1E4477",
                        "&:hover": { backgroundColor: "#E8F3FF" },
                    }}
                >
                    Rename
                </MenuItem>
                <MenuItem sx={{
                    fontWeight: "500",
                    fontSize: "11px",
                    color: "#1E4477",
                    "&:hover": { backgroundColor: "#E8F3FF" },
                }}>
                    <label style={{ display: "flex", alignItems: "center", width: "100%", cursor: "pointer" }}>
                        Replace
                        <input type="file" style={{ display: "none" }} onChange={handleReplace} />
                    </label>
                </MenuItem>
                <MenuItem
                    onClick={handleDelete}
                    sx={{
                        fontWeight: "500",
                        fontSize: "11px",
                        color: "#D21414",
                        "&:hover": { backgroundColor: "#E8F3FF" },
                    }}
                >
                    Delete
                </MenuItem>
            </Menu>

            {/* Alert for duplicate files */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity="warning" sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default withErrorBoundary(FileUpload, {
    fallback: <div>Error Loading</div>,
    onError(error) {
        console.log(error)
    },
});