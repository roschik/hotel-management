using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HotelManagement.Infrastructure.Repositories
{
    public class ServiceRepository : Repository<Service>, IServiceRepository
    {
        public ServiceRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Service>> GetActiveServicesAsync()
        {
            return await _dbSet
                .Where(s => s.IsActive)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Service>> GetPopularServicesAsync(int limit)
        {
            // Получаем популярные услуги на основе количества заказов
            return await _context.ServiceSales
                .GroupBy(bs => bs.ServiceId)
                .Select(g => new { ServiceId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(limit)
                .Join(_dbSet, x => x.ServiceId, s => s.ServiceId, (x, s) => s)
                .ToListAsync();
        }

        public async Task<bool> IsServiceNameExistsAsync(string name)
        {
            return await _dbSet.AnyAsync(s => s.Name == name);
        }

        public async Task<bool> IsServiceInUseAsync(int serviceId)
        {
            // Проверяем, используется ли услуга в активных бронированиях
            return await _context.ServiceSales
                .Where(bs => bs.ServiceId == serviceId)
                .AnyAsync();
        }
    }
}