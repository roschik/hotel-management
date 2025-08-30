namespace HotelManagement.Core.Entities
{
    public class IdentificationType
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        // Навигационные свойства
        public ICollection<Guest> Guests { get; set; }
    }
}
