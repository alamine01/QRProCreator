import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface OptimizedSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
}

export const OptimizedSearch: React.FC<OptimizedSearchProps> = React.memo(({ 
  placeholder = "Rechercher...",
  onSearch,
  debounceMs = 300,
  className = "",
  showClearButton = true
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchQuery: string) => {
        clearTimeout(timeoutId);
        setIsSearching(true);
        timeoutId = setTimeout(() => {
          onSearch(searchQuery);
          setIsSearching(false);
        }, debounceMs);
      };
    })(),
    [onSearch, debounceMs]
  );

  // Effect to trigger search when query changes
  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      onSearch('');
    }
  }, [query, debouncedSearch, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F15A22] focus:border-transparent"
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className={`h-5 w-5 ${isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Clear Button */}
        {showClearButton && query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

OptimizedSearch.displayName = 'OptimizedSearch';

// Hook pour utiliser la recherche optimisée
export function useOptimizedSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  debounceMs: number = 300
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const query = searchQuery.toLowerCase();
    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === 'number') {
          return value.toString().includes(query);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchFields]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    filteredData,
    searchQuery,
    isSearching,
    handleSearch
  };
}
