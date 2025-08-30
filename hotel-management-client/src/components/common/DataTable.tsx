import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  Paper,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { TableColumn, ActionButton, SortConfig } from '../../types/common';

interface DataTableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  sortConfig?: SortConfig | null;
  onSort?: (field: string) => void;
  selectedItems?: string[];
  onSelectItem?: (id: string) => void;
  onSelectAll?: () => void;
  actions?: ActionButton[];
  emptyMessage?: string;
  stickyHeader?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  sortConfig,
  onSort,
  selectedItems = [],
  onSelectItem,
  onSelectAll,
  actions = [],
  emptyMessage = 'Нет данных для отображения',
  stickyHeader = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, rowId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(rowId);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const handleActionSelect = (action: ActionButton) => {
    if (selectedRowId) {
      const row = data.find(item => item.id === selectedRowId);
      if (row) {
        action.onClick(row);
      }
    }
    handleActionClose();
  };

  const isSelected = (id: string) => selectedItems.includes(id);
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;
  const isAllSelected = data.length > 0 && selectedItems.length === data.length;

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {onSelectItem && (
                <TableCell padding="checkbox">
                  <Skeleton variant="rectangular" width={24} height={24} />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key}>
                  <Skeleton variant="text" width="80%" />
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" width={60}>
                  <Skeleton variant="text" width="50%" />
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {onSelectItem && (
                  <TableCell padding="checkbox">
                    <Skeleton variant="rectangular" width={24} height={24} />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton variant="text" width="90%" />
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell>
                    <Skeleton variant="circular" width={24} height={24} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ overflow: 'auto', maxWidth: 'calc(100vw - 365px)' }}>


        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {onSelectItem && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    inputProps={{
                      'aria-label': 'выбрать все строки',
                    }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                  sortDirection={
                    sortConfig?.field === column.key ? sortConfig.direction : false
                  }
                >
                  {column.sortable && onSort ? (
                    <TableSortLabel
                      active={sortConfig?.field === column.key}
                      direction={sortConfig?.field === column.key ? sortConfig.direction : 'asc'}
                      onClick={() => onSort(column.key)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" width={60}>
                  Действия
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => {
              const isItemSelected = isSelected(row.id);
              const visibleActions = actions.filter(action => !action.hidden?.(row));

              return (
                <TableRow
                  key={row.id}
                  hover
                  selected={isItemSelected}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  {onSelectItem && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => onSelectItem(row.id)}
                        inputProps={{
                          'aria-labelledby': `table-checkbox-${row.id}`,
                        }}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      align={column.align || 'left'}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                  {visibleActions.length > 0 && (
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionClick(e, row.id)}
                        aria-label="действия"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {selectedRowId &&
          actions
            .filter(action => {
              const row = data.find(item => item.id === selectedRowId);
              return row && !action.hidden?.(row) && !action.disabled?.(row);
            })
            .map((action) => (
              <MenuItem
                key={action.key}
                onClick={() => handleActionSelect(action)}
              >
                {action.icon && (
                  <ListItemIcon>
                    {action.icon}
                  </ListItemIcon>
                )}
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            ))
        }
      </Menu>
    </>
  );
};

export default DataTable;