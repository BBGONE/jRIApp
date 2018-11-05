using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Utils;
using RIAPP.DataService.Utils.Extensions;
using RIAPP.DataService.Utils.Interfaces;
using System.Collections.Generic;
using System.Linq;

namespace RIAPP.DataService.DomainService
{
    internal class SubsetsGenerator
    {
        private readonly IDataHelper _dataHelper;
        private readonly BaseDomainService _domainService;

        public SubsetsGenerator(BaseDomainService domainService)
        {
            _domainService = domainService;
            _dataHelper = _domainService.ServiceContainer.DataHelper;
        }

        public SubsetList CreateSubsets(IEnumerable<SubResult> subResults)
        {
            var result = new SubsetList();
            if (subResults == null)
                return result;
            var metadata = _domainService.GetMetadata();
            foreach (var subResult in subResults)
            {
                var dbSetInfo = metadata.dbSets[subResult.dbSetName];

                if (result.Any(r => r.dbSetName == subResult.dbSetName))
                    throw new DomainServiceException(string.Format("The included sub results already have DbSet {0} entities", dbSetInfo.dbSetName));

                var rowGenerator = new RowGenerator(dbSetInfo, subResult.Result, _dataHelper);

                var current = new Subset
                {
                    dbSetName = dbSetInfo.dbSetName,
                    rows = rowGenerator.CreateDistinctRows(),
                    names = dbSetInfo.GetNames()
                };

                result.Add(current);
            }

            return result;
        }
    }
}