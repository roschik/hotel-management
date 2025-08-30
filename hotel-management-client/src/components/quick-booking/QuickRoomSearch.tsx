import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { AvailableRoomSearchDTO, AvailableRoomResultDTO, RoomTypeDTO } from '../../types/api';
import { apiService } from '../../services/apiService';

interface QuickRoomSearchProps {
  onRoomSelect: (room: AvailableRoomResultDTO, searchParams: AvailableRoomSearchDTO) => void;
}

const QuickRoomSearch: React.FC<QuickRoomSearchProps> = ({ onRoomSelect }) => {
  const [searchParams, setSearchParams] = useState<AvailableRoomSearchDTO>({
    checkInDate: new Date(),
    checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  const [availableRooms, setAvailableRooms] = useState<AvailableRoomResultDTO[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    try {
      const types = await apiService.getRoomTypes();
      setRoomTypes(types);
    } catch (error) {
      console.error('Error loading room types:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const normalizedParams = {
        ...searchParams,
        checkInDate: new Date(Date.UTC(
          searchParams.checkInDate.getFullYear(), 
          searchParams.checkInDate.getMonth(), 
          searchParams.checkInDate.getDate(),
          12, 0, 0, 0 
        )),
        checkOutDate: new Date(Date.UTC(
          searchParams.checkOutDate.getFullYear(), 
          searchParams.checkOutDate.getMonth(), 
          searchParams.checkOutDate.getDate(),
          12, 0, 0, 0 
        ))
      };
      
      const rooms = await apiService.searchAvailableRooms(normalizedParams);
      setAvailableRooms(rooms);
    } catch (error) {
      setError('Ошибка при поиске доступных комнат');
      console.error('Error searching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (field: keyof AvailableRoomSearchDTO, value: any) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Поиск доступных комнат
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Дата заезда"
                  value={searchParams.checkInDate}
                  onChange={(date) => handleParamChange('checkInDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Дата выезда"
                  value={searchParams.checkOutDate}
                  onChange={(date) => handleParamChange('checkOutDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Вместимость"
                  type="number"
                  value={searchParams.capacity || ''}
                  onChange={(e) => handleParamChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                  fullWidth
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Тип комнаты</InputLabel>
                  <Select
                    label="Тип комнаты"
                    value={searchParams.roomTypeId || ''}
                    onChange={(e) => handleParamChange('roomTypeId', e.target.value || undefined)}
                  >
                    <MenuItem value="">Любой</MenuItem>
                    {roomTypes.map(type => (
                      <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Цена от"
                      type="number"
                      value={searchParams.minPricePerNight || ''}
                      onChange={(e) => handleParamChange('minPricePerNight', e.target.value ? parseFloat(e.target.value) : undefined)}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Цена до"
                      type="number"
                      value={searchParams.maxPricePerNight || ''}
                      onChange={(e) => handleParamChange('maxPricePerNight', e.target.value ? parseFloat(e.target.value) : undefined)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={searchParams.hasWifi || false}
                        onChange={(e) => handleParamChange('hasWifi', e.target.checked)}
                      />
                    }
                    label="Wi-Fi"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={searchParams.hasTV || false}
                        onChange={(e) => handleParamChange('hasTV', e.target.checked)}
                      />
                    }
                    label="ТВ"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={searchParams.hasMinibar || false}
                        onChange={(e) => handleParamChange('hasMinibar', e.target.checked)}
                      />
                    }
                    label="Мини-бар"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={searchParams.hasAirConditioning || false}
                        onChange={(e) => handleParamChange('hasAirConditioning', e.target.checked)}
                      />
                    }
                    label="Кондиционер"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={searchParams.hasBalcony || false}
                        onChange={(e) => handleParamChange('hasBalcony', e.target.checked)}
                      />
                    }
                    label="Балкон"
                  />
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Поиск...' : 'Найти комнаты'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {availableRooms.length > 0 && (
          <Grid container spacing={2}>
            {availableRooms.map(room => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={room.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      Комната {room.roomNumber}
                    </Typography>
                    <Typography color="textSecondary">
                      {room.roomTypeName} • Этаж {room.floor}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Вместимость: {room.capacity} чел.
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      {room.pricePerNight}₽/ночь
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      Итого: {room.totalPrice}₽
                    </Typography>
                    
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {room.hasWifi && <Typography variant="caption">Wi-Fi</Typography>}
                      {room.hasTV && <Typography variant="caption">ТВ</Typography>}
                      {room.hasMinibar && <Typography variant="caption">Мини-бар</Typography>}
                      {room.hasAirConditioning && <Typography variant="caption">Кондиционер</Typography>}
                      {room.hasBalcony && <Typography variant="caption">Балкон</Typography>}
                    </Box>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => onRoomSelect(room, searchParams)}
                    >
                      Выбрать комнату
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default QuickRoomSearch;