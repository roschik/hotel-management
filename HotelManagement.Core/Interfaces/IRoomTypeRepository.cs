using HotelManagement.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Core.Interfaces
{
    public interface IRoomTypeRepository : IRepository<RoomType>
    {
        Task<bool> IsNameUniqueAsync(string name, int? excludeId = null);
        Task<bool> IsRoomTypeInUseAsync(int roomTypeId);
    }
}