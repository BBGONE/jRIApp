using System;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.DomainService.Attributes
{
    [AttributeUsage(AttributeTargets.Parameter)]
    public class DateOptionAttribute : Attribute
    {
        public DateOptionAttribute()
        {
            dateConversion = DateConversion.None;
        }

        public DateConversion dateConversion { get; set; }
    }
}