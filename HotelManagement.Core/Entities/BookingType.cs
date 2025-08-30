using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelManagement.Core.Entities
{
    public class BookingType
    {
        public int BookingTypeId { get; set; }
        public string Name { get; set; } 
        public string Description { get; set; }

        // Навигационные свойства
        public ICollection<Booking> Bookings { get; set; }
    }
}
