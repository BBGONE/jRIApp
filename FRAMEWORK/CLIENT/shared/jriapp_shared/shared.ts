/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DEBUG_LEVEL, DATA_TYPE, DATE_CONVERSION, FIELD_TYPE, DUMY_ERROR } from "./const";

//config global variable can be used using this interface
export interface IConfig {
    debugLevel?: DEBUG_LEVEL;
}

//get config variable
export const Config: IConfig = (<any>window).jriapp_config || {};
export let DebugLevel = (!Config.debugLevel) ? DEBUG_LEVEL.NONE : Config.debugLevel;

export type TEventHandler<T, U> = (sender: T, args: U) => void;
export type TErrorArgs = { error: any; source: any; isHandled: boolean; };
export type TErrorHandler = (sender: any, args: TErrorArgs) => void;
export type TPropChangedHandler = (sender: any, args: { property: string; }) => void;

export interface IDisposable {
    destroy(): void;
    getIsDestroyed(): boolean;
    getIsDestroyCalled(): boolean;
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
}

export const enum TPriority {
    Normal = 0, AboveNormal = 1, High = 2
}

export interface ITaskQueue {
    enque(task: () => void): void;
}

export interface ILazyInitializer<T> {
    (): T
}

export interface IBaseObject extends IErrorHandler, IDisposable {
    _isHasProp(prop: string): boolean;
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

export interface IAbortable {
    abort(reason?: string): void;
}

export interface ISuccessCB<T, TP> {
    (value: T): TP;
}

export interface IDeferredSuccessCB<T, TP> {
    (value: T): IThenable<TP>;
}

export interface IErrorCB<TP> {
    (err: any): TP;
}

export interface IVoidErrorCB {
    (err: any): void;
}

export interface IDeferredErrorCB<TP> {
    (error: any): IThenable<TP>;
}

export interface IThenable<T> {
    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IDeferredErrorCB<TP>
    ): IThenable<TP>;

    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IErrorCB<TP>
    ): IThenable<TP>;

    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IDeferredErrorCB<TP>
    ): IThenable<TP>;

    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IErrorCB<TP>
    ): IThenable<TP>;
}

export interface IPromise<T> extends IThenable<T> {
    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IVoidErrorCB
    ): IPromise<TP>;
    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IVoidErrorCB
    ): IPromise<TP>;

    always<TP>(errorCB?: IDeferredErrorCB<TP>): IPromise<TP>;
    always<TP>(errorCB?: IErrorCB<TP>): IPromise<TP>;
    always(errorCB?: IVoidErrorCB): IPromise<void>;

    fail(errorCB?: IDeferredErrorCB<T>): IPromise<T>;
    fail(errorCB?: IErrorCB<T>): IPromise<T>;
    fail(errorCB?: IVoidErrorCB): IPromise<void>;
}

export interface IVoidPromise extends IPromise<void> {
}

export interface IDeferred<T> {
    resolve(value?: IThenable<T>): IPromise<T>;
    resolve(value?: T): IPromise<T>;
    reject(error?: any): IPromise<T>;
    promise(): IPromise<T>;
}


export interface IAbortablePromise<T> extends IPromise<T>, IAbortable {
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
    readonly errors: string[];
}

export interface IErrorNotification {
    getIsHasErrors(): boolean;
    addOnErrorsChanged(fn: TEventHandler<any, any>, nmspace?: string, context?: any): void;
    removeOnErrorsChanged(nmspace?: string): void;
    getFieldErrors(fieldName: string): IValidationInfo[];
    getAllErrors(): IValidationInfo[];
    getIErrorNotification(): IErrorNotification;
}

//--Collection interfaces
export interface IFieldInfo {
    fieldName: string;
    isPrimaryKey: number;
    dataType: DATA_TYPE;
    isNullable: boolean;
    isReadOnly: boolean;
    isAutoGenerated: boolean;
    isNeedOriginal: boolean;
    maxLength: number;
    dateConversion: DATE_CONVERSION;
    allowClientDefault: boolean;
    range: string;
    regex: string;
    fieldType: FIELD_TYPE;
    dependentOn: string;
    nested: IFieldInfo[];
    dependents?: string[];
    fullName?: string;
}

export class BaseError {
    private _message: string;

    constructor(message?: string) {
        this._message = message || "Error";
   }
    toString() {
        return this._message;
   }
    get isDummy() {
        return false;
   }
    get message() {
        return this._message;
   }
}

export class DummyError extends BaseError {
    private _origError: any;

    constructor(originalError: any) {
        super(DUMY_ERROR);
        this._origError = originalError;
   }
    get isDummy() {
        return true;
   }
    get origError() {
        return this._origError;
   }
}

export class AbortError extends BaseError {
    private _reason: string;

    constructor(reason?: string) {
        super(DUMY_ERROR);
        this._reason = reason || "Operation Aborted";
   }
    get isDummy() {
        return true;
   }
    get reason() {
        return this._reason;
   }
}

export class AggregateError extends BaseError {
    private _errors: any[];

    constructor(errors?: any[]) {
        super("AggregateError");
        this._errors = errors || [];
   }

    get errors() {
        return this._errors;
   }

    get count() {
        return this._errors.length;
   }

    get message() {
        let hashMap: IIndexer<any> = {};
        this._errors.forEach((err) => {
            if (!err)
                return;
            let str = "";
            if (err instanceof AggregateError) {
                str = (<AggregateError>err).message;
            }
            else if (err instanceof Error) {
                str = (<Error>err).message;
            }
            else if (!!err.message) {
                str = "" + err.message;
            }
            else
                str = "" + err;

            hashMap[str] = "";
        });

        let msg = "", errs = Object.keys(hashMap);

        errs.forEach((err) => {
           if (!!msg) {
                msg += "\r\n";
           }
           msg += "" + err;
       });

        if (!msg)
            msg = "Aggregate Error";
        return msg;
   }

    toString() {
        return "AggregateError: " + "\r\n" + this.message;
   }
}