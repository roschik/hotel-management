import { RoomDTO, RoomTypeDTO, AvailableRoomSearchDTO, AvailableRoomResultDTO } from '../types/api';
import { httpClient } from './httpClient';

class RoomService {
  async getRooms(params?: { search?: string; filters?: any }): Promise<RoomDTO[]> {
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
    return httpClient.get<RoomDTO[]>(`/rooms${queryString ? `?${queryString}` : ''}`);
  }

  async createRoom(data: any): Promise<RoomDTO> {
    return httpClient.post<RoomDTO>('/rooms', data);
  }

  async updateRoom(id: string | number, data: any): Promise<RoomDTO> {
    return httpClient.put<RoomDTO>(`/rooms/${id}`, data);
  }

  async deleteRoom(id: string | number): Promise<void> {
    return httpClient.delete<void>(`/rooms/${id}`);
  }

  async getRoomById(id: string): Promise<RoomDTO> {
    return httpClient.get<RoomDTO>(`/rooms/${id}`);
  }

  async getAvailableRooms(startDate: string, endDate: string, capacity?: number, roomType?: string): Promise<RoomDTO[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      ...(capacity && { capacity: capacity.toString() }),
      ...(roomType && { roomType })
    });
    return httpClient.get<RoomDTO[]>(`/rooms/available?${params}`);
  }

  async searchAvailableRooms(searchParams: AvailableRoomSearchDTO): Promise<AvailableRoomResultDTO[]> {
    return httpClient.post<AvailableRoomResultDTO[]>('/rooms/search-available', searchParams);
  }

  async getRoomStatus(id: string): Promise<{ status: string }> {
    return httpClient.get<{ status: string }>(`/rooms/${id}/status`);
  }

  async getRoomsByType(roomType: string): Promise<RoomDTO[]> {
    return httpClient.get<RoomDTO[]>(`/rooms/bytype/${roomType}`);
  }

  async getRoomsByFloor(floor: number): Promise<RoomDTO[]> {
    return httpClient.get<RoomDTO[]>(`/rooms/byfloor/${floor}`);
  }

  // Room Types
  async getRoomTypes(): Promise<RoomTypeDTO[]> {
    return httpClient.get<RoomTypeDTO[]>('/roomtypes');
  }

  async createRoomType(data: { name: string; description?: string }): Promise<RoomTypeDTO> {
    return httpClient.post<RoomTypeDTO>('/roomtypes', data);
  }

  async updateRoomType(id: number, data: { name?: string; description?: string }): Promise<RoomTypeDTO> {
    return httpClient.put<RoomTypeDTO>(`/roomtypes/${id}`, data);
  }

  async deleteRoomType(id: number): Promise<void> {
    return httpClient.delete<void>(`/roomtypes/${id}`);
  }
}

export const roomService = new RoomService();
export default roomService;