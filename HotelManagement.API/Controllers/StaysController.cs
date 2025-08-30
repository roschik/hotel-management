using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace HotelManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaysController : ControllerBase
    {
        private readonly IStayService _stayService;
        private readonly IMapper _mapper;

        public StaysController(IStayService stayService, IMapper mapper)
        {
            _stayService = stayService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStays()
        {
            try
            {
                var stays = await _stayService.GetAllStaysAsync();
                return Ok(stays);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStayById(int id)
        {
            try
            {
                var stay = await _stayService.GetStayByIdAsync(id);
                if (stay == null)
                {
                    return NotFound($"Stay with ID {id} not found.");
                }
                return Ok(stay);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("guest/{guestId}")]
        public async Task<IActionResult> GetStaysByGuestId(int guestId)
        {
            try
            {
                var stays = await _stayService.GetStaysByGuestIdAsync(guestId);
                return Ok(stays);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("room/{roomId}")]
        public async Task<IActionResult> GetStaysByRoomId(int roomId)
        {
            try
            {
                var stays = await _stayService.GetStaysByRoomIdAsync(roomId);
                return Ok(stays);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetStaysByBookingId(int bookingId)
        {
            try
            {
                var stays = await _stayService.GetStaysByBookingIdAsync(bookingId);
                return Ok(stays);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveStays()
        {
            try
            {
                var stays = await _stayService.GetActiveStaysAsync();
                return Ok(stays);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("date-range")]
        public async Task<IActionResult> GetStaysByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                // Конвертируем даты в UTC, если они не имеют указанного Kind
                var utcStartDate = startDate.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(startDate, DateTimeKind.Utc) 
                    : startDate.ToUniversalTime();
                
                var utcEndDate = endDate.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(endDate, DateTimeKind.Utc) 
                    : endDate.ToUniversalTime();
        
                var stays = await _stayService.GetStaysByDateRangeAsync(utcStartDate, utcEndDate);
                return Ok(stays);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateStay([FromBody] CreateStayDTO createStayDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdStay = await _stayService.CreateStayAsync(createStayDto);
                return CreatedAtAction(nameof(GetStayById), new { id = createdStay.StayId }, createdStay);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStay(int id, [FromBody] UpdateStayDTO updateStayDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedStay = await _stayService.UpdateStayAsync(id, updateStayDto);
                if (updatedStay == null)
                {
                    return NotFound($"Stay with ID {id} not found.");
                }
                return Ok(updatedStay);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStay(int id)
        {
            try
            {
                var result = await _stayService.DeleteStayAsync(id);
                if (!result)
                {
                    return NotFound($"Stay with ID {id} not found.");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{stayId}/guests")]
        public async Task<IActionResult> AddGuestToStay(int stayId, [FromBody] CreateStayGuestDTO createStayGuestDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                createStayGuestDto.StayId = stayId;
                var stayGuest = await _stayService.AddGuestToStayAsync(createStayGuestDto);
                return Ok(stayGuest);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{stayId}/guests/{guestId}")]
        public async Task<IActionResult> RemoveGuestFromStay(int stayId, int guestId)
        {
            try
            {
                var result = await _stayService.RemoveGuestFromStayAsync(stayId, guestId);
                if (!result)
                {
                    return NotFound($"Guest with ID {guestId} not found in stay {stayId}.");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}