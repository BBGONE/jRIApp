/// <reference path="../jriapp/jriapp.d.ts" />
/// <reference path="../jriapp/addins/jriapp_ui.d.ts" />
/// <reference path="../jriapp/addins/jriapp_db.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as SPADEMO from "./spaDemoApp";

export function start(mainOptions: SPADEMO.IMainOptions) {
    let appOptions = RIAPP.Utils.core.extend(SPADEMO.mainOptions, mainOptions);

    //create and start application here
    RIAPP.bootstrap.startApp(() => {
        return new SPADEMO.DemoApplication(appOptions);
    }, (thisApp) => {
        thisApp.registerTemplateGroup('custGroup',
            {
                url: appOptions.spa_template1_url,
                names: ["SPAcustTemplate", "goToInfoColTemplate", "SPAcustDetailTemplate", "customerEditTemplate", "customerDetailsTemplate", "orderEditTemplate",
                    "orderDetEditTemplate", "orderDetailsTemplate", "productTemplate1", "productTemplate2",
                    "prodAutocompleteTemplate"]
            });

        thisApp.registerTemplateGroup('custInfoGroup',
            {
                url: appOptions.spa_template2_url,
                names: ["customerInfo", "salespersonTemplate1", "salespersonTemplate2", "salePerAutocompleteTemplate"]
            });

        thisApp.registerTemplateGroup('custAdrGroup',
            {
                url: appOptions.spa_template3_url,
                names: ["customerAddr", "addressTemplate", "addAddressTemplate", "linkAdrTemplate", "newAdrTemplate"]
            });
    });
}