namespace RIAPP.DataService.Core.Types
{

    public class DbSet
    {
        public DbSet()
        {
            rows = new RowsList();
        }


        public string dbSetName { get; set; }


        public RowsList rows { get; set; }
    }
}
