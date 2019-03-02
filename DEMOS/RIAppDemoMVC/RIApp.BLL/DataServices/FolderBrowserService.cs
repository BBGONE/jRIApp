using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Attributes;
using RIAPP.DataService.DomainService.Metadata;
using RIAPP.DataService.DomainService.Security;
using RIAPP.DataService.DomainService.Types;
using RIAppDemo.BLL.Models;
using RIAppDemo.BLL.Utils;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace RIAppDemo.BLL.DataServices
{
    public class FolderBrowserService : BaseDomainService
    {
        private readonly string BASE_ROOT = AppDomain.CurrentDomain.BaseDirectory;
        private readonly string CONFIG_ROOT = ConfigurationManager.AppSettings["FOLDER_BROWSER_PATH"];

        public FolderBrowserService(IServiceContainer serviceContainer)
            : base(serviceContainer)
        {
        }

        protected override DesignTimeMetadata GetDesignTimeMetadata(bool isDraft)
        {
            return DesignTimeMetadata.FromXML(ResourceHelper.GetResourceString("RIAppDemo.BLL.Metadata.FolderBrowser.xml"));
        }

        private string GetRootPath(string infoType)
        {
            switch (infoType)
            {
                case "BASE_ROOT":
                    return BASE_ROOT;
                case "CONFIG_ROOT":
                    return CONFIG_ROOT;
                default:
                    throw new InvalidOperationException();
            }
        }

        [Authorize]
        [Query]
        public QueryResult<FolderItem> ReadRoot(bool includeFiles, string infoType)
        {
            return ReadChildren(null, 0, "", includeFiles, infoType);
        }

        [Authorize]
        [Query]
        public QueryResult<FolderItem> ReadChildren(string parentKey, int level, string path, bool includeFiles,
            string infoType)
        {
            var fullpath = Path.GetFullPath(Path.Combine(GetRootPath(infoType), path));
            var dinfo = new DirectoryInfo(fullpath);
            if (!includeFiles)
            {
                var dirs = dinfo.EnumerateDirectories();
                var res =
                    dirs.Select(
                        d =>
                            new FolderItem
                            {
                                Key = Guid.NewGuid().ToString(),
                                ParentKey = parentKey,
                                HasSubDirs = d.EnumerateDirectories().Any(),
                                Level = level,
                                Name = d.Name,
                                IsFolder = true
                            }).OrderBy(d => d.Name);
                return new QueryResult<FolderItem>(res);
            }
            var fileSyst = dinfo.EnumerateFileSystemInfos();
            var res2 =
                fileSyst.Select(
                    d =>
                        new FolderItem
                        {
                            Key = Guid.NewGuid().ToString(),
                            ParentKey = parentKey,
                            HasSubDirs =
                                d is DirectoryInfo ? ((DirectoryInfo) d).EnumerateFileSystemInfos().Any() : false,
                            Level = level,
                            Name = d.Name,
                            IsFolder = d is DirectoryInfo
                        }).OrderByDescending(d => d.IsFolder).ThenBy(d => d.Name);
            return new QueryResult<FolderItem>(res2);
        }


        [Authorize]
        [Query]
        public QueryResult<FolderItem> ReadAll(bool includeFiles, string infoType)
        {
            return new QueryResult<FolderItem>(_ReadAll(includeFiles, infoType));
        }


        private IEnumerable<FolderItem> _ReadAll(bool includeFiles, string infoType)
        {
            var root = ReadRoot(includeFiles, infoType);
            foreach (var item in root.Result.Cast<FolderItem>())
            {
                yield return item;
                if (item.IsFolder)
                {
                    foreach (var subitem in _ReadChildren(item.Key, 1, item.Name, includeFiles, infoType))
                        yield return subitem;
                }
            }
        }

        private IEnumerable<FolderItem> _ReadChildren(string parentKey, int level, string path, bool includeFiles,
            string infoType)
        {
            var parent = ReadChildren(parentKey, level, path, includeFiles, infoType);
            foreach (var item in parent.Result.Cast<FolderItem>())
            {
                yield return item;
                if (item.IsFolder)
                {
                    foreach (var subitem in _ReadChildren(item.Key, level + 1, string.Format("{0}\\{1}", path, item.Name), includeFiles, infoType))
                        yield return subitem;
                }
            }
        }

        public void DeleteFileSystemObject(FolderItem dummy)
        {
            throw new NotImplementedException();
        }

        protected override Task ExecuteChangeSet()
        {
            throw new NotImplementedException();
        }
    }
}