import { BookingDTO, QuickBookingDTO, AddServiceToBookingDTO, AvailableRoomSearchDTO, AvailableRoomResultDTO, NextAvailableDateDTO } from '../types/api';
import { httpClient } from './httpClient';

class BookingService {
  async getBookings(params?: { search?: string; filters?: any }): Promise<BookingDTO[]> {
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
    return httpClient.get<BookingDTO[]>(`/bookings${queryString ? `?${queryString}` : ''}`);
  }

  async createBooking(data: any): Promise<BookingDTO> {
    return httpClient.post<BookingDTO>('/bookings', data);
  }

  async updateBooking(id: string, data: any): Promise<BookingDTO> {
    return httpClient.put<BookingDTO>(`/bookings/${id}`, data);
  }

  async deleteBooking(id: string): Promise<void> {
    return httpClient.delete<void>(`/bookings/${id}`);
  }

  async addServiceToBooking(bookingId: number, data: AddServiceToBookingDTO): Promise<void> {
    return httpClient.post<void>(`/bookings/${bookingId}/services`, data);
  }

  async createQuickBooking(data: QuickBookingDTO): Promise<BookingDTO> {
    return httpClient.post<BookingDTO>('/bookings/quick', data);
  }


}

export const bookingService = new BookingService();
export default bookingService;