namespace RIAPP.DataService.Core.Types
{

    public class ValueChange
    {
        public ValueChange()
        {
            val = null;
            orig = null;
            flags = ValueFlags.None;
            fieldName = string.Empty;
        }


        public string val { get; set; }


        public string orig { get; set; }



        public string fieldName { get; set; }


        public ValueFlags flags { get; set; }

        /// <summary>
        ///     Nested values used for object field
        /// </summary>

        public ValuesList nested { get; set; }
    }
}