/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IValidationInfo, TEventHandler, IPropertyBag } from "../int";
import { BaseObject } from "../object";
import { JsonBag, IFieldValidateArgs, IBagValidateArgs } from "./jsonbag";
import { CoreUtils } from "./coreutils";
import { AnyList, AnyValListItem, IAnyVal, ICollValidateFieldArgs } from "./anylist";
import { ValidationError } from "../errors";

const coreUtils = CoreUtils;

const BAG_EVENTS = {
    errors_changed: "errors_changed",
    validate_bag: "validate_bag",
    validate_field: "validate_field"
};

export class JsonArray extends BaseObject {
    private _owner: JsonBag;
    private _pathToArray: string;
    private _list: AnyList = null;
    private _objId: string;

    constructor(owner: JsonBag, pathToArray: string) {
        super();
        this._objId = coreUtils.getNewID("jsn");
        this._owner = owner;
        this._pathToArray = pathToArray;
        this.owner.addOnPropertyChange("val", () => {
            if (!!this._list)
                this._list.setValues(this.getArray());
        }, this._objId);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._owner.removeNSHandlers(this._objId);
        this._list.destroy();
        this._list = null;
        this._owner = null;
        super.destroy();
    }
    protected _getEventNames() {
        const base_events = super._getEventNames();
        return [BAG_EVENTS.validate_bag, BAG_EVENTS.validate_field].concat(base_events);
    }
    protected updateArray(arr: any[]): void {
        coreUtils.setValue(this._owner.val, this._pathToArray, arr, false, '->');
        this._owner.updateJson();
    }
    addOnValidateBag(fn: TEventHandler<IPropertyBag, IBagValidateArgs<IPropertyBag>>, nmspace?: string, context?: any) {
        this._addHandler(BAG_EVENTS.validate_bag, fn, nmspace, context);
    }
    removeOnValidateBag(nmspace?: string) {
        this._removeHandler(BAG_EVENTS.validate_bag, nmspace);
    }
    addOnValidateField(fn: TEventHandler<IPropertyBag, IFieldValidateArgs<IPropertyBag>>, nmspace?: string, context?: any) {
        this._addHandler(BAG_EVENTS.validate_field, fn, nmspace, context);
    }
    removeOnValidateField(nmspace?: string) {
        this._removeHandler(BAG_EVENTS.validate_field, nmspace);
    }
    //error Notification Implementation
    protected _validateBag(bag: AnyValListItem): IValidationInfo[] {
        const args: IBagValidateArgs<IPropertyBag> = {
            bag: bag,
            result: []
        };
        this.raiseEvent(BAG_EVENTS.validate_bag, args);
        if (!!args.result)
            return args.result;
        else
            return [];
    }
    protected _validateField(bag: AnyValListItem, fieldName: string): IValidationInfo {
        const args: IFieldValidateArgs<IPropertyBag> = {
            bag: bag,
            fieldName: fieldName,
            errors: []
        };
        this.raiseEvent(BAG_EVENTS.validate_field, args);
        if (!!args.errors && args.errors.length > 0)
            return { fieldName: fieldName, errors: args.errors };
        else
            return null;
    }
    getArray(): any[] {
        if (!this._owner)
            return [];
        const res = coreUtils.getValue(this._owner.val, this._pathToArray, '->');
        return (!res) ? [] : res;
    }
    get pathToArray(): string {
        return this._pathToArray;
    }
    get owner(): JsonBag {
        return this._owner;
    }
    get list() {
        if (!!this._owner && !this._list) {
            this._list = new AnyList((vals: any[]) => {
                this.updateArray(vals);
            });
            this._list.addOnValidateField((s, args) => {
                let validation_info = this._validateField(args.item, args.fieldName);
                if (!!validation_info && validation_info.errors.length > 0)
                    args.errors = validation_info.errors;
            }, this._objId);

            this._list.addOnValidateItem((s, args) => {
                let validation_infos = this._validateBag(args.item);
                args.result = validation_infos;
            }, this._objId);
            this._list.setValues(this.getArray());
        }
        return this._list;
    }
}