using HotelManagement.Core.DTOs;
using HotelManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IdentificationTypesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public IdentificationTypesController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<IdentificationTypeDTO>>> GetAllIdentificationTypes()
        {
            var identificationTypes = await _context.IdentificationTypes.ToListAsync();
            var identificationTypeDTOs = _mapper.Map<IEnumerable<IdentificationTypeDTO>>(identificationTypes);
            return Ok(identificationTypeDTOs);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IdentificationTypeDTO>> GetIdentificationTypeById(int id)
        {
            var identificationType = await _context.IdentificationTypes.FindAsync(id);
            if (identificationType == null)
            {
                return NotFound();
            }
            var identificationTypeDTO = _mapper.Map<IdentificationTypeDTO>(identificationType);
            return Ok(identificationTypeDTO);
        }
    }
}