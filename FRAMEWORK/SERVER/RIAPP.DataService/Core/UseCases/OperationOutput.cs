namespace RIAPP.DataService.Core
{
    public class OperationOutput<TResponse> : IOutputPort<TResponse>
    {
        public TResponse Response
        {
            get;
            private set;
        }


        public OperationOutput()
        {
           
        }

        public void Handle(TResponse response)
        {
            this.Response = response;
        }
    }
}
