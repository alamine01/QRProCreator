import React, { useState, useCallback, useMemo } from 'react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface OptimizedFilterProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showCount?: boolean;
}

export const OptimizedFilter: React.FC<OptimizedFilterProps> = React.memo(({ 
  options,
  value,
  onChange,
  placeholder = "Filtrer...",
  className = "",
  showCount = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = useCallback((optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  }, [onChange]);

  const selectedOption = useMemo(() => 
    options.find(option => option.value === value),
    [options, value]
  );

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleDropdown}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F15A22] focus:border-transparent appearance-none text-left bg-white"
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="block truncate">{option.label}</span>
                {showCount && option.count !== undefined && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({option.count})
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

OptimizedFilter.displayName = 'OptimizedFilter';

// Hook pour utiliser les filtres optimisés
export function useOptimizedFilters<T>(
  data: T[],
  filterConfig: {
    [key: string]: {
      field: keyof T;
      options: FilterOption[];
    }
  }
) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([filterKey, filterValue]) => {
        if (!filterValue || filterValue === 'all') return true;
        
        const config = filterConfig[filterKey];
        if (!config) return true;
        
        const fieldValue = item[config.field];
        return fieldValue === filterValue;
      });
    });
  }, [data, filters, filterConfig]);

  const updateFilter = useCallback((filterKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getFilterCounts = useCallback((filterKey: string) => {
    const config = filterConfig[filterKey];
    if (!config) return {};

    const counts: Record<string, number> = {};
    
    config.options.forEach(option => {
      counts[option.value] = data.filter(item => {
        if (option.value === 'all') return true;
        return item[config.field] === option.value;
      }).length;
    });

    return counts;
  }, [data, filterConfig]);

  return {
    filteredData,
    filters,
    updateFilter,
    clearFilters,
    getFilterCounts
  };
}
