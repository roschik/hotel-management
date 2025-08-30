namespace HotelManagement.Core.DTOs
{
    public class UpdateServiceDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsActive { get; set; }
        public string ImageUrl { get; set; }
    }
}