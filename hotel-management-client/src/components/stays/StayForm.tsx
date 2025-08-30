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
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Hotel as HotelIcon,
  Work as WorkIcon,
  Group as GroupIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  SwapVert as SwapVertIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { StayDTO, CreateStayDTO, UpdateStayDTO, BookingDTO, GuestDTO, EmployeeDTO, PaymentStatusDTO } from '../../types/api';
import { apiService } from '../../services/apiService';
import BookingSelectionModal from '../modals/BookingSelectionModal';
import MultiGuestSelectionModal from '../modals/MultiGuestSelectionModal';
import EmployeeSelectionModal from '../modals/EmployeeSelectionModal';

interface StayFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStayDTO | UpdateStayDTO) => void;
  stay?: StayDTO | null;
  loading?: boolean;
  error?: string | null;
}

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
  }
};

const StayForm: React.FC<StayFormProps> = ({
  open,
  onClose,
  onSubmit,
  stay,
  loading = false,
  error = null,
}) => {
  

  const [formData, setFormData] = useState({
    bookingId: 0,
    actualCheckInDate: null as Date | null,
    actualCheckOutDate: null as Date | null,
    totalAmount: 0,
    paidAmount: 0,
    dueDate: null as Date | null,
    paymentDate: null as Date | null,
    employeeId: 0, 
    taxPercent: 20, 
    paymentStatusId: 1,
    notes: '',
  });

  const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null);
  const [selectedGuests, setSelectedGuests] = useState<GuestDTO[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDTO | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string>('');
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatusDTO[]>([]);
  const [mainGuestId, setMainGuestId] = useState<number | null>(null); 
  
  // Модальные окна
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showStayGuestEditModal, setShowStayGuestEditModal] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<number | null>(null);
  const [editingGuestDates, setEditingGuestDates] = useState<{
    checkInDate: Date | null;
    checkOutDate: Date | null;
  }>({ checkInDate: null, checkOutDate: null });


  // Определяем, является ли это новым проживанием
  const isNewStay = !stay;

  useEffect(() => {
    if (stay) {
      setFormData({
        bookingId: stay.bookingId,
        actualCheckInDate: stay.actualCheckInDate ? new Date(stay.actualCheckInDate) : null,
        actualCheckOutDate: stay.actualCheckOutDate ? new Date(stay.actualCheckOutDate) : null,
        totalAmount: stay.totalAmount,
        paidAmount: stay.paidAmount,
        dueDate: stay.dueDate ? new Date(stay.dueDate) : null,
        paymentDate: stay.paymentDate ? new Date(stay.paymentDate) : null,
        taxPercent: Math.round(formData.taxPercent), 
        paymentStatusId: stay.paymentStatusId,
        employeeId: stay.employeeId || 0,
        notes: stay.notes || '',
      });
      
      // Сохраняем ID основного гостя
      const mainGuest = stay.stayGuests?.find(sg => sg.isMainGuest);
      if (mainGuest) {
        setMainGuestId(mainGuest.guestId);
      }
      
      // Инициализируем индивидуальные даты гостей
      if (stay.stayGuests) {
        const initialGuestDates: Record<number, { checkInDate: Date | null; checkOutDate: Date | null }> = {};
        stay.stayGuests.forEach(sg => {
          initialGuestDates[sg.guestId] = {
            checkInDate: sg.checkInDate ? new Date(sg.checkInDate) : null,
            checkOutDate: sg.checkOutDate ? new Date(sg.checkOutDate) : null
          };
        });
        setGuestDates(initialGuestDates);
      }
      
    // Загружаем данные о бронировании
    if (stay.bookingId) {
      loadBookingData(stay.bookingId);
    }
    
    // Устанавливаем выбранных гостей
    if (stay.stayGuests) {
      const guests = stay.stayGuests.map(sg => ({
        id: sg.guestId,
        firstName: sg.guestFullName.split(' ')[0] || '',
        lastName: sg.guestFullName.split(' ')[1] || '',
        middleName: sg.guestFullName.split(' ')[2] || '',
        phone: sg.guestPhone,
        email: sg.guestEmail,
        // Остальные обязательные поля
        address: '',
        postalCode: '',
        dateOfBirth: null,
        identificationTypeId: 1,
        identificationTypeName: '',
        identificationNumber: '',
        identificationIssuedBy: '',
        identificationIssuedDate: null,
        notes: sg.notes || '',
        registrationDate: null,
        bookingsCount: 0,
        createdAt: new Date(),
        citizenshipId: 1,
        citizenshipName: '',
        citizenshipCode: ''
      } as GuestDTO));
      setSelectedGuests(guests);
    }

    // Загружаем данные о статусах оплаты
    if(stay.paymentStatusId) {
      loadPaymentStatuses();
    }

    // Загружаем данные о сотруднике
    if (stay.employeeId) {
      loadEmployeeData(stay.employeeId);
    }
    } else {
      // Сброс формы для нового проживания
      setFormData({
        bookingId: 0,
        actualCheckInDate: null,
        actualCheckOutDate: null,
        totalAmount: 0,
        paidAmount: 0,
        dueDate: null,
        paymentDate: null,
        employeeId: 0,
        taxPercent: 20,
        paymentStatusId: 1,
        notes: '',
      });
      setSelectedBooking(null);
      setSelectedGuests([]);
      setSelectedEmployee(null);
      setMainGuestId(null);
      
      loadPaymentStatuses();
    }
  }, [stay, open]);

  const loadBookingData = async (bookingId: number) => {
    try {
      const bookings = await apiService.getBookings();
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        setSelectedBooking(booking);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных бронирования:', error);
    }
  };

  // Функция для загрузки данных сотрудника по ID
  const loadEmployeeData = async (employeeId: number) => {
    try {
      const employees = await apiService.getStaff();
      const employee = employees.find(e => e.id === employeeId);
      if (employee) {
        setSelectedEmployee(employee);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных сотрудника:', error);
    }
  };

  // Функция для загрузки данных гостя по ID
  const loadGuestData = async (guestId: number): Promise<GuestDTO | null> => {
    try {
      const guests = await apiService.getGuests();
      return guests.find(g => g.id === guestId) || null;
    } catch (error) {
      console.error('Ошибка загрузки данных гостя:', error);
      return null;
    }
  };

  // Функция для загрузки данных статуса оплаты
  const loadPaymentStatuses = async () => {
    try {
      const statuses = await apiService.getPaymentStatuses();
      setPaymentStatuses(statuses);
    } catch (error) {
      console.error('Ошибка загрузки данных статуса оплаты:', error);
    }
  };


  // Функция для расчета количества дней между датами
  const calculateDays = (checkIn: Date, checkOut: Date): number => {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Функция для пересчета общей суммы на основе дат
  const recalculateAmount = (checkInDate: Date | null, checkOutDate: Date | null, baseAmount: number) => {
    if (!checkInDate || !checkOutDate || !selectedBooking) {
      return baseAmount;
    }

    const days = calculateDays(checkInDate, checkOutDate);
    return selectedBooking.totalPrice * days;
  };

  const handleBookingSelect = async (booking: BookingDTO) => {

    setSelectedBooking(booking);
    const checkInDate = new Date(booking.checkInDate);
    const checkOutDate = new Date(booking.checkOutDate);
    setFormData(prev => ({
      ...prev,
      bookingId: booking.id,
      actualCheckInDate: checkInDate,
      actualCheckOutDate: checkOutDate,
      totalAmount: booking.totalPrice,
      dueDate: checkInDate
    }));

    try {
      const mainGuest = await loadGuestData(booking.guestId);
      if (mainGuest) {
        setSelectedGuests([mainGuest]);
        setMainGuestId(mainGuest.id); 
      }
    } catch (error) {
      console.error('Ошибка загрузки основного гостя:', error);
    }
  
    setShowBookingModal(false);
  };

  const handleGuestSelect = (guests: GuestDTO[]) => {
    // Сохраняем основного гостя при добавлении новых
    if (mainGuestId && selectedGuests.length > 0) {
      const mainGuest = selectedGuests.find(g => g.id === mainGuestId);
      if (mainGuest) {
        // Убираем основного гостя из новых гостей, если он там есть
        const newGuests = guests.filter(g => g.id !== mainGuestId);
        // Объединяем: основной гость + новые гости
        setSelectedGuests([mainGuest, ...newGuests]);
      } else {
        setSelectedGuests(guests);
      }
    } else {
      setSelectedGuests(guests);
      // Если это первый выбор гостей, устанавливаем первого как основного
      if (guests.length > 0) {
        setMainGuestId(guests[0].id);
      }
    }
    setShowGuestModal(false);
  };

  const handleEmployeeSelect = (employee: EmployeeDTO) => {
    setSelectedEmployee(employee);
    setFormData(prev => ({
      ...prev,
      employeeId: employee.id
    }));

    setShowEmployeeModal(false);
  };

  const handleRemoveGuest = (guestId: number) => {
    setSelectedGuests(prev => prev.filter(guest => guest.id !== guestId));
  };

  const handleMakeMainGuest = (guestId: number) => {
    setMainGuestId(guestId);
    setSelectedGuests(prev => {
      const updatedGuests = [...prev];
      const targetIndex = updatedGuests.findIndex(guest => guest.id === guestId);
      if (targetIndex > 0) {
        // Перемещаем выбранного гостя на первое место (основной гость)
        const [targetGuest] = updatedGuests.splice(targetIndex, 1);
        updatedGuests.unshift(targetGuest);
      }
      return updatedGuests;
    });
  };

  const [guestDates, setGuestDates] = useState<Record<number, { checkInDate: Date | null; checkOutDate: Date | null }>>({});
  
  const handleEditGuestDates = (guestId: number) => {
    const guest = selectedGuests.find(g => g.id === guestId);
    if (guest) {
      setEditingGuestId(guestId);
      
      const currentGuestDates = guestDates[guestId] || {
        checkInDate: formData.actualCheckInDate,
        checkOutDate: formData.actualCheckOutDate
      };
      setEditingGuestDates(currentGuestDates);
      setShowStayGuestEditModal(true);
    }
  };

  const handleSaveGuestDates = () => {
    if (editingGuestId) {
      setGuestDates(prev => ({
        ...prev,
        [editingGuestId]: {
          checkInDate: editingGuestDates.checkInDate,
          checkOutDate: editingGuestDates.checkOutDate
        }
      }));
    }
    setShowStayGuestEditModal(false);
    setEditingGuestId(null);
    setEditingGuestDates({ checkInDate: null, checkOutDate: null });
  };

  // Функция для вычисления суммы налога из процента
  const calculateTaxAmount = (totalAmount: number, taxPercent: number): number => {
    return Math.round(totalAmount * taxPercent / 100);
  };

  const handleDateChange = (field: 'actualCheckInDate' | 'actualCheckOutDate', date: Date | null) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: date };
      
      // Если изменилась дата заезда, обновляем срок оплаты
      if (field === 'actualCheckInDate' && date) {
        newFormData.dueDate = date;
      }
      
      // Пересчитываем сумму если есть обе даты и выбрано бронирование
      if (newFormData.actualCheckInDate && newFormData.actualCheckOutDate && selectedBooking) {
        const days = calculateDays(newFormData.actualCheckInDate, newFormData.actualCheckOutDate);
        const dailyRate = selectedBooking.totalPrice / calculateDays(
          new Date(selectedBooking.checkInDate),
          new Date(selectedBooking.checkOutDate)
        );
        newFormData.totalAmount = Math.round(dailyRate * days);
      }
      
      return newFormData;
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.bookingId) {
      errors.bookingId = 'Выберите бронирование';
    }

    if (!formData.actualCheckInDate) {
      errors.actualCheckInDate = 'Укажите дату заезда';
    }

    if (formData.totalAmount <= 0) {
      errors.totalAmount = 'Общая сумма должна быть больше 0';
    }

    if (selectedGuests.length === 0) {
      errors.guests = 'Выберите хотя бы одного гостя';
    }

    if (!formData.dueDate) {
      errors.dueDate = 'Укажите срок оплаты';
    }

    if (!formData.employeeId) {
      errors.responsibleEmployeeId = 'Выберите ответственного сотрудника';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setInternalLoading(true);
    setInternalError('');
  
    try {
      const taxAmount = calculateTaxAmount(formData.totalAmount, formData.taxPercent);
      
      const stayData = {
        bookingId: formData.bookingId,
        actualCheckInDate: formData.actualCheckInDate!, 
        actualCheckOutDate: formData.actualCheckOutDate || undefined,
        notes: formData.notes || undefined,
        totalAmount: formData.totalAmount,
        paidAmount: formData.paidAmount,
        dueDate: formData.dueDate!,
        paymentStatusId: formData.paymentStatusId,
        paymentDate: formData.paymentDate || undefined,
        taxAmount: taxAmount,
        employeeId: formData.employeeId,
        stayGuests: selectedGuests.map((guest, index) => {
          const individualDates = guestDates[guest.id];
          const checkInDate = individualDates?.checkInDate || formData.actualCheckInDate;
          const checkOutDate = individualDates?.checkOutDate || formData.actualCheckOutDate;
          
          return {
            stayId: stay?.stayId || 0,
            guestId: guest.id,
            isMainGuest: guest.id === mainGuestId, 
            checkedIn: true,
            checkedOut: false,
            checkInDate: checkInDate || undefined, 
            checkOutDate: checkOutDate || undefined, 
            notes: ''
          };
        })
      };
  
      onSubmit(stayData);
    } catch (err) {
      setInternalError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setInternalLoading(false);
    }
  };

  const handleClose = () => {
    setValidationErrors({});
    setInternalError('');
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <HotelIcon />
            {isNewStay ? 'Новое проживание' : 'Редактирование проживания'}
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {(internalError || error) && ( 
              <Alert severity="error" sx={{ mb: 2 }}>
                {internalError || error} 
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Выбор бронирования */}
              <Grid size={{ xs: 12}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <HotelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Бронирование
                    </Typography>
                    
                    {selectedBooking ? (
                      <Box>
                        <Typography variant="body1">
                          <strong>Номер:</strong> {selectedBooking.roomNumber} ({selectedBooking.roomType})
                        </Typography>
                        <Typography variant="body1">
                          <strong>Гость:</strong> {selectedBooking.guestName}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Период:</strong> {new Date(selectedBooking.checkInDate).toLocaleDateString('ru-RU')} - {new Date(selectedBooking.checkOutDate).toLocaleDateString('ru-RU')}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Стоимость:</strong> {formatCurrency(selectedBooking.totalPrice)}
                        </Typography>
                        {!isNewStay && (
                          <Button 
                            variant="outlined" 
                            onClick={() => setShowBookingModal(true)}
                            sx={{ mt: 1 }}
                          >
                            Изменить бронирование
                          </Button>
                        )}
                      </Box>
                    ) : (
                      <Button 
                        variant="contained" 
                        onClick={() => setShowBookingModal(true)}
                        disabled={!isNewStay}
                      >
                        Выбрать бронирование
                      </Button>
                    )}
                    
                    {validationErrors.bookingId && (
                      <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                        {validationErrors.bookingId}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Даты */}
              <Grid size={{ xs: 12, md: 6}}>
                <DatePicker
                  label="Дата заезда *"
                  value={formData.actualCheckInDate}
                  onChange={(date) => handleDateChange('actualCheckInDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!validationErrors.actualCheckInDate,
                      helperText: validationErrors.actualCheckInDate
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Дата выезда"
                  value={formData.actualCheckOutDate}
                  onChange={(date) => handleDateChange('actualCheckOutDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!validationErrors.actualCheckOutDate,
                      helperText: validationErrors.actualCheckOutDate
                    }
                  }}
                />
              </Grid>

              {/* Финансовая информация */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Общая сумма *"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                  error={!!validationErrors.totalAmount}
                  helperText={validationErrors.totalAmount}
                  InputProps={{
                    endAdornment: '₽'
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Оплачено"
                  type="number"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    endAdornment: '₽'
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6}}>
                <TextField
                  fullWidth
                  label="Налог (%)"
                  type="number"
                  value={formData.taxPercent}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxPercent: parseFloat(e.target.value) || 0 }))}
                  InputProps={{
                    endAdornment: '%'
                  }}
                  helperText={`Сумма налога: ${calculateTaxAmount(formData.totalAmount, formData.taxPercent)} ₽`}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Срок оплаты *"
                  value={formData.dueDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!validationErrors.dueDate,
                      helperText: validationErrors.dueDate
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Дата оплаты"
                  value={formData.paymentDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, paymentDate: date }))}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6}}>
                <FormControl fullWidth>
                <InputLabel>Статус оплаты *</InputLabel>
                <Select
                  value={formData.paymentStatusId}
                  label="Статус оплаты *"
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentStatusId: Number(e.target.value) }))}
                  error={!!validationErrors.paymentStatusId}
                >
                  {paymentStatuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Grid>

              {/* Выбор ответственного сотрудника */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    fullWidth
                    variant={selectedEmployee ? "outlined" : "contained"}

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
                      'Выберите сотрудника'
                    )}
                  </Button>
                </Box>
              </Grid>

              {/* Гости */}
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Гости ({selectedGuests.length})
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setShowGuestModal(true)}
                      >
                        Выбрать гостей
                      </Button>
                    </Box>

                    {selectedGuests.length > 0 ? (
                      <List>
                        {selectedGuests.map((guest, index) => {
                          const isMainGuest = guest.id === mainGuestId;
                          const individualDates = guestDates[guest.id];
                          const hasIndividualDates = individualDates && 
                            (individualDates.checkInDate?.getTime() !== formData.actualCheckInDate?.getTime() ||
                            individualDates.checkOutDate?.getTime() !== formData.actualCheckOutDate?.getTime());
                          return (
                            <ListItem key={guest.id} divider>
                              <ListItemIcon>
                                <PersonIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <span>{guest.lastName} {guest.firstName} {guest.middleName}</span>
                                    {isMainGuest && (
                                      <Chip 
                                        label="Основной" 
                                        size="small" 
                                        color="primary" 
                                      />
                                    )}
                                    {hasIndividualDates && (
                                      <Chip 
                                        label="Индивидуальные даты" 
                                        size="small" 
                                        color="secondary" 
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  hasIndividualDates ? (
                                    <Typography variant="caption" color="text.secondary">
                                      Заезд: {individualDates.checkInDate?.toLocaleDateString('ru-RU')} - 
                                      Выезд: {individualDates.checkOutDate?.toLocaleDateString('ru-RU')}
                                    </Typography>
                                  ) : null
                                }
                              />
                              <Box display="flex" gap={1}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditGuestDates(guest.id)}
                                  title="Редактировать даты"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                {!isMainGuest && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMakeMainGuest(guest.id)}
                                    title="Сделать основным"
                                  >
                                    <SwapVertIcon fontSize="small" />
                                  </IconButton>
                                )}
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveGuest(guest.id)}
                                  color="error"
                                  title="Удалить гостя"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </ListItem>
                          );
                        })}
                      </List>
                    ) : (
                      <Typography color="textSecondary" align="center" py={2}>
                        Гости не выбраны
                      </Typography>
                    )}
                    
                    {validationErrors.guests && (
                      <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                        {validationErrors.guests}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Примечания */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Примечания"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} disabled={internalLoading}>
              Отмена
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={internalLoading || loading} 
            >
              {(internalLoading || loading) ? 'Сохранение...' : (isNewStay ? 'Создать' : 'Сохранить')} 
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Модальные окна */}
      <BookingSelectionModal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSelect={handleBookingSelect}
        selectedBookingId={selectedBooking?.id}
      />
      
      <MultiGuestSelectionModal
        open={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSelect={handleGuestSelect}
        selectedGuestIds={selectedGuests.map(g => g.id)}
      />
      
      <EmployeeSelectionModal
        open={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSelect={handleEmployeeSelect}
      />
      
      {/* Модальное окно для редактирования дат гостя */}
      <Dialog
        open={showStayGuestEditModal}
        onClose={() => setShowStayGuestEditModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon />
            Редактирование дат гостя
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {editingGuestId && (
              <Typography variant="body1" sx={{ mb: 3 }}>
                Гость: {selectedGuests.find(g => g.id === editingGuestId)?.lastName} {selectedGuests.find(g => g.id === editingGuestId)?.firstName}
              </Typography>
            )}
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Дата заезда"
                  value={editingGuestDates.checkInDate}
                  onChange={(date) => setEditingGuestDates(prev => ({ ...prev, checkInDate: date }))}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Дата выезда"
                  value={editingGuestDates.checkOutDate}
                  onChange={(date) => setEditingGuestDates(prev => ({ ...prev, checkOutDate: date }))}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowStayGuestEditModal(false)}>
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveGuestDates}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default StayForm;
