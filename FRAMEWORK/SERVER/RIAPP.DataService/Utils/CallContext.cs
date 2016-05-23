using System;
using System.Collections.Concurrent;
using System.Runtime.Remoting.Messaging;
using RIAPP.DataService.DomainService;

namespace RIAPP.DataService.Utils
{
    public class CallContext<T> : IDisposable
        where T : class
    {
        private static readonly string SLOT_KEY = Guid.NewGuid().ToString();
#if TEST
    //Just for Testing Purposes
        public static int GetScopeStoreCount() {
            return __scopeStore.Count;
        }
#endif

        #region class fields

        private static readonly ConcurrentDictionary<Guid, WeakReference<CallContext<T>>> __scopeStore =
            new ConcurrentDictionary<Guid, WeakReference<CallContext<T>>>();

        private static CallContext<T> __currentScope
        {
            get
            {
                var res = CallContext.LogicalGetData(SLOT_KEY);
                if (res != null)
                {
                    var scopeID = (Guid) res;
                    WeakReference<CallContext<T>> wref;
                    CallContext<T> scope;
                    if (__scopeStore.TryGetValue(scopeID, out wref))
                    {
                        if (wref.TryGetTarget(out scope))
                            return scope;
                        return null;
                    }
                    return null;
                }
                return null;
            }
            set
            {
                var id = value == null ? (Guid?) null : value.UNIQUE_ID;
                if (id.HasValue)
                {
                    CallContext.LogicalSetData(SLOT_KEY, id);
                }
                else
                    CallContext.FreeNamedDataSlot(SLOT_KEY);
            }
        }

        #endregion

        #region instance fields

        internal readonly Guid UNIQUE_ID = Guid.NewGuid();
        private readonly object SyncRoot = new object();
        private readonly CallContext<T> _outerScope;
        private readonly T _context;
        private bool _isDisposed;

        #endregion

        #region class methods and properties

        public static T CurrentContext
        {
            get
            {
                var cur = __currentScope;
                if (cur == null)
                    return null;
                return cur._context;
            }
        }

        #endregion

        #region constructor annd destructor

        public CallContext(T context)
        {
            _isDisposed = true;
            _outerScope = null;
            if (__scopeStore.TryAdd(UNIQUE_ID, new WeakReference<CallContext<T>>(this)))
            {
                _context = context;
                _outerScope = __currentScope;
                _isDisposed = false;
                __currentScope = this;
            }
        }

        ~CallContext()
        {
            Dispose(false);
        }

        #endregion

        #region public instance methods and properties

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        #endregion

        #region private methods and properties

        private void CheckDisposed()
        {
            if (_isDisposed)
            {
                throw new ObjectDisposedException("CallScope");
            }
        }

        private void Dispose(bool disposing)
        {
            if (_isDisposed)
                return;
            if (disposing)
            {
                lock (SyncRoot)
                {
                    if (_isDisposed)
                        return;
                    var outerScope = _outerScope;
                    while (outerScope != null && outerScope._isDisposed)
                    {
                        outerScope = outerScope._outerScope;
                    }

                    try
                    {
                        WeakReference<CallContext<T>> tmp;
                        __scopeStore.TryRemove(UNIQUE_ID, out tmp);
                        __currentScope = outerScope;
                    }
                    finally
                    {
                        _isDisposed = true;
                        if (_context is IDisposable)
                            ((IDisposable) _context).Dispose();
                    }
                }
            }
            else
            {
                WeakReference<CallContext<T>> tmp;
                __scopeStore.TryRemove(UNIQUE_ID, out tmp);
                _isDisposed = true;
            }
        }

        #endregion
    }

    public sealed class RequestCallContext : CallContext<RequestContext>
    {
        public RequestCallContext(RequestContext context) :
            base(context)
        {
        }
    }
}