namespace RIAPP.DataService.Core.Types
{

    public class ErrorInfo
    {
        public ErrorInfo() :
            this(null, null)
        {
        }

        public ErrorInfo(string message, string name)
        {
            this.message = message;
            this.name = name;
        }


        public string message { get; set; }


        public string name { get; set; }
    }
}