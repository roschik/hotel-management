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
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { GuestDTO } from '../../types/api';
import apiService from '../../services/apiService';

interface GuestSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (guest: GuestDTO) => void;
  selectedGuestId?: number;
}

const GuestSelectionModal: React.FC<GuestSelectionModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedGuestId
}) => {
  const [guests, setGuests] = useState<GuestDTO[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<GuestDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vipFilter, setVipFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    if (open) {
      loadGuests();
    }
  }, [open]);

  useEffect(() => {
    filterGuests();
  }, [guests, searchTerm, vipFilter, countryFilter]);

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

  const handleSelect = (guest: GuestDTO) => {
    onSelect(guest);
    onClose();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Выбор гостя</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Поиск по имени, email, телефону"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 350 }}
            />
            <Button 
              variant="outlined" 
              onClick={() => {
                setSearchTerm('');
                setVipFilter('');
                setCountryFilter('');
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
                  <TableCell>Гость</TableCell>
                  <TableCell>Контакты</TableCell>
                  <TableCell>Гражданство</TableCell>
                  <TableCell>Дата рождения</TableCell>
                  <TableCell>Адрес</TableCell>
                  <TableCell>Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow 
                    key={guest.id}
                    selected={selectedGuestId === guest.id}
                    hover
                  >
                    <TableCell>
                        <Typography variant="caption">
                          #{guest.id}
                        </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {guest.lastName} {guest.firstName} 
                          {guest.middleName && ` ${guest.middleName}`}
                        </Typography>
                        {guest.identificationNumber && (
                          <Box>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {guest.identificationTypeName}: 
                            </Typography>
                            <Typography variant="caption" display="block">
                              {guest.identificationNumber}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption" display="block">
                          {guest.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {guest.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{guest.citizenshipName}</TableCell>
                    <TableCell>{formatDate(guest.dateOfBirth ?? null)}</TableCell>
                    <TableCell>{guest.address ?? '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant={selectedGuestId === guest.id ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleSelect(guest)}
                      >
                        {selectedGuestId === guest.id ? 'Выбран' : 'Выбрать'}
                      </Button>
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
      </DialogActions>
    </Dialog>
  );
};

export default GuestSelectionModal;