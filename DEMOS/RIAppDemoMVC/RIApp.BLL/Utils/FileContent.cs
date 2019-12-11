using System.IO;
using System.Threading.Tasks;

namespace RIAppDemo.BLL.Utils
{
    public class FileContent : IDataContent
    {
        private string _filePath;

        public FileContent(string filePath)
        {
            this._filePath = filePath;
        }

        public string FilePath { get { return _filePath; } }

        public async Task CopyToAsync(Stream stream, int bufferSize = 131072)
        {
            using(var fileStream = File.OpenRead(this.FilePath))
            {
                await fileStream.CopyToAsync(stream);
            }
        }

        public void CleanUp()
        {
            if (File.Exists(this.FilePath))
                File.Delete(this.FilePath);
        }
    }
}
