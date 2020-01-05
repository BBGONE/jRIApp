namespace RIAPP.DataService.Core.Types
{

    public class RefreshRequest : IUseCaseRequest<RefreshResponse>
    {
        public string dbSetName { get; set; }

        public RowInfo rowInfo { get; set; }

        internal DbSetInfo _dbSetInfo { get; set; }
    }
}