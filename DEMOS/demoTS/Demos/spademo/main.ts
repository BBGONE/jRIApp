/// <reference path="../../jriapp/jriapp.d.ts" />
/// <reference path="../../jriapp/jriapp_ui.d.ts" />
/// <reference path="../../jriapp/jriapp_db.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

import { IMainOptions, DemoApplication } from "./app";
import * as VIEWMODELS from "./viewModels";
import * as COMMON from "common";
import * as AUTOCOMPLETE from "autocomplete";
import * as GRIDELVIEW from "./gridElView";
import * as PRODAUTOCOMPLETE from "./prodAutocomplete";


//bootstrap error handler - the last resort (typically display message to the user)
RIAPP.bootstrap.addOnError(function (sender, args) {
    debugger;
    alert(args.error.message);
});

export function start(options: IMainOptions) {
    options.modulesInits = {
        "COMMON": COMMON.initModule,
        "AUTOCOMPLETE": AUTOCOMPLETE.initModule,
        "GRIDELVIEW": GRIDELVIEW.initModule,
        "PRODAUTOCOMPLETE": PRODAUTOCOMPLETE.initModule
    };

    //create and start application here
    RIAPP.bootstrap.startApp(() => {
        return new DemoApplication(options);
    }, (app) => {
        app.registerTemplateGroup('custGroup',
            {
                url: options.spa_template1_url,
                names: ["SPAcustTemplate", "goToInfoColTemplate", "SPAcustDetailTemplate", "customerEditTemplate", "customerDetailsTemplate", "orderEditTemplate",
                    "orderDetEditTemplate", "orderDetailsTemplate", "productTemplate1", "productTemplate2",
                    "prodAutocompleteTemplate"]
            });

        app.registerTemplateGroup('custInfoGroup',
            {
                url: options.spa_template2_url,
                names: ["customerInfo", "salespersonTemplate1", "salespersonTemplate2", "salePerAutocompleteTemplate"]
            });

        app.registerTemplateGroup('custAdrGroup',
            {
                url: options.spa_template3_url,
                names: ["customerAddr", "addressTemplate", "addAddressTemplate", "linkAdrTemplate", "newAdrTemplate"]
            });
        }).then((app) => {
            app.customerVM.load();
        });
}