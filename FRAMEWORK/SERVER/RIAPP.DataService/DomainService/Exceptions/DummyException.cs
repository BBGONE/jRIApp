using System;

namespace RIAPP.DataService.DomainService.Exceptions
{
    public class DummyException : DomainServiceException
    {
        public DummyException()
        {
        }

        public DummyException(string message)
            : base(message)
        {
        }

        public DummyException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}