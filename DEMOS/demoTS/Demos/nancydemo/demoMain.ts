/// <reference path="../jriapp/jriapp.d.ts" />
import * as RIAPP from "jriapp";
import * as DEMO from "./gridDemo";

var bootstrap = RIAPP.bootstrap, $http = RIAPP.Utils.http

export function start(mainOptions: DEMO.IMainOptions) {
    mainOptions = RIAPP.Utils.core.extend(DEMO.appOptions, mainOptions);
    //create and start application here
    bootstrap.startApp(() => { return new DEMO.DemoApplication(mainOptions); }, (thisApp) => {
        //example of how to preload a group of templates from the server - see spaDEMO.ts for a better way
        thisApp.loadTemplates(mainOptions.templates_url);

        //***here are two examples how we can register template's loader functions for individual templates***
        //this registered function will be invoked every  time when the template with that name is needed
        //P.S. - but the best way how to load templates is to register templates' groups
        //see the Single Page Application Demo (spaDEMO.ts) how it is done there
        thisApp.registerTemplateLoader('productEditTemplate', RIAPP.Utils.core.memoize(() => {
            return $http.getAjax(mainOptions.productEditTemplate_url);
        })
        );
    });
}