using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories
{
    public class ServiceSaleRepository : Repository<ServiceSale>, IServiceSaleRepository
    {
        public ServiceSaleRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ServiceSale>> GetServiceSalesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.ServiceSales
                .Include(ss => ss.Service)
                .Include(ss => ss.Employee)
                .Include(ss => ss.Guest)
                .Where(ss => ss.SaleDate >= startDate && ss.SaleDate <= endDate)
                .OrderByDescending(ss => ss.SaleDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceSale>> GetServiceSalesByEmployeeAsync(int employeeId)
        {
            return await _context.ServiceSales
                .Include(ss => ss.Service)
                .Include(ss => ss.Employee)
                .Include(ss => ss.Guest)
                .Where(ss => ss.EmployeeId == employeeId)
                .OrderByDescending(ss => ss.SaleDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceSale>> GetServiceSalesByServiceAsync(int serviceId)
        {
            return await _context.ServiceSales
                .Include(ss => ss.Service)
                .Include(ss => ss.Employee)
                .Include(ss => ss.Guest)
                .Where(ss => ss.ServiceId == serviceId)
                .OrderByDescending(ss => ss.SaleDate)
                .ToListAsync();
        }

        public async Task<ServiceSale> GetServiceSaleWithDetailsAsync(int id)
        {
            return await _context.ServiceSales
                .Include(ss => ss.Service)
                .Include(ss => ss.Employee)
                .Include(ss => ss.Guest)
                .FirstOrDefaultAsync(ss => ss.ServiceSaleId == id);
        }

        public async Task<IEnumerable<ServiceSale>> GetAllServiceSalesWithDetailsAsync()
        {
            return await _context.ServiceSales
                .Include(ss => ss.Service)
                .Include(ss => ss.Employee)
                .Include(ss => ss.Guest)
                .Include(ss => ss.PaymentStatus)
                .OrderByDescending(ss => ss.SaleDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceSale>> GetServiceSalesByGuestIdAsync(int guestId)
        {
            return await _context.ServiceSales
                .Include(ss => ss.Service)
                .Include(ss => ss.Employee)
                .Include(ss => ss.Guest)
                .Include(ss => ss.PaymentStatus)
                .Where(ss => ss.GuestId == guestId)
                .OrderByDescending(ss => ss.SaleDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceSale>> GetServiceSalesByStayIdAsync(int stayId)
        {
            return await _context.ServiceSales
                .Include(ss => ss.Service)
                .Include(ss => ss.Employee)
                .Include(ss => ss.Guest)
                .Include(ss => ss.PaymentStatus)
                .Where(ss => ss.StayId == stayId)
                .OrderByDescending(ss => ss.SaleDate)
                .ToListAsync();
        }
    }
}