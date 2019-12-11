using System;

namespace RIAPP.DataService.Core
{
    public interface IEntityVersionProvider
    {
        object GetOriginal();
        object GetParent(Type entityType);

        TModel GetOriginal<TModel>()
            where TModel : class;

        TModel GetParent<TModel>()
            where TModel : class;
    }
}