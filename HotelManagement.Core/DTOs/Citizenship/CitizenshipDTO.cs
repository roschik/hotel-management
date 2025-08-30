namespace HotelManagement.Core.DTOs
{
    public class CitizenshipDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}