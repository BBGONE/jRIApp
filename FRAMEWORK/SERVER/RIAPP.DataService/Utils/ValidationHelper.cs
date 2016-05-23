using System;
using System.Globalization;
using System.Text.RegularExpressions;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.Utils
{
    public class ValidationHelper : IValidationHelper
    {
        private readonly IServiceContainer _serviceContainer;

        public ValidationHelper(IServiceContainer serviceContainer)
        {
            _serviceContainer = serviceContainer;
        }

        public void CheckString(Field fieldInfo, string val)
        {
            if (val == null)
                return;

            if (fieldInfo.maxLength > 0)
            {
                if (!string.IsNullOrEmpty(val))
                {
                    if (val.Length > fieldInfo.maxLength)
                    {
                        throw new ValidationException(string.Format(ErrorStrings.ERR_VAL_EXCEEDS_MAXLENGTH,
                            fieldInfo.fieldName, fieldInfo.maxLength));
                    }
                }
            }

            if (!string.IsNullOrEmpty(val) && !string.IsNullOrEmpty(fieldInfo.regex))
            {
                var rx = new Regex(fieldInfo.regex, RegexOptions.IgnoreCase);
                if (!rx.IsMatch(val))
                {
                    throw new ValidationException(string.Format(ErrorStrings.ERR_VAL_IS_NOT_VALID, fieldInfo.fieldName));
                }
            }
        }

        public void CheckRange(Field fieldInfo, string val)
        {
            if (val == null)
                return;
            if (!string.IsNullOrEmpty(fieldInfo.range))
            {
                var rangeParts = fieldInfo.range.Split(',');
                switch (fieldInfo.dataType)
                {
                    case DataType.Integer:
                    case DataType.Decimal:
                    case DataType.Float:
                    {
                        var dblval = double.Parse(val, CultureInfo.InvariantCulture);
                        if (!string.IsNullOrEmpty(rangeParts[0]))
                        {
                            var minDbl = double.Parse(rangeParts[0], CultureInfo.InvariantCulture);
                            if (dblval < minDbl)
                                throw new ValidationException(string.Format(ErrorStrings.ERR_VAL_RANGE_NOT_VALID,
                                    fieldInfo.fieldName, fieldInfo.range));
                        }
                        if (!string.IsNullOrEmpty(rangeParts[1]))
                        {
                            var maxDbl = double.Parse(rangeParts[1], CultureInfo.InvariantCulture);
                            if (dblval > maxDbl)
                                throw new ValidationException(string.Format(ErrorStrings.ERR_VAL_RANGE_NOT_VALID,
                                    fieldInfo.fieldName, fieldInfo.range));
                        }
                    }
                        break;
                    case DataType.Date:
                    case DataType.DateTime:
                    {
                        var dtval =
                            (DateTime)
                                _serviceContainer.ValueConverter.DeserializeValue(typeof(DateTime), DataType.DateTime,
                                    fieldInfo.dateConversion, val);
                        if (!string.IsNullOrEmpty(rangeParts[0]))
                        {
                            var minDt = DateTime.ParseExact(rangeParts[0], "yyyy-MM-dd", CultureInfo.InvariantCulture);
                            if (dtval < minDt)
                                throw new ValidationException(string.Format(ErrorStrings.ERR_VAL_RANGE_NOT_VALID,
                                    fieldInfo.fieldName, fieldInfo.range));
                        }
                        if (!string.IsNullOrEmpty(rangeParts[1]))
                        {
                            var maxDt = DateTime.ParseExact(rangeParts[1], "yyyy-MM-dd", CultureInfo.InvariantCulture);
                            if (dtval > maxDt)
                                throw new ValidationException(string.Format(ErrorStrings.ERR_VAL_RANGE_NOT_VALID,
                                    fieldInfo.fieldName, fieldInfo.range));
                        }
                    }
                        break;
                    default:
                        return;
                }
            }
        }

        public void CheckValue(Field fieldInfo, string val)
        {
            if (val == null && !fieldInfo.isNullable)
            {
                throw new ValidationException(string.Format(ErrorStrings.ERR_FIELD_IS_NOT_NULLABLE, fieldInfo.fieldName));
            }
            if (fieldInfo.dataType == DataType.String)
            {
                CheckString(fieldInfo, val);
            }
            CheckRange(fieldInfo, val);
        }
    }
}