namespace HotelManagement.Core.DTOs.Reports
{
    public class RevenueReportDTO
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AccommodationRevenue { get; set; } 
        public decimal ServiceRevenue { get; set; }
        public decimal TaxCollected { get; set; }
        public int InvoiceCount { get; set; }
        public decimal AverageStayValue { get; set; } 
        public List<RevenueByRoomTypeDTO> RevenueByRoomType { get; set; } = new();
        public List<RevenueByServiceCategoryDTO> RevenueByServiceCategory { get; set; } = new();
    }

    public class RevenueByRoomTypeDTO
    {
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public decimal AccommodationRevenue { get; set; } 
        public decimal ServiceRevenue { get; set; }
        public int StaysCount { get; set; }
        public decimal AverageRate { get; set; }
    }

    public class RevenueByServiceCategoryDTO
    {
        public string Category { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int OrdersCount { get; set; }
        public decimal AverageOrderValue { get; set; }
    }
}