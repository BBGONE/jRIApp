

namespace RIAPP.DataService.Core
{
    public interface IOutputPort<in TUseCaseResponse>
    {
        void Handle(TUseCaseResponse response);

    }
}
