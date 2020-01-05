using System.Collections.Generic;

namespace RIAPP.DataService.Core.Types
{

    public class SortItem
    {
        public SortItem()
        {
            fieldName = string.Empty;
            sortOrder = SortOrder.ASC;
        }


        public string fieldName { get; set; }


        public SortOrder sortOrder { get; set; }
    }



    public class SortInfo
    {
        public SortInfo()
        {
            sortItems = new List<SortItem>();
        }


        public List<SortItem> sortItems { get; set; }
    }
}