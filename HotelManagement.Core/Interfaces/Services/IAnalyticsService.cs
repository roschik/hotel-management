using HotelManagement.Core.DTOs.Reports;
using System;
using System.Threading.Tasks;

namespace HotelManagement.Core.Interfaces.Services
{
    public interface IAnalyticsService
    {
        Task<RevenueReportDTO> GetRevenueReportAsync(DateTime startDate, DateTime endDate);
        Task<OccupancyReportDTO> GetOccupancyReportAsync(DateTime startDate, DateTime endDate);
        Task<ServicesReportDTO> GetServicesReportAsync(DateTime startDate, DateTime endDate);
        Task<GuestAnalyticsReportDTO> GetGuestAnalyticsReportAsync(DateTime startDate, DateTime endDate);
        
        // Методы для экспорта
        Task<byte[]> ExportReportToExcelAsync(string reportType, DateTime startDate, DateTime endDate, string language = "ru");
        Task<byte[]> ExportReportToPdfAsync(string reportType, DateTime startDate, DateTime endDate, string language = "ru");
    }
}