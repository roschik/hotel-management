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
import { ServiceDTO } from '../../types/api';
import ImageUpload from '../common/ImageUpload';

interface ServiceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ServiceDTO>) => void;
  service?: ServiceDTO | null;
  loading?: boolean;
  error?: string | null;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  open,
  onClose,
  onSubmit,
  service,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<Partial<ServiceDTO>>(() => ({
    name: '',
    description: '',
    price: 0,
    durationMinutes: 60,
    isActive: true,
    imageUrl: '',
  }));

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (service) {
      setFormData({ ...service });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: 0,
        durationMinutes: 60,
        isActive: true,
        imageUrl: '',
      });
    }
    setValidationErrors({});
  }, [service, open]);

  const handleChange = (field: keyof ServiceDTO) => (event: any) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = 'Название услуги обязательно';
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = 'Цена должна быть больше 0';
    }

    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      errors.durationMinutes = 'Длительность должна быть больше 0';
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

  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {service ? 'Редактировать услугу' : 'Добавить услугу'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Левая колонка - основная информация */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Название услуги"
                    value={formData.name || ''}
                    onChange={handleChange('name')}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                    required
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Цена"
                    type="number"
                    value={formData.price || ''}
                    onChange={handleChange('price')}
                    error={!!validationErrors.price}
                    helperText={validationErrors.price}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Длительность (минуты)"
                    type="number"
                    value={formData.durationMinutes || ''}
                    onChange={handleChange('durationMinutes')}
                    error={!!validationErrors.durationMinutes}
                    helperText={validationErrors.durationMinutes}
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Описание"
                    multiline
                    rows={3}
                    value={formData.description || ''}
                    onChange={handleChange('description')}
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isActive || false}
                        onChange={handleChange('isActive')}
                      />
                    }
                    label="Активная услуга"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Правая колонка - изображение */}
            <Grid size={{ xs: 12, md: 4 }}>
              <ImageUpload
                value={formData.imageUrl}
                onChange={handleImageChange}
                label="Изображение услуги"
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
            {loading ? 'Сохранение...' : (service ? 'Обновить' : 'Создать')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ServiceForm;