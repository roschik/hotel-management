using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;

namespace HotelManagement.Core.Services
{
    public class RoomService : IRoomService
    {
        private readonly IRoomRepository _roomRepository;
        private readonly IMapper _mapper;

        public RoomService(IRoomRepository roomRepository, IMapper mapper)
        {
            _roomRepository = roomRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<RoomDTO>> GetAllRoomsAsync(
            string search = null,
            int? roomTypeId = null,
            bool? isAvailable = null,
            int? floor = null,
            int? capacity = null)
        {
            var rooms = await _roomRepository.GetAllAsync();
            
            // Применяем фильтры
            if (!string.IsNullOrEmpty(search))
            {
                rooms = rooms.Where(r => 
                    r.RoomNumber.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                    (r.RoomType != null && r.RoomType.Name.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                    (r.RoomType != null && r.RoomType.Description != null && r.RoomType.Description.Contains(search, StringComparison.OrdinalIgnoreCase)));
            }
            
            if (roomTypeId.HasValue)
            {
                rooms = rooms.Where(r => r.RoomTypeId == roomTypeId.Value);
            }
            
            if (isAvailable.HasValue)
            {
                rooms = rooms.Where(r => r.IsAvailable == isAvailable.Value);
            }
            
            if (floor.HasValue)
            {
                rooms = rooms.Where(r => r.Floor == floor.Value);
            }
            
            if (capacity.HasValue)
            {
                rooms = rooms.Where(r => r.Capacity >= capacity.Value);
            }
            
            return _mapper.Map<IEnumerable<RoomDTO>>(rooms);
        }

        public async Task<RoomDTO> GetRoomByIdAsync(int id)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null)
                throw new KeyNotFoundException($"Комната с ID {id} не найдена.");

            return _mapper.Map<RoomDTO>(room);
        }

        public async Task<RoomDTO> CreateRoomAsync(CreateRoomDTO createRoomDTO)
        {
            // Проверка уникальности номера комнаты
            if (await _roomRepository.IsRoomNumberExistsAsync(createRoomDTO.RoomNumber))
                throw new InvalidOperationException($"Номер комнаты {createRoomDTO.RoomNumber} уже существует.");

            var room = _mapper.Map<Room>(createRoomDTO);

            await _roomRepository.AddAsync(room);
            await _roomRepository.SaveChangesAsync(); 
            return _mapper.Map<RoomDTO>(room);
        }

        public async Task<RoomDTO> UpdateRoomAsync(int id, UpdateRoomDTO updateRoomDTO)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null)
                throw new KeyNotFoundException($"Комната с ID {id} не найдена.");

            // Проверка уникальности номера комнаты, если он изменился
            if (updateRoomDTO.RoomNumber != room.RoomNumber &&
                await _roomRepository.IsRoomNumberExistsAsync(updateRoomDTO.RoomNumber))
                throw new InvalidOperationException($"Номер комнаты {updateRoomDTO.RoomNumber} уже существует.");

            _mapper.Map(updateRoomDTO, room);
            await _roomRepository.UpdateAsync(room);
            await _roomRepository.SaveChangesAsync(); 

            return _mapper.Map<RoomDTO>(room);
        }

        public async Task DeleteRoomAsync(int id)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null)
                throw new KeyNotFoundException($"Комната с ID {id} не найдена.");

            // Проверка, что комната не используется в активных бронированиях
            if (await _roomRepository.IsRoomInUseAsync(id))
                throw new InvalidOperationException($"Нельзя удалить комнату с ID {id}, она используется в активных бронированиях.");

            await _roomRepository.DeleteAsync(room);
            await _roomRepository.SaveChangesAsync(); 
        }

        public async Task<IEnumerable<RoomDTO>> GetAvailableRoomsAsync(DateTime startDate, DateTime endDate, int? capacity = null, int? roomTypeId = null)
        {
            var availableRooms = await _roomRepository.GetAvailableRoomsAsync(startDate, endDate, capacity, roomTypeId);
            return _mapper.Map<IEnumerable<RoomDTO>>(availableRooms);
        }

        public async Task<RoomStatusDTO> GetRoomStatusAsync(int id)
        {
            var room = await _roomRepository.GetByIdAsync(id);
            if (room == null)
                throw new KeyNotFoundException($"Комната с ID {id} не найдена.");

            var status = await _roomRepository.GetRoomStatusAsync(id);
            return status; 
        }
        public async Task<IEnumerable<AvailableRoomDTO>> SearchAvailableRoomsAsync(AvailableRoomSearchDTO searchCriteria)
        {
            return await _roomRepository.SearchAvailableRoomsAsync(searchCriteria);
        }

        public async Task<DateTime?> GetNextAvailableDate(int roomId)
        {
            return await _roomRepository.GetNextAvailableDate(roomId);
        }

        public async Task<IEnumerable<RoomDTO>> GetRoomsByTypeAsync(int roomTypeId)
        {
            var rooms = await _roomRepository.GetRoomsByTypeAsync(roomTypeId);
            return _mapper.Map<IEnumerable<RoomDTO>>(rooms);
        }

        public async Task<IEnumerable<RoomDTO>> GetRoomsByFloorAsync(int floor)
        {
            var rooms = await _roomRepository.GetRoomsByFloorAsync(floor);
            return _mapper.Map<IEnumerable<RoomDTO>>(rooms);
        }
    }
}