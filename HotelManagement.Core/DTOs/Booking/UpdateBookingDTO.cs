namespace HotelManagement.Core.DTOs
{
    public class UpdateBookingDTO
    {
        public int RoomId { get; set; }
        public int BookingTypeId { get; set; }
        public int BookingStatusId { get; set; }
        public int? EmployeeId { get; set; } 
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime? UpatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? Notes { get; set; }
    }
}
