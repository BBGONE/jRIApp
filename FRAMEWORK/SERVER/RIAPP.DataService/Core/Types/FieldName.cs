namespace RIAPP.DataService.Core.Types
{

    public class FieldName
    {
        /// <summary>
        ///     Field name
        /// </summary>

        public string n { get; set; }


        /// <summary>
        ///     For object field it contains property names (nested fields)
        /// </summary>

        public FieldName[] p { get; set; }
    }
}