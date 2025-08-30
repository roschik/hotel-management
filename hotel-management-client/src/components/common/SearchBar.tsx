import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  activeFilters?: string[];
  onRemoveFilter?: (filter: string) => void;
  disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Поиск...',
  onClear,
  activeFilters = [],
  onRemoveFilter,
  disabled = false,
}) => {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClear}
                edge="end"
                size="small"
                aria-label="очистить поиск"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'background.paper',
          },
        }}
      />
      
      {activeFilters.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}
        >
          {activeFilters.map((filter, index) => (
            <Chip
              key={index}
              label={filter}
              onDelete={onRemoveFilter ? () => onRemoveFilter(filter) : undefined}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: 'primary.50',
                borderColor: 'primary.200',
                '& .MuiChip-deleteIcon': {
                  color: 'primary.400',
                  '&:hover': {
                    color: 'primary.600',
                  },
                },
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default SearchBar;