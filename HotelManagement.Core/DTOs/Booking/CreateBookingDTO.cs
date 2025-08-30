using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Core.DTOs
{
    public class CreateBookingDTO
    {
        [Required(ErrorMessage = "Идентификатор гостя обязателен")]
        public int GuestId { get; set; }

        [Required(ErrorMessage = "Идентификатор номера обязателен")]
        public int RoomId { get; set; }

        [Required(ErrorMessage = "Идентификатор типа бронирования обязателен")]
        public int BookingTypeId { get; set; }

        [Required(ErrorMessage = "Идентификатор статуса бронирования обязателен")]
        public int BookingStatusId { get; set; } = 4; 

        public int? EmployeeId { get; set; } 
        
        [Required(ErrorMessage = "Дата заезда обязательна")]
        [DataType(DataType.Date)]
        public DateTime CheckInDate { get; set; }

        [Required(ErrorMessage = "Дата выезда обязательна")]
        [DataType(DataType.Date)]
        public DateTime CheckOutDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Общая стоимость должна быть положительной")]
        public decimal TotalPrice { get; set; }

        [StringLength(500, ErrorMessage = "Примечания не должны превышать 500 символов")]
        public string? Notes { get; set; }
    }
}
