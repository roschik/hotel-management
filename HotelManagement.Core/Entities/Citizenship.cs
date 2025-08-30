namespace HotelManagement.Core.Entities
{
    public class Citizenship
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; } // ISO код страны 
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Навигационные свойства
        public ICollection<Guest> Guests { get; set; }
    }
}