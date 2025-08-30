import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

interface BookingSuccessModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: number;
  onCreateAnother: () => void;
}

const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  open,
  onClose,
  bookingId,
  onCreateAnother,
}) => {
  const navigate = useNavigate();

  const handleGoToBookings = () => {
    navigate('/bookings');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ textAlign: 'center', p: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Бронирование успешно создано!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          ID бронирования: <strong>{bookingId}</strong>
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleGoToBookings}
          sx={{ mr: 1 }}
        >
          Перейти к бронированиям
        </Button>
        <Button 
          variant="outlined" 
          onClick={onCreateAnother}
        >
          Создать еще одно
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingSuccessModal;