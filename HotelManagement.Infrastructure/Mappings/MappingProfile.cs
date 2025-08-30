using AutoMapper;
using HotelManagement.Core.DTOs;
using HotelManagement.Core.Entities;

namespace HotelManagement.Infrastructure.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Room mappings 
            CreateMap<Room, RoomDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.RoomId))
                .ForMember(dest => dest.RoomTypeId, opt => opt.MapFrom(src => src.RoomTypeId))
                .ForMember(dest => dest.RoomTypeName, opt => opt.MapFrom(src => src.RoomType.Name))
                .ForMember(dest => dest.RoomDescription, opt => opt.MapFrom(src => src.RoomType.Description));

            CreateMap<CreateRoomDTO, Room>()
                .ForMember(dest => dest.RoomId, opt => opt.Ignore())
                .ForMember(dest => dest.RoomType, opt => opt.Ignore())
                .ForMember(dest => dest.Bookings, opt => opt.Ignore());

            CreateMap<UpdateRoomDTO, Room>()
                .ForMember(dest => dest.RoomId, opt => opt.Ignore())
                .ForMember(dest => dest.RoomType, opt => opt.Ignore())
                .ForMember(dest => dest.Bookings, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // RoomType mappings
            CreateMap<RoomType, RoomTypeDTO>();

            // Guest mappings
            CreateMap<Guest, GuestDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.GuestId))
                .ForMember(dest => dest.IdentificationTypeName, opt => opt.MapFrom(src => src.IdentificationType.Name))
                .ForMember(dest => dest.CitizenshipName, opt => opt.MapFrom(src => src.Citizenship.Name))
                .ForMember(dest => dest.CitizenshipCode, opt => opt.MapFrom(src => src.Citizenship.Code))
                .ForMember(dest => dest.BookingsCount, opt => opt.MapFrom(src => src.Bookings.Count()));

            CreateMap<CreateGuestDTO, Guest>();
            CreateMap<UpdateGuestDTO, Guest>();
            CreateMap<CreateShortGuestDTO, Guest>();


            // Citizenship mappings
            CreateMap<Citizenship, CitizenshipDTO>();
            CreateMap<CreateCitizenshipDTO, Citizenship>();
            CreateMap<UpdateCitizenshipDTO, Citizenship>();

            // IdentificationType mappings
            CreateMap<IdentificationType, IdentificationTypeDTO>();

            // Service mappings 
            CreateMap<Service, ServiceDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ServiceId));

            CreateMap<CreateServiceDTO, Service>();
            CreateMap<UpdateServiceDTO, Service>();

            // ServiceSale mappings
            CreateMap<ServiceSale, ServiceSaleDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ServiceSaleId))
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service.Name))
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee.FirstName + " " + src.Employee.LastName))
                .ForMember(dest => dest.EmployeePosition, opt => opt.MapFrom(src => src.Employee.Position))
                .ForMember(dest => dest.PaymentStatusName, opt => opt.MapFrom(src => src.PaymentStatus.Name))
                .ForMember(dest => dest.GuestName, opt => opt.MapFrom(src => 
                    src.Guest != null ? src.Guest.FirstName + " " + src.Guest.LastName : null));

            CreateMap<CreateServiceSaleDTO, ServiceSale>();

            // Employee mappings 
            CreateMap<Employee, EmployeeDTO>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.EmployeeId))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name))
                .ForMember(dest => dest.EmployeeStatusName, opt => opt.MapFrom(src => src.EmployeeStatus.Name));

            CreateMap<CreateEmployeeDTO, Employee>();
            CreateMap<UpdateEmployeeDTO, Employee>();

            // Department mappings
            CreateMap<Department, DepartmentDTO>();

            // EmployeeStatus mappings
            CreateMap<EmployeeStatus, EmployeeStatusDTO>();

            // RoomStatus mappings
            CreateMap<Room, RoomStatusDTO>()
                .ForMember(dest => dest.RoomId, opt => opt.MapFrom(src => src.RoomId));

            // Stay mappings
            CreateMap<Stay, StayDTO>()
                .ForMember(dest => dest.RoomId, opt => opt.MapFrom(src => src.Booking.RoomId))
                .ForMember(dest => dest.RoomNumber, opt => opt.MapFrom(src => src.Booking.Room.RoomNumber))
                .ForMember(dest => dest.GuestName, opt => opt.MapFrom(src =>
                    src.StayGuests.Any(sg => sg.IsMainGuest) ? 
                    $"{src.StayGuests.First(sg => sg.IsMainGuest).Guest.FirstName} {src.StayGuests.First(sg => sg.IsMainGuest).Guest.LastName}" :
                    src.Booking != null ? $"{src.Booking.Guest.FirstName} {src.Booking.Guest.LastName}" : ""))
                .ForMember(dest => dest.CheckInDate, opt => opt.MapFrom(src => src.Booking.CheckInDate))
                .ForMember(dest => dest.CheckOutDate, opt => opt.MapFrom(src => src.Booking.CheckOutDate))
                .ForMember(dest => dest.PaymentStatusName, opt => opt.MapFrom(src => src.PaymentStatus.Name))
                .ForMember(dest => dest.TaxAmount, opt => opt.MapFrom(src =>
                    (src.TotalAmount * src.TaxPercent) / (100 + src.TaxPercent)))
                .ForMember(dest => dest.StayGuests, opt => opt.MapFrom(src => src.StayGuests));
                        CreateMap<CreateStayDTO, Stay>();
                        CreateMap<UpdateStayDTO, Stay>();

            // Invoice mappings
            CreateMap<Stay, InvoiceDTO>()
                .ForMember(dest => dest.StayId, opt => opt.MapFrom(src => src.StayId))
                .ForMember(dest => dest.BookingId, opt => opt.MapFrom(src => src.BookingId))
                .ForMember(dest => dest.GuestName, opt => opt.MapFrom(src =>
                    src.StayGuests.Any(sg => sg.IsMainGuest) ?
                    $"{src.StayGuests.First(sg => sg.IsMainGuest).Guest.FirstName} {src.StayGuests.First(sg => sg.IsMainGuest).Guest.LastName}" :
                    src.Booking != null ? $"{src.Booking.Guest.FirstName} {src.Booking.Guest.LastName}" : ""))
                .ForMember(dest => dest.RoomNumber, opt => opt.MapFrom(src => src.Booking.Room.RoomNumber))
                .ForMember(dest => dest.IssueDate, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.CheckInDate, opt => opt.MapFrom(src => src.Booking.CheckInDate))
                .ForMember(dest => dest.CheckOutDate, opt => opt.MapFrom(src => src.Booking.CheckOutDate))
                .ForMember(dest => dest.NumberOfDays, opt => opt.MapFrom(src => 
                    (src.Booking.CheckOutDate - src.Booking.CheckInDate).Days))
                .ForMember(dest => dest.DailyRate, opt => opt.MapFrom(src => 
                    src.Booking.TotalPrice / Math.Max(1, (src.Booking.CheckOutDate - src.Booking.CheckInDate).Days)))
                .ForMember(dest => dest.RoomCharges, opt => opt.MapFrom(src => src.Booking.TotalPrice))
                .ForMember(dest => dest.RoomTaxAmount, opt => opt.MapFrom(src => (src.TotalAmount * src.TaxPercent) / (100 + src.TaxPercent)))
                .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => src.PaymentStatus.Name))
                .ForMember(dest => dest.ServiceCharges, opt => opt.Ignore()) 
                .ForMember(dest => dest.ServiceItems, opt => opt.Ignore()); 

            // ServiceSale to ServiceSaleItemDTO mapping
            CreateMap<ServiceSale, ServiceSaleItemDTO>()
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service.Name))
                .ForMember(dest => dest.TaxAmount, opt => opt.MapFrom(src => 
                    (src.TotalPrice * src.TaxPercent) / (100 + src.TaxPercent)))
                .ForMember(dest => dest.PaymentStatusId, opt => opt.MapFrom(src => src.PaymentStatusId))
                .ForMember(dest => dest.PaymentStatusName, opt => opt.MapFrom(src => src.PaymentStatus.Name));

            // StayGuest mappings
            CreateMap<StayGuest, StayGuestDTO>()
                .ForMember(dest => dest.GuestFullName, opt => opt.MapFrom(src => src.Guest != null ? $"{src.Guest.FirstName} {src.Guest.LastName}" : ""))
                .ForMember(dest => dest.GuestPhone, opt => opt.MapFrom(src => src.Guest.Phone))
                .ForMember(dest => dest.GuestEmail, opt => opt.MapFrom(src => src.Guest.Email));

            // Booking mappings
            CreateMap<Booking, BookingDTO>()
                .ForMember(dest => dest.GuestName, opt => opt.MapFrom(src => src.Guest != null ? $"{src.Guest.FirstName} {src.Guest.LastName}" : ""))
                .ForMember(dest => dest.GuestPhone, opt => opt.MapFrom(src => src.Guest != null ? src.Guest.Phone : ""))
                .ForMember(dest => dest.RoomNumber, opt => opt.MapFrom(src => src.Room != null ? src.Room.RoomNumber : ""))
                .ForMember(dest => dest.RoomType, opt => opt.MapFrom(src => src.Room != null ? src.Room.RoomType.Name : ""))
                .ForMember(dest => dest.BookingTypeName, opt => opt.MapFrom(src => src.BookingType != null ? src.BookingType.Description : ""))
                .ForMember(dest => dest.BookingStatusName, opt => opt.MapFrom(src => src.BookingStatus != null ? src.BookingStatus.Description : ""))
                .ForMember(dest => dest.EmployeeName, opt => opt.MapFrom(src => src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : ""))
                .ForMember(dest => dest.EmployeePosition, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.Position : ""));

            CreateMap<CreateBookingDTO, Booking>();
            CreateMap<UpdateBookingDTO, Booking>();

            CreateMap<CreateStayGuestDTO, StayGuest>();
        }
    }
}