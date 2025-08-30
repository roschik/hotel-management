namespace HotelManagement.Core.Entities
{
    public class StayGuest
    {
        public int StayGuestId { get; set; }
        public int StayId { get; set; }
        public int GuestId { get; set; }
        public bool IsMainGuest { get; set; }
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public string Notes { get; set; }

        // Навигационные свойства
        public Stay Stay { get; set; }
        public Guest Guest { get; set; }
    }
}