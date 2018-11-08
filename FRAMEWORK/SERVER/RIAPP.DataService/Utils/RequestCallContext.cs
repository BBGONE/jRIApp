using RIAPP.DataService.DomainService;

namespace RIAPP.DataService.Utils
{
    public sealed class RequestCallContext : CallContext<RequestContext>
    {
        public RequestCallContext(RequestContext context) :
            base(context)
        {
        }
    }
}
