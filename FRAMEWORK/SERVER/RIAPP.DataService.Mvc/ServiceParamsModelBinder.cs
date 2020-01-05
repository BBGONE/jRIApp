using RIAPP.DataService.Utils;
using System;
using System.Web.Mvc;

namespace RIAPP.DataService.Mvc
{
    public class ServiceParamsBinderAttribute : CustomModelBinderAttribute
    {
        public override IModelBinder GetBinder()
        {
            return new JsonModelBinder();
        }

        public class JsonModelBinder : IModelBinder
        {
            static readonly ISerializer serializer = new Serializer();

            public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
            {
                try
                {
                    var bytes = new byte[controllerContext.HttpContext.Request.ContentLength];
                    controllerContext.HttpContext.Request.InputStream.Position = 0;
                    controllerContext.HttpContext.Request.InputStream.Read(bytes, 0, bytes.Length);
                    var body = controllerContext.HttpContext.Request.ContentEncoding.GetString(bytes);
                   
                    return serializer.DeSerialize(body, bindingContext.ModelType);
                }
                catch (Exception)
                {
                    return null;
                }
            }
        }
    }
}