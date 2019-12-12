using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebsocketTest
{
    public class CallbackResult
    {
        private string _tag;
        private object _payLoad;

        public string Tag
        {
            get { return _tag; }
            set { _tag = value; }
        }

        public object Payload
        {
            get { return _payLoad; }
            set { _payLoad = value; }
        }
    }
}
