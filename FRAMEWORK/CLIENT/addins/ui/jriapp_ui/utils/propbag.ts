/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IIndexer, BasePropBag, Utils
} from "jriapp_shared";

const utils = Utils, strUtils = utils.str;

// wraps HTMLElement to get or change property using data binding
export class PropertyBag extends BasePropBag {
    private _el: IIndexer<any>;

    constructor(el: HTMLElement) {
        super();
        this._el = el;
    }
    //implement IPropertyBag
    getProp(name: string): any {
        const propName = strUtils.trimBrackets(name);
        return this._el[propName];
    }
    setProp(name: string, val: any): void {
        const propName = strUtils.trimBrackets(name);
        const old = this._el[propName];
        if (old !== val) {
            this._el[propName] = val;
            this.raisePropertyChanged(name);
        }
    }
    toString() {
        return "PropertyBag";
    }
}
