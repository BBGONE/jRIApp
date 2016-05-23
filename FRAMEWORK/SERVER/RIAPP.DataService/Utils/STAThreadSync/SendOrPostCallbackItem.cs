using System;
using System.Threading;

namespace RIAPP.DataService.Utils.STAThreadSync
{
    internal enum ExecutionType
    {
        Post,
        Send
    }

    internal class SendOrPostCallbackItem
    {
        private readonly ManualResetEvent mAsyncWaitHandle = new ManualResetEvent(false);
        private readonly ExecutionType mExeType;
        private readonly SendOrPostCallback mMethod;
        private readonly object mState;

        internal SendOrPostCallbackItem(SendOrPostCallback callback, object state, ExecutionType type)
        {
            mMethod = callback;
            mState = state;
            mExeType = type;
        }

        internal Exception Exception { get; private set; }

        internal bool ExecutedWithException
        {
            get { return Exception != null; }
        }

        internal WaitHandle ExecutionCompleteWaitHandle
        {
            get { return mAsyncWaitHandle; }
        }

        // this code must run ont the STA thread
        internal void Execute()
        {
            if (mExeType == ExecutionType.Send)
                Send();
            else
                Post();
        }

        // calling thread will block until mAsyncWaitHanel is set
        internal void Send()
        {
            try
            {
                // call the thread
                mMethod(mState);
            }
            catch (Exception e)
            {
                Exception = e;
            }
            finally
            {
                mAsyncWaitHandle.Set();
            }
        }

        /// <summary>
        ///     Unhandle execptions will terminate the STA thread
        /// </summary>
        internal void Post()
        {
            mMethod(mState);
        }
    }
}