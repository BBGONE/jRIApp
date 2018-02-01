/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    Utils, BaseObject, IPropertyBag
} from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
const utils = Utils, { _undefined, isArray, isString } = utils.check, dom = DomUtils, { trimBrackets } = utils.str;

// wraps HTMLElement to add or remove classNames using data binding
export class CSSBag extends BaseObject implements IPropertyBag {
    private _el: Element;

    constructor(el: Element) {
        super();
        this._el = el;
    }
    // override
    isHasProp(prop: string) {
        return true;
    }
    // implement IPropertyBag
    getProp(name: string): any {
        // no need to get it
        return _undefined;
    }
    setProp(name: string, val: any): void {
        if (val === _undefined) {
            return;
        }
        const cssName = trimBrackets(name);
        if (cssName === "*") {
            if (!val) {
                // remove all classes
                dom.removeClass([this._el], null);
            } else if (isArray(val)) {
                dom.setClasses([this._el], <string[]>val);
            } else if (isString(val)) {
                dom.setClasses([this._el], val.split(" "));
            }
            return;
        }
        // set individual classes
        dom.setClass([this._el], cssName, !val);
    }
    get isPropertyBag() {
        return true;
    }
    toString() {
        return "CSSBag";
    }
}
