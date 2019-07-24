namespace RIAPP.DataService.Core.Metadata
{
    public interface IMetaDataProvider
    {
        RunTimeMetadata GetMetadata();
        DesignTimeMetadata GetDesignTimeMetadata(bool isDraft);
    }
}
