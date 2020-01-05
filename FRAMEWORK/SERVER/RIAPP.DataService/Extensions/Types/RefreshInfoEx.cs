namespace RIAPP.DataService.Core.Types
{
    public static class RefreshInfoEx
    {
        public static DbSetInfo GetDbSetInfo(this RefreshRequest refreshInfo)
        {
            return refreshInfo._dbSetInfo;
        }

        public static void SetDbSetInfo(this RefreshRequest refreshInfo, DbSetInfo dbSetInfo)
        {
            refreshInfo._dbSetInfo = dbSetInfo;
        }
    }
}