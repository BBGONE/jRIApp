using Microsoft.EntityFrameworkCore;
using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Core.Types;
using System;
using System.Linq;
using System.Text;

namespace RIAPP.DataService.EFCore.Utils
{
    public static class DataServiceMethodsHelper
    {
        private static string GetTableName(DbContext DB, Type entityType)
        {
            var tableType = typeof(DbSet<>).MakeGenericType(entityType);
            var propertyInfo =
                DB.GetType()
                    .GetProperties()
                    .Where(p => p.PropertyType.IsGenericType && p.PropertyType == tableType)
                    .FirstOrDefault();
            if (propertyInfo == null)
                return string.Empty;
            return propertyInfo.Name;
        }

        private static string createDbSetMethods(DbSetInfo dbSetInfo, string tableName)
        {
            var sb = new StringBuilder(512);

            sb.AppendLine(string.Format("#region {0}", dbSetInfo.dbSetName));
            sb.AppendLine("[Query]");
            sb.AppendLine($"public async Task<QueryResult<{dbSetInfo.EntityType.Name}>> Read{dbSetInfo.dbSetName}()");
            sb.AppendLine("{");
            sb.AppendLine($"\tvar queryRes = await this.PerformQuery(this.DB.{tableName}, (countQuery) => countQuery.CountAsync());");
            sb.AppendLine("\tint? totalCount = await queryRes.Count;");
            sb.AppendLine("\tvar resList = await queryRes.Data.ToListAsync();");
            sb.AppendLine($"\treturn new QueryResult<{dbSetInfo.EntityType.Name}>(resList, totalCount);");
            sb.AppendLine("}");
            sb.AppendLine("");

            sb.AppendLine("[Insert]");
            sb.AppendLine($"public void Insert{dbSetInfo.dbSetName}({dbSetInfo.EntityType.Name} {dbSetInfo.dbSetName.ToLower()})");
            sb.AppendLine("{");
            sb.AppendLine($"\tthis.DB.{tableName}.Add({dbSetInfo.dbSetName.ToLower()});");
            sb.AppendLine("}");
            sb.AppendLine("");

            sb.AppendLine("[Update]");
            sb.AppendFormat("public void Update{1}({0} {2})", dbSetInfo.EntityType.Name, dbSetInfo.dbSetName, dbSetInfo.dbSetName.ToLower());
            sb.AppendLine("");
            sb.AppendLine("{");
            sb.AppendLine(string.Format("\t{0} orig = this.GetOriginal<{0}>();", dbSetInfo.EntityType.Name));
            sb.AppendLine(string.Format("\tvar entry = this.DB.{0}.Attach({1});", tableName, dbSetInfo.dbSetName.ToLower()));
            sb.AppendLine("\tentry.OriginalValues.SetValues(orig);");
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

            metadata.dbSets.ForEach(dbSetInfo =>
            {
                var tableName = GetTableName(DB, dbSetInfo.EntityType);
                if (tableName == string.Empty)
                    return;
                sb.AppendLine(createDbSetMethods(dbSetInfo, tableName));
            });
            return sb.ToString();
        }
    }
}