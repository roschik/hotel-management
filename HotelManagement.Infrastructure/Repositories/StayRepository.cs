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
    public class StayRepository : Repository<Stay>, IStayRepository
    {
        public StayRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Stay>> GetStaysByGuestIdAsync(int guestId)
        {
            return await _dbSet
                .Include(s => s.Booking.Room)
                .Include(s => s.Booking)
                .Include(s => s.StayGuests)
                    .ThenInclude(sg => sg.Guest)
                .Where(s => s.StayGuests.Any(sg => sg.GuestId == guestId))
                .OrderByDescending(s => s.ActualCheckInDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Stay>> GetStaysByRoomIdAsync(int roomId)
        {
            return await _dbSet
                .Include(s => s.Booking.Room)
                .Include(s => s.Booking)
                .Include(s => s.StayGuests)
                    .ThenInclude(sg => sg.Guest)
                .Where(s => s.Booking.RoomId == roomId)
                .OrderByDescending(s => s.ActualCheckInDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Stay>> GetStaysByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Include(s => s.Booking.Room)
                .Include(s => s.Booking)
                .Include(s => s.StayGuests)
                    .ThenInclude(sg => sg.Guest)
                .Where(s => (s.ActualCheckInDate <= endDate && s.ActualCheckOutDate >= startDate))
                .OrderBy(s => s.ActualCheckInDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Stay>> GetActiveStaysAsync()
        {
            var today = DateTime.Today;
            return await _dbSet
                .Include(s => s.Booking.Room)
                .Include(s => s.Booking)
                .Include(s => s.StayGuests)
                    .ThenInclude(sg => sg.Guest)
                .Where(s => s.ActualCheckInDate <= today && s.ActualCheckOutDate >= today)
                .OrderBy(s => s.ActualCheckInDate)
                .ToListAsync();
        }

        public async Task<Stay> GetStayWithGuestsAsync(int stayId)
        {
            return await _dbSet
                .Include(s => s.Booking.Room)
                .Include(s => s.Booking)
                .Include(s => s.StayGuests)
                    .ThenInclude(sg => sg.Guest)
                .FirstOrDefaultAsync(s => s.StayId == stayId);
        }

        public async Task<IEnumerable<Stay>> GetStaysByBookingIdAsync(int bookingId)
        {
            return await _dbSet
                .Include(s => s.Booking.Room)
                .Include(s => s.Booking)
                .Include(s => s.StayGuests)
                    .ThenInclude(sg => sg.Guest)
                .Where(s => s.BookingId == bookingId)
                .OrderBy(s => s.ActualCheckInDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Stay>> GetStaysByPaymentStatusAsync(int paymentStatusId)
        {
            return await _dbSet
                .Include(s => s.Booking.Room)
                .Include(s => s.Booking)
                .Include(s => s.StayGuests)
                    .ThenInclude(sg => sg.Guest)
                .Where(s => s.PaymentStatusId == paymentStatusId)
                .OrderByDescending(s => s.ActualCheckInDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Stay>> GetPaidStaysByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Include(s => s.Booking.Room)
                .Include(s => s.Booking)
                .Include(s => s.StayGuests)
                    .ThenInclude(sg => sg.Guest)
                .Where(s => s.PaymentStatusId == 3 && 
                           s.ActualCheckInDate >= startDate && 
                           s.ActualCheckInDate <= endDate)
                .OrderBy(s => s.ActualCheckInDate)
                .ToListAsync();
        }

        public async Task<Stay> GetStayWithDetailsAsync(int stayId)
        {
            return await _dbSet
                .Include(s => s.Booking.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(s => s.Booking)
                .Include(s => s.StayGuests)
                    .ThenInclude(sg => sg.Guest)
                .FirstOrDefaultAsync(s => s.StayId == stayId);
        }

        public async Task<IEnumerable<Stay>> GetAllStaysWithDetailsAsync()
        {
            return await _dbSet
                .Include(s => s.Booking)
                    .ThenInclude(b => b.Room)
                .Include(s => s.Booking)
                    .ThenInclude(b => b.Guest)
                .Include(s => s.StayGuests)
                    .ThenInclude(sg => sg.Guest)
                .Include(s => s.PaymentStatus)
                .OrderByDescending(s => s.ActualCheckInDate)
                .ToListAsync();
        }
    }
}