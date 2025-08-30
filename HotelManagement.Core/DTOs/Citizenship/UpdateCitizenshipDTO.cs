using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Core.DTOs
{
    public class UpdateCitizenshipDTO
    {
        [Required(ErrorMessage = "Название гражданства обязательно")]
        [MaxLength(100, ErrorMessage = "Название не может превышать 100 символов")]
        public string Name { get; set; }
        
        [Required(ErrorMessage = "Код страны обязателен")]
        [MaxLength(3, ErrorMessage = "Код не может превышать 3 символа")]
        public string Code { get; set; }
        
        [MaxLength(500, ErrorMessage = "Описание не может превышать 500 символов")]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; }
    }
}