using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
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
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IMapper _mapper;

        public BookingsController(IBookingService bookingService, IMapper mapper)
        {
            _bookingService = bookingService;
            _mapper = mapper;
        }

        // GET: api/bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDTO>>> GetBookings()
        {
            var bookings = await _bookingService.GetAllBookingsAsync();
            return Ok(_mapper.Map<IEnumerable<BookingDTO>>(bookings));
        }

        // GET: api/bookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDTO>> GetBooking(int id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id);

            if (booking == null)
            {
                return NotFound();
            }

            var bookingDto = _mapper.Map<BookingDTO>(booking);
            bookingDto.TotalPrice = await _bookingService.CalculateBookingTotalAsync(id);

            return bookingDto;
        }

        // GET: api/bookings/guest/5
        [HttpGet("guest/{guestId}")]
        public async Task<ActionResult<IEnumerable<BookingDTO>>> GetBookingsByGuest(int guestId)
        {
            var bookings = await _bookingService.GetBookingsByGuestIdAsync(guestId);
            return Ok(_mapper.Map<IEnumerable<BookingDTO>>(bookings));
        }

        // GET: api/bookings/room/5
        [HttpGet("room/{roomId}")]
        public async Task<ActionResult<IEnumerable<BookingDTO>>> GetBookingsByRoom(int roomId)
        {
            var bookings = await _bookingService.GetBookingsByRoomIdAsync(roomId);
            return Ok(_mapper.Map<IEnumerable<BookingDTO>>(bookings));
        }

        // GET: api/bookings/daterange?startDate=2025-01-01&endDate=2025-01-10
        [HttpGet("daterange")]
        public async Task<ActionResult<IEnumerable<BookingDTO>>> GetBookingsByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            // Конвертируем даты в UTC, если они не имеют указанного Kind
            var utcStartDate = startDate.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(startDate, DateTimeKind.Utc) 
                : startDate.ToUniversalTime();
            
            var utcEndDate = endDate.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(endDate, DateTimeKind.Utc) 
                : endDate.ToUniversalTime();
        
            var bookings = await _bookingService.GetBookingsByDateRangeAsync(utcStartDate, utcEndDate);
            return Ok(_mapper.Map<IEnumerable<BookingDTO>>(bookings));
        }

        // GET: api/bookings/availability?roomId=5&startDate=2025-01-01&endDate=2025-01-10
        [HttpGet("availability")]
        public async Task<ActionResult<bool>> CheckRoomAvailability(
            [FromQuery] int roomId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            // Конвертируем даты в UTC, если они не имеют указанного Kind
            var utcStartDate = startDate.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(startDate, DateTimeKind.Utc) 
                : startDate.ToUniversalTime();
            
            var utcEndDate = endDate.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(endDate, DateTimeKind.Utc) 
                : endDate.ToUniversalTime();
        
            bool isAvailable = await _bookingService.IsRoomAvailableAsync(roomId, utcStartDate, utcEndDate);
            return Ok(isAvailable);
        }

        // POST: api/bookings
        [HttpPost]
        public async Task<ActionResult<BookingDTO>> CreateBooking(CreateBookingDTO createBookingDto)
        {
            try
            {
                var booking = _mapper.Map<Booking>(createBookingDto);
                var createdBooking = await _bookingService.CreateBookingAsync(booking);
                var bookingDto = _mapper.Map<BookingDTO>(createdBooking);
                bookingDto.TotalPrice = await _bookingService.CalculateBookingTotalAsync(createdBooking.Id);

                return CreatedAtAction(nameof(GetBooking), new { id = createdBooking.Id }, bookingDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/bookings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(int id, UpdateBookingDTO updateBookingDto)
        {
            try
            {
                var existingBooking = await _bookingService.GetBookingByIdAsync(id);
                if (existingBooking == null)
                {
                    return NotFound();
                }
        
                _mapper.Map(updateBookingDto, existingBooking);
                await _bookingService.UpdateBookingAsync(existingBooking);
        
                // Получить обновленное бронирование
                var updatedBooking = await _bookingService.GetBookingByIdAsync(id);
                var bookingDto = _mapper.Map<BookingDTO>(updatedBooking);
                
                return Ok(bookingDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // POST: api/bookings/5/cancel
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            try
            {
                await _bookingService.CancelBookingAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // GET: api/bookings/5/total
        [HttpGet("{id}/total")]
        public async Task<ActionResult<decimal>> GetBookingTotal(int id)
        {
            try
            {
                var total = await _bookingService.CalculateBookingTotalAsync(id);
                return Ok(total);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    
        // DELETE: api/bookings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            try
            {
                await _bookingService.DeleteBookingAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("quick")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BookingDTO>> CreateQuickBooking(QuickBookingDTO quickBookingDTO)
        {
            try
            {
                var booking = await _bookingService.CreateQuickBookingAsync(quickBookingDTO);
                var bookingDto = _mapper.Map<BookingDTO>(booking);
                bookingDto.TotalPrice = await _bookingService.CalculateBookingTotalAsync(booking.Id);
                
                return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, bookingDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}