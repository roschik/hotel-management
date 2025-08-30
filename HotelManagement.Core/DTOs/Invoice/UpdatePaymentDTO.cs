using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Core.DTOs
{
    public class UpdatePaymentDTO
    {
        public decimal PaidAmount { get; set; }
        public int PaymentStatusId { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string TransactionId { get; set; }
    }
}