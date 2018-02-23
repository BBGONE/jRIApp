/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IEditable, IValidationInfo, IErrorNotification, TEventHandler, IPropertyBag } from "../int";
import { BaseObject } from "../object";
import { CoreUtils } from "./coreutils";
import { StringUtils } from "./strutils";
import { SysUtils } from "./sysutils";
import { Checks } from "./checks";
import { Debounce } from "./debounce";
import { IValidationError } from "../int";
import { ValidationError } from "../errors";

const { forEachProp, getValue, setValue } = CoreUtils, { startsWith, trimBrackets } = StringUtils,
    { isArray } = Checks, sys = SysUtils;

const enum BAG_EVENTS {
    errors_changed = "errors_changed",
    validate_bag = "validate_bag",
    validate_field = "validate_field"
}

export interface IBagErrors {
    [fieldName: string]: string[];
}

export interface IFieldValidateArgs<TBag extends IPropertyBag> {
    bag: TBag;
    readonly fieldName: string;
    readonly errors: string[];
}

export interface IBagValidateArgs<TBag extends IPropertyBag> {
    readonly bag: TBag;
    readonly result: IValidationInfo[];
}

// used for accessing json (it parses json into a value and then getProp && setProp can be used to get or set values)
export class JsonBag extends BaseObject implements IEditable, IErrorNotification, IPropertyBag {
    private _json: string = void 0;
    private _jsonChanged: (json: string) => void;
    private _val: any = {};
    private _saveVal: string = null;
    private _debounce: Debounce;
    private _errors: IBagErrors;

    constructor(json: string, jsonChanged: (json: string) => void) {
        super();
        this._debounce = new Debounce();
        this.resetJson(json);
        this._jsonChanged = jsonChanged;
        this._errors = {};
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._debounce.dispose();
        this._jsonChanged = null;
        this._json = void 0;
        this._val = {};
        super.dispose();
    }
    // override
    isHasProp(prop: string): boolean {
        // first check for indexed property name
        if (startsWith(prop, "[")) {
            return true;
        }
        return super.isHasProp(prop);
    }
    addOnValidateBag(fn: TEventHandler<IPropertyBag, IBagValidateArgs<IPropertyBag>>, nmspace?: string, context?: any) {
        this.objEvents.on(BAG_EVENTS.validate_bag, fn, nmspace, context);
    }
    offOnValidateBag(nmspace?: string) {
        this.objEvents.off(BAG_EVENTS.validate_bag, nmspace);
    }
    addOnValidateField(fn: TEventHandler<IPropertyBag, IFieldValidateArgs<IPropertyBag>>, nmspace?: string, context?: any) {
        this.objEvents.on(BAG_EVENTS.validate_field, fn, nmspace, context);
    }
    offOnValidateField(nmspace?: string) {
        this.objEvents.off(BAG_EVENTS.validate_field, nmspace);
    }
    addOnErrorsChanged(fn: TEventHandler<JsonBag, any>, nmspace?: string, context?: any) {
        this.objEvents.on(BAG_EVENTS.errors_changed, fn, nmspace, context);
    }
    offOnErrorsChanged(nmspace?: string) {
        this.objEvents.off(BAG_EVENTS.errors_changed, nmspace);
    }

    protected onChanged(): void {
        this._debounce.enque(() => {
            if (!!this._jsonChanged) {
                this._jsonChanged(this._json);
            }
        });
    }
    resetJson(json: string = null): void {
        if (this._json !== json) {
            this._json = json;
            this._val = (!json ? {} : JSON.parse(json));
            this.objEvents.raiseProp("json");
            this.objEvents.raiseProp("val");
            this.objEvents.raiseProp("[*]");
        }
    }
    updateJson(): boolean {
        const json: string = JSON.stringify(this._val);
        if (json !== this._json) {
            this._json = json;
            this.onChanged();
            this.objEvents.raiseProp("json");
            return true;
        }
        return false;
    }

