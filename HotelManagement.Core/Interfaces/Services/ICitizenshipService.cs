using HotelManagement.Core.DTOs;

namespace HotelManagement.Core.Interfaces.Services
{
    public interface ICitizenshipService
    {
        Task<IEnumerable<CitizenshipDTO>> GetAllCitizenshipsAsync();
        Task<IEnumerable<CitizenshipDTO>> GetActiveCitizenshipsAsync();
        Task<CitizenshipDTO> GetCitizenshipByIdAsync(int id);
        Task<CitizenshipDTO> CreateCitizenshipAsync(CreateCitizenshipDTO createCitizenshipDTO);
        Task<CitizenshipDTO> UpdateCitizenshipAsync(int id, UpdateCitizenshipDTO updateCitizenshipDTO);
        Task DeleteCitizenshipAsync(int id);
        Task<CitizenshipDTO> GetByCodeAsync(string code);
    }
}