using System;
using System.Security.Permissions;
using System.Threading;

namespace RIAPP.DataService.Utils.STAThreadSync
{
    [SecurityPermission(SecurityAction.Demand, ControlThread = true)]
    public class StaSynchronizationContext : SynchronizationContext, IDisposable
    {
        private readonly BlockingQueue<SendOrPostCallbackItem> mQueue;
        private readonly StaThread mStaThread;

        public StaSynchronizationContext()
        {
            mQueue = new BlockingQueue<SendOrPostCallbackItem>();
            mStaThread = new StaThread(mQueue);
            mStaThread.Start();
        }

        public void Dispose()
        {
            mStaThread.Stop();
        }

        public override void Send(SendOrPostCallback action, object state)
        {
            // to avoid deadlock!
            if (Thread.CurrentThread.ManagedThreadId == mStaThread.ManagedThreadId)
            {
                action(state);
                return;
            }

            // create an item for execution
            var item = new SendOrPostCallbackItem(action, state, ExecutionType.Send);
            // queue the item
            mQueue.Enqueue(item);
            // wait for the item execution to end
            item.ExecutionCompleteWaitHandle.WaitOne();

            // if there was an exception, throw it on the caller thread, not the
            // sta thread.
            if (item.ExecutedWithException)
                throw item.Exception;
        }

        public override void Post(SendOrPostCallback d, object state)
        {
            // queue the item and don't wait for its execution. This is risky because
            // an unhandled exception will terminate the STA thread. Use with caution.
            var item = new SendOrPostCallbackItem(d, state, ExecutionType.Post);
            mQueue.Enqueue(item);
        }

        public override SynchronizationContext CreateCopy()
        {
            return this;
        }
    }
}