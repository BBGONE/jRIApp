using System.Threading;

namespace RIAPP.DataService.Utils.STAThreadSync
{
    internal class StaThread
    {
        private readonly IQueueReader<SendOrPostCallbackItem> mQueueConsumer;
        private readonly Thread mStaThread;
        private readonly ManualResetEvent mStopEvent = new ManualResetEvent(false);


        internal StaThread(IQueueReader<SendOrPostCallbackItem> reader)
        {
            mQueueConsumer = reader;
            mStaThread = new Thread(Run);
            mStaThread.Name = "STA Worker Thread";
            mStaThread.SetApartmentState(ApartmentState.STA);
        }

        internal int ManagedThreadId { get; private set; }


        internal void Start()
        {
            mStaThread.Start();
        }


        internal void Join()
        {
            mStaThread.Join();
        }

        private void Run()
        {
            ManagedThreadId = Thread.CurrentThread.ManagedThreadId;
            while (true)
            {
                var stop = mStopEvent.WaitOne(0);
                if (stop)
                {
                    break;
                }

                var workItem = mQueueConsumer.Dequeue();
                if (workItem != null)
                    workItem.Execute();
            }
        }

        internal void Stop()
        {
            mStopEvent.Set();
            mQueueConsumer.ReleaseReader();
            mStaThread.Join();
            mQueueConsumer.Dispose();
        }
    }
}