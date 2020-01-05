namespace RIAPP.DataService.Core.Types
{

    public class InvokeRequest : IUseCaseRequest<InvokeResponse>
    {

        public string methodName { get; set; }


        public MethodParameters paramInfo { get; set; } = new MethodParameters();
    }
}