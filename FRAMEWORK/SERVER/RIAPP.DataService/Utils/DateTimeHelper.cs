using System;

namespace RIAPP.DataService.Utils
{
    public static class DateTimeHelper
    {
        public static int GetTimezoneOffset()
        {
            DateTime dt = DateTime.Now;
            var uval = dt.ToUniversalTime();
            var tspn = uval - dt;
            return (int)tspn.TotalMinutes;
        }
    }
}