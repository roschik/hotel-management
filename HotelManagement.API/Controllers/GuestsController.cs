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
    public class GuestsController : ControllerBase
    {
        private readonly IGuestService _guestService;
        private readonly ILogger<GuestsController> _logger;

        public GuestsController(IGuestService guestService, ILogger<GuestsController> logger)
        {
            _guestService = guestService;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<GuestDTO>>> GetAllGuests()
        {
            var guests = await _guestService.GetAllGuestsAsync();
            return Ok(guests);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<GuestDTO>> GetGuestById(int id)
        {
            try
            {
                var guest = await _guestService.GetGuestByIdAsync(id);
                return Ok(guest);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<GuestDTO>> CreateGuest(CreateGuestDTO createGuestDTO)
        {
            try
            {
                var guest = await _guestService.CreateGuestAsync(createGuestDTO);
                return CreatedAtAction(nameof(GetGuestById), new { id = guest.Id }, guest);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("quick")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<GuestDTO>> CreateQuickGuest(CreateGuestDTO createGuestDTO)
        {
            try
            {
                var guest = await _guestService.CreateQuickGuestAsync(createGuestDTO);
                return CreatedAtAction(nameof(GetGuestById), new { id = guest.Id }, guest);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
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
        public async Task<ActionResult<GuestDTO>> UpdateGuest(int id, UpdateGuestDTO updateGuestDTO)
        {
            try
            {
                var guest = await _guestService.UpdateGuestAsync(id, updateGuestDTO);
                return Ok(guest);
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
        public async Task<ActionResult> DeleteGuest(int id)
        {
            try
            {
                _logger.LogInformation("Attempting to delete guest with ID: {GuestId}", id);
                await _guestService.DeleteGuestAsync(id);
                _logger.LogInformation("Successfully deleted guest with ID: {GuestId}", id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Guest with ID {GuestId} not found: {Message}", id, ex.Message);
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Cannot delete guest with ID {GuestId}: {Message}", id, ex.Message);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while deleting guest with ID: {GuestId}", id);
                return StatusCode(500, "An unexpected error occurred while deleting the guest.");
            }
        }

        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<GuestDTO>>> SearchGuests([FromQuery] string searchTerm)
        {
            var guests = await _guestService.SearchGuestsAsync(searchTerm);
            return Ok(guests);
        }

        [HttpGet("check-email")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> IsEmailUnique([FromQuery] string email, [FromQuery] int? guestId = null)
        {
            var isUnique = await _guestService.IsEmailUniqueAsync(email, guestId);
            return Ok(isUnique);
        }

        [HttpGet("check-phone")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> IsPhoneUnique([FromQuery] string phone, [FromQuery] int? guestId = null)
        {
            var isUnique = await _guestService.IsPhoneUniqueAsync(phone, guestId);
            return Ok(isUnique);
        }

        [HttpGet("frequent")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<GuestDTO>>> GetFrequentGuests([FromQuery] int count = 10)
        {
            var frequentGuests = await _guestService.GetFrequentGuestsAsync(count);
            return Ok(frequentGuests);
        }
    }
}