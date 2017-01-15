declare module "jriapp_shared/const" {
    export enum DEBUG_LEVEL {
        NONE = 0,
        NORMAL = 1,
        HIGH = 2,
    }
    export const APP_NAME: string;
    export const DUMY_ERROR: string;
}
declare module "jriapp_shared/utils/ideferred" {
    export const enum PromiseState {
        Pending = 0,
        ResolutionInProgress = 1,
        Resolved = 2,
        Rejected = 3,
    }
    export interface IPromiseState {
        state(): PromiseState;
    }
    export interface ITaskQueue {
        enque(task: () => void): number;
        cancel(taskId: number): void;
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
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IDeferredErrorCB<TP>): IThenable<TP>;
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IErrorCB<TP>): IThenable<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IDeferredErrorCB<TP>): IThenable<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IErrorCB<TP>): IThenable<TP>;
    }
    export interface IPromise<T> extends IThenable<T> {
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IDeferredErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IVoidErrorCB): IPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IDeferredErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IVoidErrorCB): IPromise<TP>;
        always<TP>(errorCB?: IDeferredErrorCB<TP>): IPromise<TP>;
        always<TP>(errorCB?: IErrorCB<TP>): IPromise<TP>;
        always(errorCB?: IVoidErrorCB): IPromise<void>;
        catch(errorCB?: IDeferredErrorCB<T>): IPromise<T>;
        catch(errorCB?: IErrorCB<T>): IPromise<T>;
        catch(errorCB?: IVoidErrorCB): IPromise<void>;
    }
    export interface IVoidPromise extends IPromise<void> {
    }
    export interface IDeferred<T> {
        resolve(value?: IThenable<T>): IPromise<T>;
        resolve(value?: T): IPromise<T>;
        reject(error?: any): IPromise<T>;
        promise(): IPromise<T>;
    }
    export interface IStatefulPromise<T> extends IPromise<T>, IPromiseState {
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IDeferredErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IVoidErrorCB): IStatefulPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IDeferredErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IVoidErrorCB): IStatefulPromise<TP>;
        always<TP>(errorCB?: IDeferredErrorCB<TP>): IStatefulPromise<TP>;
        always<TP>(errorCB?: IErrorCB<TP>): IStatefulPromise<TP>;
        always(errorCB?: IVoidErrorCB): IStatefulPromise<void>;
        catch(errorCB?: IDeferredErrorCB<T>): IStatefulPromise<T>;
        catch(errorCB?: IErrorCB<T>): IStatefulPromise<T>;
        catch(errorCB?: IVoidErrorCB): IStatefulPromise<void>;
    }
    export interface IAbortablePromise<T> extends IStatefulPromise<T>, IAbortable {
    }
    export interface IStatefulDeferred<T> extends IDeferred<T>, IPromiseState {
        resolve(value?: IThenable<T>): IStatefulPromise<T>;
        resolve(value?: T): IStatefulPromise<T>;
        reject(error?: any): IStatefulPromise<T>;
        promise(): IStatefulPromise<T>;
    }
}
declare module "jriapp_shared/int" {
    import { DEBUG_LEVEL } from "jriapp_shared/const";
    import { IVoidPromise } from "jriapp_shared/utils/ideferred";
    export interface IConfig {
        debugLevel?: DEBUG_LEVEL;
    }
    export const Config: IConfig;
    export let DebugLevel: DEBUG_LEVEL;
    export type TEventHandler<T, U> = (sender: T, args: U) => void;
    export type TErrorArgs = {
        error: any;
        source: any;
        isHandled: boolean;
    };
    export type TErrorHandler = (sender: any, args: TErrorArgs) => void;
    export type TPropChangedHandler = (sender: any, args: {
        property: string;
    }) => void;
    export type TFunc = {
        (...args: any[]): void;
    };
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
        Normal = 0,
        AboveNormal = 1,
        High = 2,
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
}
declare module "jriapp_shared/utils/checks" {
    import { IThenable } from "jriapp_shared/utils/ideferred";
    export class Checks {
        static readonly undefined: any;
        static isHasProp(obj: any, prop: string): boolean;
        static isNull(a: any): a is void;
        static isUndefined(a: any): a is void;
        static isNt(a: any): a is void;
        static isObject(a: any): boolean;
        static isSimpleObject(a: any): boolean;
        static isString(a: any): a is string;
        static isFunc(a: any): a is Function;
        static isBoolean(a: any): a is boolean;
        static isDate(a: any): a is Date;
        static isNumber(a: any): a is Number;
        static isNumeric(a: any): a is Number;
        static isBoolString(a: any): boolean;
        static isGuid<T>(a: any): boolean;
        static isArray<T>(a: any): a is Array<T>;
        static isThenable(a: any): a is IThenable<any>;
    }
}
declare module "jriapp_shared/utils/strUtils" {
    export class StringUtils {
        private static ERR_STRING_FORMAT_INVALID;
        static endsWith(str: string, suffix: string): boolean;
        static startsWith(str: string, prefix: string): boolean;
        static fastTrim(str: string): string;
        static trim(str: string, chars?: string): string;
        static ltrim(str: string, chars?: string): string;
        static rtrim(str: string, chars?: string): string;
        static format(format_str: string, ...args: any[]): string;
        static formatNumber(num: any, decimals?: number, dec_point?: string, thousands_sep?: string): string;
        static stripNonNumeric(str: string): string;
        static padLeft(val: string, len: number, pad: string): string;
        static fastPadLeft(val: string, pad: string): string;
        static trimQuotes(val: string): string;
        static trimBrackets(val: string): string;
    }
}
declare module "jriapp_shared/utils/sysutils" {
    import { ISubmittable, IErrorNotification, IEditable } from "jriapp_shared/int";
    export class SysUtils {
        static isBaseObj: (obj: any) => boolean;
        static isBinding: (obj: any) => boolean;
        static isPropBag: (obj: any) => boolean;
        static isCollection: (obj: any) => boolean;
        static getItemByProp: (obj: any, prop: string) => any;
        static isValidationError: (obj: any) => boolean;
        static isEditable(obj: any): obj is IEditable;
        static isSubmittable(obj: any): obj is ISubmittable;
        static isErrorNotification(obj: any): obj is IErrorNotification;
        static getErrorNotification(obj: any): IErrorNotification;
        static getEditable(obj: any): IEditable;
        static getSubmittable(obj: any): ISubmittable;
        static getPathParts(path: string): string[];
        static getProp(obj: any, prop: string): any;
        static setProp(obj: any, prop: string, val: any): void;
        static resolvePath(obj: any, path: string): any;
    }
}
declare module "jriapp_shared/utils/arrhelper" {
    export interface IArrayLikeList<T> {
        length: number;
        [index: number]: T;
    }
    export class ArrayHelper {
        static clone<T>(arr: T[]): T[];
        static fromList<T extends U, U>(list: IArrayLikeList<U>): T[];
        static fromList<T>(list: IArrayLikeList<any>): T[];
        static fromList<T>(list: IArrayLikeList<T>): T[];
        static merge<T>(arrays: Array<Array<T>>): Array<T>;
        static distinct(arr: string[]): string[];
        static distinct(arr: number[]): number[];
        static remove(array: any[], obj: any): number;
        static removeIndex(array: any[], index: number): boolean;
        static insert(array: any[], obj: any, pos: number): void;
    }
}
declare module "jriapp_shared/utils/coreutils" {
    import { IIndexer } from "jriapp_shared/int";
    import { Checks } from "jriapp_shared/utils/checks";
    export class CoreUtils {
        private static ERR_OBJ_ALREADY_REGISTERED;
        static getNewID(prefix?: string): string;
        static get_timeZoneOffset: () => number;
        static hasProp: typeof Checks.isHasProp;
        static setValue(root: any, namePath: string, val: any, checkOverwrite?: boolean, separator?: string): void;
        static getValue(root: any, namePath: string, separator?: string): any;
        static removeValue(root: any, namePath: string, separator?: string): any;
        static resolveOwner(obj: any, path: string, separator?: string): any;
        static uuid(len?: number, radix?: number): string;
        static parseBool(a: any): boolean;
        static round(num: number, decimals: number): number;
        static clone(obj: any, target?: any): any;
        static merge<S, T>(source: S, target?: T): S | T;
        static extend<T, U>(target: T, ...source: U[]): T | U;
        static memoize<T>(callback: () => T): () => T;
        static forEachProp<T>(obj: IIndexer<T>, fn: (name: string, val?: T) => void): void;
        static assignStrings<T extends U, U extends IIndexer<any>>(target: T, source: U): T;
    }
}
declare module "jriapp_shared/lang" {
    import { IIndexer } from "jriapp_shared/int";
    export function assign<T extends U, U extends IIndexer<any>>(target: T, source: U): T;
    export interface IErrors extends IIndexer<string> {
        ERR_OBJ_ALREADY_REGISTERED: string;
        ERR_APP_NEED_JQUERY: string;
        ERR_ASSERTION_FAILED: string;
        ERR_BINDING_CONTENT_NOT_FOUND: string;
        ERR_DBSET_READONLY: string;
        ERR_DBSET_INVALID_FIELDNAME: string;
        ERR_FIELD_READONLY: string;
        ERR_FIELD_ISNOT_NULLABLE: string;
        ERR_FIELD_WRONG_TYPE: string;
        ERR_FIELD_MAXLEN: string;
        ERR_FIELD_DATATYPE: string;
        ERR_FIELD_REGEX: string;
        ERR_FIELD_RANGE: string;
        ERR_EVENT_INVALID: string;
        ERR_EVENT_INVALID_FUNC: string;
        ERR_MODULE_NOT_REGISTERED: string;
        ERR_MODULE_ALREDY_REGISTERED: string;
        ERR_PROP_NAME_EMPTY: string;
        ERR_PROP_NAME_INVALID: string;
        ERR_GLOBAL_SINGLTON: string;
        ERR_TEMPLATE_ALREADY_REGISTERED: string;
        ERR_TEMPLATE_NOTREGISTERED: string;
        ERR_TEMPLATE_GROUP_NOTREGISTERED: string;
        ERR_TEMPLATE_HAS_NO_ID: string;
        ERR_CONVERTER_NOTREGISTERED: string;
        ERR_JQUERY_DATEPICKER_NOTFOUND: string;
        ERR_PARAM_INVALID: string;
        ERR_PARAM_INVALID_TYPE: string;
        ERR_KEY_IS_EMPTY: string;
        ERR_KEY_IS_NOTFOUND: string;
        ERR_ITEM_IS_ATTACHED: string;
        ERR_ITEM_IS_DETACHED: string;
        ERR_ITEM_IS_NOTFOUND: string;
        ERR_ITEM_NAME_COLLISION: string;
        ERR_DICTKEY_IS_NOTFOUND: string;
        ERR_DICTKEY_IS_EMPTY: string;
        ERR_CONV_INVALID_DATE: string;
        ERR_CONV_INVALID_NUM: string;
        ERR_QUERY_NAME_NOTFOUND: string;
        ERR_QUERY_BETWEEN: string;
        ERR_QUERY_OPERATOR_INVALID: string;
        ERR_OPER_REFRESH_INVALID: string;
        ERR_CALC_FIELD_DEFINE: string;
        ERR_CALC_FIELD_SELF_DEPEND: string;
        ERR_DOMAIN_CONTEXT_INITIALIZED: string;
        ERR_DOMAIN_CONTEXT_NOT_INITIALIZED: string;
        ERR_SVC_METH_PARAM_INVALID: string;
        ERR_DB_LOAD_NO_QUERY: string;
        ERR_DBSET_NAME_INVALID: string;
        ERR_APP_NAME_NOT_UNIQUE: string;
        ERR_ELVIEW_NOT_REGISTERED: string;
        ERR_ELVIEW_NOT_CREATED: string;
        ERR_BIND_TARGET_EMPTY: string;
        ERR_BIND_TGTPATH_INVALID: string;
        ERR_BIND_MODE_INVALID: string;
        ERR_BIND_TARGET_INVALID: string;
        ERR_EXPR_BRACES_INVALID: string;
        ERR_APP_SETUP_INVALID: string;
        ERR_GRID_DATASRC_INVALID: string;
        ERR_COLLECTION_CHANGETYPE_INVALID: string;
        ERR_GRID_COLTYPE_INVALID: string;
        ERR_PAGER_DATASRC_INVALID: string;
        ERR_STACKPNL_DATASRC_INVALID: string;
        ERR_STACKPNL_TEMPLATE_INVALID: string;
        ERR_LISTBOX_DATASRC_INVALID: string;
        ERR_DATAFRM_DCTX_INVALID: string;
        ERR_DCTX_HAS_NO_FIELDINFO: string;
        ERR_TEMPLATE_ID_INVALID: string;
        ERR_ITEM_DELETED_BY_ANOTHER_USER: string;
        ERR_ACCESS_DENIED: string;
        ERR_CONCURRENCY: string;
        ERR_VALIDATION: string;
        ERR_SVC_VALIDATION: string;
        ERR_SVC_ERROR: string;
        ERR_UNEXPECTED_SVC_ERROR: string;
        ERR_ASSOC_NAME_INVALID: string;
        ERR_DATAVIEW_DATASRC_INVALID: string;
        ERR_DATAVIEW_FILTER_INVALID: string;
    }
    export interface IPagerText extends IIndexer<string> {
        firstText: string;
        lastText: string;
        previousText: string;
        nextText: string;
        pageInfo: string;
        firstPageTip: string;
        prevPageTip: string;
        nextPageTip: string;
        lastPageTip: string;
        showingTip: string;
        showTip: string;
    }
    export interface IValidateText extends IIndexer<string> {
        errorInfo: string;
        errorField: string;
    }
    export interface IText extends IIndexer<string> {
        txtEdit: string;
        txtAddNew: string;
        txtDelete: string;
        txtCancel: string;
        txtOk: string;
        txtRefresh: string;
        txtAskDelete: string;
        txtSubmitting: string;
        txtSave: string;
        txtClose: string;
        txtField: string;
    }
    export interface ILocaleText extends IIndexer<any> {
        PAGER: IPagerText;
        VALIDATE: IValidateText;
        TEXT: IText;
    }
    export let ERRS: IErrors;
    export let STRS: ILocaleText;
}
declare module "jriapp_shared/errors" {
    import { IValidationInfo } from "jriapp_shared/int";
    export class BaseError {
        private _message;
        constructor(message?: string);
        toString(): string;
        readonly isDummy: boolean;
        readonly message: string;
    }
    export class DummyError extends BaseError {
        private _origError;
        constructor(originalError: any);
        readonly isDummy: boolean;
        readonly origError: any;
    }
    export class AbortError extends BaseError {
        private _reason;
        constructor(reason?: string);
        readonly isDummy: boolean;
        readonly reason: string;
    }
    export class AggregateError extends BaseError {
        private _errors;
        constructor(errors?: any[]);
        readonly errors: any[];
        readonly count: number;
        readonly message: string;
        toString(): string;
    }
    export class ValidationError extends BaseError {
        private _validations;
        private _item;
        constructor(validations: IValidationInfo[], item: any);
        readonly item: any;
        readonly validations: IValidationInfo[];
    }
}
declare module "jriapp_shared/utils/error" {
    import { IErrorHandler } from "jriapp_shared/int";
    export class ERROR {
        private static _handlers;
        static addHandler(name: string, handler: IErrorHandler): void;
        static removeHandler(name: string): void;
        static handleError(sender: any, error: any, source: any): boolean;
        static throwDummy(err: any): void;
        static checkIsDummy(error: any): boolean;
        static checkIsAbort(error: any): boolean;
        static reThrow(ex: any, isHandled: boolean): void;
        static abort(reason?: string): void;
    }
}
declare module "jriapp_shared/utils/debug" {
    export class DEBUG {
        static checkStartDebugger(): void;
        static isDebugging(): boolean;
    }
}
declare module "jriapp_shared/utils/eventhelper" {
    import { TPriority, IIndexer, IBaseObject, TEventHandler } from "jriapp_shared/int";
    export type TEventNode = {
        context: any;
        fn: TEventHandler<any, any>;
    };
    export type TEventNodeArray = TEventNode[];
    export interface INamespaceMap {
        [ns: string]: TEventNodeArray;
    }
    export interface IEventList {
        [priority: number]: INamespaceMap;
    }
    export class EventHelper {
        static removeNS(ev: IIndexer<IEventList>, ns?: string): void;
        static add(ev: IIndexer<IEventList>, name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        static remove(ev: IIndexer<IEventList>, name?: string, nmspace?: string): void;
        static raise(sender: any, ev: IIndexer<IEventList>, name: string, args: any): void;
        static raiseProp(sender: any, ev: IIndexer<IEventList>, prop: string, args: any): void;
    }
}
declare module "jriapp_shared/object" {
    import { IBaseObject, TPriority, TEventHandler, TErrorHandler, TPropChangedHandler } from "jriapp_shared/int";
    export class BaseObject implements IBaseObject {
        private _obj_state;
        private _events;
        constructor();
        protected _getEventNames(): string[];
        protected _addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        protected _removeHandler(name?: string, nmspace?: string): void;
        protected readonly _isDestroyed: boolean;
        protected _isDestroyCalled: boolean;
        _isHasProp(prop: string): boolean;
        handleError(error: any, source: any): boolean;
        addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeHandler(name?: string, nmspace?: string): void;
        addOnDestroyed(handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnDestroyed(nmspace?: string): void;
        addOnError(handler: TErrorHandler, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnError(nmspace?: string): void;
        removeNSHandlers(nmspace?: string): void;
        raiseEvent(name: string, args: any): void;
        raisePropertyChanged(name: string): void;
        addOnPropertyChange(prop: string, handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnPropertyChange(prop?: string, nmspace?: string): void;
        getIsDestroyed(): boolean;
        getIsDestroyCalled(): boolean;
        destroy(): void;
    }
}
declare module "jriapp_shared/utils/queue" {
    export interface IQueue {
        cancel: (taskId: number) => void;
        enque: (func: () => void) => number;
    }
    export function createQueue(interval?: number): IQueue;
}
declare module "jriapp_shared/utils/deferred" {
    import { IStatefulDeferred, IStatefulPromise, IThenable, ITaskQueue, PromiseState, IPromise, IAbortablePromise, IDeferredErrorCB, IDeferredSuccessCB, IErrorCB, IVoidErrorCB, ISuccessCB, IAbortable } from "jriapp_shared/utils/ideferred";
    import { TFunc } from "jriapp_shared/int";
    export function createDefer<T>(isSync?: boolean): IStatefulDeferred<T>;
    export function createSyncDefer<T>(): IStatefulDeferred<T>;
    export function getTaskQueue(): ITaskQueue;
    export function whenAll<T>(promises: Array<T | IThenable<T>>): IStatefulPromise<T[]>;
    export function race<T>(promises: IPromise<T>[]): IStatefulPromise<T>;
    export type TDispatcher = (closure: TFunc) => void;
    export class Promise<T> implements IStatefulPromise<T> {
        private _deferred;
        constructor(fn: (resolve: (res?: T) => void, reject: (err?: any) => void) => void, dispatcher?: TDispatcher);
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IDeferredErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IVoidErrorCB): IStatefulPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IDeferredErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IVoidErrorCB): IStatefulPromise<TP>;
        catch(errorCB?: IDeferredErrorCB<T>): IStatefulPromise<T>;
        catch(errorCB?: IErrorCB<T>): IStatefulPromise<T>;
        catch(errorCB?: IVoidErrorCB): IStatefulPromise<void>;
        always<TP>(errorCB?: IDeferredErrorCB<TP>): IStatefulPromise<TP>;
        always<TP>(errorCB?: IErrorCB<TP>): IStatefulPromise<TP>;
        always(errorCB?: IVoidErrorCB): IStatefulPromise<void>;
        static all<T>(...promises: Array<T | IThenable<T>>): IStatefulPromise<T[]>;
        static all<T>(promises: Array<T | IThenable<T>>): IStatefulPromise<T[]>;
        static race<T>(...promises: Array<IPromise<T>>): IPromise<T>;
        static race<T>(promises: Array<IPromise<T>>): IPromise<T>;
        static reject<T>(reason?: any, isSync?: boolean): IStatefulPromise<T>;
        static resolve<T>(value?: T, isSync?: boolean): IStatefulPromise<T>;
        state(): PromiseState;
        deferred(): IStatefulDeferred<T>;
    }
    export class AbortablePromise<T> implements IAbortablePromise<T> {
        private _deferred;
        private _abortable;
        private _aborted;
        constructor(deferred: IStatefulDeferred<T>, abortable: IAbortable);
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IDeferredErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: IDeferredSuccessCB<T, TP>, errorCB?: IVoidErrorCB): IStatefulPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IDeferredErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IErrorCB<TP>): IStatefulPromise<TP>;
        then<TP>(successCB?: ISuccessCB<T, TP>, errorCB?: IVoidErrorCB): IStatefulPromise<TP>;
        catch(errorCB?: IDeferredErrorCB<T>): IStatefulPromise<T>;
        catch(errorCB?: IErrorCB<T>): IStatefulPromise<T>;
        catch(errorCB?: IVoidErrorCB): IStatefulPromise<void>;
        always<TP>(errorCB?: IDeferredErrorCB<TP>): IStatefulPromise<TP>;
        always<TP>(errorCB?: IErrorCB<TP>): IStatefulPromise<TP>;
        always(errorCB?: IVoidErrorCB): IStatefulPromise<void>;
        abort(reason?: string): void;
        state(): PromiseState;
    }
}
declare module "jriapp_shared/utils/debounce" {
    import { IDisposable, TFunc } from "jriapp_shared/int";
    export class Debounce implements IDisposable {
        private _timer;
        private _interval;
        private _fn;
        constructor(interval?: number);
        enque(fn: TFunc): void;
        cancel(): void;
        destroy(): void;
        readonly interval: number;
        readonly IsDestroyed: boolean;
    }
}
declare module "jriapp_shared/utils/jsonbag" {
    import { IEditable, IValidationInfo, IErrorNotification, TEventHandler, IPropertyBag } from "jriapp_shared/int";
    import { BaseObject } from "jriapp_shared/object";
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
    export class JsonBag extends BaseObject implements IEditable, IErrorNotification, IPropertyBag {
        private _json;
        private _jsonChanged;
        private _val;
        private _saveVal;
        private _debounce;
        private _errors;
        constructor(json: string, jsonChanged: (json: string) => void);
        destroy(): void;
        protected _getEventNames(): string[];
        _isHasProp(prop: string): boolean;
        addOnValidateBag(fn: TEventHandler<IPropertyBag, IBagValidateArgs<IPropertyBag>>, nmspace?: string, context?: any): void;
        removeOnValidateBag(nmspace?: string): void;
        addOnValidateField(fn: TEventHandler<IPropertyBag, IFieldValidateArgs<IPropertyBag>>, nmspace?: string, context?: any): void;
        removeOnValidateField(nmspace?: string): void;
        addOnErrorsChanged(fn: TEventHandler<JsonBag, any>, nmspace?: string, context?: any): void;
        removeOnErrorsChanged(nmspace?: string): void;
        protected onChanged(): void;
        resetJson(json?: string): void;
        updateJson(): boolean;
        protected _validateBag(): IValidationInfo[];
        protected _validateField(fieldName: string): IValidationInfo;
        protected _onErrorsChanged(): void;
        protected _addErrors(errors: IValidationInfo[]): void;
        protected _addError(fieldName: string, errors: string[], ignoreChangeErrors?: boolean): void;
        protected _removeError(fieldName: string, ignoreChangeErrors?: boolean): boolean;
        protected _removeAllErrors(): void;
        getIsHasErrors(): boolean;
        getFieldErrors(fieldName: string): IValidationInfo[];
        getAllErrors(): IValidationInfo[];
        getIErrorNotification(): IErrorNotification;
        beginEdit(): boolean;
        endEdit(): boolean;
        cancelEdit(): boolean;
        readonly isEditing: boolean;
        getProp(name: string): any;
        setProp(name: string, val: any): void;
        readonly isPropertyBag: boolean;
        readonly val: any;
        readonly json: string;
        toString(): string;
    }
}
declare module "jriapp_shared/collection/const" {
    export const enum DATE_CONVERSION {
        None = 0,
        ServerLocalToClientLocal = 1,
        UtcToClientLocal = 2,
    }
    export const enum DATA_TYPE {
        None = 0,
        String = 1,
        Bool = 2,
        Integer = 3,
        Decimal = 4,
        Float = 5,
        DateTime = 6,
        Date = 7,
        Time = 8,
        Guid = 9,
        Binary = 10,
    }
    export const enum FIELD_TYPE {
        None = 0,
        ClientOnly = 1,
        Calculated = 2,
        Navigation = 3,
        RowTimeStamp = 4,
        Object = 5,
        ServerCalculated = 6,
    }
    export const enum SORT_ORDER {
        ASC = 0,
        DESC = 1,
    }
    export const enum FILTER_TYPE {
        Equals = 0,
        Between = 1,
        StartsWith = 2,
        EndsWith = 3,
        Contains = 4,
        Gt = 5,
        Lt = 6,
        GtEq = 7,
        LtEq = 8,
        NotEq = 9,
    }
    export const enum COLL_CHANGE_TYPE {
        Remove = 0,
        Add = 1,
        Reset = 2,
        Remap = 3,
    }
    export const enum COLL_CHANGE_REASON {
        None = 0,
        PageChange = 1,
        Sorting = 2,
    }
    export const enum COLL_CHANGE_OPER {
        None = 0,
        Fill = 1,
        Attach = 2,
        Remove = 3,
        Commit = 4,
        Sort = 5,
    }
    export const enum ITEM_STATUS {
        None = 0,
        Added = 1,
        Updated = 2,
        Deleted = 3,
    }
}
declare module "jriapp_shared/collection/int" {
    import { DATE_CONVERSION, DATA_TYPE, SORT_ORDER, FIELD_TYPE, COLL_CHANGE_OPER, COLL_CHANGE_REASON, COLL_CHANGE_TYPE, ITEM_STATUS } from "jriapp_shared/collection/const";
    import { IPromise } from "jriapp_shared/utils/ideferred";
    import { IBaseObject, IErrorNotification, IEditable, ISubmittable, TEventHandler, TPropChangedHandler, IValidationInfo, TPriority } from "jriapp_shared/int";
    export const PROP_NAME: {
        isEditing: string;
        currentItem: string;
        count: string;
        totalCount: string;
        pageCount: string;
        pageSize: string;
        pageIndex: string;
        isUpdating: string;
        isLoading: string;
        isRefreshing: string;
    };
    export const ITEM_EVENTS: {
        errors_changed: string;
        destroyed: string;
    };
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
    export interface ICollectionOptions {
        enablePaging: boolean;
        pageSize: number;
    }
    export interface IPermissions {
        canAddRow: boolean;
        canEditRow: boolean;
        canDeleteRow: boolean;
        canRefreshRow: boolean;
    }
    export interface IItemAspect<TItem extends ICollectionItem> extends IBaseObject, IErrorNotification, IEditable, ISubmittable {
        getFieldInfo(fieldName: string): IFieldInfo;
        getFieldNames(): string[];
        getErrorString(): string;
        deleteItem(): boolean;
        _onAttaching(): void;
        _onAttach(): void;
        _setItem(v: TItem): void;
        _setKey(v: string): void;
        _setIsAttached(v: boolean): void;
        _setIsCached(v: boolean): void;
        raiseErrorsChanged(): void;
        readonly obj: any;
        readonly item: TItem;
        readonly key: string;
        readonly collection: ICollection<TItem>;
        readonly status: ITEM_STATUS;
        readonly isUpdating: boolean;
        readonly isEditing: boolean;
        readonly isCanSubmit: boolean;
        readonly isHasChanges: boolean;
        readonly isNew: boolean;
        readonly isDeleted: boolean;
        readonly isEdited: boolean;
        readonly isCached: boolean;
        readonly isDetached: boolean;
    }
    export interface ICollectionItem extends IBaseObject {
        readonly _aspect: IItemAspect<ICollectionItem>;
        readonly _key: string;
    }
    export interface ICollChangedArgs<TItem extends ICollectionItem> {
        changeType: COLL_CHANGE_TYPE;
        reason: COLL_CHANGE_REASON;
        oper: COLL_CHANGE_OPER;
        items: TItem[];
        pos?: number[];
        old_key?: string;
        new_key?: string;
    }
    export interface ICollFillArgs<TItem extends ICollectionItem> {
        reason: COLL_CHANGE_REASON;
        items: TItem[];
        newItems: TItem[];
    }
    export interface ICollValidateFieldArgs<TItem extends ICollectionItem> {
        readonly item: TItem;
        readonly fieldName: string;
        errors: string[];
    }
    export interface ICollValidateItemArgs<TItem extends ICollectionItem> {
        readonly item: TItem;
        result: IValidationInfo[];
    }
    export interface ICollItemStatusArgs<TItem extends ICollectionItem> {
        item: TItem;
        oldStatus: ITEM_STATUS;
        key: string;
    }
    export interface ICollItemAddedArgs<TItem extends ICollectionItem> {
        item: TItem;
        isAddNewHandled: boolean;
    }
    export interface ICommitChangesArgs<TItem extends ICollectionItem> {
        item: TItem;
        isBegin: boolean;
        isRejected: boolean;
        status: ITEM_STATUS;
    }
    export interface ICollItemArgs<TItem extends ICollectionItem> {
        item: TItem;
    }
    export interface IPageChangingArgs {
        page: number;
        isCancel: boolean;
    }
    export interface ICancellableArgs<TItem extends ICollectionItem> {
        item: TItem;
        isCancel: boolean;
    }
    export interface IItemAddedArgs<TItem extends ICollectionItem> {
        item: TItem;
        isAddNewHandled: boolean;
    }
    export interface ICollEndEditArgs<TItem extends ICollectionItem> {
        item: TItem;
        isCanceled: boolean;
    }
    export interface ICurrentChangingArgs<TItem extends ICollectionItem> {
        newCurrent: TItem;
    }
    export interface ICollectionEvents<TItem extends ICollectionItem> {
        addOnClearing(fn: TEventHandler<ICollection<TItem>, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnClearing(nmspace?: string): void;
        addOnCleared(fn: TEventHandler<ICollection<TItem>, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnCleared(nmspace?: string): void;
        addOnCollChanged(fn: TEventHandler<ICollection<TItem>, ICollChangedArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnCollChanged(nmspace?: string): void;
        addOnFill(fn: TEventHandler<ICollection<TItem>, ICollFillArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnFill(nmspace?: string): void;
        addOnValidateField(fn: TEventHandler<ICollection<TItem>, ICollValidateFieldArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnValidateField(nmspace?: string): void;
        addOnItemDeleting(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnItemDeleting(nmspace?: string): void;
        addOnItemAdding(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnItemAdding(nmspace?: string): void;
        addOnItemAdded(fn: TEventHandler<ICollection<TItem>, IItemAddedArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnItemAdded(nmspace?: string): void;
        addOnCurrentChanging(fn: TEventHandler<ICollection<TItem>, ICurrentChangingArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnCurrentChanging(nmspace?: string): void;
        addOnPageChanging(fn: TEventHandler<ICollection<TItem>, IPageChangingArgs>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnPageChanging(nmspace?: string): void;
        addOnErrorsChanged(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnErrorsChanged(nmspace?: string): void;
        addOnBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnBeginEdit(nmspace?: string): void;
        addOnEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnEndEdit(nmspace?: string): void;
        addOnCommitChanges(fn: TEventHandler<ICollection<TItem>, ICommitChangesArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnCommitChanges(nmspace?: string): void;
        addOnStatusChanged(fn: TEventHandler<ICollection<TItem>, ICollItemStatusArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnStatusChanged(nmspace?: string): void;
        addOnPageIndexChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
        addOnPageSizeChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
        addOnTotalCountChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
        addOnCurrentChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
    }
    export interface IEditableCollection<TItem extends ICollectionItem> {
        removeItem(item: TItem): void;
        cancelEdit(): void;
        endEdit(): void;
        addNew(): TItem;
        isEditing: boolean;
        isUpdating: boolean;
        permissions: IPermissions;
    }
    export interface ISimpleCollection<TItem extends ICollectionItem> extends IBaseObject {
        getFieldInfo(fieldName: string): IFieldInfo;
        getFieldNames(): string[];
        getFieldInfos(): IFieldInfo[];
        getItemByPos(pos: number): TItem;
        getItemByKey(key: string): TItem;
        findByPK(...vals: any[]): TItem;
        moveFirst(skipDeleted?: boolean): boolean;
        movePrev(skipDeleted?: boolean): boolean;
        moveNext(skipDeleted?: boolean): boolean;
        moveLast(skipDeleted?: boolean): boolean;
        goTo(pos: number): boolean;
        forEach(callback: (item: TItem) => void, thisObj?: any): void;
        sort(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any>;
        sortLocal(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any>;
        clear(): void;
        items: TItem[];
        currentItem: TItem;
        count: number;
        totalCount: number;
        pageSize: number;
        pageIndex: number;
        pageCount: number;
        isPagingEnabled: boolean;
        isLoading: boolean;
    }
    export interface ICollection<TItem extends ICollectionItem> extends ISimpleCollection<TItem>, IEditableCollection<TItem>, ICollectionEvents<TItem> {
        readonly options: ICollectionOptions;
        readonly uniqueID: string;
    }
    export interface IValueUtils {
        valueToDate(val: string, dtcnv: DATE_CONVERSION, serverTZ: number): Date;
        dateToValue(dt: Date, dtcnv: DATE_CONVERSION, serverTZ: number): string;
        compareVals(v1: any, v2: any, dataType: DATA_TYPE): boolean;
        stringifyValue(v: any, dtcnv: DATE_CONVERSION, dataType: DATA_TYPE, serverTZ: number): string;
        parseValue(v: string, dataType: DATA_TYPE, dtcnv: DATE_CONVERSION, serverTZ: number): any;
    }
    export interface IPropInfo {
        name: string;
        dtype: number;
    }
    export interface IErrors {
        [fieldName: string]: string[];
    }
    export interface IErrorsList {
        [item_key: string]: IErrors;
    }
    export interface IInternalCollMethods<TItem extends ICollectionItem> {
        getEditingItem(): TItem;
        getStrValue(val: any, fieldInfo: IFieldInfo): string;
        onBeforeEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void;
        onEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void;
        onCommitChanges(item: TItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void;
        onItemDeleting(args: ICancellableArgs<TItem>): boolean;
        onErrorsChanged(args: ICollItemArgs<TItem>): void;
        validateItemField(args: ICollValidateFieldArgs<TItem>): IValidationInfo;
        validateItem(args: ICollValidateItemArgs<TItem>): IValidationInfo[];
    }
}
declare module "jriapp_shared/utils/logger" {
    export class LOGGER {
        static log(str: string): void;
        static warn(str: string): void;
        static error(str: string): void;
    }
}
declare module "jriapp_shared/utils/async" {
    import { IThenable, ITaskQueue, IStatefulDeferred, IStatefulPromise, IPromise } from "jriapp_shared/utils/ideferred";
    export class AsyncUtils {
        static createDeferred<T>(isSync?: boolean): IStatefulDeferred<T>;
        static reject<T>(reason?: any, isSync?: boolean): IStatefulPromise<T>;
        static resolve<T>(value?: T, isSync?: boolean): IStatefulPromise<T>;
        static whenAll<T>(args: Array<T | IThenable<T>>): IStatefulPromise<T[]>;
        static race<T>(promises: Array<IPromise<T>>): IPromise<T>;
        static getTaskQueue(): ITaskQueue;
        static delay<T>(func: () => T, time?: number): IStatefulPromise<T>;
        static parseJSON(res: string | any): IStatefulPromise<any>;
    }
}
declare module "jriapp_shared/utils/http" {
    import { IAbortablePromise } from "jriapp_shared/utils/ideferred";
    import { IIndexer } from "jriapp_shared/int";
    export class HttpUtils {
        static isStatusOK(status: string | number): boolean;
        private static _getXMLRequest(url, method, deferred, headers?);
        static postAjax(url: string, postData: string, headers?: IIndexer<string>): IAbortablePromise<string>;
        static getAjax(url: string, headers?: IIndexer<string>): IAbortablePromise<string>;
        static defaultHeaders: IIndexer<string>;
        static ajaxTimeOut: number;
    }
}
declare module "jriapp_shared/utils/utils" {
    import { CoreUtils } from "jriapp_shared/utils/coreutils";
    import { DEBUG } from "jriapp_shared/utils/debug";
    import { ERROR } from "jriapp_shared/utils/error";
    import { LOGGER } from "jriapp_shared/utils/logger";
    import { SysUtils } from "jriapp_shared/utils/sysutils";
    import { AsyncUtils } from "jriapp_shared/utils/async";
    import { HttpUtils } from "jriapp_shared/utils/http";
    import { StringUtils } from "jriapp_shared/utils/strUtils";
    import { Checks } from "jriapp_shared/utils/checks";
    import { ArrayHelper } from "jriapp_shared/utils/arrhelper";
    import { ITaskQueue } from "jriapp_shared/utils/ideferred";
    export class Utils {
        static readonly check: typeof Checks;
        static readonly str: typeof StringUtils;
        static readonly arr: typeof ArrayHelper;
        static readonly http: typeof HttpUtils;
        static readonly core: typeof CoreUtils;
        static readonly defer: typeof AsyncUtils;
        static readonly err: typeof ERROR;
        static readonly log: typeof LOGGER;
        static readonly debug: typeof DEBUG;
        static readonly sys: typeof SysUtils;
        static readonly queue: ITaskQueue;
    }
}
declare module "jriapp_shared/utils/waitqueue" {
    import { IBaseObject } from "jriapp_shared/int";
    import { BaseObject } from "jriapp_shared/object";
    export interface IWaitQueueItem {
        prop: string;
        groupName?: string;
        predicate: (val: any) => boolean;
        action: (...args: any[]) => void;
        actionArgs?: any[];
        lastWins?: boolean;
    }
    export class WaitQueue extends BaseObject {
        private _objId;
        private _owner;
        private _queue;
        constructor(owner: IBaseObject);
        protected _checkQueue(prop: string, value: any): void;
        enQueue(item: IWaitQueueItem): void;
        destroy(): void;
        toString(): string;
        readonly uniqueID: string;
        readonly owner: IBaseObject;
    }
}
declare module "jriapp_shared/collection/utils" {
    import { IFieldInfo } from "jriapp_shared/collection/int";
    import { IValueUtils } from "jriapp_shared/collection/int";
    export const ValueUtils: IValueUtils;
    export type TraveseFieldCB<T> = (fld: IFieldInfo, name: string, parent_res?: T) => T;
    export const CollUtils: {
        getObjectField: (name: string, flds: IFieldInfo[]) => IFieldInfo;
        traverseField: <T>(fld: IFieldInfo, fn: TraveseFieldCB<T>, parent_res?: T) => void;
        traverseFields: <T>(flds: IFieldInfo[], fn: TraveseFieldCB<T>, parent_res?: T) => void;
        getPKFields(fieldInfos: IFieldInfo[]): IFieldInfo[];
        initVals: (flds: IFieldInfo[], vals: any) => any;
        copyVals: (flds: IFieldInfo[], from: any, to: any) => any;
        objToVals: (flds: IFieldInfo[], obj: any) => any;
        cloneVals: (flds: IFieldInfo[], vals: any) => any;
    };
}
declare module "jriapp_shared/collection/base" {
    import { SORT_ORDER, ITEM_STATUS, COLL_CHANGE_REASON, COLL_CHANGE_OPER } from "jriapp_shared/collection/const";
    import { IFieldInfo } from "jriapp_shared/collection/int";
    import { IPromise } from "jriapp_shared/utils/ideferred";
    import { IIndexer, IValidationInfo, TEventHandler, TPropChangedHandler, IBaseObject, TPriority } from "jriapp_shared/int";
    import { BaseObject } from "jriapp_shared/object";
    import { WaitQueue } from "jriapp_shared/utils/waitqueue";
    import { ICollectionItem, ICollection, ICollectionOptions, IPermissions, IInternalCollMethods, ICollChangedArgs, ICancellableArgs, ICollFillArgs, ICollEndEditArgs, ICollItemArgs, ICollItemStatusArgs, ICollValidateFieldArgs, ICollValidateItemArgs, ICurrentChangingArgs, ICommitChangesArgs, IItemAddedArgs, IPageChangingArgs, IErrors } from "jriapp_shared/collection/int";
    export class Errors<TItem extends ICollectionItem> {
        private _errors;
        private _owner;
        constructor(owner: BaseCollection<TItem>);
        clear(): void;
        validateItem(item: TItem): IValidationInfo[];
        validateItemField(item: TItem, fieldName: string): IValidationInfo;
        addErrors(item: TItem, errors: IValidationInfo[]): void;
        addError(item: TItem, fieldName: string, errors: string[], ignoreChangeErrors?: boolean): void;
        removeError(item: TItem, fieldName: string, ignoreChangeErrors?: boolean): void;
        removeAllErrors(item: TItem): void;
        getErrors(item: TItem): IErrors;
        onErrorsChanged(item: TItem): void;
        getItemsWithErrors(): TItem[];
    }
    export class BaseCollection<TItem extends ICollectionItem> extends BaseObject implements ICollection<TItem> {
        private _objId;
        protected _options: ICollectionOptions;
        protected _isLoading: boolean;
        protected _EditingItem: TItem;
        protected _perms: IPermissions;
        protected _totalCount: number;
        protected _pageIndex: number;
        protected _items: TItem[];
        protected _itemsByKey: IIndexer<TItem>;
        protected _currentPos: number;
        protected _newKey: number;
        protected _fieldMap: IIndexer<IFieldInfo>;
        protected _fieldInfos: IFieldInfo[];
        protected _errors: Errors<TItem>;
        protected _pkInfo: IFieldInfo[];
        protected _isUpdating: boolean;
        protected _waitQueue: WaitQueue;
        protected _internal: IInternalCollMethods<TItem>;
        constructor();
        static getEmptyFieldInfo(fieldName: string): IFieldInfo;
        protected _getEventNames(): string[];
        addOnClearing(fn: TEventHandler<ICollection<TItem>, {
            reason: COLL_CHANGE_REASON;
        }>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnClearing(nmspace?: string): void;
        addOnCleared(fn: TEventHandler<ICollection<TItem>, {
            reason: COLL_CHANGE_REASON;
        }>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnCleared(nmspace?: string): void;
        addOnCollChanged(fn: TEventHandler<ICollection<TItem>, ICollChangedArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnCollChanged(nmspace?: string): void;
        addOnFill(fn: TEventHandler<ICollection<TItem>, ICollFillArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnFill(nmspace?: string): void;
        addOnValidateField(fn: TEventHandler<ICollection<TItem>, ICollValidateFieldArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnValidateField(nmspace?: string): void;
        addOnValidateItem(fn: TEventHandler<ICollection<TItem>, ICollValidateItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnValidateItem(nmspace?: string): void;
        addOnItemDeleting(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnItemDeleting(nmspace?: string): void;
        addOnItemAdding(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnItemAdding(nmspace?: string): void;
        addOnItemAdded(fn: TEventHandler<ICollection<TItem>, IItemAddedArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnItemAdded(nmspace?: string): void;
        addOnCurrentChanging(fn: TEventHandler<ICollection<TItem>, ICurrentChangingArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnCurrentChanging(nmspace?: string): void;
        addOnPageChanging(fn: TEventHandler<ICollection<TItem>, IPageChangingArgs>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnPageChanging(nmspace?: string): void;
        addOnErrorsChanged(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnErrorsChanged(nmspace?: string): void;
        addOnBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnBeginEdit(nmspace?: string): void;
        addOnEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnEndEdit(nmspace?: string): void;
        addOnBeforeBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnBeforeBeginEdit(nmspace?: string): void;
        addOnBeforeEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeBeforeOnEndEdit(nmspace?: string): void;
        addOnCommitChanges(fn: TEventHandler<ICollection<TItem>, ICommitChangesArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnCommitChanges(nmspace?: string): void;
        addOnStatusChanged(fn: TEventHandler<ICollection<TItem>, ICollItemStatusArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        removeOnStatusChanged(nmspace?: string): void;
        addOnPageIndexChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
        addOnPageSizeChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
        addOnTotalCountChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
        addOnCurrentChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
        protected _getPKFieldInfos(): IFieldInfo[];
        protected _checkCurrentChanging(newCurrent: TItem): void;
        protected _onCurrentChanging(newCurrent: TItem): void;
        protected _onCurrentChanged(): void;
        protected _onCountChanged(): void;
        protected _onEditingChanged(): void;
        protected _onItemStatusChanged(item: TItem, oldStatus: ITEM_STATUS): void;
        protected _onCollectionChanged(args: ICollChangedArgs<TItem>): void;
        protected _onFillEnd(args: ICollFillArgs<TItem>): void;
        protected _onItemAdding(item: TItem): void;
        protected _onItemAdded(item: TItem): void;
        protected _createNew(): TItem;
        protected _attach(item: TItem, itemPos?: number): number;
        protected _onRemoved(item: TItem, pos: number): void;
        protected _onPageSizeChanged(): void;
        protected _onPageChanging(): boolean;
        protected _onPageChanged(): void;
        protected _setCurrentItem(v: TItem): void;
        protected _clearItems(items: TItem[]): void;
        _isHasProp(prop: string): boolean;
        protected _getEditingItem(): TItem;
        protected _getStrValue(val: any, fieldInfo: IFieldInfo): string;
        protected _onBeforeEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void;
        protected _onEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void;
        protected _onCommitChanges(item: TItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void;
        protected _validateItem(item: TItem): IValidationInfo[];
        protected _validateItemField(item: TItem, fieldName: string): IValidationInfo;
        protected _onItemDeleting(args: ICancellableArgs<TItem>): boolean;
        protected _clear(reason: COLL_CHANGE_REASON, oper: COLL_CHANGE_OPER): void;
        _setIsLoading(v: boolean): void;
        _getInternal(): IInternalCollMethods<TItem>;
        _getSortFn(fieldNames: string[], sortOrder: SORT_ORDER): (a: any, b: any) => number;
        getFieldInfo(fieldName: string): IFieldInfo;
        getFieldNames(): string[];
        getFieldInfos(): IFieldInfo[];
        cancelEdit(): void;
        endEdit(): void;
        getItemsWithErrors(): TItem[];
        addNew(): TItem;
        getItemByPos(pos: number): TItem;
        getItemByKey(key: string): TItem;
        findByPK(...vals: any[]): TItem;
        moveFirst(skipDeleted?: boolean): boolean;
        movePrev(skipDeleted?: boolean): boolean;
        moveNext(skipDeleted?: boolean): boolean;
        moveLast(skipDeleted?: boolean): boolean;
        goTo(pos: number): boolean;
        forEach(callback: (item: TItem) => void, thisObj?: any): void;
        removeItem(item: TItem): void;
        sort(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any>;
        sortLocal(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any>;
        clear(): void;
        destroy(): void;
        waitForNotLoading(callback: () => void, groupName: string): void;
        toString(): string;
        readonly errors: Errors<TItem>;
        readonly options: ICollectionOptions;
        readonly items: TItem[];
        currentItem: TItem;
        readonly count: number;
        totalCount: number;
        pageSize: number;
        pageIndex: number;
        readonly pageCount: number;
        readonly isPagingEnabled: boolean;
        readonly isEditing: boolean;
        readonly isLoading: boolean;
        isUpdating: boolean;
        readonly permissions: IPermissions;
        readonly uniqueID: string;
    }
}
declare module "jriapp_shared/collection/validation" {
    import { IFieldInfo } from "jriapp_shared/collection/int";
    import { IValidationInfo } from "jriapp_shared/int";
    export class Validations {
        private static _dtRangeToDate(str);
        private static checkNumRange(num, range);
        private static checkDateRange(dt, range);
        static checkField(fieldInfo: IFieldInfo, value: any, isNew: boolean): string[];
        static distinct(vals: IValidationInfo[]): IValidationInfo[];
    }
}
declare module "jriapp_shared/collection/aspect" {
    import { ITEM_STATUS } from "jriapp_shared/collection/const";
    import { IFieldInfo } from "jriapp_shared/collection/int";
    import { IVoidPromise } from "jriapp_shared/utils/ideferred";
    import { IIndexer, IValidationInfo, TEventHandler, IErrorNotification } from "jriapp_shared/int";
    import { BaseObject } from "jriapp_shared/object";
    import { ICollectionItem, IItemAspect } from "jriapp_shared/collection/int";
    import { BaseCollection } from "jriapp_shared/collection/base";
    export class ItemAspect<TItem extends ICollectionItem> extends BaseObject implements IItemAspect<TItem> {
        private _key;
        private _item;
        private _collection;
        protected _status: ITEM_STATUS;
        protected _saveVals: IIndexer<any>;
        protected _vals: IIndexer<any>;
        private _flags;
        private _valueBag;
        constructor(collection: BaseCollection<TItem>);
        protected _getEventNames(): string[];
        protected _onErrorsChanged(): void;
        protected _setIsEdited(v: boolean): void;
        protected _beginEdit(): boolean;
        protected _endEdit(): boolean;
        protected _cancelEdit(): boolean;
        protected _skipValidate(fieldInfo: IFieldInfo, val: any): boolean;
        protected _validateItem(): IValidationInfo[];
        protected _validateField(fieldName: string): IValidationInfo;
        protected _validateFields(): IValidationInfo[];
        protected _resetStatus(): void;
        protected _fakeDestroy(): void;
        private _delCustomVal(entry);
        handleError(error: any, source: any): boolean;
        _setItem(v: TItem): void;
        _setKey(v: string): void;
        _setIsAttached(v: boolean): void;
        _setIsCached(v: boolean): void;
        _setIsRefreshing(v: boolean): void;
        _onAttaching(): void;
        _onAttach(): void;
        raiseErrorsChanged(): void;
        getFieldInfo(fieldName: string): IFieldInfo;
        getFieldNames(): string[];
        getErrorString(): string;
        submitChanges(): IVoidPromise;
        rejectChanges(): void;
        beginEdit(): boolean;
        endEdit(): boolean;
        cancelEdit(): boolean;
        deleteItem(): boolean;
        getIsHasErrors(): boolean;
        addOnErrorsChanged(fn: TEventHandler<ItemAspect<TItem>, any>, nmspace?: string, context?: any): void;
        removeOnErrorsChanged(nmspace?: string): void;
        getFieldErrors(fieldName: string): IValidationInfo[];
        getAllErrors(): IValidationInfo[];
        getIErrorNotification(): IErrorNotification;
        setCustomVal(name: string, val: any, isOwnVal?: boolean): void;
        getCustomVal(name: string): any;
        destroy(): void;
        toString(): string;
        readonly obj: any;
        readonly item: TItem;
        readonly key: string;
        readonly collection: BaseCollection<TItem>;
        readonly status: ITEM_STATUS;
        readonly isUpdating: boolean;
        readonly isEditing: boolean;
        readonly isCanSubmit: boolean;
        readonly isHasChanges: boolean;
        readonly isNew: boolean;
        readonly isDeleted: boolean;
        readonly isEdited: boolean;
        readonly isCached: boolean;
        readonly isDetached: boolean;
        readonly isRefreshing: boolean;
    }
}
declare module "jriapp_shared/collection/item" {
    import { BaseObject } from "jriapp_shared/object";
    import { ICollectionItem } from "jriapp_shared/collection/int";
    import { ItemAspect } from "jriapp_shared/collection/aspect";
    export class CollectionItem<TAspect extends ItemAspect<ICollectionItem>> extends BaseObject implements ICollectionItem {
        private __aspect;
        constructor(aspect: TAspect);
        protected _fakeDestroy(): void;
        readonly _aspect: TAspect;
        readonly _key: string;
        destroy(): void;
        toString(): string;
    }
}
declare module "jriapp_shared/collection/list" {
    import { ICollectionItem, IPropInfo } from "jriapp_shared/collection/int";
    import { BaseCollection } from "jriapp_shared/collection/base";
    import { ItemAspect } from "jriapp_shared/collection/aspect";
    export interface IListItem extends ICollectionItem {
        readonly _aspect: ListItemAspect<IListItem, any>;
    }
    export interface IListItemAspectConstructor<TItem extends IListItem, TObj> {
        new (coll: BaseList<TItem, TObj>, obj?: TObj): ListItemAspect<TItem, TObj>;
    }
    export interface IListItemConstructor<TItem extends IListItem, TObj> {
        new (aspect: ListItemAspect<TItem, TObj>): TItem;
    }
    export class ListItemAspect<TItem extends IListItem, TObj> extends ItemAspect<TItem> {
        constructor(coll: BaseList<TItem, TObj>, vals: TObj, key: string, isNew: boolean);
        _setProp(name: string, val: any): void;
        _getProp(name: string): any;
        _resetStatus(): void;
        toString(): string;
        readonly list: BaseList<TItem, TObj>;
    }
    export class BaseList<TItem extends IListItem, TObj> extends BaseCollection<TItem> {
        private _itemType;
        constructor(itemType: IListItemConstructor<TItem, TObj>, props: IPropInfo[]);
        private _updateFieldMap(props);
        protected _attach(item: TItem): number;
        protected _createNew(): TItem;
        protected createItem(obj?: TObj): TItem;
        protected _getNewKey(): string;
        destroy(): void;
        fillItems(objArray: TObj[], clearAll?: boolean): void;
        getNewItems(): TItem[];
        resetStatus(): void;
        toArray(): TObj[];
        toString(): string;
        readonly itemType: IListItemConstructor<TItem, TObj>;
    }
}
declare module "jriapp_shared/utils/anylist" {
    import { IPropertyBag, IValidationInfo } from "jriapp_shared/int";
    import { CollectionItem } from "jriapp_shared/collection/item";
    import { IListItem, ListItemAspect, BaseList } from "jriapp_shared/collection/list";
    export { ICollValidateFieldArgs } from "jriapp_shared/collection/int";
    export interface IAnyVal {
        val: any;
    }
    export class AnyItemAspect extends ListItemAspect<AnyValListItem, IAnyVal> {
        _validateField(name: string): IValidationInfo;
        protected _validateFields(): IValidationInfo[];
        _setProp(name: string, val: any): void;
        _getProp(name: string): any;
    }
    export class AnyValListItem extends CollectionItem<AnyItemAspect> implements IListItem, IPropertyBag, IAnyVal {
        val: any;
        _isHasProp(prop: string): boolean;
        getProp(name: string): any;
        setProp(name: string, val: any): void;
        readonly isPropertyBag: boolean;
        readonly list: AnyList;
        toString(): string;
    }
    export class AnyList extends BaseList<AnyValListItem, IAnyVal> {
        private _onChanged;
        private _saveVal;
        private _debounce;
        constructor(onChanged: (arr: any[]) => void);
        destroy(): void;
        protected createItem(obj?: IAnyVal): AnyValListItem;
        protected onChanged(): void;
        setValues(values: any[]): void;
        toString(): string;
    }
}
declare module "jriapp_shared/utils/jsonarray" {
    import { IValidationInfo, TEventHandler, IPropertyBag } from "jriapp_shared/int";
    import { BaseObject } from "jriapp_shared/object";
    import { JsonBag, IFieldValidateArgs, IBagValidateArgs } from "jriapp_shared/utils/jsonbag";
    import { AnyList, AnyValListItem } from "jriapp_shared/utils/anylist";
    export class JsonArray extends BaseObject {
        private _owner;
        private _pathToArray;
        private _list;
        private _objId;
        constructor(owner: JsonBag, pathToArray: string);
        destroy(): void;
        protected _getEventNames(): string[];
        protected updateArray(arr: any[]): void;
        addOnValidateBag(fn: TEventHandler<IPropertyBag, IBagValidateArgs<IPropertyBag>>, nmspace?: string, context?: any): void;
        removeOnValidateBag(nmspace?: string): void;
        addOnValidateField(fn: TEventHandler<IPropertyBag, IFieldValidateArgs<IPropertyBag>>, nmspace?: string, context?: any): void;
        removeOnValidateField(nmspace?: string): void;
        protected _validateBag(bag: AnyValListItem): IValidationInfo[];
        protected _validateField(bag: AnyValListItem, fieldName: string): IValidationInfo;
        getArray(): any[];
        readonly pathToArray: string;
        readonly owner: JsonBag;
        readonly list: AnyList;
    }
}
declare module "jriapp_shared/utils/weakmap" {
    import { IWeakMap } from "jriapp_shared/int";
    export function createWeakMap(): IWeakMap;
}
declare module "jriapp_shared/collection/dictionary" {
    import { IPropInfo } from "jriapp_shared/collection/int";
    import { BaseList, IListItem, IListItemConstructor } from "jriapp_shared/collection/list";
    export class BaseDictionary<TItem extends IListItem, TObj> extends BaseList<TItem, TObj> {
        private _keyName;
        constructor(itemType: IListItemConstructor<TItem, TObj>, keyName: string, props: IPropInfo[]);
        protected createItem(obj?: TObj): TItem;
        protected _onItemAdded(item: TItem): void;
        protected _onRemoved(item: TItem, pos: number): void;
        readonly keyName: string;
        toString(): string;
    }
}
declare module "jriapp_shared/utils/lazy" {
    import { IDisposable } from "jriapp_shared/int";
    export type TValueFactory<T> = () => T;
    export class Lazy<T> implements IDisposable {
        private _val;
        private _factory;
        constructor(factory: TValueFactory<T>);
        readonly Value: T;
        destroy(): void;
        readonly IsValueCreated: boolean;
        readonly IsDestroyed: boolean;
    }
}
declare module "jriapp_shared" {
    export * from "jriapp_shared/const";
    export * from "jriapp_shared/int";
    export * from "jriapp_shared/errors";
    export * from "jriapp_shared/object";
    export * from "jriapp_shared/utils/jsonbag";
    export * from "jriapp_shared/utils/jsonarray";
    export { createWeakMap } from "jriapp_shared/utils/weakmap";
    export { STRS as LocaleSTRS, ERRS as LocaleERRS } from "jriapp_shared/lang";
    export { BaseCollection } from "jriapp_shared/collection/base";
    export { CollectionItem } from "jriapp_shared/collection/item";
    export { ItemAspect } from "jriapp_shared/collection/aspect";
    export { ListItemAspect, IListItem, BaseList, IListItemAspectConstructor, IListItemConstructor } from "jriapp_shared/collection/list";
    export { BaseDictionary } from "jriapp_shared/collection/dictionary";
    export { ValidationError } from "jriapp_shared/errors";
    export * from "jriapp_shared/utils/ideferred";
    export { Utils } from "jriapp_shared/utils/utils";
    export { WaitQueue, IWaitQueueItem } from "jriapp_shared/utils/waitqueue";
    export { Debounce } from "jriapp_shared/utils/debounce";
    export { Lazy, TValueFactory } from "jriapp_shared/utils/lazy";
}
