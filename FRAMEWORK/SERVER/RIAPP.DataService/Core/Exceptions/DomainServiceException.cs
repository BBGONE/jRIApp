using System;

namespace RIAPP.DataService.Core.Exceptions
{
    public class DomainServiceException : Exception
    {
        public DomainServiceException()
        {
        }

        public DomainServiceException(string message)
            : base(message)
        {
        }

        public DomainServiceException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}