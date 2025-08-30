import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { ServiceDTO } from '../../types/api';
import apiService from '../../services/apiService';

interface ServiceSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (service: ServiceDTO) => void;
  selectedServiceId?: number;
}

const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedServiceId
}) => {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);

  useEffect(() => {
    if (open) {
      loadServices();
    }
  }, [open]);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, categoryFilter, activeOnly]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const services = await apiService.getServices();
      setServices(services);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;
    if (searchTerm) {
      const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
        filtered = filtered.filter(service => {
        const searchableText = [
          service.name.toString() || '',
          service.description?.toString() || ''
        ].join(' ').toLowerCase();
      
        return searchWords.every(word => searchableText.includes(word));
      });
    }

    // Фильтр по активности
    if (activeOnly) {
      filtered = filtered.filter(service => service.isActive);
    }

    setFilteredServices(filtered);
  };

  const handleSelect = (service: ServiceDTO) => {
    onSelect(service);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
    }
    return `${mins}м`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Выбор услуги</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Поиск по названию или описанию"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <Button
              variant={activeOnly ? "contained" : "outlined"}
              onClick={() => setActiveOnly(!activeOnly)}
              sx={{ minWidth: 150 }}
            >
              {activeOnly ? 'Только активные' : 'Все услуги'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setActiveOnly(true);
              }}
            >
              Сбросить
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Цена</TableCell>
                  <TableCell>Длительность</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="center">Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id} hover>
                    <TableCell>#{service.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {service.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatPrice(service.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDuration(service.durationMinutes)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        className='status-chip'
                        label={service.isActive ? 'Активна' : 'Неактивна'} 
                        size="small" 
                        color={service.isActive ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant={selectedServiceId === service.id ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleSelect(service)}
                        disabled={!service.isActive && selectedServiceId !== service.id}
                      >
                        {selectedServiceId === service.id ? 'Выбрана' : 'Выбрать'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && filteredServices.length === 0 && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography color="text.secondary">
              Услуги не найдены
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceSelectionModal;