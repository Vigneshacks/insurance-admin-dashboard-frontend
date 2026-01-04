interface InsurancePlan {
  id: number;
  planName: string;
  provider: string;
  type: string;
  planType: string;
  startDate: string;
  activeOrganizations: string;
  notes: string;
  selected: boolean;
}

interface InsuranceTableProps {
  data: InsurancePlan[];
  onRowSelect: (item: InsurancePlan) => void;
}

const InsuranceTable: React.FC<InsuranceTableProps> = ({ data = [], onRowSelect }) => {
  return (
    <div className="mt-4 w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Plan Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Pro
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Preset
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Plan Type
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Start Date
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Active Organizations
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={item.selected}
                  onChange={() => onRowSelect(item)}
                />
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {item.planName}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {item.provider}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.type === "Standard Plan"
                      ? "bg-blue-900 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.type}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {item.planType}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {item.startDate}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {item.activeOrganizations}
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-500">
                {item.notes}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InsuranceTable;
