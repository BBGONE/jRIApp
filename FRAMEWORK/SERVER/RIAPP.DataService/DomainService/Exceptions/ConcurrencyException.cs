using System;

namespace RIAPP.DataService.DomainService.Exceptions
{
    public class ConcurrencyException : DomainServiceException
    {
        public ConcurrencyException()
        {
        }

        public ConcurrencyException(string message)
            : base(message)
        {
        }

        public ConcurrencyException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}