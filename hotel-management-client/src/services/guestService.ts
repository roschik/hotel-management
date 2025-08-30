import { GuestDTO, QuickGuestDTO } from '../types/api';
import { httpClient } from './httpClient';

class GuestService {
  async getGuests(params?: { search?: string; filters?: any }): Promise<GuestDTO[]> {
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
    return httpClient.get<GuestDTO[]>(`/guests${queryString ? `?${queryString}` : ''}`);
  }

  async createGuest(data: any): Promise<GuestDTO> {
    return httpClient.post<GuestDTO>('/guests', data);
  }

  async updateGuest(id: string | number, data: any): Promise<GuestDTO> {
    return httpClient.put<GuestDTO>(`/guests/${id}`, data);
  }

  async deleteGuest(id: string | number): Promise<void> {
    return httpClient.delete<void>(`/guests/${id}`);
  }

  async createQuickGuest(data: QuickGuestDTO): Promise<GuestDTO> {
    return httpClient.post<GuestDTO>('/guests/quick', data);
  }
}

export const guestService = new GuestService();
export default guestService;