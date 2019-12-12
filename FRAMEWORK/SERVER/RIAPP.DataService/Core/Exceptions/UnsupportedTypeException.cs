using System;

namespace RIAPP.DataService.Core.Exceptions
{
    public class UnsupportedTypeException : DomainServiceException
    {
        public UnsupportedTypeException()
        {
        }

        public UnsupportedTypeException(string message)
            : base(message)
        {
        }

        public UnsupportedTypeException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}