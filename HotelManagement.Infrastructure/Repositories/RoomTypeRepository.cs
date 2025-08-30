using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace HotelManagement.Infrastructure.Repositories
{
    public class RoomTypeRepository : Repository<RoomType>, IRoomTypeRepository
    {
        public RoomTypeRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<bool> IsNameUniqueAsync(string name, int? excludeId = null)
        {
            var query = _dbSet.Where(rt => rt.Name == name);
            
            if (excludeId.HasValue)
            {
                query = query.Where(rt => rt.Id != excludeId.Value);
            }
            
            return !(await query.AnyAsync());
        }

        public async Task<bool> IsRoomTypeInUseAsync(int roomTypeId)
        {
            return await _context.Rooms.AnyAsync(r => r.RoomTypeId == roomTypeId);
        }
    }
}