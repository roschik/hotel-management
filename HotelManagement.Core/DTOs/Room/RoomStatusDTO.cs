namespace HotelManagement.Core.DTOs
{
    public class RoomStatusDTO
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime LastCleaningDate { get; set; }
        public bool IsCurrentlyOccupied { get; set; }
        public DateTime? NextBookingDate { get; set; }
        public DateTime? NextAvailableDate { get; set; }
    }
}
