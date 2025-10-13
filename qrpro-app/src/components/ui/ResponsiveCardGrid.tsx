import React from 'react';

interface ResponsiveCardGridProps {
  data: any[];
  renderCard: (item: any, index: number) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const ResponsiveCardGrid: React.FC<ResponsiveCardGridProps> = React.memo(({ 
  data, 
  renderCard, 
  loading = false, 
  emptyMessage = 'Aucune donnée disponible',
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée</h3>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {data.map((item, index) => (
          <div key={index}>
            {renderCard(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

ResponsiveCardGrid.displayName = 'ResponsiveCardGrid';

export default ResponsiveCardGrid;
