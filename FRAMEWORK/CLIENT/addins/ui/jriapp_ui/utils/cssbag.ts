/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, BasePropBag
} from "jriapp_shared";

const utils = Utils, checks = utils.check, dom = utils.dom;

// wraps HTMLElement to add or remove classNames using data binding
export class CSSBag extends BasePropBag {
    private _el: Element;

    constructor(el: Element) {
        super();
        this._el = el;
    }
    //implement IPropertyBag
    setProp(name: string, val: any): void {
        if (val === checks.undefined)
            return;

        if (name === "*") {
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
        dom.setClass([this._el], name, !val);
    }
    toString() {
        return "CSSBag";
    }
}