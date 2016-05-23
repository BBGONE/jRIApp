using System;
using Nancy.Hosting.Self;
using System.Threading.Tasks;
using VSMDemo.Host.Utils;
using NetSh = VSMDemo.Host.Utils.NetSh;

namespace VSMDemo.Host
{
	class Program
	{
		static void Main(string[] args)
		{
            var config = new HostConfiguration();
            config.RewriteLocalhost = true;
            config.UnhandledExceptionCallback = (ex) =>
            {
                Console.WriteLine("Nancy internal error.");
                Console.WriteLine(ex.Message);
            };

            var url = "http://+:8080/";
            var uri = new Uri("http://localhost:8080");

            NancyHost nancyHost = new NancyHost(new CustomBootstrapper(), config, uri);
            try
            {
                int retry = 0;
                while (retry < 2)
                {
                    try
                    {
                        nancyHost.Start();
                        retry = int.MaxValue;
                    }
                    catch (Nancy.Hosting.Self.AutomaticUrlReservationCreationFailureException)
                    {
                        Console.WriteLine("Adding URL ACL rights using netsh!");
                        NetSh.AddUrlAcl(url);
                        retry++;
                    }
                }

                Console.WriteLine("The program is running...");
                Console.WriteLine("enter " + uri + " in a browser to access application");
                Console.WriteLine("");
                Console.WriteLine("Press any key to exit");
                Console.ReadKey();
                nancyHost.Stop();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ErrorHelper.GetFullMessage(ex));
                Console.ReadLine();
            }

            Console.WriteLine("Exiting...");
            Console.WriteLine("");

            var currentProcess = System.Diagnostics.Process.GetCurrentProcess();
            var task = Task.Run(() => {
                if (!currentProcess.WaitForExit(5000))
                    currentProcess.Kill();
            });
		}
	}
}
