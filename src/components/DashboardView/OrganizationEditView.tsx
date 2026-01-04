import React, { useState, useEffect } from 'react';
import Tables from '../tables/Tables';

interface TableWithColumnVisibilityProps {
  nodes: any[];
  allHeaders: string[];
  visibleColumns: string[];
  type: string;
  itemsPerPage?: number;
  isEditing: boolean;
  onEdit: (updatedData: any) => void;
  className?: string;
  onViewClick?: (id: string) => void;
}

const TableWithColumnVisibility: React.FC<TableWithColumnVisibilityProps> = ({
  nodes,
  allHeaders,
  visibleColumns,
  type,
  itemsPerPage = 3,
  isEditing,
  onEdit,
  className,
  onViewClick
}) => {
  const [localVisibleColumns, setLocalVisibleColumns] = useState(visibleColumns);
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;
      
      // Format as MM/DD/YY
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      
      return `${month}/${day}/${year}`;
    } catch (error) {
      // Return original string if any error occurs
      return dateString;
    }
  };

  // Create a mapping for header display names to data keys
  const headerToKeyMap: { [key: string]: string } = {
    'Organization': 'organization',
    'Users': 'users',
    'Address': 'address',
    'Billing Contact': 'billingcontact',
    'Billing Email': 'billingemail',
    'Start Date': 'startdate',
    'Renewal Date': 'renewaldate',
    'Tier': 'tier',
    'Name': 'name',
    'Email': 'email',
    'Phone Number': 'phonenumber',
    'Role': 'role',
    'Assigned Insurance Plans': 'assignedInsurancePlans',
  };

  // Get the visible headers based on selected columns
  const filteredHeaders = allHeaders.filter(header => 
    localVisibleColumns.includes(header)
  );

  // Transform the nodes data to match the visible columns
  const transformedNodes = nodes.map(node => {
    const transformedNode: any = {};
    
    // Map each visible column to its corresponding data
    localVisibleColumns.forEach(columnHeader => {
      const dataKey = headerToKeyMap[columnHeader];
      if (dataKey) {
        // Convert the data key to lowercase to match the Table component's expectations
        const lowerCaseKey = columnHeader.toLowerCase().replace(/\s+/g, '');
        transformedNode[lowerCaseKey] = node[dataKey];
        if (dataKey === 'startdate' || dataKey === 'renewaldate') {
          transformedNode[lowerCaseKey] = formatDate(node[dataKey]);
        } else {
          transformedNode[lowerCaseKey] = node[dataKey];
        }
      }
      
    });

    // Preserve the id and any other required fields
    transformedNode.id = node.id;
    transformedNode.originalId = node.originalId;
    
    // For user type, ensure role is properly set for UserBox component
    if (type === 'user' && node.role) {
      transformedNode.role = node.role;
    }

    return transformedNode;
  });

  useEffect(() => {
    setLocalVisibleColumns(visibleColumns);
  }, [visibleColumns]);

  return (
    <Tables
      nodes={transformedNodes}
      headers={filteredHeaders}
      type={type}
      itemsPerPage={itemsPerPage}
      className={className}
      isEditing={isEditing}
      onEdit={onEdit}
      onViewClick={onViewClick}
      
    />
  );
};

interface CustomColumnManagerProps {
  title: string;
  availableColumns: string[];
  visibleColumns: string[];
  onVisibilityChange: (newVisibleColumns: string[]) => void;
  children: React.ReactElement;
}

const CustomColumnManager: React.FC<CustomColumnManagerProps> = ({
  title,
  availableColumns,
  visibleColumns,
  onVisibilityChange,
  children
}) => {
  const [localVisibleColumns, setLocalVisibleColumns] = useState(visibleColumns);

  useEffect(() => {
    setLocalVisibleColumns(visibleColumns);
  }, [visibleColumns]);

  const updateVisibility = (newVisibleColumns: string[]) => {
    setLocalVisibleColumns(newVisibleColumns);
    onVisibilityChange(newVisibleColumns);
  };

  return (
    <div className="w-full">
      <div className="mb-4 rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <div className="p-4">
          {React.cloneElement(children, {
            visibleColumns: localVisibleColumns,
            onVisibilityChange: updateVisibility
          })}
        </div>
      </div>
    </div>
  );
};

export { TableWithColumnVisibility, CustomColumnManager };