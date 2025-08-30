using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Core.Entities
{
    public class ServiceSale
    {
        public int ServiceSaleId { get; set; }
        public int ServiceId { get; set; }
        public int EmployeeId { get; set; }
        public int? GuestId { get; set; }
        public int? StayId { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal TaxPercent { get; set; }
        public DateTime SaleDate { get; set; }
        public string Notes { get; set; }
        public int PaymentStatusId { get; set; }
        public DateTime CreatedAt { get; set; }

        // Навигационные свойства
        public Service Service { get; set; }
        public Employee Employee { get; set; }
        public Guest Guest { get; set; }
        public Stay Stay { get; set; } 
        public PaymentStatus PaymentStatus { get; set; }
    }
}