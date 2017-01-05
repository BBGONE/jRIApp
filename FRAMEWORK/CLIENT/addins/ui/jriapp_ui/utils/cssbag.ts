/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, BaseObject, IPropertyBag
} from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
const utils = Utils, checks = utils.check, dom = DomUtils, strUtils = utils.str;

// wraps HTMLElement to add or remove classNames using data binding
export class CSSBag extends BaseObject implements IPropertyBag {
    private _el: Element;

    constructor(el: Element) {
        super();
        this._el = el;
    }
    //override
    _isHasProp(prop: string) {
        return true;
    }
    //implement IPropertyBag
    getProp(name: string): any {
        //no need to get it
        return checks.undefined;
    }
    setProp(name: string, val: any): void {
        if (val === checks.undefined)
            return;
        const cssName = strUtils.trimBrackets(name);
        if (cssName === "*") {
            if (!val) {
                //remove all classes
                dom.removeClass([this._el], null);
            }
            else if (checks.isArray(val)) {
                dom.setClasses([this._el], <string[]>val);
            }
            else if (checks.isString(val)) {
                dom.setClasses([this._el], val.split(" "));
            }
            return;
        }
        //set individual classes
        dom.setClass([this._el], cssName, !val);
    }
    get isPropertyBag() {
        return true;
    }
    toString() {
        return "CSSBag";
    }
}