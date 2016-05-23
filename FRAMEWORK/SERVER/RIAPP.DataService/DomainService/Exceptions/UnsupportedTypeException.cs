using System;

namespace RIAPP.DataService.DomainService.Exceptions
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