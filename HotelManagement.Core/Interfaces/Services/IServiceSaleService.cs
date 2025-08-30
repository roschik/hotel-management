using HotelManagement.Core.DTOs;

namespace HotelManagement.Core.Interfaces.Services
{
    public interface IServiceSaleService
    {
        Task<IEnumerable<ServiceSaleDTO>> GetAllServiceSalesAsync();
        Task<ServiceSaleDTO> GetServiceSaleByIdAsync(int id);
        Task<ServiceSaleDTO> CreateServiceSaleAsync(CreateServiceSaleDTO createServiceSaleDTO);
        Task<ServiceSaleDTO> UpdateServiceSaleAsync(int id, CreateServiceSaleDTO updateServiceSaleDTO);
        Task DeleteServiceSaleAsync(int id);
        Task<IEnumerable<ServiceSaleDTO>> GetServiceSalesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<ServiceSaleDTO>> GetServiceSalesByEmployeeAsync(int employeeId);
        Task<IEnumerable<ServiceSaleDTO>> GetServiceSalesByServiceAsync(int serviceId);
        Task<decimal> GetTotalSalesRevenueAsync(DateTime? startDate = null, DateTime? endDate = null);
    }
}