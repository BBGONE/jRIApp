using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace Utils.Admin
{
    public static class NetSh
    {
        public static void AddUrlAcl(string address)
        {
            var everyoneID = new SecurityIdentifier(WellKnownSidType.WorldSid, null);
            var ntAccount = (NTAccount)everyoneID.Translate(typeof(NTAccount));

            AddUrlAcl(address, ntAccount.Value);
        }

        private static void LaunchProcess(string args)
        {
            Process build = new Process();
           // build.StartInfo.WorkingDirectory = @"dir";
            build.StartInfo.Arguments = args;
            build.StartInfo.FileName = "netsh.exe";
            build.StartInfo.Verb = "runas";
            build.StartInfo.CreateNoWindow = true;
            build.StartInfo.UseShellExecute = true;
            /*
            build.StartInfo.RedirectStandardOutput = false;
            build.StartInfo.RedirectStandardError = false;
            build.ErrorDataReceived += build_ErrorDataReceived;
            build.OutputDataReceived += build_ErrorDataReceived;
            build.EnableRaisingEvents = true;
            */
            build.Start();
            /*
            build.BeginOutputReadLine();
            build.BeginErrorReadLine();
            */
            build.WaitForExit();
        }

        public static void AddUrlAcl(string address, string user)
        {
            string args = string.Format(@"http add urlacl url={0} user={1}", address, user);
            LaunchProcess(args);
        }
    }
}
