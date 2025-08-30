import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Hotel as HotelIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { ServiceSaleDTO } from '../../types/api';

interface ServiceSaleViewDialogProps {
  open: boolean;
  onClose: () => void;
  serviceSale: ServiceSaleDTO | null;
  onEdit?: () => void;
}

const ServiceSaleViewDialog: React.FC<ServiceSaleViewDialogProps> = ({
  open,
  onClose,
  serviceSale,
  onEdit
}) => {
  if (!serviceSale) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'оплачено':
        return 'success';
      case 'частично оплачено':
        return 'warning';
      case 'не оплачено':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon />
          Карточка продажи услуги #{serviceSale.id}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Основная информация */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ alignSelf: 'stretch' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon /> Информация об услуге
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Услуга</Typography>
                  <Typography variant="body1" fontWeight={600}>{serviceSale.serviceName}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Количество</Typography>
                  <Typography variant="body1">{serviceSale.quantity}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Цена за единицу</Typography>
                  <Typography variant="body1">{formatCurrency(serviceSale.unitPrice)}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Налог</Typography>
                  <Typography variant="body1">{serviceSale.taxPercent}%</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Общая стоимость</Typography>
                  <Typography variant="h6" color="primary">{formatCurrency(serviceSale.totalPrice)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Информация о людях */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ alignSelf: 'stretch' }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Участники
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Сотрудник</Typography>
                  <Typography variant="body1">
                    {serviceSale.employeeName}
                  </Typography>
                </Box>
                {serviceSale.guestName && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Гость</Typography>
                    <Typography variant="body1">
                      {serviceSale.guestName}
                    </Typography>
                  </Box>
                )}
                {serviceSale.stayId && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Проживание</Typography>
                    <Typography variant="body1">
                      ID пребывания: {serviceSale.stayId}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Дополнительная информация */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon /> Дополнительная информация
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="body2" color="text.secondary">Дата продажи</Typography>
                    <Typography variant="body1">{formatDate(serviceSale.saleDate)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="body2" color="text.secondary">Статус оплаты</Typography>
                    <Chip 
                      label={serviceSale.paymentStatusName} 
                      color={getPaymentStatusColor(serviceSale.paymentStatusName)}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="body2" color="text.secondary">Дата создания</Typography>
                    <Typography variant="body1">{formatDate(serviceSale.createdAt)}</Typography>
                  </Grid>
                </Grid>
                {serviceSale.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Примечания</Typography>
                    <Typography variant="body1">{serviceSale.notes}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        {onEdit && (
          <Button variant="contained" onClick={onEdit}>
            Редактировать
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ServiceSaleViewDialog;