using HotelManagement.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Core.Interfaces
{
    public interface IStayRepository : IRepository<Stay>
    {
        Task<IEnumerable<Stay>> GetStaysByBookingIdAsync(int bookingId);
        Task<IEnumerable<Stay>> GetStaysByGuestIdAsync(int guestId);
        Task<IEnumerable<Stay>> GetStaysByPaymentStatusAsync(int paymentStatusId);
        Task<IEnumerable<Stay>> GetPaidStaysByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Stay>> GetActiveStaysAsync();
        Task<Stay> GetStayWithDetailsAsync(int stayId);
        Task<IEnumerable<Stay>> GetStaysByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Stay>> GetStaysByRoomIdAsync(int roomId);
        Task<Stay> GetStayWithGuestsAsync(int stayId);
        Task<IEnumerable<Stay>> GetAllStaysWithDetailsAsync();
    }
}