    // error Notification Implementation
    protected _validateBag(): IValidationInfo[] {
        const args: IBagValidateArgs<JsonBag> = {
            bag: this,
            result: []
        };
        this.objEvents.raise(BAG_EVENTS.validate_bag, args);
        return (!!args.result) ? args.result : [];
    }
    protected _validateField(fieldName: string): IValidationInfo {
        const args: IFieldValidateArgs<JsonBag> = {
            bag: this,
            fieldName: fieldName,
            errors: []
        };
        this.objEvents.raise(BAG_EVENTS.validate_field, args);
        return (!!args.errors && args.errors.length > 0) ? { fieldName: fieldName, errors: args.errors } : null;
    }
    protected _onErrorsChanged(): void {
        this.objEvents.raise(BAG_EVENTS.errors_changed, {});
    }
    protected _addErrors(errors: IValidationInfo[]): void {
        const self = this;
        errors.forEach(function (err) {
            self._addError(err.fieldName, err.errors, true);
        });
        this._onErrorsChanged();
    }
    protected _addError(fieldName: string, errors: string[], ignoreChangeErrors?: boolean): void {
        if (!fieldName) {
            fieldName = "*";
        }
        if (!(isArray(errors) && errors.length > 0)) {
            this._removeError(fieldName, ignoreChangeErrors);
            return;
        }
        const itemErrors = this._errors;
        itemErrors[fieldName] = errors;
        if (!ignoreChangeErrors) {
            this._onErrorsChanged();
        }
    }
    protected _removeError(fieldName: string, ignoreChangeErrors?: boolean): boolean {
        const itemErrors = this._errors;
        if (!itemErrors) {
            return false;
        }
        if (!fieldName) {
            fieldName = "*";
        }
        if (!itemErrors[fieldName]) {
            return false;
        }
        delete itemErrors[fieldName];
        if (!ignoreChangeErrors) {
            this._onErrorsChanged();
        }
        return true;
    }
    protected _removeAllErrors(): void {
        this._errors = {};
        this._onErrorsChanged();
    }
    getIsHasErrors(): boolean {
        return !!this._errors && Object.keys(this._errors).length > 0;
    }
    getFieldErrors(fieldName: string): IValidationInfo[] {
        const bagErrors = this._errors;
        if (!bagErrors) {
            return [];
        }
        let name = fieldName;
        if (!fieldName) {
            fieldName = "*";
        }
        if (!bagErrors[fieldName]) {
            return [];
        }
        if (fieldName === "*") {
            name = null;
        }
        return [
            { fieldName: name, errors: bagErrors[fieldName] }
        ];
    }
    getAllErrors(): IValidationInfo[] {
        const bagErrors = this._errors;
        if (!bagErrors) {
            return [];
        }
        const res: IValidationInfo[] = [];
        forEachProp(bagErrors, function (name) {
            let fieldName: string = null;
            if (name !== "*") {
                fieldName = name;
            }
            res.push({ fieldName: fieldName, errors: bagErrors[name] });
        });
        return res;
    }
    getIErrorNotification(): IErrorNotification {
        return this;
    }

    // implements IEditable
    beginEdit(): boolean {
        if (!this.isEditing) {
            // clone data
            this._saveVal = JSON.stringify(this._val);
            return true;
        }
        return false;
    }
    endEdit(): boolean {
        if (this.isEditing) {
            // revalidate all
            this._removeAllErrors();
            const validationInfos = this._validateBag();
            if (validationInfos.length > 0) {
                this._addErrors(validationInfos);
            }
            if (this.getIsHasErrors()) {
                return false;
            }
            // saved value is not needed
            this._saveVal = null;
            this.updateJson();
            return true;
        }
        return false;
    }
    cancelEdit(): boolean {
        if (this.isEditing) {
            // restore value from saved value
            this._val = JSON.parse(this._saveVal);
            this._saveVal = null;
            this._removeAllErrors();
            this.objEvents.raiseProp("[*]");
            return true;
        }
        return false;
    }
    get isEditing(): boolean {
        return !!this._saveVal;
    }

    // implements IPropertyBag
    getProp(name: string): any {
        const fieldName = trimBrackets(name);
        return getValue(this._val, fieldName);
    }
    setProp(name: string, val: any): void {
        const old = this.getProp(name);
        if (old !== val) {
            try {
                const fieldName = trimBrackets(name);
                setValue(this._val, fieldName, val, false);
                sys.raiseProp(this, name);
                this._removeError(name);
                const validationInfo = this._validateField(name);
                if (!!validationInfo && validationInfo.errors.length > 0) {
                    throw new ValidationError([validationInfo], this);
                }
            } catch (ex) {
                let error: IValidationError;
                if (sys.isValidationError(ex)) {
                    error = ex;
                } else {
                    error = new ValidationError([
                        { fieldName: name, errors: [ex.message] }
                    ], this);
                }
                this._addError(name, error.validations[0].errors);
                throw error;
            }
        }
    }
    get isPropertyBag(): boolean {
        return true;
    }

    get val(): any {
        return this._val;
    }
    get json(): string {
        return this._json;
    }
    toString(): string {
        return "JsonBag";
    }
}
