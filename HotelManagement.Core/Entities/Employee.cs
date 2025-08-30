namespace HotelManagement.Core.Entities
{
    public class Employee
    {
        public int EmployeeId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MiddleName { get; set; }
        public string? Email { get; set; }
        public string Phone { get; set; }
        public string Position { get; set; }
        public int DepartmentId { get; set; }
        public DateTime HireDate { get; set; }
        public decimal Salary { get; set; }
        public int EmployeeStatusId { get; set; }
        public string Address { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public bool IsActive { get; set; }

        // Навигационные свойства
        public Department Department { get; set; }
        public EmployeeStatus EmployeeStatus { get; set; }
        public ICollection<Booking> Bookings { get; set; }
        public ICollection<Stay> Stays { get; set; }
        public ICollection<ServiceSale> ServiceSales { get; set; }
    }
}