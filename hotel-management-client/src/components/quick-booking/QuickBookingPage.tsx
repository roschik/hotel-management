import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { FlashOn as QuickBookingIcon } from '@mui/icons-material';
import QuickRoomSearch from './QuickRoomSearch';
import QuickBookingForm from './QuickBookingForm';
import { AvailableRoomResultDTO, AvailableRoomSearchDTO } from '../../types/api';

const QuickBookingPage: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoomResultDTO | null>(null);
  const [searchParams, setSearchParams] = useState<AvailableRoomSearchDTO | null>(null);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRoomSelect = (room: AvailableRoomResultDTO, params: AvailableRoomSearchDTO) => {
    setSelectedRoom(room);
    setSearchParams(params);
    setBookingFormOpen(true);
  };

  const handleBookingSuccess = () => {
    setSuccessMessage('Бронирование успешно создано!');
    setSelectedRoom(null);
    setSearchParams(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <QuickBookingIcon sx={{ fontSize: 34, color: 'primary.main' }} /> 
          Быстрое бронирование
        </Typography>
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        <QuickRoomSearch onRoomSelect={handleRoomSelect} />
        
        <QuickBookingForm
          open={bookingFormOpen}
          onClose={() => setBookingFormOpen(false)}
          onSuccess={handleBookingSuccess}
          selectedRoom={selectedRoom}
          searchParams={searchParams}
        />
      </Box>
    </Container>
  );
};

export default QuickBookingPage;