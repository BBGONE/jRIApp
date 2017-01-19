/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IErrorNotification, IValidationInfo, TEventHandler, BaseObject, LocaleERRS as ERRS, Utils
} from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { IEntityItem } from "./int";
import { EntityAspect } from "./entity_aspect";
import { DbContext } from "./dbcontext";

const utils = Utils, checks = utils.check, strUtils = utils.str;

export class BaseComplexProperty extends BaseObject implements IErrorNotification {
    private _name: string;

    constructor(name: string) {
        super();
        this._name = name;
   }
    _getFullPath(path: string): string {
        throw new Error("Not Implemented");
   }
    getName() {
        return this._name;
   }
    setValue(fullName: string, value: any) {
        throw new Error("Not Implemented");
   }
    getValue(fullName: string): any {
        throw new Error("Not Implemented");
   }
    getFieldInfo(): IFieldInfo {
        throw new Error("Not Implemented");
   }
    getProperties(): IFieldInfo[] {
        throw new Error("Not Implemented");
   }
    getFullPath(name: string): string {
        throw new Error("Not Implemented");
   }
    getEntity(): EntityAspect<IEntityItem, any, DbContext> {
        throw new Error("Not Implemented");
   }
    getPropertyByName(name: string): IFieldInfo {
        let arrProps = this.getProperties().filter((f) => { return f.fieldName === name; });
        if (!arrProps || arrProps.length !== 1)
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "arrProps.length === 1"));
        return arrProps[0];
   }
    getIsHasErrors(): boolean {
        return this.getEntity().getIsHasErrors();
   }
    addOnErrorsChanged(fn: TEventHandler<EntityAspect<IEntityItem, any, DbContext>, any>, nmspace?: string, context?: any): void {
        this.getEntity().addOnErrorsChanged(fn, nmspace, context);
   }
    removeOnErrorsChanged(nmspace?: string): void {
        this.getEntity().removeOnErrorsChanged(nmspace)
   }
    getFieldErrors(fieldName: string): IValidationInfo[] {
        let fullName = this.getFullPath(fieldName);
        return this.getEntity().getFieldErrors(fullName);
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
   }
    _getFullPath(path: string): string {
        return this.getName() + "." + path;
   }
    setValue(fullName: string, value: any) {
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
    getEntity() {
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
   }
    _getFullPath(path: string): string {
        return this._parent._getFullPath(this.getName() + "." + path);
   }
    setValue(fullName: string, value: any) {
        this.getEntity()._setFieldVal(fullName, value);
   }
    getValue(fullName: string) {
        return this.getEntity()._getFieldVal(fullName);
   }
    getFieldInfo(): IFieldInfo {
        let name = this.getName();
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
        if (!parent || !(parent instanceof RootComplexProperty))
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "parent instanceof RootComplexProperty"));
        return <RootComplexProperty>parent;
   }
    getFullPath(name: string): string {
        return this._parent._getFullPath(this.getName() + "." + name);
   }
    getEntity() {
        return this.getRootProperty().getEntity();
   }
}