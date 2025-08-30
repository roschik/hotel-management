import { InvoiceDTO, UpdatePaymentDTO } from '../types/api';
import { apiService } from './apiService';

class InvoiceService {
  // Получить все счета
  async getAllInvoices(): Promise<InvoiceDTO[]> {
    return apiService.get<InvoiceDTO[]>('/invoices');
  }

  // Получить счет по ID проживания
  async getInvoiceByStayId(stayId: number): Promise<InvoiceDTO> {
    return apiService.get<InvoiceDTO>(`/invoices/stay/${stayId}`);
  }

  // Получить счета по ID бронирования
  async getInvoicesByBookingId(bookingId: number): Promise<InvoiceDTO[]> {
    return apiService.get<InvoiceDTO[]>(`/invoices/booking/${bookingId}`);
  }

  // Получить счета по ID гостя
  async getInvoicesByGuestId(guestId: number): Promise<InvoiceDTO[]> {
    return apiService.get<InvoiceDTO[]>(`/invoices/guest/${guestId}`);
  }

  // Получить неоплаченные счета
  async getUnpaidInvoices(): Promise<InvoiceDTO[]> {
    return apiService.get<InvoiceDTO[]>('/invoices/unpaid');
  }

  // Обновить платеж
  async updatePayment(stayId: number, paymentData: UpdatePaymentDTO): Promise<InvoiceDTO> {
    return apiService.put<InvoiceDTO>(`/invoices/payment/${stayId}`, paymentData);
  }

  // Получить общую выручку
  async getTotalRevenue(startDate: string, endDate: string): Promise<number> {
    return apiService.get<number>(`/invoices/revenue?startDate=${startDate}&endDate=${endDate}`);
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;