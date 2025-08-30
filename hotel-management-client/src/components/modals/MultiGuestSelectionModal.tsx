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
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { GuestDTO } from '../../types/api';
import apiService from '../../services/apiService';

interface MultiGuestSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (guests: GuestDTO[]) => void;
  selectedGuestIds?: number[];
}

const MultiGuestSelectionModal: React.FC<MultiGuestSelectionModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedGuestIds = []
}) => {
  const [guests, setGuests] = useState<GuestDTO[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<GuestDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>(selectedGuestIds);

  useEffect(() => {
    if (open) {
      loadGuests();
      setSelectedIds(selectedGuestIds);
    }
  }, [open, selectedGuestIds]);

  useEffect(() => {
    filterGuests();
  }, [guests, searchTerm]);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const data = await apiService.getGuests();
      setGuests(data);
    } catch (error) {
      console.error('Ошибка загрузки гостей:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGuests = () => {
    let filtered = guests;

    if (searchTerm) {
      const query = searchTerm.toLowerCase().trim();
      const searchWords = query.split(/\s+/).filter(word => word.length > 0);
      
      filtered = filtered.filter(guest => {
        const fullName = `${guest.firstName} ${guest.lastName} ${guest.middleName || ''}`.toLowerCase();
        const email = guest.email?.toLowerCase() || '';
        const phone = guest.phone?.toLowerCase() || '';
  
        if (searchWords.length === 1) {
          const searchTerm = searchWords[0];
          return guest.firstName.toLowerCase().includes(searchTerm) ||
                 guest.lastName.toLowerCase().includes(searchTerm) ||
                 guest.middleName?.toLowerCase().includes(searchTerm) ||
                 email.includes(searchTerm) ||
                 phone.includes(searchTerm);
        }
        
        return searchWords.every(word => 
          fullName.includes(word) ||
          email.includes(word) ||
          phone.includes(word)
        );
      });
    }

    setFilteredGuests(filtered);
  };

  const handleToggleGuest = (guestId: number) => {
    setSelectedIds(prev => {
      if (prev.includes(guestId)) {
        return prev.filter(id => id !== guestId);
      } else {
        return [...prev, guestId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredGuests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGuests.map(guest => guest.id));
    }
  };

  const handleConfirm = () => {
    const selectedGuests = guests.filter(guest => selectedIds.includes(guest.id));
    onSelect(selectedGuests);
    onClose();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Не указана';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Выбор гостей для проживания</Typography>
          <Chip 
            label={`Выбрано: ${selectedIds.length}`} 
            color={selectedIds.length > 0 ? 'primary' : 'default'}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Поиск */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Поиск по имени, email, телефону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <Button 
            variant="outlined" 
            onClick={handleSelectAll}
            disabled={filteredGuests.length === 0}
          >
            {selectedIds.length === filteredGuests.length ? 'Снять все' : 'Выбрать все'}
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedIds.length > 0 && selectedIds.length < filteredGuests.length}
                      checked={filteredGuests.length > 0 && selectedIds.length === filteredGuests.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Имя</TableCell>
                  <TableCell>Контакты</TableCell>
                  <TableCell>Гражданство</TableCell>
                  <TableCell>Дата рождения</TableCell>
                  <TableCell>Бронирований</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(guest.id)}
                        onChange={() => handleToggleGuest(guest.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {guest.lastName} {guest.firstName} {guest.middleName || ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{guest.phone}</Typography>
                        {guest.email && (
                          <Typography variant="caption" color="text.secondary">
                            {guest.email}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {guest.citizenshipName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(guest.dateOfBirth || null)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={guest.bookingsCount} 
                        size="small" 
                        color={guest.bookingsCount > 0 ? 'primary' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && filteredGuests.length === 0 && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography color="text.secondary">
              Гости не найдены
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm}
          disabled={selectedIds.length === 0}
        >
          Выбрать ({selectedIds.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MultiGuestSelectionModal;