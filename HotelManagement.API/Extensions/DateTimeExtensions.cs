using System;

namespace HotelManagement.API.Extensions
{
    public static class DateTimeExtensions
    {
        public static DateTime EnsureUtc(this DateTime dateTime)
        {
            return dateTime.Kind == DateTimeKind.Unspecified 
                ? DateTime.SpecifyKind(dateTime, DateTimeKind.Utc) 
                : dateTime.ToUniversalTime();
        }

        public static DateTime? EnsureUtc(this DateTime? dateTime)
        {
            return dateTime?.EnsureUtc();
        }
    }
}