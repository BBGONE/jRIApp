﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace RIAPP.DataService.Utils
{
    public class MultiMap<K, V> : IMultiMap<K, V>
    {
        private readonly ConcurrentDictionary<K, IEnumerable<V>> _dictionary =
            new ConcurrentDictionary<K, IEnumerable<V>>();

        private volatile bool _isReadOnly;

        public bool Add(K key, V value)
        {
            lock (_dictionary)
            {
                if (_isReadOnly)
                {
                    throw new InvalidOperationException("The MultyMap is ReadOnly");
                }

                var list = GetListByKey(key) as IProducerConsumerCollection<V>;
                if (list == null)
                {
                    throw new InvalidOperationException("The MultyMap is ReadOnly");
                }

                return list.TryAdd(value);
            }
        }

        public IEnumerable<K> Keys
        {
            get { return _dictionary.Keys; }
        }

        public IEnumerable<V> Values
        {
            get
            {
                var lists = _dictionary.Values;
                var res = new List<V>();
                foreach (var list in lists)
                {
                    foreach (var val in list)
                    {
                        res.Add(val);
                    }
                }
                return res.Distinct<V>();
            }
        }


        public IEnumerable<V> this[K key]
        {
            get { return GetListByKey(key); }
        }

        public void MakeReadOnly()
        {
            if (_isReadOnly)
            {
                return;
            }

            lock (_dictionary)
            {
                if (_isReadOnly)
                {
                    return;
                }

                _isReadOnly = true;
                var keys = Keys.ToList();
                keys.ForEach(k =>
                {
                    var vals = _dictionary[k].ToArray();
                    _dictionary[k] = vals;
                });
            }
        }

        public bool IsReadOnly
        {
            get { return _isReadOnly; }
        }


        private static IEnumerable<V> ListFactory(K key)
        {
            return new ConcurrentBag<V>();
        }

        private IEnumerable<V> GetListByKey(K key)
        {
            if (_isReadOnly)
            {
                IEnumerable<V> val;
                if (_dictionary.TryGetValue(key, out val))
                {
                    return val;
                }

                return new V[0];
            }
            return _dictionary.GetOrAdd(key, ListFactory);
        }
    }
}