import { ServiceSaleDTO, CreateServiceSaleDTO } from '../types/api';
import { httpClient } from './httpClient';

class ServiceSaleService {
  async getServiceSales(): Promise<ServiceSaleDTO[]> {
    return httpClient.get<ServiceSaleDTO[]>('/servicesales');
  }

  async getServiceSale(id: number): Promise<ServiceSaleDTO> {
    return httpClient.get<ServiceSaleDTO>(`/servicesales/${id}`);
  }

  async createServiceSale(serviceSale: CreateServiceSaleDTO): Promise<ServiceSaleDTO> {
    return httpClient.post<ServiceSaleDTO>('/servicesales', serviceSale);
  }

  async updateServiceSale(id: number, serviceSale: CreateServiceSaleDTO): Promise<ServiceSaleDTO> {
    return httpClient.put<ServiceSaleDTO>(`/servicesales/${id}`, serviceSale);
  }

  async deleteServiceSale(id: number): Promise<void> {
    return httpClient.delete<void>(`/servicesales/${id}`);
  }

  async getServiceSalesByDateRange(startDate: string, endDate: string): Promise<ServiceSaleDTO[]> {
    const params = new URLSearchParams({ startDate, endDate });
    return httpClient.get<ServiceSaleDTO[]>(`/servicesales/by-date-range?${params}`);
  }

  async getServiceSalesByEmployee(employeeId: number): Promise<ServiceSaleDTO[]> {
    return httpClient.get<ServiceSaleDTO[]>(`/servicesales/by-employee/${employeeId}`);
  }

  async getTotalSalesRevenue(startDate?: string, endDate?: string): Promise<number> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return httpClient.get<number>(`/servicesales/total-revenue${queryString ? `?${queryString}` : ''}`);
  }
}

export const serviceSaleService = new ServiceSaleService();
export default serviceSaleService;