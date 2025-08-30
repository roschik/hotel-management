import { StayDTO, CreateStayDTO, UpdateStayDTO, CreateStayGuestDTO, StayGuestDTO } from '../types/api';
import { apiService } from './apiService';

class StayService {
  // Получить все проживания
  async getStays(): Promise<StayDTO[]> {
    return apiService.get<StayDTO[]>('/stays');
  }

  // Получить проживание по ID
  async getStayById(id: number): Promise<StayDTO> {
    return apiService.get<StayDTO>(`/stays/${id}`);
  }

  // Получить проживания по ID гостя
  async getStaysByGuestId(guestId: number): Promise<StayDTO[]> {
    return apiService.get<StayDTO[]>(`/stays/guest/${guestId}`);
  }

  // Получить проживания по ID номера
  async getStaysByRoomId(roomId: number): Promise<StayDTO[]> {
    return apiService.get<StayDTO[]>(`/stays/room/${roomId}`);
  }

  // Получить проживания по ID бронирования
  async getStaysByBookingId(bookingId: number): Promise<StayDTO[]> {
    return apiService.get<StayDTO[]>(`/stays/booking/${bookingId}`);
  }

  // Получить активные проживания
  async getActiveStays(): Promise<StayDTO[]> {
    return apiService.get<StayDTO[]>('/stays/active');
  }

  // Получить проживания по диапазону дат
  async getStaysByDateRange(startDate: string, endDate: string): Promise<StayDTO[]> {
    return apiService.get<StayDTO[]>(`/stays/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  // Создать новое проживание
  async createStay(stay: CreateStayDTO): Promise<StayDTO> {
    return apiService.post<StayDTO>('/stays', stay);
  }

  // Обновить проживание
  async updateStay(id: number, stay: UpdateStayDTO): Promise<StayDTO> {
    return apiService.put<StayDTO>(`/stays/${id}`, stay);
  }

  // Удалить проживание
  async deleteStay(id: number): Promise<void> {
    return apiService.delete(`/stays/${id}`);
  }

  // Добавить гостя к проживанию
  async addGuestToStay(stayId: number, stayGuest: CreateStayGuestDTO): Promise<StayGuestDTO> {
    return apiService.post<StayGuestDTO>(`/stays/${stayId}/guests`, stayGuest);
  }

  // Удалить гостя из проживания
  async removeGuestFromStay(stayId: number, guestId: number): Promise<void> {
    return apiService.delete(`/stays/${stayId}/guests/${guestId}`);
  }
}

export const stayService = new StayService();
export default stayService;
