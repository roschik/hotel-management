using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HotelManagement.Infrastructure.Repositories
{
    public class GuestRepository : Repository<Guest>, IGuestRepository
    {
        public GuestRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task LoadBookingsAsync(int guestId)
        {
            var guest = await _context.Guests
                .Include(g => g.Bookings)
                .FirstOrDefaultAsync(g => g.GuestId == guestId);
        }

        public override async Task<IEnumerable<Guest>> GetAllAsync()
        {
            return await _context.Guests
                .Include(g => g.IdentificationType)
                .Include(g => g.Citizenship)
                .Include(g => g.Bookings) 
                .ToListAsync();
        }

        public override async Task<Guest> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(g => g.Citizenship)
                .Include(g => g.IdentificationType)
                .FirstOrDefaultAsync(g => g.GuestId == id);
        }

        public async Task<Guest> GetGuestByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(g => g.Email == email);
        }

        public async Task<Guest> GetGuestByPhoneAsync(string phone)
        {
            return await _dbSet
                .FirstOrDefaultAsync(g => g.Phone == phone);
        }

        public async Task<IEnumerable<Guest>> SearchGuestsAsync(string searchTerm)
        {
            return await _dbSet
                .Include(g => g.Citizenship)
                .Include(g => g.IdentificationType)
                .Where(g => g.FirstName.Contains(searchTerm) ||
                           g.LastName.Contains(searchTerm) ||
                           g.Email.Contains(searchTerm) ||
                           g.Phone.Contains(searchTerm))
                .OrderBy(g => g.LastName)
                .ThenBy(g => g.FirstName)
                .ToListAsync();
        }

        public async Task<IEnumerable<Guest>> GetFrequentGuestsAsync(int minBookingsCount)
        {
            var frequentGuestIds = await _context.Bookings
                .GroupBy(b => b.GuestId)
                .Where(g => g.Count() >= minBookingsCount)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .ToListAsync();

            return await _dbSet
                .Include(g => g.Citizenship)
                .Include(g => g.IdentificationType)
                .Where(g => frequentGuestIds.Contains(g.GuestId))
                .ToListAsync();
        }

        public async Task<bool> IsEmailUniqueAsync(string email, int? excludeGuestId = null)
        {
            var query = _dbSet.Where(g => g.Email == email);

            if (excludeGuestId.HasValue)
            {
                query = query.Where(g => g.GuestId != excludeGuestId.Value);
            }

            return !(await query.AnyAsync());
        }

        public async Task<bool> IsPhoneUniqueAsync(string phone, int? excludeGuestId = null)
        {
            var query = _dbSet.Where(g => g.Phone == phone);

            if (excludeGuestId.HasValue)
            {
                query = query.Where(g => g.GuestId != excludeGuestId.Value);
            }

            return !(await query.AnyAsync());
        }

        public async Task<bool> HasActiveBookingsAsync(int guestId)
        {
            return await _context.Bookings
                .AnyAsync(b => b.GuestId == guestId &&
                              (b.BookingStatusId == 1 || b.BookingStatusId == 2) &&
                              b.CheckOutDate > DateTime.UtcNow);
        }
    }
}