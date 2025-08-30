namespace HotelManagement.Core.DTOs
{
    public class GuestDTO
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MiddleName { get; set; }
        public string? Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public DateTime RegistrationDate { get; set; }
        public string? PostalCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int IdentificationTypeId { get; set; }
        public string IdentificationTypeName { get; set; }
        public string? IdentificationNumber { get; set; }
        public string? IdentificationIssuedBy { get; set; }
        public DateTime? IdentificationIssuedDate { get; set; }
        public string? Notes { get; set; }
        public int BookingsCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CitizenshipId { get; set; }
        public string CitizenshipName { get; set; }
        public string CitizenshipCode { get; set; }
    }
}