/// <reference path="../../jriapp/jriapp.d.ts" />
/// <reference path="../../jriapp/jriapp_db.d.ts" />
/// <reference path="../../jriapp/jriapp_ui.d.ts" />
/// <reference path="../../built/shared/shared.d.ts" />

import * as RIAPP from "jriapp";
import { DemoApplication } from "./app";
import { initModule as initReactView } from "./components/reactview";


const bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;

//bootstrap error handler - the last resort (typically display message to the user)
bootstrap.objEvents.addOnError(function (_s, args) {
    debugger;
    alert(args.error.message);
    args.isHandled = true;
});

export function start(options: RIAPP.IAppOptions) {
    options.modulesInits = utils.core.extend(options.modulesInits || {}, {
        "reactview": initReactView
    });
   
    //create and start application here
    return bootstrap.startApp(() => {
        return new DemoApplication(options);
    });
}