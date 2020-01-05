namespace RIAPP.DataService.Core.Types
{

    public class RefreshResponse
    {
        public string dbSetName { get; set; }

        public RowInfo rowInfo { get; set; }

        public ErrorInfo error { get; set; }
    }
}