namespace HotelManagement.Core.Entities
{
    public class Guest
    {
        public int GuestId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? MiddleName { get; set; }
        public string? Email { get; set; }
        public string Phone { get; set; }
        public string? Address { get; set; } 
        public string? PostalCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int IdentificationTypeId { get; set; } = 1; 
        public string? IdentificationNumber { get; set; }
        public string? IdentificationIssuedBy { get; set; }
        public DateTime? IdentificationIssuedDate { get; set; } 
        public string? Notes { get; set; } 
        public DateTime? RegistrationDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CitizenshipId { get; set; } = 1; 

        // Навигационные свойства
        public ICollection<StayGuest> StayGuests { get; set; }
        public ICollection<Booking> Bookings { get; set; }
        public ICollection<ServiceSale> ServiceSales { get; set; }
        public IdentificationType IdentificationType { get; set; }
        public Citizenship Citizenship { get; set; }
    }
}