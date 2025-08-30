using HotelManagement.Core.DTOs;
using HotelManagement.Core.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;

        public RoomsController(IRoomService roomService)
        {
            _roomService = roomService;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<RoomDTO>>> GetAllRooms(
            [FromQuery] string search = null,
            [FromQuery] int? roomTypeId = null,
            [FromQuery] bool? isAvailable = null,
            [FromQuery] int? floor = null,
            [FromQuery] int? capacity = null)
        {
            var rooms = await _roomService.GetAllRoomsAsync(search, roomTypeId, isAvailable, floor, capacity);
            return Ok(rooms);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<RoomDTO>> GetRoomById(int id)
        {
            try
            {
                var room = await _roomService.GetRoomByIdAsync(id);
                return Ok(room);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<RoomDTO>> CreateRoom(CreateRoomDTO createRoomDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            try
            {
                var room = await _roomService.CreateRoomAsync(createRoomDTO);
                return CreatedAtAction(nameof(GetRoomById), new { id = room.Id }, room);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<RoomDTO>> UpdateRoom(int id, UpdateRoomDTO updateRoomDTO)
        {
            try
            {
                var room = await _roomService.UpdateRoomAsync(id, updateRoomDTO);
                return Ok(room);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteRoom(int id)
        {
            try
            {
                await _roomService.DeleteRoomAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                // Логируем ошибку
                return StatusCode(500, "Произошла внутренняя ошибка при удалении комнаты");
            }
        }

        [HttpGet("available")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<RoomDTO>>> GetAvailableRooms(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] int? capacity = null,
            [FromQuery] int? roomTypeId = null)
        {
            if (startDate >= endDate)
            {
                return BadRequest("Дата начала должна быть раньше даты окончания.");
            }

            var rooms = await _roomService.GetAvailableRoomsAsync(startDate, endDate, capacity, roomTypeId);
            return Ok(rooms);
        }

        [HttpPost("{id}/block")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]

        [HttpGet("{id}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<RoomStatusDTO>> GetRoomStatus(int id)
        {
            try
            {
                var status = await _roomService.GetRoomStatusAsync(id);
                return Ok(status);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("byType/{roomType}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<RoomDTO>>> GetRoomsByType(int roomTypeId)
        {
            var rooms = await _roomService.GetRoomsByTypeAsync(roomTypeId);
            return Ok(rooms);
        }

        [HttpGet("byFloor/{floor}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<RoomDTO>>> GetRoomsByFloor(int floor)
        {
            var rooms = await _roomService.GetRoomsByFloorAsync(floor);
            return Ok(rooms);
        }

        [HttpPost("search-available")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<AvailableRoomDTO>>> SearchAvailableRooms(
            [FromBody] AvailableRoomSearchDTO searchCriteria)
        {
            if (searchCriteria.CheckInDate >= searchCriteria.CheckOutDate)
            {
                return BadRequest("Дата заезда должна быть раньше даты выезда.");
            }

            var rooms = await _roomService.SearchAvailableRoomsAsync(searchCriteria);
            return Ok(rooms);
        }

        [HttpGet("{id}/next-available-date")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DateTime?>> GetNextAvailableDate(int id)
        {
            try
            {
                var nextDate = await _roomService.GetNextAvailableDate(id);
                return Ok(nextDate);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}