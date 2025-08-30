using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HotelManagement.Infrastructure.Repositories
{
    public class EmployeeRepository : Repository<Employee>, IEmployeeRepository
    {
        public EmployeeRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Employee>> GetAllAsync()
        {
            return await _dbSet
                .Include(e => e.Department)
                .Include(e => e.EmployeeStatus)
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToListAsync();
        }

        public override async Task<Employee> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(e => e.Department)
                .Include(e => e.EmployeeStatus)
                .FirstOrDefaultAsync(e => e.EmployeeId == id);
        }

        public async Task<IEnumerable<Employee>> GetEmployeesByPositionAsync(string position)
        {
            return await _dbSet
                .Include(e => e.Department)
                .Include(e => e.EmployeeStatus)
                .Where(e => e.Position == position)
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToListAsync();
        }

        public async Task<IEnumerable<Employee>> GetEmployeesByDepartmentAsync(int departmentId)
        {
            return await _dbSet
                .Include(e => e.Department)
                .Include(e => e.EmployeeStatus)
                .Where(e => e.DepartmentId == departmentId)
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToListAsync();
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _dbSet.AnyAsync(e => e.Email == email);
        }

        public async Task<bool> IsPhoneExistsAsync(string phone)
        {
            return await _dbSet.AnyAsync(e => e.Phone == phone);
        }
    }
}
