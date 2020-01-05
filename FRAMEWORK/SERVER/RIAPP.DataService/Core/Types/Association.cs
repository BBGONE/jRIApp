using System.ComponentModel;

namespace RIAPP.DataService.Core.Types
{

    public class FieldRel
    {

        public string parentField { get; set; }


        public string childField { get; set; }
    }



    public class Association
    {
        /// <summary>
        ///     unique association name
        /// </summary>

        public string name { get; set; }


        public string parentDbSetName { get; set; }


        public string childDbSetName { get; set; }

        /// <summary>
        ///     navigation property name from child entity to parent entity
        /// </summary>

        public string childToParentName { get; set; }

        /// <summary>
        ///     navigation property name from parent entity to children entity
        /// </summary>

        public string parentToChildrenName { get; set; }


        public DeleteAction onDeleteAction { get; set; }

        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]

        public FieldRelList fieldRels { get; } = new FieldRelList();
    }
}