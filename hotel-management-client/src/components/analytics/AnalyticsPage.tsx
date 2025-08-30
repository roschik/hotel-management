import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import apiService from '../../services/apiService';
import {
  RevenueReportDTO,
  OccupancyReportDTO,
  ServicesReportDTO,
  GuestAnalyticsReportDTO
} from '../../types/reports';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AnalyticsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [revenueReport, setRevenueReport] = useState<RevenueReportDTO | null>(null);
  const [occupancyReport, setOccupancyReport] = useState<OccupancyReportDTO | null>(null);
  const [servicesReport, setServicesReport] = useState<ServicesReportDTO | null>(null);
  const [guestReport, setGuestReport] = useState<GuestAnalyticsReportDTO | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [revenue, occupancy, services, guests] = await Promise.all([
        apiService.getRevenueReport(startDate, endDate),
        apiService.getOccupancyReport(startDate, endDate),
        apiService.getServicesReport(startDate, endDate),
        apiService.getGuestAnalyticsReport(startDate, endDate)
      ]);

      setRevenueReport(revenue);
      setOccupancyReport(occupancy);
      setServicesReport(services);
      setGuestReport(guests);
    } catch (err) {
      setError('Ошибка при загрузке отчетов');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportType: string, format: 'excel' | 'pdf') => {
    try {
      const blob = await apiService.exportReport(reportType, startDate, endDate, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${reportType}_report_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError(`Ошибка при экспорте в ${format.toUpperCase()}`);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" gutterBottom>
          Аналитика и отчеты
        </Typography>

        {/* Фильтры по датам */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 3 }}>
                <DatePicker
                  label="Дата начала"
                  value={startDate}
                  onChange={(newValue) => newValue && setStartDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <DatePicker
                  label="Дата окончания"
                  value={endDate}
                  onChange={(newValue) => newValue && setEndDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Button
                  variant="contained"
                  onClick={loadReports}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Обновить отчеты'}
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

        {/* Вкладки отчетов */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab label="Доходы" />
            <Tab label="Загруженность" />
            <Tab label="Услуги" />
            <Tab label="Гости" />
          </Tabs>
        </Box>

        {/* Отчет по доходам */}
        <TabPanel value={tabValue} index={0}>
          {revenueReport && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Отчет по доходам</Typography>
                  <Box>
                    <Tooltip title="Экспорт в Excel">
                      <IconButton onClick={() => handleExport('revenue', 'excel')}>
                        <ExcelIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Экспорт в PDF">
                      <IconButton onClick={() => handleExport('revenue', 'pdf')}>
                        <PdfIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Общий доход
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(revenueReport.totalRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Доход с номеров
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(revenueReport.accommodationRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Доход с услуг
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(revenueReport.serviceRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Средний чек
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(revenueReport.averageStayValue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Доходы по типам комнат */}
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Доходы по типам комнат
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Тип комнаты</TableCell>
                            <TableCell>Доход с комнаты</TableCell>
                            <TableCell>Доход с услуг</TableCell>
                            <TableCell>Проживаний</TableCell>
                            <TableCell>Средний чек</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {revenueReport.revenueByRoomType?.map((roomType) => (
                            <TableRow key={roomType.roomTypeId}>
                              <TableCell>{roomType.roomTypeName}</TableCell>
                              <TableCell>{formatCurrency(roomType.accommodationRevenue)}</TableCell>
                              <TableCell>{formatCurrency(roomType.serviceRevenue)}</TableCell>
                              <TableCell>{roomType.staysCount}</TableCell>
                              <TableCell>{formatCurrency(roomType.averageRate)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Отчет по загруженности */}
        <TabPanel value={tabValue} index={1}>
          {occupancyReport && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Отчет по загруженности номеров</Typography>
                  <Box>
                    <Tooltip title="Экспорт в Excel">
                      <IconButton onClick={() => handleExport('occupancy', 'excel')}>
                        <ExcelIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Экспорт в PDF">
                      <IconButton onClick={() => handleExport('occupancy', 'pdf')}>
                        <PdfIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Средняя загруженность
                    </Typography>
                    <Typography variant="h5">
                      {formatPercent(occupancyReport.averageOccupancyRate)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Всего проживаний
                    </Typography>
                    <Typography variant="h5">
                      {occupancyReport.totalStays}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Всего ночей
                    </Typography>
                    <Typography variant="h5">
                      {occupancyReport.totalNights}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Всего номеров
                    </Typography>
                    <Typography variant="h5">
                      {occupancyReport.totalRooms}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Детализация по номерам
                    </Typography>
                    
                    <TableContainer sx={{ overflowX: 'auto', '& .MuiTable-root': { minWidth: 650 } }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Номер</TableCell>
                            <TableCell>Тип</TableCell>
                            <TableCell>Проживаний</TableCell>
                            <TableCell>Ночей</TableCell>
                            <TableCell>Загруженность</TableCell>
                            <TableCell>Доход</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {occupancyReport.roomDetails.map((room) => (
                            <TableRow key={room.roomId}>
                              <TableCell>{room.roomNumber}</TableCell>
                              <TableCell>{room.roomType}</TableCell>
                              <TableCell>{room.staysCount}</TableCell>
                              <TableCell>{room.occupiedNights}</TableCell>
                              <TableCell>{formatPercent(room.occupancyRate)}</TableCell>
                              <TableCell>{formatCurrency(room.revenue)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Отчет по услугам */}
        <TabPanel value={tabValue} index={2}>
          {servicesReport && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Отчет по услугам</Typography>
                  <Box>
                    <Tooltip title="Экспорт в Excel">
                      <IconButton onClick={() => handleExport('services', 'excel')}>
                        <ExcelIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Экспорт в PDF">
                      <IconButton onClick={() => handleExport('services', 'pdf')}>
                        <PdfIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Доход с услуг
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(servicesReport.totalServiceRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Всего заказов
                    </Typography>
                    <Typography variant="h5">
                      {servicesReport.totalServicesOrdered}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Средняя стоимость
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(servicesReport.averageServiceValue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Популярность услуг */}
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Популярность услуг
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Рейтинг</TableCell>
                            <TableCell>Услуга</TableCell>
                            <TableCell>Цена</TableCell>
                            <TableCell>Заказов</TableCell>
                            <TableCell>Доход</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {servicesReport.servicePopularity.map((service) => (
                            <TableRow key={service.serviceId}>
                              <TableCell>
                                <Chip 
                                  label={`#${service.popularityRank}`}
                                  color={service.popularityRank <= 3 ? 'success' : service.popularityRank <= 5 ? 'warning' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{service.serviceName}</TableCell>
                              <TableCell>{formatCurrency(service.price)}</TableCell>
                              <TableCell>{service.timesOrdered}</TableCell>
                              <TableCell>{formatCurrency(service.totalRevenue)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Отчет по гостям */}
        <TabPanel value={tabValue} index={3}>
          {guestReport && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Отчет по гостям</Typography>
                  <Box>
                    <Tooltip title="Экспорт в Excel">
                      <IconButton onClick={() => handleExport('guests', 'excel')}>
                        <ExcelIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Экспорт в PDF">
                      <IconButton onClick={() => handleExport('guests', 'pdf')}>
                        <PdfIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Всего гостей
                    </Typography>
                    <Typography variant="h5">
                      {guestReport.totalGuests}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Новые гости
                    </Typography>
                    <Typography variant="h5">
                      {guestReport.newGuests}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Возвращающиеся гости
                    </Typography>
                    <Typography variant="h5">
                      {guestReport.returningGuests}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      % возврата
                    </Typography>
                    <Typography variant="h5">
                      {formatPercent(guestReport.returnGuestRate)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Общий доход
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(guestReport.totalGuestRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Средние траты (включая услуги)
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(guestReport.averageSpendingPerGuest)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Сегменты гостей */}
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Сегменты гостей
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Сегмент</TableCell>
                            <TableCell>Количество гостей</TableCell>
                            <TableCell>Общий доход</TableCell>
                            <TableCell>Средняя длительность</TableCell>
                            <TableCell>Средние траты</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {guestReport.guestSegments.map((segment) => (
                            <TableRow key={segment.segmentName}>
                              <TableCell>{segment.segmentName}</TableCell>
                              <TableCell>{segment.guestCount}</TableCell>
                              <TableCell>{formatCurrency(segment.totalRevenue)}</TableCell>
                              <TableCell>{segment.averageStayDuration.toFixed(1)} дн.</TableCell>
                              <TableCell>{formatCurrency(segment.averageSpending)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Топ гости */}
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Топ гости
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Гость</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Проживаний</TableCell>
                            <TableCell>Потрачено</TableCell>
                            <TableCell>Последний визит</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {guestReport.topGuests.map((guest) => (
                            <TableRow key={guest.guestId}>
                              <TableCell>{guest.guestName}</TableCell>
                              <TableCell>{guest.email}</TableCell>
                              <TableCell>{guest.staysCount}</TableCell>
                              <TableCell>{formatCurrency(guest.totalSpent)}</TableCell>
                              <TableCell>{new Date(guest.lastVisit).toLocaleDateString('ru-RU')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsPage;