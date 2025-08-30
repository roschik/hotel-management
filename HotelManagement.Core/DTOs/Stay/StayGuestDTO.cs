namespace HotelManagement.Core.DTOs
{
    public class StayGuestDTO
    {
        public int StayGuestId { get; set; }
        public int StayId { get; set; }
        public int GuestId { get; set; }
        public bool IsMainGuest { get; set; }
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public string? Notes { get; set; }
        public string GuestFullName { get; set; } = string.Empty;
        public string GuestPhone { get; set; } = string.Empty;
        public string GuestEmail { get; set; } = string.Empty;
    }
}