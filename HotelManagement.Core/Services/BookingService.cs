using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HotelManagement.Core.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IGuestRepository _guestRepository;

        public BookingService(
            IBookingRepository bookingRepository,
            IRoomRepository roomRepository,
            IServiceRepository serviceRepository,
            IGuestRepository guestRepository)
        {
            _bookingRepository = bookingRepository;
            _roomRepository = roomRepository;
            _serviceRepository = serviceRepository;
            _guestRepository = guestRepository;
        }

        public async Task<IEnumerable<Booking>> GetAllBookingsAsync()
        {
            return await _bookingRepository.GetAllAsync();
        }

        public async Task<Booking> GetBookingByIdAsync(int id)
        {
            return await _bookingRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Booking>> GetBookingsByGuestIdAsync(int guestId)
        {
            return await _bookingRepository.GetBookingsByGuestIdAsync(guestId);
        }

        public async Task<IEnumerable<Booking>> GetBookingsByRoomIdAsync(int roomId)
        {
            return await _bookingRepository.GetBookingsByRoomIdAsync(roomId);
        }

        public async Task<IEnumerable<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _bookingRepository.GetBookingsByDateRangeAsync(startDate, endDate);
        }

        public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime startDate, DateTime endDate, int? excludeBookingId = null)
        {
            return await _bookingRepository.IsRoomAvailableAsync(roomId, startDate, endDate, excludeBookingId);
        }

        public async Task<Booking> CreateBookingAsync(Booking booking)
        {
            // Обработка DateTime полей для правильной установки UTC Kind
            booking.CheckInDate = booking.CheckInDate.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(booking.CheckInDate, DateTimeKind.Utc)
                : booking.CheckInDate.ToUniversalTime();
                
            booking.CheckOutDate = booking.CheckOutDate.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(booking.CheckOutDate, DateTimeKind.Utc)
                : booking.CheckOutDate.ToUniversalTime();
        
            // Проверка доступности номера
            bool isAvailable = await IsRoomAvailableAsync(booking.RoomId, booking.CheckInDate, booking.CheckOutDate);
            if (!isAvailable)
            {
                throw new InvalidOperationException("Номер недоступен в указанные даты");
            }
        
            // Установка статуса и даты создания
            booking.BookingStatusId = booking.BookingStatusId == 0 ? 4 : booking.BookingStatusId;
            booking.CreatedAt = DateTime.UtcNow;
        
            // Расчет продолжительности пребывания
            var durationDays = (int)(booking.CheckOutDate - booking.CheckInDate).TotalDays;
        
            // Получение информации о номере для расчета базовой стоимости
            var room = await _roomRepository.GetByIdAsync(booking.RoomId);
            booking.BasePrice = room.PricePerNight * durationDays;
            
            // Устанавливаем TotalPrice, если не задан
            if (booking.TotalPrice == 0)
            {
                booking.TotalPrice = booking.BasePrice;
            }
        
            // Сохранение бронирования
            await _bookingRepository.AddAsync(booking);
            await _bookingRepository.SaveChangesAsync();
        
            return booking;
        }

        public async Task UpdateBookingAsync(Booking booking)
        {
            // Обработка DateTime полей для правильной установки UTC Kind
            booking.CheckInDate = booking.CheckInDate.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(booking.CheckInDate, DateTimeKind.Utc)
                : booking.CheckInDate.ToUniversalTime();
                
            booking.CheckOutDate = booking.CheckOutDate.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(booking.CheckOutDate, DateTimeKind.Utc)
                : booking.CheckOutDate.ToUniversalTime();
        
            // Проверка доступности номера, исключая текущее бронирование
            bool isAvailable = await IsRoomAvailableAsync(
                booking.RoomId,
                booking.CheckInDate,
                booking.CheckOutDate,
                booking.Id);
        
            if (!isAvailable)
            {
                throw new InvalidOperationException("Номер недоступен в указанные даты");
            }
        
            // Обновление продолжительности пребывания
            var durationDays = (int)(booking.CheckOutDate - booking.CheckInDate).TotalDays;
        
            // Получение информации о номере для расчета базовой стоимости
            var room = await _roomRepository.GetByIdAsync(booking.RoomId);
            booking.BasePrice = room.PricePerNight * durationDays;
        
            // Если TotalPrice не задан или равен 0, устанавливаем его равным BasePrice
            if (booking.TotalPrice == 0)
            {
                booking.TotalPrice = booking.BasePrice;
            }
        
            // Установить дату обновления
            booking.UpdatedAt = DateTime.UtcNow;
            
            // Если статус изменился на "Отменено", установить CancelledAt
            if (booking.BookingStatusId == 3 && booking.CancelledAt == null)
            {
                booking.CancelledAt = DateTime.UtcNow;
            }
            // Если статус изменился с "Отменено" на другой, сбросить CancelledAt
            else if (booking.BookingStatusId != 3)
            {
                booking.CancelledAt = null;
            }
            
            // Обновление бронирования
            await _bookingRepository.UpdateAsync(booking);
            await _bookingRepository.SaveChangesAsync();
        }

        public async Task CancelBookingAsync(int id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null)
            {
                throw new KeyNotFoundException($"Бронирование с ID {id} не найдено");
            }

            booking.BookingStatusId = 3;
            booking.CancelledAt = DateTime.UtcNow;

            await _bookingRepository.UpdateAsync(booking);
            await _bookingRepository.SaveChangesAsync();
        }

        public async Task<decimal> CalculateBookingTotalAsync(int bookingId)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
            {
                throw new KeyNotFoundException($"Бронирование с ID {bookingId} не найдено");
            }

            // Возвращаем только базовую стоимость, так как дополнительные услуги и скидки удалены
            return Math.Max(0, booking.BasePrice);
        }

        public async Task DeleteBookingAsync(int id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null)
            {
                throw new KeyNotFoundException($"Бронирование с ID {id} не найдено");
            }
    
            // if (booking.BookingStatusId != 3)
            // {
            //     throw new InvalidOperationException($"Нельзя удалить активное бронирование с ID {id}. Сначала отмените его.");
            // }
    
            await _bookingRepository.DeleteAsync(booking);
            await _bookingRepository.SaveChangesAsync();
        }

        public async Task<Booking> CreateQuickBookingAsync(QuickBookingDTO quickBookingDTO)
        {
            // Проверка доступности номера
            bool isAvailable = await IsRoomAvailableAsync(
                quickBookingDTO.RoomId,
                quickBookingDTO.CheckInDate,
                quickBookingDTO.CheckOutDate);

            if (!isAvailable)
            {
                throw new InvalidOperationException("Номер недоступен в указанные даты");
            }

            // Получение информации о номере
            var room = await _roomRepository.GetByIdAsync(quickBookingDTO.RoomId);
            if (room == null)
            {
                throw new KeyNotFoundException($"Room with ID {quickBookingDTO.RoomId} not found.");
            }

            // Поиск существующего гостя по телефону
            var existingGuest = await _guestRepository.GetGuestByPhoneAsync(quickBookingDTO.GuestPhone);
            
            Guest guest;
            if (existingGuest != null)
            {
                guest = existingGuest;
            }
            else
            {
                // Создание нового гостя с минимальными данными
                guest = new Guest
                {
                    FirstName = quickBookingDTO.GuestFirstName,
                    LastName = quickBookingDTO.GuestLastName,
                    MiddleName = quickBookingDTO.GuestMiddleName,
                    Phone = quickBookingDTO.GuestPhone,
                    Email = quickBookingDTO.GuestEmail,
                    IdentificationTypeId = 1, 
                    CreatedAt = DateTime.UtcNow
                };

                await _guestRepository.AddAsync(guest);
                await _guestRepository.SaveChangesAsync();
            }

            // Создание бронирования
            var durationDays = (int)(quickBookingDTO.CheckOutDate - quickBookingDTO.CheckInDate).TotalDays;
            var basePrice = room.PricePerNight * durationDays;
        
            // Обработка DateTime полей
            var checkInDate = quickBookingDTO.CheckInDate.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(quickBookingDTO.CheckInDate, DateTimeKind.Utc)
                : quickBookingDTO.CheckInDate.ToUniversalTime();
            
            var checkOutDate = quickBookingDTO.CheckOutDate.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(quickBookingDTO.CheckOutDate, DateTimeKind.Utc)
                : quickBookingDTO.CheckOutDate.ToUniversalTime();
        
            var booking = new Booking
            {
                GuestId = guest.GuestId,
                RoomId = quickBookingDTO.RoomId,
                BookingTypeId = quickBookingDTO.BookingTypeId,
                EmployeeId = quickBookingDTO.EmployeeId,
                CheckInDate = checkInDate,
                CheckOutDate = checkOutDate,
                BasePrice = basePrice,
                TotalPrice = basePrice, 
                BookingStatusId = 4,
                Notes = quickBookingDTO.Notes,
                CreatedAt = DateTime.UtcNow
            };

            await _bookingRepository.AddAsync(booking);
            await _bookingRepository.SaveChangesAsync();

            return booking;
        }
    }
}