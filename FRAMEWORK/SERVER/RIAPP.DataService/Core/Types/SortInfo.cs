using System.Collections.Generic;
using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Types
{
    [DataContract]
    public class SortItem
    {
        public SortItem()
        {
            fieldName = string.Empty;
            sortOrder = SortOrder.ASC;
        }

        [DataMember]
        public string fieldName { get; set; }

        [DataMember]
        public SortOrder sortOrder { get; set; }
    }


    [DataContract]
    public class SortInfo
    {
        public SortInfo()
        {
            sortItems = new List<SortItem>();
        }

        [DataMember]
        public List<SortItem> sortItems { get; set; }
    }
}