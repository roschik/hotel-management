namespace HotelManagement.Core.DTOs
{
    public class AvailableRoomSearchDTO
    {
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int? Capacity { get; set; }
        public int? RoomTypeId { get; set; }
        public decimal? MinPricePerNight { get; set; }
        public decimal? MaxPricePerNight { get; set; }
        public bool? HasWifi { get; set; }
        public bool? HasTV { get; set; }
        public bool? HasMinibar { get; set; }
        public bool? HasAirConditioning { get; set; }
        public bool? HasBalcony { get; set; }
    }

    public class AvailableRoomDTO : RoomDTO
    {
        public bool IsCurrentlyOccupied { get; set; }
        public DateTime? NextBookingDate { get; set; }
        public decimal TotalPrice { get; set; } 
        public int NightCount { get; set; }
    }
}