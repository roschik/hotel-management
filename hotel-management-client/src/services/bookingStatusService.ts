import { BookingStatusDTO } from '../types/api';
import { httpClient } from './httpClient';

class BookingStatusService {
  async getBookingStatuses(): Promise<BookingStatusDTO[]> {
    return httpClient.get<BookingStatusDTO[]>('/bookingstatuses');
  }

  async getBookingStatusById(id: number): Promise<BookingStatusDTO> {
    return httpClient.get<BookingStatusDTO>(`/bookingstatuses/${id}`);
  }
}

export const bookingStatusService = new BookingStatusService();
export default bookingStatusService;