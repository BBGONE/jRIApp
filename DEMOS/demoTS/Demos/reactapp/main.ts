﻿import * as RIAPP from "jriapp";
import { DemoApplication } from "./app";
import { initModule as initSimpleView } from "./views/simple";
import { initModule as initPagerView } from "./views/pager";
import { initModule as initTemplatedView } from "./views/templated";
import { initModule as initTabsView } from "./views/tabs";
import { initModule as initTabs2View } from "./views/tabs-old";

const bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;

//bootstrap error handler - the last resort (typically display message to the user)
bootstrap.objEvents.addOnError(function (_s, args) {
    debugger;
    alert(args.error.message);
    args.isHandled = true;
});

export function start(options: RIAPP.IAppOptions) {
    options.modulesInits = utils.core.extend(options.modulesInits || {}, {
        "simpleview": initSimpleView,
        "templatedview": initTemplatedView,
        "pagerview": initPagerView,
        "tabsview": initTabsView,
        "tabs2view": initTabs2View,
    });
   
    //create and start application here
    return bootstrap.startApp(() => {
        return new DemoApplication(options);
    });
}