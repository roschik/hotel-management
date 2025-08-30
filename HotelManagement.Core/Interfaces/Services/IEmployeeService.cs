using HotelManagement.Core.DTOs;

namespace HotelManagement.Core.Interfaces.Services
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeeDTO>> GetAllEmployeesAsync();
        Task<EmployeeDTO> GetEmployeeByIdAsync(int id);
        Task<EmployeeDTO> CreateEmployeeAsync(CreateEmployeeDTO createEmployeeDTO);
        Task<EmployeeDTO> UpdateEmployeeAsync(int id, UpdateEmployeeDTO updateEmployeeDTO);
        Task DeleteEmployeeAsync(int id);
        Task<IEnumerable<EmployeeDTO>> GetEmployeesByPositionAsync(string position);
        Task<IEnumerable<EmployeeDTO>> GetEmployeesByDepartmentAsync(int departmentId);
    }
}