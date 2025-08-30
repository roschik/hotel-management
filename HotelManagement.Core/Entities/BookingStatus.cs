namespace HotelManagement.Core.Entities
{
    public class BookingStatus
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        // Навигационное свойство
        public ICollection<Booking> Bookings { get; set; }
    }
}