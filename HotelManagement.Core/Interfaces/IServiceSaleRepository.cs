using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces
{
    public interface IServiceSaleRepository : IRepository<ServiceSale>
    {
        Task<IEnumerable<ServiceSale>> GetServiceSalesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<ServiceSale>> GetServiceSalesByEmployeeAsync(int employeeId);
        Task<IEnumerable<ServiceSale>> GetServiceSalesByServiceAsync(int serviceId);
        Task<ServiceSale> GetServiceSaleWithDetailsAsync(int id);
        Task<IEnumerable<ServiceSale>> GetAllServiceSalesWithDetailsAsync();
        Task<IEnumerable<ServiceSale>> GetServiceSalesByGuestIdAsync(int guestId);
        Task<IEnumerable<ServiceSale>> GetServiceSalesByStayIdAsync(int stayId);
    }
}