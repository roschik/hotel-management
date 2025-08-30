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
  Switch,
} from '@mui/material';
import { RoomDTO, RoomTypeDTO } from '../../types/api';
import ImageUpload from '../common/ImageUpload';
import { apiService } from '../../services/apiService';

interface RoomFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<RoomDTO>) => void;
  room?: RoomDTO | null;
  loading?: boolean;
  error?: string | null;
}

const RoomForm: React.FC<RoomFormProps> = ({
  open,
  onClose,
  onSubmit,
  room,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<Partial<RoomDTO>>(() => ({
    id: 0,
    roomNumber: '',
    roomTypeId: 0, 
    floor: 1,
    isAvailable: true, 
    pricePerNight: 0,
    capacity: 1,
    hasWifi: false,
    hasTV: false,
    hasMinibar: false,
    hasAirConditioning: false,
    hasBalcony: false,
    imageUrl: '', 
  }));

  const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Загрузка типов комнат
  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        setRoomTypesLoading(true);
        const types = await apiService.getRoomTypes();
        setRoomTypes(types);
      } catch (error) {
        console.error('Ошибка загрузки типов комнат:', error);
      } finally {
        setRoomTypesLoading(false);
      }
    };

    if (open) {
      loadRoomTypes();
    }
  }, [open]);

  useEffect(() => {
    if (room) {
      setFormData({
        ...room,
        pricePerNight: room.pricePerNight || 0,
        imageUrl: room.imageUrl || '', 
      });
    } else {
      setFormData({
        id: 0,
        roomNumber: '',
        roomTypeId: 0, 
        floor: 1, 
        isAvailable: true, 
        pricePerNight: 0,
        capacity: 1,
        hasWifi: false,
        hasTV: false,
        hasMinibar: false,
        hasAirConditioning: false,
        hasBalcony: false,
        imageUrl: '', 
      });
    }
    setValidationErrors({});
  }, [room, open]);

  const handleChange = (field: keyof RoomDTO) => (event: any) => {

    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очистка ошибки валидации при изменении поля
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSwitchChange = (field: keyof RoomDTO) => (event: React.ChangeEvent<HTMLInputElement>) => {

    setFormData(prev => ({ ...prev, [field]: event.target.checked }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.roomNumber?.trim()) {
      errors.roomNumber = 'Номер комнаты обязателен';
    }

    if (!formData.roomTypeId || formData.roomTypeId === 0) {
      errors.roomTypeId = 'Тип комнаты обязателен';
    }

    if (!formData.pricePerNight || formData.pricePerNight <= 0) {
      errors.pricePerNight = 'Цена за ночь должна быть больше 0';
    }

    if (!formData.capacity || formData.capacity <= 0) {
      errors.capacity = 'Вместимость должна быть больше 0';
    }

    if (!formData.floor || formData.floor <= 0) {
      errors.floor = 'Этаж должен быть больше 0';
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
          {room ? 'Редактировать комнату' : 'Добавить комнату'}
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Номер комнаты"
                    value={formData.roomNumber || ''}
                    onChange={handleChange('roomNumber')}
                    error={!!validationErrors.roomNumber}
                    helperText={validationErrors.roomNumber}
                    required
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!validationErrors.type}>
                    <InputLabel>Тип комнаты *</InputLabel>
                    <Select
                      value={formData.roomTypeId || ''}
                      onChange={handleChange('roomTypeId')}
                      label="Тип комнаты"
                      disabled={roomTypesLoading}
                    >
                      {roomTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {validationErrors.roomTypeId && (
                      <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                        {validationErrors.roomTypeId}
                      </Box>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Этаж"
                    type="number"
                    value={formData.floor || ''}
                    onChange={handleChange('floor')}
                    error={!!validationErrors.floor}
                    helperText={validationErrors.floor}
                    required
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Вместимость"
                    type="number"
                    value={formData.capacity || ''}
                    onChange={handleChange('capacity')}
                    error={!!validationErrors.capacity}
                    helperText={validationErrors.capacity}
                    required
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Цена за ночь"
                    type="number"
                    value={formData.pricePerNight || ''}
                    onChange={handleChange('pricePerNight')}
                    error={!!validationErrors.pricePerNight}
                    helperText={validationErrors.pricePerNight}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isAvailable || false}
                        onChange={handleSwitchChange('isAvailable')}
                      />
                    }
                    label="Доступна для бронирования"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasWifi || false}
                          onChange={handleSwitchChange('hasWifi')}
                        />
                      }
                      label="Wi-Fi"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasTV || false}
                          onChange={handleSwitchChange('hasTV')}
                        />
                      }
                      label="Телевизор"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasMinibar || false}
                          onChange={handleSwitchChange('hasMinibar')}
                        />
                      }
                      label="Мини-бар"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasAirConditioning || false}
                          onChange={handleSwitchChange('hasAirConditioning')}
                        />
                      }
                      label="Кондиционер"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasBalcony || false}
                          onChange={handleSwitchChange('hasBalcony')}
                        />
                      }
                      label="Балкон"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Правая колонка - изображение */}
            <Grid size={{ xs: 12, md: 4 }}>
              <ImageUpload
                value={formData.imageUrl}
                onChange={handleImageChange}
                label="Изображение комнаты"
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
            disabled={loading || roomTypesLoading}
          >
            {loading ? 'Сохранение...' : (room ? 'Обновить' : 'Создать')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RoomForm;