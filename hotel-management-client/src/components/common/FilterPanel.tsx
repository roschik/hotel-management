import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Chip,
  Stack,
  Collapse,
  IconButton,
  Divider,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'dateRange' | 'text' | 'number';
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: any;
}

interface FilterPanelProps {
  filters: FilterOption[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply: () => void;
  onClear: () => void;
  isCollapsed?: boolean;
  showApplyButton?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  values,
  onChange,
  onApply,
  onClear,
  isCollapsed = false,
  showApplyButton = true,
}) => {
  const [expanded, setExpanded] = useState(!isCollapsed);
  const [localValues, setLocalValues] = useState<FilterValues>(values);

  const handleValueChange = (key: string, value: any) => {
    const newValues = { ...localValues, [key]: value };
    setLocalValues(newValues);
    if (!showApplyButton) {
      onChange(newValues);
    }
  };

  const handleApply = () => {
    onChange(localValues);
    onApply();
  };

  const handleClear = () => {
    const clearedValues: FilterValues = {};
    filters.forEach(filter => {
      clearedValues[filter.key] = filter.type === 'dateRange' ? { start: null, end: null } : '';
    });
    setLocalValues(clearedValues);
    onChange(clearedValues);
    onClear();
  };

  const getActiveFiltersCount = () => {
    return Object.values(localValues).filter(value => {
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== null && v !== '');
      }
      return value !== null && value !== '';
    }).length;
  };

  const renderFilterField = (filter: FilterOption) => {
    const value = localValues[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={value || ''}
              label={filter.label}
              onChange={(e) => handleValueChange(filter.key, e.target.value)}
            >
              <MenuItem value="">
                <em>Все</em>
              </MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <DatePicker
              label={filter.label}
              value={value || null}
              onChange={(newValue) => handleValueChange(filter.key, newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
        );

      case 'dateRange':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 6 }}>
                <DatePicker
                  label={`${filter.label} (от)`}
                  value={value?.start || null}
                  onChange={(newValue) => handleValueChange(filter.key, { ...value, start: newValue })}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DatePicker
                  label={`${filter.label} (до)`}
                  value={value?.end || null}
                  onChange={(newValue) => handleValueChange(filter.key, { ...value, end: newValue })}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        );

      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            label={filter.label}
            placeholder={filter.placeholder}
            value={value || ''}
            onChange={(e) => handleValueChange(filter.key, e.target.value)}
          />
        );

      case 'text':
      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={filter.label}
            placeholder={filter.placeholder}
            value={value || ''}
            onChange={(e) => handleValueChange(filter.key, e.target.value)}
          />
        );
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: expanded ? 2 : '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon color="action" />
            <Typography variant="h6" component="div">
              Фильтры
            </Typography>
            {getActiveFiltersCount() > 0 && (
              <Chip
                label={getActiveFiltersCount()}
                size="small"
                color="primary"
                variant="filled"
              />
            )}
          </Box>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            size="small"
            aria-label={expanded ? 'свернуть фильтры' : 'развернуть фильтры'}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {filters.map((filter) => (
              <Grid key={filter.key} size={{ xs: 12, sm: 6, md: 4 }}>
                {renderFilterField(filter)}
              </Grid>
            ))}
          </Grid>

          {(showApplyButton || getActiveFiltersCount() > 0) && (
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 2, justifyContent: 'flex-end' }}
            >
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClear}
                >
                  Очистить
                </Button>
              )}
              {showApplyButton && (
                <Button
                  variant="contained"
                  onClick={handleApply}
                >
                  Применить
                </Button>
              )}
            </Stack>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;