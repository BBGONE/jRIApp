using System.Collections.Generic;

namespace RIAPP.DataService.Core.Types
{

    public class FilterItem
    {
        public FilterItem()
        {
            fieldName = string.Empty;
            values = new List<string>();
            kind = FilterType.Equals;
        }


        public string fieldName { get; set; }


        public List<string> values { get; set; }


        public FilterType kind { get; set; }
    }


    public class FilterInfo
    {
        public FilterInfo()
        {
            filterItems = new List<FilterItem>();
        }


        public List<FilterItem> filterItems { get; set; }
    }
}