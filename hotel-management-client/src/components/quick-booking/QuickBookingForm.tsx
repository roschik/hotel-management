import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Person as PersonIcon, Work as WorkIcon } from '@mui/icons-material';
import { QuickBookingDTO, AvailableRoomResultDTO, AvailableRoomSearchDTO, GuestDTO, BookingTypeDTO, EmployeeDTO } from '../../types/api';
import { apiService } from '../../services/apiService';
import PhoneInput from '../common/PhoneInput';
import GuestSelectionModal from '../modals/GuestSelectionModal';
import BookingSuccessModal from '../modals/BookingSuccessModal';
import EmployeeSelectionModal from '../modals/EmployeeSelectionModal';


interface QuickBookingFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedRoom: AvailableRoomResultDTO | null;
  searchParams: AvailableRoomSearchDTO | null;
}

const QuickBookingForm: React.FC<QuickBookingFormProps> = ({
  open,
  onClose,
  onSuccess,
  selectedRoom,
  searchParams,
}) => {
  const [formData, setFormData] = useState<QuickBookingDTO>({
    roomId: 0,
    checkInDate: new Date(),
    checkOutDate: new Date(),
    guestFirstName: '',
    guestMiddleName: '',
    guestLastName: '',
    guestEmail: '',
    guestPhone: '',
    bookingTypeId: 2,
    employeeId: undefined,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestType, setGuestType] = useState<'new' | 'existing'>('new');
  const [selectedGuest, setSelectedGuest] = useState<GuestDTO | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingTypes, setBookingTypes] = useState<BookingTypeDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDTO | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fetchBookingTypes = async () => {
    try {
      const types = await apiService.getBookingTypes();
      setBookingTypes(types);
    } catch (error) {
      console.error('Ошибка получения типов бронирования:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const employees = await apiService.getStaff();
      setEmployees(employees);
    } catch (error) {
      console.error('Ошибка получения сотрудников:', error);
    }
  };

  React.useEffect(() => {
    fetchBookingTypes();
    fetchEmployees();
  }, []);

  React.useEffect(() => {
    if (selectedRoom && searchParams) {
      setFormData({
        roomId: selectedRoom.id,
        checkInDate: searchParams.checkInDate,
        checkOutDate: searchParams.checkOutDate,
        guestFirstName: '',
        guestMiddleName: '',
        guestLastName: '',
        guestEmail: '',
        guestPhone: '',
        notes: '',
        bookingTypeId: 2,
        employeeId: undefined,
      });
      setGuestType('new');
      setSelectedGuest(null);
    }
  }, [selectedRoom, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        roomId: formData.roomId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestFirstName: guestType === 'new' ? formData.guestFirstName : selectedGuest?.firstName || '',
        guestMiddleName: guestType === 'new' ? formData.guestMiddleName : selectedGuest?.middleName || '',
        guestLastName: guestType === 'new' ? formData.guestLastName : selectedGuest?.lastName || '',
        guestPhone: guestType === 'new' ? formData.guestPhone : selectedGuest?.phone || '',
        guestEmail: guestType === 'new' ? formData.guestEmail : selectedGuest?.email || '',
        bookingTypeId: formData.bookingTypeId,
        employeeId: formData.employeeId,
        notes: formData.notes
      };

      const result = await apiService.createQuickBooking(bookingData);
      setCreatedBooking(result);
      setShowSuccessModal(true);
      onClose(); 
    } catch (error) {
      console.error('Ошибка создания бронирования:', error);
      setError('Ошибка при создании бронирования');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setCreatedBooking(null);
    setFormData({
      roomId: selectedRoom?.id || 0,
      checkInDate: searchParams?.checkInDate || new Date(),
      checkOutDate: searchParams?.checkOutDate || new Date(),
      guestFirstName: '',
      guestMiddleName: '',
      guestLastName: '',
      guestEmail: '',
      guestPhone: '',
      notes: '',
      bookingTypeId: 2,
      employeeId: undefined,
    });
    setGuestType('new');
    setSelectedGuest(null);
    setError(null);
  };

  const handleChange = (field: keyof QuickBookingDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestSelect = (guest: GuestDTO) => {
    setSelectedGuest(guest);
    setShowGuestModal(false);
  };

  const handleGuestTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newType = event.target.value as 'new' | 'existing';
    setGuestType(newType);
    if (newType === 'new') {
      setSelectedGuest(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'employeeId' ? (value === '' ? undefined : parseInt(value)) : 
              name === 'bookingTypeId' ? parseInt(value) : value
    }));
  };

  const handleEmployeeSelect = (employee: EmployeeDTO) => {
    setSelectedEmployee(employee);
    setFormData(prev => ({ ...prev, employeeId: employee.id }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Быстрое бронирование
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {selectedRoom && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6">
                  Комната {selectedRoom.roomNumber}
                </Typography>
                <Typography color="textSecondary">
                  {selectedRoom.roomTypeName} • {selectedRoom.capacity} чел. • {selectedRoom.totalPrice}₽
                </Typography>
              </Box>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Grid container spacing={2}>
              {/* Выбор типа гостя */}
              <Grid size={{ xs: 12 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Тип гостя</FormLabel>
                  <RadioGroup
                    row
                    value={guestType}
                    onChange={handleGuestTypeChange}
                  >
                    <FormControlLabel
                      value="new"
                      control={<Radio />}
                      label="Новый гость"
                    />
                    <FormControlLabel
                      value="existing"
                      control={<Radio />}
                      label="Существующий гость"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Выбор существующего гостя */}
              {guestType === 'existing' && (
                <Grid size={{ xs: 12 }}>
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
              )}

              {/* Поля для нового гостя */}
              {guestType === 'new' && (
                <>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Фамилия гостя"
                      value={formData.guestLastName}
                      onChange={(e) => handleChange('guestLastName', e.target.value)}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Имя гостя"
                      value={formData.guestFirstName}
                      onChange={(e) => handleChange('guestFirstName', e.target.value)}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Отчество гостя"
                      value={formData.guestMiddleName}
                      onChange={(e) => handleChange('guestMiddleName', e.target.value)}
                      fullWidth
                    />
                  </Grid>                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Email"
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => handleChange('guestEmail', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <PhoneInput
                      label="Телефон"
                      value={formData.guestPhone}
                      onChange={(value) => handleChange('guestPhone', value)}
                      required
                      fullWidth
                    />
                  </Grid>
                </>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl required fullWidth error={!!validationErrors.bookingTypeId}>
                  <InputLabel>Тип бронирования</InputLabel>
                  <Select
                    value={formData.bookingTypeId || ''}
                    onChange={(e) => handleChange('bookingTypeId', e.target.value)}
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

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Примечания"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || (guestType === 'existing' && !selectedGuest)}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Создание...' : 'Создать бронирование'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Модальное окно выбора гостя */}
      <GuestSelectionModal
        open={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSelect={handleGuestSelect}
        selectedGuestId={selectedGuest?.id}
      />

      {/* Модальное окно успешного создания */}
      <BookingSuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        bookingId={createdBooking?.id || 0}
        onCreateAnother={handleCreateAnother}
      />

      <EmployeeSelectionModal
        open={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSelect={handleEmployeeSelect}
      />
    </>
  );
};

export default QuickBookingForm;