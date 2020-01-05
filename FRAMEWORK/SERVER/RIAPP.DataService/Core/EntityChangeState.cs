using RIAPP.DataService.Core.Types;
using System;

namespace RIAPP.DataService.Core
{
    public class EntityChangeState
    {
        public EntityChangeState()
        {
            ChangedFieldNames = new string[0];
            ParentRows = new ParentChildNode[0];
        }

        public object Entity { get; set; }

        public object OriginalEntity { get; set; }

        public Exception Error { get; set; }

        public ValidationErrorInfo[] ValidationErrors { get; set; }

        public ParentChildNode[] ParentRows { get; set; }


        /// <summary>
        ///   Field Names which are modified and submitted from the client
        /// </summary>
        public string[] ChangedFieldNames { get; set; }
    }
}