import { useState, useCallback, useMemo } from 'react';
import {
  SortConfig,
  PaginationConfig,
  FilterConfig,
  SearchConfig,
} from '../types/common';

interface UseTableStateProps {
  initialPageSize?: number;
  initialSort?: SortConfig;
  initialFilters?: FilterConfig;
}

interface UseTableStateReturn {
  // Поиск
  searchConfig: SearchConfig;
  setSearchQuery: (query: string) => void;
  setSearchFields: (fields: string[]) => void;
  
  // Сортировка
  sortConfig: SortConfig | null;
  handleSort: (field: string) => void;
  
  // Пагинация
  paginationConfig: PaginationConfig;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  
  // Фильтры
  filterConfig: FilterConfig;
  handleFilterChange: (filters: FilterConfig) => void;
  clearFilters: () => void;
  
  // Выбор элементов
  selectedItems: string[];
  handleSelectItem: (id: string) => void;
  handleSelectAll: (items: any[]) => void;
  clearSelection: () => void;
  
  // Сброс всего состояния
  resetState: () => void;
}

export const useTableState = ({
  initialPageSize = 25,
  initialSort,
  initialFilters = {},
}: UseTableStateProps = {}): UseTableStateReturn => {
  // Поиск
  const [searchConfig, setSearchConfig] = useState<SearchConfig>({
    query: '',
    fields: [],
  });

  // Сортировка
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort || null);

  // Пагинация
  const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
  });

  // Фильтры
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(initialFilters);

  // Выбранные элементы
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Обработчики поиска
  const setSearchQuery = useCallback((query: string) => {
    setSearchConfig(prev => ({ ...prev, query }));
    setPaginationConfig(prev => ({ ...prev, page: 1 })); // Сбрасываем на первую страницу
  }, []);

  const setSearchFields = useCallback((fields: string[]) => {
    setSearchConfig(prev => ({ ...prev, fields }));
  }, []);

  // Обработчики сортировки
  const handleSort = useCallback((field: string) => {
    setSortConfig(prev => {
      if (prev?.field === field) {
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { field, direction: 'asc' };
    });
  }, []);

  // Обработчики пагинации
  const handlePageChange = useCallback((page: number) => {
    setPaginationConfig(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPaginationConfig(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  // Обработчики фильтров
  const handleFilterChange = useCallback((filters: FilterConfig) => {
    setFilterConfig(filters);
    setPaginationConfig(prev => ({ ...prev, page: 1 })); // Сбрасываем на первую страницу
  }, []);

  const clearFilters = useCallback(() => {
    setFilterConfig({});
    setPaginationConfig(prev => ({ ...prev, page: 1 }));
  }, []);

  // Обработчики выбора
  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  }, []);

  const handleSelectAll = useCallback((items: any[]) => {
    const allIds = items.map(item => item.id);
    setSelectedItems(prev => {
      if (prev.length === allIds.length) {
        return [];
      }
      return allIds;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Сброс состояния
  const resetState = useCallback(() => {
    setSearchConfig({ query: '', fields: [] });
    setSortConfig(initialSort || null);
    setPaginationConfig({ page: 1, pageSize: initialPageSize, total: 0 });
    setFilterConfig(initialFilters);
    setSelectedItems([]);
  }, [initialSort, initialPageSize, initialFilters]);

  return {
    searchConfig,
    setSearchQuery,
    setSearchFields,
    sortConfig,
    handleSort,
    paginationConfig,
    handlePageChange,
    handlePageSizeChange,
    filterConfig,
    handleFilterChange,
    clearFilters,
    selectedItems,
    handleSelectItem,
    handleSelectAll,
    clearSelection,
    resetState,
  };
};