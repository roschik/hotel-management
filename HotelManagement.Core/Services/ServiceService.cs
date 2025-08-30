using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;

namespace HotelManagement.Core.Services
{
    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IMapper _mapper;

        public ServiceService(
            IServiceRepository serviceRepository,
            IBookingRepository bookingRepository,
            IMapper mapper)
        {
            _serviceRepository = serviceRepository;
            _bookingRepository = bookingRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ServiceDTO>> GetAllServicesAsync()
        {
            var services = await _serviceRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<ServiceDTO>>(services);
        }

        public async Task<ServiceDTO> GetServiceByIdAsync(int id)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service == null)
                throw new KeyNotFoundException($"Service with ID {id} not found.");

            return _mapper.Map<ServiceDTO>(service);
        }

        public async Task<ServiceDTO> CreateServiceAsync(CreateServiceDTO createServiceDTO)
        {
            // Проверка уникальности названия услуги
            if (await _serviceRepository.IsServiceNameExistsAsync(createServiceDTO.Name))
                throw new InvalidOperationException($"Service with name '{createServiceDTO.Name}' already exists.");

            var service = _mapper.Map<Service>(createServiceDTO);
            await _serviceRepository.AddAsync(service);
            await _serviceRepository.SaveChangesAsync(); 

            return _mapper.Map<ServiceDTO>(service);
        }

        public async Task<ServiceDTO> UpdateServiceAsync(int id, UpdateServiceDTO updateServiceDTO)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service == null)
                throw new KeyNotFoundException($"Service with ID {id} not found.");

            // Проверка уникальности названия услуги, если оно изменилось
            if (updateServiceDTO.Name != service.Name &&
                await _serviceRepository.IsServiceNameExistsAsync(updateServiceDTO.Name))
                throw new InvalidOperationException($"Service with name '{updateServiceDTO.Name}' already exists.");

            _mapper.Map(updateServiceDTO, service);
            await _serviceRepository.UpdateAsync(service);
            await _serviceRepository.SaveChangesAsync(); 

            return _mapper.Map<ServiceDTO>(service);
        }

        public async Task DeleteServiceAsync(int id)
        {
            var service = await _serviceRepository.GetByIdAsync(id);
            if (service == null)
                throw new KeyNotFoundException($"Service with ID {id} not found.");

            // Проверка, что услуга не используется в активных бронированиях
            if (await _serviceRepository.IsServiceInUseAsync(id))
                throw new InvalidOperationException($"Cannot delete service with ID {id} as it is currently in use.");

            await _serviceRepository.DeleteAsync(service);
            await _serviceRepository.SaveChangesAsync(); 
        }

        public async Task<IEnumerable<ServiceDTO>> GetActiveServicesAsync()
        {
            var services = await _serviceRepository.GetActiveServicesAsync();
            return _mapper.Map<IEnumerable<ServiceDTO>>(services);
        }

        public async Task<IEnumerable<ServiceDTO>> GetPopularServicesAsync(int count = 5)
        {
            var services = await _serviceRepository.GetPopularServicesAsync(count);
            return _mapper.Map<IEnumerable<ServiceDTO>>(services);
        }
    }
}