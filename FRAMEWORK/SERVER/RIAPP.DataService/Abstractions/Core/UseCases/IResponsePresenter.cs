

namespace RIAPP.DataService.Core
{
    public interface IResponsePresenter<in TUseCaseResponse, out TResponse> : IOutputPort<TUseCaseResponse>
    {
        TResponse Response
        {
            get;
        }
    }
}
