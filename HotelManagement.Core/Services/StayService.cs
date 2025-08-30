using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;

namespace HotelManagement.Core.Services
{
    public class StayService : IStayService
    {
        private readonly IStayRepository _stayRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IGuestRepository _guestRepository;
        private readonly IEmployeeRepository _employeeRepository;

        private readonly IMapper _mapper;

        public StayService(
            IStayRepository stayRepository,
            IBookingRepository bookingRepository,
            IGuestRepository guestRepository,
            IEmployeeRepository employeeRepository,
            IMapper mapper)
        {
            _stayRepository = stayRepository;
            _bookingRepository = bookingRepository;
            _guestRepository = guestRepository;
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<StayDTO>> GetAllStaysAsync()
        {
            var stays = await _stayRepository.GetAllStaysWithDetailsAsync();
            return _mapper.Map<IEnumerable<StayDTO>>(stays);
        }

        public async Task<StayDTO> GetStayByIdAsync(int id)
        {
            var stay = await _stayRepository.GetStayWithGuestsAsync(id);
            return _mapper.Map<StayDTO>(stay);
        }

        public async Task<IEnumerable<StayDTO>> GetStaysByGuestIdAsync(int guestId)
        {
            var stays = await _stayRepository.GetStaysByGuestIdAsync(guestId);
            return _mapper.Map<IEnumerable<StayDTO>>(stays);
        }

        public async Task<IEnumerable<StayDTO>> GetStaysByRoomIdAsync(int roomId)
        {
            var stays = await _stayRepository.GetStaysByRoomIdAsync(roomId);
            return _mapper.Map<IEnumerable<StayDTO>>(stays);
        }

        public async Task<IEnumerable<StayDTO>> GetStaysByBookingIdAsync(int bookingId)
        {
            var stays = await _stayRepository.GetStaysByBookingIdAsync(bookingId);
            return _mapper.Map<IEnumerable<StayDTO>>(stays);
        }

        public async Task<IEnumerable<StayDTO>> GetActiveStaysAsync()
        {
            var stays = await _stayRepository.GetActiveStaysAsync();
            return _mapper.Map<IEnumerable<StayDTO>>(stays);
        }

        public async Task<StayDTO> CreateStayAsync(CreateStayDTO createStayDto)
        {
            // Проверяем существование бронирования
            var booking = await _bookingRepository.GetByIdAsync(createStayDto.BookingId);
            if (booking == null)
                throw new ArgumentException("Бронирование не найдено");
        
            // Проверяем статус бронирования - должен быть "Ожидает подтверждения" (ID = 4)
            if (booking.BookingStatusId != 4)
                throw new InvalidOperationException("Создание проживания доступно только для бронирований со статусом 'Ожидает подтверждения'");
        
            // Проверяем существование ответственного сотрудника
            var employee = await _employeeRepository.GetByIdAsync(createStayDto.EmployeeId);
            if (employee == null)
                throw new ArgumentException("Ответственный сотрудник не найден");
        
            // Создаем проживание
            var stay = new Stay
            {
                BookingId = createStayDto.BookingId,
                ActualCheckInDate = createStayDto.ActualCheckInDate,
                ActualCheckOutDate = createStayDto.ActualCheckOutDate,
                Notes = createStayDto.Notes,
                TotalAmount = createStayDto.TotalAmount,
                PaidAmount = createStayDto.PaidAmount,
                DueDate = createStayDto.DueDate,
                PaymentStatusId = createStayDto.PaymentStatusId,
                PaymentDate = createStayDto.PaymentDate,
                TaxPercent = createStayDto.TaxPercent,
                EmployeeId = createStayDto.EmployeeId,
                CreatedAt = DateTime.UtcNow,
                StayGuests = new List<StayGuest>()
            };
        
            // Добавляем гостей
            foreach (var guestDto in createStayDto.StayGuests)
            {
                var guest = await _guestRepository.GetByIdAsync(guestDto.GuestId);
                if (guest == null)
                    throw new ArgumentException($"Гость с ID {guestDto.GuestId} не найден");
        
                stay.StayGuests.Add(new StayGuest
                {
                    GuestId = guestDto.GuestId,
                    IsMainGuest = guestDto.IsMainGuest,
                    CheckInDate = guestDto.CheckInDate,
                    CheckOutDate = guestDto.CheckOutDate,
                    Notes = guestDto.Notes
                });
            }
        
            await _stayRepository.AddAsync(stay);
            await _stayRepository.SaveChangesAsync();
        
            // Обновляем статус бронирования на "Подтверждено" (ID = 1)
            booking.BookingStatusId = 1;
            booking.UpdatedAt = DateTime.UtcNow;
            await _bookingRepository.UpdateAsync(booking);
            await _bookingRepository.SaveChangesAsync();
        
            return await GetStayByIdAsync(stay.StayId);
        }

        public async Task<StayDTO> UpdateStayAsync(int stayId, UpdateStayDTO updateStayDto)
        {
            var stay = await _stayRepository.GetStayWithGuestsAsync(stayId);
            if (stay == null)
                throw new ArgumentException("Проживание не найдено");
        
            // Проверяем существование ответственного сотрудника, если он изменяется
            if (updateStayDto.EmployeeId.HasValue)
            {
                var employee = await _employeeRepository.GetByIdAsync(updateStayDto.EmployeeId.Value);
                if (employee == null)
                    throw new ArgumentException("Ответственный сотрудник не найден");
                stay.EmployeeId = updateStayDto.EmployeeId.Value;
            }
        
            // Обновляем поля
            stay.ActualCheckInDate = updateStayDto.ActualCheckInDate;
            stay.ActualCheckOutDate = updateStayDto.ActualCheckOutDate;
            
            if (updateStayDto.Notes != null)
                stay.Notes = updateStayDto.Notes;

            if (updateStayDto.TotalAmount.HasValue)
                stay.TotalAmount = updateStayDto.TotalAmount.Value;
            
            if (updateStayDto.PaidAmount.HasValue)
                stay.PaidAmount = updateStayDto.PaidAmount.Value;
            
            if (updateStayDto.DueDate.HasValue)
                stay.DueDate = updateStayDto.DueDate.Value;
            
            if (updateStayDto.PaymentStatusId.HasValue)
                stay.PaymentStatusId = updateStayDto.PaymentStatusId.Value;
            
            if (updateStayDto.PaymentDate.HasValue)
                stay.PaymentDate = updateStayDto.PaymentDate.Value;
            
            if (updateStayDto.TaxPercent.HasValue)
                stay.TaxPercent = updateStayDto.TaxPercent.Value;
        
            // Обновляем список гостей, если он предоставлен
            if (updateStayDto.StayGuests != null && updateStayDto.StayGuests.Any())
            {
                stay.StayGuests.Clear();
                
                foreach (var guestDto in updateStayDto.StayGuests)
                {
                    var guest = await _guestRepository.GetByIdAsync(guestDto.GuestId);
                    if (guest == null)
                        throw new ArgumentException($"Гость с ID {guestDto.GuestId} не найден");
            
                    stay.StayGuests.Add(new StayGuest
                    {
                        GuestId = guestDto.GuestId,
                        IsMainGuest = guestDto.IsMainGuest,
                        CheckInDate = guestDto.CheckInDate,
                        CheckOutDate = guestDto.CheckOutDate,
                        Notes = guestDto.Notes
                    });
                }
            }
            
            stay.UpdatedAt = DateTime.UtcNow;
        
            await _stayRepository.UpdateAsync(stay);
            await _stayRepository.SaveChangesAsync();
        
            return await GetStayByIdAsync(stayId);
        }

        public async Task<bool> DeleteStayAsync(int stayId)
        {
            var stay = await _stayRepository.GetByIdAsync(stayId);
            if (stay == null)
                return false;

            await _stayRepository.DeleteAsync(stay);
            await _stayRepository.SaveChangesAsync();
            return true;
        }

        public async Task<StayDTO> CheckOutStayAsync(int stayId, DateTime checkOutDate)
        {
            var stay = await _stayRepository.GetByIdAsync(stayId);
            if (stay == null)
                throw new ArgumentException("Проживание не найдено");

            stay.ActualCheckOutDate = checkOutDate;
            stay.UpdatedAt = DateTime.UtcNow;

            await _stayRepository.UpdateAsync(stay);
            await _stayRepository.SaveChangesAsync();

            return await GetStayByIdAsync(stayId);
        }

        public async Task<StayGuestDTO> AddGuestToStayAsync(CreateStayGuestDTO createStayGuestDto)
        {
            var stay = await _stayRepository.GetStayWithGuestsAsync(createStayGuestDto.StayId);
            if (stay == null)
                throw new ArgumentException("Проживание не найдено");

            var guest = await _guestRepository.GetByIdAsync(createStayGuestDto.GuestId);
            if (guest == null)
                throw new ArgumentException("Гость не найден");

            // Проверяем, не добавлен ли уже этот гость
            if (stay.StayGuests.Any(sg => sg.GuestId == createStayGuestDto.GuestId))
                throw new ArgumentException("Гость уже добавлен к этому проживанию");

            var stayGuest = new StayGuest
            {
                StayId = createStayGuestDto.StayId,
                GuestId = createStayGuestDto.GuestId,
                IsMainGuest = createStayGuestDto.IsMainGuest,
                CheckInDate = createStayGuestDto.CheckInDate,
                CheckOutDate = createStayGuestDto.CheckOutDate,
                Notes = createStayGuestDto.Notes
            };

            stay.StayGuests.Add(stayGuest);
            await _stayRepository.UpdateAsync(stay);
            await _stayRepository.SaveChangesAsync();

            return new StayGuestDTO
            {
                StayGuestId = stayGuest.StayGuestId,
                StayId = stayGuest.StayId,
                GuestId = stayGuest.GuestId,
                IsMainGuest = stayGuest.IsMainGuest,
                CheckInDate = stayGuest.CheckInDate,
                CheckOutDate = stayGuest.CheckOutDate,
                Notes = stayGuest.Notes,
                GuestFullName = $"{guest.FirstName} {guest.LastName}",
                GuestPhone = guest.Phone ?? string.Empty,
                GuestEmail = guest.Email ?? string.Empty
            };
        }

        public async Task<bool> RemoveGuestFromStayAsync(int stayId, int guestId)
        {
            var stay = await _stayRepository.GetStayWithGuestsAsync(stayId);
            if (stay == null)
                return false;

            var stayGuest = stay.StayGuests.FirstOrDefault(sg => sg.GuestId == guestId);
            if (stayGuest == null)
                return false;

            stay.StayGuests.Remove(stayGuest);
            await _stayRepository.UpdateAsync(stay);
            await _stayRepository.SaveChangesAsync();
            
            return true;
        }

        public async Task<IEnumerable<StayDTO>> GetStaysByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var stays = await _stayRepository.GetStaysByDateRangeAsync(startDate, endDate);
            return _mapper.Map<IEnumerable<StayDTO>>(stays);
        }
    }
}