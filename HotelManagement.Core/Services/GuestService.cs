using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;

namespace HotelManagement.Core.Services
{
    public class GuestService : IGuestService
    {
        private readonly IGuestRepository _guestRepository;
        private readonly IMapper _mapper;

        public GuestService(IGuestRepository guestRepository, IMapper mapper)
        {
            _guestRepository = guestRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<GuestDTO>> GetAllGuestsAsync()
        {
            var guests = await _guestRepository.GetAllAsync();
            
            foreach (var guest in guests)
            {
                await _guestRepository.LoadBookingsAsync(guest.GuestId);
            }
            return _mapper.Map<IEnumerable<GuestDTO>>(guests);
        }

        public async Task<GuestDTO> GetGuestByIdAsync(int id)
        {
            var guest = await _guestRepository.GetByIdAsync(id);
            if (guest == null)
                throw new KeyNotFoundException($"Guest with ID {id} not found.");

            return _mapper.Map<GuestDTO>(guest);
        }

        public async Task<GuestDTO> CreateGuestAsync(CreateGuestDTO createGuestDTO)
        {
            // Проверка уникальности email, если указан
            if (!string.IsNullOrEmpty(createGuestDTO.Email) && 
                !await _guestRepository.IsEmailUniqueAsync(createGuestDTO.Email))
                throw new InvalidOperationException($"Email {createGuestDTO.Email} already exists.");

            // Проверка уникальности телефона
            if (!await _guestRepository.IsPhoneUniqueAsync(createGuestDTO.Phone))
                throw new InvalidOperationException($"Phone {createGuestDTO.Phone} already exists.");

            var guest = _mapper.Map<Guest>(createGuestDTO);

            if (guest.DateOfBirth.HasValue && guest.DateOfBirth.Value.Kind == DateTimeKind.Unspecified)
                guest.DateOfBirth = DateTime.SpecifyKind(guest.DateOfBirth.Value, DateTimeKind.Utc);
            
            if (guest.IdentificationIssuedDate.HasValue && guest.IdentificationIssuedDate.Value.Kind == DateTimeKind.Unspecified)
                guest.IdentificationIssuedDate = DateTime.SpecifyKind(guest.IdentificationIssuedDate.Value, DateTimeKind.Utc);
            
            if (guest.RegistrationDate.HasValue && guest.RegistrationDate.Value.Kind == DateTimeKind.Unspecified)
                guest.RegistrationDate = DateTime.SpecifyKind(guest.RegistrationDate.Value, DateTimeKind.Utc);
            
            guest.CreatedAt = DateTime.UtcNow;

            await _guestRepository.AddAsync(guest);
            await _guestRepository.SaveChangesAsync();

            return _mapper.Map<GuestDTO>(guest);
        }
        
        // Метод для быстрого создания гостя
        public async Task<GuestDTO> CreateQuickGuestAsync(CreateGuestDTO createGuestDTO)
        {
            // Минимальная валидация - только обязательные поля
            if (string.IsNullOrWhiteSpace(createGuestDTO.FirstName))
                throw new ArgumentException("First name is required.");
            if (string.IsNullOrWhiteSpace(createGuestDTO.LastName))
                throw new ArgumentException("Last name is required.");
            if (string.IsNullOrWhiteSpace(createGuestDTO.Phone))
                throw new ArgumentException("Phone is required.");
        
            // Проверка уникальности телефона
            if (!await _guestRepository.IsPhoneUniqueAsync(createGuestDTO.Phone))
                throw new InvalidOperationException($"Phone {createGuestDTO.Phone} already exists.");
        
            var guest = new Guest
            {
                FirstName = createGuestDTO.FirstName,
                LastName = createGuestDTO.LastName,
                Phone = createGuestDTO.Phone,
                Email = createGuestDTO.Email,
                IdentificationTypeId = 1,
                CreatedAt = DateTime.UtcNow,
                CitizenshipId = createGuestDTO.CitizenshipId > 0 ? createGuestDTO.CitizenshipId : 1
            };
            
            // Обработка дополнительных DateTime полей, если они переданы
            if (createGuestDTO.DateOfBirth.HasValue)
            {
                guest.DateOfBirth = createGuestDTO.DateOfBirth.Value.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(createGuestDTO.DateOfBirth.Value, DateTimeKind.Utc)
                    : createGuestDTO.DateOfBirth.Value.ToUniversalTime();
            }
            
            if (createGuestDTO.IdentificationIssuedDate.HasValue)
            {
                guest.IdentificationIssuedDate = createGuestDTO.IdentificationIssuedDate.Value.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(createGuestDTO.IdentificationIssuedDate.Value, DateTimeKind.Utc)
                    : createGuestDTO.IdentificationIssuedDate.Value.ToUniversalTime();
            }
        
            await _guestRepository.AddAsync(guest);
            await _guestRepository.SaveChangesAsync();
        
            return _mapper.Map<GuestDTO>(guest);
        }

        public async Task<GuestDTO> UpdateGuestAsync(int id, UpdateGuestDTO updateGuestDTO)
        {
            var guest = await _guestRepository.GetByIdAsync(id);
            if (guest == null)
                throw new KeyNotFoundException($"Guest with ID {id} not found.");
        
            // Проверка уникальности email и телефона, если они изменились
            if (updateGuestDTO.Email != guest.Email && !await IsEmailUniqueAsync(updateGuestDTO.Email, id))
                throw new InvalidOperationException($"Email {updateGuestDTO.Email} is already registered.");
        
            if (updateGuestDTO.Phone != guest.Phone && !await IsPhoneUniqueAsync(updateGuestDTO.Phone, id))
                throw new InvalidOperationException($"Phone number {updateGuestDTO.Phone} is already registered.");
            
            _mapper.Map(updateGuestDTO, guest);

            if (guest.DateOfBirth.HasValue && guest.DateOfBirth.Value.Kind == DateTimeKind.Unspecified)
                guest.DateOfBirth = DateTime.SpecifyKind(guest.DateOfBirth.Value, DateTimeKind.Utc);
        
            if (guest.IdentificationIssuedDate.HasValue && guest.IdentificationIssuedDate.Value.Kind == DateTimeKind.Unspecified)
                guest.IdentificationIssuedDate = DateTime.SpecifyKind(guest.IdentificationIssuedDate.Value, DateTimeKind.Utc);
        
            if (guest.RegistrationDate.HasValue && guest.RegistrationDate.Value.Kind == DateTimeKind.Unspecified)
                guest.RegistrationDate = DateTime.SpecifyKind(guest.RegistrationDate.Value, DateTimeKind.Utc);
        
            await _guestRepository.UpdateAsync(guest);
            await _guestRepository.SaveChangesAsync(); 
        
            return _mapper.Map<GuestDTO>(guest);
        }

        public async Task DeleteGuestAsync(int id)
        {
            var guest = await _guestRepository.GetByIdAsync(id);
            if (guest == null)
                throw new KeyNotFoundException($"Guest with ID {id} not found.");

            // Проверка, что у гостя нет активных бронирований
            if (await _guestRepository.HasActiveBookingsAsync(id))
                throw new InvalidOperationException($"Cannot delete guest with ID {id} as they have active bookings.");

            await _guestRepository.DeleteAsync(guest);
            await _guestRepository.SaveChangesAsync(); 
        }

        public async Task<IEnumerable<GuestDTO>> SearchGuestsAsync(string searchTerm)
        {
            var guests = await _guestRepository.SearchGuestsAsync(searchTerm);
            return _mapper.Map<IEnumerable<GuestDTO>>(guests);
        }

        public async Task<bool> IsEmailUniqueAsync(string email, int? excludeGuestId = null)
        {
            return await _guestRepository.IsEmailUniqueAsync(email, excludeGuestId);
        }

        public async Task<bool> IsPhoneUniqueAsync(string phone, int? excludeGuestId = null)
        {
            return await _guestRepository.IsPhoneUniqueAsync(phone, excludeGuestId);
        }

        public async Task<IEnumerable<GuestDTO>> GetFrequentGuestsAsync(int count = 10)
        {
            var frequentGuests = await _guestRepository.GetFrequentGuestsAsync(count);
            return _mapper.Map<IEnumerable<GuestDTO>>(frequentGuests);
        }
    }
}