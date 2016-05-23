using System;
using System.Collections.Generic;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.DomainService
{
    internal class RowGenerator
    {
        private readonly IDataHelper _dataHelper;
        private readonly IEnumerable<object> _dataSource;
        private readonly DbSetInfo _dbSetInfo;
        private readonly int fieldCnt;
        private readonly Field[] fieldInfos;
        private readonly Field[] pkInfos;

        public RowGenerator(DbSetInfo dbSetInfo, IEnumerable<object> dataSource, IDataHelper dataHelper)
        {
            _dbSetInfo = dbSetInfo;
            _dataSource = dataSource;
            _dataHelper = dataHelper;
            fieldInfos = _dbSetInfo.GetInResultFields();
            fieldCnt = fieldInfos.Length;
            pkInfos = _dbSetInfo.GetPKFields();
        }

        public IEnumerable<Row> CreateRows(int rowCount)
        {
            var rows = new Row[rowCount];
            var counter = 0;
            foreach (var entity in _dataSource)
            {
                var row = CreateRow(entity);
                rows[counter] = row;
                ++counter;
            }
            return rows;
        }

        public IEnumerable<Row> CreateDistinctRows(ref int rowCount)
        {
            //map rows by PK
            var rows = new Dictionary<string, Row>(rowCount);
            var counter = 0;
            foreach (var entity in _dataSource)
            {
                var row = CreateRow(entity);
                //here we filter out repeated rows
                if (!rows.ContainsKey(row.k))
                {
                    rows.Add(row.k, row);
                    ++counter;
                }
            }
            rowCount = counter;
            return rows.Values;
        }

        private Row CreateRow(object entity)
        {
            var row = new Row();
            var pk = new string[pkInfos.Length];
            row.v = new object[fieldCnt];
            for (var i = 0; i < fieldCnt; ++i)
            {
                var fieldInfo = fieldInfos[i];
                var fv = _dataHelper.SerializeField(entity, fieldInfo);

                var keyIndex = Array.IndexOf(pkInfos, fieldInfo);
                if (keyIndex > -1)
                {
                    if (fv == null)
                        throw new Exception(string.Format("Primary Key Field \"{0}\" Has a NULL Value",
                            fieldInfo._FullName));
                    pk[keyIndex] = fv.ToString();
                }
                row.v[i] = fv;
            }
            row.k = string.Join(";", pk);
            return row;
        }
    }
}