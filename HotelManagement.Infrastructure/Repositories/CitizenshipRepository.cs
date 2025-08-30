using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories
{
    public class CitizenshipRepository : Repository<Citizenship>, ICitizenshipRepository
    {
        public CitizenshipRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Citizenship>> GetActiveCitizenshipsAsync()
        {
            return await _dbSet
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Citizenship> GetByCodeAsync(string code)
        {
            return await _dbSet
                .FirstOrDefaultAsync(c => c.Code == code);
        }

        public async Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null)
        {
            var query = _dbSet.Where(c => c.Code == code);
            
            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }
            
            return !await query.AnyAsync();
        }
    }
}