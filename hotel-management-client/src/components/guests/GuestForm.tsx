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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { GuestDTO, CitizenshipDTO, IdentificationTypeDTO } from '../../types/api';
import PhoneInput from '../common/PhoneInput';


interface GuestFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<GuestDTO>) => void;
  guest?: GuestDTO | null;
  loading?: boolean;
  error?: string | null;
  citizenships: CitizenshipDTO[],
  identificationTypes: IdentificationTypeDTO[]
}

const GuestForm: React.FC<GuestFormProps> = ({
  open,
  onClose,
  onSubmit,
  guest,
  loading = false,
  error = null,
  citizenships,
  identificationTypes
}) => {
  const [formData, setFormData] = useState<Partial<GuestDTO>>(() => ({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    dateOfBirth: null,
    identificationTypeId: identificationTypes.length > 0 ? identificationTypes[0].id : 1,
    identificationNumber: '',
    identificationIssuedBy: '',
    identificationIssuedDate: null,
    notes: '',
    citizenshipId: citizenships.length > 0 ? citizenships[0].id : 1,
  }));

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (guest) {
      setFormData({ ...guest });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        dateOfBirth: null,
        identificationTypeId: identificationTypes.length > 0 ? identificationTypes[0].id : 1,
        identificationNumber: '',
        identificationIssuedBy: '',
        identificationIssuedDate: null,
        notes: '',
        citizenshipId: citizenships.length > 0 ? citizenships[0].id : 1,
      });
    }
    setValidationErrors({});
  }, [guest, open, citizenships, identificationTypes]);


  const handleChange = (field: keyof GuestDTO) => (event: any) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      errors.firstName = 'Имя обязательно';
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = 'Фамилия обязательна';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Некорректный email';
    }

    if (!formData.phone?.trim()) {
      errors.phone = 'Телефон обязателен';
    }

    if (!formData.citizenshipId) {
      errors.citizenshipId = 'Гражданство обязательно';
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
          {guest ? 'Редактировать гостя' : 'Добавить гостя'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Основная информация */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Фамилия"
                value={formData.lastName || ''}
                onChange={handleChange('lastName')}
                error={!!validationErrors.lastName}
                helperText={validationErrors.lastName}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Имя"
                value={formData.firstName || ''}
                onChange={handleChange('firstName')}
                error={!!validationErrors.firstName}
                helperText={validationErrors.firstName}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Отчество"
                value={formData.middleName || ''}
                onChange={handleChange('middleName')}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange('email')}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>              
              <PhoneInput
                fullWidth
                label="Телефон"
                value={formData.phone || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                error={!!validationErrors.phone}
                helperText={validationErrors.phone}
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Дата рождения"
                type="date"
                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                onChange={handleChange('dateOfBirth')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required error={!!validationErrors.citizenshipId}>
                <InputLabel>Гражданство</InputLabel>
                <Select
                  value={formData.citizenshipId || ''}
                  onChange={handleChange('citizenshipId')}
                  label="Гражданство"
                >
                  {citizenships.map((citizenship) => (
                    <MenuItem key={citizenship.id} value={citizenship.id}>
                      {citizenship.name}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.citizenshipId && (
                  <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                    {validationErrors.citizenshipId}
                  </Box>
                )}
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Тип документа</InputLabel>
                <Select
                  value={formData.identificationTypeId || 1}
                  onChange={handleChange('identificationTypeId')}
                  label="Тип документа"
                >
                  {identificationTypes.map((identificationType) => (
                    <MenuItem key={identificationType.id} value={identificationType.id}>
                      {identificationType.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Номер документа"
                value={formData.identificationNumber || ''}
                onChange={handleChange('identificationNumber')}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Кем выдан"
                value={formData.identificationIssuedBy || ''}
                onChange={handleChange('identificationIssuedBy')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Дата выдачи документа"
                type="date"
                value={formData.identificationIssuedDate ? new Date(formData.identificationIssuedDate).toISOString().split('T')[0] : ''}
                onChange={handleChange('identificationIssuedDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Адрес"
                value={formData.address || ''}
                onChange={handleChange('address')}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Почтовый индекс"
                value={formData.postalCode || ''}
                onChange={handleChange('postalCode')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Дата регистрации"
                type="date"
                value={formData.registrationDate ? new Date(formData.registrationDate).toISOString().split('T')[0] : ''}
                onChange={handleChange('registrationDate')}
                InputLabelProps={{ shrink: true }}
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
            {loading ? 'Сохранение...' : (guest ? 'Обновить' : 'Создать')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GuestForm;