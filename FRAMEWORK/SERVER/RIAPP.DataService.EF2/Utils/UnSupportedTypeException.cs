using System;

namespace RIAPP.DataService.EF2.Utils
{
    public class UnSupportedTypeException: Exception
    {
        public UnSupportedTypeException(string fullname):
            base("Unsupported type: "+ fullname)
        {

        }
    }
}
