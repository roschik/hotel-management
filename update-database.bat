@echo off
echo Обновление базы данных...
dotnet ef database update --project HotelManagement.Infrastructure --startup-project HotelManagement.API
echo Обновление завершено.
pause