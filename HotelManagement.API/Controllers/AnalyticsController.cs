using HotelManagement.Core.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.API.Extensions;

namespace HotelManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            // Конвертируем даты в UTC, если они не имеют указанного Kind
            var utcStartDate = startDate.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(startDate, DateTimeKind.Utc)
                : startDate.ToUniversalTime();

            var utcEndDate = endDate.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(endDate, DateTimeKind.Utc)
                : endDate.ToUniversalTime();

            var report = await _analyticsService.GetRevenueReportAsync(utcStartDate, utcEndDate);
            return Ok(report);
        }

        [HttpGet("occupancy")]
        public async Task<IActionResult> GetOccupancyReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            // Конвертируем даты в UTC, если они не имеют указанного Kind
            var utcStartDate = startDate.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(startDate, DateTimeKind.Utc)
                : startDate.ToUniversalTime();

            var utcEndDate = endDate.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(endDate, DateTimeKind.Utc)
                : endDate.ToUniversalTime();

            var report = await _analyticsService.GetOccupancyReportAsync(utcStartDate, utcEndDate);
            return Ok(report);
        }

        [HttpGet("services")]
        public async Task<IActionResult> GetServicesReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            // Конвертируем даты в UTC, если они не имеют указанного Kind
            var utcStartDate = startDate.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(startDate, DateTimeKind.Utc)
                : startDate.ToUniversalTime();

            var utcEndDate = endDate.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(endDate, DateTimeKind.Utc)
                : endDate.ToUniversalTime();

            var report = await _analyticsService.GetServicesReportAsync(utcStartDate, utcEndDate);
            return Ok(report);
        }

        [HttpGet("guests")]
        public async Task<IActionResult> GetGuestAnalyticsReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            // Конвертируем даты в UTC, если они не имеют указанного Kind
            var utcStartDate = startDate.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(startDate, DateTimeKind.Utc)
                : startDate.ToUniversalTime();

            var utcEndDate = endDate.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(endDate, DateTimeKind.Utc)
                : endDate.ToUniversalTime();

            var report = await _analyticsService.GetGuestAnalyticsReportAsync(utcStartDate, utcEndDate);
            return Ok(report);
        }

        [HttpGet("export/excel/{reportType}")]
        public async Task<IActionResult> ExportToExcel(string reportType, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] string language = "ru")
        {
            var utcStartDate = startDate.EnsureUtc();
            var utcEndDate = endDate.EnsureUtc();

            try
            {
                var excelData = await _analyticsService.ExportReportToExcelAsync(reportType, utcStartDate, utcEndDate, language);
                var fileName = $"{reportType}_report_{utcStartDate:yyyyMMdd}_{utcEndDate:yyyyMMdd}.xlsx";

                return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при экспорте в Excel: {ex.Message}");
            }
        }

        [HttpGet("export/pdf/{reportType}")]
        public async Task<IActionResult> ExportToPdf(string reportType, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] string language = "ru")
        {
            var utcStartDate = startDate.EnsureUtc();
            var utcEndDate = endDate.EnsureUtc();

            try
            {
                var pdfData = await _analyticsService.ExportReportToPdfAsync(reportType, utcStartDate, utcEndDate, language);
                var fileName = $"{reportType}_report_{utcStartDate:yyyyMMdd}_{utcEndDate:yyyyMMdd}.pdf";

                return File(pdfData, "application/pdf", fileName);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ошибка при экспорте в PDF: {ex.Message}");
            }
        }
    }
}