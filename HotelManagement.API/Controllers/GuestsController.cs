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

        public GuestsController(IGuestService guestService)
        {
            _guestService = guestService;
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
                await _guestService.DeleteGuestAsync(id);
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