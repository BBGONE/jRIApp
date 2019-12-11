using System.IO;
using System.Threading.Tasks;

namespace RIAppDemo.BLL.Utils
{
    public interface IDataContent
    {
        void CleanUp();
        Task CopyToAsync(Stream stream, int bufferSize = 131072);
    }
}