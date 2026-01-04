import { useState, useRef, useCallback, useEffect } from "react";

import NoBox from "./NoBox";
import ThreeDotsIcon from "../../../../tablemenu/TableMenu/ThreeDotsIcon";

interface Position {
  x: number;
  y: number;
}

const DocumentMenu = ({
  isOpen,
  position,
  onView,
  onRename,
  onReplace,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: Position;
  onView: () => void;
  onRename: () => void;
  onReplace: () => void;
  onDelete: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50 flex w-36 flex-col items-start gap-2.5 rounded-md border border-[#d8dadc] bg-white px-0 pt-3 pb-3 shadow-lg"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: "translate(-80%, -100%)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-start gap-2.5 self-stretch px-3">
        <button
          className="flex w-full items-center gap-2.5 self-stretch rounded-md bg-[#e8f3ff] p-3 text-left text-xs font-medium text-[#1e4477] hover:bg-[#d1e7ff]"
          onClick={onView}
        >
          View
        </button>
      </div>
      <button
        className="flex w-full items-center gap-2.5 self-stretch px-2 py-2 text-left text-xs font-medium text-[#1e4477] hover:bg-gray-50"
        onClick={onRename}
      >
        Rename
      </button>
      <button
        className="flex w-full items-center gap-2.5 self-stretch px-2 py-2 text-left text-xs font-medium text-[#1e4477] hover:bg-gray-50"
        onClick={onReplace}
      >
        Replace
      </button>
      <button
        className="flex w-full items-center gap-2.5 self-stretch px-2 py-2 text-left text-xs font-medium text-[#d21414] hover:bg-gray-50"
        onClick={onDelete}
      >
        Delete
      </button>
    </div>
  );
};

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
  >
    <path
      d="M5 6.75L9 2.75L13 6.75"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 2.75V12.25"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.75 15.25H15.25"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface DocumentRowProps {
  file: { name: string };
  onRename: () => void;
  isRenaming: boolean;
  newName: string;
  setNewName: (name: string) => void;
  confirmRename: () => void;
  uploadDate: string;
}

const DocumentRow = ({
  file,
  isRenaming,
  newName,
  setNewName,
  confirmRename,
  uploadDate,
}: DocumentRowProps) => {
  if (isRenaming) {
    return (
      <div className="flex h-10 flex-row items-center justify-center px-1 text-xs">
        <div className="flex-1">
          <div className="flex items-center gap-5 self-stretch rounded-md border border-[#d8dadc] bg-white p-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRename();
              }}
              className="flex-1 text-xs text-[#334155] outline-none"
              autoFocus
            />
            <button
              onClick={confirmRename}
              className="flex items-center justify-center"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.75 9.5L6.5 13.25L15.25 4.5"
                  stroke="#1E4477"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="w-5" />
      </div>
    );
  }

  return (
    <div className="flex h-10 flex-row items-center justify-center px-1 text-xs">
      <div className="flex-3 overflow-hidden text-xs leading-4 font-normal tracking-wider text-ellipsis text-[#334155]">
        {file.name}
      </div>
      <div className="flex-2 overflow-hidden text-xs leading-4 font-normal tracking-wider text-ellipsis text-[#334155]">
        {uploadDate}
      </div>
      <div className="w-5" />
    </div>
  );
};

// Define a type for document objects
interface DocumentItem {
  id: string;
  name: string;
  file?: File | null;
  url?: string;
  uploadedDate?: string;
}

// Update the props interface to include the initial documents
interface DocumentsUploaderProps {
  onFilesChange?: (files: File[]) => void;
  onDocumentUpdate?: (documents: DocumentItem[]) => void;
  initialDocuments?: DocumentItem[];
}

