using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading;

namespace RIAPP.DataService.Utils.STAThreadSync
{
    internal interface IItemQueue : IDisposable
    {
        bool IsEmpty { get; }
        SendOrPostCallbackItem Dequeue();
    }

    internal class SyncronizationQueue : IItemQueue, IDisposable
    {
        private readonly AutoResetEvent mItemsInQueueEvent = new AutoResetEvent(false);
        private readonly Queue<SendOrPostCallbackItem> mQueue;
        private readonly object mSync = new object();

        public SyncronizationQueue()
        {
            mQueue = new Queue<SendOrPostCallbackItem>();
        }

        public void Dispose()
        {
            lock (((ICollection) mQueue).SyncRoot)
            {
                // release any lock 
                mItemsInQueueEvent.Set();
                mQueue.Clear();
            }
        }

        public bool IsEmpty
        {
            get
            {
                lock (mSync)
                {
                    return mQueue.Count == 0;
                }
            }
        }

        public SendOrPostCallbackItem Dequeue()
        {
            Console.WriteLine("Before " + mQueue.Count);
            mItemsInQueueEvent.WaitOne();
            Console.WriteLine("After");
            SendOrPostCallbackItem item = null;
            lock (((ICollection) mQueue).SyncRoot)
            {
                if (mQueue.Count > 0)
                    item = mQueue.Dequeue();
            }


            return item;
        }

        public void AddItem(SendOrPostCallbackItem item)
        {
            lock (((ICollection) mQueue).SyncRoot)
            {
                mQueue.Enqueue(item);
                mItemsInQueueEvent.Set();
            }
        }
    }
}