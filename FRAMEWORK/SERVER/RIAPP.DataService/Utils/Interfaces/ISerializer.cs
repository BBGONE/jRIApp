using System;
using System.IO;

namespace RIAPP.DataService.Utils.Interfaces
{
    public interface ISerializer
    {
        string Serialize(object obj);

        void Serialize(object obj, TextWriter writer);

        object DeSerialize(string input, Type targetType);
    }
}