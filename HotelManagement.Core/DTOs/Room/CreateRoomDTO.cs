using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Core.DTOs
{
    public class CreateRoomDTO
    {
        [Required]
        public string RoomNumber { get; set; }

        [Required]
        public int RoomTypeId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Этаж должен быть больше 0")]
        public int Floor { get; set; }
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Вместимость должна быть больше 0")]
        public int Capacity { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Цена за ночь должна быть больше 0")]
        public decimal PricePerNight { get; set; }
        public bool IsAvailable { get; set; } = true;
        public bool HasWifi { get; set; } = true;
        public bool HasTV { get; set; } = true;
        public bool HasMinibar { get; set; } = false;
        public bool HasAirConditioning { get; set; } = true;
        public bool HasBalcony { get; set; } = false;
        public string? ImageUrl { get; set; }
    }
}