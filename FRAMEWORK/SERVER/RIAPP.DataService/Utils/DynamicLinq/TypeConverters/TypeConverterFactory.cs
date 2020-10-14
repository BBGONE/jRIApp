using JetBrains.Annotations;
using System.ComponentModel;
using System.Linq.Dynamic.Core.Validation;

namespace System.Linq.Dynamic.Core.TypeConverters
{
    internal class TypeConverterFactory : ITypeConverterFactory
    {
        private readonly ParsingConfig _config;

        public TypeConverterFactory([NotNull] ParsingConfig config)
        {
            Check.NotNull(config, nameof(config));

            _config = config;
        }

        /// <see cref="ITypeConverterFactory.GetConverter"/>
        public TypeConverter GetConverter(Type type)
        {
            Check.NotNull(type, nameof(type));

            if (_config.DateTimeIsParsedAsUTC && (type == typeof(DateTime) || type == typeof(DateTime?)))
            {
                return new CustomDateTimeConverter();
            }

            return TypeDescriptor.GetConverter(type);
        }
    }
}
