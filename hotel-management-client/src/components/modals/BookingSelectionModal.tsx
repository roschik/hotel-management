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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { BookingDTO } from '../../types/api';
import apiService from '../../services/apiService';

interface BookingSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (booking: BookingDTO) => void;
  selectedBookingId?: number;
}

const BookingSelectionModal: React.FC<BookingSelectionModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedBookingId
}) => {
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    if (open) {
      loadBookings();
    }
  }, [open]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, typeFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (searchTerm) {
      const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
      filtered = filtered.filter(booking => {
        const searchableText = [
          booking.id?.toString() || '',
          booking.guestName || '',
          booking.roomNumber?.toString() || ''
        ].join(' ').toLowerCase();
        
        return searchWords.every(word => searchableText.includes(word));
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(booking => booking.bookingStatusName === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(booking => booking.bookingTypeName === typeFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleSelect = (booking: BookingDTO) => {
    onSelect(booking);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Подтверждено': return 'success';
      case 'Ожидает подтверждения': return 'info';
      case 'Завершено': return 'warning';
      case 'Отменено': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const uniqueStatuses = Array.from(new Set(bookings.map((booking: BookingDTO) => booking.bookingStatusName)));
  const uniqueTypes = Array.from(new Set(bookings.map((booking: BookingDTO) => booking.bookingTypeName)));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Выбор бронирования</DialogTitle>
      <DialogContent>
        {/* Фильтры */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по ID, гостю, номеру..."
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
            <InputLabel>Статус</InputLabel>
            <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Статус"
            >
                {uniqueStatuses.map(status => (
                <MenuItem key={status} value={status}>
                    {status}
                </MenuItem>
                ))}
            </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Тип</InputLabel>
            <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Тип"
            >
                {uniqueTypes.map(type => (
                <MenuItem key={type} value={type}>
                    {type}
                </MenuItem>
                ))}
            </Select>
        </FormControl>
        <Button 
              variant="outlined" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setTypeFilter('');
              }}
            >
              Сбросить
            </Button>
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
                  <TableCell>Гость</TableCell>
                  <TableCell>Номер</TableCell>
                  <TableCell>Даты</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell>Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} hover>
                    <TableCell>#{booking.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {booking.guestName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.guestPhone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {booking.roomNumber} ({booking.roomType})
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        className='status-chip'
                        label={booking.bookingStatusName}
                        color={getStatusColor(booking.bookingStatusName) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(booking.totalPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={selectedBookingId === booking.id ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleSelect(booking)}
                      >
                        {selectedBookingId === booking.id ? 'Выбрано' : 'Выбрать'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && filteredBookings.length === 0 && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography color="text.secondary">
              Бронирования не найдены
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

export default BookingSelectionModal;