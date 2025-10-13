import React, { useState, useMemo } from 'react';

interface PaginationProps {
  data: any[];
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  showInfo?: boolean;
}

export const OptimizedPagination: React.FC<PaginationProps> = React.memo(({ 
  data, 
  itemsPerPage = 10, 
  onPageChange,
  showInfo = true 
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      paginatedData,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    };
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const handlePrev = () => {
    if (paginationData.hasPrev) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (paginationData.hasNext) {
      handlePageChange(currentPage + 1);
    }
  };

  if (paginationData.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      {showInfo && (
        <div className="text-sm text-gray-700">
          Affichage de {paginationData.startIndex + 1} à {Math.min(paginationData.endIndex, data.length)} sur {data.length} résultats
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrev}
          disabled={!paginationData.hasPrev}
          className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
            let pageNum;
            if (paginationData.totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= paginationData.totalPages - 2) {
              pageNum = paginationData.totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={handleNext}
          disabled={!paginationData.hasNext}
          className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  );
});

OptimizedPagination.displayName = 'OptimizedPagination';

// Hook pour utiliser la pagination
export function usePagination<T>(data: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      paginatedData,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      currentPage
    };
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationData.totalPages)));
  };

  const nextPage = () => {
    if (paginationData.hasNext) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (paginationData.hasPrev) {
      goToPage(currentPage - 1);
    }
  };

  return {
    ...paginationData,
    goToPage,
    nextPage,
    prevPage
  };
}
