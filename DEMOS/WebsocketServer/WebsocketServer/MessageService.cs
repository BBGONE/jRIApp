using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace WebsocketTest
{
    public static class MessageService
    {
        private static readonly ConcurrentDictionary<string, string> _clients = new ConcurrentDictionary<string, string>();
        private static Task _messagesTask;
        private static CancellationTokenSource _src;
        private static WebSocketService _websocketService;
        private static Object _lockObj = new Object();

        private static void OnError(Exception ex)
        {
            Logger.Log(ex);
        }

        public static void Start(WebSocketService websocketService)
        {
            //check if already started
            if (_messagesTask != null)
                return;
            _websocketService = websocketService;
            _src = new CancellationTokenSource();
            var token = _src.Token;

            _messagesTask = new Task(() =>
            {
                var task = DoMessages(token);
                try
                {
                    task.Wait();
                }
                catch(AggregateException ex)
                {
                    ex.Handle((err) =>
                    {
                        return (err is System.OperationCanceledException);
                    });
                }

                lock (_lockObj)
                {
                    _clients.Clear();
                    _messagesTask = null;
                    _websocketService = null;
                    _src = null;
                }

            }, token, TaskCreationOptions.LongRunning);

            _messagesTask.Start();
        }

        public static async Task Stop()
        {
            lock (_lockObj)
            {
                if (_src == null)
                    return;
                _src.Cancel();
            }
            var tsk = _messagesTask;
            if (tsk != null)
                await Task.WhenAny(tsk);
            _messagesTask = null;
        }

        public static void AddClient(string clientID)
        {
            _clients.TryAdd(clientID, clientID);
        }

        public static void RemoveClient(string clientID)
        {
            string res;
            _clients.TryRemove(clientID, out res);
        }

        private static async Task DoMessages(CancellationToken ct)
        {
            while (!ct.IsCancellationRequested)
            {
                try
                {
                    await TryGetAndPostMessages(ct);
                }
                catch (OperationCanceledException)
                {
                }
                catch (Exception ex)
                {
                    OnError(ex);
                }
            }
            ct.ThrowIfCancellationRequested();
        }

        private static async Task TryGetAndPostMessages(CancellationToken ct)
        {
            //Demo Test: Generating Random messages at random intervals and send it to all clients
            Random rnd = new Random();
            await Task.Delay(rnd.Next(400, 2000), ct);
            if (ct.IsCancellationRequested)
                return;
            string[] clients = _clients.Values.ToArray();
            Array.ForEach(clients, (client) =>
            {
                CallbackResult msg = new CallbackResult() { Tag = "message", Payload = new { message = getQuote() } };
                _websocketService.Send(client, msg, (isOK) =>
                {
                    if (!isOK)
                        RemoveClient(client);
                });
            });
        }

        private static void SendClosedMessage()
        {
            string[] clients = _clients.Values.ToArray();

            Array.ForEach(clients, (client) =>
            {
                CallbackResult msg = new CallbackResult() { Tag = "closed", Payload = new {id = Guid.Parse(client).ToString() } };
                _websocketService.Send(client, msg, (isOK) =>
                {
                    if (!isOK)
                        RemoveClient(client);
                });
            });
        }

        private static string getQuote()
        {
            Random rnd = new Random();
            string[] words = new string[] { "Test", "How", "Messaging", "Working", "Random", "Words", "For", "Demo", "Purposes", "Only", "Needed" };
            string message = "<b>Quote of the day</b>: <i>" + string.Join(" ", words.Select(w => words[rnd.Next(0, 10)]).ToArray()) + "</i>";
            return message;
        }
    }
}
