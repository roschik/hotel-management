using HotelManagement.Core.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingStatusesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingStatusesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookingStatus>>> GetAllBookingStatuses()
        {
            var bookingStatuses = await _context.BookingStatuses.ToListAsync();
            return Ok(bookingStatuses);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookingStatus>> GetBookingStatusById(int id)
        {
            var bookingStatus = await _context.BookingStatuses.FindAsync(id);
            if (bookingStatus == null)
            {
                return NotFound();
            }
            return Ok(bookingStatus);
        }
    }
}