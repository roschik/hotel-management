# Инструкция по развертыванию проекта Hotel Management

## Требования
- .NET 9.0 SDK
- Node.js 18+
- PostgreSQL 14+
- Visual Studio 2022 или VS Code

## Проверка версии .NET
```bash
dotnet --version

## Настройка базы данных
1. Установите PostgreSQL
2. Создайте базу данных `HotelManagementDB`
3. Обновите строку подключения в `HotelManagement\HotelManagement.API\appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=HotelManagementDB;Username=postgres;Password=ваш_пароль"
  }
}
```

## Запуск backend (.NET API)
1. Откройте терминал в корневой папке проекта
2. Выполните команды:
```bash
dotnet restore
dotnet ef database update --project HotelManagement.Infrastructure --startup-project HotelManagement.API
dotnet run --project HotelManagement.API
```

## Запуск frontend (React)
1. Откройте терминал в папке `hotel-management-client`
2. Выполните команды:
```bash
npm install
npm start
```

## Доступ к приложению
- Frontend: http://localhost:3000
- Backend API: http://localhost:5036/swagger/index.html
