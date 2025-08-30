import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  PointOfSale as SalesIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import SearchBar from '../common/SearchBar';
import FilterPanel, { FilterOption } from '../common/FilterPanel';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import ServiceSaleForm from './ServiceSaleForm';
import ServiceSaleViewDialog from './ServiceSaleViewDialog';
import { useTableState } from '../../hooks/useTableState';
import { TableColumn, ActionButton } from '../../types/common';
import apiService from '../../services/apiService';
import { ServiceSaleDTO, CreateServiceSaleDTO, ServiceDTO, PaymentStatusDTO } from '../../types/api';

const ServiceSales: React.FC = () => {
  const [serviceSales, setServiceSales] = useState<ServiceSaleDTO[]>([]);
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatusDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceSale, setSelectedServiceSale] = useState<ServiceSaleDTO | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const {
    searchConfig,
    filterConfig,
    sortConfig,
    paginationConfig,
    setSearchQuery,
    handleFilterChange,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    clearFilters,
  } = useTableState({
    initialSort: { field: 'saleDate', direction: 'desc' },
    initialPageSize: 10,
  });

  // Загрузка данных
  const fetchServiceSales = async () => {
    try {
      setLoading(true);
      const serviceSales = await apiService.getServiceSales();
      setServiceSales(serviceSales);
    } catch (error) {
      console.error('Ошибка загрузки продаж услуг:', error);
      setError('Не удалось загрузить продажи услуг');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const services = await apiService.getServices();
      setServices(services);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
    }
  };

  const filteredServiceSales = useMemo(() => {
    let filtered = [...serviceSales];
  
    // Применяем поиск
    if (searchConfig.query) {
    const searchWords = searchConfig.query.toLowerCase().split(' ').filter(word => word.length > 0);
      filtered = filtered.filter(sale => {
        const searchableText = [
          sale.id?.toString() || '',
          sale.serviceName || '',
          sale.employeeName || '',
          sale.guestName || '',
          sale.employeePosition || '',
        ].join(' ').toLowerCase();
        
        return searchWords.every(word => searchableText.includes(word));
      });
    }
  
    // Применяем фильтры
    if (filterConfig.serviceName) {
      filtered = filtered.filter(sale => sale.serviceName === filterConfig.serviceName);
    }
  
    if (filterConfig.paymentStatusName) {
      filtered = filtered.filter(sale => sale.paymentStatusName === filterConfig.paymentStatusName);
    }
  
    if (filterConfig.saleDate) {
      if (typeof filterConfig.saleDate === 'object' && filterConfig.saleDate.start && filterConfig.saleDate.end) {
        const start = new Date(filterConfig.saleDate.start).toLocaleDateString();
        const end = new Date(filterConfig.saleDate.end).toLocaleDateString();

        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.saleDate).toLocaleDateString();
          return saleDate >= start && saleDate <= end;
        });
      }
    }

    if (filterConfig.totalPrice && filterConfig.totalPrice !== '') {
      const [minPrice, maxPrice] = filterConfig.totalPrice.split('-').map(Number);
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        filtered = filtered.filter(sale => 
          sale.totalPrice >= minPrice && sale.totalPrice <= maxPrice
        );
      }
    }
    
    return filtered;
  }, [serviceSales, searchConfig.query, filterConfig, sortConfig]);
  
  // Сортировка данных
  const sortedServiceSales = useMemo(() => {
    if (!sortConfig) return filteredServiceSales;

    return [...filteredServiceSales].sort((a, b) => {
      let aValue: any = a[sortConfig.field as keyof ServiceSaleDTO];
      let bValue: any = b[sortConfig.field as keyof ServiceSaleDTO];

      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        return aValue > bValue ? direction : aValue < bValue ? -direction : 0;
    });
  }, [filteredServiceSales, sortConfig]);

  // Пагинация отфильтрованных данных
  const paginatedServiceSales = useMemo(() => {
    const startIndex = (paginationConfig.page - 1) * paginationConfig.pageSize;
    const endIndex = startIndex + paginationConfig.pageSize;
    return sortedServiceSales.slice(startIndex, endIndex);
  }, [sortedServiceSales, paginationConfig.page, paginationConfig.pageSize]);

  const fetchPaymentStatuses = async () => {
    try {
      const paymentStatuses = await apiService.getPaymentStatuses();
      setPaymentStatuses(paymentStatuses);
    } catch (error) {
      console.error('Ошибка загрузки статусов оплаты:', error);
    }
  };

  useEffect(() => {
    fetchServiceSales();
    fetchServices();
    fetchPaymentStatuses();
  }, []);

  // Обработчики действий
  const handleCreateSale = async (data: CreateServiceSaleDTO) => {
    try {
      setLoading(true);
      await apiService.createServiceSale(data);
      await fetchServiceSales();
      setShowCreateDialog(false);
      setError(null);
    } catch (error: any) {
      console.error('Ошибка создания продажи:', error);
      setError(error.response?.data?.message || 'Не удалось создать продажу услуги');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSale = async (data: CreateServiceSaleDTO) => {
    if (!selectedServiceSale) return;
    
    try {
      setLoading(true);
      await apiService.updateServiceSale(selectedServiceSale.id, data);
      await fetchServiceSales();
      setShowEditDialog(false);
      setSelectedServiceSale(null);
      setError(null);
    } catch (error: any) {
      console.error('Ошибка обновления продажи:', error);
      setError(error.response?.data?.message || 'Не удалось обновить продажу услуги');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async (serviceSale: ServiceSaleDTO) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту продажу услуги?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.delete(`/api/servicesales/${serviceSale.id}`);
      await fetchServiceSales();
      setError(null);
    } catch (error: any) {
      console.error('Ошибка удаления продажи:', error);
      setError(error.response?.data?.message || 'Не удалось удалить продажу услуги');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'оплачено':
        return 'success';
      case 'частично оплачено':
        return 'warning';
      case 'просрочено':
        return 'error';
      case 'ожидает оплаты':
        return 'info';
      default:
        return 'default';
    }
  };

  // Фильтры
  const filterOptions: FilterOption[] = [
    {
      key: 'serviceName',
      label: 'Услуга',
      type: 'select',
      options: services.map(service => ({ value: service.name, label: service.name })),
    },
    {
      key: 'paymentStatusName',
      label: 'Статус оплаты',
      type: 'select',
      options: paymentStatuses.map(status => ({ value: status.name, label: status.name })),
    },
    {
      key: 'saleDate',
      label: 'Дата продажи',
      type: 'dateRange',
    },
    {
      key: 'totalPrice',
      label: 'Диапазон сумм',
      type: 'text',
      placeholder: 'Например: 500-5000',
    },
  ];

  // Колонки таблицы
  const columns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: 80,
      render: (_, sale) => `#${sale.id}`,
    },
    {
      key: 'serviceName',
      label: 'Услуга',
      sortable: true,
      render: (_, sale) => (
        <Typography variant="body2" fontWeight={600}>
          {sale.serviceName}
        </Typography>
      ),
    },
    {
      key: 'employeeName',
      label: 'Сотрудник',
      sortable: true,
      render: (_, sale) => (
        <Box>
          <Typography variant="body2">
            {sale.employeeName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {sale.employeePosition}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'guestName',
      label: 'Гость',
      sortable: true,
      render: (_, sale) => (
        <Typography variant="body2">
          {sale.guestName || 'Не указан'}
        </Typography>
      ),
    },
    {
      key: 'quantity',
      label: 'Кол-во',
      sortable: true,
      width: 80,
      align: 'center',
    },
    {
      key: 'unitPrice',
      label: 'Цена за ед.',
      sortable: true,
      width: 120,
      render: (_, sale) => formatCurrency(sale.unitPrice),
    },
    {
      key: 'totalPrice',
      label: 'Общая сумма',
      sortable: true,
      width: 120,
      render: (_, sale) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {formatCurrency(sale.totalPrice)}
        </Typography>
      ),
    },
    {
      key: 'paymentStatusName',
      label: 'Статус оплаты',
      sortable: true,
      width: 140,
      render: (_, sale) => (
        <Chip 
          className='status-chip'
          label={sale.paymentStatusName} 
          color={getPaymentStatusColor(sale.paymentStatusName)}
          size="small"
        />
      ),
    },
    {
      key: 'saleDate',
      label: 'Дата продажи',
      sortable: true,
      width: 140,
      render: (_, sale) => new Date(sale.saleDate).toLocaleDateString('ru-RU'),
    },
  ];

  // Действия для строк таблицы
  const actions: ActionButton[] = [
    {
      key: 'view',
      label: 'Просмотр',
      icon: <ViewIcon />,
      onClick: (sale) => {
        setSelectedServiceSale(sale);
        setShowViewDialog(true);
      },
    },
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (sale) => {
        setSelectedServiceSale(sale);
        setShowEditDialog(true);
      },
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: handleDeleteSale,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SalesIcon sx={{ fontSize: 32, color: 'primary.main' }} /> 
          Продажи услуг
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Добавить продажу
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Поиск */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <SearchBar
            value={searchConfig.query}
            onChange={setSearchQuery}
            placeholder="Поиск по ID, услуге, сотруднику, гостю..."

          />
        </CardContent>
      </Card>

      {/* Фильтры */}
      <FilterPanel
        filters={filterOptions}
        values={filterConfig}
        onChange={handleFilterChange}
        onApply={() => console.log('Применить фильтры')}
        onClear={clearFilters}
        isCollapsed={true}
        showApplyButton={false}
      />

      {/* Таблица */}
      <Card>
        <DataTable
          columns={columns}
          data={paginatedServiceSales} 
          loading={loading}
          sortConfig={sortConfig}
          onSort={handleSort}
          actions={actions}
        />
      </Card>
      
      <Pagination
        currentPage={paginationConfig.page}
        totalPages={Math.ceil(paginatedServiceSales.length / paginationConfig.pageSize)}
        pageSize={paginationConfig.pageSize}
        totalItems={paginatedServiceSales.length} 
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Диалоги */}
      <ServiceSaleForm
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setError(null);
        }}
        onSubmit={handleCreateSale}
        loading={loading}
        error={error}
        services={services}
        paymentStatuses={paymentStatuses}
      />

      <ServiceSaleForm
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedServiceSale(null);
          setError(null);
        }}
        onSubmit={handleUpdateSale}
        serviceSale={selectedServiceSale}
        loading={loading}
        error={error}
        services={services}
        paymentStatuses={paymentStatuses}
      />

      <ServiceSaleViewDialog
        open={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setSelectedServiceSale(null);
        }}
        serviceSale={selectedServiceSale}
        onEdit={() => {
          setShowViewDialog(false);
          setShowEditDialog(true);
        }}
      />
    </Box>
  );
};

export default ServiceSales;
