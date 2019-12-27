using System;

namespace Pipeline
{
    public interface IRequestContext
    {
        void CaptureException(Exception ex);
        void AddLogItem(string str);
        IServiceProvider RequestServices { get; }
    }
}
