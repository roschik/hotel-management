using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Core.DTOs
{
    public class CreateStayDTO
    {
        [Required(ErrorMessage = "Идентификатор бронирования обязателен")]
        public int BookingId { get; set; }

        [Required(ErrorMessage = "Дата фактического заезда обязательна")]
        public DateTime ActualCheckInDate { get; set; }

        public DateTime? ActualCheckOutDate { get; set; }

        [StringLength(500, ErrorMessage = "Примечания не должны превышать 500 символов")]
        public string Notes { get; set; }

        [Required(ErrorMessage = "Общая сумма обязательна")]
        [Range(0, double.MaxValue, ErrorMessage = "Общая сумма должна быть положительной")]
        public decimal TotalAmount { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Оплаченная сумма должна быть положительной")]
        public decimal PaidAmount { get; set; } = 0;

        [Required(ErrorMessage = "Дата оплаты обязательна")]
        public DateTime DueDate { get; set; }

        [Required(ErrorMessage = "Статус оплаты обязателен")]
        public int PaymentStatusId { get; set; } = 1; 

        public DateTime? PaymentDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Процент налога должен быть положительным")]
        public decimal TaxPercent { get; set; } = 20;

        [Required(ErrorMessage = "Ответственный сотрудник обязателен")]
        public int EmployeeId { get; set; }

        public List<StayGuestDTO> StayGuests { get; set; } = new List<StayGuestDTO>();
    }
}