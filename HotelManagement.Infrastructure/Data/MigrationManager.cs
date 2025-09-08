using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace HotelManagement.Infrastructure.Data
{
    public static class MigrationManager
    {
        public static async Task<IHost> MigrateDatabaseAsync(this IHost host)
        {
            using (var scope = host.Services.CreateScope())
            {
                using (var appContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>())
                {
                    try
                {
                    var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();
                    logger.LogInformation("Начало миграции базы данных...");
                    
                    // Log connection info (without password)
                    var connectionString = appContext.Database.GetConnectionString();
                    if (!string.IsNullOrEmpty(connectionString))
                    {
                        var safeConnectionString = connectionString.Contains("Password=") 
                            ? connectionString.Substring(0, connectionString.IndexOf("Password=")) + "Password=***"
                            : connectionString;
                        logger.LogInformation($"Строка подключения: {safeConnectionString}");
                    }
                    
                    // Test connection first
                    logger.LogInformation("Проверка подключения к базе данных...");
                    await appContext.Database.CanConnectAsync();
                    logger.LogInformation("Подключение к базе данных успешно.");

                    appContext.Database.Migrate();

                    logger.LogInformation("Миграция базы данных успешно завершена.");
                }
                catch (Exception ex)
                {
                    var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();
                    logger.LogError(ex, "Произошла ошибка при миграции базы данных.");
                    
                    // Log additional connection details for debugging
                    try
                    {
                        var connectionString = appContext.Database.GetConnectionString();
                        logger.LogError($"Тип исключения: {ex.GetType().Name}");
                        logger.LogError($"Сообщение: {ex.Message}");
                        if (ex.InnerException != null)
                        {
                            logger.LogError($"Внутреннее исключение: {ex.InnerException.Message}");
                        }
                        
                        if (string.IsNullOrEmpty(connectionString))
                        {
                            logger.LogError("Строка подключения пуста или null");
                        }
                        else
                        {
                            logger.LogError($"Длина строки подключения: {connectionString.Length}");
                        }
                    }
                    catch (Exception logEx)
                    {
                        logger.LogError(logEx, "Ошибка при логировании деталей подключения");
                    }
                    
                    throw;
                }
                }
            }

            return host;
        }
        
        public static IHost MigrateDatabase(this IHost host)
        {
            return MigrateDatabaseAsync(host).GetAwaiter().GetResult();
        }
    }
}