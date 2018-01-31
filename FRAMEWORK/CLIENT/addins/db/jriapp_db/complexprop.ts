/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    IErrorNotification, IValidationInfo, TEventHandler, BaseObject, IBaseObject,
    LocaleERRS as ERRS, Utils
} from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { IEntityItem } from "./int";
import { EntityAspect } from "./entity_aspect";
import { DbContext } from "./dbcontext";

const utils = Utils, { format } = utils.str;

export abstract class BaseComplexProperty extends BaseObject implements IErrorNotification {
    private _name: string;

    constructor(name: string) {
        super();
        this._name = name;
    }
    getName(): string {
        return this._name;
    }
    abstract _addOwnedObject(obj: IBaseObject): void;
    abstract _getFullPath(path: string): string;
    abstract setValue(fullName: string, value: any): void;
    abstract getValue(fullName: string): any;
    abstract getFieldInfo(): IFieldInfo;
    abstract getProperties(): IFieldInfo[];
    abstract getFullPath(name: string): string;
    abstract getEntity(): EntityAspect<IEntityItem, any, DbContext>;
    getPropertyByName(name: string): IFieldInfo {
        const arrProps = this.getProperties().filter((f) => { return f.fieldName === name; });
        if (!arrProps || arrProps.length !== 1) {
            throw new Error(format(ERRS.ERR_ASSERTION_FAILED, "arrProps.length === 1"));
        }
        return arrProps[0];
    }
    getIsHasErrors(): boolean {
        return this.getEntity().getIsHasErrors();
    }
    addOnErrorsChanged(fn: TEventHandler<BaseComplexProperty, any>, nmspace?: string, context?: any): void {
        const self = this;
        this.getEntity().addOnErrorsChanged(function (this: any,_,args) { fn.apply(this, [self, args]); }, nmspace, context);
    }
    offOnErrorsChanged(nmspace?: string): void {
        this.getEntity().offOnErrorsChanged(nmspace);
    }
    getFieldErrors(fieldName: string): IValidationInfo[] {
        const name = this.getFullPath(fieldName);
        return this.getEntity().getFieldErrors(name);
    }
    getAllErrors(): IValidationInfo[] {
        return this.getEntity().getAllErrors();
    }
    getIErrorNotification(): IErrorNotification {
        return this;
    }
}

export class RootComplexProperty extends BaseComplexProperty {
    private _entity: EntityAspect<IEntityItem, any, DbContext>;

    constructor(name: string, owner: EntityAspect<IEntityItem, any, DbContext>) {
        super(name);
        this._entity = owner;
        this._entity._addDisposable(this);
    }
    _addOwnedObject(obj: IBaseObject): void {
        this._entity._addDisposable(obj);
    }
    _getFullPath(path: string): string {
        return this.getName() + "." + path;
    }
    setValue(fullName: string, value: any): void {
        this._entity._setFieldVal(fullName, value);
    }
    getValue(fullName: string): any {
        return this._entity._getFieldVal(fullName);
    }
    getFieldInfo(): IFieldInfo {
        return this._entity.getFieldInfo(this.getName());
    }
    getProperties(): IFieldInfo[] {
        return this.getFieldInfo().nested;
    }
    getEntity(): EntityAspect<IEntityItem, any, DbContext> {
        return this._entity;
    }
    getFullPath(name: string): string {
        return this.getName() + "." + name;
    }
}

export class ChildComplexProperty extends BaseComplexProperty {
    private _parent: BaseComplexProperty;

    constructor(name: string, parent: BaseComplexProperty) {
        super(name);
        this._parent = parent;
        this._parent._addOwnedObject(this);
    }
    _addOwnedObject(obj: IBaseObject): void {
        this._parent._addOwnedObject(obj);
    }
    _getFullPath(path: string): string {
        return this._parent._getFullPath(this.getName() + "." + path);
    }
    setValue(fullName: string, value: any): void {
        this.getEntity()._setFieldVal(fullName, value);
    }
    getValue(fullName: string): any {
        return this.getEntity()._getFieldVal(fullName);
    }
    getFieldInfo(): IFieldInfo {
        const name = this.getName();
        return this._parent.getPropertyByName(name);
    }
    getProperties(): IFieldInfo[] {
        return this.getFieldInfo().nested;
    }
    getParent(): BaseComplexProperty {
        return this._parent;
    }
    getRootProperty(): RootComplexProperty {
        let parent = this._parent;
        while (!!parent && (parent instanceof ChildComplexProperty)) {
            parent = (<ChildComplexProperty>parent).getParent();
        }
        if (!parent || !(parent instanceof RootComplexProperty)) {
            throw new Error(format(ERRS.ERR_ASSERTION_FAILED, "parent instanceof RootComplexProperty"));
        }
        return <RootComplexProperty>parent;
    }
    getFullPath(name: string): string {
        return this._parent._getFullPath(this.getName() + "." + name);
    }
    getEntity(): EntityAspect<IEntityItem, any, DbContext> {
        return this.getRootProperty().getEntity();
    }
}