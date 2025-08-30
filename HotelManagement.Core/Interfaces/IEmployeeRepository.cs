using HotelManagement.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Core.Interfaces
{
    public interface IEmployeeRepository : IRepository<Employee>
    {
        Task<IEnumerable<Employee>> GetEmployeesByPositionAsync(string position);
        Task<IEnumerable<Employee>> GetEmployeesByDepartmentAsync(int departmentId);
        Task<bool> IsEmailExistsAsync(string email);
        Task<bool> IsPhoneExistsAsync(string phone);
    }
}
