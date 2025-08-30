using HotelManagement.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Core.Interfaces
{
    public interface IServiceRepository : IRepository<Service>
    {
        Task<IEnumerable<Service>> GetActiveServicesAsync();
        Task<IEnumerable<Service>> GetPopularServicesAsync(int limit);
        Task<bool> IsServiceNameExistsAsync(string name);
        Task<bool> IsServiceInUseAsync(int serviceId);
    }
}