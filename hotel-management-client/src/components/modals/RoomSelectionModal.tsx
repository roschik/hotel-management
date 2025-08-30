import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  InputAdornment,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { RoomDTO } from '../../types/api';
import apiService from '../../services/apiService';

interface RoomSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (room: RoomDTO) => void;
  selectedRoomId?: number;
  checkInDate?: Date;
  checkOutDate?: Date;
}

const RoomSelectionModal: React.FC<RoomSelectionModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedRoomId
}) => {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);

  useEffect(() => {
    if (open) {
      loadRooms();
    }
  }, [open]);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, floorFilter, typeFilter, availableOnly]);

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

  const filterRooms = () => {
    let filtered = rooms;

    if (searchTerm) {
      const query = searchTerm.toLowerCase().trim();
      const searchWords = query.split(/\s+/).filter(word => word.length > 0);
      
      filtered = filtered.filter(room => {
        const roomNumber = room.roomNumber.toLowerCase() || '';
        const roomTypeName = room.roomTypeName.toLowerCase() || '';
  
        if (searchWords.length === 1) {
          const searchTerm = searchWords[0];
          return roomNumber.includes(searchTerm) ||
                 roomTypeName.includes(searchTerm);
        }
        
        return searchWords.every(word => 
          roomNumber.includes(word) ||
          roomTypeName.includes(word)
        );
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomTypeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (floorFilter) {
      filtered = filtered.filter(room => room.floor.toString() === floorFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(room => room.roomTypeName === typeFilter);
    }

    if (availableOnly) {
      filtered = filtered.filter(room => room.isAvailable);
    }

    setFilteredRooms(filtered);
  };

  const handleSelect = (room: RoomDTO) => {
    onSelect(room);
    onClose();
  };

  const uniqueFloors = Array.from(new Set(rooms.map(room => room.floor))).sort((a, b) => a - b);
  const uniqueTypes = Array.from(new Set(rooms.map(room => room.roomTypeName)));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Выбор комнаты</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Поиск по номеру или типу комнаты"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Этаж</InputLabel>
                <Select
                    value={floorFilter}
                    onChange={(e) => setFloorFilter(e.target.value)}
                    label="Этаж"
                >
                    {uniqueFloors.map(floor => (
                    <MenuItem key={floor} value={floor}>
                        {floor} этаж
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Тип комнаты</InputLabel>
                <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Тип комнаты"
                >
                    {uniqueTypes.map(type => (
                    <MenuItem key={type} value={type}>
                        {type}
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button
              variant={availableOnly ? "contained" : "outlined"}
              onClick={() => setAvailableOnly(!availableOnly)}
              sx={{ minWidth: 150 }}
            >
              {availableOnly ? 'Только доступные' : 'Все комнаты'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => {
                setSearchTerm('');
                setFloorFilter('');
                setTypeFilter('');
                setAvailableOnly(true);
              }}
            >
              Сбросить
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Номер</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Этаж</TableCell>
                  <TableCell>Вместимость</TableCell>
                  <TableCell>Цена за ночь</TableCell>
                  <TableCell>Удобства</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow 
                    key={room.id}
                    selected={selectedRoomId === room.id}
                    hover
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          #{room.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          №{room.roomNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{room.roomTypeName}</TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell>{room.capacity} чел.</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatPrice(room.pricePerNight)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {room.hasWifi && <Chip label="WiFi" size="small" variant="outlined" />}
                        {room.hasTV && <Chip label="ТВ" size="small" variant="outlined" />}
                        {room.hasMinibar && <Chip label="Мини-бар" size="small" variant="outlined" />}
                        {room.hasAirConditioning && <Chip label="Кондиционер" size="small" variant="outlined" />}
                        {room.hasBalcony && <Chip label="Балкон" size="small" variant="outlined" />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        className='status-chip'
                        label={room.isAvailable ? 'Доступна' : 'Недоступна'} 
                        size="small" 
                        color={room.isAvailable ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={selectedRoomId === room.id ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleSelect(room)}
                        disabled={!room.isAvailable && selectedRoomId !== room.id}
                      >
                        {selectedRoomId === room.id ? 'Выбрана' : 'Выбрать'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && filteredRooms.length === 0 && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography color="text.secondary">
              Комнаты не найдены
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomSelectionModal;