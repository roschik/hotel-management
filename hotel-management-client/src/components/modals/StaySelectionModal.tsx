import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Box,
  Typography,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Hotel as HotelIcon
} from '@mui/icons-material';
import { StayDTO } from '../../types/api';
import apiService from '../../services/apiService';

interface StaySelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (stay: StayDTO) => void;
  selectedStayId?: number;
}

const StaySelectionModal: React.FC<StaySelectionModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedStayId
}) => {
  const [stays, setStays] = useState<StayDTO[]>([]);
  const [filteredStays, setFilteredStays] = useState<StayDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (open) {
      loadStays();
    }
  }, [open]);

  useEffect(() => {
    filterStays();
  }, [stays, searchTerm, statusFilter]);

  const loadStays = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStays();
      // Фильтруем только активные проживания (без даты выезда или с будущей датой выезда)
      const activeStays = response.filter(stay => 
        !stay.actualCheckOutDate || new Date(stay.actualCheckOutDate) > new Date()
      );
      setStays(activeStays);
    } catch (error) {
      console.error('Ошибка загрузки проживаний:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStays = () => {
    let filtered = stays;

    if (searchTerm) {
      const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
        filtered = filtered.filter(stay => {
          const searchableText = [
            stay.roomNumber.toString() || '',
            stay.guestName.toString() || '',
            stay.stayId.toString() || ''
          ].join(' ').toLowerCase();

        return searchWords.every(word => searchableText.includes(word));
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(stay => stay.paymentStatusName === statusFilter);
    }

    setFilteredStays(filtered);
  };

  const handleSelect = (stay: StayDTO) => {
    onSelect(stay);
    onClose();
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Оплачено': return 'success';
      case 'Частично оплачено': return 'warning';
      case 'Ожидает оплаты': return 'info';
      case 'Просрочено': return 'error';
      default: return 'default';
    }
  };

  const uniqueStatuses = Array.from(new Set(stays.map(stay => stay.paymentStatusName)));
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HotelIcon />
          Выбор проживания
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Поиск по ID, комнате или гостю"
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
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Статус оплаты</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Статус оплаты"
              >
                <MenuItem value="">Все статусы</MenuItem>
                {uniqueStatuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                  <TableCell>Комната</TableCell>
                  <TableCell>Основной гость</TableCell>
                  <TableCell>Даты проживания</TableCell>
                  <TableCell>Статус оплаты</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell align="center">Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStays.map((stay) => (
                  <TableRow key={stay.stayId} hover>
                    <TableCell>#{stay.stayId}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {stay.roomNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{stay.guestName}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(stay.actualCheckInDate)} - {stay.actualCheckOutDate ? formatDate(stay.actualCheckOutDate) : 'Активно'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        className="status-chip"
                        label={stay.paymentStatusName}
                        color={getStatusColor(stay.paymentStatusName) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {stay.totalAmount?.toLocaleString()} ₽
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant={selectedStayId === stay.stayId ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleSelect(stay)}
                      >
                        {selectedStayId === stay.stayId ? 'Выбрано' : 'Выбрать'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && filteredStays.length === 0 && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography color="text.secondary">
              Проживания не найдены
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

export default StaySelectionModal;