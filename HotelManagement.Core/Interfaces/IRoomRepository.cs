using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Core.Interfaces
{
    public interface IRoomRepository : IRepository<Room>
    {
        Task<IEnumerable<Room>> GetRoomsByFloorAsync(int floor);
        Task<IEnumerable<Room>> GetRoomsByTypeAsync(int roomTypeId);
        Task<bool> IsRoomNumberUniqueAsync(string roomNumber, int? excludeRoomId = null);
        Task<bool> IsRoomNumberExistsAsync(string roomNumber);
        Task<bool> IsRoomInUseAsync(int roomId);
        Task<RoomStatusDTO> GetRoomStatusAsync(int roomId);
        Task<IEnumerable<AvailableRoomDTO>> SearchAvailableRoomsAsync(AvailableRoomSearchDTO searchCriteria);
        Task<DateTime?> GetNextAvailableDate(int roomId);
        Task<IEnumerable<Room>> GetAvailableRoomsAsync(DateTime startDate, DateTime endDate, int? capacity = null, int? roomTypeId = null);
    }
}