using System;

namespace RIAPP.DataService.Core.Exceptions
{
    public class AccessDeniedException : DomainServiceException
    {
        public AccessDeniedException()
        {
        }

        public AccessDeniedException(string message)
            : base(message)
        {
        }

        public AccessDeniedException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}