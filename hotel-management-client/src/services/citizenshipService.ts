import { CitizenshipDTO, CreateCitizenshipDTO, UpdateCitizenshipDTO } from '../types/api';
import { httpClient } from './httpClient';

class CitizenshipService {
  async getCitizenships(): Promise<CitizenshipDTO[]> {
    return httpClient.get<CitizenshipDTO[]>('/citizenships');
  }

  async getActiveCitizenships(): Promise<CitizenshipDTO[]> {
    return httpClient.get<CitizenshipDTO[]>('/citizenships/active');
  }

  async getCitizenshipById(id: number): Promise<CitizenshipDTO> {
    return httpClient.get<CitizenshipDTO>(`/citizenships/${id}`);
  }

  async createCitizenship(data: CreateCitizenshipDTO): Promise<CitizenshipDTO> {
    return httpClient.post<CitizenshipDTO>('/citizenships', data);
  }

  async updateCitizenship(id: number, data: UpdateCitizenshipDTO): Promise<CitizenshipDTO> {
    return httpClient.put<CitizenshipDTO>(`/citizenships/${id}`, data);
  }

  async deleteCitizenship(id: number): Promise<void> {
    return httpClient.delete<void>(`/citizenships/${id}`);
  }

  async getCitizenshipByCode(code: string): Promise<CitizenshipDTO> {
    return httpClient.get<CitizenshipDTO>(`/citizenships/code/${code}`);
  }
}

export const citizenshipService = new CitizenshipService();
export default citizenshipService;