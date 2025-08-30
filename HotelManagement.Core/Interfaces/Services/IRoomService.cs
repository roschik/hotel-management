using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces.Services
{
    public interface IRoomService
    {
        Task<IEnumerable<RoomDTO>> GetAllRoomsAsync(string search = null, int? roomTypeId = null, bool? isAvailable = null, int? floor = null, int? capacity = null);
        Task<RoomDTO> GetRoomByIdAsync(int id);
        Task<RoomDTO> CreateRoomAsync(CreateRoomDTO createRoomDTO);
        Task<RoomDTO> UpdateRoomAsync(int id, UpdateRoomDTO updateRoomDTO);
        Task DeleteRoomAsync(int id);
        Task<IEnumerable<RoomDTO>> GetAvailableRoomsAsync(DateTime startDate, DateTime endDate, int? capacity = null, int? roomTypeId = null);
        Task<RoomStatusDTO> GetRoomStatusAsync(int id);
        Task<IEnumerable<RoomDTO>> GetRoomsByTypeAsync(int roomTypeId);
        Task<IEnumerable<RoomDTO>> GetRoomsByFloorAsync(int floor);
        Task<IEnumerable<AvailableRoomDTO>> SearchAvailableRoomsAsync(AvailableRoomSearchDTO searchCriteria);
        Task<DateTime?> GetNextAvailableDate(int roomId);
    }
}