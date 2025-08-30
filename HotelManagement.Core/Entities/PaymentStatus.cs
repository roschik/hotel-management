namespace HotelManagement.Core.Entities
{
    public class PaymentStatus
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        // Навигационные свойства
        public ICollection<ServiceSale> ServiceSales { get; set; }
        public ICollection<Stay> Stays { get; set; }
    }
}