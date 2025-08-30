using HotelManagement.Core.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentStatusesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentStatusesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<PaymentStatus>>> GetAllPaymentStatuses()
        {
            var statuses = await _context.PaymentStatuses.ToListAsync();
            return Ok(statuses);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PaymentStatus>> GetPaymentStatusById(int id)
        {
            var status = await _context.PaymentStatuses.FindAsync(id);
            if (status == null)
            {
                return NotFound();
            }
            return Ok(status);
        }
    }
}