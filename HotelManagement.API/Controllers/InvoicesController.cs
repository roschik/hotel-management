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
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoicesController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<InvoiceDTO>>> GetAllInvoices()
        {
            var invoices = await _invoiceService.GetAllInvoicesAsync();
            return Ok(invoices);
        }

        [HttpGet("stay/{stayId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InvoiceDTO>> GetInvoiceByStayId(int stayId)
        {
            try
            {
                var invoice = await _invoiceService.GetInvoiceByStayIdAsync(stayId);
                return Ok(invoice);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("booking/{bookingId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<InvoiceDTO>>> GetInvoicesByBookingId(int bookingId)
        {
            var invoices = await _invoiceService.GetInvoicesByBookingIdAsync(bookingId);
            return Ok(invoices);
        }

        [HttpGet("guest/{guestId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<InvoiceDTO>>> GetInvoicesByGuestId(int guestId)
        {
            var invoices = await _invoiceService.GetInvoicesByGuestIdAsync(guestId);
            return Ok(invoices);
        }

        [HttpGet("unpaid")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<InvoiceDTO>>> GetUnpaidInvoices()
        {
            var invoices = await _invoiceService.GetUnpaidInvoicesAsync();
            return Ok(invoices);
        }

        [HttpPut("payment/{stayId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<InvoiceDTO>> UpdatePayment(int stayId, UpdatePaymentDTO updatePaymentDTO)
        {
            try
            {
                var invoice = await _invoiceService.UpdatePaymentAsync(stayId, updatePaymentDTO);
                return Ok(invoice);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("revenue")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<decimal>> GetTotalRevenue([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var revenue = await _invoiceService.GetTotalRevenueAsync(startDate, endDate);
            return Ok(revenue);
        }
    }
}