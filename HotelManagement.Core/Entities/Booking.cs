namespace HotelManagement.Core.Entities
{
    public class Booking
    {
        public int Id { get; set; }
        public int GuestId { get; set; }
        public int RoomId { get; set; }
        public int BookingTypeId { get; set; }
        public int BookingStatusId { get; set; }
        public int? EmployeeId { get; set; } 
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public decimal BasePrice { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? Notes { get; set; }

        // Навигационные свойства
        public Room Room { get; set; }
        public BookingType BookingType { get; set; }
        public BookingStatus BookingStatus { get; set; }
        public Employee? Employee { get; set; }
        public ICollection<Stay> Stays { get; set; }
        public Guest Guest { get; set; }
    }
}
