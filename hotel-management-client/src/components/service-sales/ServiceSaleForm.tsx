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
} from '@mui/material';
import {
  Hotel as StaysIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  RoomService as ServicesIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { ServiceSaleDTO, CreateServiceSaleDTO, ServiceDTO, EmployeeDTO, GuestDTO, StayDTO, PaymentStatusDTO } from '../../types/api';
import { apiService } from '../../services/apiService';
import EmployeeSelectionModal from '../modals/EmployeeSelectionModal';
import GuestSelectionModal from '../modals/GuestSelectionModal';
import StaySelectionModal from '../modals/StaySelectionModal';
import ServiceSelectionModal from '../modals/ServiceSelectionModal';

interface ServiceSaleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServiceSaleDTO) => void;
  serviceSale?: ServiceSaleDTO | null;
  loading?: boolean;
  error?: string | null;
  services: ServiceDTO[];
  paymentStatuses: PaymentStatusDTO[];
}

const ServiceSaleForm: React.FC<ServiceSaleFormProps> = ({
  open,
  onClose,
  onSubmit,
  serviceSale,
  loading = false,
  error = null,
  services,
  paymentStatuses
}) => {
  const [formData, setFormData] = useState<CreateServiceSaleDTO>({
    serviceId: 0,
    employeeId: 0,
    guestId: undefined,
    stayId: 0,
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    taxPercent: 20,
    paymentStatusId: 1,
    saleDate: new Date(),
    notes: ''
  });

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDTO | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<GuestDTO | null>(null);
  const [selectedStay, setSelectedStay] = useState<StayDTO | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceDTO | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Модальные окна
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [stayModalOpen, setStayModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  // Определяем, является ли это новой продажей услуги
  const isNewServiceSale = !serviceSale;

  const toUTCDate = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const toUTCDateTime = (date: Date | string): Date => {
    const d = new Date(date);
    return new Date(d.toISOString());
  };

  // Функция для расчета налога и общей суммы (налог включен в стоимость)
  const calculateTotals = (unitPrice: number, quantity: number, taxPercent: number) => {
    const totalPrice = unitPrice * quantity;
    const taxAmount = (totalPrice * taxPercent) / (100 + taxPercent);
    return { totalPrice, taxAmount };
  };

  // Обработчики изменений
  const handleUnitPriceChange = (value: number) => {
    const { totalPrice } = calculateTotals(value, formData.quantity || 1, formData.taxPercent || 20);
    setFormData({
      ...formData,
      unitPrice: value,
      totalPrice
    });
  };

  const handleQuantityChange = (value: number) => {
    const { totalPrice } = calculateTotals(formData.unitPrice || 0, value, formData.taxPercent || 20);
    setFormData({
      ...formData,
      quantity: value,
      totalPrice
    });
  };

  const handleTaxPercentChange = (value: number) => {
    const { totalPrice } = calculateTotals(formData.unitPrice || 0, formData.quantity || 1, value);
    setFormData({
      ...formData,
      taxPercent: value,
      totalPrice
    });
  };

  const handleChange = (field: keyof CreateServiceSaleDTO) => (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEmployeeSelect = (employee: EmployeeDTO) => {
    setSelectedEmployee(employee);
    setFormData(prev => ({ ...prev, employeeId: employee.id }));
    setEmployeeModalOpen(false);
    if (validationErrors.employeeId) {
      setValidationErrors(prev => ({ ...prev, employeeId: '' }));
    }
  };

  const handleGuestSelect = (guest: GuestDTO) => {
    setSelectedGuest(guest);
    setFormData(prev => ({ ...prev, guestId: guest.id }));
    setGuestModalOpen(false);
  };

  const handleStaySelect = (stay: StayDTO) => {
    setSelectedStay(stay);
    setFormData(prev => ({ ...prev, stayId: stay.stayId }));
    setStayModalOpen(false);
    if (validationErrors.stayId) {
      setValidationErrors(prev => ({ ...prev, stayId: '' }));
    }
  };

  const handleServiceSelect = (service: ServiceDTO) => {
    setSelectedService(service);
    const { totalPrice } = calculateTotals(service.price, formData.quantity || 1, formData.taxPercent || 20);
    setFormData(prev => ({
      ...prev,
      serviceId: service.id,
      unitPrice: service.price,
      totalPrice
    }));
    setServiceModalOpen(false);
    if (validationErrors.serviceId) {
      setValidationErrors(prev => ({ ...prev, serviceId: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.serviceId) {
      errors.serviceId = 'Выберите услугу';
    }

    if (!formData.employeeId) {
      errors.employeeId = 'Выберите сотрудника';
    }

    if (!formData.stayId) {
      errors.stayId = 'Выберите проживание';
    }

    if (!formData.saleDate) {
      errors.saleDate = 'Дата продажи обязательна';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = 'Количество должно быть больше 0';
    }

    if (!formData.unitPrice || formData.unitPrice <= 0) {
      errors.unitPrice = 'Цена за единицу должна быть больше 0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        saleDate: formData.saleDate ? toUTCDateTime(formData.saleDate) : toUTCDateTime(new Date()),
      };
      onSubmit(dataToSubmit);
    }
  };

  const resetForm = () => {
    setFormData({
      serviceId: 0,
      employeeId: 0,
      guestId: undefined,
      stayId: 0,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      taxPercent: 20,
      paymentStatusId: 1,
      saleDate: new Date(),
      notes: ''
    });
    setSelectedEmployee(null);
    setSelectedGuest(null);
    setSelectedStay(null);
    setSelectedService(null);
  };

  const loadSelectedData = async (serviceSaleData: ServiceSaleDTO) => {
    try {
      // Загружаем данные услуги
      if (serviceSaleData.serviceId) {
        const service = services.find((s: ServiceDTO) => s.id === serviceSaleData.serviceId);
        if (service) setSelectedService(service);
      }
      
      // Загружаем данные сотрудника
      if (serviceSaleData.employeeId) {
        const employees = await apiService.getStaff();
        const employee = employees.find((e: EmployeeDTO) => e.id === serviceSaleData.employeeId);
        if (employee) setSelectedEmployee(employee);
      }
      
      // Загружаем данные гостя
      if (serviceSaleData.guestId) {
        const guests = await apiService.getGuests();
        const guest = guests.find((g: GuestDTO) => g.id === serviceSaleData.guestId);
        if (guest) setSelectedGuest(guest);
      }
      
      // Загружаем данные проживания
      if (serviceSaleData.stayId) {
        const stays = await apiService.getStays();
        const stay = stays.find((s: StayDTO) => s.stayId === serviceSaleData.stayId);
        if (stay) setSelectedStay(stay);
      }
    } catch (error) {
      console.error('Ошибка загрузки выбранных данных:', error);
    }
  };

  const handleClose = () => {
    setValidationErrors({});
    onClose();
  };

  useEffect(() => {
    if (open) {
      // Если редактируем существующую продажу услуги
      if (serviceSale) {
        setFormData({
          serviceId: serviceSale.serviceId,
          employeeId: serviceSale.employeeId,
          guestId: serviceSale.guestId,
          stayId: serviceSale.stayId || 0,
          quantity: serviceSale.quantity,
          unitPrice: serviceSale.unitPrice,
          totalPrice: serviceSale.totalPrice,
          taxPercent: serviceSale.taxPercent || 20,
          paymentStatusId: serviceSale.paymentStatusId,
          saleDate: new Date(serviceSale.saleDate),
          notes: serviceSale.notes || ''
        });
        
        loadSelectedData(serviceSale);
      } else {
        // Новая продажа услуги
        setFormData({
          serviceId: 0,
          employeeId: 0,
          guestId: undefined,
          stayId: 0,
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          taxPercent: 20,
          paymentStatusId: 1,
          saleDate: new Date(),
          notes: ''
        });
        setSelectedEmployee(null);
        setSelectedGuest(null);
        setSelectedStay(null);
        setSelectedService(null);
      }
    }
  }, [open, serviceSale, services]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {serviceSale ? 'Редактировать продажу услуги' : 'Добавить продажу услуги'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Выбор услуги */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Button
                      fullWidth
                      variant={selectedService ? "outlined" : "contained"}
                      onClick={() => setServiceModalOpen(true)}
                      startIcon={<ServicesIcon />}
                      sx={{ 
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        height: 56,
                        border: validationErrors.serviceId ? '1px solid red' : undefined
                      }}
                    >
                      {selectedService ? (
                        <Box>
                          <Typography variant="body2">
                            {selectedService.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(selectedService.price)}
                          </Typography>
                        </Box>
                      ) : (
                        'Выберите услугу'
                      )}
                    </Button>
                    {validationErrors.serviceId && (
                      <Typography variant="caption" color="error">
                        {validationErrors.serviceId}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                {/* Выбор сотрудника */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Button
                      fullWidth
                      variant={selectedEmployee ? "outlined" : "contained"}
                      onClick={() => setEmployeeModalOpen(true)}
                      startIcon={<WorkIcon />}
                      sx={{ 
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        height: 56,
                        border: validationErrors.employeeId ? '1px solid red' : undefined
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
                    {validationErrors.employeeId && (
                      <Typography variant="caption" color="error">
                        {validationErrors.employeeId}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                {/* Выбор гостя */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setGuestModalOpen(true)}
                      startIcon={<PersonIcon />}
                      sx={{ 
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        height: 56
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
                        'Выберите гостя (опционально)'
                      )}
                    </Button>
                    {selectedGuest && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedGuest(null);
                          setFormData(prev => ({ ...prev, guestId: undefined }));
                        }}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        ✕
                      </Button>
                    )}
                  </Box>
                </Grid>
                
                {/* Выбор проживания */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                      fullWidth
                      variant={selectedStay ? "outlined" : "contained"}
                      onClick={() => setStayModalOpen(true)}
                      startIcon={<StaysIcon />}
                      sx={{ 
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        height: 56,
                        border: validationErrors.stayId ? '1px solid red' : undefined
                      }}
                    >
                      {selectedStay ? (
                        <Box>
                          <Typography variant="body2">
                            Комната {selectedStay.roomNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(selectedStay.checkInDate).toLocaleDateString('ru-RU')} - {new Date(selectedStay.checkOutDate).toLocaleDateString('ru-RU')}
                          </Typography>
                        </Box>
                      ) : (
                        'Выберите проживание'
                      )}
                    </Button>
                  </Box>
                  {validationErrors.stayId && (
                    <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                      {validationErrors.stayId}
                    </Typography>
                  )}
                </Grid>
                
                {/* Дата продажи */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label="Дата продажи"
                    value={formData.saleDate}
                    onChange={(date) => setFormData(prev => ({ ...prev, saleDate: date || new Date() }))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!validationErrors.saleDate,
                        helperText: validationErrors.saleDate
                      }
                    }}
                  />
                </Grid>
                
                {/* Количество */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Количество"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    error={!!validationErrors.quantity}
                    helperText={validationErrors.quantity}
                    inputProps={{ min: 1 }}
                    required
                  />
                </Grid>
                
                {/* Цена за единицу */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Цена за единицу"
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => handleUnitPriceChange(Number(e.target.value))}
                    error={!!validationErrors.unitPrice}
                    helperText={validationErrors.unitPrice}
                    inputProps={{ min: 0, step: 0.01 }}
                    required
                  />
                </Grid>
                
                {/* Налог */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Налог (%)"
                    type="number"
                    value={formData.taxPercent}
                    onChange={(e) => handleTaxPercentChange(Number(e.target.value))}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                  />
                </Grid>
                
                {/* Общая стоимость */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Общая стоимость"
                    type="number"
                    value={formData.totalPrice}
                    InputProps={{
                      readOnly: true,
                      endAdornment: <Typography variant="body2">₽</Typography>
                    }}
                    helperText="Рассчитывается автоматически"
                  />
                </Grid>
                
                {/* Статус оплаты */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Статус оплаты</InputLabel>
                    <Select
                      value={formData.paymentStatusId}
                      onChange={handleChange('paymentStatusId')}
                      label="Статус оплаты"
                    >
                      {paymentStatuses
                        .filter(status => 
                          status.name !== 'Частично оплачено' && status.name !== 'Просрочено'
                        )
                        .map((status) => (
                        <MenuItem key={status.id} value={status.id}>
                          {status.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Примечания */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Примечания"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange('notes')}
                    placeholder="Дополнительная информация о продаже услуги..."
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
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
              {loading ? 'Сохранение...' : (serviceSale ? 'Обновить' : 'Создать')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Модальные окна */}
      <ServiceSelectionModal
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        onSelect={handleServiceSelect}
        selectedServiceId={formData.serviceId}
      />

        <EmployeeSelectionModal
        open={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        onSelect={handleEmployeeSelect}
        selectedEmployeeId={formData.employeeId}
      />

      <GuestSelectionModal
        open={guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        onSelect={handleGuestSelect}
      />

      <StaySelectionModal
        open={stayModalOpen}
        onClose={() => setStayModalOpen(false)}
        onSelect={handleStaySelect}
      />
    </>
  );
};

export default ServiceSaleForm;
