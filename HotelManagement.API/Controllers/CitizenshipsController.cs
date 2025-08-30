using HotelManagement.Core.DTOs;
using HotelManagement.Core.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CitizenshipsController : ControllerBase
    {
        private readonly ICitizenshipService _citizenshipService;

        public CitizenshipsController(ICitizenshipService citizenshipService)
        {
            _citizenshipService = citizenshipService;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CitizenshipDTO>>> GetAllCitizenships()
        {
            var citizenships = await _citizenshipService.GetAllCitizenshipsAsync();
            return Ok(citizenships);
        }

        [HttpGet("active")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CitizenshipDTO>>> GetActiveCitizenships()
        {
            var citizenships = await _citizenshipService.GetActiveCitizenshipsAsync();
            return Ok(citizenships);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CitizenshipDTO>> GetCitizenshipById(int id)
        {
            try
            {
                var citizenship = await _citizenshipService.GetCitizenshipByIdAsync(id);
                return Ok(citizenship);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CitizenshipDTO>> CreateCitizenship(CreateCitizenshipDTO createCitizenshipDTO)
        {
            try
            {
                var citizenship = await _citizenshipService.CreateCitizenshipAsync(createCitizenshipDTO);
                return CreatedAtAction(nameof(GetCitizenshipById), new { id = citizenship.Id }, citizenship);
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
        public async Task<ActionResult<CitizenshipDTO>> UpdateCitizenship(int id, UpdateCitizenshipDTO updateCitizenshipDTO)
        {
            try
            {
                var citizenship = await _citizenshipService.UpdateCitizenshipAsync(id, updateCitizenshipDTO);
                return Ok(citizenship);
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
        public async Task<IActionResult> DeleteCitizenship(int id)
        {
            try
            {
                await _citizenshipService.DeleteCitizenshipAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("code/{code}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CitizenshipDTO>> GetByCode(string code)
        {
            try
            {
                var citizenship = await _citizenshipService.GetByCodeAsync(code);
                return Ok(citizenship);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}