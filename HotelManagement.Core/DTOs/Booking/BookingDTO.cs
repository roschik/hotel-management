namespace HotelManagement.Core.DTOs
{
    public class BookingDTO
    {
        public int Id { get; set; }
        public int GuestId { get; set; }
        public string GuestName { get; set; }
        public string GuestPhone { get; set; }
        public int RoomId { get; set; }
        public string RoomNumber { get; set; }
        public string RoomType { get; set; }
        public int BookingTypeId { get; set; }
        public string BookingTypeName { get; set; }
        public int BookingStatusId { get; set; }
        public string BookingStatusName { get; set; }
        public int? EmployeeId { get; set; } 
        public string? EmployeeName { get; set; } 
        public string? EmployeePosition { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public decimal BasePrice { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? Notes { get; set; }
    }
}