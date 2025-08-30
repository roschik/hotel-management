using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Core.Services
{
    public class RoomTypeService : IRoomTypeService
    {
        private readonly IRoomTypeRepository _roomTypeRepository;
        private readonly IMapper _mapper;

        public RoomTypeService(IRoomTypeRepository roomTypeRepository, IMapper mapper)
        {
            _roomTypeRepository = roomTypeRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<RoomTypeDTO>> GetAllRoomTypesAsync()
        {
            var roomTypes = await _roomTypeRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<RoomTypeDTO>>(roomTypes);
        }

        public async Task<RoomTypeDTO> GetRoomTypeByIdAsync(int id)
        {
            var roomType = await _roomTypeRepository.GetByIdAsync(id);
            if (roomType == null)
                throw new KeyNotFoundException($"Тип номера с ID {id} не найден.");

            return _mapper.Map<RoomTypeDTO>(roomType);
        }

        public async Task<RoomTypeDTO> CreateRoomTypeAsync(CreateRoomTypeDTO createRoomTypeDTO)
        {
            if (!await _roomTypeRepository.IsNameUniqueAsync(createRoomTypeDTO.Name))
                throw new InvalidOperationException("Такой тип комнаты уже существует.");

            var roomType = _mapper.Map<RoomType>(createRoomTypeDTO);
            await _roomTypeRepository.AddAsync(roomType);
            await _roomTypeRepository.SaveChangesAsync();

            return _mapper.Map<RoomTypeDTO>(roomType);
        }

        public async Task<RoomTypeDTO> UpdateRoomTypeAsync(int id, UpdateRoomTypeDTO updateRoomTypeDTO)
        {
            var roomType = await _roomTypeRepository.GetByIdAsync(id);
            if (roomType == null)
                throw new KeyNotFoundException($"Тип номера с ID {id} не найден.");

            if (!await _roomTypeRepository.IsNameUniqueAsync(updateRoomTypeDTO.Name, id))
                throw new InvalidOperationException("Такой тип комнаты уже существует.");

            _mapper.Map(updateRoomTypeDTO, roomType);
            await _roomTypeRepository.UpdateAsync(roomType);
            await _roomTypeRepository.SaveChangesAsync();

            return _mapper.Map<RoomTypeDTO>(roomType);
        }

        public async Task DeleteRoomTypeAsync(int id)
        {
            var roomType = await _roomTypeRepository.GetByIdAsync(id);
            if (roomType == null)
                throw new KeyNotFoundException($"Тип номера с ID {id} не найден.");

            if (await _roomTypeRepository.IsRoomTypeInUseAsync(id))
                throw new InvalidOperationException("Нельзя удалить используемый тип комнат.");

            await _roomTypeRepository.DeleteAsync(roomType);
            await _roomTypeRepository.SaveChangesAsync();
        }
    }
}