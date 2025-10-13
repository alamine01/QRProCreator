import React from 'react';

interface ResponsiveTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (item: any) => React.ReactNode;
    mobileHidden?: boolean;
  }[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = React.memo(({ 
  data, 
  columns, 
  loading = false, 
  emptyMessage = 'Aucune donnée disponible',
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
        <div className="p-6 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée</h3>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs">
                    <div className="truncate">
                      {column.render ? column.render(item) : item[column.key]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden">
        <div className="p-4 space-y-4">
          {data.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
              {columns.filter(col => !col.mobileHidden).map((column) => (
                <div key={column.key} className="flex flex-col space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{column.label}</span>
                  <div className="text-sm text-gray-900 break-words overflow-hidden">
                    {column.render ? column.render(item) : item[column.key]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ResponsiveTable.displayName = 'ResponsiveTable';

export default ResponsiveTable;
