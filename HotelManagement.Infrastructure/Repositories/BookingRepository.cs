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
    public class BookingRepository : Repository<Booking>, IBookingRepository
    {
        public BookingRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Booking>> GetAllAsync()
        {
            return await _dbSet
                .Include(b => b.Guest)
                .Include(b => b.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(b => b.BookingType)
                .Include(b => b.BookingStatus)
                .Include(b => b.Employee) 
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }
        
        public override async Task<Booking> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(b => b.Guest)
                .Include(b => b.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(b => b.BookingType)
                .Include(b => b.BookingStatus)
                .Include(b => b.Employee)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Booking>> GetBookingsByGuestIdAsync(int guestId)
        {
            return await _dbSet
                .Include(b => b.Room)
                .Include(b => b.Guest)
                .Include(b => b.BookingType)
                .Include(b => b.Employee)
                .Where(b => b.GuestId == guestId)
                .OrderByDescending(b => b.CheckInDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByRoomIdAsync(int roomId)
        {
            return await _dbSet
                .Include(b => b.Room)
                .Include(b => b.Guest)
                .Include(b => b.BookingType)
                .Include(b => b.Employee)
                .Where(b => b.RoomId == roomId)
                .OrderByDescending(b => b.CheckInDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Include(b => b.Room)
                .Include(b => b.Guest)
                .Include(b => b.BookingType)
                .Include(b => b.Employee)
                .Where(b => (b.CheckInDate <= endDate && b.CheckOutDate >= startDate))
                .OrderBy(b => b.CheckInDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByEmployeeIdAsync(int employeeId)
        {
            return await _dbSet
                .Include(b => b.Room)
                .Include(b => b.Guest)
                .Include(b => b.BookingType)
                .Include(b => b.Employee)
                .Where(b => b.EmployeeId == employeeId)
                .OrderByDescending(b => b.CheckInDate)
                .ToListAsync();
        }

        public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime startDate, DateTime endDate, int? excludeBookingId = null)
        {
            var query = _dbSet.Where(b =>
                b.RoomId == roomId &&
                b.BookingStatusId != 3 &&
                (b.CheckInDate < endDate && b.CheckOutDate > startDate));

            if (excludeBookingId.HasValue)
            {
                query = query.Where(b => b.Id != excludeBookingId.Value);
            }

            return !(await query.AnyAsync());
        }
    }
}