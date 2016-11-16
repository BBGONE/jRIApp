/// <reference path="../../jriapp/jriapp.d.ts" />
/// <reference path="../../jriapp/jriapp_db.d.ts" />
/// <reference path="../../jriapp/jriapp_ui.d.ts" />
/// <reference path="../../built/shared/shared.d.ts" />

import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as COMMON from "common";

import * as DEMODB from "../demo/demoDB";
import { IMainOptions, DemoApplication } from "./app";
import * as  ResizableGrid from "./resizableGrid";

var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, coreUtils = RIAPP.Utils.core, $ = RIAPP.$;
const styles = ["lsize", 'msize', 'ssize', 'nsize'];

/*
 an example converter, which depending on the size returns
 an array of css classes to add or to remove to the HTML element
*/
export class SizeConverter extends RIAPP.BaseConverter {
    convertToSource(val: any, param: any, dataContext: any): any {
        return undefined;
    }
    convertToTarget(val: any, param: any, dataContext: any): any {
        let size = "" + val, firstLetter: string;
        let res: string[] = undefined, found = false;
        if (!!val) {
            if (utils.check.isNumeric(size))
                firstLetter = 'n';
            else
                firstLetter = size.charAt(0).toLowerCase();
        }

        res = styles.map((style) => {
            //only check if not found (for optimization)
            if (!found && !!firstLetter && utils.str.startsWith(style, firstLetter)) {
                found = true;
                //adds this style to the classes
                return "+" + style;
            }
            else {
                //removes this style from the classes
                return "-" + style;
            }
        });

        /*
         if we return ['-*'] , it will remove all classes from the HTML element
          but here it is undesirable, because we would remove classes which were set elsewhere
        */

        return res;
    }
}

//bootstrap error handler - the last resort (typically display message to the user)
bootstrap.addOnError(function (sender, args) {
    debugger;
    alert(args.error.message);
    args.isHandled = true;
});

export function start(options: IMainOptions) {

    options.modulesInits = {
        "COMMON": COMMON.initModule,
        "ResizableGrid": ResizableGrid.initModule
    };

    bootstrap.init((bootstrap) => {
        //replace default buttons styles with something custom
        let ButtonsCSS = bootstrap.defaults.ButtonsCSS;
        ButtonsCSS.Edit = 'icon icon-pencil';
        ButtonsCSS.Delete = 'icon icon-trash';
        ButtonsCSS.OK = 'icon icon-ok';
        ButtonsCSS.Cancel = 'icon icon-remove';
    });

    //create and start application here
    return bootstrap.startApp(() => {
        return new DemoApplication(options);
    }, (app) => {
        app.registerConverter('sizeConverter', new SizeConverter());

        //an example of how to load a file with templates from the server (for loading group of templates- see spaDEMO.ts)
        app.loadTemplates(options.templates_url);

        //this registered function will be invoked every  time when the template with that name is needed
        //P.S. - but a better way how to load templates is to register templates' groups
        //see the Single Page RIAPP.Application Demo (spaDEMO.ts) how it is done there
        app.registerTemplateLoader('productEditTemplate', coreUtils.memoize(() => {
            return utils.http.getAjax(options.productEditTemplate_url); })
        );
    }).then((app) => {
        if (!!options.modelData && !!options.categoryData) {
            //the data was embedded into HTML page as json, just use it
            app.productVM.filter.modelData = options.modelData;
            app.productVM.filter.categoryData = options.categoryData;
        }
        else {
            return app.productVM.filter.load().then(() => {
                return app.productVM.load().then(function (loadRes) {/*alert(loadRes.outOfBandData.test);*/ });
            });
        }
    });
}