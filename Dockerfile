# Используем официальный образ .NET 9.0 runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Используем SDK для сборки
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Копируем файлы проектов
COPY ["HotelManagement.API/HotelManagement.API.csproj", "HotelManagement.API/"]
COPY ["HotelManagement.Core/HotelManagement.Core.csproj", "HotelManagement.Core/"]
COPY ["HotelManagement.Infrastructure/HotelManagement.Infrastructure.csproj", "HotelManagement.Infrastructure/"]

# Восстанавливаем зависимости
RUN dotnet restore "HotelManagement.API/HotelManagement.API.csproj"

# Копируем весь исходный код
COPY . .

# Собираем проект
WORKDIR "/src/HotelManagement.API"
RUN dotnet build "HotelManagement.API.csproj" -c Release -o /app/build

# Публикуем приложение
FROM build AS publish
RUN dotnet publish "HotelManagement.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Финальный образ
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HotelManagement.API.dll"]