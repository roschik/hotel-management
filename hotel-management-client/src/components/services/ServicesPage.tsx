import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  RoomService as ServicesIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import SearchBar from '../common/SearchBar';
import FilterPanel, { FilterOption } from '../common/FilterPanel';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import ServiceForm from './ServiceForm';
import { useTableState } from '../../hooks/useTableState';
import { TableColumn, ActionButton } from '../../types/common';
import { apiService } from '../../services/apiService';
import { ServiceDTO } from '../../types/api';

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceDTO | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    searchConfig,
    setSearchQuery,
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
  } = useTableState({
    initialPageSize: 25,
    initialSort: { field: 'name', direction: 'asc' },
  });
// Загрузка данных из API
  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesData = await apiService.getServices();
      setServices(servicesData);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadServices();
  }, []);

  // Обработчики для форм
  const handleCreateService = async (serviceData: Partial<ServiceDTO>) => {
    try {
      setFormLoading(true);
      setFormError(null);
      await apiService.createService(serviceData);
      setShowCreateDialog(false);
      await loadServices();
    } catch (error) {
      console.error('Ошибка создания услуги:', error);
      setFormError('Ошибка при создании услуги');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateService = async (serviceData: Partial<ServiceDTO>) => {
    if (!selectedService) return;
    
    try {
      setFormLoading(true);
      setFormError(null);
      await apiService.updateService(selectedService.id.toString(), serviceData);
      setShowEditDialog(false);
      setSelectedService(null);
      await loadServices();
    } catch (error) {
      console.error('Ошибка обновления услуги:', error);
      setFormError('Ошибка при обновлении услуги');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteService = async (service: ServiceDTO) => {
    if (window.confirm(`Вы уверены, что хотите удалить услугу "${service.name}"?`)) {
      try {
        await apiService.deleteService(service.id.toString());
        await loadServices(); // Перезагрузка списка
      } catch (error: any) {
        console.error('Ошибка удаления услуги:', error.response?.data || error.message);
        alert('Ошибка при удалении услуги');
      }
    }
  };

  // Функция для фильтрации и поиска данных
  const filteredServices = useMemo(() => {
    let filtered = [...services];
  
    // Применяем поиск
    if (searchConfig.query) {
      const query = searchConfig.query.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    }
  
    // Применяем фильтры
    if (filterConfig.isActive && filterConfig.isActive !== '') {
      const isActive = filterConfig.isActive === 'true';
      filtered = filtered.filter(service => service.isActive === isActive);
    }

    if (filterConfig.priceRange && filterConfig.priceRange !== '') {
      const [minPrice, maxPrice] = filterConfig.priceRange.split('-').map(Number);
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        filtered = filtered.filter(service => 
          service.price >= minPrice && service.price <= maxPrice
        );
      }
    }

    if (filterConfig.durationHours && filterConfig.durationHours !== '') {
      const hours = parseInt(filterConfig.durationHours);
      if (!isNaN(hours)) {
        filtered = filtered.filter(service => 
          Math.ceil(service.durationMinutes / 60) >= hours
        );
      }
    }

    // Применяем сортировку
    if (sortConfig?.field) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field as keyof ServiceDTO];
        const bValue = b[sortConfig.field as keyof ServiceDTO];
        
        // Обработка undefined/null
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        // Определение направления сортировки
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        return aValue > bValue ? direction : aValue < bValue ? -direction : 0;
      });
    }

    return filtered;
  }, [services, searchConfig.query, filterConfig, sortConfig]);

  // Пагинация отфильтрованных данных
  const paginatedServices = useMemo(() => {
    const startIndex = (paginationConfig.page - 1) * paginationConfig.pageSize;
    const endIndex = startIndex + paginationConfig.pageSize;
    return filteredServices.slice(startIndex, endIndex);
  }, [filteredServices, paginationConfig.page, paginationConfig.pageSize]);

  // Фильтры для услуг
  const filterOptions: FilterOption[] = [
    {
      key: 'isActive',
      label: 'Статус',
      type: 'select',
      options: [
        { value: 'true', label: 'Активна' },
        { value: 'false', label: 'Неактивна' },
      ],
    },
    {
      key: 'priceRange',
      label: 'Диапазон цен',
      type: 'text',
      placeholder: 'Например: 500-5000',
    },
    {
      key: 'durationHours',
      label: 'Длительность (в часах)',
      type: 'number',
      placeholder: 'Минимальная длительность в часах',
    },
  ];

  // Колонки таблицы
  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Название услуги',
      sortable: true,
      render: (_, service) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {service.name}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'description',
      label: 'Описание',
      sortable: false,
      render: (_, service) => (
        <Typography variant="body2" color="text.secondary">
          {service.description.length > 100 
            ? `${service.description.substring(0, 100)}...` 
            : service.description
          }
        </Typography>
      ),
    },
    {
      key: 'price',
      label: 'Цена',
      sortable: true,
      width: 100,
      align: 'right',
      render: (value) => (
        <Typography 
          variant="body2" 
          fontWeight={600}
          sx={{ color: 'primary.main' }}
        >
          {value ? `${value.toLocaleString()} ₽` : 'Не указана'}
        </Typography>
      ),
    },
    {
      key: 'durationMinutes',
      label: 'Длительность',
      sortable: true,
      width: 120,
      align: 'center',
      render: (value) => {
        if (value < 60) return `${value} мин`;
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return minutes > 0 ? `${hours}ч ${minutes}м` : `${hours}ч`;
      },
    },
    {
      key: 'isActive',
      label: 'Статус',
      sortable: true,
      width: 100,
      render: (value) => (
      <Chip
        label={value ? 'Активна' : 'Неактивна'}
        size="small"
        variant="filled"
        className="status-chip" 
        color={value ? 'success' : 'error'} 
      />
      ),
    },
  ];

  // Действия для строк таблицы
  const actions: ActionButton[] = [
    {
      key: 'view',
      label: 'Просмотр',
      icon: <ViewIcon />,
      onClick: (service) => {
        setSelectedService(service);
        setShowViewDialog(true);
      },
    },
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (service) => {
        setSelectedService(service);
        setShowEditDialog(true);
      },
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: (service) => handleDeleteService(service),
      disabled: (service) => (service.totalBookings || 0) > 0,
    },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 'calc(100vw - 250px)' }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ServicesIcon sx={{ fontSize: 32, color: 'primary.main' }} /> 
          Управление услугами
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Добавить услугу
        </Button>
      </Box>

      {/* Поиск */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <SearchBar
            value={searchConfig.query}
            onChange={setSearchQuery}
            placeholder="Поиск по названию, описанию..."
          />
        </CardContent>
      </Card>

      {/* Фильтры */}
      <FilterPanel
        filters={filterOptions}
        values={filterConfig}
        onChange={handleFilterChange}
        onApply={() => {}}
        onClear={clearFilters}
        isCollapsed={true}
        showApplyButton={false}
      />

      {/* Таблица */}
      <Card>
        <DataTable
          columns={columns}
          data={paginatedServices}
          loading={loading}
          sortConfig={sortConfig}
          onSort={handleSort}
          actions={actions}
          emptyMessage="Услуги не найдены"
        />
      </Card>

      {/* Пагинация */}
      <Pagination
        currentPage={paginationConfig.page}
        totalPages={Math.ceil(filteredServices.length / paginationConfig.pageSize)}
        pageSize={paginationConfig.pageSize}
        totalItems={filteredServices.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Диалоги форм */}
      <ServiceForm
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setFormError(null);
        }}
        onSubmit={handleCreateService}
        loading={formLoading}
        error={formError}
      />
      
      <ServiceForm
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedService(null);
          setFormError(null);
        }}
        onSubmit={handleUpdateService}
        service={selectedService}
        loading={formLoading}
        error={formError}
      />

      <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Информация об услуге</DialogTitle>
        <DialogContent>
          {selectedService && (
            <Grid container spacing={3} sx={{ pt: 2 }}>
              {/* Левая колонка - информация */}
              <Grid size={{ xs: 12, md: selectedService.imageUrl ? 8 : 12 }}>
                <Box sx={{ pt: 2 }}>
                  <Typography variant="h6">
                    {selectedService.name}
                  </Typography>
                  
                  <Typography 
                    variant="h6"
                    sx={{ 
                      mt: 2, 
                      color: 'primary.main',
                      fontWeight: 600 
                    }}
                  >
                    {selectedService.price.toLocaleString('ru-RU')} ₽
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Длительность: {selectedService.durationMinutes} минут
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Дата создания: {new Date(selectedService.createdAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                  
                  {selectedService.description && (
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      {selectedService.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      className="status-chip"
                      label={selectedService.isActive ? 'Активна' : 'Неактивна'}
                      color={selectedService.isActive ? 'success' : 'error'}

                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
              
              {/* Правая колонка - изображение */}
              {selectedService.imageUrl && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Изображение
                    </Typography>
                    <Box sx={{ borderRadius: 1, p: 1 }}>
                      <img
                        src={`${process.env.REACT_APP_URL}${selectedService.imageUrl}`}
                        alt={selectedService.name}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicesPage;

  