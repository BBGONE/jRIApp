using System;
using System.Collections.Concurrent;

namespace RIAPP.DataService.DomainService.Metadata
{
    public class MetadataCache : ConcurrentDictionary<Type, RunTimeMetadata>
    {
    }
}