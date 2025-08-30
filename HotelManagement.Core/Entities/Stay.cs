namespace HotelManagement.Core.Entities
{
    public class Stay
    {
        public int StayId { get; set; }
        public int BookingId { get; set; }
        public DateTime ActualCheckInDate { get; set; }
        public DateTime? ActualCheckOutDate { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public DateTime DueDate { get; set; }
        public int PaymentStatusId { get; set; }
        public DateTime? PaymentDate { get; set; }
        public decimal TaxPercent { get; set; }
        public int? EmployeeId { get; set; }

        // Навигационные свойства
        public Booking Booking { get; set; }
        public ICollection<StayGuest> StayGuests { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public Employee Employee { get; set; }
    }
}