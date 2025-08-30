import { httpClient } from './httpClient';
import { EmployeeDTO, CreateEmployeeDTO, UpdateEmployeeDTO, DepartmentDTO, EmployeeStatusDTO } from '../types/api';

class StaffService {
  async getStaff(): Promise<EmployeeDTO[]> {
    return httpClient.get<EmployeeDTO[]>(`/employees/`);
  }

  async createStaff(data: CreateEmployeeDTO): Promise<EmployeeDTO> {
    return httpClient.post<EmployeeDTO>('/employees', data);
  }

  async updateStaff(id: string, data: UpdateEmployeeDTO): Promise<EmployeeDTO> {
    return httpClient.put<EmployeeDTO>(`/employees/${id}`, data);
  }

  async deleteStaff(id: string): Promise<void> {
    await httpClient.delete(`/employees/${id}`);
  }

  async getDepartments(): Promise<DepartmentDTO[]> {
    return httpClient.get<DepartmentDTO[]>(`/departments/`);
  }

  async getEmployeeStatuses(): Promise<EmployeeStatusDTO[]> {
    return httpClient.get<EmployeeStatusDTO[]>(`/employeestatuses/`);
  }
}

export const staffService = new StaffService();
export default staffService;