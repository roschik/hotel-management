import { ServiceDTO } from '../types/api';
import { httpClient } from './httpClient';

class ServiceService {
  async getServices(params?: { search?: string; filters?: any }): Promise<ServiceDTO[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return httpClient.get<ServiceDTO[]>(`/services${queryString ? `?${queryString}` : ''}`);
  }

  async createService(data: any): Promise<ServiceDTO> {
    return httpClient.post<ServiceDTO>('/services', data);
  }

  async updateService(id: string, data: any): Promise<ServiceDTO> {
    return httpClient.put<ServiceDTO>(`/services/${id}`, data);
  }

  async deleteService(id: string): Promise<void> {
    return httpClient.delete<void>(`/services/${id}`);
  }
}

export const serviceService = new ServiceService();
export default serviceService;