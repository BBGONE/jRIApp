using System;
using System.Collections.Concurrent;

namespace RIAPP.DataService.Utils
{
    public class MetadataCache : ConcurrentDictionary<Type, CachedMetadata>
    {
    }
}