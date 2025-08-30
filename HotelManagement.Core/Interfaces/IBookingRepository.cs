using HotelManagement.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Core.Interfaces
{
    public interface IBookingRepository : IRepository<Booking>
    {
        Task<IEnumerable<Booking>> GetBookingsByGuestIdAsync(int guestId);
        Task<IEnumerable<Booking>> GetBookingsByRoomIdAsync(int roomId);
        Task<IEnumerable<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<bool> IsRoomAvailableAsync(int roomId, DateTime startDate, DateTime endDate, int? excludeBookingId = null);
        Task<IEnumerable<Booking>> GetBookingsByEmployeeIdAsync(int employeeId);
    }
}