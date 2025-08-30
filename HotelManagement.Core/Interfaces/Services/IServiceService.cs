using HotelManagement.Core.DTOs;

namespace HotelManagement.Core.Interfaces.Services
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceDTO>> GetAllServicesAsync();
        Task<ServiceDTO> GetServiceByIdAsync(int id);
        Task<ServiceDTO> CreateServiceAsync(CreateServiceDTO createServiceDTO);
        Task<ServiceDTO> UpdateServiceAsync(int id, UpdateServiceDTO updateServiceDTO);
        Task DeleteServiceAsync(int id);
        Task<IEnumerable<ServiceDTO>> GetActiveServicesAsync();
        Task<IEnumerable<ServiceDTO>> GetPopularServicesAsync(int count = 5);
    }
}