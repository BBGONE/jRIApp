using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using RIAPP.DataService.Utils.Interfaces;
using System;
using System.IO;

namespace RIAPP.DataService.Nancy
{
    /// <summary>
    /// serialize an object to JSON
    /// </summary>
    public class Serializer : ISerializer
    {
        public Serializer()
        {
        }

        public string Serialize(object obj)
        {
            return JsonConvert.SerializeObject(obj);
        }

        public void Serialize(object obj, TextWriter writer)
        {
            JsonSerializer serializer = new JsonSerializer();
            serializer.Converters.Add(new JavaScriptDateTimeConverter());
            serializer.NullValueHandling = NullValueHandling.Include;

            using (JsonWriter jsonWriter = new JsonTextWriter(writer))
            {
                serializer.Serialize(writer, obj);
            }
        }

        public object DeSerialize(string input, Type targetType)
        {
            return JsonConvert.DeserializeObject(input, targetType);
        }

        public object DeserializeObject(string input)
        {
            return JsonConvert.DeserializeObject(input);
        }
    }
}
