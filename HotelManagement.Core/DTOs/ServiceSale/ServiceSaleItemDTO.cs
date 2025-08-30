namespace HotelManagement.Core.DTOs
{
    public class ServiceSaleItemDTO
    {
        public string ServiceName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal TaxAmount { get; set; }
        public DateTime SaleDate { get; set; }
        public int PaymentStatusId { get; set; }
        public string PaymentStatusName { get; set; }
    }
}
