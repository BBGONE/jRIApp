using System;
using System.Collections.Concurrent;

namespace RIAPP.DataService.Core.Metadata
{
    public class MetadataCache : ConcurrentDictionary<Type, RunTimeMetadata>
    {
    }
}