using RIAPP.DataService.Core.Types;

namespace RIAPP.DataService.Core
{
    public class RefreshOperationsOutput : IOutputPort<RefreshInfo>
    {
        public RefreshInfo Response
        {
            get;
            private set;
        }


        public RefreshOperationsOutput()
        {
           
        }

        public void Handle(RefreshInfo response)
        {
            this.Response = response;
        }
    }
}
