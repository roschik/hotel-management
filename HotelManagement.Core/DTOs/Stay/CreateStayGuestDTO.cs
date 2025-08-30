using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Core.DTOs
{
    public class CreateStayGuestDTO
    {
        public int StayId { get; set; }
        
        [Required]
        public int GuestId { get; set; }
        
        public bool IsMainGuest { get; set; }
        public bool CheckedIn { get; set; }
        public bool CheckedOut { get; set; }
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        
        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}