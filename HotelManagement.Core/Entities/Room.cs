namespace HotelManagement.Core.Entities
{
    public class Room
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; }
        public int RoomTypeId { get; set; } 
        public int Capacity { get; set; }
        public decimal PricePerNight { get; set; }
        public bool IsAvailable { get; set; } = true; 
        public int Floor { get; set; }
        public bool HasWifi { get; set; }
        public bool HasTV { get; set; }
        public bool HasMinibar { get; set; }
        public bool HasAirConditioning { get; set; }
        public bool HasBalcony { get; set; }
        public string? ImageUrl { get; set; }

        // Навигационные свойства
        public RoomType RoomType { get; set; } 
        public ICollection<Booking> Bookings { get; set; }
    }
}