namespace HotelManagement.Core.Entities
{
    public class Service
    {
        public int ServiceId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsActive { get; set; }
        public string ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } 

        // Навигационные свойства
        public ICollection<ServiceSale> ServiceSales { get; set; }
    }
}