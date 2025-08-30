using HotelManagement.Core.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingTypesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingTypesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookingType>>> GetAllBookingTypes()
        {
            var bookingTypes = await _context.BookingTypes.ToListAsync();
            return Ok(bookingTypes);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookingType>> GetBookingTypeById(int id)
        {
            var bookingType = await _context.BookingTypes.FindAsync(id);
            if (bookingType == null)
            {
                return NotFound();
            }
            return Ok(bookingType);
        }
    }
}