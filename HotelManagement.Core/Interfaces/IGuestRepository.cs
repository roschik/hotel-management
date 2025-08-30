using HotelManagement.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Core.Interfaces
{
    public interface IGuestRepository : IRepository<Guest>
    {
        Task<Guest> GetGuestByEmailAsync(string email);
        Task<Guest> GetGuestByPhoneAsync(string phone);
        Task<IEnumerable<Guest>> SearchGuestsAsync(string searchTerm);
        Task<IEnumerable<Guest>> GetFrequentGuestsAsync(int minBookingsCount);
        Task<bool> IsEmailUniqueAsync(string email, int? excludeGuestId = null);
        Task<bool> IsPhoneUniqueAsync(string phone, int? excludeGuestId = null);
        Task<bool> HasActiveBookingsAsync(int guestId);
        Task LoadBookingsAsync(int guestId);
    }
}