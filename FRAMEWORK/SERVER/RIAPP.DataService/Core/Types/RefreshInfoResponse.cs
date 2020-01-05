namespace RIAPP.DataService.Core.Types
{

    public class RefreshInfoResponse
    {

        public string dbSetName { get; set; }


        public RowInfo rowInfo { get; set; }


        public ErrorInfo error { get; set; }
    }
}