/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    IIndexer, Utils, BaseObject, IPropertyBag
} from "jriapp_shared";

const utils = Utils, strUtils = utils.str;

// wraps HTMLElement to get or change property using data binding
export class PropertyBag extends BaseObject implements IPropertyBag {
    private _el: IIndexer<any>;

    constructor(el: HTMLElement) {
        super();
        this._el = el;
    }
    // override
    isHasProp(prop: string) {
        const propName = strUtils.trimBrackets(prop);
        return (propName in this._el);
    }
    // implement IPropertyBag
    getProp(name: string): any {
        const propName = strUtils.trimBrackets(name);
        return this._el[propName];
    }
    setProp(name: string, val: any): void {
        const propName = strUtils.trimBrackets(name);
        const old = this._el[propName];
        if (old !== val) {
            this._el[propName] = val;
            this.objEvents.raiseProp(name);
        }
    }
    get isPropertyBag() {
        return true;
    }

    toString() {
        return "PropertyBag";
    }
}
