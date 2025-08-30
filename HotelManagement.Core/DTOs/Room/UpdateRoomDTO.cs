namespace HotelManagement.Core.DTOs
{
    public class UpdateRoomDTO
    {
        public string RoomNumber { get; set; }
        public int RoomTypeId { get; set; } 
        public int? Floor { get; set; }
        public int? Capacity { get; set; }
        public decimal? PricePerNight { get; set; }
        public bool? IsAvailable { get; set; }
        public bool? HasWifi { get; set; }
        public bool? HasTV { get; set; }
        public bool? HasMinibar { get; set; }
        public bool? HasAirConditioning { get; set; }
        public bool? HasBalcony { get; set; }
        public string? ImageUrl { get; set; }
    }
}