const DocumentsUploader = ({
  onFilesChange,
  onDocumentUpdate,
  initialDocuments = [],
}: DocumentsUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [displayItems, setDisplayItems] = useState<
    Array<{ name: string; url?: string; isExisting?: boolean }>
  >([]);
  const [uploadDates, setUploadDates] = useState<string[]>([]);
  const [menuState, setMenuState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    fileIndex: -1,
  });
  const [renamingState, setRenamingState] = useState({
    isRenaming: false,
    fileIndex: -1,
    newName: "",
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);

  // Process initial documents
  useEffect(() => {
    if (initialDocuments && initialDocuments.length > 0) {
      // Set display items for both existing documents and new files
      setDisplayItems(
        initialDocuments.map((doc) => ({
          name: doc.name,
          url: doc.url,
          isExisting: true,
        }))
      );

      // Set upload dates for initial documents
      setUploadDates(
        initialDocuments.map((doc) => doc.uploadedDate || getCurrentDate())
      );
    }
  }, [initialDocuments]);

  // Get current date in MM/DD/YYYY format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Call the callback whenever files change
  useEffect(() => {
    if (onFilesChange) {
      onFilesChange(files);
    }
  }, [files, onFilesChange]);

  // Update display items when files change
  useEffect(() => {
    setDisplayItems((prev) => {
      // Keep existing documents
      const existingDocs = prev.filter((item) => item.isExisting);
      // Add new files
      const newFileItems = files.map((file) => ({
        name: file.name,
        isExisting: false,
      }));
      return [...existingDocs, ...newFileItems];
    });

    // Add upload dates for new files if needed
    if (files.length > uploadDates.length - (initialDocuments?.length || 0)) {
      const currentDate = getCurrentDate();
      const newDatesCount =
        files.length - (uploadDates.length - (initialDocuments?.length || 0));
      const newDates = Array(newDatesCount).fill(currentDate);
      setUploadDates((prevDates) => [...prevDates, ...newDates]);
    }
  }, [files, initialDocuments]);

  useEffect(() => {
    if (onDocumentUpdate && displayItems.length > 0) {
      const updatedDocuments: DocumentItem[] = displayItems.map(
        (item, index) => {
          if (item.isExisting) {
            // For existing documents, return with updated name
            return {
              id: initialDocuments?.length
                ? initialDocuments[index]?.id
                : `existing-${index}`,
              name: item.name,
              url: item.url,
              uploadedDate: uploadDates[index],
            };
          } else {
            // For new files, get the corresponding file from files array
            const fileIndex = index - (initialDocuments?.length || 0);
            return {
              id: `new-${fileIndex}`,
              name: item.name,
              file:
                fileIndex >= 0 && fileIndex < files.length
                  ? files[fileIndex]
                  : undefined,
              uploadedDate: uploadDates[index],
            };
          }
        }
      );
      onDocumentUpdate(updatedDocuments);
    }
  }, [displayItems, files, initialDocuments, onDocumentUpdate, uploadDates]);

  const handleMenuOpen = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuState({
      isOpen: true,
      position: {
        x: rect.left,
        y: rect.top,
      },
      fileIndex: index,
    });
  };

  const handleView = () => {
    const item = displayItems[menuState.fileIndex];
    if (item.isExisting && item.url) {
      // Open URL for existing document
      window.open(item.url, "_blank");
    } else {
      // Create object URL for uploaded PDF viewing
      const fileIndex = menuState.fileIndex - (initialDocuments?.length || 0);
      if (fileIndex >= 0 && files[fileIndex]) {
        const url = URL.createObjectURL(files[fileIndex]);
        window.open(url, "_blank");
      }
    }
    setMenuState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleRename = () => {
    const item = displayItems[menuState.fileIndex];
    setRenamingState({
      isRenaming: true,
      fileIndex: menuState.fileIndex,
      newName: item.name,
    });
    setMenuState((prev) => ({ ...prev, isOpen: false }));
  };

  const confirmRename = () => {
    if (renamingState.newName.trim()) {
      const index = renamingState.fileIndex;
      const item = displayItems[index];

      // Update display items
      setDisplayItems((prev) => {
        const newItems = [...prev];
        newItems[index] = { ...newItems[index], name: renamingState.newName };
        return newItems;
      });

      // Update files array if it's a newly uploaded file
      if (!item.isExisting) {
        const fileIndex = index - (initialDocuments?.length || 0);
        if (fileIndex >= 0 && files[fileIndex]) {
          setFiles((prevFiles) => {
            const newFiles = [...prevFiles];
            const file = newFiles[fileIndex];
            // Create new File object with new name (for UI display purposes only)
            // The actual filename won't change, but we maintain the association
            newFiles[fileIndex] = new File([file], renamingState.newName, {
              type: file.type,
              lastModified: file.lastModified,
            });
            return newFiles;
          });
        }
      }

      // The onDocumentUpdate callback will be triggered via the useEffect
    }
    setRenamingState({ isRenaming: false, fileIndex: -1, newName: "" });
  };

  const handleReplace = () => {
    replaceFileRef.current?.click();
    setMenuState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDelete = () => {
    const index = menuState.fileIndex;
    const item = displayItems[index];

    // Remove from display items
    setDisplayItems((prev) => prev.filter((_, i) => i !== index));

    // Remove upload date
    setUploadDates((prev) => prev.filter((_, i) => i !== index));

    // If it's a newly uploaded file, remove from files array
    if (!item.isExisting) {
      const fileIndex = index - (initialDocuments?.length || 0);
      if (fileIndex >= 0) {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== fileIndex));
      }
    }

    setMenuState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuState.isOpen) {
        setMenuState((prev) => ({ ...prev, isOpen: false }));
      }
    },
    [menuState.isOpen]
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);

      // Clear the input value to allow re-upload of the same file
      event.target.value = "";
    }
  };

  const onReplaceFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const index = menuState.fileIndex;
      const item = displayItems[index];

      if (item.isExisting) {
        // For existing document, add as a new file and mark the existing one as deleted
        const newFile = event.target.files[0];

        // Add the new file
        setFiles((prev) => [...prev, newFile]);

        // Update display items - remove existing and add new
        setDisplayItems((prev) => {
          const newItems = [...prev];
          newItems[index] = {
            name: newFile.name,
            isExisting: false,
          };
          return newItems;
        });

        // Update upload date
        setUploadDates((prev) => {
          const newDates = [...prev];
          newDates[index] = getCurrentDate();
          return newDates;
        });
      } else {
        // For newly uploaded file, replace it
        const fileIndex = index - (initialDocuments?.length || 0);
        if (fileIndex >= 0) {
          setFiles((prevFiles) => {
            const newFiles = [...prevFiles];
            newFiles[fileIndex] = event.target.files![0];
            return newFiles;
          });

          // Update display items
          setDisplayItems((prev) => {
            const newItems = [...prev];
            newItems[index] = {
              name: event.target.files![0].name,
              isExisting: false,
            };
            return newItems;
          });

          // Update upload date
          setUploadDates((prev) => {
            const newDates = [...prev];
            newDates[index] = getCurrentDate();
            return newDates;
          });
        }
      }

      // Clear the input value to allow re-upload of the same file
      event.target.value = "";
    }
  };

  return (
    <div className="relative space-y-1 text-xs">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-sm font-medium text-[#334155]">
          Add Plan Documents*
        </h1>
        <div
          className="flex flex-row items-center justify-center gap-1 text-[#1E4477] hover:cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <UploadIcon />
          <span>Upload File</span>
        </div>
        <input
          type="file"
          hidden
          ref={fileRef}
          multiple
          onChange={onFileChange}
          accept=".pdf" // Only accept PDF files
        />
        <input
          type="file"
          hidden
          ref={replaceFileRef}
          onChange={onReplaceFile}
          accept=".pdf" // Only accept PDF files
        />
      </div>
      {displayItems.length === 0 ? (
        <NoBox mode="documentUpload" />
      ) : (
        <>
          <div className="flex h-10 flex-row items-center justify-center border border-[#D8DADC] bg-[#F3F4F6] px-1 text-xs font-medium text-[#919191]">
            <div className="flex-3 leading-tight">Name</div>
            <div className="flex-2 leading-tight">Uploaded date</div>
            <div className="w-5"></div>
          </div>
          {displayItems.map((item, index) => (
            <div key={index} className="relative">
              <DocumentRow
                file={item}
                onRename={handleRename}
                isRenaming={
                  renamingState.isRenaming && renamingState.fileIndex === index
                }
                newName={renamingState.newName}
                setNewName={(name) =>
                  setRenamingState((prev) => ({ ...prev, newName: name }))
                }
                confirmRename={confirmRename}
                uploadDate={uploadDates[index] || getCurrentDate()}
              />
              {(!renamingState.isRenaming ||
                renamingState.fileIndex !== index) && (
                <div
                  className="absolute top-1/2 right-0 w-5 -translate-y-1/2 hover:cursor-pointer"
                  onClick={(e) => handleMenuOpen(e, index)}
                >
                  <ThreeDotsIcon />
                </div>
              )}
            </div>
          ))}
        </>
      )}
      <DocumentMenu
        isOpen={menuState.isOpen}
        onClose={() => setMenuState((prev) => ({ ...prev, isOpen: false }))}
        position={menuState.position}
        onView={handleView}
        onRename={handleRename}
        onReplace={handleReplace}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default DocumentsUploader;
