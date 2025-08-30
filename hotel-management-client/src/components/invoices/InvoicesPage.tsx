import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Receipt as InvoicesIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  AttachMoney as MoneyIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import SearchBar from '../common/SearchBar';
import FilterPanel, { FilterOption } from '../common/FilterPanel';
import DataTable from '../common/DataTable';
import Pagination from '../common/Pagination';
import { useTableState } from '../../hooks/useTableState';
import { TableColumn, ActionButton } from '../../types/common';
import { invoiceService } from '../../services/invoiceService';
import { InvoiceDTO, PaymentStatusDTO } from '../../types/api';
import apiService from '../../services/apiService';

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDTO | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatusDTO[]>([]);


  const {
    searchConfig,
    setSearchQuery,
    sortConfig,
    handleSort,
    paginationConfig,
    handlePageChange,
    handlePageSizeChange,
    filterConfig,
    handleFilterChange,
    clearFilters,
    selectedItems,
    handleSelectItem,
    handleSelectAll,
    clearSelection,
  } = useTableState({
    initialPageSize: 25,
    initialSort: { field: 'issueDate', direction: 'desc' },
  });

  // Загрузка данных
  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAllInvoices();
      setInvoices(data);
      
      // Подсчитываем общую выручку
      const revenue = data.reduce((sum, invoice) => sum + (invoice.paidAmount || 0), 0);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Ошибка загрузки счетов:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentStatuses = async () => {
    try {
      const paymentStatuses = await apiService.getPaymentStatuses();
      setPaymentStatuses(paymentStatuses);
    } catch (error) {
      console.error('Ошибка загрузки статусов оплаты:', error);
    }
  };

  useEffect(() => {
    loadInvoices();
    loadPaymentStatuses();
  }, []);

  // Обработчики
  const handleViewInvoice = (invoice: InvoiceDTO) => {
    setSelectedInvoice(invoice);
    setShowViewDialog(true);
  };

  const handlePaymentUpdate = (invoice: InvoiceDTO) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!selectedInvoice) return;
    
    try {
      await invoiceService.updatePayment(selectedInvoice.stayId, paymentData);
      setShowPaymentDialog(false);
      setSelectedInvoice(null);
      await loadInvoices();
    } catch (error) {
      console.error('Ошибка обновления платежа:', error);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'оплачено':
        return 'success';
      case 'частично оплачено':
        return 'warning';
      case 'просрочено':
        return 'error';
      case 'ожидает оплаты':
        return 'info';
      default:
        return 'default';
    }
  };

  // Функция для фильтрации и поиска данных
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    // Применяем поиск
    if (searchConfig.query) {
    const searchWords = searchConfig.query.toLowerCase().split(' ').filter(word => word.length > 0);
      filtered = filtered.filter(invoice => {
        const searchableText = [
          invoice.stayId?.toString() || '',
          invoice.guestName || '',
          invoice.roomNumber || ''
        ].join(' ').toLowerCase();
        
        return searchWords.every(word => searchableText.includes(word));
      });
    }

    // Применяем фильтры
    if (filterConfig.dateRange) {
      const { startDate, endDate } = filterConfig.dateRange;
      if (startDate) {
        filtered = filtered.filter(invoice => 
          new Date(invoice.issueDate) >= new Date(startDate)
        );
      }
      if (endDate) {
        filtered = filtered.filter(invoice => 
          new Date(invoice.issueDate) <= new Date(endDate)
        );
      }
    }

    // Применяем сортировку
    if (sortConfig?.field) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field as keyof InvoiceDTO];
        const bValue = b[sortConfig.field as keyof InvoiceDTO];
        
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        return aValue > bValue ? direction : aValue < bValue ? -direction : 0;
      });
    }

    return filtered;
  }, [invoices, searchConfig.query, filterConfig, sortConfig]);

  // Пагинация отфильтрованных данных
  const paginatedInvoices = useMemo(() => {
    const startIndex = (paginationConfig.page - 1) * paginationConfig.pageSize;
    const endIndex = startIndex + paginationConfig.pageSize;
    return filteredInvoices.slice(startIndex, endIndex).map(invoice => ({
      ...invoice,
      id: invoice.stayId.toString() 
    }));
  }, [filteredInvoices, paginationConfig.page, paginationConfig.pageSize]);

  // Фильтры для счетов
  const filterOptions: FilterOption[] = [
    {
      key: 'dateRange',
      label: 'Период',
      type: 'dateRange',
    },
  ];

  // Колонки таблицы
  const columns: TableColumn[] = [
    {
      key: 'stayId',
      label: 'ID Проживания',
      sortable: true,
      width: '100px',
      render: (value: number) => `#${value}`,
    },
    {
      key: 'guestName',
      label: 'Гость',
      sortable: true,
      width: '200px',
    },
    {
      key: 'roomNumber',
      label: 'Номер',
      sortable: true,
      width: '100px',
    },
    {
      key: 'issueDate',
      label: 'Дата выставления',
      sortable: true,
      width: '150px',
      render: (value: Date) => new Date(value).toLocaleDateString('ru-RU'),
    },
    {
      key: 'dueDate',
      label: 'Срок оплаты',
      sortable: true,
      width: '150px',
      render: (value: Date) => new Date(value).toLocaleDateString('ru-RU'),
    },
    {
      key: 'roomCharges',
      label: 'За проживание',
      sortable: true,
      width: '120px',
      render: (value: number) => `${value?.toLocaleString('ru-RU')} ₽`,
    },
    {
      key: 'paidAmount',
      label: 'Проживание оплачено',
      sortable: true,
      width: '150px',
      render: (value: number, invoice: InvoiceDTO) => {
        const roomDebt = (invoice.roomCharges || 0) - (invoice.paidAmount || 0);
        return (
          <Box>
            <Typography variant="body2" color="success.main">
              {(invoice.paidAmount || 0).toLocaleString('ru-RU')} ₽
            </Typography>
            {roomDebt > 0 && (
              <Typography variant="body2" color="error.main" sx={{ fontSize: '0.75rem' }}>
                Долг: {roomDebt.toLocaleString('ru-RU')} ₽
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: 'serviceCharges',
      label: 'За услуги',
      sortable: true,
      width: '120px',
      render: (value: number) => `${value?.toLocaleString('ru-RU')} ₽`,
    },
    {
      key: 'paidServiceCharges',
      label: 'Услуги оплачено',
      sortable: true,
      width: '150px',
      render: (value: number, invoice: InvoiceDTO) => {
        const serviceDebt = (invoice.serviceCharges || 0) - (invoice.paidServiceCharges || 0);
        return (
          <Box>
            <Typography variant="body2" color="success.main">
              {(invoice.paidServiceCharges || 0).toLocaleString('ru-RU')} ₽
            </Typography>
            {serviceDebt > 0 && (
              <Typography variant="body2" color="error.main" sx={{ fontSize: '0.75rem' }}>
                Долг: {serviceDebt.toLocaleString('ru-RU')} ₽
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: 'totalAmount',
      label: 'Итого',
      sortable: true,
      width: '120px',
      render: (value: number, invoice: InvoiceDTO) => {
        const calculatedTotal = (invoice.roomCharges || 0) + (invoice.serviceCharges || 0);
        return (
          <Typography variant="body2" fontWeight={600} color="primary">
            {calculatedTotal.toLocaleString('ru-RU')} ₽
          </Typography>
        );
      },
    },
    {
      key: 'totalPaid',
      label: 'Оплачено',
      sortable: true,
      width: '150px',
      render: (value: number, invoice: InvoiceDTO) => {
        const totalPaid = (invoice.paidAmount || 0) + (invoice.paidServiceCharges || 0);
        const totalAmount = (invoice.roomCharges || 0) + (invoice.serviceCharges || 0);
        const totalDebt = totalAmount - totalPaid;
        
        return (
          <Box>
            <Typography variant="body2" color="success.main">
              {totalPaid.toLocaleString('ru-RU')} ₽
            </Typography>
            {totalDebt > 0 && (
              <Typography variant="body2" color="error.main" sx={{ fontSize: '0.75rem' }}>
                Долг: {totalDebt.toLocaleString('ru-RU')} ₽
              </Typography>
            )}
          </Box>
        );
      },
    },
  ];

  // Действия для строк таблицы
  const actions: ActionButton[] = [
    {
      key: 'view',
      icon: <ViewIcon />,
      label: 'Просмотр',
      onClick: handleViewInvoice,
    },
    {
      key: 'print',
      icon: <PrintIcon />,
      label: 'Печать',
      onClick: exportToPDFAndPrint,
    },
  ];

  // Статистика
  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(i => i.paymentStatus === 'Оплачено').length;
    const unpaidInvoices = invoices.filter(i => i.paymentStatus === 'Ожидает оплаты' || i.paymentStatus === 'Частично оплачено').length;
    const overdueInvoices = invoices.filter(i => i.paymentStatus === 'Просрочено').length;
    const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const paidAmount = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);

    return {
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      totalAmount,
      paidAmount,
    };
  }, [invoices]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <InvoicesIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Счета
          </Typography>
        </Box>
      </Box>

      {/* Поиск и фильтры */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SearchBar
              value={searchConfig.query}
              onChange={setSearchQuery}
              placeholder="Поиск по ID, гостю, номеру..."
            />
          </Box>
        </CardContent>
      </Card>

      <FilterPanel
        filters={filterOptions}
        values={filterConfig}
        onChange={handleFilterChange}
        onApply={() => {}}
        onClear={clearFilters}
        isCollapsed={true}
        showApplyButton={false}
      />

      {/* Таблица */}
      <Card>
        <DataTable
          columns={columns}
          data={paginatedInvoices.map(invoice => ({ ...invoice, id: invoice.stayId }))}
          loading={loading}
          sortConfig={sortConfig}
          onSort={handleSort}
          emptyMessage="Счета не найдены"
          actions={actions}
        />
      </Card>

      <Pagination
          currentPage={paginationConfig.page}
          totalPages={Math.ceil(filteredInvoices.length / paginationConfig.pageSize)}
          pageSize={paginationConfig.pageSize}
          totalItems={filteredInvoices.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

      {/* Диалог просмотра счета */}
      <Dialog
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Счет #{selectedInvoice?.stayId} - {selectedInvoice?.guestName}
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              {/* Основная информация */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Гость
                  </Typography>
                  <Typography variant="body1">
                    {selectedInvoice.guestName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Номер
                  </Typography>
                  <Typography variant="body1">
                    {selectedInvoice.roomNumber}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Дата выставления
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedInvoice.issueDate).toLocaleDateString('ru-RU')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Срок оплаты
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedInvoice.dueDate).toLocaleDateString('ru-RU')}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Детализация расходов */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Детализация
              </Typography>
              
              {/* Раздел: Проживание */}
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Проживание
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Описание</TableCell>
                      <TableCell>Даты проживания</TableCell>
                      <TableCell align="right">Кол-во дней</TableCell>
                      <TableCell align="right">Цена за сутки</TableCell>
                      <TableCell align="right">
                        Сумма<br/>
                        (в т.ч. НДС)
                      </TableCell>
                      <TableCell align="right">Оплачено</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Проживание в номере {selectedInvoice.roomNumber}</TableCell>
                      <TableCell>
                        {new Date(selectedInvoice.checkInDate).toLocaleDateString('ru-RU')} - {new Date(selectedInvoice.checkOutDate).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell align="right">{selectedInvoice.numberOfDays}</TableCell>
                      <TableCell align="right">
                        {selectedInvoice.dailyRate?.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell align="right">
                        {selectedInvoice.roomCharges?.toLocaleString('ru-RU')} ₽ 
                        ({selectedInvoice.roomTaxAmount?.toLocaleString('ru-RU')} ₽)
                      </TableCell>
                      <TableCell align="right">
                        {selectedInvoice.paidAmount?.toLocaleString('ru-RU')} ₽
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Раздел: Услуги */}
              {selectedInvoice.serviceItems && selectedInvoice.serviceItems.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Услуги
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Название услуги</TableCell>
                          <TableCell align="right">Дата</TableCell>
                          <TableCell align="right">Кол-во</TableCell>
                          <TableCell align="right">Цена за ед.</TableCell>
                          <TableCell align="right">Сумма <br/>(в т.ч. НДС)</TableCell>
                          <TableCell align="center">Оплачено</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedInvoice.serviceItems
                          .filter(item => item.paymentStatusName !== 'Отменено')
                          .map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.serviceName}</TableCell>
                            <TableCell align="right">
                              {new Date(item.saleDate).toLocaleDateString('ru-RU')}
                            </TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              {item.unitPrice.toLocaleString('ru-RU')} ₽
                            </TableCell>
                            <TableCell align="right">
                              {item.totalPrice.toLocaleString('ru-RU')} ₽ <br/>
                              ({item.taxAmount?.toLocaleString('ru-RU')} ₽)
                            </TableCell>
                            <TableCell align="center">
                              {item.paymentStatusName === 'Оплачено' ? item.totalPrice.toLocaleString('ru-RU') + ' ₽' : '0 ₽'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
              
              {/* Общие итоги */}
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                Итоги
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={3}><strong>Итоговая сумма</strong></TableCell>
                      <TableCell align="right">
                        <strong>
                          {((selectedInvoice.roomCharges || 0) + (selectedInvoice.serviceCharges || 0)).toLocaleString('ru-RU')} ₽
                        </strong>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}><strong>В т.ч. НДС</strong></TableCell>
                      <TableCell align="right">
                        <strong>
                          {((selectedInvoice.roomTaxAmount || 0) + 
                            selectedInvoice.serviceItems
                              .filter(item => item.paymentStatusName !== 'Отменено')
                              .reduce((sum, item) => sum + (item.taxAmount || 0), 0)
                          ).toLocaleString('ru-RU')} ₽
                        </strong>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}><strong>Оплачено</strong></TableCell>
                      <TableCell align="right">
                        <strong style={{ color: 'green' }}>
                          {((selectedInvoice.paidAmount || 0) + (selectedInvoice.paidServiceCharges || 0)).toLocaleString('ru-RU')} ₽
                        </strong>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}><strong>К доплате</strong></TableCell>
                      <TableCell align="right">
                        <strong style={{ color: ((selectedInvoice.roomCharges || 0) + (selectedInvoice.serviceCharges || 0) - (selectedInvoice.paidAmount || 0) - (selectedInvoice.paidServiceCharges || 0)) > 0 ? 'red' : 'green' }}>
                          {Math.max(0, (selectedInvoice.roomCharges || 0) + (selectedInvoice.serviceCharges || 0) - (selectedInvoice.paidAmount || 0) - (selectedInvoice.paidServiceCharges || 0)).toLocaleString('ru-RU')} ₽
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {selectedInvoice.paymentDate && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Дата оплаты: {new Date(selectedInvoice.paymentDate).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewDialog(false)}>
            Закрыть
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => selectedInvoice && exportToPDFAndPrint(selectedInvoice)}
          >
            Печать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoicesPage;


const calculatePaymentStatus = (invoice: InvoiceDTO): string => {
  const totalAmount = (invoice.roomCharges || 0) + (invoice.serviceCharges || 0);
  const totalPaid = (invoice.paidAmount || 0) + (invoice.paidServiceCharges || 0);
  const isOverdue = new Date() > new Date(invoice.dueDate);
  
  if (totalPaid >= totalAmount) {
    return 'Оплачено';
  } else if (totalPaid > 0) {
    return isOverdue ? 'Просрочено' : 'Частично оплачено';
  } else {
    return isOverdue ? 'Просрочено' : 'Ожидает оплаты';
  }
};

// Функция экспорта в PDF и печати

const exportToPDFAndPrint = (invoice: InvoiceDTO) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const activeServiceItems = invoice.serviceItems.filter(item => item.paymentStatusName !== 'Отменено');
  const totalAmount = (invoice.roomCharges || 0) + (invoice.serviceCharges || 0);
  const totalTax = (invoice.roomTaxAmount || 0) + activeServiceItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const totalPaid = (invoice.paidAmount || 0) + (invoice.paidServiceCharges || 0);
  const remainingAmount = Math.max(0, totalAmount - totalPaid);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Счет #${invoice.stayId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-info { margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .total-row { font-weight: bold; }
        .text-right { text-align: right; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>СЧЕТ #${invoice.stayId}</h1>
        <p>Дата выставления: ${new Date(invoice.issueDate).toLocaleDateString('ru-RU')}</p>
      </div>
      
      <div class="invoice-info">
        <p><strong>Гость:</strong> ${invoice.guestName}</p>
        <p><strong>Номер:</strong> ${invoice.roomNumber}</p>
      </div>
  
      <h3>Проживание</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Описание</th>
            <th>Даты проживания</th>
            <th>Кол-во дней</th>
            <th>Цена за сутки</th>
            <th>Сумма <br>(в т.ч. НДС)</th>
            <th>Оплачено</th>

          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Проживание в номере ${invoice.roomNumber}</td>
            <td>${new Date(invoice.checkInDate).toLocaleDateString('ru-RU')} - ${new Date(invoice.checkOutDate).toLocaleDateString('ru-RU')}</td>
            <td>${invoice.numberOfDays}</td>
            <td class="text-right">${(invoice.dailyRate || 0).toLocaleString('ru-RU')} ₽</td>
            <td class="text-right">${(invoice.roomCharges || 0).toLocaleString('ru-RU')} ₽ (${invoice.roomTaxAmount?.toLocaleString('ru-RU')} ₽)</td>
            <td class="text-center">${invoice.paidAmount?.toLocaleString('ru-RU') } ₽</td>
          </tr>
        </tbody>
      </table>
  
      ${activeServiceItems.length > 0 ? `
      <h3>Услуги</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Название услуги</th>
            <th>Дата</th>
            <th>Кол-во</th>
            <th class="text-right">Цена за ед.</th>
            <th class="text-right">Сумма <br>(в т.ч. НДС)</th>
            <th class="text-center">Оплачено</th>
          </tr>
        </thead>
        <tbody>
          ${activeServiceItems.map(item => `
          <tr>
            <td>${item.serviceName}</td>
            <td>${new Date(item.saleDate).toLocaleDateString('ru-RU')}</td>
            <td>${item.quantity}</td>
            <td class="text-right">${item.unitPrice.toLocaleString('ru-RU')} ₽</td>
            <td class="text-right">${item.totalPrice.toLocaleString('ru-RU')} ₽ <br>(${item.taxAmount?.toLocaleString('ru-RU')} ₽)</td>
            <td class="text-center">${item.paymentStatusName === 'Оплачено' ? item.totalPrice.toLocaleString('ru-RU') + ' ₽' : '0 ₽'}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}
  
      <h3>Итоги</h3>
      <table class="table">
        <tbody>
          <tr>
            <td><strong>Итоговая сумма</strong></td>
            <td class="text-right"><strong>${totalAmount.toLocaleString('ru-RU')} ₽</strong></td>
          </tr>
          <tr>
            <td><strong>В т.ч. НДС</strong></td>
            <td class="text-right"><strong>${totalTax.toLocaleString('ru-RU')} ₽</strong></td>
          </tr>
          <tr>
            <td><strong>Оплачено</strong></td>
            <td class="text-right"><strong style="color: green;">${totalPaid.toLocaleString('ru-RU')} ₽</strong></td>
          </tr>
          <tr>
            <td><strong>К доплате</strong></td>
            <td class="text-right"><strong style="color: ${remainingAmount > 0 ? 'red' : 'green'};">${remainingAmount.toLocaleString('ru-RU')} ₽</strong></td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};