﻿/// <reference path="../../jriapp/jriapp.d.ts" />
/// <reference path="../../jriapp/jriapp_db.d.ts" />
/// <reference path="../../jriapp/jriapp_ui.d.ts" />
/// <reference path="../../built/shared/shared.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as DEMODB from "../demo/demoDB";
import * as COMMON from "common";
import * as AUTOCOMPLETE from "autocomplete";
import * as PRODAUTOCOMPLETE from "./prodAutocomplete";
import { IMainOptions, DemoApplication } from "./app";

let bootstrap = RIAPP.bootstrap;


//bootstrap error handler - the last resort (typically display message to the user)
bootstrap.objEvents.addOnError(function (_s, args) {
    debugger;
    alert(args.error.message);
});

export function start(options: IMainOptions) {
    options.modulesInits = {
        "COMMON": COMMON.initModule,
        "AUTOCOMPLETE": AUTOCOMPLETE.initModule,
        "PRODAUTOCOMPLETE": PRODAUTOCOMPLETE.initModule
    };

    //create and start application here
    return bootstrap.startApp(() => {
        return new DemoApplication(options);
    }).then((app) => {
        return app.customerVM.load();
    });
}