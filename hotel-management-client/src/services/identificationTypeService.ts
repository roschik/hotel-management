import { IdentificationTypeDTO } from '../types/api';
import { httpClient } from './httpClient';

class IdentificationTypeService {
  async getIdentificationTypes(): Promise<IdentificationTypeDTO[]> {
    return httpClient.get<IdentificationTypeDTO[]>('/identificationtypes');
  }

  async getIdentificationTypeById(id: number): Promise<IdentificationTypeDTO> {
    return httpClient.get<IdentificationTypeDTO>(`/identificationtypes/${id}`);
  }
}

export const identificationTypeService = new IdentificationTypeService();
export default identificationTypeService;