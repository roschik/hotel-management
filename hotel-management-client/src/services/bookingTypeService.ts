import { BookingTypeDTO } from '../types/api';
import { httpClient } from './httpClient';

class BookingTypeService {
  async getBookingTypes(): Promise<BookingTypeDTO[]> {
    return httpClient.get<BookingTypeDTO[]>('/bookingtypes');
  }

  async getBookingTypeById(id: number): Promise<BookingTypeDTO> {
    return httpClient.get<BookingTypeDTO>(`/bookingtypes/${id}`);
  }
}

export const bookingTypeService = new BookingTypeService();
export default bookingTypeService;