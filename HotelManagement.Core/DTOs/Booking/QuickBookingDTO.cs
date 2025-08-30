namespace HotelManagement.Core.DTOs
{
    public class QuickBookingDTO
    {
        public int RoomId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public string GuestFirstName { get; set; }
        public string GuestLastName { get; set; }
        public string? GuestMiddleName { get; set; }
        public string GuestPhone { get; set; }
        public string? GuestEmail { get; set; }
        public int BookingStatusId { get; set; } = 4;
        public int BookingTypeId { get; set; } = 2; 
        public int? EmployeeId { get; set; }
        public string? Notes { get; set; }
    }
}