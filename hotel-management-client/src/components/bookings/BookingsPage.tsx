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
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  BookOnline as BookingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Hotel as HotelIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import SearchBar from '../common/SearchBar';
import FilterPanel, { FilterOption } from '../common/FilterPanel';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import BookingForm from './BookingForm';
import { useTableState } from '../../hooks/useTableState';
import { TableColumn, ActionButton } from '../../types/common';
import { apiService } from '../../services/apiService';
import { BookingDTO, BookingStatusDTO, BookingTypeDTO } from '../../types/api';


const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null);
  const [bookingStatuses, setBookingStatuses] = useState<BookingStatusDTO[]>([]);
  const [bookingTypes, setBookingTypes] = useState<BookingTypeDTO[]>([]);
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
    initialSort: { field: 'checkInDate', direction: 'desc' },
  });

  // Загрузка данных
  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookingStatuses = async () => {
    try {
      const data = await apiService.getBookingStatuses();
      setBookingStatuses(data);
    } catch (error) {
      console.error('Ошибка загрузки статусов бронирований:', error);
    }
  };

  const loadBookingTypes = async () => {
    try {
      const data = await apiService.getBookingTypes();
      setBookingTypes(data);
    } catch (error) {
      console.error('Ошибка загрузки типов бронирований:', error);
    }
  };


  useEffect(() => {
    const loadData = async () => {
      await loadBookings();
      await loadBookingStatuses();
      await loadBookingTypes();
    };
    loadData();
  }, []);

  // Обработчики для форм
  const handleCreateBooking = async (bookingData: Partial<BookingDTO>) => {

    try {
      setFormLoading(true);
      setFormError(null);
      await apiService.createBooking(bookingData);
      setShowCreateDialog(false);
      await loadBookings();
    } catch (error) {
      console.error('Ошибка создания бронирования:', error);
      setFormError('Ошибка при создании бронирования');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBooking = async (bookingData: Partial<BookingDTO>) => {
    if (!selectedBooking) return;
    
    try {
      setFormLoading(true);
      setFormError(null);
      const updatedBooking = await apiService.updateBooking(selectedBooking.id.toString(), bookingData);
      
      // Обновить локальное состояние с новыми данными
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id ? updatedBooking : b
      ));
      
      setShowEditDialog(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Ошибка обновления бронирования:', error);
      setFormError('Ошибка при обновлении бронирования');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBooking = async (booking: BookingDTO) => {
    if (window.confirm(`Вы уверены, что хотите удалить бронирование #${booking.id}?`)) {
      try {
        await apiService.deleteBooking(booking.id.toString());
        await loadBookings();
      } catch (error: any) {
        console.error('Ошибка удаления бронирования:', error.response?.data || error.message);
        alert('Ошибка при удалении бронирования');
      }
    }
  };

  // Функция для фильтрации и поиска данных
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Поиск 
    if (searchConfig.query) {
      const searchWords = searchConfig.query.toLowerCase().split(' ').filter(word => word.length > 0);
      filtered = filtered.filter(booking => {
        const searchableText = [
          booking.id?.toString() || '',
          booking.guestName || '',
          booking.roomNumber?.toString() || ''
        ].join(' ').toLowerCase();
        
        return searchWords.every(word => searchableText.includes(word));
      });
    }

    // Фильтрация по статусу
    if (filterConfig.bookingStatus) {
      filtered = filtered.filter(booking => {
        const status = bookingStatuses.find(s => s.id === booking.bookingStatusId);
        return status?.description === filterConfig.bookingStatus;
      });
    }

    // Фильтрация по способу бронирования
    if (filterConfig.bookingType) {
      filtered = filtered.filter(booking => {
        const type = bookingTypes.find(t => t.bookingTypeId === booking.bookingTypeId);
        return type?.description === filterConfig.bookingType;
      });
    }

    // Фильтрация по датам
    if (filterConfig.dateRange?.start || filterConfig.dateRange?.end) {
      filtered = filtered.filter(booking => {
        // Создаем даты без времени для корректного сравнения
        const checkIn = new Date(booking.checkInDate);
        checkIn.setHours(0, 0, 0, 0);
        
        const checkOut = new Date(booking.checkOutDate);
        checkOut.setHours(23, 59, 59, 999); 

        const filterStart = filterConfig.dateRange?.start ? new Date(filterConfig.dateRange.start) : null;
        if (filterStart) filterStart.setHours(0, 0, 0, 0);
        
        const filterEnd = filterConfig.dateRange?.end ? new Date(filterConfig.dateRange.end) : null;
        if (filterEnd) filterEnd.setHours(23, 59, 59, 999);

        // Если указана только начальная дата фильтра
        if (filterStart && !filterEnd) {
          return checkIn >= filterStart;
        }
        
        // Если указана только конечная дата фильтра
        if (!filterStart && filterEnd) {
          return checkOut <= filterEnd;
        }
        
        // Если указаны обе даты фильтра - проверяем пересечение периодов
        if (filterStart && filterEnd) {
          return checkIn >= filterStart && checkOut <= filterEnd;
        }
        
        return true;
      });
    }

    // Применяем сортировку
    if (sortConfig?.field) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field as keyof BookingDTO];
        const bValue = b[sortConfig.field as keyof BookingDTO];
        
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        return aValue > bValue ? direction : aValue < bValue ? -direction : 0;
      });
    }

    return filtered;
  }, [bookings, searchConfig.query, filterConfig, sortConfig]);

  // Пагинация отфильтрованных данных
  const paginatedBookings = useMemo(() => {
    const startIndex = (paginationConfig.page - 1) * paginationConfig.pageSize;
    const endIndex = startIndex + paginationConfig.pageSize;
    return filteredBookings.slice(startIndex, endIndex);
  }, [filteredBookings, paginationConfig.page, paginationConfig.pageSize]);

  // Фильтры для бронирований
  const filterOptions: FilterOption[] = [
    {
      key: 'bookingStatus',
      label: 'Статус',
      type: 'select',
      options: bookingStatuses.map(status => ({
        value: status.description,
        label: status.description
      }))
    },
    {
      key: 'bookingType',
      label: 'Способ',
      type: 'select',
      options: bookingTypes.map(type => ({
        value: type.description,
        label: type.description
      }))
    },
    {
      key: 'dateRange',
      label: 'Период проживания',
      type: 'dateRange'
    }
  ];

  // Колонки таблицы
  const columns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: 80,
      render: (_, booking) => `#${booking.id}`,
    },
    {
      key: 'guestName',
      label: 'Гость',
      sortable: true,
      render: (_, booking) => {
        if (!booking.guestName) return '-';

        return (
          <Box>
            <Typography variant="body2">
              {booking.guestName}
            </Typography>
            {booking.guestPhone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">{booking.guestPhone}</Typography>
              </Box>
            )}
          </Box>
        );
      }
    },
    {
      key: 'room',
      label: 'Комната',
      sortable: true,
      render: (_, booking) => {
        if (!booking) return '-';
        return (
          <div>{booking.roomNumber} - <span style={{ color: 'text.secondary' }}>{booking.roomType}</span></div>
        );
      }
    },
    {
      key: 'dates',
      label: 'Даты',
      sortable: true,
      render: (_, booking) => {
        if (!booking) return '-';
        return (
          <div>
            <div>Заезд: <span style={{ fontWeight: 'bold' }}>{new Date(booking.checkInDate).toLocaleDateString()}</span></div>
            <div>Выезд: <span style={{ fontWeight: 'bold' }}>{new Date(booking.checkOutDate).toLocaleDateString()}</span></div>
          </div>
        );
      }
    },
    {
      key: 'bookingStatusName',
      label: 'Статус',
      sortable: true,
      render: (_, booking) => {
        const statusConfig = {
          'Подтверждено': { color: 'success' as const },
          'Ожидает подтверждения': { color: 'info' as const },
          'Отменено': { color: 'error' as const },
          'Завершено': { color: 'warning' as const },
        };
        const config = statusConfig[booking.bookingStatusName as keyof typeof statusConfig];
        return (
          <Chip
            className="status-chip"
            label={booking.bookingStatusName || 'Не указан'}
            color={config?.color || 'default'}
            size="small"
          />
        );
      },
    },
    {
      key: 'bookingTypeName',
      label: 'Способ',
      sortable: true,
      render: (_, booking) => booking.bookingTypeName
    },
    {
      key: 'totalPrice',
      label: 'Сумма',
      sortable: true,
      render: (_, booking) => (
        <Typography 
          variant="body2" 
          fontWeight={600}
          sx={{ color: 'primary.main' }}
        >
          {booking.totalPrice.toFixed(2)} ₽
        </Typography>
      ),
    },
  ];

  // Действия для строк таблицы
  const actions: ActionButton[] = [
    {
      key: 'view',
      label: 'Просмотр',
      icon: <ViewIcon />,
      onClick: (booking) => {
        setSelectedBooking(booking);
        setShowViewDialog(true);
      },
    },
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (booking) => {
        setSelectedBooking(booking);
        setShowEditDialog(true);
      },
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: handleDeleteBooking,
      disabled: (booking) => booking.status === 'completed',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookingsIcon sx={{ fontSize: 32, color: 'primary.main' }} /> 
          Управление бронированиями
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Создать бронирование
        </Button>
      </Box>

      {/* Поиск */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <SearchBar
            value={searchConfig.query}
            onChange={setSearchQuery}
            placeholder="Поиск по ID, гостю, комнате..."
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
          data={paginatedBookings}
          loading={loading}
          sortConfig={sortConfig}
          onSort={handleSort}
          actions={actions}
          emptyMessage="Бронирования не найдены"
        />
      </Card>

      {/* Пагинация */}
      <Pagination
        currentPage={paginationConfig.page}
        totalPages={Math.ceil(filteredBookings.length / paginationConfig.pageSize)}
        pageSize={paginationConfig.pageSize}
        totalItems={filteredBookings.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Диалог создания */}
      <BookingForm
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setFormError(null);
        }}
        onSubmit={handleCreateBooking}
        loading={formLoading}
        error={formError}
      />

      {/* Диалог редактирования */}
      <BookingForm
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedBooking(null);
          setFormError(null);
        }}
        onSubmit={handleUpdateBooking}
        booking={selectedBooking}
        loading={formLoading}
        error={formError}
      />

      {/* Диалог просмотра */}
      <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookingsIcon color="primary" />
          Информация о бронировании
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ pt: 2 }}>
              {/* Основная информация */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BookingsIcon color="primary" />
                    Основная информация
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">ID бронирования:</Typography>
                      <Typography variant="body1" fontWeight={500}>#{selectedBooking.id}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Статус:</Typography>
                      <Chip 
                        label={selectedBooking.bookingStatusName} 
                        size="small"
                        color="primary"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Тип бронирования:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedBooking.bookingTypeName}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Дата создания:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(selectedBooking.createdAt).toLocaleString('ru-RU')}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {selectedBooking.updatedAt && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Дата обновления
                          </label>
                          <div className="text-sm text-gray-900">
                            {new Date(selectedBooking.updatedAt).toLocaleString('ru-RU')}
                          </div>
                        </div>
                      )}
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      {selectedBooking.cancelledAt && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Дата отмены
                          </label>
                          <div className="text-sm text-red-600">
                            {new Date(selectedBooking.cancelledAt).toLocaleString('ru-RU')}
                          </div>
                        </div>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Информация о госте */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    Информация о госте
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Имя гостя:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedBooking.guestName}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Телефон:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" />
                          {selectedBooking.guestPhone}
                        </Box>
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Информация о комнате */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HotelIcon color="primary" />
                    Информация о комнате
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Номер комнаты:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedBooking.roomNumber}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Тип комнаты:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedBooking.roomType}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Даты проживания */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" />
                    Даты проживания
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Дата заезда:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(selectedBooking.checkInDate).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Дата выезда:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(selectedBooking.checkOutDate).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">Количество дней:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {Math.ceil((new Date(selectedBooking.checkOutDate).getTime() - new Date(selectedBooking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} дн.
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Стоимость */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon color="primary" />
                    Стоимость
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Базовая стоимость:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedBooking.basePrice?.toLocaleString('ru-RU')} ₽
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Итоговая стоимость:</Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={600}>
                        {selectedBooking.totalPrice?.toLocaleString('ru-RU')} ₽
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Ответственный сотрудник */}
              {selectedBooking.employeeName && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon color="primary" />
                      Ответственный сотрудник
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Имя сотрудника:</Typography>
                        <Typography variant="body1" fontWeight={500}>{selectedBooking.employeeName}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Должность:</Typography>
                        <Typography variant="body1" fontWeight={500}>{selectedBooking.employeePosition}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Заметки */}
              {selectedBooking.notes && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Заметки</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">{selectedBooking.notes}</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewDialog(false)}>Закрыть</Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={() => {
              setShowViewDialog(false);
              setShowEditDialog(true);
            }}
          >
            Редактировать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsPage;