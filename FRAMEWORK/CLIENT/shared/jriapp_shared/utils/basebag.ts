/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IPropertyBag } from "../int";
import { BaseObject } from "../object";
import { StringUtils } from "./strutils";

const strUtils = StringUtils;

//Base Class for Property Bags implementations (for convenience)
export class BasePropBag extends BaseObject implements IPropertyBag {
    //override
    _isHasProp(prop: string) {
        //first check for indexed property name
        if (strUtils.startsWith(prop, "[")) {
            return true;
        }
        return super._isHasProp(prop);
    }
    onBagPropChanged(name: string): void {
        this.raisePropertyChanged("[" + name + "]");
    }
    //implements IPropertyBag
    getProp(name: string): any {
        return void 0;
    }
    setProp(name: string, val: any): void {
        //noop
    }
    get isPropertyBag() {
        return true;
    }
    toString() {
        return "BasePropBag";
    }
}