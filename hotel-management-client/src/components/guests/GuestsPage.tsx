import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  People as GuestsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import SearchBar from '../common/SearchBar';
import FilterPanel, { FilterOption } from '../common/FilterPanel';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import GuestForm from './GuestForm';
import { useTableState } from '../../hooks/useTableState';
import { TableColumn, ActionButton } from '../../types/common';
import { apiService, citizenshipService, identificationTypeService } from '../../services/apiService';
import { GuestDTO, CitizenshipDTO, IdentificationTypeDTO } from '../../types/api';


const GuestsPage: React.FC = () => {
  const [guests, setGuests] = useState<GuestDTO[]>([]);
  const [citizenships, setCitizenships] = useState<CitizenshipDTO[]>([]);
  const [identificationTypes, setIdentificationTypes] = useState<IdentificationTypeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestDTO | null>(null);
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
    initialSort: { field: 'lastName', direction: 'asc' },
  });

  // Загрузка данных
  const loadGuests = async () => {
    try {
      setLoading(true);
      const data = await apiService.getGuests();
      setGuests(data);
    } catch (error) {
      console.error('Ошибка загрузки гостей:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCitizenships = async () => {
    try {
      const data = await citizenshipService.getActiveCitizenships();
      setCitizenships(data);
    } catch (error) {
      console.error('Ошибка загрузки гражданств:', error);
    }
  };

  const loadIdentificationTypes = async () => {
    try {
      const data = await identificationTypeService.getIdentificationTypes();
      setIdentificationTypes(data);
    } catch (error) {
      console.error('Ошибка загрузки типов документов:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadGuests();
      await loadCitizenships();
      await loadIdentificationTypes();
    };
    loadData();
  }, []);


  // Обработчики для форм
  const handleCreateGuest = async (guestData: Partial<GuestDTO>) => {
    try {
      setFormLoading(true);
      setFormError(null);
      await apiService.createGuest(guestData);
      setShowCreateDialog(false);
      await loadGuests();
    } catch (error) {
      console.error('Ошибка создания гостя:', error);
      setFormError('Ошибка при создании гостя');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateGuest = async (guestData: Partial<GuestDTO>) => {
    if (!selectedGuest) return;
    
    try {
      setFormLoading(true);
      setFormError(null);
      await apiService.updateGuest(selectedGuest.id.toString(), guestData);
      setShowEditDialog(false);
      setSelectedGuest(null);
      await loadGuests();
    } catch (error) {
      console.error('Ошибка обновления гостя:', error);
      setFormError('Ошибка при обновлении гостя');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteGuest = async (guest: GuestDTO) => {
    if (window.confirm(`Вы уверены, что хотите удалить гостя "${guest.firstName} ${guest.lastName}"?`)) {
      try {
        await apiService.deleteGuest(guest.id.toString());
        await loadGuests();
      } catch (error: any) {
        console.error('Ошибка удаления гостя:', error.response?.data || error.message);
        alert('Ошибка при удалении гостя');
      }
    }
  };

  // Функция для фильтрации и поиска данных
  const filteredGuests = useMemo(() => {
    let filtered = [...guests];
  
    // Применяем поиск
    if (searchConfig.query) {
      const query = searchConfig.query.toLowerCase().trim();
      const searchWords = query.split(/\s+/).filter(word => word.length > 0);
      
      filtered = filtered.filter(guest => {
        const fullName = `${guest.firstName} ${guest.lastName} ${guest.middleName || ''}`.toLowerCase();
        const email = guest.email?.toLowerCase() || '';
        const phone = guest.phone?.toLowerCase() || '';
  
        if (searchWords.length === 1) {
          const searchTerm = searchWords[0];
          return guest.firstName.toLowerCase().includes(searchTerm) ||
                 guest.lastName.toLowerCase().includes(searchTerm) ||
                 guest.middleName?.toLowerCase().includes(searchTerm) ||
                 email.includes(searchTerm) ||
                 phone.includes(searchTerm);
        }
        
        return searchWords.every(word => 
          fullName.includes(word) ||
          email.includes(word) ||
          phone.includes(word)
        );
      });
    }
  
    // Применяем фильтры
    if (filterConfig.citizenshipId) {
      filtered = filtered.filter(guest => guest.citizenshipId === parseInt(filterConfig.citizenshipId));
    }
  
    // Фильтр по дате рождения
    if (filterConfig.dateOfBirth) {
      const { start, end } = filterConfig.dateOfBirth;
      if (start || end) {
        filtered = filtered.filter(guest => {
          if (!guest.dateOfBirth) return false;
          const guestBirthDate = new Date(guest.dateOfBirth);
          
          if (start && end) {
            return guestBirthDate >= new Date(start) && guestBirthDate <= new Date(end);
          } else if (start) {
            return guestBirthDate >= new Date(start);
          } else if (end) {
            return guestBirthDate <= new Date(end);
          }
          return true;
        });
      }
    }
  
    // Фильтр по количеству бронирований
    if (filterConfig.bookingsCount) {
      const minBookings = parseInt(filterConfig.bookingsCount);
      if (!isNaN(minBookings)) {
        filtered = filtered.filter(guest => guest.bookingsCount >= minBookings);
      }
    }
  
    // Фильтр по дате добавления
    if (filterConfig.createdAt) {
      const { start, end } = filterConfig.createdAt;
      if (start || end) {
        filtered = filtered.filter(guest => {
          const guestCreatedDate = new Date(guest.createdAt);
          
          if (start && end) {
            return guestCreatedDate >= new Date(start) && guestCreatedDate <= new Date(end);
          } else if (start) {
            return guestCreatedDate >= new Date(start);
          } else if (end) {
            return guestCreatedDate <= new Date(end);
          }
          return true;
        });
      }
    }
  
    // Применяем сортировку
    if (sortConfig?.field) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field as keyof GuestDTO];
        const bValue = b[sortConfig.field as keyof GuestDTO];
        
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        return aValue > bValue ? direction : aValue < bValue ? -direction : 0;
      });
    }

    return filtered;
  }, [guests, searchConfig.query, filterConfig, sortConfig]);

  // Пагинация отфильтрованных данных
  const paginatedGuests = useMemo(() => {
    const startIndex = (paginationConfig.page - 1) * paginationConfig.pageSize;
    const endIndex = startIndex + paginationConfig.pageSize;
    return filteredGuests.slice(startIndex, endIndex);
  }, [filteredGuests, paginationConfig.page, paginationConfig.pageSize]);

  // Фильтры для гостей
  const filterOptions: FilterOption[] = [
    {
      key: 'citizenshipId',
      label: 'Гражданство',
      type: 'select',
      options: citizenships.map(citizenship => ({
        value: citizenship.id.toString(),
        label: citizenship.name,
      })),
    },
    {
      key: 'dateOfBirth',
      label: 'Дата рождения',
      type: 'dateRange',
    },
    {
      key: 'bookingsCount',
      label: 'Количество бронирований',
      type: 'number',
      placeholder: 'Минимальное количество',
    },
    {
      key: 'createdAt',
      label: 'Дата добавления',
      type: 'dateRange',
    },
  ];

  // Колонки таблицы
  const columns: TableColumn[] = [
    {
      key: 'guest',
      label: 'Гость',
      sortable: true,
      render: (_, guest) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40 }}>
            {guest.firstName[0]}{guest.lastName[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {guest.lastName} {guest.firstName} {guest.middleName || ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {guest.id}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'contact',
      label: 'Контакты',
      render: (_, guest) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body2">{guest.email}</Typography>
          </Box>
          {guest.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body2">{guest.phone}</Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      key: 'citizenshipName',
      label: 'Гражданство',
      sortable: true,
      width: 120,
      render: (_, guest) => (
        <Typography variant="body2">
          {guest.citizenshipName || 'Не указано'}
        </Typography>
      ),
    },
    {
      key: 'dateOfBirth',
      label: 'Дата рождения',
      sortable: true,
      width: 140,
      render: (_, guest) => (
        <Typography variant="body2">
          {guest.dateOfBirth ? new Date(guest.dateOfBirth).toLocaleDateString('ru-RU') : 'Не указана'}
        </Typography>
      ),
    },
    {
      key: 'address',
      label: 'Адрес',
      sortable: true,
      width: 200,
      render: (_, guest) => (
        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {guest.address || 'Не указан'}
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
      onClick: (guest) => {
        setSelectedGuest(guest);
        setShowViewDialog(true);
      },
    },
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (guest) => {
        setSelectedGuest(guest);
        setShowEditDialog(true);
      },
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      color: 'error',
      onClick: handleDeleteGuest,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GuestsIcon sx={{ fontSize: 32, color: 'primary.main' }} /> 
          Управление гостями
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Добавить гостя
        </Button>
      </Box>

      {/* Поиск */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <SearchBar
            value={searchConfig.query}
            onChange={setSearchQuery}
            placeholder="Поиск по ФИО, email, телефону..."
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
          data={paginatedGuests}
          loading={loading}
          sortConfig={sortConfig}
          onSort={handleSort}
          actions={actions}
          emptyMessage="Гости не найдены"
        />
      </Card>

      {/* Пагинация */}
      <Pagination
        currentPage={paginationConfig.page}
        totalPages={Math.ceil(filteredGuests.length / paginationConfig.pageSize)}
        pageSize={paginationConfig.pageSize}
        totalItems={filteredGuests.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Диалог создания */}
      <GuestForm
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setFormError(null);
        }}
        onSubmit={handleCreateGuest}
        loading={formLoading}
        error={formError}
        citizenships={citizenships}
        identificationTypes={identificationTypes}

      />

      {/* Диалог редактирования */}
      <GuestForm
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedGuest(null);
          setFormError(null);
        }}
        onSubmit={handleUpdateGuest}
        guest={selectedGuest}
        loading={formLoading}
        error={formError}
        citizenships={citizenships}
        identificationTypes={identificationTypes}
      />

      {/* Диалог просмотра */}
      <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          Информация о госте
        </DialogTitle>
        <DialogContent>
          {selectedGuest && (
            <Box sx={{ pt: 2 }}>
              {/* Основная информация */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    Основная информация
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Фамилия:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedGuest.lastName}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Имя:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedGuest.firstName}</Typography>
                    </Grid>
                    {selectedGuest.middleName && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Отчество:</Typography>
                        <Typography variant="body1" fontWeight={500}>{selectedGuest.middleName}</Typography>
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Дата рождения:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedGuest.dateOfBirth ? new Date(selectedGuest.dateOfBirth).toLocaleDateString('ru-RU') : 'Не указана'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Гражданство:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedGuest.citizenshipName || 'Не указано'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Контактная информация */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon color="primary" />
                    Контактная информация
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Email:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedGuest.email || 'Не указан'}</Typography>

                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Телефон:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedGuest.phone || 'Не указан'}</Typography>

                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Почтовый индекс:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedGuest.postalCode || 'Не указан'}</Typography>

                    </Grid>             
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Дата регистрации:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedGuest.registrationDate ? new Date(selectedGuest.registrationDate).toLocaleDateString('ru-RU') : 'Не указана'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">Адрес:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedGuest.address || 'Не указан'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Документы */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeIcon color="primary" />
                    Документы
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Тип документа:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedGuest.identificationTypeName}</Typography>
                    </Grid>
                    {selectedGuest.identificationNumber && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Номер документа:</Typography>
                        <Typography variant="body1" fontWeight={500}>{selectedGuest.identificationNumber}</Typography>
                      </Grid>
                    )}
                    {selectedGuest.identificationIssuedBy && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Кем выдан документ:</Typography>
                        <Typography variant="body1" fontWeight={500}>{selectedGuest.identificationIssuedBy}</Typography>
                      </Grid>
                    )}
                    {selectedGuest.identificationIssuedDate && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Дата выдачи документа:</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedGuest.identificationIssuedDate ? new Date(selectedGuest.identificationIssuedDate).toLocaleDateString('ru-RU') : 'Не указана'}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Статистика */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" />
                    Статистика
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Количество бронирований:</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedGuest.bookingsCount}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Дата создания записи:</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(selectedGuest.createdAt).toLocaleString('ru-RU')}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Заметки */}
              {selectedGuest.notes && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Заметки</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">{selectedGuest.notes}</Typography>
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

export default GuestsPage;