namespace HotelManagement.Core.Entities
{
    public class EmployeeStatus
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        // Навигационные свойства
        public ICollection<Employee> Employees { get; set; }
    }
}