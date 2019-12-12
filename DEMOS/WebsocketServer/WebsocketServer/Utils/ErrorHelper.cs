using System;

namespace Utils.Errors
{
	public sealed class ErrorHelper
	{
		private ErrorHelper()
		{
		}

		public static string GetFullMessage(Exception exception, bool includeStackTrace)
		{
			string result = exception.Message;
			while (exception.InnerException != null)
			{
				result = exception.InnerException.Message + Environment.NewLine + result;
				exception = exception.InnerException;
			}
            if (includeStackTrace)
            {
                if (exception.InnerException != null)
                {
                    result = result + Environment.NewLine + exception.InnerException.StackTrace;
                }
                else
                {
                    result = result + Environment.NewLine + exception.StackTrace;
                }
            }

			return result;
		}

        public static string GetFullMessage(Exception exception)
        {
            return GetFullMessage(exception, true);
        }
	}
}
