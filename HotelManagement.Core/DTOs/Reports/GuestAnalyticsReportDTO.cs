namespace HotelManagement.Core.DTOs.Reports
{
    public class GuestAnalyticsReportDTO
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalGuests { get; set; }
        public int NewGuests { get; set; }
        public int ReturningGuests { get; set; }
        public double ReturnGuestRate { get; set; }
        public double AverageStayDuration { get; set; }
        public decimal AverageSpendingPerGuest { get; set; }
        public decimal TotalGuestRevenue { get; set; }
        public List<GuestSegmentDTO> GuestSegments { get; set; } = new();
        public List<TopGuestDTO> TopGuests { get; set; } = new();
        public List<GuestDemographicsDTO> Demographics { get; set; } = new();
    }

    public class GuestSegmentDTO
    {
        public string SegmentName { get; set; } = string.Empty;
        public int GuestCount { get; set; }
        public decimal TotalRevenue { get; set; }
        public double AverageStayDuration { get; set; }
        public decimal AverageSpending { get; set; }
    }

    public class TopGuestDTO
    {
        public int GuestId { get; set; }
        public string GuestName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int StaysCount { get; set; } 
        public decimal TotalSpent { get; set; }
        public DateTime LastVisit { get; set; }
    }

    public class GuestDemographicsDTO
    {
        public string Category { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }
}