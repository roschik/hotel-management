using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;

namespace HotelManagement.Core.Services
{
    public class CitizenshipService : ICitizenshipService
    {
        private readonly ICitizenshipRepository _citizenshipRepository;
        private readonly IMapper _mapper;

        public CitizenshipService(ICitizenshipRepository citizenshipRepository, IMapper mapper)
        {
            _citizenshipRepository = citizenshipRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CitizenshipDTO>> GetAllCitizenshipsAsync()
        {
            var citizenships = await _citizenshipRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<CitizenshipDTO>>(citizenships);
        }

        public async Task<IEnumerable<CitizenshipDTO>> GetActiveCitizenshipsAsync()
        {
            var citizenships = await _citizenshipRepository.GetActiveCitizenshipsAsync();
            return _mapper.Map<IEnumerable<CitizenshipDTO>>(citizenships);
        }

        public async Task<CitizenshipDTO> GetCitizenshipByIdAsync(int id)
        {
            var citizenship = await _citizenshipRepository.GetByIdAsync(id);
            if (citizenship == null)
                throw new KeyNotFoundException($"Citizenship with ID {id} not found.");
            
            return _mapper.Map<CitizenshipDTO>(citizenship);
        }

        public async Task<CitizenshipDTO> CreateCitizenshipAsync(CreateCitizenshipDTO createCitizenshipDTO)
        {
            // Проверка уникальности кода
            if (!await _citizenshipRepository.IsCodeUniqueAsync(createCitizenshipDTO.Code))
                throw new InvalidOperationException($"Citizenship code {createCitizenshipDTO.Code} already exists.");

            var citizenship = _mapper.Map<Citizenship>(createCitizenshipDTO);
            await _citizenshipRepository.AddAsync(citizenship);
            await _citizenshipRepository.SaveChangesAsync();

            return _mapper.Map<CitizenshipDTO>(citizenship);
        }

        public async Task<CitizenshipDTO> UpdateCitizenshipAsync(int id, UpdateCitizenshipDTO updateCitizenshipDTO)
        {
            var citizenship = await _citizenshipRepository.GetByIdAsync(id);
            if (citizenship == null)
                throw new KeyNotFoundException($"Citizenship with ID {id} not found.");

            // Проверка уникальности кода
            if (!await _citizenshipRepository.IsCodeUniqueAsync(updateCitizenshipDTO.Code, id))
                throw new InvalidOperationException($"Citizenship code {updateCitizenshipDTO.Code} already exists.");

            _mapper.Map(updateCitizenshipDTO, citizenship);
            await _citizenshipRepository.UpdateAsync(citizenship);
            await _citizenshipRepository.SaveChangesAsync();

            return _mapper.Map<CitizenshipDTO>(citizenship);
        }

        public async Task DeleteCitizenshipAsync(int id)
        {
            var citizenship = await _citizenshipRepository.GetByIdAsync(id);
            if (citizenship == null)
                throw new KeyNotFoundException($"Citizenship with ID {id} not found.");

            await _citizenshipRepository.DeleteAsync(citizenship);
            await _citizenshipRepository.SaveChangesAsync();
        }

        public async Task<CitizenshipDTO> GetByCodeAsync(string code)
        {
            var citizenship = await _citizenshipRepository.GetByCodeAsync(code);
            if (citizenship == null)
                throw new KeyNotFoundException($"Citizenship with code {code} not found.");
            
            return _mapper.Map<CitizenshipDTO>(citizenship);
        }
    }
}