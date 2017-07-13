/// <reference path="../../jriapp/jriapp.d.ts" />
/// <reference path="../../jriapp/jriapp_db.d.ts" />
/// <reference path="../../jriapp/jriapp_ui.d.ts" />
/// <reference path="../../built/shared/shared.d.ts" />
import * as RIAPP from "jriapp";
import * as COMMON from "common";
import * as AUTOCOMPLETE from "autocomplete";
import { IMainOptions, DemoApplication } from "./app";

const bootstrap = RIAPP.bootstrap;

//bootstrap error handler - the last resort (typically display message to the user)
bootstrap.addOnError(function (sender, args) {
    debugger;
    alert(args.error.message);
});

export function start(mainOptions: IMainOptions) {
    mainOptions.modulesInits = {
        "COMMON": COMMON.initModule,
        "AUTOCOMPLETE": AUTOCOMPLETE.initModule
    };

    //create and start application here
    return bootstrap.startApp(() => {
        return new DemoApplication(mainOptions);
    }).then((app) => {
        return app.customerVM.load();
    });
}