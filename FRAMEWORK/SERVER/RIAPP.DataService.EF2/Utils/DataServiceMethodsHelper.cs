using System;
using System.Linq;
using System.Text;
using System.Data.Entity;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.DomainService.Metadata;

namespace RIAPP.DataService.EF2.Utils
{
    public static class DataServiceMethodsHelper
    {
        private static string GetTableName(DbContext DB, Type entityType)
        {
            Type tableType = typeof(System.Data.Entity.DbSet<>).MakeGenericType(entityType);
            var propertyInfo = DB.GetType().GetProperties().Where(p => p.PropertyType.IsGenericType && p.PropertyType == tableType).FirstOrDefault();
            if (propertyInfo == null)
                return string.Empty;
            return propertyInfo.Name;
        }
          
        private static string createDbSetMethods(DbSetInfo dbSetInfo, string tableName)
        {
            var sb = new StringBuilder(512);

            sb.AppendLine(string.Format("#region {0}", dbSetInfo.dbSetName));
            sb.AppendLine("[Query]");
            sb.AppendFormat("public QueryResult<{0}> Read{1}()", dbSetInfo.EntityType.Name, dbSetInfo.dbSetName);
            sb.AppendLine("");
            sb.AppendLine("{");
            sb.AppendLine("\tint? totalCount = null;");
            sb.AppendLine(string.Format("\tvar res = this.PerformQuery(this.DB.{0}, ref totalCount).AsEnumerable();", tableName));
            sb.AppendLine(string.Format("\treturn new QueryResult<{0}>(res, totalCount);",dbSetInfo.EntityType.Name));
            sb.AppendLine("}");
            sb.AppendLine("");

            sb.AppendLine("[Insert]");
            sb.AppendFormat("public void Insert{1}({0} {2})", dbSetInfo.EntityType.Name, dbSetInfo.dbSetName, dbSetInfo.dbSetName.ToLower());
            sb.AppendLine("");
            sb.AppendLine("{");
            sb.AppendLine(string.Format("\tthis.DB.{0}.Add({1});", tableName, dbSetInfo.dbSetName.ToLower()));
            sb.AppendLine("}");
            sb.AppendLine("");

            sb.AppendLine("[Update]");
            sb.AppendFormat("public void Update{1}({0} {2})", dbSetInfo.EntityType.Name, dbSetInfo.dbSetName, dbSetInfo.dbSetName.ToLower());
            sb.AppendLine("");
            sb.AppendLine("{");
            sb.AppendLine(string.Format("\t{0} orig = this.GetOriginal<{0}>();", dbSetInfo.EntityType.Name));
            sb.AppendLine(string.Format("\tthis.DB.{0}.Attach({1});", tableName, dbSetInfo.dbSetName.ToLower()));
            sb.AppendLine(string.Format("\tthis.DB.Entry({0}).OriginalValues.SetValues(orig);", dbSetInfo.dbSetName.ToLower()));
            sb.AppendLine("}");
            sb.AppendLine("");

            sb.AppendLine("[Delete]");
            sb.AppendFormat("public void Delete{1}({0} {2})", dbSetInfo.EntityType.Name, dbSetInfo.dbSetName, dbSetInfo.dbSetName.ToLower());
            sb.AppendLine("");
            sb.AppendLine("{");
            sb.AppendLine(string.Format("\tthis.DB.{0}.Attach({1});", tableName, dbSetInfo.dbSetName.ToLower()));
            sb.AppendLine(string.Format("\tthis.DB.{0}.Remove({1});", tableName, dbSetInfo.dbSetName.ToLower()));
            sb.AppendLine("}");
            sb.AppendLine("");

             sb.AppendLine("#endregion");
             return sb.ToString();
        }

        public static string CreateMethods(MetadataResult metadata, DbContext DB) 
        {
            var sb = new StringBuilder(4096);

            metadata.dbSets.ForEach((dbSetInfo) =>
            {
                string tableName = GetTableName(DB, dbSetInfo.EntityType);
                if (tableName == string.Empty)
                    return;
                sb.AppendLine(createDbSetMethods(dbSetInfo, tableName));
            });
            return sb.ToString();
        }
    }
}
