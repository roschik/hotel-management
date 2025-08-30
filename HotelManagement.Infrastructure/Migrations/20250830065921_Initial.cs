using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HotelManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BookingStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BookingTypes",
                columns: table => new
                {
                    BookingTypeId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingTypes", x => x.BookingTypeId);
                });

            migrationBuilder.CreateTable(
                name: "Citizenships",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Citizenships", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IdentificationTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IdentificationTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PaymentStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RoomTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    ServiceId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.ServiceId);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    EmployeeId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirstName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MiddleName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Position = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DepartmentId = table.Column<int>(type: "integer", nullable: false),
                    HireDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Salary = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    EmployeeStatusId = table.Column<int>(type: "integer", nullable: false),
                    Address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    EmergencyContactName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EmergencyContactPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.EmployeeId);
                    table.ForeignKey(
                        name: "FK_Employees_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_EmployeeStatuses_EmployeeStatusId",
                        column: x => x.EmployeeStatusId,
                        principalTable: "EmployeeStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Guests",
                columns: table => new
                {
                    GuestId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirstName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MiddleName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IdentificationTypeId = table.Column<int>(type: "integer", nullable: false),
                    IdentificationNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    IdentificationIssuedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IdentificationIssuedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RegistrationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    CitizenshipId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Guests", x => x.GuestId);
                    table.ForeignKey(
                        name: "FK_Guests_Citizenships_CitizenshipId",
                        column: x => x.CitizenshipId,
                        principalTable: "Citizenships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Guests_IdentificationTypes_IdentificationTypeId",
                        column: x => x.IdentificationTypeId,
                        principalTable: "IdentificationTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rooms",
                columns: table => new
                {
                    RoomId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoomNumber = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    RoomTypeId = table.Column<int>(type: "integer", nullable: false),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    PricePerNight = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Floor = table.Column<int>(type: "integer", nullable: false),
                    HasWifi = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    HasTV = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    HasMinibar = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    HasAirConditioning = table.Column<bool>(type: "boolean", nullable: false),
                    HasBalcony = table.Column<bool>(type: "boolean", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rooms", x => x.RoomId);
                    table.ForeignKey(
                        name: "FK_Rooms_RoomTypes_RoomTypeId",
                        column: x => x.RoomTypeId,
                        principalTable: "RoomTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GuestId = table.Column<int>(type: "integer", nullable: false),
                    RoomId = table.Column<int>(type: "integer", nullable: false),
                    BookingTypeId = table.Column<int>(type: "integer", nullable: false),
                    BookingStatusId = table.Column<int>(type: "integer", nullable: false),
                    EmployeeId = table.Column<int>(type: "integer", nullable: true),
                    CheckInDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CheckOutDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BasePrice = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_BookingStatuses_BookingStatusId",
                        column: x => x.BookingStatusId,
                        principalTable: "BookingStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_BookingTypes_BookingTypeId",
                        column: x => x.BookingTypeId,
                        principalTable: "BookingTypes",
                        principalColumn: "BookingTypeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId");
                    table.ForeignKey(
                        name: "FK_Bookings_Guests_GuestId",
                        column: x => x.GuestId,
                        principalTable: "Guests",
                        principalColumn: "GuestId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_Rooms_RoomId",
                        column: x => x.RoomId,
                        principalTable: "Rooms",
                        principalColumn: "RoomId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Stays",
                columns: table => new
                {
                    StayId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BookingId = table.Column<int>(type: "integer", nullable: false),
                    ActualCheckInDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ActualCheckOutDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    TotalAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false, defaultValue: 0m),
                    PaidAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false, defaultValue: 0m),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentStatusId = table.Column<int>(type: "integer", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TaxPercent = table.Column<decimal>(type: "numeric(10,2)", nullable: false, defaultValue: 0m),
                    EmployeeId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stays", x => x.StayId);
                    table.ForeignKey(
                        name: "FK_Stays_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Stays_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Stays_PaymentStatuses_PaymentStatusId",
                        column: x => x.PaymentStatusId,
                        principalTable: "PaymentStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ServiceSales",
                columns: table => new
                {
                    ServiceSaleId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ServiceId = table.Column<int>(type: "integer", nullable: false),
                    EmployeeId = table.Column<int>(type: "integer", nullable: false),
                    GuestId = table.Column<int>(type: "integer", nullable: true),
                    StayId = table.Column<int>(type: "integer", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    UnitPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    TaxPercent = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    SaleDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PaymentStatusId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceSales", x => x.ServiceSaleId);
                    table.ForeignKey(
                        name: "FK_ServiceSales_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceSales_Guests_GuestId",
                        column: x => x.GuestId,
                        principalTable: "Guests",
                        principalColumn: "GuestId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceSales_PaymentStatuses_PaymentStatusId",
                        column: x => x.PaymentStatusId,
                        principalTable: "PaymentStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceSales_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "ServiceId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceSales_Stays_StayId",
                        column: x => x.StayId,
                        principalTable: "Stays",
                        principalColumn: "StayId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "StayGuests",
                columns: table => new
                {
                    StayGuestId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StayId = table.Column<int>(type: "integer", nullable: false),
                    GuestId = table.Column<int>(type: "integer", nullable: false),
                    IsMainGuest = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CheckInDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CheckOutDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StayGuests", x => x.StayGuestId);
                    table.ForeignKey(
                        name: "FK_StayGuests_Guests_GuestId",
                        column: x => x.GuestId,
                        principalTable: "Guests",
                        principalColumn: "GuestId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StayGuests_Stays_StayId",
                        column: x => x.StayId,
                        principalTable: "Stays",
                        principalColumn: "StayId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "BookingStatuses",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Подтверждено", "Confirmed" },
                    { 2, "Завершено", "Completed" },
                    { 3, "Отменено", "Cancelled" },
                    { 4, "Ожидает подтверждения", "Pending" }
                });

            migrationBuilder.InsertData(
                table: "BookingTypes",
                columns: new[] { "BookingTypeId", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Веб-сайт", "Online" },
                    { 2, "Телефон", "Phone" },
                    { 3, "Ресепшн", "Reception" }
                });

            migrationBuilder.InsertData(
                table: "Citizenships",
                columns: new[] { "Id", "Code", "Description", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, "RU", "Гражданство Российской Федерации", true, "Российская Федерация" },
                    { 2, "US", "Гражданство США", true, "Соединенные Штаты Америки" },
                    { 3, "DE", "Гражданство Германии", true, "Германия" },
                    { 4, "FR", "Гражданство Франции", true, "Франция" },
                    { 5, "CN", "Гражданство Китая", true, "Китай" },
                    { 6, "GB", "Гражданство Великобритании", true, "Великобритания" },
                    { 7, "JP", "Гражданство Японии", true, "Япония" },
                    { 8, "CA", "Гражданство Канады", true, "Канада" },
                    { 9, "AU", "Гражданство Австралии", true, "Австралия" },
                    { 10, "BR", "Гражданство Бразилии", true, "Бразилия" }
                });

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Административный отдел", "Администрация" },
                    { 2, "Отдел обслуживания гостей", "Обслуживание" },
                    { 3, "Отдел уборки и хозяйства", "Хозяйственный" },
                    { 4, "Служба безопасности", "Безопасность" },
                    { 5, "Отдел инженерного и технического обслуживания", "Инженерно-технический" }
                });

            migrationBuilder.InsertData(
                table: "EmployeeStatuses",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Сотрудник активно работает", "Активный" },
                    { 2, "Сотрудник находится в отпуске", "В отпуске" },
                    { 3, "Сотрудник уволен", "Уволен" },
                    { 4, "Сотрудник на больничном", "На больничном" }
                });

            migrationBuilder.InsertData(
                table: "IdentificationTypes",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Основной документ, удостоверяющий личность гражданина Российской Федерации.", "Паспорт гражданина РФ" },
                    { 2, "Документ, удостоверяющий личность гражданина РФ за пределами страны.", "Заграничный паспорт" },
                    { 3, "Документ, подтверждающий право на управление транспортными средствами.", "Водительское удостоверение" },
                    { 4, "Документ, удостоверяющий личность военнослужащего или призывника.", "Военный билет" },
                    { 5, "Документ, подтверждающий факт рождения и личность ребенка.", "Свидетельство о рождении" }
                });

            migrationBuilder.InsertData(
                table: "PaymentStatuses",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Платеж ожидает обработки", "Ожидает оплаты" },
                    { 2, "Платеж частично выполнен", "Частично оплачено" },
                    { 3, "Платеж полностью выполнен", "Оплачено" },
                    { 4, "Платеж просрочен", "Просрочено" },
                    { 5, "Платеж отменен", "Отменено" }
                });

            migrationBuilder.InsertData(
                table: "RoomTypes",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Уютный номер с одной или двумя кроватями, подходит для кратковременного проживания.", "Стандартный номер" },
                    { 2, "Просторный номер с улучшенной отделкой, мини-баром и видом на горы.", "Делюкс номер" },
                    { 3, "Роскошный номер с гостиной зоной, роскошным видом и премиальным сервисом.", "Люкс" },
                    { 4, "Большой номер с двумя смежными комнатами, рассчитанный на размещение семьи.", "Семейный номер" },
                    { 5, "Небольшой бюджетный номер с минимальным набором удобств.", "Эконом номер" }
                });

            migrationBuilder.InsertData(
                table: "Services",
                columns: new[] { "ServiceId", "CreatedAt", "Description", "DurationMinutes", "ImageUrl", "IsActive", "Name", "Price" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Завтрак с доставкой в номер", 60, "/uploads/images/breakfast.jpg", true, "Завтрак", 500m },
                    { 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Охраняемое парковочное место на территории отеля", 1440, "/uploads/images/parking.jpg", true, "Парковка", 1000m },
                    { 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Высокоскоростной интернет", 1440, "/uploads/images/wifi.jpg", true, "Wi-Fi Premium", 300m },
                    { 4, new DateTime(2024, 1, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Расслабляющий массаж и спа-процедуры", 90, "", true, "Спа-процедуры", 1500m },
                    { 5, new DateTime(2024, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Комфортабельный трансфер до аэропорта и обратно", 120, "", true, "Трансфер из аэропорта", 800m }
                });

            migrationBuilder.InsertData(
                table: "Employees",
                columns: new[] { "EmployeeId", "Address", "DepartmentId", "Email", "EmergencyContactName", "EmergencyContactPhone", "EmployeeStatusId", "FirstName", "HireDate", "IsActive", "LastName", "MiddleName", "Phone", "Position", "Salary" },
                values: new object[,]
                {
                    { 1, "ул. Рабочая, д. 5, кв. 20", 1, "elena.admin@hotel.com", "Петр Иванов", "+7-900-111-22-33", 1, "Елена", new DateTime(2022, 1, 15, 0, 0, 0, 0, DateTimeKind.Utc), true, "Иванова", "Александровна", "+7-800-555-01-01", "Администратор", 45000m },
                    { 2, "ул. Толстого, д. 120, кв. 54", 1, "olesya.admin@hotel.com", "Сергей Николаев", "+7-925-687-33-57", 1, "Олеся", new DateTime(2024, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc), true, "Николаева", "Викторовна", "+7-925-687-33-56", "Администратор", 40000m },
                    { 3, "ул. Трудовая, д. 12, кв. 7", 3, "sergey.cleaner@hotel.com", "Мария Петрова", "+7-900-222-33-44", 1, "Надежда", new DateTime(2022, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), true, "Петрова", "Сергеевна", "+7-800-555-02-02", "Уборщик", 35000m },
                    { 4, "пр. Мира, д. 8, кв. 15", 5, "alexey.tech@hotel.com", "Ольга Попова", "+7-900-333-44-55", 1, "Алексей", new DateTime(2021, 11, 10, 0, 0, 0, 0, DateTimeKind.Utc), true, "Попов", "Михайлович", "+7-800-555-03-03", "Техник", 50000m }
                });

            migrationBuilder.InsertData(
                table: "Guests",
                columns: new[] { "GuestId", "Address", "CitizenshipId", "CreatedAt", "DateOfBirth", "Email", "FirstName", "IdentificationIssuedBy", "IdentificationIssuedDate", "IdentificationNumber", "IdentificationTypeId", "LastName", "MiddleName", "Notes", "Phone", "PostalCode", "RegistrationDate" },
                values: new object[,]
                {
                    { 1, "г. Новокузнецк, ул. Ленина, д. 10, кв. 5", 1, new DateTime(2025, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1985, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "ivan.petrov@email.com", "Иван", "ОУФМС России по г. Москве", new DateTime(2010, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc), "4510123456", 1, "Петров", "Сергеевич", "VIP клиент", "+7-900-123-45-67", "101000", new DateTime(2023, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "г. Санкт-Петербург, пр. Невский, д. 25, кв. 12", 1, new DateTime(2025, 8, 15, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1990, 8, 22, 0, 0, 0, 0, DateTimeKind.Utc), "anna.smirnova@email.com", "Анна", "ОУФМС России по СПб", new DateTime(2015, 9, 10, 0, 0, 0, 0, DateTimeKind.Utc), "4012345678", 1, "Смирнова", "Владимировна", "Постоянный клиент", "+7-911-234-56-78", "191025", new DateTime(2015, 8, 15, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "г. Барнаул, просп. Ленина, д. 48, кв. 12", 1, new DateTime(2025, 8, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1978, 12, 5, 0, 0, 0, 0, DateTimeKind.Utc), "mikhail.kozlov@email.com", "Михаил", "ТП УФМС России по Алтайскому краю в г. Барнаул", new DateTime(2020, 10, 15, 0, 0, 0, 0, DateTimeKind.Utc), "2220123456", 1, "Козлов", "Александрович", "", "+7-922-345-67-89", "620014", new DateTime(2008, 10, 3, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, "г. Новосибирск, ул. Гагарина, д. 15, кв. 8", 1, new DateTime(2025, 8, 3, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1999, 8, 6, 0, 0, 0, 0, DateTimeKind.Utc), "semen.kuznetsov@email.com", "Семен", "ОУФМС России по Свердловской обл.", new DateTime(2008, 3, 18, 0, 0, 0, 0, DateTimeKind.Utc), "6603456789", 1, "Кузнецов", "Васильевич", "Деловые поездки", "+7-925-687-33-56", "543217", new DateTime(2008, 10, 3, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, "г. Пенза, ул. Пушкина, д. 10, кв. 5", 1, new DateTime(2025, 8, 8, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1987, 7, 6, 0, 0, 0, 0, DateTimeKind.Utc), "svetlana.sergeevna@email.com", "Васильева", "ОУФМС России по Волгоградской обл.", new DateTime(2019, 4, 23, 0, 0, 0, 0, DateTimeKind.Utc), "5566876543", 1, "Сергеевна", "Светлана", "", "+7-925-687-33-56", "987345", new DateTime(2022, 10, 3, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "RoomId", "Capacity", "Floor", "HasAirConditioning", "HasBalcony", "HasTV", "HasWifi", "ImageUrl", "IsAvailable", "PricePerNight", "RoomNumber", "RoomTypeId" },
                values: new object[,]
                {
                    { 1, 2, 1, true, false, true, true, "/uploads/images/room101.jpg", true, 3500m, "101", 1 },
                    { 2, 3, 2, true, true, true, true, "/uploads/images/room201.jpg", true, 5500m, "201", 2 }
                });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "RoomId", "Capacity", "Floor", "HasAirConditioning", "HasBalcony", "HasMinibar", "HasTV", "HasWifi", "ImageUrl", "IsAvailable", "PricePerNight", "RoomNumber", "RoomTypeId" },
                values: new object[,]
                {
                    { 3, 4, 3, true, true, true, true, true, "/uploads/images/room301.jpg", true, 8500m, "301", 3 },
                    { 4, 5, 3, true, false, true, true, true, "", true, 6500m, "302", 4 }
                });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "RoomId", "Capacity", "Floor", "HasAirConditioning", "HasBalcony", "HasTV", "ImageUrl", "IsAvailable", "PricePerNight", "RoomNumber", "RoomTypeId" },
                values: new object[] { 5, 2, 2, true, false, true, "", true, 2500m, "202", 5 });

            migrationBuilder.InsertData(
                table: "Bookings",
                columns: new[] { "Id", "BasePrice", "BookingStatusId", "BookingTypeId", "CancelledAt", "CheckInDate", "CheckOutDate", "CreatedAt", "EmployeeId", "GuestId", "Notes", "RoomId", "TotalPrice", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 42500m, 1, 1, null, new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 15, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), 1, 1, "", 3, 42500m, null },
                    { 2, 68000m, 1, 1, null, new DateTime(2025, 8, 17, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 16, 0, 0, 0, 0, DateTimeKind.Utc), 1, 2, "", 3, 68000m, new DateTime(2025, 8, 17, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, 7000m, 1, 2, null, new DateTime(2025, 8, 13, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 15, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 11, 0, 0, 0, 0, DateTimeKind.Utc), 2, 3, "Командировка", 1, 7000m, new DateTime(2025, 8, 14, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, 22000m, 1, 2, null, new DateTime(2025, 8, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 18, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 11, 0, 0, 0, 0, DateTimeKind.Utc), 2, 4, "Семейный отдых", 2, 22000m, new DateTime(2025, 8, 14, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, 25000m, 1, 1, null, new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 20, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), 1, 5, "", 5, 25000m, new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, 39000m, 3, 3, new DateTime(2025, 8, 20, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 22, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 11, 0, 0, 0, 0, DateTimeKind.Utc), 1, 3, "Отмена по семейным обстоятельствам", 4, 39000m, new DateTime(2025, 8, 13, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "Stays",
                columns: new[] { "StayId", "ActualCheckInDate", "ActualCheckOutDate", "BookingId", "CreatedAt", "DueDate", "EmployeeId", "Notes", "PaidAmount", "PaymentDate", "PaymentStatusId", "TaxPercent", "TotalAmount", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 8, 9, 14, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 15, 12, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2025, 8, 9, 14, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 9, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Раннее заселение", 51000m, new DateTime(2025, 8, 9, 10, 0, 0, 0, DateTimeKind.Utc), 3, 20m, 51000m, new DateTime(2025, 8, 16, 12, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2025, 8, 17, 15, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 25, 11, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2025, 8, 12, 15, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Деловая поездка", 68000m, new DateTime(2025, 8, 18, 9, 0, 0, 0, DateTimeKind.Utc), 3, 20m, 68000m, new DateTime(2025, 8, 26, 11, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "Stays",
                columns: new[] { "StayId", "ActualCheckInDate", "ActualCheckOutDate", "BookingId", "CreatedAt", "DueDate", "EmployeeId", "Notes", "PaidAmount", "PaymentDate", "PaymentStatusId", "TaxPercent", "TotalAmount" },
                values: new object[] { 3, new DateTime(2025, 8, 13, 16, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 15, 16, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2025, 8, 20, 13, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 13, 0, 0, 0, 0, DateTimeKind.Utc), 2, "", 7000m, new DateTime(2025, 8, 13, 0, 0, 0, 0, DateTimeKind.Utc), 3, 20m, 7000m });

            migrationBuilder.InsertData(
                table: "Stays",
                columns: new[] { "StayId", "ActualCheckInDate", "ActualCheckOutDate", "BookingId", "CreatedAt", "DueDate", "EmployeeId", "Notes", "PaidAmount", "PaymentDate", "PaymentStatusId", "TaxPercent", "TotalAmount", "UpdatedAt" },
                values: new object[] { 4, new DateTime(2025, 8, 14, 14, 30, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 18, 10, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2025, 8, 13, 14, 30, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 14, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Семейный отдых", 21000m, new DateTime(2025, 8, 16, 18, 0, 0, 0, DateTimeKind.Utc), 2, 20m, 22000m, new DateTime(2025, 8, 20, 10, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "Stays",
                columns: new[] { "StayId", "ActualCheckInDate", "ActualCheckOutDate", "BookingId", "CreatedAt", "DueDate", "EmployeeId", "Notes", "PaidAmount", "PaymentDate", "PaymentStatusId", "TaxPercent", "TotalAmount" },
                values: new object[] { 5, new DateTime(2025, 8, 10, 13, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 20, 13, 0, 0, 0, DateTimeKind.Utc), 5, new DateTime(2025, 8, 10, 13, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 11, 0, 0, 0, 0, DateTimeKind.Utc), 2, "", 25000m, new DateTime(2025, 8, 11, 0, 0, 0, 0, DateTimeKind.Utc), 3, 20m, 25000m });

            migrationBuilder.InsertData(
                table: "ServiceSales",
                columns: new[] { "ServiceSaleId", "CreatedAt", "EmployeeId", "GuestId", "Notes", "PaymentStatusId", "Quantity", "SaleDate", "ServiceId", "StayId", "TaxPercent", "TotalPrice", "UnitPrice" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 8, 6, 8, 0, 0, 0, DateTimeKind.Utc), 1, 1, "", 3, 2, new DateTime(2025, 8, 6, 8, 0, 0, 0, DateTimeKind.Utc), 1, 1, 20m, 1000m, 500m },
                    { 2, new DateTime(2025, 8, 13, 10, 0, 0, 0, DateTimeKind.Utc), 2, 2, "", 3, 1, new DateTime(2025, 8, 13, 10, 0, 0, 0, DateTimeKind.Utc), 2, 2, 20m, 1000m, 1000m },
                    { 3, new DateTime(2025, 8, 21, 16, 30, 0, 0, DateTimeKind.Utc), 1, 3, "", 1, 1, new DateTime(2025, 8, 21, 16, 30, 0, 0, DateTimeKind.Utc), 3, 3, 20m, 300m, 300m },
                    { 4, new DateTime(2025, 8, 26, 9, 0, 0, 0, DateTimeKind.Utc), 1, 1, "", 3, 3, new DateTime(2025, 8, 26, 9, 0, 0, 0, DateTimeKind.Utc), 1, 4, 20m, 1500m, 500m },
                    { 5, new DateTime(2025, 8, 31, 11, 0, 0, 0, DateTimeKind.Utc), 2, 2, "", 1, 1, new DateTime(2025, 8, 31, 11, 0, 0, 0, DateTimeKind.Utc), 4, 5, 20m, 1500m, 1500m }
                });

            migrationBuilder.InsertData(
                table: "StayGuests",
                columns: new[] { "StayGuestId", "CheckInDate", "CheckOutDate", "GuestId", "IsMainGuest", "Notes", "StayId" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 8, 9, 14, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 15, 12, 0, 0, 0, DateTimeKind.Utc), 1, true, "", 1 },
                    { 2, new DateTime(2025, 8, 17, 15, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 25, 11, 0, 0, 0, DateTimeKind.Utc), 2, true, "", 2 },
                    { 3, new DateTime(2025, 8, 13, 16, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 15, 16, 0, 0, 0, DateTimeKind.Utc), 3, true, "", 3 },
                    { 4, new DateTime(2025, 8, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 18, 0, 0, 0, 0, DateTimeKind.Utc), 4, true, "", 4 },
                    { 5, new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 20, 0, 0, 0, 0, DateTimeKind.Utc), 5, true, "", 5 }
                });

            migrationBuilder.InsertData(
                table: "StayGuests",
                columns: new[] { "StayGuestId", "CheckInDate", "CheckOutDate", "GuestId", "Notes", "StayId" },
                values: new object[] { 6, new DateTime(2025, 8, 9, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 13, 0, 0, 0, 0, DateTimeKind.Utc), 2, "", 1 });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_BookingStatusId",
                table: "Bookings",
                column: "BookingStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_BookingTypeId",
                table: "Bookings",
                column: "BookingTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_EmployeeId",
                table: "Bookings",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_GuestId",
                table: "Bookings",
                column: "GuestId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_RoomId",
                table: "Bookings",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_Citizenships_Code",
                table: "Citizenships",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DepartmentId",
                table: "Employees",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_EmployeeStatusId",
                table: "Employees",
                column: "EmployeeStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Guests_CitizenshipId",
                table: "Guests",
                column: "CitizenshipId");

            migrationBuilder.CreateIndex(
                name: "IX_Guests_IdentificationTypeId",
                table: "Guests",
                column: "IdentificationTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_RoomTypeId",
                table: "Rooms",
                column: "RoomTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSales_EmployeeId",
                table: "ServiceSales",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSales_GuestId",
                table: "ServiceSales",
                column: "GuestId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSales_PaymentStatusId",
                table: "ServiceSales",
                column: "PaymentStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSales_ServiceId",
                table: "ServiceSales",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSales_StayId",
                table: "ServiceSales",
                column: "StayId");

            migrationBuilder.CreateIndex(
                name: "IX_StayGuests_GuestId",
                table: "StayGuests",
                column: "GuestId");

            migrationBuilder.CreateIndex(
                name: "IX_StayGuests_StayId_GuestId",
                table: "StayGuests",
                columns: new[] { "StayId", "GuestId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Stays_BookingId",
                table: "Stays",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_Stays_EmployeeId",
                table: "Stays",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Stays_PaymentStatusId",
                table: "Stays",
                column: "PaymentStatusId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceSales");

            migrationBuilder.DropTable(
                name: "StayGuests");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropTable(
                name: "Stays");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "PaymentStatuses");

            migrationBuilder.DropTable(
                name: "BookingStatuses");

            migrationBuilder.DropTable(
                name: "BookingTypes");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "Guests");

            migrationBuilder.DropTable(
                name: "Rooms");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "EmployeeStatuses");

            migrationBuilder.DropTable(
                name: "Citizenships");

            migrationBuilder.DropTable(
                name: "IdentificationTypes");

            migrationBuilder.DropTable(
                name: "RoomTypes");
        }
    }
}
