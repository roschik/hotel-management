import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Hotel as StaysIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import SearchBar from '../common/SearchBar';
import FilterPanel, { FilterOption } from '../common/FilterPanel';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import { useTableState } from '../../hooks/useTableState';
import { TableColumn, ActionButton } from '../../types/common';
import { stayService } from '../../services/stayService';
import { StayDTO, CreateStayDTO, UpdateStayDTO, BookingDTO, GuestDTO, RoomDTO } from '../../types/api';
import { apiService } from '../../services/apiService';
import StayForm from './StayForm';

const StaysPage: React.FC = () => {
  const [stays, setStays] = useState<StayDTO[]>([]);
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingStay, setEditingStay] = useState<StayDTO | null>(null);
  const [selectedStay, setSelectedStay] = useState<StayDTO | null>(null);

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
  } = useTableState({
    initialPageSize: 25,
    initialSort: { field: 'stayId', direction: 'desc' },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staysData, bookingsData, roomsData] = await Promise.all([
        stayService.getStays(),
        apiService.getBookings(),
        apiService.getRooms()
      ]);
      
      setStays(staysData);
      setBookings(bookingsData);
      setRooms(roomsData);
    } catch (err) {
      setError('Ошибка при загрузке данных');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStay = () => {
    setEditingStay(null);
    setOpenDialog(true);
  };

  const handleEditStay = (stay: StayDTO) => {
    setEditingStay(stay);
    setOpenDialog(true);
  };

  const handleSubmitStay = async (data: CreateStayDTO | UpdateStayDTO) => {
    try {
      if (editingStay) {
        await stayService.updateStay(editingStay.stayId, data as UpdateStayDTO);
      } else {
        await stayService.createStay(data as CreateStayDTO);
      }
      
      setOpenDialog(false);
      setEditingStay(null);
      await loadData();
    } catch (err) {
      setError('Ошибка при сохранении проживания');
      console.error('Error saving stay:', err);
    }
  };

  const handleDeleteStay = async (stayId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это проживание?')) {
      try {
        await stayService.deleteStay(stayId);
        await loadData();
      } catch (err) {
        setError('Ошибка при удалении проживания');
        console.error('Error deleting stay:', err);
      }
    }
  };

  // Фильтрация и поиск данных
  const filteredStays = useMemo(() => {
    let result = stays;

    // Поиск
    if (searchConfig.query) {
    const searchWords = searchConfig.query.toLowerCase().split(' ').filter(word => word.length > 0);
    result = result.filter(stay => {
      const guestNames = stay.stayGuests?.map(guest => 
        guest.guestFullName?.toLowerCase() || ''
      ).join(' ') || '';
      
      const searchableText = [
        stay.stayId?.toString() || '',
        stay.guestName || '',
        stay.roomNumber?.toString() || '',
        guestNames
      ].join(' ').toLowerCase();
      
      return searchWords.every(word => searchableText.includes(word));
    });
  }

    // Фильтры
    if (filterConfig.paymentStatus) {
      result = result.filter(stay => stay.paymentStatusName === filterConfig.paymentStatus);
    }
    if (filterConfig.roomId) {
      result = result.filter(stay => stay.roomId.toString() === filterConfig.roomId);
    }
    
    // Фильтрация по датам проживания - ищем пересечения периодов
    if (filterConfig.stayDateFrom || filterConfig.stayDateTo) {
      result = result.filter(stay => {
        const stayCheckIn = new Date(stay.checkInDate);
        const stayCheckOut = stay.checkOutDate ? new Date(stay.checkOutDate) : new Date();
        
        // Если указана дата "с", то дата заезда должна быть >= указанной
        if (filterConfig.stayDateFrom) {
          const filterFrom = new Date(filterConfig.stayDateFrom);
          if (stayCheckIn.toLocaleDateString() < filterFrom.toLocaleDateString()) return false;
        }
        
        // Если указана дата "по", то дата выезда должна быть <= указанной
        if (filterConfig.stayDateTo) {
          const filterTo = new Date(filterConfig.stayDateTo);
          if (stayCheckOut.toLocaleDateString() > filterTo.toLocaleDateString()) return false;
        }
        
        return true;
      });
    }

    return result;
  }, [stays, searchConfig.query, filterConfig]);

  // Сортировка данных
  const sortedStays = useMemo(() => {
    if (!sortConfig) return filteredStays;

    return [...filteredStays].sort((a, b) => {
      let aValue: any = a[sortConfig.field as keyof StayDTO];
      let bValue: any = b[sortConfig.field as keyof StayDTO];

      // Обработка undefined значений
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredStays, sortConfig]);

  // Пагинация
  const paginatedStays = useMemo(() => {
    const startIndex = (paginationConfig.page - 1) * paginationConfig.pageSize;
    return sortedStays.slice(startIndex, startIndex + paginationConfig.pageSize);
  }, [sortedStays, paginationConfig]);

  const paginatedStaysWithId = useMemo(() => {
    return paginatedStays.map(stay => ({
      ...stay,
      id: stay.stayId.toString() 
    }));
  }, [paginatedStays]);

  const uniquePaymentStatuses = useMemo(() => {
    return Array.from(new Set(stays.map(stay => stay.paymentStatusName)));
  }, [stays]);

  // Опции фильтров
  const filterOptions: FilterOption[] = [
    {
      key: 'paymentStatus',
      label: 'Статус оплаты',
      type: 'select',
      options: uniquePaymentStatuses.map(status => ({
        value: status,
        label: status,
      })),
    },
    {
      key: 'stayDateFrom',
      label: 'Проживание с',
      type: 'date',
    },
    {
      key: 'stayDateTo',
      label: 'Проживание по',
      type: 'date',
    },
    {
    key: 'roomId',
      label: 'Комната',
      type: 'select',
      options: rooms.map(room => ({
        value: room.id.toString(),
        label: `Комната ${room.roomNumber}`,
      })),
    }
  ];      

  // Колонки таблицы
  const columns: TableColumn[] = [
    {
      key: 'stayId',
      label: 'ID',
      sortable: true,
      width: 80,
    },
    {
      key: 'roomNumber',
      label: 'Комната',
      sortable: true,
      width: 120,
      render: (value, stay: StayDTO) => {
        return `Комната ${stay.roomNumber}`;
      },
    },
    {
      key: 'guestName',
      label: 'Основной гость',
      sortable: true,
      width: 200,
      render: (value, stay: StayDTO) => {
        const mainGuest = stay.stayGuests?.find(guest => guest.isMainGuest);
        return (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {mainGuest ? mainGuest.guestFullName : 'Не указан'}
            </Typography>
            {stay.stayGuests && stay.stayGuests.length > 1 && (
              <Typography variant="caption" color="text.secondary">
                +{stay.stayGuests.length - 1} гостей
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: 'actualCheckInDate',
      label: 'Заезд',
      sortable: true,
      width: 150,
      render: (value, stay: StayDTO) => {
        return (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {new Date(value).toLocaleDateString('ru-RU')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              План: {new Date(stay.checkInDate).toLocaleDateString('ru-RU')}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: 'actualCheckOutDate',
      label: 'Выезд',
      sortable: true,
      width: 150,
      render: (value, stay: StayDTO) => {
        return (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {value ? new Date(value).toLocaleDateString('ru-RU') : 'Не выехал'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              План: {new Date(stay.checkOutDate).toLocaleDateString('ru-RU')}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: 'paymentStatusName',
      label: 'Статус оплаты',
      sortable: true,
      width: 140,
      render: (value) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'Оплачено': return 'success';
            case 'Частично оплачено': return 'warning';
            case 'Ожидает оплаты': return 'info';
            case 'Просрочено': return 'error';
            default: return 'default';
          }
        };
        
        return (
          <Chip 
            className="status-chip"
            label={value} 
            color={getStatusColor(value) as any}
            size="small" 
          />
        );
      },
    },
    {
      key: 'totalAmount',
      label: 'Сумма к оплате',
      sortable: true,
      width: 140,
      align: 'right',
      render: (value) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {value ? `${value.toLocaleString()} ₽` : 'Не указана'}
        </Typography>
      ),
    },
    {
      key: 'paidAmount',
      label: 'Оплачено',
      sortable: true,
      width: 120,
      align: 'right',
      render: (value, stay: StayDTO) => {
        const isPaid = value >= stay.totalAmount;
        return (
          <Box>
            <Typography 
              variant="body2" 
              color={isPaid ? 'success.main' : 'error.main'}
              fontWeight={600}
            >
              {value ? `${value.toLocaleString()} ₽` : '0 ₽'}
            </Typography>
            {!isPaid && (
              <Typography variant="caption" color="error">
                Долг: {(stay.totalAmount - value).toLocaleString()} ₽
              </Typography>
            )}
          </Box>
        );
      },
    },
  ];

  // Действия для строк таблицы
  const actions: ActionButton[] = [
    {
      key: 'view',
      label: 'Просмотр',
      icon: <VisibilityIcon />,
      onClick: (stay: StayDTO) => {
        setSelectedStay(stay);
        setOpenViewDialog(true);
      },
    },
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (stay: StayDTO) => {
        handleEditStay(stay);
      },
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: (stay: StayDTO) => {
        handleDeleteStay(stay.stayId);
      },
      color: 'error',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Загрузка проживаний...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StaysIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Управление проживанием
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateStay}
        >
          Добавить проживание
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Поиск и фильтры */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SearchBar
              value={searchConfig.query}
              onChange={setSearchQuery}
              placeholder="Поиск по ID, комнате или гостям..."
            />
          </Box>
        </CardContent>
      </Card>

      <FilterPanel
        filters={filterOptions}
        values={filterConfig}
        onChange={handleFilterChange}
        onApply={() => {}}
        onClear={clearFilters}
        isCollapsed={true}
        showApplyButton={false}
      />

      
      {/* Таблица проживаний */}
      <DataTable
        data={paginatedStaysWithId}
        columns={columns}
        loading={loading}
        actions={actions}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      <Pagination
        currentPage={paginationConfig.page}
        totalPages={Math.ceil(filteredStays.length / paginationConfig.pageSize)}
        pageSize={paginationConfig.pageSize}
        totalItems={filteredStays.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Диалог создания/редактирования проживания */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <StayForm
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSubmit={handleSubmitStay}
          stay={editingStay}
          loading={loading}
          error={error}
        />
      </Dialog>

      {/* Диалог просмотра проживания */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VisibilityIcon color="primary" />
          Информация о проживании
        </DialogTitle>
        <DialogContent>
          {selectedStay && (
            <Box sx={{ pt: 2 }}>
              {/* Основная информация */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StaysIcon color="primary" />
                    Основная информация
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">ID проживания:</Typography>
                      <Typography variant="body1" fontWeight={500}>#{selectedStay.stayId}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Основной гость:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedStay.stayGuests?.find(guest => guest.isMainGuest)?.guestFullName || 'Не указан'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Комната:</Typography>
                      <Typography variant="body1" fontWeight={500}>Комната {selectedStay.roomNumber}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Статус оплаты:</Typography>
                      <Chip 
                        label={selectedStay.paymentStatusName} 
                        color={selectedStay.paymentStatusName === 'Оплачено' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Даты проживания */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon color="primary" />
                    Даты проживания
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Дата заезда:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(selectedStay.actualCheckInDate).toLocaleDateString('ru-RU')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Планировалось: {new Date(selectedStay.checkInDate).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Дата выезда:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedStay.actualCheckOutDate 
                          ? new Date(selectedStay.actualCheckOutDate).toLocaleDateString('ru-RU')
                          : 'Не выехал'
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Планировалось: {new Date(selectedStay.checkOutDate).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Системная информация */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="primary" />
                    Системная информация
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Дата создания:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(selectedStay.createdAt).toLocaleDateString('ru-RU')} {new Date(selectedStay.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Дата редактирования:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedStay.updatedAt 
                          ? `${new Date(selectedStay.updatedAt).toLocaleDateString('ru-RU')} ${new Date(selectedStay.updatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
                          : 'Не редактировалось'
                        }
                      </Typography>
                    </Grid>
                    {selectedStay.paymentDate && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Дата оплаты:</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {new Date(selectedStay.paymentDate).toLocaleDateString('ru-RU')} {new Date(selectedStay.paymentDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Финансовая информация */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentIcon color="primary" />
                    Финансовая информация
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Общая сумма (в т.ч. НДС):</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedStay.totalAmount?.toLocaleString()} ₽ ({selectedStay.taxAmount?.toLocaleString()} ₽)</Typography>

                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Оплачено:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedStay.paidAmount?.toLocaleString()} ₽</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">К доплате:</Typography>
                      <Typography variant="body1" fontWeight={500} color={(selectedStay.totalAmount || 0) - (selectedStay.paidAmount || 0) > 0 ? 'error.main' : 'success.main'}>
                        {((selectedStay.totalAmount || 0) - (selectedStay.paidAmount || 0)).toLocaleString()} ₽
                      </Typography>
                    </Grid>
                    {selectedStay.dueDate && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Срок оплаты:</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {new Date(selectedStay.dueDate).toLocaleDateString('ru-RU')}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Гости проживания */}
              {selectedStay.stayGuests && selectedStay.stayGuests.length > 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupIcon color="primary" />
                      Гости проживания
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {selectedStay.stayGuests.map((guest, index) => {
                        return (
                          <Grid size={{ xs: 12, sm: 6 }} key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <PersonIcon color="action" fontSize="small" />
                              <Box fontWeight={500}>
                                {guest.guestFullName}
                                {guest.isMainGuest && (
                                  <Chip 
                                    label="Основной" 
                                    size="small" 
                                    color="primary" 
                                    sx={{ ml: 1, fontSize: '0.7rem', height: '20px' }}
                                  />
                                )}
                              </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {guest.guestPhone} • {guest.guestEmail || 'Email не указан'}
                            </Typography>
                            
                            {/* Отображаем индивидуальные даты, если они отличаются */}
                            {(guest.checkInDate && guest.checkInDate !== selectedStay.actualCheckInDate) ||
                             (guest.checkOutDate && guest.checkOutDate !== selectedStay.actualCheckOutDate) ? (
                              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Индивидуальные даты:
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                  {guest.checkInDate ? new Date(guest.checkInDate).toLocaleDateString('ru-RU') : 'Не указано'} - 
                                  {guest.checkOutDate ? new Date(guest.checkOutDate).toLocaleDateString('ru-RU') : 'Не указано'}
                                </Typography>
                              </Box>
                            ) : null}
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              )}
              
              {/* Примечания */}
              {selectedStay.notes && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Примечания</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">{selectedStay.notes}</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Закрыть</Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={() => {
              setOpenViewDialog(false);
              handleEditStay(selectedStay!);
            }}
          >
            Редактировать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaysPage;