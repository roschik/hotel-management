using HotelManagement.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Guest> Guests { get; set; }
        public DbSet<BookingType> BookingTypes { get; set; }
        public DbSet<BookingStatus> BookingStatuses { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; } 
        public DbSet<ServiceSale> ServiceSales { get; set; }
        public DbSet<Stay> Stays { get; set; }
        public DbSet<StayGuest> StayGuests { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<IdentificationType> IdentificationTypes { get; set; }
        public DbSet<EmployeeStatus> EmployeeStatuses { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<PaymentStatus> PaymentStatuses { get; set; }
        public DbSet<Citizenship> Citizenships { get; set; } 

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Конфигурация для Room
            modelBuilder.Entity<Room>(entity =>
            {
                entity.HasKey(e => e.RoomId);
                entity.Property(e => e.RoomNumber).IsRequired().HasMaxLength(10);
                entity.Property(e => e.IsAvailable).HasDefaultValue(true); 
                entity.Property(e => e.PricePerNight).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.HasWifi).HasDefaultValue(true);
                entity.Property(e => e.HasTV).HasDefaultValue(true);
                entity.Property(e => e.HasMinibar).HasDefaultValue(false);
            });

            // Конфигурация для RoomType
            modelBuilder.Entity<RoomType>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(200);
            });

            // Конфигурация для Guest 
            modelBuilder.Entity<Guest>(entity =>
            {
                entity.HasKey(e => e.GuestId);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.MiddleName).HasMaxLength(50);
                entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
                entity.Property(e => e.IdentificationNumber).HasMaxLength(20);
                entity.Property(e => e.IdentificationIssuedBy).HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Address).HasMaxLength(200);
                entity.Property(e => e.PostalCode).HasMaxLength(20); 
                entity.Property(e => e.Notes).HasMaxLength(500); 
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Citizenship
            modelBuilder.Entity<Citizenship>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(3);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                
                entity.HasIndex(e => e.Code).IsUnique();
            });

            // IdentificationType
            modelBuilder.Entity<IdentificationType>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
            });

            // Конфигурация для BookingType
            modelBuilder.Entity<BookingType>(entity =>
            {
                entity.HasKey(e => e.BookingTypeId);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            });

            // Конфигурация для BookingStatus
            modelBuilder.Entity<BookingStatus>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(200);
            });

            // Конфигурация для Booking
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CheckInDate).IsRequired();
                entity.Property(e => e.CheckOutDate).IsRequired();
                entity.Property(e => e.TotalPrice).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Отношения
                entity.HasOne(d => d.Room)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.RoomId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.BookingType)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.BookingTypeId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(d => d.BookingStatus)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.BookingStatusId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Конфигурация для Service
            modelBuilder.Entity<Service>(entity =>
            {
                entity.HasKey(e => e.ServiceId);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Конфигурация для ServiceSale
            modelBuilder.Entity<ServiceSale>(entity =>
            {
                entity.HasKey(e => e.ServiceSaleId);
                entity.Property(e => e.Quantity).HasDefaultValue(1);
                entity.Property(e => e.UnitPrice).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.TotalPrice).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.TaxPercent).HasColumnType("decimal(10, 2)"); 
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Notes).HasMaxLength(500);
            
                // Отношения
                entity.HasOne(d => d.Service)
                    .WithMany(s => s.ServiceSales)
                    .HasForeignKey(d => d.ServiceId)
                    .OnDelete(DeleteBehavior.Restrict);
            
                entity.HasOne(d => d.Employee)
                    .WithMany(e => e.ServiceSales)
                    .HasForeignKey(d => d.EmployeeId)
                    .OnDelete(DeleteBehavior.Restrict);
            
                entity.HasOne(d => d.Guest)
                    .WithMany(g => g.ServiceSales)
                    .HasForeignKey(d => d.GuestId)
                    .OnDelete(DeleteBehavior.SetNull);
            
                entity.HasOne(d => d.Stay) 
                    .WithMany()
                    .HasForeignKey(d => d.StayId)
                    .OnDelete(DeleteBehavior.SetNull);
            
                entity.HasOne(d => d.PaymentStatus)
                    .WithMany(p => p.ServiceSales)
                    .HasForeignKey(d => d.PaymentStatusId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PaymentStatus>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(200);
            });

            // Конфигурация для Employee
            modelBuilder.Entity<Employee>(entity =>
            {
                entity.HasKey(e => e.EmployeeId);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.MiddleName).HasMaxLength(50);
                entity.Property(e => e.Position).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.HireDate).IsRequired();
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.Salary).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.Address).HasMaxLength(200);
                entity.Property(e => e.EmergencyContactName).HasMaxLength(100);
                entity.Property(e => e.EmergencyContactPhone).HasMaxLength(20);

                // Отношения
                entity.HasOne(d => d.Department)
                    .WithMany(p => p.Employees)
                    .HasForeignKey(d => d.DepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.EmployeeStatus)
                    .WithMany(p => p.Employees)
                    .HasForeignKey(d => d.EmployeeStatusId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Конфигурация для EmployeeStatus
            modelBuilder.Entity<EmployeeStatus>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(200);
            });

            // Конфигурация для Department
            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(200);
            });

            // Конфигурация для Stay
            modelBuilder.Entity<Stay>(entity =>
            {
                entity.HasKey(e => e.StayId);
                entity.Property(e => e.ActualCheckInDate);
                entity.Property(e => e.ActualCheckOutDate);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)").HasDefaultValue(0);
                entity.Property(e => e.PaidAmount).HasColumnType("decimal(10, 2)").HasDefaultValue(0);
                entity.Property(e => e.TaxPercent).HasColumnType("decimal(10, 2)").HasDefaultValue(0);

                // Отношения
                entity.HasOne(d => d.Booking)
                    .WithMany(b => b.Stays)
                    .HasForeignKey(d => d.BookingId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.PaymentStatus)
                    .WithMany(p => p.Stays)
                    .HasForeignKey(d => d.PaymentStatusId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Employee)
                    .WithMany(p => p.Stays)
                    .HasForeignKey(d => d.EmployeeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Конфигурация для Booking
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CheckInDate).IsRequired();
                entity.Property(e => e.CheckOutDate).IsRequired();
                entity.Property(e => e.TotalPrice).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(d => d.Room)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.RoomId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.BookingType)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.BookingTypeId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(d => d.Guest)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.GuestId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(d => d.BookingStatus)
                    .WithMany(p => p.Bookings)
                    .HasForeignKey(d => d.BookingStatusId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Конфигурация для StayGuest
            modelBuilder.Entity<StayGuest>(entity =>
            {
                entity.HasKey(e => e.StayGuestId);
                entity.Property(e => e.IsMainGuest).HasDefaultValue(false);
                entity.Property(e => e.CheckInDate);
                entity.Property(e => e.CheckOutDate);
                entity.Property(e => e.Notes).HasMaxLength(500);

                // Отношения
                entity.HasOne(d => d.Stay)
                    .WithMany(p => p.StayGuests)
                    .HasForeignKey(d => d.StayId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Guest)
                    .WithMany(p => p.StayGuests)
                    .HasForeignKey(d => d.GuestId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Уникальный индекс для предотвращения дублирования гостя в одном проживании
                entity.HasIndex(e => new { e.StayId, e.GuestId }).IsUnique();
            });

            // Заполнение начальными данными
            SeedData(modelBuilder);

            base.OnModelCreating(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Заполнение типов бронирования
            modelBuilder.Entity<BookingType>().HasData(
                new BookingType { BookingTypeId = 1, Name = "Online", Description = "Веб-сайт" },
                new BookingType { BookingTypeId = 2, Name = "Phone", Description = "Телефон" },
                new BookingType { BookingTypeId = 3, Name = "Reception", Description = "Ресепшн" }
            );

            // Заполнение статусов бронирования
            modelBuilder.Entity<BookingStatus>().HasData(
                new BookingStatus { Id = 1, Name = "Confirmed", Description = "Подтверждено" },
                new BookingStatus { Id = 2, Name = "Completed", Description = "Завершено" },
                new BookingStatus { Id = 3, Name = "Cancelled", Description = "Отменено" },
                new BookingStatus { Id = 4, Name = "Pending", Description = "Ожидает подтверждения" }
            );

            // Заполнение комнат
            modelBuilder.Entity<Room>().HasData(
                new Room
                {
                    RoomId = 1,
                    RoomNumber = "101",
                    RoomTypeId = 1,
                    Capacity = 2,
                    PricePerNight = 3500,
                    IsAvailable = true,
                    Floor = 1,
                    HasWifi = true,
                    HasTV = true,
                    HasMinibar = false,
                    HasAirConditioning = true,
                    HasBalcony = false,
                    ImageUrl = "/uploads/images/room101.jpg",
                },
                new Room
                {
                    RoomId = 2,
                    RoomNumber = "201",
                    RoomTypeId = 2,
                    Capacity = 3,
                    PricePerNight = 5500,
                    IsAvailable = true,
                    Floor = 2,
                    HasWifi = true,
                    HasTV = true,
                    HasMinibar = false,
                    HasAirConditioning = true,
                    HasBalcony = true,
                    ImageUrl = "/uploads/images/room201.jpg",
                },
                new Room
                {
                    RoomId = 3,
                    RoomNumber = "301",
                    RoomTypeId = 3,
                    Capacity = 4,
                    PricePerNight = 8500,
                    IsAvailable = true, 
                    Floor = 3,
                    HasWifi = true,
                    HasTV = true,
                    HasMinibar = true,
                    HasAirConditioning = true,
                    HasBalcony = true,
                    ImageUrl = "/uploads/images/room301.jpg",
                },
                new Room
                {
                    RoomId = 4,
                    RoomNumber = "302",
                    RoomTypeId = 4,
                    Capacity = 5,
                    PricePerNight = 6500,
                    IsAvailable = true, 
                    Floor = 3,
                    HasWifi = true,
                    HasTV = true,
                    HasMinibar = true,
                    HasAirConditioning = true,
                    HasBalcony = false,
                    ImageUrl = "",
                },
                new Room
                {
                    RoomId = 5,
                    RoomNumber = "202",
                    RoomTypeId = 5,
                    Capacity = 2,
                    PricePerNight = 2500,
                    IsAvailable = true, 
                    Floor = 2,
                    HasWifi = false,
                    HasTV = true,
                    HasMinibar = false,
                    HasAirConditioning = true,
                    HasBalcony = false,
                    ImageUrl = "",
                }
            );

            // Заполнение типов комнат
            modelBuilder.Entity<RoomType>().HasData(
                new RoomType
                {
                    Id = 1,
                    Name = "Стандартный номер",
                    Description = "Уютный номер с одной или двумя кроватями, подходит для кратковременного проживания."
                },
                new RoomType
                {
                    Id = 2,
                    Name = "Делюкс номер",
                    Description = "Просторный номер с улучшенной отделкой, мини-баром и видом на горы."
                },
                new RoomType
                {
                    Id = 3,
                    Name = "Люкс",
                    Description = "Роскошный номер с гостиной зоной, роскошным видом и премиальным сервисом."
                },
                new RoomType
                {
                    Id = 4,
                    Name = "Семейный номер",
                    Description = "Большой номер с двумя смежными комнатами, рассчитанный на размещение семьи."
                },
                new RoomType
                {
                    Id = 5,
                    Name = "Эконом номер",
                    Description = "Небольшой бюджетный номер с минимальным набором удобств."
                }
            );

        // Заполнение гостей
        modelBuilder.Entity<Guest>().HasData(
                new Guest
                {
                    GuestId = 1,
                    FirstName = "Иван",
                    MiddleName = "Сергеевич",
                    LastName = "Петров",                    
                    Email = "ivan.petrov@email.com",
                    Phone = "+7-900-123-45-67",
                    Address = "г. Новокузнецк, ул. Ленина, д. 10, кв. 5",
                    PostalCode = "101000",
                    RegistrationDate = new DateTime(2023, 6, 1, 0, 0, 0, DateTimeKind.Utc),
                    DateOfBirth = new DateTime(1985, 3, 15, 0, 0, 0, DateTimeKind.Utc),
                    IdentificationTypeId = 1,
                    IdentificationNumber = "4510123456",
                    IdentificationIssuedBy = "ОУФМС России по г. Москве",
                    IdentificationIssuedDate = new DateTime(2010, 5, 20, 0, 0, 0, DateTimeKind.Utc),
                    Notes = "VIP клиент",
                    CitizenshipId = 1,
                    CreatedAt = new DateTime(2025, 6, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Guest
                {
                    GuestId = 2,
                    FirstName = "Анна",
                    MiddleName = "Владимировна",
                    LastName = "Смирнова",                    
                    Email = "anna.smirnova@email.com",
                    Phone = "+7-911-234-56-78",
                    Address = "г. Санкт-Петербург, пр. Невский, д. 25, кв. 12",
                    PostalCode = "191025",
                    RegistrationDate = new DateTime(2015, 8, 15, 0, 0, 0, DateTimeKind.Utc),
                    DateOfBirth = new DateTime(1990, 8, 22, 0, 0, 0, DateTimeKind.Utc),
                    IdentificationTypeId = 1,
                    IdentificationNumber = "4012345678",
                    IdentificationIssuedBy = "ОУФМС России по СПб",
                    IdentificationIssuedDate = new DateTime(2015, 9, 10, 0, 0, 0, DateTimeKind.Utc),
                    Notes = "Постоянный клиент",
                    CitizenshipId = 1,                    
                    CreatedAt = new DateTime(2025, 8, 15, 0, 0, 0, DateTimeKind.Utc)
                },
                new Guest
                {
                    GuestId = 3,
                    FirstName = "Михаил",
                    MiddleName = "Александрович",
                    LastName = "Козлов",                    
                    Email = "mikhail.kozlov@email.com",
                    Phone = "+7-922-345-67-89",
                    Address = "г. Барнаул, просп. Ленина, д. 48, кв. 12",
                    PostalCode = "620014",
                    RegistrationDate = new DateTime(2008, 10, 3, 0, 0, 0, DateTimeKind.Utc),
                    DateOfBirth = new DateTime(1978, 12, 5, 0, 0, 0, DateTimeKind.Utc),
                    IdentificationTypeId = 1,
                    IdentificationNumber = "2220123456",

                    IdentificationIssuedBy = "ТП УФМС России по Алтайскому краю в г. Барнаул",
                    IdentificationIssuedDate = new DateTime(2020, 10, 15, 0, 0, 0, DateTimeKind.Utc),
                    Notes = "",
                    CitizenshipId = 1,
                    CreatedAt = new DateTime(2025, 8, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Guest
                {
                    GuestId = 4,
                    FirstName = "Семен",
                    MiddleName = "Васильевич",
                    LastName = "Кузнецов",                    
                    Email = "semen.kuznetsov@email.com",
                    Phone = "+7-925-687-33-56",
                    Address = "г. Новосибирск, ул. Гагарина, д. 15, кв. 8",
                    PostalCode = "543217",
                    RegistrationDate = new DateTime(2008, 10, 3, 0, 0, 0, DateTimeKind.Utc),
                    DateOfBirth = new DateTime(1999, 8, 6, 0, 0, 0, DateTimeKind.Utc),
                    IdentificationTypeId = 1,
                    IdentificationNumber = "6603456789",
                    IdentificationIssuedBy = "ОУФМС России по Свердловской обл.",
                    IdentificationIssuedDate = new DateTime(2008, 3, 18, 0, 0, 0, DateTimeKind.Utc),
                    Notes = "Деловые поездки",
                    CitizenshipId = 1,
                    CreatedAt = new DateTime(2025, 8, 3, 0, 0, 0, DateTimeKind.Utc)
                },
                new Guest
                {
                    GuestId = 5,
                    FirstName = "Васильева",
                    MiddleName = "Светлана",
                    LastName = "Сергеевна",                    
                    Email = "svetlana.sergeevna@email.com",
                    Phone = "+7-925-687-33-56",
                    Address = "г. Пенза, ул. Пушкина, д. 10, кв. 5",
                    PostalCode = "987345",
                    RegistrationDate = new DateTime(2022, 10, 3, 0, 0, 0, DateTimeKind.Utc),
                    DateOfBirth = new DateTime(1987, 7, 6, 0, 0, 0, DateTimeKind.Utc),
                    IdentificationTypeId = 1,
                    IdentificationNumber = "5566876543",
                    IdentificationIssuedBy = "ОУФМС России по Волгоградской обл.",
                    IdentificationIssuedDate = new DateTime(2019, 4, 23, 0, 0, 0, DateTimeKind.Utc),
                    Notes = "",
                    CitizenshipId = 1,
                    CreatedAt = new DateTime(2025, 8, 8, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            modelBuilder.Entity<IdentificationType>().HasData(
                new IdentificationType
                {
                    Id = 1,
                    Name = "Паспорт гражданина РФ",
                    Description = "Основной документ, удостоверяющий личность гражданина Российской Федерации."
                },
                new IdentificationType
                {
                    Id = 2,
                    Name = "Заграничный паспорт",
                    Description = "Документ, удостоверяющий личность гражданина РФ за пределами страны."
                },
                new IdentificationType
                {
                    Id = 3,
                    Name = "Водительское удостоверение",
                    Description = "Документ, подтверждающий право на управление транспортными средствами."
                },
                new IdentificationType
                {
                    Id = 4,
                    Name = "Военный билет",
                    Description = "Документ, удостоверяющий личность военнослужащего или призывника."
                },
                new IdentificationType
                {
                    Id = 5,
                    Name = "Свидетельство о рождении",
                    Description = "Документ, подтверждающий факт рождения и личность ребенка."
                }
            );

            // Заполнение статусов сотрудников
            modelBuilder.Entity<EmployeeStatus>().HasData(
                new EmployeeStatus { Id = 1, Name = "Активный", Description = "Сотрудник активно работает" },
                new EmployeeStatus { Id = 2, Name = "В отпуске", Description = "Сотрудник находится в отпуске" },
                new EmployeeStatus { Id = 3, Name = "Уволен", Description = "Сотрудник уволен" },
                new EmployeeStatus { Id = 4, Name = "На больничном", Description = "Сотрудник на больничном" }
            );

            // Заполнение департаментов
            modelBuilder.Entity<Department>().HasData(
                new Department { Id = 1, Name = "Администрация", Description = "Административный отдел" },
                new Department { Id = 2, Name = "Обслуживание", Description = "Отдел обслуживания гостей" },
                new Department { Id = 3, Name = "Хозяйственный", Description = "Отдел уборки и хозяйства" },
                new Department { Id = 4, Name = "Безопасность", Description = "Служба безопасности" },
                new Department { Id = 5, Name = "Инженерно-технический", Description = "Отдел инженерного и технического обслуживания" }
            );

            // Заполнение сотрудников
            modelBuilder.Entity<Employee>().HasData(
                new Employee
                {
                    EmployeeId = 1,
                    FirstName = "Елена",
                    MiddleName = "Александровна",
                    LastName = "Иванова",
                    Email = "elena.admin@hotel.com",
                    Phone = "+7-800-555-01-01",
                    Position = "Администратор",
                    DepartmentId = 1,
                    HireDate = new DateTime(2022, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                    Salary = 45000,
                    EmployeeStatusId = 1,
                    Address = "ул. Рабочая, д. 5, кв. 20",
                    EmergencyContactName = "Петр Иванов",
                    EmergencyContactPhone = "+7-900-111-22-33",
                    IsActive = true
                },
                new Employee
                {
                    EmployeeId = 2,
                    FirstName = "Олеся",
                    MiddleName = "Викторовна",
                    LastName = "Николаева",
                    Email = "olesya.admin@hotel.com",
                    Phone = "+7-925-687-33-56",
                    Position = "Администратор",
                    DepartmentId = 1,
                    HireDate = new DateTime(2024, 5, 20, 0, 0, 0, DateTimeKind.Utc),
                    Salary = 40000,
                    EmployeeStatusId = 1,
                    Address = "ул. Толстого, д. 120, кв. 54",
                    EmergencyContactName = "Сергей Николаев",
                    EmergencyContactPhone = "+7-925-687-33-57",
                    IsActive = true
                },
                new Employee
                {
                    EmployeeId = 3,
                    FirstName = "Надежда",
                    MiddleName = "Сергеевна",
                    LastName = "Петрова",
                    Email = "sergey.cleaner@hotel.com",
                    Phone = "+7-800-555-02-02",
                    Position = "Уборщик",
                    DepartmentId = 3,
                    HireDate = new DateTime(2022, 3, 20, 0, 0, 0, DateTimeKind.Utc),
                    Salary = 35000,
                    EmployeeStatusId = 1,
                    Address = "ул. Трудовая, д. 12, кв. 7",
                    EmergencyContactName = "Мария Петрова",
                    EmergencyContactPhone = "+7-900-222-33-44",
                    IsActive = true
                },
                new Employee
                {
                    EmployeeId = 4,
                    FirstName = "Алексей",
                    MiddleName = "Михайлович",
                    LastName = "Попов",
                    Email = "alexey.tech@hotel.com",
                    Phone = "+7-800-555-03-03",
                    Position = "Техник",
                    DepartmentId = 5,
                    HireDate = new DateTime(2021, 11, 10, 0, 0, 0, DateTimeKind.Utc),
                    Salary = 50000,
                    EmployeeStatusId = 1,
                    Address = "пр. Мира, д. 8, кв. 15",
                    EmergencyContactName = "Ольга Попова",
                    EmergencyContactPhone = "+7-900-333-44-55",
                    IsActive = true
                }
            );

            // Заполнение бронирований
            modelBuilder.Entity<Booking>().HasData(
                new Booking
                {
                    Id = 1,
                    GuestId = 1,
                    RoomId = 3,
                    BookingTypeId = 1,
                    BookingStatusId = 1, 
                    EmployeeId = 1,
                    CheckInDate = new DateTime(2025, 8, 10, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 15, 0, 0, 0, DateTimeKind.Utc),
                    BasePrice = 42500,
                    TotalPrice = 42500,
                    CreatedAt = new DateTime(2025, 8, 10, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = null,
                    CancelledAt = null,
                    Notes = ""
                },
                new Booking
                {
                    Id = 2,
                    GuestId = 2,
                    RoomId = 3,
                    BookingTypeId = 1,
                    BookingStatusId = 1, 
                    EmployeeId = 1,
                    CheckInDate = new DateTime(2025, 8, 17, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 25, 0, 0, 0, DateTimeKind.Utc),
                    BasePrice = 68000,
                    TotalPrice = 68000,
                    CreatedAt = new DateTime(2025, 8, 16, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2025, 8, 17, 0, 0, 0, DateTimeKind.Utc),
                    CancelledAt = null,
                    Notes = ""
                },
                new Booking
                {
                    Id = 3,
                    GuestId = 3,
                    RoomId = 1,
                    BookingTypeId = 2,
                    BookingStatusId = 1,
                    EmployeeId = 2,
                    CheckInDate = new DateTime(2025, 8, 13, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 15, 0, 0, 0, DateTimeKind.Utc),
                    BasePrice = 7000,
                    TotalPrice = 7000,
                    CreatedAt = new DateTime(2025, 8, 11, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2025, 8, 14, 0, 0, 0, DateTimeKind.Utc),
                    CancelledAt = null,
                    Notes = "Командировка"
                },
                new Booking
                {
                    Id = 4,
                    GuestId = 4,
                    RoomId = 2,
                    BookingTypeId = 2,
                    BookingStatusId = 1,
                    EmployeeId = 2,
                    CheckInDate = new DateTime(2025, 8, 14, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 18, 0, 0, 0, DateTimeKind.Utc),
                    BasePrice = 22000,
                    TotalPrice = 22000,
                    CreatedAt = new DateTime(2025, 8, 11, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2025, 8, 14, 0, 0, 0, DateTimeKind.Utc),
                    CancelledAt = null,
                    Notes = "Семейный отдых"
                },
                new Booking
                {
                    Id = 5,
                    GuestId = 5,
                    RoomId = 5,
                    BookingTypeId = 1,
                    BookingStatusId = 1, 
                    EmployeeId = 1,
                    CheckInDate = new DateTime(2025, 8, 10, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 20, 0, 0, 0, DateTimeKind.Utc),
                    BasePrice = 25000,
                    TotalPrice = 25000,
                    CreatedAt = new DateTime(2025, 8, 10, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2025, 8, 10, 0, 0, 0, DateTimeKind.Utc),
                    CancelledAt = null,
                    Notes = ""
                },
                new Booking
                {
                    Id = 6,
                    GuestId = 3,
                    RoomId = 4,
                    BookingTypeId = 3,
                    BookingStatusId = 3,
                    EmployeeId = 1,
                    CheckInDate = new DateTime(2025, 8, 22, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 28, 0, 0, 0, DateTimeKind.Utc),
                    BasePrice = 39000,
                    TotalPrice = 39000,
                    CreatedAt = new DateTime(2025, 8, 11, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2025, 8, 13, 0, 0, 0, DateTimeKind.Utc),
                    CancelledAt = new DateTime(2025, 8, 20, 0, 0, 0, DateTimeKind.Utc),
                    Notes = "Отмена по семейным обстоятельствам"
                }
            );

            // Заполнение статусов оплаты
            modelBuilder.Entity<PaymentStatus>().HasData(
                new PaymentStatus { Id = 1, Name = "Ожидает оплаты", Description = "Платеж ожидает обработки" },
                new PaymentStatus { Id = 2, Name = "Частично оплачено", Description = "Платеж частично выполнен" },
                new PaymentStatus { Id = 3, Name = "Оплачено", Description = "Платеж полностью выполнен" },
                new PaymentStatus { Id = 4, Name = "Просрочено", Description = "Платеж просрочен" },
                new PaymentStatus { Id = 5, Name = "Отменено", Description = "Платеж отменен" }
            );

            // Заполнение услуг
            modelBuilder.Entity<Service>().HasData(
                new Service
                {
                    ServiceId = 1,
                    Name = "Завтрак",
                    Description = "Завтрак с доставкой в номер",
                    Price = 500,
                    DurationMinutes = 60,
                    IsActive = true,
                    ImageUrl = "/uploads/images/breakfast.jpg",
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Service
                {
                    ServiceId = 2,
                    Name = "Парковка",
                    Description = "Охраняемое парковочное место на территории отеля",
                    Price = 1000,
                    DurationMinutes = 1440,
                    IsActive = true,
                    ImageUrl = "/uploads/images/parking.jpg",
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Service
                {
                    ServiceId = 3,
                    Name = "Wi-Fi Premium",
                    Description = "Высокоскоростной интернет",
                    Price = 300,
                    DurationMinutes = 1440,
                    IsActive = true,
                    ImageUrl = "/uploads/images/wifi.jpg",
                    CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Service
                {
                    ServiceId = 4,
                    Name = "Спа-процедуры",
                    Description = "Расслабляющий массаж и спа-процедуры",
                    Price = 1500,
                    DurationMinutes = 90,
                    IsActive = true,
                    ImageUrl = "",
                    CreatedAt = new DateTime(2024, 1, 4, 0, 0, 0, DateTimeKind.Utc)
                },
                new Service
                {
                    ServiceId = 5,
                    Name = "Трансфер из аэропорта",
                    Description = "Комфортабельный трансфер до аэропорта и обратно",
                    Price = 800,
                    DurationMinutes = 120,
                    IsActive = true,
                    ImageUrl = "",
                    CreatedAt = new DateTime(2024, 1, 5, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            // Заполнение гражданств
            modelBuilder.Entity<Citizenship>().HasData(
                new Citizenship { Id = 1, Name = "Российская Федерация", Code = "RU", Description = "Гражданство Российской Федерации", IsActive = true },
                new Citizenship { Id = 2, Name = "Соединенные Штаты Америки", Code = "US", Description = "Гражданство США", IsActive = true },
                new Citizenship { Id = 3, Name = "Германия", Code = "DE", Description = "Гражданство Германии", IsActive = true },
                new Citizenship { Id = 4, Name = "Франция", Code = "FR", Description = "Гражданство Франции", IsActive = true },
                new Citizenship { Id = 5, Name = "Китай", Code = "CN", Description = "Гражданство Китая", IsActive = true },
                new Citizenship { Id = 6, Name = "Великобритания", Code = "GB", Description = "Гражданство Великобритании", IsActive = true },
                new Citizenship { Id = 7, Name = "Япония", Code = "JP", Description = "Гражданство Японии", IsActive = true },
                new Citizenship { Id = 8, Name = "Канада", Code = "CA", Description = "Гражданство Канады", IsActive = true },
                new Citizenship { Id = 9, Name = "Австралия", Code = "AU", Description = "Гражданство Австралии", IsActive = true },
                new Citizenship { Id = 10, Name = "Бразилия", Code = "BR", Description = "Гражданство Бразилии", IsActive = true }
            );

            // Заполнение проживаний
            modelBuilder.Entity<Stay>().HasData(
                new Stay
                {
                    StayId = 1,
                    BookingId = 1,
                    ActualCheckInDate = new DateTime(2025, 8, 9, 14, 0, 0, DateTimeKind.Utc),
                    ActualCheckOutDate = new DateTime(2025, 8, 15, 12, 0, 0, DateTimeKind.Utc),
                    Notes = "Раннее заселение",
                    CreatedAt = new DateTime(2025, 8, 9, 14, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2025, 8, 16, 12, 0, 0, DateTimeKind.Utc),
                    TotalAmount = 51000,
                    PaidAmount = 51000,
                    DueDate = new DateTime(2025, 8, 9, 0, 0, 0, DateTimeKind.Utc),
                    PaymentStatusId = 3,
                    PaymentDate = new DateTime(2025, 8, 9, 10, 0, 0, DateTimeKind.Utc),
                    TaxPercent = 20,
                    EmployeeId = 1
                },
                new Stay
                {
                    StayId = 2,
                    BookingId = 2,
                    ActualCheckInDate = new DateTime(2025, 8, 17, 15, 0, 0, DateTimeKind.Utc),
                    ActualCheckOutDate = new DateTime(2025, 8, 25, 11, 0, 0, DateTimeKind.Utc),
                    Notes = "Деловая поездка",
                    CreatedAt = new DateTime(2025, 8, 12, 15, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2025, 8, 26, 11, 0, 0, DateTimeKind.Utc),
                    TotalAmount = 68000,
                    PaidAmount = 68000,
                    DueDate = new DateTime(2025, 8, 17, 0, 0, 0, DateTimeKind.Utc),
                    PaymentStatusId = 3,
                    PaymentDate = new DateTime(2025, 8, 18, 9, 0, 0, DateTimeKind.Utc),
                    TaxPercent = 20,
                    EmployeeId = 1
                },
                new Stay
                {
                    StayId = 3,
                    BookingId = 3,
                    ActualCheckInDate = new DateTime(2025, 8, 13, 16, 0, 0, DateTimeKind.Utc),
                    ActualCheckOutDate = new DateTime(2025, 8, 15, 16, 0, 0, DateTimeKind.Utc),
                    Notes = "",
                    CreatedAt = new DateTime(2025, 8, 20, 13, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = null,
                    TotalAmount = 7000,
                    PaidAmount = 7000,
                    DueDate = new DateTime(2025, 8, 13, 0, 0, 0, DateTimeKind.Utc),
                    PaymentStatusId = 3,
                    PaymentDate = new DateTime(2025, 8, 13, 0, 0, 0, DateTimeKind.Utc),
                    TaxPercent = 20,
                    EmployeeId = 2
                },
                new Stay
                {
                    StayId = 4,
                    BookingId = 4,
                    ActualCheckInDate = new DateTime(2025, 8, 14, 14, 30, 0, DateTimeKind.Utc),
                    ActualCheckOutDate = new DateTime(2025, 8, 18, 10, 0, 0, DateTimeKind.Utc),
                    Notes = "Семейный отдых",
                    CreatedAt = new DateTime(2025, 8, 13, 14, 30, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2025, 8, 20, 10, 0, 0, DateTimeKind.Utc),
                    TotalAmount = 22000,
                    PaidAmount = 21000,
                    DueDate = new DateTime(2025, 8, 14, 0, 0, 0, DateTimeKind.Utc),
                    PaymentStatusId = 2,
                    PaymentDate = new DateTime(2025, 8, 16, 18, 0, 0, DateTimeKind.Utc),
                    TaxPercent = 20,
                    EmployeeId = 1
                },
                new Stay
                {
                    StayId = 5,
                    BookingId = 5,
                    ActualCheckInDate = new DateTime(2025, 8, 10, 13, 0, 0, DateTimeKind.Utc),
                    ActualCheckOutDate = new DateTime(2025, 8, 20, 13, 0, 0, DateTimeKind.Utc),
                    Notes = "",
                    CreatedAt = new DateTime(2025, 8, 10, 13, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = null,
                    TotalAmount = 25000,
                    PaidAmount = 25000,
                    DueDate = new DateTime(2025, 8, 11, 0, 0, 0, DateTimeKind.Utc),
                    PaymentStatusId = 3,
                    PaymentDate = new DateTime(2025, 8, 11, 0, 0, 0, DateTimeKind.Utc),
                    TaxPercent = 20,
                    EmployeeId = 2
                }
            );

            // Заполнение продаж услуг
            modelBuilder.Entity<ServiceSale>().HasData(
                new ServiceSale
                {
                    ServiceSaleId = 1,
                    ServiceId = 1,
                    EmployeeId = 1,
                    GuestId = 1,
                    StayId = 1,
                    Quantity = 2,
                    UnitPrice = 500,
                    TotalPrice = 1000,
                    TaxPercent = 20,
                    SaleDate = new DateTime(2025, 8, 6, 8, 0, 0, DateTimeKind.Utc),
                    Notes = "",
                    PaymentStatusId = 3,
                    CreatedAt = new DateTime(2025, 8, 6, 8, 0, 0, DateTimeKind.Utc)
                },
                new ServiceSale
                {
                    ServiceSaleId = 2,
                    ServiceId = 2,
                    EmployeeId = 2,
                    GuestId = 2,
                    StayId = 2,
                    Quantity = 1,
                    UnitPrice = 1000,
                    TotalPrice = 1000,
                    TaxPercent = 20,
                    SaleDate = new DateTime(2025, 8, 13, 10, 0, 0, DateTimeKind.Utc),
                    Notes = "",
                    PaymentStatusId = 3,
                    CreatedAt = new DateTime(2025, 8, 13, 10, 0, 0, DateTimeKind.Utc)
                },
                new ServiceSale
                {
                    ServiceSaleId = 3,
                    ServiceId = 3,
                    EmployeeId = 1,
                    GuestId = 3,
                    StayId = 3,
                    Quantity = 1,
                    UnitPrice = 300,
                    TotalPrice = 300,
                    TaxPercent = 20,
                    SaleDate = new DateTime(2025, 8, 21, 16, 30, 0, DateTimeKind.Utc),
                    Notes = "",
                    PaymentStatusId = 1,
                    CreatedAt = new DateTime(2025, 8, 21, 16, 30, 0, DateTimeKind.Utc)
                },
                new ServiceSale
                {
                    ServiceSaleId = 4,
                    ServiceId = 1,
                    EmployeeId = 1,
                    GuestId = 1,
                    StayId = 4,
                    Quantity = 3,
                    UnitPrice = 500,
                    TotalPrice = 1500,
                    TaxPercent = 20,
                    SaleDate = new DateTime(2025, 8, 26, 9, 0, 0, DateTimeKind.Utc),
                    Notes = "",
                    PaymentStatusId = 3,
                    CreatedAt = new DateTime(2025, 8, 26, 9, 0, 0, DateTimeKind.Utc)
                },
                new ServiceSale
                {
                    ServiceSaleId = 5,
                    ServiceId = 4,
                    EmployeeId = 2,
                    GuestId = 2,
                    StayId = 5,
                    Quantity = 1,
                    UnitPrice = 1500,
                    TotalPrice = 1500,
                    TaxPercent = 20,
                    SaleDate = new DateTime(2025, 8, 31, 11, 0, 0, DateTimeKind.Utc),
                    Notes = "",
                    PaymentStatusId = 1,
                    CreatedAt = new DateTime(2025, 8, 31, 11, 0, 0, DateTimeKind.Utc)
                }
            );

            // Заполнение гостей в проживании (StayGuests)
            modelBuilder.Entity<StayGuest>().HasData(
                new StayGuest
                {
                    StayGuestId = 1,
                    StayId = 1,
                    GuestId = 1,
                    IsMainGuest = true,
                    CheckInDate = new DateTime(2025, 8, 9, 14, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 15, 12, 0, 0, DateTimeKind.Utc),
                    Notes = ""
                },
                new StayGuest
                {
                    StayGuestId = 2,
                    StayId = 2,
                    GuestId = 2,
                    IsMainGuest = true,
                    CheckInDate = new DateTime(2025, 8, 17, 15, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 25, 11, 0, 0, DateTimeKind.Utc),
                    Notes = ""
                },
                new StayGuest
                {
                    StayGuestId = 3,
                    StayId = 3,
                    GuestId = 3,
                    IsMainGuest = true,
                    CheckInDate = new DateTime(2025, 8, 13, 16, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 15, 16, 0, 0, DateTimeKind.Utc),
                    Notes = ""
                },
                new StayGuest
                {
                    StayGuestId = 4,
                    StayId = 4,
                    GuestId = 4,
                    IsMainGuest = true,
                    CheckInDate = new DateTime(2025, 8, 14, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 18, 0, 0, 0, DateTimeKind.Utc),
                    Notes = ""
                },
                new StayGuest
                {
                    StayGuestId = 5,
                    StayId = 5,
                    GuestId = 5,
                    IsMainGuest = true,
                    CheckInDate = new DateTime(2025, 8, 10, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 20, 0, 0, 0, DateTimeKind.Utc),
                    Notes = ""
                },
                new StayGuest
                {
                    StayGuestId = 6,
                    StayId = 1,
                    GuestId = 2,
                    IsMainGuest = false,
                    CheckInDate = new DateTime(2025, 8, 9, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 13, 0, 0, 0, DateTimeKind.Utc),
                    Notes = ""
                }
            );
        }
    }
}
