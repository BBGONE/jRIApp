using Newtonsoft.Json;
using RIAPP.DataService.Utils;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace RIAppDemo.BLL.Utils
{
    public class Serializer : ISerializer
    {
        public string Serialize(object obj)
        {
            return JsonConvert.SerializeObject(obj);
        }

        public Task SerializeAsync<T>(T obj, Stream stream)
        {
            var serializer = new JsonSerializer();
            serializer.NullValueHandling = NullValueHandling.Include;

            using (var writer = new StreamWriter(stream, Encoding.UTF8, 1024 * 32, true))
            using (JsonWriter jsonWriter = new JsonTextWriter(writer))
            {
                serializer.Serialize(writer, obj);
            }
            return Task.CompletedTask;
        }

        public object DeSerialize(string input, Type targetType)
        {
            return JsonConvert.DeserializeObject(input, targetType);
        }
    }

}