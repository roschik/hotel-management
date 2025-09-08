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

// Database configuration
string connectionString;
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

if (!string.IsNullOrEmpty(databaseUrl))
{
    try
    {
        var uri = new Uri(databaseUrl);
        connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.Trim('/')};Username={uri.UserInfo.Split(':')[0]};Password={uri.UserInfo.Split(':')[1]};SSL Mode=Require;Trust Server Certificate=true";
    }
    catch (Exception ex)
    {
        throw new InvalidOperationException($"Invalid DATABASE_URL format: {ex.Message}");
    }
}
else
{
    // Fallback to connection string from appsettings
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("No database connection string found in DATABASE_URL or DefaultConnection.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

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
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "https://hotel-management-client-5584.onrender.com"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
    });
    
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
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

// Global exception handling
app.UseExceptionHandler(appError =>
{
    appError.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        
        var contextFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (contextFeature != null)
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(contextFeature.Error, "An unhandled exception occurred: {Message}", contextFeature.Error.Message);
            
            var response = new
            {
                StatusCode = context.Response.StatusCode,
                Message = "Internal Server Error. Please try again later.",
                Details = app.Environment.IsDevelopment() ? contextFeature.Error.Message : null
            };
            
            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
        }
    });
});

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