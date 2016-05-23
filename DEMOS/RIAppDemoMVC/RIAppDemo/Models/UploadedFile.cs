using System.IO;

namespace RIAppDemo.Models
{
    public class UploadedFile
    {
        public int DataID { get; set; }
        public int FileSize { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public Stream Contents { get; set; }
    }
}