using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Core.DTOs
{
    public class CreateGuestDTO
    {
        [Required(ErrorMessage = "Имя обязательно")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Фамилия обязательна")]
        public string LastName { get; set; }

        public string MiddleName { get; set; }

        public string? Email { get; set; }

        [Required(ErrorMessage = "Телефон обязателен")]
        public string Phone { get; set; }

        public string Address { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public string? PostalCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int IdentificationTypeId { get; set; }
        public string? IdentificationNumber { get; set; }
        public string? IdentificationIssuedBy { get; set; }
        public DateTime? IdentificationIssuedDate { get; set; }
        public string? Notes { get; set; }
        public int CitizenshipId { get; set; }
    }
}