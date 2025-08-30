namespace HotelManagement.Core.DTOs.Reports
{
    public class OccupancyReportDTO
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double AverageOccupancyRate { get; set; }
        public int TotalBookings { get; set; }
        public int TotalStays { get; set; }
        public int TotalNights { get; set; }
        public int TotalRooms { get; set; }
        public int AvailableRoomNights { get; set; }
        public int OccupiedRoomNights { get; set; }
        public List<RoomOccupancyDetailDTO> RoomDetails { get; set; } = new();
        public List<OccupancyByRoomTypeDTO> OccupancyByRoomType { get; set; } = new();
    }

    public class RoomOccupancyDetailDTO
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string RoomType { get; set; } = string.Empty;
        public int StaysCount { get; set; }
        public int OccupiedNights { get; set; }
        public double OccupancyRate { get; set; }
        public decimal Revenue { get; set; }
    }

    public class OccupancyByRoomTypeDTO
    {
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public int TotalRooms { get; set; }
        public int StaysCount { get; set; } 
        public int OccupiedNights { get; set; }
        public double OccupancyRate { get; set; }
        public decimal Revenue { get; set; }
    }
}