namespace HotelManagement.Core.DTOs
{
    public class ServiceSaleDTO
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeePosition { get; set; }
        public int? GuestId { get; set; }
        public string GuestName { get; set; }
        public int? StayId { get; set; }
        public string StayInfo { get; set; } 
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal TaxPercent { get; set; }
        public DateTime SaleDate { get; set; }
        public string Notes { get; set; }
        public int PaymentStatusId { get; set; }
        public string PaymentStatusName { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}