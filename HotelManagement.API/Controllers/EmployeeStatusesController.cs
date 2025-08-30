using HotelManagement.Core.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeStatusesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeeStatusesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<EmployeeStatus>>> GetAllEmployeeStatuses()
        {
            var statuses = await _context.EmployeeStatuses.ToListAsync();
            return Ok(statuses);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EmployeeStatus>> GetEmployeeStatusById(int id)
        {
            var status = await _context.EmployeeStatuses.FindAsync(id);
            if (status == null)
            {
                return NotFound();
            }
            return Ok(status);
        }
    }
}