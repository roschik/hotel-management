using AutoMapper;
using HotelManagement.Core.Interfaces;
using HotelManagement.Core.Interfaces.Services;
using HotelManagement.Core.Services;
using HotelManagement.Infrastructure.Data;
using HotelManagement.Infrastructure.Mappings;
using HotelManagement.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
Console.WriteLine($"DATABASE_URL value: '{connectionString}'");
Console.WriteLine($"DATABASE_URL length: {connectionString?.Length ?? 0}");

if (string.IsNullOrEmpty(connectionString))
    throw new InvalidOperationException("DATABASE_URL environment variable not found or empty.");

var uri = new Uri(connectionString);
var connectionStringBuilder = new Npgsql.NpgsqlConnectionStringBuilder
{
    Host = uri.Host,
    Port = uri.Port,
    Database = uri.AbsolutePath.Trim('/'),
    Username = uri.UserInfo.Split(':')[0],
    Password = uri.UserInfo.Split(':')[1]
};

var processedConnectionString = connectionStringBuilder.ToString();
Console.WriteLine($"Processed connection string: {processedConnectionString}");

// Database configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(processedConnectionString));

// Register repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IGuestRepository, GuestRepository>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IRoomTypeRepository, RoomTypeRepository>();
builder.Services.AddScoped<IServiceSaleRepository, ServiceSaleRepository>();
builder.Services.AddScoped<IStayRepository, StayRepository>();
builder.Services.AddScoped<ICitizenshipRepository, CitizenshipRepository>();

// Register services
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IGuestService, GuestService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IRoomTypeService, RoomTypeService>();
builder.Services.AddScoped<IServiceSaleService, ServiceSaleService>();
builder.Services.AddScoped<IStayService, StayService>();
builder.Services.AddScoped<ICitizenshipService, CitizenshipService>();

builder.Services.AddControllers();
// AutoMapper configuration
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>());

builder.Services.AddAuthorization();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", builder =>
    {
        builder.WithOrigins(
                "http://localhost:3000",
                "https://hotel-management-client-5584.onrender.com"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Swagger configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Hotel Management API",
        Version = "v1",
        Description = "API ",
        Contact = new OpenApiContact
        {
            Name = "Администратор",
            Email = "admin@hotelmanagement.com"
        }
    });
});

var app = builder.Build();

app.MigrateDatabase();
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowReactApp");
app.UseStaticFiles();

var uploadsPath = Path.Combine(app.Environment.WebRootPath ?? app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads",
    OnPrepareResponse = ctx =>
    {
        var allowedOrigins = new[] { "http://localhost:3000", "https://hotel-management-client-5584.onrender.com" };
        var origin = ctx.Context.Request.Headers["Origin"].ToString();
        if (allowedOrigins.Contains(origin))
        {
            ctx.Context.Response.Headers.Add("Access-Control-Allow-Origin", origin);
        }
        ctx.Context.Response.Headers.Add("Access-Control-Allow-Methods", "GET");
        ctx.Context.Response.Headers.Add("Access-Control-Allow-Headers", "*");
    }
});

app.UseAuthorization();

app.MapControllers();

app.Run();