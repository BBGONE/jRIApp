namespace RIAPP.DataService.Core.Types
{
    public static class RefreshInfoEx
    {
        public static DbSetInfo GetDbSetInfo(this RefreshInfo refreshInfo)
        {
            return refreshInfo._dbSetInfo;
        }

        public static void SetDbSetInfo(this RefreshInfo refreshInfo, DbSetInfo dbSetInfo)
        {
            refreshInfo._dbSetInfo = dbSetInfo;
        }
    }
}