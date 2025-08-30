using HotelManagement.Core.DTOs;

namespace HotelManagement.Core.Interfaces.Services
{
    public interface IStayService
    {
        Task<IEnumerable<StayDTO>> GetAllStaysAsync();
        Task<StayDTO> GetStayByIdAsync(int stayId);
        Task<IEnumerable<StayDTO>> GetStaysByGuestIdAsync(int guestId);
        Task<IEnumerable<StayDTO>> GetStaysByRoomIdAsync(int roomId);
        Task<IEnumerable<StayDTO>> GetStaysByBookingIdAsync(int bookingId);
        Task<IEnumerable<StayDTO>> GetActiveStaysAsync();
        Task<IEnumerable<StayDTO>> GetStaysByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<StayDTO> CreateStayAsync(CreateStayDTO createStayDto);
        Task<StayDTO> UpdateStayAsync(int stayId, UpdateStayDTO updateStayDto);
        Task<bool> DeleteStayAsync(int stayId);
        Task<StayGuestDTO> AddGuestToStayAsync(CreateStayGuestDTO createStayGuestDto);
        Task<bool> RemoveGuestFromStayAsync(int stayId, int guestId);
    }
}