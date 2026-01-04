// types/tableTypes.ts

export interface TableMenuOption {
    label: string;
    onClick: (row: any) => void;
    variant?: 'default' | 'danger';
  }
  
  export interface MenuProps {
    row: any;
    type: 'organization' | 'user';
    isOpen: boolean;
    onClose: () => void;
    onView: (row: any) => void;
    onEdit: (row: any) => void;
    onRemove?: (row: any) => void;
  }
  
  export interface TableData {
    id: string;
    originalId?: string;
    [key: string]: any;
  }
  
  export interface TableProps {
    nodes: TableData[];
    headers: string[];
    itemsPerPage?: number;
    className?: string;
    paginationClassName?: string;
    type: 'organization' | 'user';
    onDataUpdate?: () => void;
    onViewClick?: (id: string) => void;
    onRowSelect?: (id: string) => void;
    selectedRows?: string[];
  }