using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;

namespace HotelManagement.Core.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IMapper _mapper;

        public EmployeeService(IEmployeeRepository employeeRepository, IMapper mapper)
        {
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<EmployeeDTO>> GetAllEmployeesAsync()
        {
            var employees = await _employeeRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<EmployeeDTO>>(employees);
        }

        public async Task<EmployeeDTO> GetEmployeeByIdAsync(int id)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee == null)
                throw new KeyNotFoundException($"Employee with ID {id} not found.");

            return _mapper.Map<EmployeeDTO>(employee);
        }

        public async Task<EmployeeDTO> CreateEmployeeAsync(CreateEmployeeDTO createEmployeeDTO)
        {
            // Проверка уникальности email и телефона
            if (await _employeeRepository.IsEmailExistsAsync(createEmployeeDTO.Email))
                throw new InvalidOperationException($"Email {createEmployeeDTO.Email} is already registered.");

            if (await _employeeRepository.IsPhoneExistsAsync(createEmployeeDTO.Phone))
                throw new InvalidOperationException($"Phone number {createEmployeeDTO.Phone} is already registered.");

            var employee = _mapper.Map<Employee>(createEmployeeDTO);
            employee.HireDate = DateTime.UtcNow;
            employee.EmployeeStatusId = 1;

            await _employeeRepository.AddAsync(employee);
            await _employeeRepository.SaveChangesAsync();
            return _mapper.Map<EmployeeDTO>(employee);
        }

        public async Task<EmployeeDTO> UpdateEmployeeAsync(int id, UpdateEmployeeDTO updateEmployeeDTO)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee == null)
                throw new KeyNotFoundException($"Employee with ID {id} not found.");

            // Проверка уникальности email и телефона, если они изменились
            if (updateEmployeeDTO.Email != employee.Email &&
                await _employeeRepository.IsEmailExistsAsync(updateEmployeeDTO.Email))
                throw new InvalidOperationException($"Email {updateEmployeeDTO.Email} is already registered.");

            if (updateEmployeeDTO.Phone != employee.Phone &&
                await _employeeRepository.IsPhoneExistsAsync(updateEmployeeDTO.Phone))
                throw new InvalidOperationException($"Phone number {updateEmployeeDTO.Phone} is already registered.");

            _mapper.Map(updateEmployeeDTO, employee);
            await _employeeRepository.UpdateAsync(employee);
            await _employeeRepository.SaveChangesAsync();

            return _mapper.Map<EmployeeDTO>(employee);
        }

        public async Task DeleteEmployeeAsync(int id)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee == null)
                throw new KeyNotFoundException($"Employee with ID {id} not found.");
            await _employeeRepository.DeleteAsync(employee);
            await _employeeRepository.SaveChangesAsync();
        }

        public async Task<IEnumerable<EmployeeDTO>> GetEmployeesByPositionAsync(string position)
        {
            var employees = await _employeeRepository.GetEmployeesByPositionAsync(position);
            return _mapper.Map<IEnumerable<EmployeeDTO>>(employees);
        }

        public async Task<IEnumerable<EmployeeDTO>> GetEmployeesByDepartmentAsync(int departmentId)
        {
            var employees = await _employeeRepository.GetEmployeesByDepartmentAsync(departmentId);
            return _mapper.Map<IEnumerable<EmployeeDTO>>(employees);
        }
    }
}