import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface OptimizedTableProps {
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export const OptimizedTable: React.FC<OptimizedTableProps> = React.memo(({ 
  data, 
  loading = false, 
  emptyMessage = 'Aucune donnée disponible',
  children 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <LoadingSpinner size="md" text="Chargement des données..." />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {children}
    </div>
  );
});

OptimizedTable.displayName = 'OptimizedTable';
