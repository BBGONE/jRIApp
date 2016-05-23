using System;
using WebSocketSharp;
using WebSocketSharp.Server;


namespace WebsocketTest
{
    public class WSClientBehaviour : WebSocketBehavior
    {
        public WSClientBehaviour()
        {
            this.IgnoreExtensions = true;
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            string id = this.ID;
        }

        private void _Send(CallbackResult res)
        {
            base.SendAsync(Newtonsoft.Json.JsonConvert.SerializeObject(res), (isOk) => { });
        }

        protected override void OnClose(CloseEventArgs e)
        {
            MessageService.RemoveClient(this.ID);
        }

        protected override void OnError(ErrorEventArgs e)
        {
            if (e.Exception != null)
               Logger.Log(e.Exception);
            else
               Logger.Log(new Exception(e.Message));
        }

        protected override void OnOpen()
        {
            this._Send(new CallbackResult { Tag = "connect", Payload = new { id = Guid.Parse(this.ID).ToString()} });
            MessageService.AddClient(this.ID);
        }
    }
}
