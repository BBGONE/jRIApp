using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Types
{
    [DataContract]
    public class RowInfo
    {
        public RowInfo()
        {
            changeType = ChangeType.None;
            values = new ValuesList();
            serverKey = string.Empty;
            _dbSetInfo = null;
            _changeState = null;
        }

        [DataMember]
        public ValuesList values { get; set; }

        [DataMember]
        public ChangeType changeType { get; set; }

        /// <summary>
        ///     Unique server row id in DbSet - primary key values concantenated by ;
        /// </summary>
        [DataMember]
        public string serverKey { get; set; }

        /// <summary>
        ///     When row change type is added row has empty serverKey
        ///     client assigns unique row id to the added row, so after executing insert operation on server
        ///     the client could find the row in its rows store.
        /// </summary>
        [DataMember]
        public string clientKey { get; set; }

        [DataMember]
        public string error { get; set; }


        [DataMember]
        public ValidationErrorInfo[] invalid { get; set; }

        internal DbSetInfo _dbSetInfo { get; set; }

        internal EntityChangeState _changeState { get; set; }
    }
}