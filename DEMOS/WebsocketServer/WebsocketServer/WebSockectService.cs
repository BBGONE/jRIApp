using System;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace WebsocketTest
{
    public class WebSocketService
    {
        private string _path = "/PollingService";
        private WebSocketServer _socketServer;
        private int _port;
        private bool _isSSL;

        public WebSocketService(int port = 81, bool isSSL = true)
        {
            this._port = port;
            this._isSSL = isSSL;
        }

        protected virtual void OnError(Exception ex)
        {
            Logger.Log(ex);
        }

        public void Start()
        {
            try
            {
                var socketServer = new WebSocketServer(this._port, this._isSSL);
                socketServer.AddWebSocketService<WSClientBehaviour>(this._path);
                if (this._isSSL)
                {
                    // configure SSL for websocket server (just to test this feature!)
                    string basedir = AppDomain.CurrentDomain.BaseDirectory;
                    string certPath = System.IO.Path.GetFullPath(System.IO.Path.Combine(basedir, @"..\serverCertificate.pfx"));
                    if (!System.IO.File.Exists(certPath))
                        throw new Exception("I did not found the SSL certificate for the websocket server");
                    var passwd = "password";
                    socketServer.SslConfiguration.ServerCertificate = new X509Certificate2(certPath, passwd);
                }
               
                socketServer.Log.Output = (logData, msg) =>
                {
                    if (logData.Level == LogLevel.Error || logData.Level == LogLevel.Fatal)
                       this.OnError(new Exception(logData.Message));
                };
               
                this._socketServer = socketServer;
                socketServer.Start();

                MessageService.Start(this);
            }
            catch (Exception ex)
            {
                this.OnError(ex);
            }
        }

        public void Stop()
        {
            if (_socketServer != null && _socketServer.IsListening)
            {
                MessageService.Stop().Wait();

                _socketServer.Stop();
                _socketServer = null;
            }
        }

        public void Send(string clientID, CallbackResult res, Action<bool> callback= null)
        {
            string id = clientID.Replace("-", "");
            WebSocketServiceHost host;
            if (this._socketServer.WebSocketServices.TryGetServiceHost(this._path, out host))
            {
                IWebSocketSession session;
                if (host.Sessions.TryGetSession(id, out session))
                {
                    if (callback == null)
                        callback = (isOK) => { };
                    string data = Newtonsoft.Json.JsonConvert.SerializeObject(res);
                    session.Context.WebSocket.SendAsync(data, callback);
                }
                else
                {
                    if (callback != null)
                        callback(false);
                }
            }
        }

        public bool IsClientConnected(string clientID)
        {
            string id = clientID.Replace("-", "");
            WebSocketServiceHost host;
            IWebSocketSession session;
            if (this._socketServer.WebSocketServices.TryGetServiceHost(this._path, out host))
            {
                return host.Sessions.TryGetSession(id, out session);
            }
            return false;
        }
    }
}
