using RIAPP.DataService.Utils;
using System.Linq;
using System.Text;

namespace RIAPP.DataService.Core.Types
{
    public static class RowInfoEx
    {
        public static object[] GetPKValues(this RowInfo rowInfo, IDataHelper dataHelper)
        {
            var dbSetInfo = rowInfo.GetDbSetInfo();
            var entityType = dbSetInfo.GetEntityType();
            var finfos = dbSetInfo.GetPKFields();
            var result = new object[finfos.Length];
            for (var i = 0; i < finfos.Length; ++i)
            {
                var fv = rowInfo.values.Single(v => v.fieldName == finfos[i].fieldName);
                result[i] = dataHelper.DeserializeField(entityType, finfos[i], fv.val);
            }
            return result;
        }

        public static string GetWherePKPredicate(this RowInfo rowInfo)
        {
            var dbSetInfo = rowInfo.GetDbSetInfo();
            var pkFieldsInfo = dbSetInfo.GetPKFields();
            var sb = new StringBuilder();
            for (var i = 0; i < pkFieldsInfo.Length; ++i)
            {
                if (i > 0)
                {
                    sb.Append(" and ");
                }
                sb.Append($"{pkFieldsInfo[i].fieldName}.Equals(@{i})");
            }
            var predicate = sb.ToString();
            return predicate;
        }

        public static string GetRowKeyAsString(this RowInfo rowInfo)
        {
            var finfos = rowInfo.GetDbSetInfo().GetPKFields();
            var vals = new string[finfos.Length];
            for (var i = 0; i < finfos.Length; ++i)
            {
                var fv = rowInfo.values.Single(v => v.fieldName == finfos[i].fieldName);
                vals[i] = fv.val;
            }
            return string.Join(";", vals);
        }

        public static DbSetInfo GetDbSetInfo(this RowInfo rowInfo)
        {
            return rowInfo._dbSetInfo;
        }

        public static void SetDbSetInfo(this RowInfo rowInfo, DbSetInfo dbSetInfo)
        {
            rowInfo._dbSetInfo = dbSetInfo;
        }

        public static EntityChangeState GetChangeState(this RowInfo rowInfo)
        {
            return rowInfo._changeState;
        }

        public static void SetChangeState(this RowInfo rowInfo, EntityChangeState changeState)
        {
            rowInfo._changeState = changeState;
        }
    }
}