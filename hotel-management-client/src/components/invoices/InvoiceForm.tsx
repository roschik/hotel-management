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
  Autocomplete,
} from '@mui/material';
import { InvoiceDTO, BookingDTO, GuestDTO } from '../../types/api';
import { apiService } from '../../services/apiService';

interface InvoiceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<InvoiceDTO>) => void;
  invoice?: InvoiceDTO | null;
  loading?: boolean;
  error?: string | null;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  open,
  onClose,
  onSubmit,
  invoice,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<Partial<InvoiceDTO>>(() => ({
    id: 0,
    bookingId: 0,
    guestId: 0,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    totalAmount: 0,
    paidAmount: 0,
    roomCharges: 0,
    serviceCharges: 0,
    taxAmount: 0,
    status: 'draft',
    notes: '',
  }));

  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [guests, setGuests] = useState<GuestDTO[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadBookings();
      loadGuests();
    }
  }, [open]);

  useEffect(() => {
    if (invoice) {
      setFormData({ ...invoice });
    } else {
      setFormData({
        stayId: 0,
        bookingId: 0,
        guestId: 0,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalAmount: 0,
        paidAmount: 0,
        roomCharges: 0,
        serviceCharges: 0,
        taxAmount: 0,
        paymentStatus: '',
        notes: '',
      });
    }
    setValidationErrors({});
  }, [invoice, open]);

  const loadBookings = async () => {
    try {
      const response = await apiService.getBookings();
      setBookings(response);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadGuests = async () => {
    try {
      const response = await apiService.getGuests();
      setGuests(response);
    } catch (error) {
      console.error('Error loading guests:', error);
    }
  };

  const handleChange = (field: keyof InvoiceDTO) => (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.bookingId) {
      errors.bookingId = 'Выберите бронирование';
    }

    if (!formData.guestId) {
      errors.guestId = 'Выберите гостя';
    }

    if (!formData.dueDate) {
      errors.dueDate = 'Дата оплаты обязательна';
    }

    if (!formData.totalAmount || formData.totalAmount <= 0) {
      errors.totalAmount = 'Общая сумма должна быть больше 0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setValidationErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {invoice ? 'Редактировать счет' : 'Создать счет'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!validationErrors.bookingId}>
                <InputLabel>Бронирование *</InputLabel>
                <Select
                  value={formData.bookingId || ''}
                  onChange={handleChange('bookingId')}
                  label="Бронирование *"
                >
                  {bookings.map((booking) => (
                    <MenuItem key={booking.id} value={booking.id}>
                      Бронирование #{booking.id} - Комната {booking.roomId}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.bookingId && (
                  <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                    {validationErrors.bookingId}
                  </Box>
                )}
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!validationErrors.guestId}>
                <InputLabel>Гость *</InputLabel>
                <Select
                  value={formData.guestId || ''}
                  onChange={handleChange('guestId')}
                  label="Гость *"
                >
                  {guests.map((guest) => (
                    <MenuItem key={guest.id} value={guest.id}>
                      {guest.firstName} {guest.lastName}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.guestId && (
                  <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                    {validationErrors.guestId}
                  </Box>
                )}
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Дата выставления"
                type="date"
                value={formData.issueDate ? new Date(formData.issueDate).toISOString().split('T')[0] : ''}
                onChange={handleChange('issueDate')}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Дата оплаты"
                type="date"
                value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                onChange={handleChange('dueDate')}
                error={!!validationErrors.dueDate}
                helperText={validationErrors.dueDate}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Стоимость проживания"
                type="number"
                value={formData.roomCharges || ''}
                onChange={handleChange('roomCharges')}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Стоимость услуг"
                type="number"
                value={formData.serviceCharges || ''}
                onChange={handleChange('serviceCharges')}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Налоги"
                type="number"
                value={formData.taxAmount || ''}
                onChange={handleChange('taxAmount')}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Общая сумма"
                type="number"
                value={formData.totalAmount || ''}
                onChange={handleChange('totalAmount')}
                error={!!validationErrors.totalAmount}
                helperText={validationErrors.totalAmount}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Оплачено"
                type="number"
                value={formData.paidAmount || ''}
                onChange={handleChange('paidAmount')}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={formData.paymentStatus || 'Pending'}
                  onChange={handleChange('paymentStatus')}
                  label="Статус"
                >
                  <MenuItem value="Pending">Ожидает оплаты</MenuItem>
                  <MenuItem value="Paid">Оплачен</MenuItem>
                  <MenuItem value="Partially Paid">Частично оплачен</MenuItem>
                  <MenuItem value="Overdue">Просрочен</MenuItem>
                  <MenuItem value="Cancelled">Отменен</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="ID транзакции"
                value={formData.transactionId || ''}
                onChange={handleChange('transactionId')}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Заметки"
                multiline
                rows={3}
                value={formData.notes || ''}
                onChange={handleChange('notes')}
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
            {loading ? 'Сохранение...' : (invoice ? 'Обновить' : 'Создать')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InvoiceForm;