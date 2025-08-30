using AutoMapper;
using HotelManagement.Core.DTOs.Reports;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;
using OfficeOpenXml;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace HotelManagement.Core.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IStayRepository _stayRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IGuestRepository _guestRepository;
        private readonly IServiceSaleRepository _serviceSaleRepository;
        private readonly IRoomTypeRepository _roomTypeRepository;
        private readonly IMapper _mapper;

        public AnalyticsService(
            IBookingRepository bookingRepository,
            IStayRepository stayRepository,
            IRoomRepository roomRepository,
            IEmployeeRepository employeeRepository,
            IServiceRepository serviceRepository,
            IGuestRepository guestRepository,
            IServiceSaleRepository serviceSaleRepository,
            IRoomTypeRepository roomTypeRepository,
            IMapper mapper)
        {
            _bookingRepository = bookingRepository;
            _stayRepository = stayRepository;
            _roomRepository = roomRepository;
            _employeeRepository = employeeRepository;
            _serviceRepository = serviceRepository;
            _guestRepository = guestRepository;
            _serviceSaleRepository = serviceSaleRepository;
            _roomTypeRepository = roomTypeRepository;
            _mapper = mapper;
        }

        public async Task<RevenueReportDTO> GetRevenueReportAsync(DateTime startDate, DateTime endDate)
        {
            var stays = await _stayRepository.GetStaysByDateRangeAsync(startDate, endDate);
            var bookings = await _bookingRepository.GetBookingsByDateRangeAsync(startDate, endDate); // Для планируемых доходов
            
            // Исключить отмененные услуги (PaymentStatusId != 5, где 5 - "Отменено")
            var serviceSales = (await _serviceSaleRepository.GetServiceSalesByDateRangeAsync(startDate, endDate))
                .Where(ss => ss.PaymentStatusId != 5).ToList();
            var roomTypes = await _roomTypeRepository.GetAllAsync();
            var services = await _serviceRepository.GetAllAsync();

            // Фактические доходы на основе проживаний
            var actualRoomRevenue = stays.Sum(s => s.TotalAmount);
            var actualServiceRevenue = serviceSales.Sum(s => s.TotalPrice);
            var actualTotalRevenue = actualRoomRevenue + actualServiceRevenue;
            
            // Планируемые доходы на основе бронирований
            var plannedRoomRevenue = bookings.Sum(b => b.TotalPrice);
            
            var taxCollected = actualTotalRevenue * 0.1m;
            var staysCount = stays.Count();
            var averageStayValue = staysCount > 0 ? actualTotalRevenue / staysCount : 0;

            // Доходы по типам комнат на основе проживаний с учетом услуг
            var revenueByRoomType = roomTypes.Select(rt => 
            {
                var roomTypeStays = stays.Where(s => s.Booking?.Room?.RoomTypeId == rt.Id).ToList();
                var accommodationRevenue = roomTypeStays.Sum(s => s.TotalAmount);
                
                // Получаем услуги для проживаний данного типа комнат
                var stayIds = roomTypeStays.Select(s => s.StayId).ToList();
                var roomTypeServiceRevenue = serviceSales
                    .Where(ss => stayIds.Contains(ss.StayId ?? 0))
                    .Sum(ss => ss.TotalPrice);
                
                var staysCount = roomTypeStays.Count;
                var totalRevenue = accommodationRevenue + roomTypeServiceRevenue;
                var averageRate = staysCount > 0 ? totalRevenue / staysCount : 0;
                
                return new RevenueByRoomTypeDTO
                {
                    RoomTypeId = rt.Id,
                    RoomTypeName = rt.Name,
                    AccommodationRevenue = accommodationRevenue,
                    ServiceRevenue = roomTypeServiceRevenue,
                    StaysCount = staysCount,
                    AverageRate = averageRate
                };
            }).Where(r => r.StaysCount > 0).ToList();

            var revenueByServiceCategory = new List<RevenueByServiceCategoryDTO>();

            return new RevenueReportDTO
            {
                StartDate = startDate,
                EndDate = endDate,
                TotalRevenue = actualTotalRevenue,
                AccommodationRevenue = actualRoomRevenue,
                ServiceRevenue = actualServiceRevenue,
                TaxCollected = taxCollected,
                InvoiceCount = staysCount, 
                AverageStayValue = averageStayValue,
                RevenueByRoomType = revenueByRoomType,
                RevenueByServiceCategory = revenueByServiceCategory 
            };
        }

        public async Task<OccupancyReportDTO> GetOccupancyReportAsync(DateTime startDate, DateTime endDate)
        {
            // Фактическая загруженность на основе проживаний
            var stays = await _stayRepository.GetStaysByDateRangeAsync(startDate, endDate);
            // Планируемая загруженность на основе бронирований
            var bookings = await _bookingRepository.GetBookingsByDateRangeAsync(startDate, endDate);
            var rooms = await _roomRepository.GetAllAsync();
            var roomTypes = await _roomTypeRepository.GetAllAsync();
            var totalRooms = rooms.Count();
            var totalDays = (endDate - startDate).Days + 1;
            var availableRoomNights = totalRooms * totalDays;

            // Детали по комнатам на основе фактических проживаний
            var roomDetails = rooms.Select(room => 
            {
                var roomStays = stays.Where(s => s.Booking?.RoomId == room.RoomId).ToList();
                var occupiedNights = roomStays.Sum(s => 
                {
                    var checkIn = s.ActualCheckInDate;
                    var checkOut = s.ActualCheckOutDate ?? DateTime.Now;
                    return Math.Max(0, (checkOut - checkIn).Days);
                });
                var occupancyRate = totalDays > 0 ? (double)occupiedNights / totalDays * 100 : 0;
                var revenue = roomStays.Sum(s => s.TotalAmount);
                var roomType = roomTypes.FirstOrDefault(rt => rt.Id == room.RoomTypeId);

                return new RoomOccupancyDetailDTO
                {
                    RoomId = room.RoomId,
                    RoomNumber = room.RoomNumber,
                    RoomType = roomType?.Name ?? "Unknown",
                    StaysCount = roomStays.Count,
                    OccupiedNights = occupiedNights,
                    OccupancyRate = occupancyRate,
                    Revenue = revenue
                };
            }).ToList();

            // Занятость по типам комнат на основе проживаний
            var occupancyByRoomType = roomTypes.Select(rt =>
            {
                var typeRooms = rooms.Where(r => r.RoomTypeId == rt.Id).ToList();
                var typeStays = stays.Where(s => typeRooms.Any(r => r.RoomId == s.Booking?.RoomId)).ToList();
                var typeOccupiedNights = typeStays.Sum(s => 
                {
                    var checkIn = s.ActualCheckInDate;
                    var checkOut = s.ActualCheckOutDate ?? DateTime.Now;
                    return Math.Max(0, (checkOut - checkIn).Days);
                });
                var typeAvailableNights = typeRooms.Count * totalDays;
                var typeOccupancyRate = typeAvailableNights > 0 ? (double)typeOccupiedNights / typeAvailableNights * 100 : 0;

                return new OccupancyByRoomTypeDTO
                {
                    RoomTypeId = rt.Id,
                    RoomTypeName = rt.Name,
                    TotalRooms = typeRooms.Count,
                    StaysCount = typeStays.Count, 
                    OccupiedNights = typeOccupiedNights,
                    OccupancyRate = typeOccupancyRate,
                    Revenue = typeStays.Sum(s => s.TotalAmount)
                };
            }).Where(o => o.TotalRooms > 0).ToList();

            var totalOccupiedNights = roomDetails.Sum(r => r.OccupiedNights);
            var averageOccupancyRate = availableRoomNights > 0 ? (double)totalOccupiedNights / availableRoomNights * 100 : 0;

            return new OccupancyReportDTO
            {
                StartDate = startDate,
                EndDate = endDate,
                AverageOccupancyRate = averageOccupancyRate,
                TotalBookings = bookings.Count(), 
                TotalStays = stays.Count(),
                TotalNights = totalOccupiedNights,
                TotalRooms = totalRooms,
                AvailableRoomNights = availableRoomNights,
                OccupiedRoomNights = totalOccupiedNights,
                RoomDetails = roomDetails,
                OccupancyByRoomType = occupancyByRoomType
            };
        }

        public async Task<ServicesReportDTO> GetServicesReportAsync(DateTime startDate, DateTime endDate)
        {
            // Исключить отмененные услуги (PaymentStatusId != 5)
            var serviceSales = (await _serviceSaleRepository.GetServiceSalesByDateRangeAsync(startDate, endDate))
                .Where(ss => ss.PaymentStatusId != 5).ToList();
            var services = await _serviceRepository.GetAllAsync();

            var totalServiceRevenue = serviceSales.Sum(s => s.TotalPrice);
            var totalServicesOrdered = serviceSales.Sum(s => s.Quantity);
            var averageServiceValue = serviceSales.Any() ? serviceSales.Average(s => s.TotalPrice) : 0;

            // Популярность услуг (исключая отмененные)
            var servicePopularity = services.Select(service =>
            {
                var serviceOrders = serviceSales.Where(ss => ss.ServiceId == service.ServiceId).ToList();
                var timesOrdered = serviceOrders.Sum(so => so.Quantity);
                var totalRevenue = serviceOrders.Sum(so => so.TotalPrice);

                return new ServicePopularityDTO
                {
                    ServiceId = service.ServiceId,
                    ServiceName = service.Name,
                    Price = service.Price,
                    TimesOrdered = timesOrdered,
                    TotalRevenue = totalRevenue,
                    PopularityRank = 0
                };
            }).Where(s => s.TimesOrdered > 0)
            .OrderByDescending(s => s.TimesOrdered)
            .ToList();

            // Установка рангов популярности
            for (int i = 0; i < servicePopularity.Count; i++)
            {
                servicePopularity[i].PopularityRank = i + 1;
            }

            var categoryReports = new List<ServiceCategoryReportDTO>();

            // Доходы по периодам (исключая отмененные услуги)
            var revenueByPeriod = new List<ServiceRevenueByPeriodDTO>();
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                var dailySales = serviceSales.Where(ss => ss.SaleDate.Date == date.Date).ToList();
                revenueByPeriod.Add(new ServiceRevenueByPeriodDTO
                {
                    Date = date,
                    Revenue = dailySales.Sum(ds => ds.TotalPrice),
                    OrdersCount = dailySales.Count
                });
            }

            return new ServicesReportDTO
            {
                StartDate = startDate,
                EndDate = endDate,
                TotalServiceRevenue = totalServiceRevenue,
                TotalServicesOrdered = totalServicesOrdered,
                AverageServiceValue = averageServiceValue,
                ServicePopularity = servicePopularity,
                CategoryReports = categoryReports,
                RevenueByPeriod = revenueByPeriod
            };
        }

        public async Task<GuestAnalyticsReportDTO> GetGuestAnalyticsReportAsync(DateTime startDate, DateTime endDate)
        {
            // Изменить на проживания вместо бронирований
            var stays = await _stayRepository.GetStaysByDateRangeAsync(startDate, endDate);
            var allGuests = await _guestRepository.GetAllAsync();
            
            // Получить услуги за период (исключая отмененные)
            var serviceSales = (await _serviceSaleRepository.GetServiceSalesByDateRangeAsync(startDate, endDate))
                .Where(ss => ss.PaymentStatusId != 5).ToList();
            
            // Получить уникальных гостей из проживаний
            var guestIds = stays.SelectMany(s => s.StayGuests.Select(sg => sg.GuestId)).Distinct().ToList();
            var guests = allGuests.Where(g => guestIds.Contains(g.GuestId)).ToList();

            var newGuests = guests.Where(g => g.CreatedAt >= startDate && g.CreatedAt <= endDate).Count();
            var returningGuests = guests.Count - newGuests;
            var returnGuestRate = guests.Any() ? (double)returningGuests / guests.Count * 100 : 0;

            var averageStayDuration = stays.Any() ? stays.Average(s => 
            {
                var checkOut = s.ActualCheckOutDate ?? DateTime.Now;
                return Math.Max(0, (checkOut - s.ActualCheckInDate).Days);
            }) : 0;
            
            // Рассчитать общий доход с учетом услуг основного гостя
            var totalGuestRevenue = stays.Where(s => s.StayGuests.Any(sg => sg.IsMainGuest)).Sum(s => 
            {
                var mainGuestId = s.StayGuests.First(sg => sg.IsMainGuest).GuestId;
                var accommodationAmount = s.TotalAmount;
                var servicesAmount = serviceSales.Where(ss => ss.StayId == s.StayId).Sum(ss => ss.TotalPrice);
                return accommodationAmount + servicesAmount;
            });
            
            // Средние траты на гостя с учетом услуг
            var averageSpendingPerGuest = guests.Any() ? totalGuestRevenue / guests.Count : 0;

            // Сегментация гостей на основе проживаний с учетом услуг
            var newGuestStays = stays.Where(s => s.StayGuests.Any(sg => sg.IsMainGuest && 
                guests.Any(g => g.GuestId == sg.GuestId && g.CreatedAt >= startDate)));
            var newGuestRevenue = newGuestStays.Sum(s => 
            {
                var servicesAmount = serviceSales.Where(ss => ss.StayId == s.StayId).Sum(ss => ss.TotalPrice);
                return s.TotalAmount + servicesAmount;
            });
            
            var returningGuestStays = stays.Where(s => s.StayGuests.Any(sg => sg.IsMainGuest && 
                guests.Any(g => g.GuestId == sg.GuestId && g.CreatedAt < startDate)));
            var returningGuestRevenue = returningGuestStays.Sum(s => 
            {
                var servicesAmount = serviceSales.Where(ss => ss.StayId == s.StayId).Sum(ss => ss.TotalPrice);
                return s.TotalAmount + servicesAmount;
            });

            var guestSegments = new List<GuestSegmentDTO>
            {
                new GuestSegmentDTO
                {
                    SegmentName = "Новые гости",
                    GuestCount = newGuests,
                    TotalRevenue = newGuestRevenue,
                    AverageStayDuration = newGuestStays.Any() ? 
                        newGuestStays.Average(s => Math.Max(0, ((s.ActualCheckOutDate ?? DateTime.Now) - s.ActualCheckInDate).Days)) : 0,
                    AverageSpending = newGuests > 0 ? newGuestRevenue / newGuests : 0
                },
                new GuestSegmentDTO
                {
                    SegmentName = "Постоянные гости",
                    GuestCount = returningGuests,
                    TotalRevenue = returningGuestRevenue,
                    AverageStayDuration = returningGuestStays.Any() ? 
                        returningGuestStays.Average(s => Math.Max(0, ((s.ActualCheckOutDate ?? DateTime.Now) - s.ActualCheckInDate).Days)) : 0,
                    AverageSpending = returningGuests > 0 ? returningGuestRevenue / returningGuests : 0
                }
            };

            // Топ гости на основе проживаний и услуг
            var topGuests = guests
                .Select(g => 
                {
                    // Сумма за проживание только если гость является основным
                    var accommodationAmount = stays
                        .Where(s => s.StayGuests.Any(sg => sg.GuestId == g.GuestId && sg.IsMainGuest))
                        .Sum(s => s.TotalAmount);
                    
                    // Сумма за услуги по связанным проживаниям основного гостя
                    var servicesAmount = stays
                        .Where(s => s.StayGuests.Any(sg => sg.GuestId == g.GuestId && sg.IsMainGuest))
                        .SelectMany(s => serviceSales.Where(ss => ss.StayId == s.StayId))
                        .Sum(ss => ss.TotalPrice);
                    
                    return new TopGuestDTO
                    {
                        GuestId = g.GuestId,
                        GuestName = $"{g.FirstName} {g.LastName}",
                        Email = g.Email,
                        StaysCount = stays.Count(s => s.StayGuests.Any(sg => sg.GuestId == g.GuestId)),
                        TotalSpent = accommodationAmount + servicesAmount,
                        LastVisit = stays.Where(s => s.StayGuests.Any(sg => sg.GuestId == g.GuestId)).Any() ? 
                            stays.Where(s => s.StayGuests.Any(sg => sg.GuestId == g.GuestId)).Max(s => s.ActualCheckOutDate ?? s.ActualCheckInDate) : DateTime.MinValue
                    };
                })
                .OrderByDescending(g => g.TotalSpent)
                .Take(10)
                .ToList();

            var demographics = allGuests.GroupBy(g => g.Citizenship?.Name ?? "Неизвестно")
                .Select(g => new GuestDemographicsDTO
                {
                    Category = "Гражданство",
                    Value = g.Key,
                    Count = g.Count(),
                    Percentage = allGuests.Any() ? (double)g.Count() / allGuests.Count() * 100 : 0
                })
                .OrderByDescending(d => d.Count)
                .Take(10)
                .ToList();

            return new GuestAnalyticsReportDTO
            {
                StartDate = startDate,
                EndDate = endDate,
                TotalGuests = guests.Count,
                NewGuests = newGuests,
                ReturningGuests = returningGuests,
                ReturnGuestRate = returnGuestRate,
                AverageStayDuration = averageStayDuration,
                AverageSpendingPerGuest = averageSpendingPerGuest,
                TotalGuestRevenue = totalGuestRevenue,
                GuestSegments = guestSegments,
                TopGuests = topGuests,
                Demographics = demographics
            };
        }
        private async Task ExportRevenueToExcel(ExcelWorksheet worksheet, DateTime startDate, DateTime endDate, string language)
        {
            var report = await GetRevenueReportAsync(startDate, endDate);
            var labels = GetRevenueLabels(language);

            worksheet.Cells[1, 1].Value = labels["title"];
            worksheet.Cells[1, 1].Style.Font.Bold = true;
            worksheet.Cells[1, 1].Style.Font.Size = 16;

            worksheet.Cells[2, 1].Value = $"{labels["period"]} {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}";

            int row = 4;
            worksheet.Cells[row, 1].Value = labels["totalRevenue"];
            worksheet.Cells[row, 2].Value = report.TotalRevenue;
            worksheet.Cells[row, 2].Style.Numberformat.Format = "#,##0.00";

            row++;
            worksheet.Cells[row, 1].Value = labels["accommodationRevenue"];
            worksheet.Cells[row, 2].Value = report.AccommodationRevenue;
            worksheet.Cells[row, 2].Style.Numberformat.Format = "#,##0.00";

            row++;
            worksheet.Cells[row, 1].Value = labels["serviceRevenue"];
            worksheet.Cells[row, 2].Value = report.ServiceRevenue;
            worksheet.Cells[row, 2].Style.Numberformat.Format = "#,##0.00";

            row++;
            worksheet.Cells[row, 1].Value = labels["taxCollected"];
            worksheet.Cells[row, 2].Value = report.TaxCollected;
            worksheet.Cells[row, 2].Style.Numberformat.Format = "#,##0.00";

            row++;
            worksheet.Cells[row, 1].Value = labels["invoiceCount"];
            worksheet.Cells[row, 2].Value = report.InvoiceCount;

            row++;
            worksheet.Cells[row, 1].Value = labels["averageStayValue"];
            worksheet.Cells[row, 2].Value = report.AverageStayValue;
            worksheet.Cells[row, 2].Style.Numberformat.Format = "#,##0.00";

            // Доходы по типам комнат
            row += 2;
            worksheet.Cells[row, 1].Value = labels["revenueByRoomType"];
            worksheet.Cells[row, 1].Style.Font.Bold = true;

            row++;
            worksheet.Cells[row, 1].Value = labels["roomType"];
            worksheet.Cells[row, 2].Value = "Доход с комнаты";
            worksheet.Cells[row, 3].Value = "Доход с услуг";
            worksheet.Cells[row, 4].Value = "Проживаний"; 
            worksheet.Cells[row, 5].Value = "Средний чек";
            worksheet.Cells[row, 1, row, 5].Style.Font.Bold = true;

            foreach (var roomType in report.RevenueByRoomType)
            {
                row++;
                worksheet.Cells[row, 1].Value = roomType.RoomTypeName;
                worksheet.Cells[row, 2].Value = roomType.AccommodationRevenue;
                worksheet.Cells[row, 2].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[row, 3].Value = roomType.ServiceRevenue;
                worksheet.Cells[row, 3].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[row, 4].Value = roomType.StaysCount;
                worksheet.Cells[row, 5].Value = roomType.AverageRate;
                worksheet.Cells[row, 5].Style.Numberformat.Format = "#,##0.00";
            }

            worksheet.Cells.AutoFitColumns();
        }

        private async Task ExportOccupancyToExcel(ExcelWorksheet worksheet, DateTime startDate, DateTime endDate, string language)
        {
            var report = await GetOccupancyReportAsync(startDate, endDate);
            var labels = GetOccupancyLabels(language);

            worksheet.Cells[1, 1].Value = labels["title"];
            worksheet.Cells[1, 1].Style.Font.Bold = true;
            worksheet.Cells[1, 1].Style.Font.Size = 16;

            worksheet.Cells[2, 1].Value = $"{labels["period"]} {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}";

            int row = 4;
            worksheet.Cells[row, 1].Value = labels["totalRooms"];
            worksheet.Cells[row, 2].Value = report.TotalRooms;

            row++;
            worksheet.Cells[row, 1].Value = labels["averageOccupancyRate"];
            worksheet.Cells[row, 2].Value = report.AverageOccupancyRate / 100;
            worksheet.Cells[row, 2].Style.Numberformat.Format = "0.00%";

            row++;
            worksheet.Cells[row, 1].Value = labels["totalBookings"];
            worksheet.Cells[row, 2].Value = report.TotalBookings;

            row++;
            worksheet.Cells[row, 1].Value = labels["totalStays"];
            worksheet.Cells[row, 2].Value = report.TotalStays;

            // Детали по комнатам
            row += 2;
            worksheet.Cells[row, 1].Value = labels["roomDetails"];
            worksheet.Cells[row, 1].Style.Font.Bold = true;

            row++;
            worksheet.Cells[row, 1].Value = labels["roomNumber"];
            worksheet.Cells[row, 2].Value = labels["roomType"];
            worksheet.Cells[row, 3].Value = labels["stays"];
            worksheet.Cells[row, 4].Value = labels["occupancyRate"];
            worksheet.Cells[row, 5].Value = labels["revenue"];
            worksheet.Cells[row, 1, row, 5].Style.Font.Bold = true;

            foreach (var room in report.RoomDetails)
            {
                row++;
                worksheet.Cells[row, 1].Value = room.RoomNumber;
                worksheet.Cells[row, 2].Value = room.RoomType;
                worksheet.Cells[row, 3].Value = room.StaysCount;
                worksheet.Cells[row, 4].Value = room.OccupancyRate / 100;
                worksheet.Cells[row, 4].Style.Numberformat.Format = "0.00%";
                worksheet.Cells[row, 5].Value = room.Revenue;
                worksheet.Cells[row, 5].Style.Numberformat.Format = "#,##0.00";
            }

            worksheet.Cells.AutoFitColumns();
        }

        private async Task ExportServicesToExcel(ExcelWorksheet worksheet, DateTime startDate, DateTime endDate, string language)
        {
            var report = await GetServicesReportAsync(startDate, endDate);
            var labels = GetServicesLabels(language);

            worksheet.Cells[1, 1].Value = labels["title"];
            worksheet.Cells[1, 1].Style.Font.Bold = true;
            worksheet.Cells[1, 1].Style.Font.Size = 16;

            worksheet.Cells[2, 1].Value = $"{labels["period"]} {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}";

            int row = 4;
            worksheet.Cells[row, 1].Value = labels["totalServiceRevenue"];
            worksheet.Cells[row, 2].Value = report.TotalServiceRevenue;
            worksheet.Cells[row, 2].Style.Numberformat.Format = "#,##0.00";

            row++;
            worksheet.Cells[row, 1].Value = labels["totalServicesOrdered"];
            worksheet.Cells[row, 2].Value = report.TotalServicesOrdered;

            row++;
            worksheet.Cells[row, 1].Value = labels["averageServiceValue"];
            worksheet.Cells[row, 2].Value = report.AverageServiceValue;
            worksheet.Cells[row, 2].Style.Numberformat.Format = "#,##0.00";

            // Популярность услуг
            row += 2;
            worksheet.Cells[row, 1].Value = labels["servicePopularity"];
            worksheet.Cells[row, 1].Style.Font.Bold = true;

            row++;
            worksheet.Cells[row, 1].Value = labels["rank"];
            worksheet.Cells[row, 2].Value = labels["serviceName"];
            worksheet.Cells[row, 3].Value = labels["timesOrdered"];
            worksheet.Cells[row, 4].Value = labels["totalRevenue"];
            worksheet.Cells[row, 1, row, 4].Style.Font.Bold = true;

            foreach (var service in report.ServicePopularity)
            {
                row++;
                worksheet.Cells[row, 1].Value = service.PopularityRank;
                worksheet.Cells[row, 2].Value = service.ServiceName;
                worksheet.Cells[row, 3].Value = service.TimesOrdered;
                worksheet.Cells[row, 4].Value = service.TotalRevenue;
                worksheet.Cells[row, 4].Style.Numberformat.Format = "#,##0.00";
            }

            worksheet.Cells.AutoFitColumns();
        }

        private async Task ExportGuestsToExcel(ExcelWorksheet worksheet, DateTime startDate, DateTime endDate, string language)
        {
            var report = await GetGuestAnalyticsReportAsync(startDate, endDate);
            var labels = GetGuestLabels(language);

            worksheet.Cells[1, 1].Value = labels["title"];
            worksheet.Cells[1, 1].Style.Font.Bold = true;
            worksheet.Cells[1, 1].Style.Font.Size = 16;

            worksheet.Cells[2, 1].Value = $"{labels["period"]} {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}";

            int row = 4;
            worksheet.Cells[row, 1].Value = labels["totalGuests"];
            worksheet.Cells[row, 2].Value = report.TotalGuests;

            row++;
            worksheet.Cells[row, 1].Value = labels["newGuests"];
            worksheet.Cells[row, 2].Value = report.NewGuests;

            row++;
            worksheet.Cells[row, 1].Value = labels["returningGuests"];
            worksheet.Cells[row, 2].Value = report.ReturningGuests;

            row++;
            worksheet.Cells[row, 1].Value = labels["returnGuestRate"];
            worksheet.Cells[row, 2].Value = report.ReturnGuestRate / 100;
            worksheet.Cells[row, 2].Style.Numberformat.Format = "0.00%";

            row++;
            worksheet.Cells[row, 1].Value = labels["averageStayDuration"];
            worksheet.Cells[row, 2].Value = report.AverageStayDuration;
            worksheet.Cells[row, 2].Style.Numberformat.Format = "0.00";

            row++;
    worksheet.Cells[row, 1].Value = labels["averageSpendingPerGuest"];
    worksheet.Cells[row, 2].Value = report.AverageSpendingPerGuest;
    worksheet.Cells[row, 2].Style.Numberformat.Format = "#,##0.00";

    row++;
    worksheet.Cells[row, 1].Value = labels["totalGuestRevenue"];
    worksheet.Cells[row, 2].Value = report.TotalGuestRevenue;
    worksheet.Cells[row, 2].Style.Numberformat.Format = "#,##0.00";

    // Топ гости
            row += 2;
            worksheet.Cells[row, 1].Value = labels["topGuests"];
            worksheet.Cells[row, 1].Style.Font.Bold = true;

            row++;
            worksheet.Cells[row, 1].Value = labels["guestName"];
            worksheet.Cells[row, 2].Value = labels["staysCount"];
            worksheet.Cells[row, 3].Value = labels["totalSpent"];
            worksheet.Cells[row, 4].Value = labels["lastVisit"];
            worksheet.Cells[row, 1, row, 4].Style.Font.Bold = true;

            foreach (var guest in report.TopGuests)
            {
                row++;
                worksheet.Cells[row, 1].Value = guest.GuestName;
                worksheet.Cells[row, 2].Value = guest.StaysCount;
                worksheet.Cells[row, 3].Value = guest.TotalSpent;
                worksheet.Cells[row, 3].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[row, 4].Value = guest.LastVisit;
                worksheet.Cells[row, 4].Style.Numberformat.Format = "dd/mm/yyyy";
            }

            worksheet.Cells.AutoFitColumns();
        }

        public async Task<byte[]> ExportReportToExcelAsync(string reportType, DateTime startDate, DateTime endDate, string language = "ru")
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add($"{reportType} Report");

            switch (reportType.ToLower())
            {
                case "revenue":
                    await ExportRevenueToExcel(worksheet, startDate, endDate, language);
                    break;
                case "occupancy":
                    await ExportOccupancyToExcel(worksheet, startDate, endDate, language);
                    break;
                case "services":
                    await ExportServicesToExcel(worksheet, startDate, endDate, language);
                    break;
                case "guests":
                    await ExportGuestsToExcel(worksheet, startDate, endDate, language);
                    break;
                default:
                    throw new ArgumentException("Invalid report type");
            }

            return package.GetAsByteArray();
        }

        // Метод для создания шрифтов с поддержкой кириллицы
        private Font GetUnicodeFont(int size, bool bold = false)
        {
            try
            {
                // Попытка использовать системный шрифт Arial Unicode MS
                string fontPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts), "arial.ttf");
                if (!File.Exists(fontPath))
                {
                    // Альтернативный путь для Arial
                    fontPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "Fonts", "arial.ttf");
                }
                
                if (File.Exists(fontPath))
                {
                    BaseFont baseFont = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                    return new Font(baseFont, size, bold ? Font.BOLD : Font.NORMAL);
                }
            }
            catch
            {
                // Если не удалось загрузить шрифт, используем стандартный
            }
            
            // Fallback к стандартному шрифту
            return FontFactory.GetFont(bold ? FontFactory.HELVETICA_BOLD : FontFactory.HELVETICA, size, iTextSharp.text.BaseColor.Black);
        }

        public async Task<byte[]> ExportReportToPdfAsync(string reportType, DateTime startDate, DateTime endDate, string language = "ru")
        {
            using var stream = new MemoryStream();
            var document = new Document(PageSize.A4, 25, 25, 30, 30);
            var writer = PdfWriter.GetInstance(document, stream);
            
            document.Open();

            // Заголовок с поддержкой кириллицы
            var titleFont = GetUnicodeFont(18, true);
            var reportTitle = GetLocalizedReportTitle(reportType, language);
            var title = new Paragraph($"{reportTitle} ({startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy})", titleFont)
            {
                Alignment = Element.ALIGN_CENTER,
                SpacingAfter = 20
            };
            document.Add(title);

            switch (reportType.ToLower())
            {
                case "revenue":
                    await ExportRevenueToPdf(document, startDate, endDate, language);
                    break;
                case "occupancy":
                    await ExportOccupancyToPdf(document, startDate, endDate, language);
                    break;
                case "services":
                    await ExportServicesToPdf(document, startDate, endDate, language);
                    break;
                case "guests":
                    await ExportGuestsToPdf(document, startDate, endDate, language);
                    break;
                default:
                    throw new ArgumentException("Invalid report type");
            }

            document.Close();
            return stream.ToArray();
        }

        // Методы экспорта в PDF с поддержкой кириллицы
        private async Task ExportRevenueToPdf(Document document, DateTime startDate, DateTime endDate, string language)
        {
            var report = await GetRevenueReportAsync(startDate, endDate);
            var labels = GetRevenueLabels(language);
            var normalFont = GetUnicodeFont(12);
            var boldFont = GetUnicodeFont(12, true);
            
            var table = new PdfPTable(2) { WidthPercentage = 100 };
            table.SetWidths(new float[] { 1, 1 });
            
            table.AddCell(new PdfPCell(new Phrase(labels["totalRevenue"], boldFont)));
            table.AddCell(new PdfPCell(new Phrase(report.TotalRevenue.ToString("C"), normalFont)));
            
            table.AddCell(new PdfPCell(new Phrase(labels["accommodationRevenue"], boldFont)));
            table.AddCell(new PdfPCell(new Phrase(report.AccommodationRevenue.ToString("C"), normalFont)));
            
            table.AddCell(new PdfPCell(new Phrase(labels["serviceRevenue"], boldFont)));
            table.AddCell(new PdfPCell(new Phrase(report.ServiceRevenue.ToString("C"), normalFont)));
            
            table.AddCell(new PdfPCell(new Phrase(labels["taxCollected"], boldFont)));
            table.AddCell(new PdfPCell(new Phrase(report.TaxCollected.ToString("C"), normalFont)));
            
            table.AddCell(new PdfPCell(new Phrase(labels["invoiceCount"], boldFont)));
            table.AddCell(new PdfPCell(new Phrase(report.InvoiceCount.ToString(), normalFont)));
            
            table.AddCell(new PdfPCell(new Phrase(labels["averageStayValue"], boldFont)));
            table.AddCell(new PdfPCell(new Phrase(report.AverageStayValue.ToString("C"), normalFont)));
            
            document.Add(table);
            document.Add(new Paragraph(" "));
            
            // Таблица доходов по типам комнат
            if (report.RevenueByRoomType.Any())
            {
                var roomTypeTitle = new Paragraph(labels["revenueByRoomType"], boldFont)
                {
                    SpacingBefore = 10,
                    SpacingAfter = 10
                };
                document.Add(roomTypeTitle);
                
                var roomTypeTable = new PdfPTable(5) { WidthPercentage = 100 };
                roomTypeTable.SetWidths(new float[] { 2, 1.5f, 1.5f, 1.5f, 1.5f });

                // Заголовки
                roomTypeTable.AddCell(new PdfPCell(new Phrase("Тип комнаты", boldFont)));
                roomTypeTable.AddCell(new PdfPCell(new Phrase("Доход с комнат", boldFont)));
                roomTypeTable.AddCell(new PdfPCell(new Phrase("Доход с услуг", boldFont)));
                roomTypeTable.AddCell(new PdfPCell(new Phrase("Проживаний", boldFont)));
                roomTypeTable.AddCell(new PdfPCell(new Phrase("Средний чек", boldFont)));

                // Данные
                foreach (var roomType in report.RevenueByRoomType)
                {
                    roomTypeTable.AddCell(new PdfPCell(new Phrase(roomType.RoomTypeName, normalFont)));
                    roomTypeTable.AddCell(new PdfPCell(new Phrase(roomType.AccommodationRevenue.ToString("C"), normalFont)));
                    roomTypeTable.AddCell(new PdfPCell(new Phrase(roomType.ServiceRevenue.ToString("C"), normalFont)));
                    roomTypeTable.AddCell(new PdfPCell(new Phrase(roomType.StaysCount.ToString(), normalFont)));
                    roomTypeTable.AddCell(new PdfPCell(new Phrase(roomType.AverageRate.ToString("C"), normalFont)));
                }

                document.Add(roomTypeTable);
            }
        }

        private async Task ExportOccupancyToPdf(Document document, DateTime startDate, DateTime endDate, string language)
        {
            var report = await GetOccupancyReportAsync(startDate, endDate);
            var labels = GetOccupancyLabels(language);
            var normalFont = GetUnicodeFont(10);
            var boldFont = GetUnicodeFont(10, true);
            
            // Сводная таблица
            var summaryTable = new PdfPTable(2) { WidthPercentage = 100 };
            summaryTable.SetWidths(new float[] { 1, 1 });
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["totalRooms"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase(report.TotalRooms.ToString(), normalFont)));
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["averageOccupancyRate"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase($"{report.AverageOccupancyRate:F2}%", normalFont)));
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["totalBookings"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase(report.TotalBookings.ToString(), normalFont)));

            summaryTable.AddCell(new PdfPCell(new Phrase(labels["totalStays"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase(report.TotalStays.ToString(), normalFont)));

            document.Add(summaryTable);
            document.Add(new Paragraph(" "));
            
            // Таблица деталей по комнатам
            var roomTable = new PdfPTable(5) { WidthPercentage = 100 };
            roomTable.SetWidths(new float[] { 1, 1, 1, 1, 1 });
            
            roomTable.AddCell(new PdfPCell(new Phrase(labels["roomNumber"], boldFont)));
            roomTable.AddCell(new PdfPCell(new Phrase(labels["roomType"], boldFont)));
            roomTable.AddCell(new PdfPCell(new Phrase(labels["stays"], boldFont)));
            roomTable.AddCell(new PdfPCell(new Phrase(labels["occupancyRate"], boldFont)));
            roomTable.AddCell(new PdfPCell(new Phrase(labels["revenue"], boldFont)));
            
            foreach (var room in report.RoomDetails.Take(20))
            {
                roomTable.AddCell(new PdfPCell(new Phrase(room.RoomNumber, normalFont)));
                roomTable.AddCell(new PdfPCell(new Phrase(room.RoomType, normalFont)));
                roomTable.AddCell(new PdfPCell(new Phrase(room.StaysCount.ToString(), normalFont)));
                roomTable.AddCell(new PdfPCell(new Phrase($"{room.OccupancyRate:F2}%", normalFont)));
                roomTable.AddCell(new PdfPCell(new Phrase(room.Revenue.ToString("C"), normalFont)));
            }
            
            document.Add(roomTable);
        }

        private async Task ExportServicesToPdf(Document document, DateTime startDate, DateTime endDate, string language)
        {
            var report = await GetServicesReportAsync(startDate, endDate);
            var labels = GetServicesLabels(language);
            var normalFont = GetUnicodeFont(10);
            var boldFont = GetUnicodeFont(10, true);
            
            // Сводная таблица
            var summaryTable = new PdfPTable(2) { WidthPercentage = 100 };
            summaryTable.SetWidths(new float[] { 1, 1 });
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["totalServiceRevenue"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase(report.TotalServiceRevenue.ToString("C"), normalFont)));
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["totalServicesOrdered"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase(report.TotalServicesOrdered.ToString(), normalFont)));
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["averageServiceValue"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase(report.AverageServiceValue.ToString("C"), normalFont)));
            
            document.Add(summaryTable);
            document.Add(new Paragraph(" "));
            
            // Таблица популярности услуг
            var serviceTable = new PdfPTable(4) { WidthPercentage = 100 };
            serviceTable.SetWidths(new float[] { 0.5f, 2, 1, 1 });
            
            serviceTable.AddCell(new PdfPCell(new Phrase(labels["rank"], boldFont)));
            serviceTable.AddCell(new PdfPCell(new Phrase(labels["serviceName"], boldFont)));
            serviceTable.AddCell(new PdfPCell(new Phrase(labels["timesOrdered"], boldFont)));
            serviceTable.AddCell(new PdfPCell(new Phrase(labels["totalRevenue"], boldFont)));
            
            foreach (var service in report.ServicePopularity.Take(15)) // Ограничиваем до топ 15 услуг
            {
                serviceTable.AddCell(new PdfPCell(new Phrase(service.PopularityRank.ToString(), normalFont)));
                serviceTable.AddCell(new PdfPCell(new Phrase(service.ServiceName, normalFont)));
                serviceTable.AddCell(new PdfPCell(new Phrase(service.TimesOrdered.ToString(), normalFont)));
                serviceTable.AddCell(new PdfPCell(new Phrase(service.TotalRevenue.ToString("C"), normalFont)));
            }
            
            document.Add(serviceTable);
        }

        private async Task ExportGuestsToPdf(Document document, DateTime startDate, DateTime endDate, string language)
        {
            var report = await GetGuestAnalyticsReportAsync(startDate, endDate);
            var labels = GetGuestLabels(language);
            var normalFont = GetUnicodeFont(10);
            var boldFont = GetUnicodeFont(10, true);
            
            // Сводная таблица
            var summaryTable = new PdfPTable(2) { WidthPercentage = 100 };
            summaryTable.SetWidths(new float[] { 1, 1 });
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["totalGuests"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase(report.TotalGuests.ToString(), normalFont)));
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["newGuests"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase(report.NewGuests.ToString(), normalFont)));
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["returningGuests"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase(report.ReturningGuests.ToString(), normalFont)));
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["returnGuestRate"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase($"{report.ReturnGuestRate:F2}%", normalFont)));
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["averageStayDuration"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase($"{report.AverageStayDuration:F2} days", normalFont)));
            
            summaryTable.AddCell(new PdfPCell(new Phrase(labels["averageSpendingPerGuest"], boldFont)));
            summaryTable.AddCell(new PdfPCell(new Phrase(report.AverageSpendingPerGuest.ToString("C"), normalFont)));
            
            document.Add(summaryTable);
            document.Add(new Paragraph(" "));
            
            // Таблица топ гостей
            var guestTable = new PdfPTable(4) { WidthPercentage = 100 };
            guestTable.SetWidths(new float[] { 2, 1, 1, 1 });
            
            guestTable.AddCell(new PdfPCell(new Phrase(labels["guestName"], boldFont)));
            guestTable.AddCell(new PdfPCell(new Phrase(labels["staysCount"], boldFont)));
            guestTable.AddCell(new PdfPCell(new Phrase(labels["totalSpent"], boldFont)));
            guestTable.AddCell(new PdfPCell(new Phrase(labels["lastVisit"], boldFont)));
            
            foreach (var guest in report.TopGuests.Take(10)) // Ограничиваем до топ 10 гостей
            {
                guestTable.AddCell(new PdfPCell(new Phrase(guest.GuestName, normalFont)));
                guestTable.AddCell(new PdfPCell(new Phrase(guest.StaysCount.ToString(), normalFont)));
                guestTable.AddCell(new PdfPCell(new Phrase(guest.TotalSpent.ToString("C"), normalFont)));
                guestTable.AddCell(new PdfPCell(new Phrase(guest.LastVisit.ToString("dd/MM/yyyy"), normalFont)));
            }
            
            document.Add(guestTable);
        }

        // Методы локализации
        private string GetLocalizedReportTitle(string reportType, string language)
        {
            var titles = new Dictionary<string, Dictionary<string, string>>
            {
                ["revenue"] = new Dictionary<string, string> { ["ru"] = "Отчет по доходам", ["en"] = "Revenue Report" },
                ["occupancy"] = new Dictionary<string, string> { ["ru"] = "Отчет по занятости", ["en"] = "Occupancy Report" },
                ["services"] = new Dictionary<string, string> { ["ru"] = "Отчет по услугам", ["en"] = "Services Report" },
                ["guests"] = new Dictionary<string, string> { ["ru"] = "Аналитика гостей", ["en"] = "Guest Analytics" }
            };

            return titles.ContainsKey(reportType.ToLower()) && titles[reportType.ToLower()].ContainsKey(language)
                ? titles[reportType.ToLower()][language]
                : titles[reportType.ToLower()]["en"];
        }

        private Dictionary<string, string> GetRevenueLabels(string language)
        {
            return language == "ru" ? new Dictionary<string, string>
            {
                ["title"] = "Отчет по доходам",
                ["period"] = "Период:",
                ["totalRevenue"] = "Общий доход:",
                ["accommodationRevenue"] = "Доход от проживания:",
                ["serviceRevenue"] = "Доход от услуг:",
                ["taxCollected"] = "Собрано налогов:",
                ["invoiceCount"] = "Количество счетов:",
                ["averageStayValue"] = "Средняя стоимость проживания:",
                ["revenueByRoomType"] = "Доходы по типам комнат",
                ["roomType"] = "Тип комнаты",
                ["revenue"] = "Доход",
                ["bookings"] = "Бронирования",
                ["averageRate"] = "Средняя ставка",
                ["staysCount"] = "Проживаний",
                ["averageCheck"] = "Средний чек"
            } : new Dictionary<string, string>
            {
                ["title"] = "Revenue Report",
                ["period"] = "Period:",
                ["totalRevenue"] = "Total Revenue:",
                ["accommodationRevenue"] = "Accommodation Revenue:",
                ["serviceRevenue"] = "Service Revenue:",
                ["taxCollected"] = "Tax Collected:",
                ["invoiceCount"] = "Invoice Count:",
                ["averageStayValue"] = "Average Stay Value:",
                ["revenueByRoomType"] = "Revenue by Room Type",
                ["roomType"] = "Room Type",
                ["revenue"] = "Revenue",
                ["bookings"] = "Bookings",
                ["averageRate"] = "Average Rate",
                ["staysCount"] = "Stays",
                ["averageCheck"] = "Average Check"
            };
        }

        private Dictionary<string, string> GetOccupancyLabels(string language)
        {
            return language == "ru" ? new Dictionary<string, string>
            {
                ["title"] = "Отчет по занятости",
                ["period"] = "Период:",
                ["totalRooms"] = "Всего комнат:",
                ["averageOccupancyRate"] = "Средняя занятость:",
                ["totalBookings"] = "Всего бронирований:",
                ["totalStays"] = "Всего проживаний:",
                ["totalNights"] = "Всего ночей:",
                ["roomDetails"] = "Детали по комнатам",
                ["roomNumber"] = "Номер комнаты",
                ["roomType"] = "Тип комнаты",
                ["bookings"] = "Бронирования",
                ["stays"] = "Проживания",
                ["occupiedNights"] = "Занятые ночи",
                ["occupancyRate"] = "Занятость",
                ["revenue"] = "Доход"
            } : new Dictionary<string, string>
            {
                ["title"] = "Occupancy Report",
                ["period"] = "Period:",
                ["totalRooms"] = "Total Rooms:",
                ["averageOccupancyRate"] = "Average Occupancy Rate:",
                ["totalBookings"] = "Total Bookings:",
                ["totalStays"] = "Total Stays:",
                ["totalNights"] = "Total Nights:",
                ["roomDetails"] = "Room Details",
                ["roomNumber"] = "Room Number",
                ["roomType"] = "Room Type",
                ["bookings"] = "Bookings",
                ["stays"] = "Stays",
                ["occupiedNights"] = "Occupied Nights",
                ["occupancyRate"] = "Occupancy Rate",
                ["revenue"] = "Revenue"
            };
        }

        private Dictionary<string, string> GetServicesLabels(string language)
        {
            return language == "ru" ? new Dictionary<string, string>
            {
                ["title"] = "Отчет по услугам",
                ["period"] = "Период:",
                ["totalServiceRevenue"] = "Общий доход от услуг:",
                ["totalServicesOrdered"] = "Всего заказано услуг:",
                ["averageServiceValue"] = "Средняя стоимость услуги:",
                ["servicePopularity"] = "Популярность услуг",
                ["rank"] = "Ранг",
                ["serviceName"] = "Название услуги",
                ["category"] = "Категория",
                ["price"] = "Цена",
                ["timesOrdered"] = "Заказано раз",
                ["totalRevenue"] = "Общий доход"
            } : new Dictionary<string, string>
            {
                ["title"] = "Services Report",
                ["period"] = "Period:",
                ["totalServiceRevenue"] = "Total Service Revenue:",
                ["totalServicesOrdered"] = "Total Services Ordered:",
                ["averageServiceValue"] = "Average Service Value:",
                ["servicePopularity"] = "Service Popularity",
                ["rank"] = "Rank",
                ["serviceName"] = "Service Name",
                ["category"] = "Category",
                ["price"] = "Price",
                ["timesOrdered"] = "Times Ordered",
                ["totalRevenue"] = "Total Revenue"
            };
        }

        private Dictionary<string, string> GetGuestLabels(string language)
        {
            return language == "ru" ? new Dictionary<string, string>
            {
                ["title"] = "Аналитика гостей",
                ["period"] = "Период:",
                ["totalGuests"] = "Всего гостей:",
                ["newGuests"] = "Новые гости:",
                ["returningGuests"] = "Постоянные гости:",
                ["returnGuestRate"] = "Процент возвращающихся:",
                ["averageStayDuration"] = "Средняя продолжительность:",
                ["averageSpendingPerGuest"] = "Средние траты на гостя:",
                ["totalGuestRevenue"] = "Общий доход от гостей:",
                ["topGuests"] = "Топ гости",
                ["guestName"] = "Имя гостя",
                ["email"] = "Email",
                ["bookingsCount"] = "Бронирований",
                ["staysCount"] = "Проживаний",
                ["totalSpent"] = "Потрачено",
                ["lastVisit"] = "Последний визит"
            } : new Dictionary<string, string>
            {
                ["title"] = "Guest Analytics",
                ["period"] = "Period:",
                ["totalGuests"] = "Total Guests:",
                ["newGuests"] = "New Guests:",
                ["returningGuests"] = "Returning Guests:",
                ["returnGuestRate"] = "Return Guest Rate:",
                ["averageStayDuration"] = "Average Stay Duration:",
                ["averageSpendingPerGuest"] = "Average Spending Per Guest:",
                ["totalGuestRevenue"] = "Total Guest Revenue:",
                ["topGuests"] = "Top Guests",
                ["guestName"] = "Guest Name",
                ["email"] = "Email",
                ["bookingsCount"] = "Bookings Count",
                ["staysCount"] = "Stays Count",
                ["totalSpent"] = "Total Spent",
                ["lastVisit"] = "Last Visit"
            };
        }
    }
}