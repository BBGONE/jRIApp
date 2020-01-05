namespace RIAPP.DataService.Core.Types
{

    public class RefreshInfoRequest : IUseCaseRequest<RefreshInfoResponse>
    {

        public string dbSetName { get; set; }


        public RowInfo rowInfo { get; set; }

        internal DbSetInfo _dbSetInfo { get; set; }
    }
}