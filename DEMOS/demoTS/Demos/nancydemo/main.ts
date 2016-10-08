/// <reference path="../../jriapp/jriapp.d.ts" />
import * as RIAPP from "jriapp";
import * as DEMO from "./gridDemo";

var bootstrap = RIAPP.bootstrap, $http = RIAPP.Utils.http

export function start(mainOptions: DEMO.IMainOptions) {
    mainOptions = RIAPP.Utils.core.extend(DEMO.appOptions, mainOptions);
    //create and start application here
    bootstrap.startApp(() => { return new DEMO.DemoApplication(mainOptions); }, (thisApp) => {
        //example of how to preload a group of templates from the server - see spaDEMO.ts for a better way
        thisApp.loadTemplates(mainOptions.templates_url);

        thisApp.registerTemplateLoader('productEditTemplate', RIAPP.Utils.core.memoize(() => {
            return $http.getAjax(mainOptions.productEditTemplate_url);  })
        );
    });
}