using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HotelManagement.Infrastructure.Repositories
{
    public class RoomRepository : Repository<Room>, IRoomRepository
    {
        public RoomRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Room>> GetAllAsync()
        {
            return await _dbSet
                .Include(r => r.RoomType)
                .OrderBy(r => r.RoomNumber)
                .ToListAsync();
        }

        public async Task<IEnumerable<Room>> GetRoomsByFloorAsync(int floor)
        {
            return await _dbSet
                .Where(r => r.Floor == floor)
                .Include(r => r.RoomType)
                .OrderBy(r => r.RoomNumber)
                .ToListAsync();
        }

        public async Task<IEnumerable<Room>> GetRoomsByTypeAsync(int roomTypeId)
        {
            return await _dbSet
                .Where(r => r.RoomTypeId == roomTypeId)
                .Include(r => r.RoomType)
                .OrderBy(r => r.RoomNumber)
                .ToListAsync();
        }

        public async Task<IEnumerable<Room>> GetAvailableRoomsAsync(DateTime startDate, DateTime endDate, int? capacity = null, int? roomTypeId = null)
        {
            var query = _dbSet
                .Include(r => r.RoomType)
                .Where(r => r.IsAvailable);

            // Фильтр по вместимости
            if (capacity.HasValue)
                query = query.Where(r => r.Capacity >= capacity.Value);

            // Фильтр по типу комнаты
            if (roomTypeId.HasValue)
                query = query.Where(r => r.RoomTypeId == roomTypeId.Value);

            var rooms = await query.ToListAsync();

            // Проверяем доступность на указанные даты
            var availableRooms = new List<Room>();

            foreach (var room in rooms)
            {
                // Проверяем, нет ли пересекающихся бронирований
                var hasConflictingBooking = await _context.Bookings
                    .Where(b => b.RoomId == room.RoomId &&
                           b.BookingStatusId != 3 &&
                           (b.CheckInDate.Date < endDate.Date && b.CheckOutDate.Date > startDate.Date))
                    .AnyAsync();

                if (!hasConflictingBooking)
                {
                    availableRooms.Add(room);
                }
            }

            return availableRooms.OrderBy(r => r.PricePerNight);
        }

        public async Task<bool> IsRoomNumberUniqueAsync(string roomNumber, int? excludeRoomId = null)
        {
            var query = _dbSet.Where(r => r.RoomNumber == roomNumber);

            if (excludeRoomId.HasValue)
            {
                query = query.Where(r => r.RoomId != excludeRoomId.Value);
            }

            return !(await query.AnyAsync());
        }
        
        public async Task<bool> IsRoomNumberExistsAsync(string roomNumber)
        {
            return await _dbSet.AnyAsync(r => r.RoomNumber == roomNumber);
        }

        public async Task<bool> IsRoomInUseAsync(int roomId)
        {
            var currentUtc = DateTime.UtcNow;
            
            return await _context.Bookings
                .Where(b => b.RoomId == roomId &&
                       b.BookingStatusId != 3 &&
                       b.CheckOutDate > currentUtc)
                .AnyAsync();
        }

        public async Task<RoomStatusDTO> GetRoomStatusAsync(int roomId)
        {
            var room = await _dbSet
                .Where(r => r.RoomId == roomId)
                .FirstOrDefaultAsync();

            if (room == null)
                throw new KeyNotFoundException($"Номер с ID {roomId} не найден.");

            // Получаем информацию о текущем бронировании
            var currentBooking = await _context.Bookings
                .Where(b => b.RoomId == roomId &&
                       b.BookingStatusId != 3 &&
                       b.CheckInDate <= DateTime.UtcNow && b.CheckOutDate > DateTime.UtcNow)
                .FirstOrDefaultAsync();

            // Получаем информацию о следующем бронировании
            var nextBooking = await _context.Bookings
                .Where(b => b.RoomId == roomId &&
                       b.BookingStatusId != 3 &&
                       b.CheckInDate > DateTime.UtcNow)
                .OrderBy(b => b.CheckInDate)
                .FirstOrDefaultAsync();

            return new RoomStatusDTO
            {
                RoomId = room.RoomId,
                RoomNumber = room.RoomNumber,
                IsAvailable = room.IsAvailable,
                IsCurrentlyOccupied = currentBooking != null,
                NextBookingDate = nextBooking?.CheckInDate,
                NextAvailableDate = await GetNextAvailableDate(room.RoomId)
            };
        }

        public async Task<IEnumerable<AvailableRoomDTO>> SearchAvailableRoomsAsync(AvailableRoomSearchDTO searchCriteria)
        {
            var query = _dbSet
                .Include(r => r.RoomType)
                .Where(r => r.IsAvailable); 

            // Фильтр по вместимости
            if (searchCriteria.Capacity.HasValue)
            {
                query = query.Where(r => r.Capacity >= searchCriteria.Capacity.Value);
            }

            // Фильтр по типу комнаты
            if (searchCriteria.RoomTypeId.HasValue)
            {
                query = query.Where(r => r.RoomTypeId == searchCriteria.RoomTypeId.Value);
            }

            // Фильтр по минимальной цене
            if (searchCriteria.MinPricePerNight.HasValue)
            {
                query = query.Where(r => r.PricePerNight >= searchCriteria.MinPricePerNight.Value);
            }

            // Фильтр по максимальной цене
            if (searchCriteria.MaxPricePerNight.HasValue)
            {
                query = query.Where(r => r.PricePerNight <= searchCriteria.MaxPricePerNight.Value);
            }

            // Фильтры по удобствам
            if (searchCriteria.HasWifi == true)
                query = query.Where(r => r.HasWifi);
            if (searchCriteria.HasTV == true)
                query = query.Where(r => r.HasTV);
            if (searchCriteria.HasMinibar == true)
                query = query.Where(r => r.HasMinibar);
            if (searchCriteria.HasAirConditioning == true)
                query = query.Where(r => r.HasAirConditioning);
            if (searchCriteria.HasBalcony == true)
                query = query.Where(r => r.HasBalcony);

            var rooms = await query.ToListAsync();

            // Нормализуем даты поиска - используем только дату без времени
            var checkInDateOnly = searchCriteria.CheckInDate.Date;
            var checkOutDateOnly = searchCriteria.CheckOutDate.Date;
            
            var availableRooms = new List<AvailableRoomDTO>();
            var nightCount = (checkOutDateOnly - checkInDateOnly).Days;

            foreach (var room in rooms)
            {
                // Проверяем пересекающиеся бронирования
                var hasConflictingBooking = await _context.Bookings
                    .Where(b => b.RoomId == room.RoomId &&
                           b.BookingStatusId != 3 &&
                           (b.CheckInDate.Date < checkOutDateOnly && b.CheckOutDate.Date > checkInDateOnly))
                    .AnyAsync();

                if (!hasConflictingBooking)
                {
                    // Получаем информацию о следующем бронировании
                    var nextBooking = await _context.Bookings
                        .Where(b => b.RoomId == room.RoomId &&
                               b.BookingStatusId != 3 &&
                               b.CheckInDate.Date >= checkOutDateOnly)
                        .OrderBy(b => b.CheckInDate)
                        .FirstOrDefaultAsync();

                    availableRooms.Add(new AvailableRoomDTO
                    {
                        Id = room.RoomId,
                        RoomNumber = room.RoomNumber,
                        RoomTypeId = room.RoomTypeId,
                        RoomTypeName = room.RoomType?.Name,
                        RoomDescription = room.RoomType?.Description,
                        Floor = room.Floor,
                        Capacity = room.Capacity,
                        PricePerNight = room.PricePerNight,
                        IsAvailable = room.IsAvailable,
                        HasWifi = room.HasWifi,
                        HasTV = room.HasTV,
                        HasMinibar = room.HasMinibar,
                        HasAirConditioning = room.HasAirConditioning,
                        HasBalcony = room.HasBalcony,
                        ImageUrl = room.ImageUrl,
                        IsCurrentlyOccupied = false,
                        NextBookingDate = nextBooking?.CheckInDate,
                        TotalPrice = room.PricePerNight * nightCount,
                        NightCount = nightCount
                    });
                }
            }

            return availableRooms.OrderBy(r => r.PricePerNight);
        }

        public async Task<DateTime?> GetNextAvailableDate(int roomId)
        {
            var room = await _dbSet.FindAsync(roomId);
            if (room == null || !room.IsAvailable)
                return null;

            var lastBooking = await _context.Bookings
                .Where(b => b.RoomId == roomId &&
                       b.BookingStatusId != 3 &&
                       b.CheckOutDate > DateTime.UtcNow)
                .OrderByDescending(b => b.CheckOutDate)
                .FirstOrDefaultAsync();

            return lastBooking?.CheckOutDate ?? DateTime.UtcNow;
        }
    }
}