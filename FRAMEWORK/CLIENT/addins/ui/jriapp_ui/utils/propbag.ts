/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    BaseObject, Utils, IIndexer, IPropertyBag
} from "jriapp_shared";

const utils = Utils, checks = utils.check, dom = utils.dom, PROP_BAG = utils.sys.PROP_BAG_NAME();

// wraps HTMLElement to get or change property using data binding
export class PropertyBag extends BaseObject implements IPropertyBag {
    private _el: IIndexer<any>;

    constructor(el: HTMLElement) {
        super();
        this._el = el;
    }
    //override
    _isHasProp(prop: string) {
        return checks.isHasProp(this._el, prop);
    }
    //implement IPropertyBag
    getProp(name: string): any {
        return this._el[name];
    }
    setProp(name: string, val: any): void {
        let old = this._el[name];
        if (old !== val) {
            this._el[name] = val;
            this.raisePropertyChanged(name);
        }
    }
    toString() {
        return PROP_BAG;
    }
}
