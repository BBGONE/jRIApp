namespace RIAPP.DataService.Core.Types
{

    public class InvokeResponse
    {

        public object result { get; set; }

        /// <summary>
        ///     Client must first check this field
        ///     if all ok, then error is empty
        ///     otherwise it contains error message
        /// </summary>

        public ErrorInfo error { get; set; }
    }
}