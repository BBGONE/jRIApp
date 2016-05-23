using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json;
using RIAppDemo.Models;

namespace RIAppDemo.Controllers
{
    //Controller for Server side events
    public class SSEWebApiController : ApiController
    {
        private const double CLIENT_TIME_OUT = 10;

        private static readonly Lazy<Timer> _cleanUpTimer =
            new Lazy<Timer>(() => new Timer(CleanUpTimerCallback, null, Timeout.Infinite, Timeout.Infinite));

        private static readonly ConcurrentDictionary<string, Client> _clients =
            new ConcurrentDictionary<string, Client>();

        private static volatile bool _isTimerEnabled;
        private static volatile int _clientCount;
        private static Task _messagesTask;
        private static CancellationTokenSource _src;

        static SSEWebApiController()
        {
            _src = new CancellationTokenSource();
            var token = _src.Token;
            _messagesTask = new Task(() =>
            {
                var task = DoMessages(token);
                try
                {
                    task.Wait();
                }
                catch (AggregateException ex)
                {
                    ex.Handle(err => { return err is OperationCanceledException; });
                }
                lock (_clients)
                {
                    _clients.Clear();
                    _clientCount = 0;
                    _messagesTask = null;
                    _src = null;
                }
            }, token, TaskCreationOptions.LongRunning);
            _messagesTask.Start();
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
                    Log(ex);
                }
            }
            ct.ThrowIfCancellationRequested();
        }

        private static async Task TryGetAndPostMessages(CancellationToken ct)
        {
            //Demo Test: Generating Random messages at random intervals and send it to clients
            var rnd = new Random();
            await Task.Delay(rnd.Next(1000, 3000), ct);
            if (ct.IsCancellationRequested)
                return;
            var clients = _clients.Values.ToArray();
            Array.ForEach(clients, async client =>
            {
                var msg = new SSEMessage {clientID = client.id, payload = new Payload {message = getQuote()}};
                var res = await PostMessage(msg);
            });
        }

        private static string getQuote()
        {
            var rnd = new Random();
            string[] words =
            {
                "Test", "How", "Messaging", "Working", "Random", "Words", "For", "Demo", "Purposes",
                "Only", "Needed"
            };
            var message = "<b>Quote of the day</b>: <i>" +
                          string.Join(" ", words.Select(w => words[rnd.Next(0, 10)]).ToArray()) + "</i>";
            return message;
        }

        protected internal static void Log(Exception ex)
        {
            Debug.WriteLine(ex.Message);
        }

        [Authorize]
        public HttpResponseMessage Get(HttpRequestMessage request, string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            var parsedID = Guid.Parse(id);

            var response = request.CreateResponse();
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.Headers.Add("Cache-Control", "no-cache, must-revalidate");
            var pushContent = new PushStreamContent((stream, content, context) =>
            {
                var streamwriter = new StreamWriter(stream);
                var client = new Client(streamwriter, id);
                lock (_clients)
                {
                    if (_clients.ContainsKey(client.id))
                        _RemoveClient(client.id);
                    var isAdded = _clients.TryAdd(client.id, client);
                    if (isAdded)
                        ++_clientCount;
                }
                _CheckCleanUpTimer();
            }, "text/event-stream");
            response.Content = pushContent;
            return response;
        }

        [Authorize]
        [ActionName("PostMessage")]
        [HttpPost]
        public async Task<HttpResponseMessage> Post([FromBody] SSEMessage message)
        {
            var res = await PostMessage(message);
            if (res)
            {
                var response = Request.CreateResponse(HttpStatusCode.Created);
                return response;
            }
            return Request.CreateResponse(HttpStatusCode.NotFound);
        }

        [Authorize]
        [ActionName("CloseClient")]
        [HttpPost]
        public HttpResponseMessage Close(string id)
        {
            if (_RemoveClient(id))
                return Request.CreateResponse(HttpStatusCode.OK);
            return Request.CreateResponse(HttpStatusCode.NoContent);
        }

        public static bool RemoveClient(string id)
        {
            return _RemoveClient(id);
        }

        //Cancel sending messages to clients
        public static void StopService()
        {
            var src = _src;
            if (src == null)
                return;
            src.Cancel();
        }

        public static async Task<bool> PostMessage(SSEMessage message)
        {
            Client client;
            var cnt = _clients.Count();
            if (_clients.TryGetValue(message.clientID, out client))
            {
                try
                {
                    if (message.payload.message == "DUMMY")
                    {
                        client.UpdateAccessTime();
                    }
                    else
                    {
                        var data = JsonConvert.SerializeObject(message.payload);
                        await client.WriteAndSend(data);
                    }
                    return true;
                }
                catch (HttpException)
                {
                    _RemoveClient(client.id);
                }
                catch (Exception)
                {
                    //also needs to log here
                    _RemoveClient(client.id);
                }

                return false;
            }
            return false;
        }

        private class Client : IDisposable
        {
            private bool _isDisposed;

            public Client(StreamWriter stream, string id)
            {
                this.stream = stream;
                this.id = id;
                CreatedTime = DateTime.Now;
                lastAccessTime = CreatedTime;
            }

            public StreamWriter stream { get; }

            public string id { get; }

            public DateTime lastAccessTime { get; private set; }

            public DateTime CreatedTime { get; }

            public void Dispose()
            {
                try
                {
                    _isDisposed = true;
                    stream.Close();
                }
                catch (Exception ex)
                {
                    Log(ex);
                }
            }

            public void UpdateAccessTime()
            {
                lastAccessTime = DateTime.Now;
            }

            public async Task WriteAndSend(string data)
            {
                if (_isDisposed)
                    return;
                UpdateAccessTime();
                await stream.WriteLineAsync("data:" + data + "\n");
                if (_isDisposed)
                    return;
                await stream.FlushAsync();
            }


            protected virtual void Log(Exception ex)
            {
                SSEWebApiController.Log(ex);
            }

            public void Close()
            {
                Dispose();
            }
        }

        #region PRIVATE METHODS

        private static bool _RemoveClient(string id)
        {
            try
            {
                lock (_clients)
                {
                    Client client;
                    if (_clients.TryRemove(id, out client))
                    {
                        --_clientCount;
                        client.Dispose();
                        return true;
                    }
                }
                return false;
            }
            finally
            {
                _CheckCleanUpTimer();
            }
        }

        private static void _CheckCleanUpTimer()
        {
            lock (_cleanUpTimer)
            {
                if (!_isTimerEnabled && _clientCount > 0)
                {
                    var t = _cleanUpTimer.Value;
                    t.Change(TimeSpan.FromMinutes(CLIENT_TIME_OUT), TimeSpan.FromMinutes(CLIENT_TIME_OUT/2));
                    _isTimerEnabled = true;
                }
                else if (_isTimerEnabled && _clientCount == 0)
                {
                    var t = _cleanUpTimer.Value;
                    t.Change(Timeout.Infinite, Timeout.Infinite);
                    _isTimerEnabled = false;
                }
                else
                    return;
            }
        }

        private static void CleanUpTimerCallback(object state)
        {
            var now = DateTime.Now;
            var clients = _clients.Values.ToArray();
            Array.ForEach(clients, client =>
            {
                if ((now - client.lastAccessTime).Minutes >= CLIENT_TIME_OUT)
                {
                    _RemoveClient(client.id);
                }
            });
            _CheckCleanUpTimer();
        }

        #endregion
    }
}