using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;

namespace HotelManagement.Core.Services
{
    public class ServiceSaleService : IServiceSaleService
    {
        private readonly IServiceSaleRepository _serviceSaleRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IMapper _mapper;

        public ServiceSaleService(
            IServiceSaleRepository serviceSaleRepository,
            IServiceRepository serviceRepository,
            IEmployeeRepository employeeRepository,
            IMapper mapper)
        {
            _serviceSaleRepository = serviceSaleRepository;
            _serviceRepository = serviceRepository;
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ServiceSaleDTO>> GetAllServiceSalesAsync()
        {
            var serviceSales = await _serviceSaleRepository.GetAllServiceSalesWithDetailsAsync();
            return _mapper.Map<IEnumerable<ServiceSaleDTO>>(serviceSales);
        }

        public async Task<ServiceSaleDTO> GetServiceSaleByIdAsync(int id)
        {
            var serviceSale = await _serviceSaleRepository.GetServiceSaleWithDetailsAsync(id);
            if (serviceSale == null)
                throw new KeyNotFoundException($"Service sale with ID {id} not found.");

            return _mapper.Map<ServiceSaleDTO>(serviceSale);
        }

        public async Task<ServiceSaleDTO> CreateServiceSaleAsync(CreateServiceSaleDTO createServiceSaleDTO)
        {
            // Проверяем существование услуги
            var service = await _serviceRepository.GetByIdAsync(createServiceSaleDTO.ServiceId);
            if (service == null)
                throw new KeyNotFoundException($"Service with ID {createServiceSaleDTO.ServiceId} not found.");

            // Проверяем существование сотрудника
            var employee = await _employeeRepository.GetByIdAsync(createServiceSaleDTO.EmployeeId);
            if (employee == null)
                throw new KeyNotFoundException($"Employee with ID {createServiceSaleDTO.EmployeeId} not found.");

            // Создаем новую продажу
            var serviceSale = new ServiceSale
            {
                ServiceId = createServiceSaleDTO.ServiceId,
                EmployeeId = createServiceSaleDTO.EmployeeId,
                GuestId = createServiceSaleDTO.GuestId,
                StayId = createServiceSaleDTO.StayId, 
                Quantity = createServiceSaleDTO.Quantity,
                UnitPrice = createServiceSaleDTO.UnitPrice, 
                TotalPrice = createServiceSaleDTO.TotalPrice,
                TaxPercent = createServiceSaleDTO.TaxPercent, 
                SaleDate = createServiceSaleDTO.SaleDate,
                Notes = createServiceSaleDTO.Notes,
                PaymentStatusId = createServiceSaleDTO.PaymentStatusId,
                CreatedAt = DateTime.UtcNow
            };

            await _serviceSaleRepository.AddAsync(serviceSale);
            await _serviceSaleRepository.SaveChangesAsync();

            return await GetServiceSaleByIdAsync(serviceSale.ServiceSaleId);
        }

        public async Task DeleteServiceSaleAsync(int id)
        {
            var serviceSale = await _serviceSaleRepository.GetByIdAsync(id);
            if (serviceSale == null)
                throw new KeyNotFoundException($"Service sale with ID {id} not found.");

            await _serviceSaleRepository.DeleteAsync(serviceSale);
            await _serviceSaleRepository.SaveChangesAsync();
        }

        public async Task<IEnumerable<ServiceSaleDTO>> GetServiceSalesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var serviceSales = await _serviceSaleRepository.GetServiceSalesByDateRangeAsync(startDate, endDate);
            return _mapper.Map<IEnumerable<ServiceSaleDTO>>(serviceSales);
        }

        public async Task<IEnumerable<ServiceSaleDTO>> GetServiceSalesByEmployeeAsync(int employeeId)
        {
            var serviceSales = await _serviceSaleRepository.GetServiceSalesByEmployeeAsync(employeeId);
            return _mapper.Map<IEnumerable<ServiceSaleDTO>>(serviceSales);
        }

        public async Task<IEnumerable<ServiceSaleDTO>> GetServiceSalesByServiceAsync(int serviceId)
        {
            var serviceSales = await _serviceSaleRepository.GetServiceSalesByServiceAsync(serviceId);
            return _mapper.Map<IEnumerable<ServiceSaleDTO>>(serviceSales);
        }

        public async Task<decimal> GetTotalSalesRevenueAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var serviceSales = startDate.HasValue && endDate.HasValue
                ? await _serviceSaleRepository.GetServiceSalesByDateRangeAsync(startDate.Value, endDate.Value)
                : await _serviceSaleRepository.GetAllAsync();

            return serviceSales.Sum(ss => ss.TotalPrice);
        }

        public async Task<ServiceSaleDTO> UpdateServiceSaleAsync(int id, CreateServiceSaleDTO updateServiceSaleDTO)
        {
            var existingServiceSale = await _serviceSaleRepository.GetByIdAsync(id);
            if (existingServiceSale == null)
                throw new KeyNotFoundException($"Service sale with ID {id} not found.");
        
            // Обновляем поля
            existingServiceSale.ServiceId = updateServiceSaleDTO.ServiceId;
            existingServiceSale.EmployeeId = updateServiceSaleDTO.EmployeeId;
            existingServiceSale.GuestId = updateServiceSaleDTO.GuestId;
            existingServiceSale.StayId = updateServiceSaleDTO.StayId;
            existingServiceSale.Quantity = updateServiceSaleDTO.Quantity;
            existingServiceSale.UnitPrice = updateServiceSaleDTO.UnitPrice;
            existingServiceSale.TotalPrice = updateServiceSaleDTO.TotalPrice;
            existingServiceSale.TaxPercent = updateServiceSaleDTO.TaxPercent;
            existingServiceSale.PaymentStatusId = updateServiceSaleDTO.PaymentStatusId;
            existingServiceSale.SaleDate = updateServiceSaleDTO.SaleDate;
            existingServiceSale.Notes = updateServiceSaleDTO.Notes;
        
            await _serviceSaleRepository.UpdateAsync(existingServiceSale);
            await _serviceSaleRepository.SaveChangesAsync();
        
            return await GetServiceSaleByIdAsync(id);
        }
    }
}