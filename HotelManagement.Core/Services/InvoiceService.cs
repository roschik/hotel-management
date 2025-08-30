using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;

namespace HotelManagement.Core.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IStayRepository _stayRepository;
        private readonly IServiceSaleRepository _serviceSaleRepository;
        private readonly IMapper _mapper;

        public InvoiceService(
            IStayRepository stayRepository,
            IServiceSaleRepository serviceSaleRepository,
            IMapper mapper)
        {
            _stayRepository = stayRepository;
            _serviceSaleRepository = serviceSaleRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<InvoiceDTO>> GetAllInvoicesAsync()
        {
            var stays = await _stayRepository.GetAllStaysWithDetailsAsync();
            var invoices = new List<InvoiceDTO>();

            foreach (var stay in stays)
            {
                var invoice = await BuildInvoiceFromStayAsync(stay);
                invoices.Add(invoice);
            }

            return invoices;
        }

        public async Task<InvoiceDTO> GetInvoiceByStayIdAsync(int stayId)
        {
            var stay = await _stayRepository.GetStayWithDetailsAsync(stayId);
            if (stay == null)
                throw new KeyNotFoundException($"Stay with ID {stayId} not found.");

            return await BuildInvoiceFromStayAsync(stay);
        }

        public async Task<IEnumerable<InvoiceDTO>> GetInvoicesByBookingIdAsync(int bookingId)
        {
            var stays = await _stayRepository.GetStaysByBookingIdAsync(bookingId);
            var invoices = new List<InvoiceDTO>();

            foreach (var stay in stays)
            {
                var invoice = await BuildInvoiceFromStayAsync(stay);
                invoices.Add(invoice);
            }

            return invoices;
        }

        public async Task<IEnumerable<InvoiceDTO>> GetInvoicesByGuestIdAsync(int guestId)
        {
            var stays = await _stayRepository.GetStaysByGuestIdAsync(guestId);
            var invoices = new List<InvoiceDTO>();

            foreach (var stay in stays)
            {
                var invoice = await BuildInvoiceFromStayAsync(stay);
                invoices.Add(invoice);
            }

            return invoices;
        }

        public async Task<IEnumerable<InvoiceDTO>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var stays = await _stayRepository.GetStaysByDateRangeAsync(startDate, endDate);
            var invoices = new List<InvoiceDTO>();

            foreach (var stay in stays)
            {
                var invoice = await BuildInvoiceFromStayAsync(stay);
                invoices.Add(invoice);
            }

            return invoices.OrderBy(i => i.IssueDate);
        }

        public async Task<IEnumerable<InvoiceDTO>> GetPaidInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var paidStays = await _stayRepository.GetPaidStaysByDateRangeAsync(startDate, endDate);
            var invoices = new List<InvoiceDTO>();

            foreach (var stay in paidStays)
            {
                var invoice = await BuildInvoiceFromStayAsync(stay);
                invoices.Add(invoice);
            }

            return invoices.OrderBy(i => i.PaymentDate);
        }

        public async Task<IEnumerable<InvoiceDTO>> GetUnpaidInvoicesAsync()
        {
            var unpaidStays = await _stayRepository.GetStaysByPaymentStatusAsync(1);
            var invoices = new List<InvoiceDTO>();

            foreach (var stay in unpaidStays)
            {
                var invoice = await BuildInvoiceFromStayAsync(stay);
                invoices.Add(invoice);
            }

            return invoices.OrderBy(i => i.DueDate);
        }

        public async Task<decimal> GetTotalRevenueAsync(DateTime startDate, DateTime endDate)
        {
            var paidStays = await _stayRepository.GetPaidStaysByDateRangeAsync(startDate, endDate);
            return paidStays.Sum(s => s.PaidAmount);
        }

        public async Task<InvoiceDTO> UpdatePaymentAsync(int stayId, UpdatePaymentDTO updatePaymentDto)
        {
            var stay = await _stayRepository.GetStayWithDetailsAsync(stayId);
            if (stay == null)
                throw new KeyNotFoundException($"Stay with ID {stayId} not found.");

            stay.PaidAmount = updatePaymentDto.PaidAmount;
            stay.PaymentStatusId = updatePaymentDto.PaymentStatusId;
            stay.PaymentDate = updatePaymentDto.PaymentDate;
            stay.UpdatedAt = DateTime.UtcNow;

            await _stayRepository.UpdateAsync(stay);
            await _stayRepository.SaveChangesAsync();

            return await BuildInvoiceFromStayAsync(stay);
        }

        private async Task<InvoiceDTO> BuildInvoiceFromStayAsync(Stay stay)
        {
            // Получаем услуги для данного проживания по StayId, исключая отмененные (PaymentStatusId = 5)
            var serviceSales = await _serviceSaleRepository.GetServiceSalesByStayIdAsync(stay.StayId);
            var activeServiceSales = serviceSales.Where(ss => ss.PaymentStatusId != 5).ToList();
            
            var serviceCharges = activeServiceSales.Sum(ss => ss.TotalPrice);
            var paidServiceCharges = activeServiceSales.Where(ss => ss.PaymentStatusId == 3).Sum(ss => ss.TotalPrice);
            var unpaidServiceCharges = activeServiceSales.Where(ss => ss.PaymentStatusId != 3).Sum(ss => ss.TotalPrice);
            var serviceItems = _mapper.Map<List<ServiceSaleItemDTO>>(activeServiceSales);
        
            var invoice = _mapper.Map<InvoiceDTO>(stay);
            invoice.ServiceCharges = serviceCharges;
            invoice.PaidServiceCharges = paidServiceCharges;
            invoice.UnpaidServiceCharges = unpaidServiceCharges;
            invoice.ServiceItems = serviceItems;
        
            return invoice;
        }
    }
}