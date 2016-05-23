using System;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.DomainService
{
    public class EntityChangeState
    {
        public EntityChangeState()
        {
            NamesOfChangedFields = new string[0];
            ParentRows = new ParentChildNode[0];
        }

        public object Entity { get; set; }

        public object OriginalEntity { get; set; }

        public Exception Error { get; set; }

        public ValidationErrorInfo[] ValidationErrors { get; set; }

        public ParentChildNode[] ParentRows { get; set; }


        /// <summary>
        ///     Field Names those are modified on client
        ///     and submitted for entity update or insert
        /// </summary>
        public string[] NamesOfChangedFields { get; set; }
    }
}