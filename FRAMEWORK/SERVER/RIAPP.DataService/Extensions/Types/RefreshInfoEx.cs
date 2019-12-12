namespace RIAPP.DataService.Core.Types
{
    public static class RefreshInfoEx
    {
        public static DbSetInfo GetDbSetInfo(this RefreshInfoRequest refreshInfo)
        {
            return refreshInfo._dbSetInfo;
        }

        public static void SetDbSetInfo(this RefreshInfoRequest refreshInfo, DbSetInfo dbSetInfo)
        {
            refreshInfo._dbSetInfo = dbSetInfo;
        }
    }
}