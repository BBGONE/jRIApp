namespace RIAPP.DataService.Core.Types
{

    public class ValidationErrorInfo
    {
        public ValidationErrorInfo()
        {
        }

        public ValidationErrorInfo(string message)
        {
            this.message = message;
        }

        public ValidationErrorInfo(string fieldName, string message)
        {
            this.fieldName = fieldName;
            this.message = message;
        }


        public string fieldName { get; set; }


        public string message { get; set; }
    }
}