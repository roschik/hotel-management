using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Core.DTOs
{
    public class CreateServiceSaleDTO
    {
        [Required(ErrorMessage = "Идентификатор услуги обязателен")]
        public int ServiceId { get; set; }

        [Required(ErrorMessage = "Идентификатор сотрудника обязателен")]
        public int EmployeeId { get; set; }

        public int? GuestId { get; set; }
        public int? StayId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Количество должно быть больше 0")]
        public int Quantity { get; set; } = 1;

        [Required(ErrorMessage = "Цена за единицу обязательна")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Цена должна быть больше 0")]
        public decimal UnitPrice { get; set; }

        [Required(ErrorMessage = "Общая стоимость обязательна")]
        [Range(0, double.MaxValue, ErrorMessage = "Общая стоимость должна быть положительной")]
        public decimal TotalPrice { get; set; }

        [Required(ErrorMessage = "Процент налога обязателен")]
        [Range(0, 100, ErrorMessage = "Процент налога должен быть от 0 до 100")]
        public decimal TaxPercent { get; set; } = 20;

        public DateTime SaleDate { get; set; } = DateTime.Now;

        [StringLength(500, ErrorMessage = "Примечания не должны превышать 500 символов")]
        public string Notes { get; set; }

        [Required(ErrorMessage = "Статус оплаты обязателен")]
        public int PaymentStatusId { get; set; } = 1; // По умолчанию "Ожидает оплаты"

    }
}