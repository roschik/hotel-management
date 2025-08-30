import React from 'react';
import {
  Box,
  Pagination as MuiPagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
} from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showItemsInfo?: boolean;
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showItemsInfo = true,
  disabled = false,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  const handlePageSizeChange = (event: any) => {
    const newPageSize = parseInt(event.target.value, 10);
    onPageSizeChange(newPageSize);
    // Пересчитываем текущую страницу, чтобы остаться примерно на том же месте
    const currentFirstItem = (currentPage - 1) * pageSize + 1;
    const newPage = Math.ceil(currentFirstItem / newPageSize);
    onPageChange(Math.max(1, newPage));
  };

  if (totalItems === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Нет данных для отображения
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        py: 2,
        px: 1,
      }}
    >
      {/* Информация об элементах */}
      {showItemsInfo && (
        <Typography variant="body2" color="text.secondary">
          Показано {startItem}-{endItem} из {totalItems} записей
        </Typography>
      )}

      {/* Центральная часть с пагинацией */}
      <Stack direction="row" spacing={2} alignItems="center">
        {showPageSizeSelector && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>На странице</InputLabel>
            <Select
              value={pageSize}
              label="На странице"
              onChange={handlePageSizeChange}
              disabled={disabled}
            >
              {pageSizeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <MuiPagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          disabled={disabled}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
          sx={{
            '& .MuiPagination-ul': {
              flexWrap: 'nowrap',
            },
          }}
        />
      </Stack>

      {/* Пустое место для выравнивания */}
      <Box sx={{ minWidth: showItemsInfo ? 'auto' : 0 }} />
    </Box>
  );
};

export default Pagination;