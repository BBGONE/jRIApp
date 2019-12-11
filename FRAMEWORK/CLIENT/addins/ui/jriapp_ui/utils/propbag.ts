/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    IIndexer, Utils, BaseObject, IPropertyBag
} from "jriapp_shared";

const utils = Utils, { trimBrackets } = utils.str;

// wraps HTMLElement to get or change property using data binding
export class PropertyBag extends BaseObject implements IPropertyBag {
    private _el: IIndexer<any>;

    constructor(el: HTMLElement) {
        super();
        this._el = el;
    }
    // override
    isHasProp(prop: string) {
        const propName = trimBrackets(prop);
        return (propName in this._el);
    }
    // implement IPropertyBag
    getProp(name: string): any {
        const propName = trimBrackets(name);
        return this._el[propName];
    }
    setProp(name: string, val: any): void {
        const propName = trimBrackets(name);
        const old = this._el[propName];
        if (old !== val) {
            this._el[propName] = val;
            this.objEvents.raiseProp(<any>name);
        }
    }
    get isPropertyBag() {
        return true;
    }
    toString() {
        return "PropertyBag";
    }
}
