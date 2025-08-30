import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Typography,
  Chip,
} from '@mui/material';
import { Person as PersonIcon, Hotel as HotelIcon, Work as WorkIcon } from '@mui/icons-material';
import { BookingDTO, RoomDTO, GuestDTO, BookingStatusDTO, BookingTypeDTO, EmployeeDTO } from '../../types/api';
import { apiService } from '../../services/apiService';
import GuestSelectionModal from '../modals/GuestSelectionModal';
import RoomSelectionModal from '../modals/RoomSelectionModal';
import EmployeeSelectionModal from '../modals/EmployeeSelectionModal';

interface BookingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<BookingDTO>) => void;
  booking?: BookingDTO | null;
  loading?: boolean;
  error?: string | null;
}

const BookingForm: React.FC<BookingFormProps> = ({
  open,
  onClose,
  onSubmit,
  booking,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<Partial<BookingDTO>>(() => ({
    id: 0,
    guestId: 0,
    roomId: 0,
    bookingTypeId: 2,
    bookingStatusId: 4, 
    employeeId: undefined,
    createdAt: new Date(),
    checkInDate: '',
    checkOutDate: '',
    basePrice: 0,
    totalPrice: 0,
    notes: '',
  }));

  const [selectedGuest, setSelectedGuest] = useState<GuestDTO | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomDTO | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDTO | null>(null);
  const [bookingTypes, setBookingTypes] = useState<BookingTypeDTO[]>([]);
  const [bookingStatuses, setBookingStatuses] = useState<BookingStatusDTO[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Модальные окна
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // Определяем, является ли это новым бронированием
  const isNewBooking = !booking;

  const toUTCDate = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const toUTCDateTime = (date: Date | string): Date => {
    const d = new Date(date);
    return new Date(d.toISOString());
  };

  // Функция для расчета количества дней
  const calculateDays = (checkIn: Date, checkOut: Date): number => {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // Функция для расчета базовой стоимости
  const calculateBasePrice = (): number => {
    if (!selectedRoom || !formData.checkInDate || !formData.checkOutDate) {
      return 0;
    }
    
    const days = calculateDays(new Date(formData.checkInDate), new Date(formData.checkOutDate));
    return days * selectedRoom.pricePerNight;
  };

  // Эффект для автоматического пересчета цен
  useEffect(() => {
    const basePrice = calculateBasePrice();
    setFormData(prev => ({
      ...prev,
      basePrice,
      totalPrice: prev.totalPrice === prev.basePrice ? basePrice : prev.totalPrice || basePrice
    }));
  }, [selectedRoom, formData.checkInDate, formData.checkOutDate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookingTypesData, bookingStatusesData] = await Promise.all([
          apiService.getBookingTypes(),
          apiService.getBookingStatuses()
        ]);
        
        setBookingTypes(bookingTypesData);
        setBookingStatuses(bookingStatusesData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };

    if (open) {
      loadData();
      
      // Если редактируем существующее бронирование
      if (booking) {
        setFormData({
          ...booking,
          checkInDate:  toUTCDate(booking.checkInDate),
          checkOutDate: toUTCDate(booking.checkOutDate),
        });
        
        loadSelectedData(booking);
      } else {
        setFormData({
          id: 0,
          guestId: 0,
          roomId: 0,
          bookingTypeId: 2,
          bookingStatusId: 4, 
          employeeId: undefined,
          createdAt: toUTCDateTime(new Date()),
          checkInDate: toUTCDate(new Date()),
          checkOutDate: toUTCDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
          basePrice: 0,
          totalPrice: 0,
          notes: '',
        });
        setSelectedGuest(null);
        setSelectedRoom(null);
        setSelectedEmployee(null);
      }
    }
  }, [open, booking]);

  const loadSelectedData = async (bookingData: BookingDTO) => {
    try {
      // Загружаем данные гостя
      if (bookingData.guestId) {
        const guests = await apiService.getGuests();
        const guest = guests.find((g: GuestDTO) => g.id === bookingData.guestId);
        if (guest) setSelectedGuest(guest);
      }
      
      // Загружаем данные комнаты
      if (bookingData.roomId) {
        const rooms = await apiService.getRooms();
        const room = rooms.find((r: RoomDTO) => r.id === bookingData.roomId);
        if (room) setSelectedRoom(room);
      }
      
      // Загружаем данные сотрудника
      if (bookingData.employeeId) {
        const employees = await apiService.getStaff();
        const employee = employees.find((e: EmployeeDTO) => e.id === bookingData.employeeId);
        if (employee) setSelectedEmployee(employee);
      }
    } catch (error) {
      console.error('Ошибка загрузки выбранных данных:', error);
    }
  };

  const handleChange = (field: keyof BookingDTO) => (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGuestSelect = (guest: GuestDTO) => {
    setSelectedGuest(guest);
    setFormData(prev => ({ ...prev, guestId: guest.id }));
    if (validationErrors.guestId) {
      setValidationErrors(prev => ({ ...prev, guestId: '' }));
    }
  };

  const handleRoomSelect = (room: RoomDTO) => {
    setSelectedRoom(room);
    setFormData(prev => ({ ...prev, roomId: room.id }));
    if (validationErrors.roomId) {
      setValidationErrors(prev => ({ ...prev, roomId: '' }));
    }
  };

  const handleEmployeeSelect = (employee: EmployeeDTO) => {
    setSelectedEmployee(employee);
    setFormData(prev => ({ ...prev, employeeId: employee.id }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.guestId) {
      errors.guestId = 'Выберите гостя';
    }

    if (!formData.roomId) {
      errors.roomId = 'Выберите комнату';
    }

    if (!formData.checkInDate) {
      errors.checkInDate = 'Дата заезда обязательна';
    }

    if (!formData.checkOutDate) {
      errors.checkOutDate = 'Дата выезда обязательна';
    }

    if (formData.checkInDate && formData.checkOutDate && 
        new Date(formData.checkInDate) >= new Date(formData.checkOutDate)) {
      errors.checkOutDate = 'Дата выезда должна быть позже даты заезда';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        checkInDate: toUTCDate(formData.checkInDate!),
        checkOutDate: toUTCDate(formData.checkOutDate!),
        createdAt: formData.createdAt ? toUTCDateTime(formData.createdAt) : toUTCDateTime(new Date()),

      };
      onSubmit(dataToSubmit);
    }
  };

  const handleClose = () => {
    setValidationErrors({});
    onClose();
  };

  // Стили для недоступных полей
  const disabledFieldStyles = {
    '& .MuiInputBase-root': {
      backgroundColor: '#f5f5f5',
      '&:hover': {
        backgroundColor: '#f5f5f5',
      },
      '&.Mui-focused': {
        backgroundColor: '#f5f5f5',
      }
    },
    '& .MuiInputBase-input': {
      color: '#666',
    },
    '& .MuiInputLabel-root': {
      color: '#666'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ddd'
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {booking ? 'Редактировать бронирование' : 'Создать бронирование'}
          </DialogTitle>
          
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Выбор гостя */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Button
                    fullWidth
                    variant={selectedGuest ? "outlined" : "contained"}
                    onClick={() => setShowGuestModal(true)}
                    startIcon={<PersonIcon />}
                    sx={{ 
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      height: 56,
                      border: validationErrors.guestId ? '1px solid red' : undefined
                    }}
                  >
                    {selectedGuest ? (
                      <Box>
                        <Typography variant="body2">
                          {selectedGuest.firstName} {selectedGuest.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedGuest.phone}
                        </Typography>
                      </Box>
                    ) : (
                      'Выберите гостя'
                    )}
                  </Button>
                  {validationErrors.guestId && (
                    <Typography variant="caption" color="error">
                      {validationErrors.guestId}
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              {/* Выбор комнаты */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Button
                    fullWidth
                    variant={selectedRoom ? "outlined" : "contained"}
                    onClick={() => setShowRoomModal(true)}
                    startIcon={<HotelIcon />}
                    sx={{ 
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      height: 56,
                      border: validationErrors.roomId ? '1px solid red' : undefined
                    }}
                  >
                    {selectedRoom ? (
                      <Box>
                        <Typography variant="body2">
                          Комната {selectedRoom.roomNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedRoom.roomTypeName} - {selectedRoom.pricePerNight}₽/ночь
                        </Typography>
                      </Box>
                    ) : (
                      'Выберите комнату'
                    )}
                  </Button>
                  {validationErrors.roomId && (
                    <Typography variant="caption" color="error">
                      {validationErrors.roomId}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Дата заезда */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Дата заезда"
                  type="date"
                  value={formData.checkInDate}
                  onChange={handleChange('checkInDate')}
                  error={!!validationErrors.checkInDate}
                  helperText={validationErrors.checkInDate}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Дата выезда */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Дата выезда"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={handleChange('checkOutDate')}
                  error={!!validationErrors.checkOutDate}
                  helperText={validationErrors.checkOutDate}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Базовая стоимость */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Базовая стоимость"
                  type="number"
                  value={formData.basePrice || 0}
                  disabled={true}
                  InputProps={{
                    readOnly: true,
                    endAdornment: <Typography variant="body2">₽</Typography>
                  }}
                  helperText={selectedRoom && formData.checkInDate && formData.checkOutDate ? 
                    `${calculateDays(new Date(formData.checkInDate), new Date(formData.checkOutDate))} дн. × ${selectedRoom.pricePerNight}₽` : 
                    'Выберите комнату и даты'
                  }
                  sx={disabledFieldStyles}
                />
              </Grid>

              {/* Итоговая стоимость */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Итоговая стоимость"
                  type="number"
                  value={formData.totalPrice || 0}
                  onChange={handleChange('totalPrice')}
                  InputProps={{
                    endAdornment: <Typography variant="body2">₽</Typography>
                  }}
                  helperText="Можно изменить при необходимости"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl required fullWidth error={!!validationErrors.bookingTypeId}>
                  <InputLabel>Тип бронирования</InputLabel>
                  <Select
                    value={formData.bookingTypeId || ''}
                    onChange={handleChange('bookingTypeId')}
                    label="Тип бронирования"
                  >
                    {bookingTypes.map(type => (
                      <MenuItem key={type.bookingTypeId} value={type.bookingTypeId}>
                        {type.description}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.bookingTypeId && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                      {validationErrors.bookingTypeId}
                    </Box>
                  )}                  
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl 
                  fullWidth 
                  error={!!validationErrors.bookingStatusId}
                  disabled={isNewBooking}
                  sx={isNewBooking ? disabledFieldStyles : {}}
                >
                  <InputLabel>Статус</InputLabel>
                  <Select
                    value={formData.bookingStatusId || ''}
                    onChange={handleChange('bookingStatusId')}
                    label="Статус"
                    disabled={isNewBooking}
                  >
                    {bookingStatuses.map(status => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.description}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.bookingStatusId && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                      {validationErrors.bookingStatusId}
                    </Box>
                  )}
                  {isNewBooking && (
                    <Box sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5 }}>
                      Для новых бронирований автоматически устанавливается "Ожидает подтверждения"
                    </Box>
                  )}                  
                </FormControl>
              </Grid>

              {/* Выбор ответственного сотрудника */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowEmployeeModal(true)}
                    startIcon={<WorkIcon />}
                    sx={{ 
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      height: 56
                    }}
                  >
                    {selectedEmployee ? (
                      <Box>
                        <Typography variant="body2">
                          {selectedEmployee.firstName} {selectedEmployee.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedEmployee.position}
                        </Typography>
                      </Box>
                    ) : (
                      'Выберите сотрудника (опционально)'
                    )}
                  </Button>
                  {selectedEmployee && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setFormData(prev => ({ ...prev, employeeId: undefined }));
                      }}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      ✕
                    </Button>
                  )}
                </Box>
              </Grid>

              {/* Заметки */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Заметки"
                  multiline
                  rows={3}
                  value={formData.notes || ''}
                  onChange={handleChange('notes')}
                  placeholder="Дополнительная информация о бронировании..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              Отмена
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              {loading ? 'Сохранение...' : (booking ? 'Обновить' : 'Создать')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Модальные окна */}
      <GuestSelectionModal
        open={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSelect={handleGuestSelect}
      />
      
      <RoomSelectionModal
        open={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        onSelect={handleRoomSelect}
      />
      
      <EmployeeSelectionModal
        open={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSelect={handleEmployeeSelect}
      />
    </>
  );
};

export default BookingForm;
