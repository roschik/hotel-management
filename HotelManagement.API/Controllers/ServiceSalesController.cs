using HotelManagement.Core.DTOs;
using HotelManagement.Core.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceSalesController : ControllerBase
    {
        private readonly IServiceSaleService _serviceSaleService;

        public ServiceSalesController(IServiceSaleService serviceSaleService)
        {
            _serviceSaleService = serviceSaleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceSaleDTO>>> GetAllServiceSales()
        {
            try
            {
                var serviceSales = await _serviceSaleService.GetAllServiceSalesAsync();
                return Ok(serviceSales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceSaleDTO>> GetServiceSale(int id)
        {
            try
            {
                var serviceSale = await _serviceSaleService.GetServiceSaleByIdAsync(id);
                return Ok(serviceSale);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<ServiceSaleDTO>> CreateServiceSale([FromBody] CreateServiceSaleDTO createServiceSaleDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var serviceSale = await _serviceSaleService.CreateServiceSaleAsync(createServiceSaleDTO);
                return CreatedAtAction(nameof(GetServiceSale), new { id = serviceSale.Id }, serviceSale);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ServiceSaleDTO>> UpdateServiceSale(int id, [FromBody] CreateServiceSaleDTO updateServiceSaleDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var serviceSale = await _serviceSaleService.UpdateServiceSaleAsync(id, updateServiceSaleDTO);
                return Ok(serviceSale);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteServiceSale(int id)
        {
            try
            {
                await _serviceSaleService.DeleteServiceSaleAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("by-date-range")]
        public async Task<ActionResult<IEnumerable<ServiceSaleDTO>>> GetServiceSalesByDateRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
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
    
                var serviceSales = await _serviceSaleService.GetServiceSalesByDateRangeAsync(utcStartDate, utcEndDate);
                return Ok(serviceSales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("by-employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<ServiceSaleDTO>>> GetServiceSalesByEmployee(int employeeId)
        {
            try
            {
                var serviceSales = await _serviceSaleService.GetServiceSalesByEmployeeAsync(employeeId);
                return Ok(serviceSales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("by-service/{serviceId}")]
        public async Task<ActionResult<IEnumerable<ServiceSaleDTO>>> GetServiceSalesByService(int serviceId)
        {
            try
            {
                var serviceSales = await _serviceSaleService.GetServiceSalesByServiceAsync(serviceId);
                return Ok(serviceSales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("total-revenue")]
        public async Task<ActionResult<decimal>> GetTotalSalesRevenue(
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                DateTime? utcStartDate = null;
                DateTime? utcEndDate = null;
        
                if (startDate.HasValue)
                {
                    utcStartDate = startDate.Value.Kind == DateTimeKind.Unspecified 
                        ? DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc) 
                        : startDate.Value.ToUniversalTime();
                }
        
                if (endDate.HasValue)
                {
                    utcEndDate = endDate.Value.Kind == DateTimeKind.Unspecified 
                        ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc) 
                        : endDate.Value.ToUniversalTime();
                }
        
                var totalRevenue = await _serviceSaleService.GetTotalSalesRevenueAsync(utcStartDate, utcEndDate);
                return Ok(totalRevenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}