using System.Collections.Generic;
using System.Runtime.Serialization;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class FilterItem
    {
        public FilterItem()
        {
            fieldName = string.Empty;
            values = new List<string>();
            kind = FilterType.Equals;
        }

        [DataMember]
        public string fieldName { get; set; }

        [DataMember]
        public List<string> values { get; set; }

        [DataMember]
        public FilterType kind { get; set; }
    }

    [DataContract]
    public class FilterInfo
    {
        public FilterInfo()
        {
            filterItems = new List<FilterItem>();
        }

        [DataMember]
        public List<FilterItem> filterItems { get; set; }
    }
}