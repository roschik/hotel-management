import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  MeetingRoom as RoomsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import SearchBar from '../common/SearchBar';
import FilterPanel, { FilterOption } from '../common/FilterPanel';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import RoomForm from './RoomForm';
import { useTableState } from '../../hooks/useTableState';
import { TableColumn, ActionButton } from '../../types/common';
import { apiService } from '../../services/apiService';
import { RoomDTO, RoomTypeDTO } from '../../types/api';


const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomDTO | null>(null);
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
    initialSort: { field: 'roomNumber', direction: 'asc' },
  });

  // Загрузка данных
  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Ошибка загрузки комнат:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoomTypes = async () => {
    try {
      const data = await apiService.getRoomTypes();
      setRoomTypes(data);
    } catch (error) {
      console.error('Ошибка загрузки типов комнат:', error);
    }
  };

  useEffect(() => {
    loadRooms();
    loadRoomTypes();
  }, []);

  // Обработчики для форм
  const handleCreateRoom = async (roomData: Partial<RoomDTO>) => {
    try {
      setFormLoading(true);
      setFormError(null);
      await apiService.createRoom(roomData);
      setShowCreateDialog(false);
      await loadRooms();
    } catch (error) {
      console.error('Ошибка создания комнаты:', error);
      setFormError('Ошибка при создании комнаты');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateRoom = async (roomData: Partial<RoomDTO>) => {
    if (!selectedRoom) return;
    
    try {
      setFormLoading(true);
      setFormError(null);
      await apiService.updateRoom(selectedRoom.id, roomData);
      setShowEditDialog(false);
      setSelectedRoom(null);
      await loadRooms();
    } catch (error) {
      console.error('Ошибка обновления комнаты:', error);
      setFormError('Ошибка при обновлении комнаты');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteRoom = async (room: RoomDTO) => {
    if (window.confirm(`Вы уверены, что хотите удалить комнату ${room.roomNumber}?`)) {
      try {
        await apiService.deleteRoom(room.id);
        await loadRooms();
      } catch (error) {
        console.error('Ошибка удаления комнаты:', error);
        alert('Ошибка при удалении комнаты');
      }
    }
  };

  // Функция для фильтрации и поиска данных
  const filteredRooms = useMemo(() => {
    let filtered = [...rooms];

    // Применяем поиск
    if (searchConfig.query) {
      const query = searchConfig.query.toLowerCase();
      filtered = filtered.filter(room => 
        room.roomNumber.toLowerCase().includes(query) ||
        room.roomTypeName?.toLowerCase().includes(query) ||
        room.roomDescription?.toLowerCase().includes(query)
      );
    }

    // Применяем фильтры
    if (filterConfig.roomTypeId) {
      filtered = filtered.filter(room => room.roomTypeId === parseInt(filterConfig.roomTypeId));
    }

    if (filterConfig.isAvailable) {
      filtered = filtered.filter(room => room.isAvailable === (filterConfig.isAvailable === 'true'));
    }

    if (filterConfig.floor) {
      filtered = filtered.filter(room => room.floor === parseInt(filterConfig.floor));
    }

    if (filterConfig.capacity) {
      filtered = filtered.filter(room => room.capacity >= parseInt(filterConfig.capacity));
    }

    // Применяем сортировку
    if (sortConfig?.field) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field as keyof RoomDTO];
        const bValue = b[sortConfig.field as keyof RoomDTO];
        
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        return aValue > bValue ? direction : aValue < bValue ? -direction : 0;
      });
    }

    return filtered;
  }, [rooms, searchConfig.query, filterConfig, sortConfig]);

  // Пагинация отфильтрованных данных
  const paginatedRooms = useMemo(() => {
    const startIndex = (paginationConfig.page - 1) * paginationConfig.pageSize;
    const endIndex = startIndex + paginationConfig.pageSize;
    return filteredRooms.slice(startIndex, endIndex);
  }, [filteredRooms, paginationConfig.page, paginationConfig.pageSize]);

  // Фильтры для комнат
  const filterOptions: FilterOption[] = [
    {
      key: 'roomTypeId',
      label: 'Тип комнаты',
      type: 'select',
      options: roomTypes.map(type => ({
        value: type.id.toString(),
        label: type.name,
      })),
    },
    {
      key: 'isAvailable',
      label: 'Доступность',
      type: 'select',
      options: [
        { value: 'true', label: 'Доступна' },
        { value: 'false', label: 'Недоступна' },
      ],
    },
    {
      key: 'floor',
      label: 'Этаж',
      type: 'number',
      placeholder: 'Номер этажа',
    },
    {
      key: 'capacity',
      label: 'Вместимость',
      type: 'number',
      placeholder: 'Минимальная вместимость',
    },
  ];

  // Колонки таблицы
  const columns: TableColumn[] = [
    {
      key: 'roomNumber',
      label: 'Номер',
      sortable: true,
      width: 100,
    },
    {
      key: 'roomTypeName',
      label: 'Тип',
      sortable: true,
      render: (value, room: RoomDTO) => {
        const roomType = roomTypes.find(type => type.id === room.roomTypeId);
        if (!roomType) return value || 'Не указан';
        
        return (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {roomType.name}
            </Typography>
            {roomType.description && (
              <Typography variant="caption" color="text.secondary" display="block">
                {roomType.description}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: 'capacity',
      label: 'Вместимость',
      sortable: true,
      width: 120,
      align: 'center',
      render: (value) => `${value} чел.`,
    },
    {
      key: 'floor',
      label: 'Этаж',
      sortable: true,
      width: 80,
      align: 'center',
    },
    {
      key: 'amenities',
      label: 'Удобства',
      sortable: false,
      width: 200,
      render: (value, room: RoomDTO) => {
        const amenities = [];
        if (room.hasWifi) amenities.push('Wi-Fi');
        if (room.hasTV) amenities.push('ТВ');
        if (room.hasMinibar) amenities.push('Мини-бар');
        if (room.hasAirConditioning) amenities.push('Кондиционер');
        if (room.hasBalcony) amenities.push('Балкон');
        
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {amenities.length > 0 ? (
              amenities.map((amenity, index) => (
                <Chip 
                  key={index} 
                  label={amenity} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">
                Нет
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: 'isAvailable',
      label: 'Доступность',
      sortable: true,
      render: (value) => {
        return (
          <Chip 
            className="status-chip"
            label={value ? 'Доступна' : 'Недоступна'} 
            color={value ? 'success' : 'error'} 
            size="small" 
          />
        );
      },
    },
    {
      key: 'pricePerNight',
      label: 'Цена за ночь',
      sortable: true,
      width: 120,
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
  ];

  // Действия для строк таблицы
  const actions: ActionButton[] = [
    {
      key: 'view',
      label: 'Просмотр',
      icon: <ViewIcon />,
      onClick: (room: RoomDTO) => {
        setSelectedRoom(room);
        setShowViewDialog(true);
      },
    },
    {
      key: 'edit',
      label: 'Редактировать',
      icon: <EditIcon />,
      onClick: (room: RoomDTO) => {
        setSelectedRoom(room);
        setShowEditDialog(true);
      },
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: <DeleteIcon />,
      onClick: handleDeleteRoom,
      color: 'error',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RoomsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Управление комнатами
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
        >
          Добавить комнату
        </Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SearchBar
              value={searchConfig.query}
              onChange={setSearchQuery}
              placeholder="Поиск по номеру, типу или описанию..."
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

      <DataTable
        data={paginatedRooms}
        columns={columns}
        loading={loading}
        actions={actions}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      <Pagination
        currentPage={paginationConfig.page}
        totalPages={Math.ceil(filteredRooms.length / paginationConfig.pageSize)}
        pageSize={paginationConfig.pageSize}
        totalItems={filteredRooms.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Диалог создания */}
      <RoomForm
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setFormError(null);
        }}
        onSubmit={handleCreateRoom}
        loading={formLoading}
        error={formError}
      />

      {/* Диалог редактирования */}
      <RoomForm
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedRoom(null);
          setFormError(null);
        }}
        onSubmit={handleUpdateRoom}
        room={selectedRoom}
        loading={formLoading}
        error={formError}
      />

      {/* Диалог просмотра */}
      <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Информация о комнате</DialogTitle>
        <DialogContent>
          {selectedRoom && (() => {
            const roomType = roomTypes.find(type => type.id === selectedRoom.roomTypeId);
            return (
              <Grid container spacing={3} sx={{ pt: 2 }}>
                {/* Левая колонка - информация */}
                <Grid size={{ xs: 12, md: selectedRoom.imageUrl ? 8 : 12 }}>
                  <Typography variant="h6">
                    Комната №{selectedRoom.roomNumber}
                  </Typography>
                  
                  {/* Информация о типе комнаты */}
                  <Box sx={{ mt: 2, bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary">
                      Тип комнаты: {roomType?.name || selectedRoom.roomTypeName || 'Не указан'}
                    </Typography>
                    {roomType?.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {roomType.description}
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    {selectedRoom.capacity} чел. • {selectedRoom.floor} этаж
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Статус: {selectedRoom.isAvailable ? 'Доступна' : 'Недоступна'}
                  </Typography>

                  <Typography variant="body2">
                    Цена за ночь: {selectedRoom.pricePerNight} ₽
                  </Typography>
                  
                  {selectedRoom.roomDescription && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Описание номера:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {selectedRoom.roomDescription}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} component="div">
                      Удобства:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {selectedRoom.hasWifi && <Chip label="Wi-Fi" size="small" />}
                      {selectedRoom.hasTV && <Chip label="Телевизор" size="small" />}
                      {selectedRoom.hasMinibar && <Chip label="Мини-бар" size="small" />}
                      {selectedRoom.hasAirConditioning && <Chip label="Кондиционер" size="small" />}
                      {selectedRoom.hasBalcony && <Chip label="Балкон" size="small" />}
                      {!selectedRoom.hasWifi && !selectedRoom.hasTV && !selectedRoom.hasMinibar && 
                       !selectedRoom.hasAirConditioning && !selectedRoom.hasBalcony && (
                        <Typography variant="body2" color="text.secondary">
                          Дополнительные удобства отсутствуют
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                
                {/* Правая колонка - изображение */}
                {selectedRoom.imageUrl && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Изображение комнаты:
                      </Typography>
                      <Box
                        component="img"
                        src={`${process.env.REACT_APP_URL}${selectedRoom.imageUrl}`}
                        alt={`Комната №${selectedRoom.roomNumber}`}
                        sx={{
                          width: '100%',
                          maxHeight: 300,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomsPage;
