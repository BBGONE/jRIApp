using RIAPP.DataService.Core.Types;
using System;

namespace RIAPP.DataService.Annotations.Metadata
{
    [AttributeUsage(AttributeTargets.Parameter)]
    public class DateConversionAttribute : Attribute, IDateConversionData
    {
        public DateConversionAttribute()
        {
            DateConversion = DateConversion.None;
        }

        public DateConversion DateConversion { get; set; }
    }
}