/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IIndexer, BasePropBag
} from "jriapp_shared";


// wraps HTMLElement to get or change property using data binding
export class PropertyBag extends BasePropBag {
    private _el: IIndexer<any>;

    constructor(el: HTMLElement) {
        super();
        this._el = el;
    }
    //implement IPropertyBag
    getProp(name: string): any {
        return this._el[name];
    }
    setProp(name: string, val: any): void {
        let old = this._el[name];
        if (old !== val) {
            this._el[name] = val;
            this.onBagPropChanged(name);
        }
    }
    toString() {
        return "PropertyBag";
    }
}
