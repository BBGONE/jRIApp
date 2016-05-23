using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace RIAPP.DataService.DomainService.Types
{
    public class QueryResult
    {
        private readonly Lazy<SubResultList> _subResults;

        public QueryResult()
        {
            _subResults = new Lazy<SubResultList>(() => new SubResultList(), true);
        }

        public int? TotalCount { get; set; }

        public IEnumerable Result { get; set; }

        public object extraInfo { get; set; }

        /// <summary>
        ///     child navigation properties which should be included in the result
        ///     in the form dbSetName.parentToChildrenName or dbSetName.childToParentName
        ///     for example:Customer.CustomerAddresses
        /// </summary>
        public string[] includeNavigations { get; set; }

        public SubResultList subResults
        {
            get { return _subResults.Value; }
        }
    }

    public class QueryResult<T> : QueryResult
        where T : class
    {
        public QueryResult()
            : this(Enumerable.Empty<T>(), null, new string[0])
        {
        }

        public QueryResult(IEnumerable<T> result)
            : this(result, null, new string[0])
        {
        }

        public QueryResult(IEnumerable<T> result, int? totalCount)
            : this(result, totalCount, new string[0])
        {
        }

        public QueryResult(IEnumerable<T> result, int? totalCount, string[] includeNavigations)
        {
            Result = result;
            TotalCount = totalCount;
            this.includeNavigations = includeNavigations == null ? new string[0] : includeNavigations;
        }

        public IEnumerable<T> getResult()
        {
            return (IEnumerable<T>) Result;
        }
    }
}