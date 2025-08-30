using HotelManagement.Core.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Core.Interfaces.Services
{
    public interface IRoomTypeService
    {
        Task<IEnumerable<RoomTypeDTO>> GetAllRoomTypesAsync();
        Task<RoomTypeDTO> GetRoomTypeByIdAsync(int id);
        Task<RoomTypeDTO> CreateRoomTypeAsync(CreateRoomTypeDTO createRoomTypeDTO);
        Task<RoomTypeDTO> UpdateRoomTypeAsync(int id, UpdateRoomTypeDTO updateRoomTypeDTO);
        Task DeleteRoomTypeAsync(int id);
    }
}