using HotelManagement.Core.DTOs;

namespace HotelManagement.Core.Interfaces.Services
{
    public interface IGuestService
    {
        Task<IEnumerable<GuestDTO>> GetAllGuestsAsync();
        Task<GuestDTO> GetGuestByIdAsync(int id);
        Task<GuestDTO> CreateGuestAsync(CreateGuestDTO createGuestDTO);
        Task<GuestDTO> UpdateGuestAsync(int id, UpdateGuestDTO updateGuestDTO);
        Task DeleteGuestAsync(int id);
        Task<IEnumerable<GuestDTO>> SearchGuestsAsync(string searchTerm);
        Task<bool> IsEmailUniqueAsync(string email, int? excludeGuestId = null);
        Task<bool> IsPhoneUniqueAsync(string phone, int? excludeGuestId = null);
        Task<IEnumerable<GuestDTO>> GetFrequentGuestsAsync(int count = 10);
        Task<GuestDTO> CreateQuickGuestAsync(CreateGuestDTO createGuestDTO);
    }
}