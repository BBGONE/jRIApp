using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebsocketTest
{
    public static class Logger
    {
        public static void Log(Exception ex)
        {
            Console.WriteLine(Utils.Errors.ErrorHelper.GetFullMessage(ex));
        }
    }
}
