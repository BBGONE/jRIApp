namespace RIAPP.DataService.Core.Types
{

    public class DbSetPermit
    {

        public string dbSetName { get; set; }


        public bool canAddRow { get; set; }


        public bool canEditRow { get; set; }


        public bool canDeleteRow { get; set; }


        public bool canRefreshRow { get; set; }
    }
}