namespace HotelManagement.Core.DTOs
{
    public class EmployeeDTO
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? MiddleName { get; set; }
        public string? Email { get; set; }
        public string Phone { get; set; }
        public string Position { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public DateTime HireDate { get; set; }
        public decimal Salary { get; set; }
        public int EmployeeStatusId { get; set; }
        public string EmployeeStatusName { get; set; }
        public string Address { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public bool IsActive { get; set; }
    }
}