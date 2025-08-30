using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Core.DTOs
{
    public class UpdateEmployeeDTO
    {
        [StringLength(50, ErrorMessage = "Имя не должно превышать 50 символов")]
        public string FirstName { get; set; }

        [StringLength(50, ErrorMessage = "Фамилия не должна превышать 50 символов")]
        public string LastName { get; set; }

        [StringLength(50, ErrorMessage = "Отчество не должно превышать 50 символов")]
        public string? MiddleName { get; set; }

        [EmailAddress(ErrorMessage = "Некорректный email")]
        [StringLength(100, ErrorMessage = "Email не должен превышать 100 символов")]
        public string Email { get; set; }

        [StringLength(20, ErrorMessage = "Телефон не должен превышать 20 символов")]
        public string Phone { get; set; }

        [StringLength(50, ErrorMessage = "Должность не должна превышать 50 символов")]
        public string Position { get; set; }

        public int DepartmentId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Зарплата должна быть положительной")]
        public decimal Salary { get; set; }

        public int EmployeeStatusId { get; set; }

        [StringLength(200, ErrorMessage = "Адрес не должен превышать 200 символов")]
        public string Address { get; set; }

        [StringLength(100, ErrorMessage = "Имя контактного лица не должно превышать 100 символов")]
        public string? EmergencyContactName { get; set; }

        [StringLength(20, ErrorMessage = "Телефон контактного лица не должен превышать 20 символов")]
        public string? EmergencyContactPhone { get; set; }
    }
}