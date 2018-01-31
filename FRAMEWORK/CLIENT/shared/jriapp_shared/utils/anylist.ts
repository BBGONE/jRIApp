/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IPropertyBag, IValidationInfo } from "../int";
import { CoreUtils } from "./coreutils";
import { SysUtils } from "./sysutils";
import { StringUtils } from "./strutils";
import { Debounce } from "./debounce";
import { COLL_CHANGE_TYPE, VALS_VERSION } from "../collection/const";
import { CollectionItem } from "../collection/item";
import { Validations } from "../collection/validation";
import { IListItem, ListItemAspect, BaseList } from "../collection/list";
import { ValidationError } from "../errors";

export { ICollValidateFieldArgs } from "../collection/int";

const { getValue, setValue } = CoreUtils, { startsWith, trimBrackets } = StringUtils,
    sys = SysUtils;

export interface IAnyVal {
    val: any;
}

export interface IAnyValItem extends IAnyVal, IListItem, IPropertyBag {
    readonly _aspect: AnyItemAspect;
}

export class AnyItemAspect extends ListItemAspect<IAnyValItem, IAnyVal> {
    // override and made public
    _validateField(name: string): IValidationInfo {
        return this.coll.errors.validateItemField(this.item, name);
    }
    // override
    protected _cloneVals(): any {
        let obj = super._cloneVals();
        obj.val = JSON.parse(JSON.stringify(obj.val));
        return obj;
    }
    // override
    protected _validateFields(): IValidationInfo[] {
        return Validations.distinct(this._validateItem());
    }
    // override List's methods
    _getProp(name: string) {
        return this._getValue(name, VALS_VERSION.Current);
    }
     // override
    _setProp(name: string, val: any) {
        if (this._getProp(name) !== val) {
            this._setValue(name, val, VALS_VERSION.Current);
            sys.raiseProp(this.item, name);
        }
    }
}


export class AnyValListItem extends CollectionItem<AnyItemAspect> implements IAnyValItem {
    get val(): any { return <any>this._aspect._getProp("val"); }
    set val(v: any) { this._aspect._setProp("val", v); }
    // override
    isHasProp(prop: string): boolean {
        // first check for indexed property name
        if (startsWith(prop, "[")) {
            return true;
        }
        return super.isHasProp(prop);
    }
    getProp(name: string): any {
        const fieldName = trimBrackets(name);
        return getValue(this.val, fieldName, "->");
    }
    setProp(name: string, val: any): void {
        const coll = this._aspect.coll, errors = coll.errors, old = this.getProp(name);
        if (old !== val) {
            try {
                const fieldName = trimBrackets(name);
                setValue(this.val, fieldName, val, false, "->");
                sys.raiseProp(this, name);
                errors.removeError(this, name);
                const validation: IValidationInfo = this._aspect._validateField(name);
                if (!!validation && validation.errors.length > 0) {
                    throw new ValidationError([validation], this);
                }
            } catch (ex) {
                let error: ValidationError;
                if (sys.isValidationError(ex)) {
                    error = ex;
                } else {
                    error = new ValidationError([
                        { fieldName: name, errors: [ex.message] }
                    ], this);
                }
                errors.addError(this, name, error.validations[0].errors);
                throw error;
            }
        }
    }
    get isPropertyBag() {
        return true;
    }
    get list(): AnyList {
        return <AnyList>this._aspect.list;
    }
    toString() {
        return "AnyValListItem";
    }
}

export class AnyList extends BaseList<IAnyValItem, IAnyVal> {
    private _onChanged: (arr: any[]) => void;
    private _saveVal: string = null;
    private _debounce: Debounce;

    constructor(onChanged: (arr: any[]) => void) {
        super([{ name: "val", dtype: 0 }]);
        this._onChanged = onChanged;
        this._debounce = new Debounce();

        this.addOnBeginEdit((_, a) => {
            this._saveVal = JSON.stringify(a.item.val);
        });

        this.addOnEndEdit((s, a) => {
            const item = a.item;

            if (a.isCanceled) {
                this._saveVal = null;
                item.objEvents.raiseProp("[*]");
                return;
            }
            const oldVal = this._saveVal, newVal = JSON.stringify(item.val);
            this._saveVal = null;

            if (oldVal !== newVal) {
                this.onChanged();
            }
        });

        this.addOnCollChanged((s, a) => {
            switch (a.changeType) {
                case COLL_CHANGE_TYPE.Remove:
                    {
                        this.onChanged();
                    }
                    break;
                default:
                    break;
            }
        });
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._debounce.dispose();
        this._onChanged = null;
        super.dispose();
    }
    // override
    itemFactory(aspect: AnyItemAspect): AnyValListItem {
        return new AnyValListItem(aspect);
    }
    // override
    protected createItem(obj?: IAnyVal): IAnyValItem {
        const isNew = !obj;
        const vals: any = isNew ? { val: {} } : obj;
        if (!vals.val) {
            vals.val = {};
        }
        const key = this._getNewKey();
        const aspect = new AnyItemAspect(this, vals, key, isNew);
        return aspect.item;
    }
    protected onChanged() {
        this._debounce.enque(() => {
            if (!!this._onChanged) {
                const arr = this.items.map((item) => {
                    return item.val;
                });
                this._onChanged(arr);
            }
        });
    }
    setValues(values: any[]): void {
        const vals: IAnyVal[] = values.map((val) => {
            return { val: val };
        });
        this.fillItems(vals, true);
    }
    toString() {
        return "AnyList";
    }
}