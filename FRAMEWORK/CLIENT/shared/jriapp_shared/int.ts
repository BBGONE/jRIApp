/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DEBUG_LEVEL } from "./const";
import { IVoidPromise } from "./utils/ideferred";

// config global variable can be used using this interface
export interface IConfig {
    debugLevel?: DEBUG_LEVEL;
}

// get config variable
export const Config: IConfig = (<any>window).jriapp_config || {};
export let DebugLevel = (!Config.debugLevel) ? DEBUG_LEVEL.NONE : Config.debugLevel;

export type TEventHandler<T, U> = (sender: T, args: U) => void;
export type TErrorArgs = { error: any; source: any; isHandled: boolean; };
export type TErrorHandler = (sender: any, args: TErrorArgs) => void;
export type TPropChangedHandler = (sender: any, args: { property: string; }) => void;
export type TFunc = { (...args: any[]): void; };

export interface IDisposable {
    destroy(): void;
}

export interface IIndexer<T> {
    [name: string]: T;
}

export interface IErrorHandler {
    handleError(error: any, source: any): boolean;
}

export interface IPropertyBag extends IBaseObject {
    getProp(name: string): any;
    setProp(name: string, val: any): void;
    isPropertyBag: boolean;
}

export const enum TPriority {
    Normal = 0, AboveNormal = 1, High = 2
}

export interface IBaseObject extends IErrorHandler, IDisposable {
    _isHasProp(prop: string): boolean;
    getIsDestroyed(): boolean;
    getIsDestroyCalled(): boolean;
    raisePropertyChanged(name: string): void;
    addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    removeHandler(name?: string, nmspace?: string): void;
    addOnPropertyChange(prop: string, handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    removeOnPropertyChange(prop?: string, nmspace?: string): void;
    removeNSHandlers(nmspace?: string): void;
    addOnError(handler: TErrorHandler, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    removeOnError(nmspace?: string): void;
    addOnDestroyed(handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    removeOnDestroyed(nmspace?: string): void;
    raiseEvent(name: string, args: any): void;
}

export interface IEditable {
    beginEdit(): boolean;
    endEdit(): boolean;
    cancelEdit(): boolean;
    readonly isEditing: boolean;
}

export interface ISubmittable {
    submitChanges(): IVoidPromise;
    readonly isCanSubmit: boolean;
}

export interface IValidationInfo {
    readonly fieldName: string;
    errors: string[];
}

export interface IErrorNotification {
    getIsHasErrors(): boolean;
    addOnErrorsChanged(fn: TEventHandler<any, any>, nmspace?: string, context?: any): void;
    removeOnErrorsChanged(nmspace?: string): void;
    getFieldErrors(fieldName: string): IValidationInfo[];
    getAllErrors(): IValidationInfo[];
    getIErrorNotification(): IErrorNotification;
}

export interface IWeakMap {
    set(key: any, value: any): IWeakMap;
    get(key: any): any;
    delete(key: any): boolean;
    has(key: any): boolean;
}

export interface WeakMapConstructor {
    new (): IWeakMap;
}