using System;

namespace RIAPP.DataService.DomainService.Exceptions
{
    public class ValidationException : DomainServiceException
    {
        public ValidationException()
        {
        }

        public ValidationException(string message)
            : base(message)
        {
        }

        public ValidationException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}