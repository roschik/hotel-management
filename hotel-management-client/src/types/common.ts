// Общие типы для компонентов управления данными

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterConfig {
  [key: string]: any;
}

export interface SearchConfig {
  query: string;
  fields: string[];
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

export interface ActionButton {
  key: string;
  label: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'contained' | 'outlined' | 'text';
  onClick: (item: any) => void;
  disabled?: (item: any) => boolean;
  hidden?: (item: any) => boolean;
}

export interface BulkAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  onClick: (selectedItems: any[]) => void;
  confirmMessage?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}