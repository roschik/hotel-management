
namespace HotelManagement.Core.DTOs
{
    public class StayDTO
    {
        public int StayId { get; set; }
        public int BookingId { get; set; }
        public int RoomId { get; set; }
        public string RoomNumber { get; set; }
        public string GuestName { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public DateTime ActualCheckInDate { get; set; }
        public DateTime? ActualCheckOutDate { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<StayGuestDTO> StayGuests { get; set; } = new List<StayGuestDTO>();
        public decimal? TotalAmount { get; set; }
        public decimal? PaidAmount { get; set; }
        public DateTime? DueDate { get; set; }
        public int PaymentStatusId { get; set; }
        public string PaymentStatusName { get; set; }
        public DateTime? PaymentDate { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal TaxPercent { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeePosition { get; set; }
    }
}