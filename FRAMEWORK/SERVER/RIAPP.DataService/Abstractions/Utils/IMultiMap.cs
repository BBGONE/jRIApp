using System.Collections.Generic;

namespace RIAPP.DataService.Utils
{
    public interface IMultiMap<K, V>
    {
        IEnumerable<V> this[K key] { get; }

        IEnumerable<K> Keys { get; }
        IEnumerable<V> Values { get; }

        bool IsReadOnly { get; }

        bool Add(K key, V value);

        void MakeReadOnly();
    }
}