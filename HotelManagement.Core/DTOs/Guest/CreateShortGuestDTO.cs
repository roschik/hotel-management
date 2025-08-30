namespace HotelManagement.Core.DTOs
{
    public class CreateShortGuestDTO
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Phone { get; set; }
        public string? MiddleName { get; set; }
        public string? Email { get; set; }
        public int IdentificationTypeId { get; set; } = 1;
        public int CitizenshipId { get; set; } = 1;
    }
}
