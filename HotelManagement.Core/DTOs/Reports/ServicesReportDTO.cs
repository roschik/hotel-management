namespace HotelManagement.Core.DTOs.Reports
{
    public class ServicesReportDTO
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalServiceRevenue { get; set; }
        public int TotalServicesOrdered { get; set; }
        public decimal AverageServiceValue { get; set; }
        public List<ServicePopularityDTO> ServicePopularity { get; set; } = new();
        public List<ServiceCategoryReportDTO> CategoryReports { get; set; } = new();
        public List<ServiceRevenueByPeriodDTO> RevenueByPeriod { get; set; } = new();
    }

    public class ServicePopularityDTO
    {
        public int ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int TimesOrdered { get; set; }
        public decimal TotalRevenue { get; set; }
        public int PopularityRank { get; set; }
    }

    public class ServiceCategoryReportDTO
    {
        public string Category { get; set; } = string.Empty;
        public int ServicesCount { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class ServiceRevenueByPeriodDTO
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int OrdersCount { get; set; }
    }
}