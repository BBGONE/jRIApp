/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    LocaleERRS
} from "jriapp_shared";

if (!("jQuery" in window))
    throw new Error(LocaleERRS.ERR_APP_NEED_JQUERY);

export const $: JQueryStatic = jQuery;

export class JQueryUtils {
    static $ = jQuery;

    static destroy$Plugin($el: JQuery, name: string): void {
        let plugin = $el.data(name);
        if (!!plugin) {
            $el[name]("destroy");
        }
    }
}