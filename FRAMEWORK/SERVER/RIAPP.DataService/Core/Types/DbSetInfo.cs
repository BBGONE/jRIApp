using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Types
{
    [DataContract]
    public class DbSetInfo
    {
        internal FieldsList _fieldInfos = new FieldsList();
        internal Dictionary<string, Field> _fieldsByNames;
        private readonly Lazy<Field[]> _inResultFields;
        private readonly Lazy<Field[]> _pkFields;
        private readonly Lazy<Field> _timestampField;

        public DbSetInfo()
        {
            _inResultFields = new Lazy<Field[]>(
                    () => _fieldInfos.Where(f => f.GetIsIncludeInResult()).OrderBy(f => f._ordinal).ToArray(), true);
            _pkFields =  new Lazy<Field[]>(
                    () => fieldInfos.Where(fi => fi.isPrimaryKey > 0).OrderBy(fi => fi.isPrimaryKey).ToArray(), true);
            _timestampField = new Lazy<Field>(() => fieldInfos.Where(fi => fi.fieldType == FieldType.RowTimeStamp).FirstOrDefault(),
                    true);

            enablePaging = true;
            pageSize = 100;
            isTrackChanges = false;
        }

        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        [DataMember]
        public FieldsList fieldInfos
        {
            get { return _fieldInfos; }
        }

        [DataMember]
        public bool enablePaging { get; set; }

        [DataMember]
        public int pageSize { get; set; }

        [DataMember]
        public string dbSetName { get; set; }

        #region NonSerializable properties
        public DbSetInfo ShallowCopy()
        {
            return (DbSetInfo)this.MemberwiseClone();
        }

        public Field[] GetInResultFields()
        {
            return _inResultFields.Value;
        }

        public Field[] GetPKFields()
        {
            return _pkFields.Value;
        }

        public Field GetTimeStampField()
        {
            return _timestampField.Value;
        }

        [IgnoreDataMember]
        public Type EntityType { get; set; }

        [DefaultValue(false)]
        [IgnoreDataMember]
        public bool isTrackChanges { get; set; }

        #endregion
    }
}