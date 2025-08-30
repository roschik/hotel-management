using HotelManagement.Core.DTOs;

namespace HotelManagement.Core.Interfaces.Services
{
    public interface IInvoiceService
    {
        Task<IEnumerable<InvoiceDTO>> GetAllInvoicesAsync();
        Task<InvoiceDTO> GetInvoiceByStayIdAsync(int stayId);
        Task<IEnumerable<InvoiceDTO>> GetInvoicesByBookingIdAsync(int bookingId);
        Task<IEnumerable<InvoiceDTO>> GetInvoicesByGuestIdAsync(int guestId);
        Task<IEnumerable<InvoiceDTO>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<InvoiceDTO>> GetUnpaidInvoicesAsync();
        Task<decimal> GetTotalRevenueAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<InvoiceDTO>> GetPaidInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<InvoiceDTO> UpdatePaymentAsync(int stayId, UpdatePaymentDTO updatePaymentDTO);
    }
}