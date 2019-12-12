using System;
using System.Configuration;
using System.Security.Cryptography.X509Certificates;
using WebSocketSharp;
using WebSocketSharp.Net;
using WebSocketSharp.Server;

namespace WebsocketTest
{
  public class Program
  {
    public static void Main (string[] args)
    {
        var wssv = new WebSocketService(81, false);
        wssv.Start();

        Console.WriteLine("\nPress Enter key to exit...");
        Console.ReadLine();

        wssv.Stop();
    }
  }
}
