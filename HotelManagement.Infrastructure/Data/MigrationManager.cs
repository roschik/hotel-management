using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;

namespace HotelManagement.Infrastructure.Data
{
    public static class MigrationManager
    {
        public static IHost MigrateDatabase(this IHost host)
        {
            using (var scope = host.Services.CreateScope())
            {
                using (var appContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>())
                {
                    try
                    {
                        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();
                        logger.LogInformation("Начало миграции базы данных...");

                        appContext.Database.Migrate();

                        logger.LogInformation("Миграция базы данных успешно завершена.");                    }
                    catch (Exception ex)
                    {
                        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();
                        logger.LogError(ex, "Произошла ошибка при миграции базы данных.");
                        throw;
                    }
                }
            }

            return host;
        }
    }
}