namespace HotelManagement.Core.DTOs
{
    public class InvoiceDTO
    {
        public int StayId { get; set; }
        public int BookingId { get; set; }
        public int GuestId { get; set; }
        public string GuestName { get; set; }
        public string RoomNumber { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NumberOfDays { get; set; }
        public decimal DailyRate { get; set; }
        
        public decimal RoomCharges { get; set; }
        public decimal RoomTaxAmount { get; set; }
        public decimal ServiceCharges { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public string PaymentStatus { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string Notes { get; set; }
        
        // Детализация услуг
        public List<ServiceSaleItemDTO> ServiceItems { get; set; } = new List<ServiceSaleItemDTO>();
        
        // Дополнительные поля для анализа услуг
        public decimal PaidServiceCharges { get; set; }
        public decimal UnpaidServiceCharges { get; set; }
    }
}