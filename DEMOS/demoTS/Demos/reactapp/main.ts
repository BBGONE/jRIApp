import * as RIAPP from "jriapp";
import { DemoApplication } from "./app";
import { initModule as initTempView } from "./components/tempview";
import { initModule as initPagerView } from "./components/pagerview";


const bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;

//bootstrap error handler - the last resort (typically display message to the user)
bootstrap.objEvents.addOnError(function (_s, args) {
    debugger;
    alert(args.error.message);
    args.isHandled = true;
});

export function start(options: RIAPP.IAppOptions) {
    options.modulesInits = utils.core.extend(options.modulesInits || {}, {
        "tempview": initTempView,
        "pagerview": initPagerView
    });
   
    //create and start application here
    return bootstrap.startApp(() => {
        return new DemoApplication(options);
    });
}