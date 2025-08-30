using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces
{
    public interface ICitizenshipRepository : IRepository<Citizenship>
    {
        Task<IEnumerable<Citizenship>> GetActiveCitizenshipsAsync();
        Task<Citizenship> GetByCodeAsync(string code);
        Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
    }
}