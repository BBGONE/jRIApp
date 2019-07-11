using RIAPP.DataService.Core.Types;

namespace RIAPP.DataService.Core
{
    public class InvokeOperationsOutput : IOutputPort<InvokeResponse>
    {
        public InvokeResponse Response
        {
            get;
            private set;
        }


        public InvokeOperationsOutput()
        {
           
        }

        public void Handle(InvokeResponse response)
        {
            this.Response = response;
        }
    }
}
