namespace RIAppDemo.BLL.Models
{
    public class FolderItem
    {
        public string Key { get; set; }
        public string ParentKey { get; set; }
        public string Name { get; set; }
        public int Level { get; set; }
        public bool HasSubDirs { get; set; }
        public bool IsFolder { get; set; }
    }
}