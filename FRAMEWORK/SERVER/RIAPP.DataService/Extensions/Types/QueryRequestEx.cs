namespace RIAPP.DataService.Core.Types
{
    public static class QueryRequestEx
    {
        public static DbSetInfo GetDbSetInfo(this QueryRequest query)
        {
            return query._dbSetInfo;
        }

        public static void SetDbSetInfo(this QueryRequest query, DbSetInfo dbSetInfo)
        {
            query._dbSetInfo = dbSetInfo;
        }
    }
}