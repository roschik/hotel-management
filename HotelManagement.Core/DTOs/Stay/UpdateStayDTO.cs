using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Core.DTOs
{
    public class UpdateStayDTO
    {
        [Required(ErrorMessage = "Идентификатор бронирования обязателен")]
        public int BookingId { get; set; }

        [Required(ErrorMessage = "Дата фактического заезда обязательна")]
        public DateTime ActualCheckInDate { get; set; }
        public DateTime? ActualCheckOutDate { get; set; }

        [StringLength(500, ErrorMessage = "Примечания не должны превышать 500 символов")]
        public string? Notes { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Общая сумма должна быть положительной")]
        public decimal? TotalAmount { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Оплаченная сумма должна быть положительной")]
        public decimal? PaidAmount { get; set; }

        public DateTime? DueDate { get; set; }

        public int? PaymentStatusId { get; set; }

        public DateTime? PaymentDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Процент налога должен быть положительным")]
        public decimal? TaxPercent { get; set; }
        public int? EmployeeId { get; set; }
        public List<StayGuestDTO> StayGuests { get; set; } = new List<StayGuestDTO>();
    }
}