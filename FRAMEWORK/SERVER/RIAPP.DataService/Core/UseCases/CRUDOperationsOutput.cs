using RIAPP.DataService.Core.Types;

namespace RIAPP.DataService.Core
{
    public class CRUDOperationsOutput : IOutputPort<ChangeSet>
    {
        public ChangeSet Response
        {
            get;
            private set;
        }


        public CRUDOperationsOutput()
        {
           
        }

        public void Handle(ChangeSet response)
        {
            this.Response = response;
        }
    }
}
