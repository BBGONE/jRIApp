/// <reference path="../jriapp/thirdparty/jquery.d.ts" />
/// <reference path="../jriapp/thirdparty/qtip2.d.ts" />
/// <reference path="../jriapp/thirdparty/moment.d.ts" />
/// <reference path="../jriapp/thirdparty/require.d.ts" />
declare module "jriapp_core/const" {
    export enum DEBUG_LEVEL {
        NONE = 0,
        NORMAL = 1,
        HIGH = 2,
    }
    export const DUMY_ERROR: string;
    export const TOOLTIP_SVC: string;
    export const STORE_KEY: {
        SVC: string;
        CONVERTER: string;
        OBJECT: string;
    };
    export const DATA_ATTR: {
        EL_VIEW_KEY: string;
        DATA_BIND: string;
        DATA_VIEW: string;
        DATA_EVENT_SCOPE: string;
        DATA_ITEM_KEY: string;
        DATA_CONTENT: string;
        DATA_COLUMN: string;
        DATA_NAME: string;
        DATA_FORM: string;
        DATA_REQUIRE: string;
    };
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
    export const enum KEYS {
        backspace = 8,
        tab = 9,
        enter = 13,
        esc = 27,
        space = 32,
        pageUp = 33,
        pageDown = 34,
        end = 35,
        home = 36,
        left = 37,
        up = 38,
        right = 39,
        down = 40,
        del = 127,
    }
    export const ELVIEW_NM: {
        DataForm: string;
    };
    export const LOADER_GIF: {
        Small: string;
        Default: string;
    };
    export const enum BindTo {
        Source = 0,
        Target = 1,
    }
    export const enum BINDING_MODE {
        OneTime = 0,
        OneWay = 1,
        TwoWay = 2,
        BackWay = 3,
    }
}
declare module "jriapp_core/shared" {
    import * as constsMOD from "jriapp_core/const";
    export interface IJRIAppConfig {
        frameworkPath?: string;
        frameworkJS?: string;
        bust?: string;
        debugLevel?: constsMOD.DEBUG_LEVEL;
    }
    export const Config: IJRIAppConfig;
    export let DebugLevel: constsMOD.DEBUG_LEVEL;
    export class ButtonCss {
        static Edit: string;
        static Delete: string;
        static OK: string;
        static Cancel: string;
    }
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
    export interface IListNode {
        context: any;
        fn: TEventHandler<any, any>;
        next: IListNode;
    }
    export type IListBucket = IListNode[];
    export interface IList {
        one: {
            [ns: string]: IListBucket;
        };
        two: {
            [ns: string]: IListBucket;
        };
    }
    export interface ITaskQueue {
        enque(task: () => void): void;
    }
    export interface IBaseObject extends IErrorHandler, IDisposable {
        _isHasProp(prop: string): boolean;
        raisePropertyChanged(name: string): void;
        addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeHandler(name?: string, nmspace?: string): void;
        addOnPropertyChange(prop: string, handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
        removeOnPropertyChange(prop?: string, nmspace?: string): void;
        removeNSHandlers(nmspace?: string): void;
        addOnError(handler: TErrorHandler, nmspace?: string, context?: IBaseObject): void;
        removeOnError(nmspace?: string): void;
        addOnDestroyed(handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject): void;
        removeOnDestroyed(nmspace?: string): void;
        raiseEvent(name: string, args: any): void;
    }
    export interface IPropertyBag extends IBaseObject {
        getProp(name: string): any;
        setProp(name: string, val: any): void;
    }
    export interface ILifeTimeScope extends IBaseObject {
        addObj(b: IBaseObject): void;
        removeObj(b: IBaseObject): void;
        getObjs(): IBaseObject[];
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
        rejectChanges(): void;
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
    export interface IDatepicker {
        datepickerRegion: string;
        dateFormat: string;
        attachTo($el: any, options?: any): void;
        detachFrom($el: any): void;
        parseDate(str: string): Date;
        formatDate(date: Date): string;
    }
    export interface IConverter {
        convertToSource(val: any, param: any, dataContext: any): any;
        convertToTarget(val: any, param: any, dataContext: any): any;
    }
    export interface ISelectable {
        getContainerEl(): HTMLElement;
        getUniqueID(): string;
        onKeyDown(key: number, event: Event): void;
        onKeyUp(key: number, event: Event): void;
    }
    export interface ISelectableProvider {
        getISelectable(): ISelectable;
    }
    export interface IExports {
        getExports(): IIndexer<any>;
    }
    export interface ISvcStore {
        getSvc<T>(name: string): T;
        getSvc(name: string): any;
    }
    export interface ITemplateGroupInfo {
        fn_loader?: () => IPromise<string>;
        url?: string;
        names: string[];
    }
    export interface ITemplateGroupInfoEx extends ITemplateGroupInfo {
        promise?: IPromise<string>;
        app?: IApplication;
    }
    export interface ITemplateLoaderInfo {
        fn_loader: () => IPromise<string>;
        groupName?: string;
    }
    export interface IUnResolvedBindingArgs {
        bindTo: constsMOD.BindTo;
        root: any;
        path: string;
        propName: string;
    }
    export interface IBindableElement {
        el: HTMLElement;
        dataView: string;
        dataForm: string;
        expressions: string[];
    }
    export interface ITemplate extends IBaseObject {
        findElByDataName(name: string): HTMLElement[];
        findElViewsByDataName(name: string): IElView[];
        loadedElem: HTMLElement;
        dataContext: any;
        templateID: string;
        el: HTMLElement;
        app: IApplication;
    }
    export interface ITemplateEvents {
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
    }
    export interface IFieldInfo {
        fieldName: string;
        isPrimaryKey: number;
        dataType: constsMOD.DATA_TYPE;
        isNullable: boolean;
        isReadOnly: boolean;
        isAutoGenerated: boolean;
        isNeedOriginal: boolean;
        maxLength: number;
        dateConversion: constsMOD.DATE_CONVERSION;
        allowClientDefault: boolean;
        range: string;
        regex: string;
        fieldType: constsMOD.FIELD_TYPE;
        dependentOn: string;
        nested: IFieldInfo[];
        dependents?: string[];
        fullName?: string;
    }
    export interface IViewOptions {
        css?: string;
        tip?: string;
        app: IApplication;
        el: HTMLElement;
    }
    export interface IElViewStore {
        getElView(el: HTMLElement): IElView;
        setElView(el: HTMLElement, view?: IElView): void;
        destroy(): void;
    }
    export interface IElViewRegister {
        registerElView(name: string, vw_type: IViewType): void;
        getElViewType(name: string): IViewType;
        destroy(): void;
    }
    export interface IElViewFactory {
        createElView(view_info: {
            name: string;
            options: IViewOptions;
        }): IElView;
        getOrCreateElView(el: HTMLElement): IElView;
        getElementViewInfo(el: HTMLElement): {
            name: string;
            options: IViewOptions;
        };
        store: IElViewStore;
        destroy(): void;
    }
    export interface IViewType {
        new (options: IViewOptions): IElView;
    }
    export interface IElView extends IBaseObject {
        $el: JQuery;
        el: HTMLElement;
        app: IApplication;
    }
    export interface IDataBindingService extends IDisposable {
        bindTemplateElements(templateEl: HTMLElement): IPromise<ILifeTimeScope>;
        bindElements(scope: Document | HTMLElement, defaultDataContext: any, isDataFormBind: boolean, isInsideTemplate: boolean): IPromise<ILifeTimeScope>;
        setUpBindings(): IVoidPromise;
        bind(opts: IBindingOptions): IBinding;
    }
    export interface IBindingOptions {
        mode?: constsMOD.BINDING_MODE;
        converterParam?: any;
        converter?: IConverter;
        targetPath: string;
        sourcePath?: string;
        target?: IBaseObject;
        source?: any;
        isSourceFixed?: boolean;
    }
    export type TBindingMode = "OneTime" | "OneWay" | "TwoWay" | "BackWay";
    export interface IBindingInfo {
        mode?: TBindingMode;
        converterParam?: any;
        converter?: any;
        targetPath: string;
        sourcePath?: string;
        to?: string;
        target?: any;
        source?: any;
    }
    export interface IBinding extends IBaseObject {
        target: IBaseObject;
        source: IBaseObject;
        targetPath: string[];
        sourcePath: string[];
        sourceValue: any;
        targetValue: any;
        mode: constsMOD.BINDING_MODE;
        converter: IConverter;
        converterParam: any;
        isSourceFixed: boolean;
        isDisabled: boolean;
        appName: string;
    }
    export interface IExternallyCachable {
        addOnObjectCreated(fn: (sender: any, args: {
            objectKey: string;
            object: IBaseObject;
            isCachedExternally: boolean;
        }) => void, nmspace?: string): void;
        addOnObjectNeeded(fn: (sender: any, args: {
            objectKey: string;
            object: IBaseObject;
        }) => void, nmspace?: string): void;
    }
    export interface IContent extends IBaseObject {
        isEditing: boolean;
        dataContext: any;
    }
    export interface IContentConstructor {
        new (options: IConstructorContentOptions): IContent;
    }
    export interface ITemplateInfo {
        displayID?: string;
        editID?: string;
    }
    export interface IContentOptions {
        name?: string;
        readOnly?: boolean;
        initContentFn?: (content: IExternallyCachable) => void;
        fieldInfo?: IFieldInfo;
        bindingInfo?: IBindingInfo;
        displayInfo?: {
            displayCss?: string;
            editCss?: string;
        };
        templateInfo?: ITemplateInfo;
        fieldName?: string;
        options?: any;
    }
    export interface IConstructorContentOptions {
        parentEl: HTMLElement;
        contentOptions: IContentOptions;
        dataContext: any;
        isEditing: boolean;
        app: IApplication;
    }
    export interface IContentFactory {
        getContentType(options: IContentOptions): IContentConstructor;
        createContent(options: IConstructorContentOptions): IContent;
        isExternallyCachable(contentType: IContentConstructor): boolean;
    }
    export interface IContentFactoryList extends IContentFactory {
        addFactory(factoryGetter: TFactoryGetter): void;
    }
    export type TFactoryGetter = (nextFactory?: IContentFactory) => IContentFactory;
    export interface ITooltipService {
        addToolTip($el: JQuery, tip: string, isError?: boolean, pos?: string): void;
    }
    export interface IStylesLoader {
        loadStyle(url: string): IPromise<any>;
        loadStyles(urls: string[]): IPromise<any>;
        loadOwnStyle(cssName?: string): IPromise<string>;
        whenAllLoaded(): IPromise<any>;
    }
    export interface IModuleLoader {
        load(names: string[]): IPromise<void>;
        whenAllLoaded(): IPromise<void>;
    }
    export interface IInternalAppMethods {
        bindTemplateElements(templateEl: HTMLElement): IPromise<ILifeTimeScope>;
        bindElements(scope: Document | HTMLElement, dctx: any, isDataFormBind: boolean, isInsideTemplate: boolean): IPromise<ILifeTimeScope>;
    }
    export interface IApplication extends IErrorHandler, IExports, IDisposable {
        _getInternal(): IInternalAppMethods;
        addOnStartUp(fn: TEventHandler<IApplication, any>, nmspace?: string, context?: IBaseObject): void;
        removeOnStartUp(nmspace?: string): void;
        registerElView(name: string, vw_type: IViewType): void;
        registerConverter(name: string, obj: IConverter): void;
        getConverter(name: string): IConverter;
        registerSvc(name: string, obj: any): void;
        getSvc<T>(name: string): T;
        getSvc(name: string): any;
        registerObject(name: string, obj: any): void;
        getObject<T>(name: string): T;
        getObject(name: string): any;
        createTemplate(dataContext?: any, templEvents?: ITemplateEvents): ITemplate;
        loadTemplates(url: string): IPromise<any>;
        loadTemplatesAsync(fn_loader: () => IPromise<string>): IPromise<any>;
        registerTemplateLoader(name: string, fn_loader: () => IPromise<string>): void;
        getTemplateLoader(name: string): () => IPromise<string>;
        registerTemplateGroup(name: string, group: {
            fn_loader?: () => IPromise<string>;
            url?: string;
            names: string[];
        }): void;
        bind(opts: IBindingOptions): IBinding;
        startUp<TApp extends IApplication>(onStartUp?: (app: TApp) => any): IPromise<TApp>;
        uniqueID: string;
        appName: string;
        appRoot: Document | HTMLElement;
        elViewFactory: IElViewFactory;
    }
    export interface IAppOptions {
        appName?: string;
        modulesInits?: IIndexer<(app: IApplication) => void>;
        appRoot?: Document | HTMLElement;
    }
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
}
declare module "jriapp_utils/arrhelper" {
    export interface IArrayLikeList<T> {
        length: number;
        [index: number]: T;
    }
    export class ArrayHelper {
        static clone<T>(arr: T[]): T[];
        static fromList<T extends U, U>(list: IArrayLikeList<U>): T[];
        static fromList<T>(list: IArrayLikeList<any>): T[];
        static fromList<T>(list: IArrayLikeList<T>): T[];
        static distinct(arr: string[]): string[];
        static distinct(arr: number[]): number[];
        static remove(array: any[], obj: any): number;
        static insert(array: any[], obj: any, pos: number): void;
    }
}
declare module "jriapp_utils/strutils" {
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
        static padLeft(val: string, length: number, str: string): string;
    }
}
declare module "jriapp_utils/syschecks" {
    import * as coreMOD from "jriapp_core/shared";
    export class SysChecks {
        static _isBaseObj: (obj: any) => boolean;
        static _isElView: (obj: any) => boolean;
        static _isBinding: (obj: any) => boolean;
        static _isPropBag: (obj: any) => boolean;
        static _isCollection: (obj: any) => boolean;
        static _getItemByProp: (obj: any, prop: string) => any;
        static _isValidationError: (obj: any) => boolean;
        static _isTemplateElView: (obj: any) => boolean;
        static _setIsInsideTemplate: (elView: coreMOD.IElView) => void;
        static _isDataForm: (el: HTMLElement) => boolean;
        static _isInsideDataForm: (el: HTMLElement) => boolean;
        static _isInNestedForm: (root: any, forms: HTMLElement[], el: HTMLElement) => boolean;
        static _getParentDataForm: (rootForm: HTMLElement, el: HTMLElement) => HTMLElement;
        static _PROP_BAG_NAME(): string;
    }
}
declare module "jriapp_utils/checks" {
    import { IBaseObject, IEditable, ISubmittable, IErrorNotification, IThenable } from "jriapp_core/shared";
    export class Checks {
        static undefined: any;
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
        static isArray<T>(a: any): a is Array<T>;
        static isBaseObject(a: any): a is IBaseObject;
        static isCollection(a: any): boolean;
        static isEditable(obj: any): obj is IEditable;
        static isSubmittable(obj: any): obj is ISubmittable;
        static isErrorNotification(obj: any): obj is IErrorNotification;
        static isThenable(a: any): a is IThenable<any>;
    }
}
declare module "jriapp_utils/debounce" {
    import * as coreMOD from "jriapp_core/shared";
    export class Debounce implements coreMOD.IDisposable {
        private _isDestroyed;
        private _timer;
        private _interval;
        constructor(interval?: number);
        enqueue(fn: () => any): void;
        destroy(): void;
        getIsDestroyed(): boolean;
        getIsDestroyCalled(): boolean;
        interval: number;
    }
}
declare module "jriapp_utils/dblclick" {
    import * as coreMOD from "jriapp_core/shared";
    export class DblClick implements coreMOD.IDisposable {
        private _isDestroyed;
        private _timer;
        private _interval;
        private _fn_OnClick;
        private _fn_OnDblClick;
        constructor(interval?: number);
        click(): void;
        add(fn_OnClick: () => any, fn_OnDblClick?: () => any): void;
        destroy(): void;
        getIsDestroyed(): boolean;
        getIsDestroyCalled(): boolean;
        interval: number;
    }
}
declare module "jriapp_utils/coreutils" {
    import { IIndexer } from "jriapp_core/shared";
    import { ArrayHelper } from "jriapp_utils/arrhelper";
    import { StringUtils } from "jriapp_utils/strutils";
    import { Checks } from "jriapp_utils/checks";
    export { Debounce } from "jriapp_utils/debounce";
    export { DblClick } from "jriapp_utils/dblclick";
    export { ArrayHelper, IArrayLikeList } from "jriapp_utils/arrhelper";
    export { StringUtils } from "jriapp_utils/strutils";
    export { Checks } from "jriapp_utils/checks";
    export { SysChecks } from "jriapp_utils/syschecks";
    export class DEBUG {
        static checkStartDebugger(): void;
        static isDebugging(): boolean;
    }
    export class ERROR {
        static throwDummy(err: any): void;
        static checkIsDummy(error: any): boolean;
        static checkIsAbort(error: any): boolean;
        static reThrow(ex: any, isHandled: boolean): void;
        static abort(reason?: string): void;
    }
    export class LOG {
        static log(str: string): void;
        static warn(str: string): void;
        static error(str: string): void;
    }
    export class CoreUtils {
        private static _newID;
        private static ERR_OBJ_ALREADY_REGISTERED;
        private static CHARS;
        static check: typeof Checks;
        static str: typeof StringUtils;
        static arr: typeof ArrayHelper;
        static getNewID(): number;
        static get_timeZoneOffset: () => number;
        static hasProp: typeof Checks.isHasProp;
        static setValue(root: any, namePath: string, val: any, checkOverwrite: boolean): void;
        static getValue(root: any, namePath: string): any;
        static removeValue(root: any, namePath: string): any;
        static resolveOwner(obj: any, path: string): any;
        static uuid(len?: number, radix?: number): string;
        static parseBool(a: any): boolean;
        static round(num: number, decimals: number): number;
        static merge<S, T>(source: S, target?: T): S | T;
        static clone(obj: any, target?: any): any;
        static iterateIndexer<T>(obj: IIndexer<T>, fn: (name: string, val: T) => void): void;
        static extend<T, U>(defaults: T, current: U): T | U;
        static memoize<T>(callback: () => T): () => T;
        static forEachProp(obj: any, fn: (name: string) => void): void;
        static assignStrings<T extends U, U extends IIndexer<any>>(target: T, source: U): T;
    }
}
declare module "jriapp_core/lang" {
    import * as coreMOD from "jriapp_core/shared";
    export function assign<T extends U, U extends coreMOD.IIndexer<any>>(target: T, source: U): T;
    export interface IErrors extends coreMOD.IIndexer<string> {
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
    export interface IPagerText extends coreMOD.IIndexer<string> {
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
    export interface IValidateText extends coreMOD.IIndexer<string> {
        errorInfo: string;
        errorField: string;
    }
    export interface IText extends coreMOD.IIndexer<string> {
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
    export interface ILocaleText extends coreMOD.IIndexer<any> {
        PAGER: IPagerText;
        VALIDATE: IValidateText;
        TEXT: IText;
    }
    export let ERRS: IErrors;
    export let STRS: ILocaleText;
}
declare module "jriapp_utils/listhelper" {
    import * as coreMOD from "jriapp_core/shared";
    export class ListHelper {
        static CreateList(): coreMOD.IList;
        static CreateNode(handler: coreMOD.TErrorHandler, ns: string, context?: any): coreMOD.IListNode;
        static countNodes(list: coreMOD.IList): number;
        static appendNode(list: coreMOD.IList, node: coreMOD.IListNode, ns: string, highPrior: boolean): void;
        static removeNodes(list: coreMOD.IList, ns: string): void;
        static toArray(list: coreMOD.IList): coreMOD.IListNode[];
    }
}
declare module "jriapp_core/object" {
    import { IBaseObject, TEventHandler, TErrorHandler, TPropChangedHandler } from "jriapp_core/shared";
    export class BaseObject implements IBaseObject {
        private _obj_state;
        private _events;
        constructor();
        private _removeNsHandler(ev, ns);
        protected _getEventNames(): string[];
        protected _addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        protected _removeHandler(name?: string, nmspace?: string): void;
        protected _raiseEvent(name: string, args: any): void;
        protected _checkEventName(name: string): void;
        protected readonly _isDestroyed: boolean;
        protected _isDestroyCalled: boolean;
        _isHasProp(prop: string): boolean;
        handleError(error: any, source: any): boolean;
        raisePropertyChanged(name: string): void;
        addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeHandler(name?: string, nmspace?: string): void;
        addOnDestroyed(handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject): void;
        removeOnDestroyed(nmspace?: string): void;
        addOnError(handler: TErrorHandler, nmspace?: string, context?: IBaseObject): void;
        removeOnError(nmspace?: string): void;
        removeNSHandlers(nmspace?: string): void;
        raiseEvent(name: string, args: any): void;
        addOnPropertyChange(prop: string, handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
        removeOnPropertyChange(prop?: string, nmspace?: string): void;
        getIsDestroyed(): boolean;
        getIsDestroyCalled(): boolean;
        destroy(): void;
    }
}
declare module "jriapp_core/parser" {
    export class Parser {
        protected _getKeyVals(val: string): {
            key: string;
            val: any;
        }[];
        getPathParts(path: string): string[];
        resolveProp(obj: any, prop: string): any;
        setPropertyValue(obj: any, prop: string, val: any): void;
        resolveBindingSource(root: any, srcParts: string[]): any;
        resolvePath(obj: any, path: string): any;
        private getBraceParts(val, firstOnly);
        parseOption(part: string): any;
        parseOptions(str: string): any[];
        toString(): string;
    }
    export const parser: Parser;
}
declare module "jriapp_utils/dom" {
    export class DomUtils {
        static window: Window;
        static document: Document;
        static isContained(oNode: any, oCont: any): boolean;
        static removeNode(node: Node): void;
        static insertAfter(node: Node, refNode: Node): void;
        static insertBefore(node: Node, refNode: Node): void;
        static wrap(elem: Element, wrapper: Element): void;
        static unwrap(elem: Element): void;
        private static getClassMap(el);
        static setClasses(elems: Element[], classes: string[]): void;
        static setClass(elems: Element[], css: string, remove?: boolean): void;
        static addClass(elems: Element[], css: string): void;
        static removeClass(elems: Element[], css: string): void;
        static $: JQueryStatic;
        static destroyJQueryPlugin($el: JQuery, name: string): void;
    }
}
declare module "jriapp_utils/deferred" {
    import * as coreMOD from "jriapp_core/shared";
    export const enum PromiseState {
        Pending = 0,
        ResolutionInProgress = 1,
        Resolved = 2,
        Rejected = 3,
    }
    export interface IPromiseState {
        state(): PromiseState;
    }
    export interface IPromise<T> extends coreMOD.IPromise<T>, IPromiseState {
        then<TP>(successCB?: coreMOD.IDeferredSuccessCB<T, TP>, errorCB?: coreMOD.IDeferredErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: coreMOD.IDeferredSuccessCB<T, TP>, errorCB?: coreMOD.IErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: coreMOD.IDeferredSuccessCB<T, TP>, errorCB?: coreMOD.IVoidErrorCB): IPromise<TP>;
        then<TP>(successCB?: coreMOD.ISuccessCB<T, TP>, errorCB?: coreMOD.IDeferredErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: coreMOD.ISuccessCB<T, TP>, errorCB?: coreMOD.IErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: coreMOD.ISuccessCB<T, TP>, errorCB?: coreMOD.IVoidErrorCB): IPromise<TP>;
        always<TP>(errorCB?: coreMOD.IDeferredErrorCB<TP>): IPromise<TP>;
        always<TP>(errorCB?: coreMOD.IErrorCB<TP>): IPromise<TP>;
        always(errorCB?: coreMOD.IVoidErrorCB): IPromise<void>;
        fail(errorCB?: coreMOD.IDeferredErrorCB<T>): IPromise<T>;
        fail(errorCB?: coreMOD.IErrorCB<T>): IPromise<T>;
        fail(errorCB?: coreMOD.IVoidErrorCB): IPromise<void>;
    }
    export interface IAbortablePromise<T> extends IPromise<T>, coreMOD.IAbortable {
    }
    export interface IDeferred<T> extends coreMOD.IDeferred<T>, IPromiseState {
        resolve(value?: coreMOD.IThenable<T>): IPromise<T>;
        resolve(value?: T): IPromise<T>;
        reject(error?: any): IPromise<T>;
        promise(): IPromise<T>;
    }
    export function create<T>(): IDeferred<T>;
    export function createSync<T>(): IDeferred<T>;
    export function getTaskQueue(): coreMOD.ITaskQueue;
    export function whenAll<T>(args: Array<T | coreMOD.IThenable<T>>): IPromise<T[]>;
    export class AbortablePromise<T> implements IAbortablePromise<T> {
        private _deferred;
        private _abortable;
        private _aborted;
        constructor(deferred: IDeferred<T>, abortable: coreMOD.IAbortable);
        then<TP>(successCB?: coreMOD.IDeferredSuccessCB<T, TP>, errorCB?: coreMOD.IDeferredErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: coreMOD.IDeferredSuccessCB<T, TP>, errorCB?: coreMOD.IErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: coreMOD.IDeferredSuccessCB<T, TP>, errorCB?: coreMOD.IVoidErrorCB): IPromise<TP>;
        then<TP>(successCB?: coreMOD.ISuccessCB<T, TP>, errorCB?: coreMOD.IDeferredErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: coreMOD.ISuccessCB<T, TP>, errorCB?: coreMOD.IErrorCB<TP>): IPromise<TP>;
        then<TP>(successCB?: coreMOD.ISuccessCB<T, TP>, errorCB?: coreMOD.IVoidErrorCB): IPromise<TP>;
        fail(errorCB?: coreMOD.IDeferredErrorCB<T>): IPromise<T>;
        fail(errorCB?: coreMOD.IErrorCB<T>): IPromise<T>;
        fail(errorCB?: coreMOD.IVoidErrorCB): IPromise<void>;
        always<TP>(errorCB?: coreMOD.IDeferredErrorCB<TP>): IPromise<TP>;
        always<TP>(errorCB?: coreMOD.IErrorCB<TP>): IPromise<TP>;
        always(errorCB?: coreMOD.IVoidErrorCB): IPromise<void>;
        abort(reason?: string): void;
        state(): PromiseState;
    }
}
declare module "jriapp_utils/async" {
    import { IThenable, ITaskQueue } from "jriapp_core/shared";
    import { IPromise, IDeferred } from "jriapp_utils/deferred";
    export { IPromise, IPromiseState, IAbortablePromise, PromiseState, IDeferred, whenAll, AbortablePromise } from "jriapp_utils/deferred";
    export class AsyncUtils {
        static createDeferred<T>(): IDeferred<T>;
        static createSyncDeferred<T>(): IDeferred<T>;
        static whenAll<T>(args: Array<T | IThenable<T>>): IPromise<T[]>;
        static getTaskQueue(): ITaskQueue;
        static delay<T>(func: () => T, time?: number): IPromise<T>;
    }
}
declare module "jriapp_utils/http" {
    import { IIndexer } from "jriapp_core/shared";
    import { IAbortablePromise } from "jriapp_utils/async";
    export class HttpUtils {
        static isStatusOK(status: string | number): boolean;
        private static _getXMLRequest(url, method, deferred, headers?);
        static postAjax(url: string, postData: string, headers?: IIndexer<string>): IAbortablePromise<string>;
        static getAjax(url: string, headers?: IIndexer<string>): IAbortablePromise<string>;
        static defaultHeaders: IIndexer<string>;
        static ajaxTimeOut: number;
    }
}
declare module "jriapp_utils/lifetime" {
    import { IBaseObject, ILifeTimeScope } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    export class LifeTimeScope extends BaseObject implements ILifeTimeScope {
        private _objs;
        constructor();
        static create(): LifeTimeScope;
        addObj(b: IBaseObject): void;
        removeObj(b: IBaseObject): void;
        getObjs(): IBaseObject[];
        destroy(): void;
        toString(): string;
    }
}
declare module "jriapp_utils/propwatcher" {
    import { BaseObject } from "jriapp_core/object";
    export class PropWatcher extends BaseObject {
        private _objId;
        private _objs;
        constructor();
        static create(): PropWatcher;
        addPropWatch(obj: BaseObject, prop: string, fn_onChange: (prop: string) => void): void;
        addWatch(obj: BaseObject, props: string[], fn_onChange: (prop: string) => void): void;
        removeWatch(obj: BaseObject): void;
        destroy(): void;
        toString(): string;
        readonly uniqueID: string;
    }
}
declare module "jriapp_utils/waitqueue" {
    import { IBaseObject } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
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
declare module "jriapp_utils/utils" {
    import { ISubmittable, IErrorNotification, IEditable, IPromise } from "jriapp_core/shared";
    import { CoreUtils } from "jriapp_utils/coreutils";
    import { DomUtils } from "jriapp_utils/dom";
    import { AsyncUtils } from "jriapp_utils/async";
    import { HttpUtils } from "jriapp_utils/http";
    import { StringUtils } from "jriapp_utils/strutils";
    import { Checks } from "jriapp_utils/checks";
    import { ArrayHelper } from "jriapp_utils/arrhelper";
    export { DomUtils } from "jriapp_utils/dom";
    export { AsyncUtils } from "jriapp_utils/async";
    export { HttpUtils } from "jriapp_utils/http";
    export { LifeTimeScope } from "jriapp_utils/lifetime";
    export { PropWatcher } from "jriapp_utils/propwatcher";
    export { WaitQueue, IWaitQueueItem } from "jriapp_utils/waitqueue";
    export { Debounce, DblClick, DEBUG, ERROR, SysChecks } from "jriapp_utils/coreutils";
    export class Utils {
        static check: typeof Checks;
        static str: typeof StringUtils;
        static arr: typeof ArrayHelper;
        static dom: typeof DomUtils;
        static http: typeof HttpUtils;
        static core: typeof CoreUtils;
        static defer: typeof AsyncUtils;
        static getErrorNotification(obj: any): IErrorNotification;
        static getEditable(obj: any): IEditable;
        static getSubmittable(obj: any): ISubmittable;
        static parseJSON(res: string | any): IPromise<any>;
    }
}
declare module "jriapp_elview/factory" {
    import { IApplication, IElViewFactory, IElViewRegister } from "jriapp_core/shared";
    export function createFactory(app: IApplication, num: number, register: IElViewRegister): IElViewFactory;
    export function createRegister(next?: IElViewRegister): IElViewRegister;
}
declare module "jriapp_core/defaults" {
    import * as coreMOD from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    export class Defaults extends BaseObject {
        private _imagesPath;
        private _dateFormat;
        private _dateTimeFormat;
        private _timeFormat;
        private _decimalPoint;
        private _thousandSep;
        private _decPrecision;
        private _svcStore;
        constructor(typeStore: coreMOD.ISvcStore);
        toString(): string;
        dateFormat: string;
        timeFormat: string;
        dateTimeFormat: string;
        readonly datepicker: coreMOD.IDatepicker;
        imagesPath: string;
        decimalPoint: string;
        thousandSep: string;
        decPrecision: number;
        readonly ButtonsCSS: typeof coreMOD.ButtonCss;
    }
}
declare module "jriapp_utils/tloader" {
    import { IPromise, IApplication, ITemplateGroupInfoEx, ITemplateLoaderInfo } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    export class TemplateLoader extends BaseObject {
        private _templateLoaders;
        private _templateGroups;
        private _promises;
        private _waitQueue;
        constructor();
        destroy(): void;
        protected _getEventNames(): string[];
        addOnLoaded(fn: (sender: TemplateLoader, args: {
            html: string;
            app: IApplication;
        }) => void, nmspace?: string): void;
        removeOnLoaded(nmspace?: string): void;
        waitForNotLoading(callback: (...args: any[]) => any, callbackArgs: any): void;
        private _onLoaded(html, app);
        private _getTemplateGroup(name);
        private _registerTemplateLoaderCore(name, loader);
        private _getTemplateLoaderCore(name);
        loadTemplatesAsync(fn_loader: () => IPromise<string>, app: IApplication): IPromise<any>;
        unRegisterTemplateLoader(name: string): void;
        unRegisterTemplateGroup(name: string): void;
        registerTemplateLoader(name: string, loader: ITemplateLoaderInfo): void;
        getTemplateLoader(name: string): () => IPromise<string>;
        registerTemplateGroup(groupName: string, group: ITemplateGroupInfoEx): void;
        loadTemplates(url: string): void;
        readonly isLoading: boolean;
    }
}
declare module "jriapp_utils/path" {
    export const frameworkJS: string;
    export interface IUrlParts {
        protocol: string;
        host: string;
        hostname: string;
        port: string;
        pathname: string;
        hash: string;
        search: string;
    }
    export class PathHelper {
        private static _anchor;
        static appendBust(url: string): string;
        static appendSearch(url: string, search: string): string;
        static getNormalizedUrl(url: string): string;
        static getUrlParts(url: string): IUrlParts;
        static getParentUrl(url: string): string;
        static getFrameworkPath(): string;
        static getFrameworkCssPath(): string;
        static getFrameworkImgPath(): string;
    }
}
declare module "jriapp_utils/sloader" {
    import { IStylesLoader } from "jriapp_core/shared";
    export const frameworkCss: string;
    export function create(): IStylesLoader;
    export interface IUrlParts {
        protocol: string;
        host: string;
        hostname: string;
        port: string;
        pathname: string;
        hash: string;
        search: string;
    }
}
declare module "jriapp_utils/tooltip" {
    import { ITooltipService } from "jriapp_core/shared";
    export const css: {
        toolTip: string;
        toolTipError: string;
    };
    export function create(): ITooltipService;
}
declare module "jriapp_core/bootstrap" {
    import { IApplication, ISelectableProvider, IExports, IConverter, ISvcStore, IIndexer, IBaseObject, IPromise, TEventHandler, IStylesLoader, IElViewRegister } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { Defaults } from "jriapp_core/defaults";
    import { TemplateLoader } from "jriapp_utils/tloader";
    export interface IInternalBootstrapMethods {
        initialize(): IPromise<void>;
        trackSelectable(selectable: ISelectableProvider): void;
        untrackSelectable(selectable: ISelectableProvider): void;
        registerApp(app: IApplication): void;
        unregisterApp(app: IApplication): void;
        destroyApps(): void;
        registerObject(root: IExports, name: string, obj: any): void;
        unregisterObject(root: IExports, name: string): void;
        getObject(root: IExports, name: string): any;
        getConverter(name: string): IConverter;
    }
    export class Bootstrap extends BaseObject implements IExports, ISvcStore {
        static _initFramework(): void;
        private _appInst;
        private _currentSelectable;
        private _defaults;
        private _templateLoader;
        private _bootState;
        private _exports;
        private _internal;
        private _moduleInits;
        private _elViewRegister;
        constructor();
        private _bindGlobalEvents();
        private _onTemplateLoaded(html, app);
        private _processTemplates(root, app?);
        private _processHTMLTemplates();
        private _processTemplate(name, html, app);
        protected _getEventNames(): string[];
        protected _addHandler(name: string, fn: (sender: any, args: any) => void, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        private _init();
        private _initialize();
        private _trackSelectable(selectable);
        private _untrackSelectable(selectable);
        private _registerApp(app);
        private _unregisterApp(app);
        private _destroyApps();
        private _registerObject(root, name, obj);
        private _unregisterObject(root, name);
        private _getObject(root, name);
        private _getConverter(name);
        private _waitLoaded(onLoad);
        _getInternal(): IInternalBootstrapMethods;
        addOnLoad(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject): void;
        addOnUnLoad(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject): void;
        addOnInitialize(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject): void;
        addModuleInit(fn: (app: IApplication) => void): boolean;
        getExports(): IIndexer<any>;
        findApp(name: string): IApplication;
        init(onInit: (bootstrap: Bootstrap) => void): void;
        startApp<TApp extends IApplication>(appFactory: () => TApp, onStartUp?: (app: TApp) => void): IPromise<TApp>;
        destroy(): void;
        registerSvc(name: string, obj: any): void;
        unregisterSvc(name: string, obj: any): any;
        getSvc<T>(name: string): T;
        registerConverter(name: string, obj: IConverter): void;
        registerElView(name: string, elViewType: any): void;
        getImagePath(imageName: string): string;
        loadOwnStyle(name: string): IPromise<string>;
        toString(): string;
        readonly stylesLoader: IStylesLoader;
        readonly elViewRegister: IElViewRegister;
        readonly templateLoader: TemplateLoader;
        currentSelectable: ISelectableProvider;
        readonly defaults: Defaults;
        readonly isReady: boolean;
    }
    export const bootstrap: Bootstrap;
}
declare module "jriapp_core/converter" {
    import { IConverter } from "jriapp_core/shared";
    export const NUM_CONV: {
        None: number;
        Integer: number;
        Decimal: number;
        Float: number;
        SmallInt: number;
    };
    export class BaseConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): any;
        convertToTarget(val: any, param: any, dataContext: any): any;
    }
    export let baseConverter: BaseConverter;
    export class DateConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): Date;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class DateTimeConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): Date;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class NumberConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): number;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class IntegerConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): number;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class SmallIntConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): number;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class DecimalConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): number;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class FloatConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): number;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class NotConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): boolean;
        convertToTarget(val: any, param: any, dataContext: any): boolean;
    }
}
declare module "jriapp_content/int" {
    import { IContentOptions, ITemplateInfo } from "jriapp_core/shared";
    export const css: {
        content: string;
        required: string;
        checkbox: string;
    };
    export interface IDataContentAttr {
        fieldName?: string;
        readOnly?: boolean;
        css?: {
            displayCss: string;
            editCss: string;
        };
        template?: ITemplateInfo;
        name?: string;
        options?: any;
    }
    export function parseContentAttr(content_attr: string): IContentOptions;
}
declare module "jriapp_core/mvvm" {
    import { IBaseObject, ITemplate, IErrorHandler } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    export interface ICommand {
        canExecute: (sender: any, param: any) => boolean;
        execute: (sender: any, param: any) => void;
        raiseCanExecuteChanged: () => void;
        addOnCanExecuteChanged(fn: (sender: ICommand, args: {}) => void, nmspace?: string, context?: IBaseObject): void;
        removeOnCanExecuteChanged(nmspace?: string): void;
    }
    export type TAction<TParam, TThis> = (sender: any, param: TParam, thisObj: TThis) => void;
    export type TPredicate<TParam, TThis> = (sender: any, param: TParam, thisObj: TThis) => boolean;
    export class TCommand<TParam, TThis> extends BaseObject implements ICommand {
        protected _action: TAction<TParam, TThis>;
        protected _thisObj: TThis;
        protected _predicate: TPredicate<TParam, TThis>;
        private _objId;
        constructor(fn_action: TAction<TParam, TThis>, thisObj?: TThis, fn_canExecute?: TPredicate<TParam, TThis>);
        protected _getEventNames(): string[];
        protected _canExecute(sender: any, param: TParam, context: any): boolean;
        protected _execute(sender: any, param: TParam, context: any): void;
        addOnCanExecuteChanged(fn: (sender: ICommand, args: any) => void, nmspace?: string, context?: IBaseObject): void;
        removeOnCanExecuteChanged(nmspace?: string): void;
        canExecute(sender: any, param: TParam): boolean;
        execute(sender: any, param: TParam): void;
        destroy(): void;
        raiseCanExecuteChanged(): void;
        toString(): string;
        readonly uniqueID: string;
        readonly thisObj: TThis;
    }
    export abstract class BaseCommand<TParam, TThis> extends TCommand<TParam, TThis> {
        constructor(thisObj: TThis);
        canExecute(sender: any, param: TParam): boolean;
        execute(sender: any, param: TParam): void;
        protected abstract Action(sender: any, param: TParam): void;
        protected abstract getIsCanExecute(sender: any, param: TParam): boolean;
    }
    export type Command = TCommand<any, any>;
    export const Command: new (fn_action: TAction<any, any>, thisObj?: any, fn_canExecute?: TPredicate<any, any>) => Command;
    export type TemplateCommand = TCommand<{
        template: ITemplate;
        isLoaded: boolean;
    }, any>;
    export const TemplateCommand: new (fn_action: TAction<{
        template: ITemplate;
        isLoaded: boolean;
    }, any>, thisObj?: any, fn_canExecute?: TPredicate<{
        template: ITemplate;
        isLoaded: boolean;
    }, any>) => TemplateCommand;
    export class ViewModel<TApp extends IErrorHandler> extends BaseObject {
        private _objId;
        private _app;
        constructor(app: TApp);
        handleError(error: any, source: any): boolean;
        toString(): string;
        destroy(): void;
        readonly uniqueID: string;
        readonly app: TApp;
    }
}
declare module "jriapp_utils/eventstore" {
    import { IPropertyBag } from "jriapp_core/shared";
    import { ICommand } from "jriapp_core/mvvm";
    import { BaseObject } from "jriapp_core/object";
    export const enum EVENT_CHANGE_TYPE {
        None = 0,
        Added = 1,
        Deleted = 2,
        Updated = 3,
    }
    export interface IEventChangedArgs {
        name: string;
        changeType: EVENT_CHANGE_TYPE;
        oldVal: ICommand;
        newVal: ICommand;
    }
    export class EventStore extends BaseObject implements IPropertyBag {
        private _dic;
        private _onChange;
        constructor(onChange: (sender: EventStore, args: IEventChangedArgs) => void);
        _isHasProp(prop: string): boolean;
        getProp(name: string): ICommand;
        setProp(name: string, command: ICommand): void;
        trigger(name: string, args?: any): void;
        toString(): string;
        destroy(): void;
    }
}
declare module "jriapp_elview/elview" {
    import { IElView, IValidationInfo, IApplication, IViewOptions, IPropertyBag } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { TAction, TCommand, ICommand, TPredicate } from "jriapp_core/mvvm";
    import { EVENT_CHANGE_TYPE, IEventChangedArgs } from "jriapp_utils/eventstore";
    export { IEventChangedArgs, EVENT_CHANGE_TYPE };
    export function fn_addToolTip($el: JQuery, tip: string, isError?: boolean, pos?: string): void;
    export type PropChangedCommand = TCommand<{
        property: string;
    }, any>;
    export const PropChangedCommand: new (fn_action: TAction<{
        property: string;
    }, any>, thisObj?: any, fn_canExecute?: TPredicate<{
        property: string;
    }, any>) => PropChangedCommand;
    export const css: {
        fieldError: string;
        commandLink: string;
        checkedNull: string;
        disabled: string;
        opacity: string;
        color: string;
        fontSize: string;
    };
    export const PROP_NAME: {
        isVisible: string;
        validationErrors: string;
        toolTip: string;
        css: string;
        isEnabled: string;
        value: string;
        command: string;
        disabled: string;
        commandParam: string;
        isBusy: string;
        delay: string;
        checked: string;
        color: string;
        wrap: string;
        text: string;
        html: string;
        preventDefault: string;
        imageSrc: string;
        glyph: string;
        href: string;
        fontSize: string;
        borderColor: string;
        borderStyle: string;
        width: string;
        height: string;
        src: string;
        click: string;
    };
    export class BaseElView extends BaseObject implements IElView {
        private _objId;
        private _$el;
        protected _errors: IValidationInfo[];
        protected _toolTip: string;
        protected _app: IApplication;
        private _eventStore;
        private _props;
        private _classes;
        private _display;
        private _css;
        constructor(options: IViewOptions);
        protected _onEventChanged(args: IEventChangedArgs): void;
        protected _onEventAdded(name: string, newVal: ICommand): void;
        protected _onEventDeleted(name: string, oldVal: ICommand): void;
        protected _applyToolTip(): void;
        protected _getErrorTipInfo(errors: IValidationInfo[]): string;
        protected _setFieldError(isError: boolean): void;
        protected _updateErrorUI(el: HTMLElement, errors: IValidationInfo[]): void;
        protected _setToolTip($el: JQuery, tip: string, isError?: boolean): void;
        destroy(): void;
        handleError(error: any, source: any): boolean;
        toString(): string;
        readonly $el: JQuery;
        readonly el: HTMLElement;
        readonly uniqueID: string;
        isVisible: boolean;
        validationErrors: IValidationInfo[];
        readonly dataName: string;
        toolTip: string;
        readonly app: IApplication;
        readonly events: IPropertyBag;
        readonly props: IPropertyBag;
        readonly classes: IPropertyBag;
        css: string;
    }
}
declare module "jriapp_core/binding" {
    import { BINDING_MODE } from "jriapp_core/const";
    import { IBaseObject, IBindingInfo, IBindingOptions, IBinding, IConverter } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    export function getBindingOptions(app: {
        getConverter(name: string): IConverter;
    }, bindInfo: IBindingInfo, defaultTarget: IBaseObject, defaultSource: any): IBindingOptions;
    export class Binding extends BaseObject implements IBinding {
        private _state;
        private _mode;
        private _converter;
        private _converterParam;
        private _srcPath;
        private _tgtPath;
        private _srcFixed;
        private _pathItems;
        private _objId;
        private _srcEnd;
        private _tgtEnd;
        private _source;
        private _target;
        private _appName;
        private _umask;
        private _cntUtgt;
        private _cntUSrc;
        constructor(options: IBindingOptions, appName?: string);
        private _update();
        private _onSrcErrChanged(err_notif, args?);
        private _getTgtChangedFn(self, obj, prop, restPath, lvl);
        private _getSrcChangedFn(self, obj, prop, restPath, lvl);
        private _parseSrc(obj, path, lvl);
        private _parseSrc2(obj, path, lvl);
        private _parseTgt(obj, path, lvl);
        private _parseTgt2(obj, path, lvl);
        private _setPathItem(newObj, bindingTo, lvl, path);
        private _cleanUp(obj);
        private _onTgtDestroyed(sender, args);
        private _onSrcDestroyed(sender, args);
        private _updateTarget(sender?, args?);
        private _updateSource(sender?, args?);
        protected _setTarget(value: any): void;
        protected _setSource(value: any): void;
        handleError(error: any, source: any): boolean;
        destroy(): void;
        toString(): string;
        readonly uniqueID: string;
        target: IBaseObject;
        source: any;
        readonly targetPath: string[];
        readonly sourcePath: string[];
        sourceValue: any;
        targetValue: any;
        readonly mode: BINDING_MODE;
        converter: IConverter;
        converterParam: any;
        readonly isSourceFixed: boolean;
        isDisabled: boolean;
        readonly appName: string;
    }
}
declare module "jriapp_content/basic" {
    import { IApplication, IContent, IContentOptions, IConstructorContentOptions, ILifeTimeScope, IElView, IViewOptions, IBaseObject, IBindingInfo, IBindingOptions, IFieldInfo } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { Binding } from "jriapp_core/binding";
    export class BasicContent extends BaseObject implements IContent {
        protected _parentEl: HTMLElement;
        protected _el: HTMLElement;
        protected _options: IContentOptions;
        protected _isReadOnly: boolean;
        private _isEditing;
        protected _dataContext: any;
        protected _lfScope: ILifeTimeScope;
        protected _target: IElView;
        protected _app: IApplication;
        constructor(options: IConstructorContentOptions);
        handleError(error: any, source: any): boolean;
        protected init(): void;
        protected updateCss(): void;
        protected getIsCanBeEdited(): boolean;
        protected createTargetElement(): IElView;
        protected getBindingOption(bindingInfo: IBindingInfo, target: IBaseObject, dataContext: any, targetPath: string): IBindingOptions;
        protected getBindings(): Binding[];
        protected updateBindingSource(): void;
        protected cleanUp(): void;
        protected getElementView(el: HTMLElement, view_info: {
            name: string;
            options: IViewOptions;
        }): IElView;
        protected getFieldInfo(): IFieldInfo;
        protected render(): void;
        destroy(): void;
        toString(): string;
        readonly parentEl: HTMLElement;
        readonly target: IElView;
        isEditing: boolean;
        dataContext: any;
        readonly app: IApplication;
    }
}
declare module "jriapp_content/template" {
    import { IContent, IApplication, ITemplate, IConstructorContentOptions } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    export class TemplateContent extends BaseObject implements IContent {
        private _parentEl;
        private _template;
        private _templateInfo;
        private _isEditing;
        private _dataContext;
        private _app;
        private _isDisabled;
        private _templateID;
        constructor(options: IConstructorContentOptions);
        handleError(error: any, source: any): boolean;
        private getTemplateID();
        private createTemplate();
        protected render(): void;
        protected cleanUp(): void;
        destroy(): void;
        toString(): string;
        readonly app: IApplication;
        readonly parentEl: HTMLElement;
        readonly template: ITemplate;
        isEditing: boolean;
        dataContext: any;
    }
}
declare module "jriapp_elview/input" {
    import { BaseElView } from "jriapp_elview/elview";
    export class InputElView extends BaseElView {
        toString(): string;
        isEnabled: boolean;
        value: string;
    }
}
declare module "jriapp_elview/textbox" {
    import { IViewOptions } from "jriapp_core/shared";
    import { InputElView } from "jriapp_elview/input";
    export interface ITextBoxOptions extends IViewOptions {
        updateOnKeyUp?: boolean;
    }
    export type TKeyPressArgs = {
        keyCode: number;
        value: string;
        isCancel: boolean;
    };
    export class TextBoxElView extends InputElView {
        constructor(options: ITextBoxOptions);
        protected _getEventNames(): string[];
        addOnKeyPress(fn: (sender: TextBoxElView, args: TKeyPressArgs) => void, nmspace?: string): void;
        removeOnKeyPress(nmspace?: string): void;
        toString(): string;
        color: string;
    }
}
declare module "jriapp_content/string" {
    import { IFieldInfo } from "jriapp_core/shared";
    import { BasicContent } from "jriapp_content/basic";
    export class StringContent extends BasicContent {
        static __allowedKeys: number[];
        private readonly _allowedKeys;
        protected render(): void;
        protected previewKeyPress(fieldInfo: IFieldInfo, keyCode: number, value: string): boolean;
        toString(): string;
    }
}
declare module "jriapp_elview/textarea" {
    import { BaseElView } from "jriapp_elview/elview";
    import { ITextBoxOptions, TKeyPressArgs } from "jriapp_elview/textbox";
    export interface ITextAreaOptions extends ITextBoxOptions {
        wrap?: string;
    }
    export class TextAreaElView extends BaseElView {
        constructor(options: ITextAreaOptions);
        protected _getEventNames(): string[];
        addOnKeyPress(fn: (sender: TextAreaElView, args: TKeyPressArgs) => void, nmspace?: string): void;
        removeOnKeyPress(nmspace?: string): void;
        toString(): string;
        value: string;
        isEnabled: boolean;
        wrap: any;
    }
}
declare module "jriapp_content/multyline" {
    import { IElView, IConstructorContentOptions, IFieldInfo } from "jriapp_core/shared";
    import { BasicContent } from "jriapp_content/basic";
    export class MultyLineContent extends BasicContent {
        static __allowedKeys: number[];
        private readonly _allowedKeys;
        constructor(options: IConstructorContentOptions);
        protected createTargetElement(): IElView;
        protected render(): void;
        protected previewKeyPress(fieldInfo: IFieldInfo, keyCode: number, value: string): boolean;
        toString(): string;
    }
}
declare module "jriapp_elview/checkbox" {
    import { IViewOptions } from "jriapp_core/shared";
    import { InputElView } from "jriapp_elview/input";
    export class CheckBoxElView extends InputElView {
        private _checked;
        constructor(options: IViewOptions);
        protected _updateState(): void;
        toString(): string;
        checked: boolean;
    }
}
declare module "jriapp_content/bool" {
    import { IElView } from "jriapp_core/shared";
    import { CheckBoxElView } from "jriapp_elview/checkbox";
    import { BasicContent } from "jriapp_content/basic";
    export class BoolContent extends BasicContent {
        protected init(): void;
        protected cleanUp(): void;
        protected createCheckBoxView(): CheckBoxElView;
        protected createTargetElement(): IElView;
        protected updateCss(): void;
        destroy(): void;
        render(): void;
        toString(): string;
    }
}
declare module "jriapp_content/number" {
    import { IBindingOptions, IBindingInfo, IBaseObject } from "jriapp_core/shared";
    import { BasicContent } from "jriapp_content/basic";
    export class NumberContent extends BasicContent {
        static __allowedKeys: number[];
        private readonly _allowedKeys;
        protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string): IBindingOptions;
        protected render(): void;
        protected previewKeyPress(keyCode: number, value: string): boolean;
        toString(): string;
    }
}
declare module "jriapp_content/date" {
    import { IConstructorContentOptions, IBindingInfo, IBindingOptions, IElView, IBaseObject } from "jriapp_core/shared";
    import { BasicContent } from "jriapp_content/basic";
    export class DateContent extends BasicContent {
        constructor(options: IConstructorContentOptions);
        protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string): IBindingOptions;
        protected createTargetElement(): IElView;
        toString(): string;
    }
}
declare module "jriapp_content/datetime" {
    import { IBindingInfo, IBaseObject, IBindingOptions } from "jriapp_core/shared";
    import { BasicContent } from "jriapp_content/basic";
    export class DateTimeContent extends BasicContent {
        protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string): IBindingOptions;
        toString(): string;
    }
}
declare module "jriapp_content/factory" {
    import { IContentFactory, IContentFactoryList, IContentOptions, IContentConstructor, IConstructorContentOptions, TFactoryGetter, IContent } from "jriapp_core/shared";
    export { css as contentCSS } from "jriapp_content/int";
    export { BasicContent } from "jriapp_content/basic";
    export { TemplateContent } from "jriapp_content/template";
    export { StringContent } from "jriapp_content/string";
    export { MultyLineContent } from "jriapp_content/multyline";
    export { BoolContent } from "jriapp_content/bool";
    export { NumberContent } from "jriapp_content/number";
    export { DateContent } from "jriapp_content/date";
    export { DateTimeContent } from "jriapp_content/datetime";
    export class ContentFactory implements IContentFactory {
        constructor();
        getContentType(options: IContentOptions): IContentConstructor;
        createContent(options: IConstructorContentOptions): IContent;
        isExternallyCachable(contentType: IContentConstructor): boolean;
    }
    export class FactoryList implements IContentFactoryList {
        private _factory;
        constructor();
        addFactory(factoryGetter: TFactoryGetter): void;
        getContentType(options: IContentOptions): IContentConstructor;
        createContent(options: IConstructorContentOptions): IContent;
        isExternallyCachable(contentType: IContentConstructor): boolean;
    }
    export const contentFactories: FactoryList;
}
declare module "jriapp_core/datepicker" {
    import { IDatepicker } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { TextBoxElView, ITextBoxOptions } from "jriapp_elview/textbox";
    export class Datepicker extends BaseObject implements IDatepicker {
        private _datepickerRegion;
        private _dateFormat;
        constructor();
        toString(): string;
        attachTo($el: any, options?: {
            dateFormat?: string;
        }): void;
        detachFrom($el: any): void;
        parseDate(str: string): Date;
        formatDate(date: Date): string;
        dateFormat: string;
        datepickerRegion: string;
        readonly datePickerFn: any;
    }
    export interface IDatePickerOptions extends ITextBoxOptions {
        datepicker?: any;
    }
    export class DatePickerElView extends TextBoxElView {
        constructor(options: IDatePickerOptions);
        destroy(): void;
        toString(): string;
    }
}
declare module "jriapp_core/dataform" {
    import { IApplication, IBaseObject, IValidationInfo, IViewOptions } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { BaseElView } from "jriapp_elview/elview";
    export const css: {
        dataform: string;
        error: string;
    };
    export interface IDataFormOptions {
        app: IApplication;
        el: HTMLElement;
    }
    export class DataForm extends BaseObject {
        private static _DATA_FORM_SELECTOR;
        private static _DATA_CONTENT_SELECTOR;
        private _el;
        private _$el;
        private _objId;
        private _dataContext;
        private _isEditing;
        private _content;
        private _lfTime;
        private _contentCreated;
        private _editable;
        private _errNotification;
        private _parentDataForm;
        private _errors;
        private _app;
        private _isInsideTemplate;
        private _contentPromise;
        constructor(options: IDataFormOptions);
        handleError(error: any, source: any): boolean;
        private _getBindings();
        private _getElViews();
        private _createContent();
        private _updateCreatedContent();
        private _updateContent();
        private _onDSErrorsChanged(sender?, args?);
        _onIsEditingChanged(sender: any, args: any): void;
        private _bindDS();
        private _unbindDS();
        private _clearContent();
        destroy(): void;
        toString(): string;
        readonly app: IApplication;
        readonly el: HTMLElement;
        dataContext: IBaseObject;
        isEditing: boolean;
        validationErrors: IValidationInfo[];
        isInsideTemplate: boolean;
    }
    export class DataFormElView extends BaseElView {
        private _form;
        constructor(options: IViewOptions);
        protected _getErrorTipInfo(errors: IValidationInfo[]): string;
        protected _updateErrorUI(el: HTMLElement, errors: IValidationInfo[]): void;
        destroy(): void;
        toString(): string;
        dataContext: IBaseObject;
        readonly form: DataForm;
    }
}
declare module "jriapp_elview/command" {
    import { IViewOptions } from "jriapp_core/shared";
    import { ICommand } from "jriapp_core/mvvm";
    import { BaseElView } from "jriapp_elview/elview";
    export interface ICommandViewOptions extends IViewOptions {
        preventDefault?: boolean;
        stopPropagation?: boolean;
    }
    export class CommandElView extends BaseElView {
        private _command;
        private _commandParam;
        private _preventDefault;
        private _stopPropagation;
        private _disabled;
        constructor(options: ICommandViewOptions);
        private _onCanExecuteChanged(cmd, args);
        protected _onCommandChanged(): void;
        protected invokeCommand(args: any, isAsync: boolean): void;
        destroy(): void;
        toString(): string;
        isEnabled: boolean;
        command: ICommand;
        commandParam: any;
        readonly preventDefault: boolean;
        readonly stopPropagation: boolean;
    }
}
declare module "jriapp_core/template" {
    import { ITemplate, ITemplateEvents, IApplication, IViewOptions } from "jriapp_core/shared";
    import { CommandElView } from "jriapp_elview/command";
    export const css: {
        templateContainer: string;
        templateError: string;
    };
    export interface ITemplateOptions {
        app: IApplication;
        dataContext?: any;
        templEvents?: ITemplateEvents;
    }
    export function create(options: ITemplateOptions): ITemplate;
    export class TemplateElView extends CommandElView implements ITemplateEvents {
        private _template;
        private _isEnabled;
        constructor(options: IViewOptions);
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
        toString(): string;
        isEnabled: boolean;
        readonly template: ITemplate;
    }
}
declare module "jriapp_elview/anchor" {
    import { IViewOptions } from "jriapp_core/shared";
    import { CommandElView } from "jriapp_elview/command";
    export interface IAncorOptions extends IViewOptions {
        imageSrc?: string;
        glyph?: string;
    }
    export class AnchorElView extends CommandElView {
        private _imageSrc;
        private _glyph;
        private _image;
        private _span;
        constructor(options: IAncorOptions);
        protected _onClick(e: Event): void;
        protected _updateImage(src: string): void;
        protected _updateGlyph(glyph: string): void;
        destroy(): void;
        toString(): string;
        imageSrc: string;
        glyph: string;
        html: string;
        text: string;
        href: string;
    }
}
declare module "jriapp_elview/span" {
    import { BaseElView } from "jriapp_elview/elview";
    export class SpanElView extends BaseElView {
        toString(): string;
        text: string;
        value: string;
        html: string;
        color: string;
        fontSize: string;
    }
}
declare module "jriapp_elview/block" {
    import { SpanElView } from "jriapp_elview/span";
    export class BlockElView extends SpanElView {
        toString(): string;
        width: number;
        height: number;
    }
}
declare module "jriapp_elview/busy" {
    import { IViewOptions } from "jriapp_core/shared";
    import { BaseElView } from "jriapp_elview/elview";
    export interface IBusyViewOptions extends IViewOptions {
        img?: string;
        delay?: number | string;
    }
    export class BusyElView extends BaseElView {
        private _delay;
        private _timeOut;
        private _loaderPath;
        private _$loader;
        private _isBusy;
        constructor(options: IBusyViewOptions);
        destroy(): void;
        toString(): string;
        isBusy: boolean;
        delay: number;
    }
}
declare module "jriapp_elview/button" {
    import { IViewOptions } from "jriapp_core/shared";
    import { CommandElView } from "jriapp_elview/command";
    export class ButtonElView extends CommandElView {
        constructor(options: IViewOptions);
        protected _onClick(e: Event): void;
        toString(): string;
        value: string;
        text: string;
        html: string;
    }
}
declare module "jriapp_elview/checkbox3" {
    import { IViewOptions } from "jriapp_core/shared";
    import { InputElView } from "jriapp_elview/input";
    export class CheckBoxThreeStateElView extends InputElView {
        private _checked;
        constructor(options: IViewOptions);
        protected _updateState(): void;
        toString(): string;
        checked: boolean;
    }
}
declare module "jriapp_elview/expander" {
    import { AnchorElView, IAncorOptions } from "jriapp_elview/anchor";
    export interface IExpanderOptions extends IAncorOptions {
        expandedsrc?: string;
        collapsedsrc?: string;
        isExpanded?: boolean;
    }
    export const PROP_NAME: {
        isExpanded: string;
    };
    export class ExpanderElView extends AnchorElView {
        private _expandedsrc;
        private _collapsedsrc;
        private _isExpanded;
        constructor(options: IExpanderOptions);
        protected refresh(): void;
        protected _onCommandChanged(): void;
        protected _onClick(e: any): void;
        invokeCommand(): void;
        toString(): string;
        isExpanded: boolean;
    }
}
declare module "jriapp_elview/hidden" {
    import { InputElView } from "jriapp_elview/input";
    export class HiddenElView extends InputElView {
        toString(): string;
    }
}
declare module "jriapp_elview/img" {
    import { IViewOptions } from "jriapp_core/shared";
    import { BaseElView } from "jriapp_elview/elview";
    export class ImgElView extends BaseElView {
        constructor(options: IViewOptions);
        toString(): string;
        src: string;
    }
}
declare module "jriapp_elview/radio" {
    import { CheckBoxElView } from "jriapp_elview/checkbox";
    export class RadioElView extends CheckBoxElView {
        toString(): string;
        value: string;
        readonly name: string;
    }
}
declare module "jriapp_elview/all" {
    export { BaseElView, fn_addToolTip, PropChangedCommand, IEventChangedArgs, EVENT_CHANGE_TYPE } from "jriapp_elview/elview";
    export { AnchorElView, IAncorOptions } from "jriapp_elview/anchor";
    export { BlockElView } from "jriapp_elview/block";
    export { BusyElView, IBusyViewOptions } from "jriapp_elview/busy";
    export { ButtonElView } from "jriapp_elview/button";
    export { CheckBoxElView } from "jriapp_elview/checkbox";
    export { CheckBoxThreeStateElView } from "jriapp_elview/checkbox3";
    export { CommandElView } from "jriapp_elview/command";
    export { ExpanderElView, IExpanderOptions } from "jriapp_elview/expander";
    export { HiddenElView } from "jriapp_elview/hidden";
    export { ImgElView } from "jriapp_elview/img";
    export { InputElView } from "jriapp_elview/input";
    export { RadioElView } from "jriapp_elview/radio";
    export { SpanElView } from "jriapp_elview/span";
    export { TextAreaElView, ITextAreaOptions } from "jriapp_elview/textarea";
    export { TextBoxElView, ITextBoxOptions, TKeyPressArgs } from "jriapp_elview/textbox";
}
declare module "jriapp_collection/int" {
    import { DATE_CONVERSION, DATA_TYPE, SORT_ORDER } from "jriapp_core/const";
    import { IBaseObject, IErrorNotification, IEditable, ISubmittable, TEventHandler, IFieldInfo, TPropChangedHandler, IPromise, IValidationInfo } from "jriapp_core/shared";
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
    };
    export const ITEM_EVENTS: {
        errors_changed: string;
        destroyed: string;
    };
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
        raiseErrorsChanged(args: any): void;
        readonly isCanSubmit: boolean;
        readonly status: ITEM_STATUS;
        readonly isNew: boolean;
        readonly isDeleted: boolean;
        readonly collection: ICollection<TItem>;
        readonly isUpdating: boolean;
        readonly isHasChanges: boolean;
        readonly isEditing: boolean;
        isCached: boolean;
        isDetached: boolean;
        key: string;
        item: TItem;
    }
    export interface ICollectionItem extends IBaseObject {
        readonly _aspect: IItemAspect<ICollectionItem>;
        _key: string;
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
    export interface ICollValidateArgs<TItem extends ICollectionItem> {
        item: TItem;
        fieldName: string;
        errors: string[];
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
        addOnClearing(fn: TEventHandler<ICollection<TItem>, any>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnClearing(nmspace?: string): void;
        addOnCleared(fn: TEventHandler<ICollection<TItem>, any>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnCleared(nmspace?: string): void;
        addOnCollChanged(fn: TEventHandler<ICollection<TItem>, ICollChangedArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnCollChanged(nmspace?: string): void;
        addOnFill(fn: TEventHandler<ICollection<TItem>, ICollFillArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnFill(nmspace?: string): void;
        addOnValidate(fn: TEventHandler<ICollection<TItem>, ICollValidateArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnValidate(nmspace?: string): void;
        addOnItemDeleting(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnItemDeleting(nmspace?: string): void;
        addOnItemAdding(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnItemAdding(nmspace?: string): void;
        addOnItemAdded(fn: TEventHandler<ICollection<TItem>, IItemAddedArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnItemAdded(nmspace?: string): void;
        addOnCurrentChanging(fn: TEventHandler<ICollection<TItem>, ICurrentChangingArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnCurrentChanging(nmspace?: string): void;
        addOnPageChanging(fn: TEventHandler<ICollection<TItem>, IPageChangingArgs>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnPageChanging(nmspace?: string): void;
        addOnErrorsChanged(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnErrorsChanged(nmspace?: string): void;
        addOnBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnBeginEdit(nmspace?: string): void;
        addOnEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnEndEdit(nmspace?: string): void;
        addOnCommitChanges(fn: TEventHandler<ICollection<TItem>, ICommitChangesArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnCommitChanges(nmspace?: string): void;
        addOnStatusChanged(fn: TEventHandler<ICollection<TItem>, ICollItemStatusArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
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
        getItemsWithErrors(): TItem[];
        getIsHasErrors(): boolean;
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
        options: ICollectionOptions;
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
        validateItem(item: TItem): IValidationInfo;
        validateItemField(item: TItem, fieldName: string): IValidationInfo;
        addErrors(item: TItem, errors: IValidationInfo[]): void;
        addError(item: TItem, fieldName: string, errors: string[]): void;
        removeError(item: TItem, fieldName: string): void;
        removeAllErrors(item: TItem): void;
        getErrors(item: TItem): IErrors;
        onErrorsChanged(item: TItem): void;
        onItemDeleting(args: ICancellableArgs<TItem>): boolean;
    }
}
declare module "jriapp_collection/utils" {
    import { IFieldInfo } from "jriapp_core/shared";
    import { IValueUtils } from "jriapp_collection/int";
    export let valueUtils: IValueUtils;
    export function fn_getPropertyByName(name: string, props: IFieldInfo[]): IFieldInfo;
    export type TraveseFieldCB<T> = (fld: IFieldInfo, name: string, parent_res?: T) => T;
    export function fn_traverseField<T>(fld: IFieldInfo, fn: TraveseFieldCB<T>, parent_res?: T): void;
    export function fn_traverseFields<T>(flds: IFieldInfo[], fn: TraveseFieldCB<T>, parent_res?: T): void;
}
declare module "jriapp_collection/validation" {
    import { BaseError, IValidationInfo } from "jriapp_core/shared";
    export class ValidationError extends BaseError {
        private _errors;
        private _item;
        constructor(errorInfo: IValidationInfo[], item: any);
        readonly item: any;
        readonly errors: IValidationInfo[];
    }
    export class Validations {
        private static _dtRangeToDate(str);
        static checkNumRange(num: number, range: string): void;
        static checkDateRange(dt: Date, range: string): void;
    }
}
declare module "jriapp_collection/base" {
    import { SORT_ORDER } from "jriapp_core/const";
    import { IFieldInfo, IIndexer, IValidationInfo, TEventHandler, TPropChangedHandler, IBaseObject, IPromise } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { WaitQueue } from "jriapp_utils/utils";
    import { ICollectionItem, ICollection, ICollectionOptions, IPermissions, IInternalCollMethods, ICollChangedArgs, ICancellableArgs, ICollFillArgs, ICollEndEditArgs, ICollItemArgs, ICollItemStatusArgs, ICollValidateArgs, ICurrentChangingArgs, ICommitChangesArgs, IItemAddedArgs, IPageChangingArgs, IErrorsList, IErrors, ITEM_STATUS, COLL_CHANGE_REASON, COLL_CHANGE_OPER } from "jriapp_collection/int";
    export class BaseCollection<TItem extends ICollectionItem> extends BaseObject implements ICollection<TItem> {
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
        protected _errors: IErrorsList;
        protected _ignoreChangeErrors: boolean;
        protected _pkInfo: IFieldInfo[];
        protected _isUpdating: boolean;
        protected _waitQueue: WaitQueue;
        protected _internal: IInternalCollMethods<TItem>;
        constructor();
        static getEmptyFieldInfo(fieldName: string): IFieldInfo;
        protected _getEventNames(): string[];
        handleError(error: any, source: any): boolean;
        addOnClearing(fn: TEventHandler<ICollection<TItem>, {
            reason: COLL_CHANGE_REASON;
        }>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnClearing(nmspace?: string): void;
        addOnCleared(fn: TEventHandler<ICollection<TItem>, {
            reason: COLL_CHANGE_REASON;
        }>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnCleared(nmspace?: string): void;
        addOnCollChanged(fn: TEventHandler<ICollection<TItem>, ICollChangedArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnCollChanged(nmspace?: string): void;
        addOnFill(fn: TEventHandler<ICollection<TItem>, ICollFillArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnFill(nmspace?: string): void;
        addOnValidate(fn: TEventHandler<ICollection<TItem>, ICollValidateArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnValidate(nmspace?: string): void;
        addOnItemDeleting(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnItemDeleting(nmspace?: string): void;
        addOnItemAdding(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnItemAdding(nmspace?: string): void;
        addOnItemAdded(fn: TEventHandler<ICollection<TItem>, IItemAddedArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnItemAdded(nmspace?: string): void;
        addOnCurrentChanging(fn: TEventHandler<ICollection<TItem>, ICurrentChangingArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnCurrentChanging(nmspace?: string): void;
        addOnPageChanging(fn: TEventHandler<ICollection<TItem>, IPageChangingArgs>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnPageChanging(nmspace?: string): void;
        addOnErrorsChanged(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnErrorsChanged(nmspace?: string): void;
        addOnBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnBeginEdit(nmspace?: string): void;
        addOnEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnEndEdit(nmspace?: string): void;
        addOnBeforeBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnBeforeBeginEdit(nmspace?: string): void;
        addOnBeforeEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeBeforeOnEndEdit(nmspace?: string): void;
        addOnCommitChanges(fn: TEventHandler<ICollection<TItem>, ICommitChangesArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
        removeOnCommitChanges(nmspace?: string): void;
        addOnStatusChanged(fn: TEventHandler<ICollection<TItem>, ICollItemStatusArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
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
        protected _destroyItems(): void;
        _isHasProp(prop: string): boolean;
        protected _getEditingItem(): TItem;
        protected _getStrValue(val: any, fieldInfo: IFieldInfo): string;
        protected _onBeforeEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void;
        protected _onEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void;
        protected _onCommitChanges(item: TItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void;
        protected _validateItem(item: TItem): IValidationInfo;
        protected _validateItemField(item: TItem, fieldName: string): IValidationInfo;
        protected _addErrors(item: TItem, errors: IValidationInfo[]): void;
        protected _addError(item: TItem, fieldName: string, errors: string[]): void;
        protected _removeError(item: TItem, fieldName: string): void;
        protected _removeAllErrors(item: TItem): void;
        protected _getErrors(item: TItem): IErrors;
        protected _onErrorsChanged(item: TItem): void;
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
        getIsHasErrors(): boolean;
        sort(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any>;
        sortLocal(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any>;
        clear(): void;
        destroy(): void;
        waitForNotLoading(callback: () => void, groupName: string): void;
        toString(): string;
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
    }
}
declare module "jriapp_collection/aspect" {
    import { IIndexer, IValidationInfo, IFieldInfo, IVoidPromise, TEventHandler, IErrorNotification } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { ICollectionItem, IItemAspect, ITEM_STATUS } from "jriapp_collection/int";
    import { BaseCollection } from "jriapp_collection/base";
    export class ItemAspect<TItem extends ICollectionItem> extends BaseObject implements IItemAspect<TItem> {
        private _key;
        private _item;
        private _isEditing;
        private _collection;
        protected _status: ITEM_STATUS;
        protected _saveVals: IIndexer<any>;
        protected _vals: IIndexer<any>;
        protected _notEdited: boolean;
        private _isCached;
        private _isDetached;
        private _valueBag;
        protected _setIsEditing(v: boolean): void;
        constructor(collection: BaseCollection<TItem>);
        protected _getEventNames(): string[];
        protected _onErrorsChanged(args: any): void;
        handleError(error: any, source: any): boolean;
        protected _beginEdit(): boolean;
        protected _endEdit(): boolean;
        protected _cancelEdit(): boolean;
        protected _validate(): IValidationInfo;
        protected _skipValidate(fieldInfo: IFieldInfo, val: any): boolean;
        protected _validateField(fieldName: string): IValidationInfo;
        protected _validateAll(): IValidationInfo[];
        protected _checkVal(fieldInfo: IFieldInfo, val: any): any;
        protected _resetIsNew(): void;
        protected _fakeDestroy(): void;
        _onAttaching(): void;
        _onAttach(): void;
        raiseErrorsChanged(args: any): void;
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
        destroy(): void;
        private _delCustomVal(old);
        toString(): string;
        item: TItem;
        readonly isCanSubmit: boolean;
        readonly status: ITEM_STATUS;
        readonly isNew: boolean;
        readonly isDeleted: boolean;
        key: string;
        readonly collection: BaseCollection<TItem>;
        readonly isUpdating: boolean;
        readonly isEditing: boolean;
        readonly isHasChanges: boolean;
        isCached: boolean;
        isDetached: boolean;
        setCustomVal(name: string, val: any, isOwnVal?: boolean): void;
        getCustomVal(name: string): any;
    }
}
declare module "jriapp_collection/list" {
    import { IIndexer } from "jriapp_core/shared";
    import { ICollectionItem, IPropInfo } from "jriapp_collection/int";
    import { BaseCollection } from "jriapp_collection/base";
    import { ItemAspect } from "jriapp_collection/aspect";
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
        protected _isNew: boolean;
        constructor(coll: BaseList<TItem, TObj>, obj?: TObj);
        _setProp(name: string, val: any): void;
        _getProp(name: string): any;
        _resetIsNew(): void;
        toString(): string;
        readonly list: BaseList<TItem, TObj>;
        readonly vals: IIndexer<any>;
        readonly isNew: boolean;
    }
    export class BaseList<TItem extends IListItem, TObj> extends BaseCollection<TItem> {
        protected _itemType: IListItemConstructor<TItem, TObj>;
        constructor(itemType: IListItemConstructor<TItem, TObj>, props: IPropInfo[]);
        private _updateFieldMap(props);
        protected _attach(item: TItem): number;
        protected _createNew(): TItem;
        protected _getNewKey(item: TItem): string;
        protected createItem(obj?: TObj): TItem;
        destroy(): void;
        fillItems(objArray: TObj[], clearAll?: boolean): void;
        toArray(): TObj[];
        getNewObjects(): TItem[];
        resetNewObjects(): void;
        toString(): string;
    }
}
declare module "jriapp_collection/dictionary" {
    import { IPropInfo } from "jriapp_collection/int";
    import { BaseList, IListItem, IListItemConstructor } from "jriapp_collection/list";
    export class BaseDictionary<TItem extends IListItem, TObj> extends BaseList<TItem, TObj> {
        private _keyName;
        constructor(itemType: IListItemConstructor<TItem, TObj>, keyName: string, props: IPropInfo[]);
        protected _getNewKey(item: TItem): string;
        protected _onItemAdded(item: TItem): void;
        protected _onRemoved(item: TItem, pos: number): void;
        readonly keyName: string;
        toString(): string;
    }
}
declare module "jriapp_collection/item" {
    import { BaseObject } from "jriapp_core/object";
    import { ICollectionItem } from "jriapp_collection/int";
    import { ItemAspect } from "jriapp_collection/aspect";
    export class CollectionItem<TAspect extends ItemAspect<ICollectionItem>> extends BaseObject implements ICollectionItem {
        private __aspect;
        constructor(aspect: TAspect);
        protected _fakeDestroy(): void;
        readonly _aspect: TAspect;
        _key: string;
        destroy(): void;
        toString(): string;
    }
}
declare module "jriapp_collection/collection" {
    export * from "jriapp_collection/int";
    export * from "jriapp_collection/base";
    export * from "jriapp_collection/item";
    export * from "jriapp_collection/aspect";
    export * from "jriapp_collection/list";
    export * from "jriapp_collection/dictionary";
    export * from "jriapp_collection/validation";
    export * from "jriapp_collection/utils";
}
declare module "jriapp_utils/mloader" {
    import { IModuleLoader } from "jriapp_core/shared";
    export function create(): IModuleLoader;
}
declare module "jriapp_core/databindsvc" {
    import { IElViewFactory, IApplication, IDataBindingService } from "jriapp_core/shared";
    export function create(app: IApplication, root: Document | HTMLElement, elViewFactory: IElViewFactory): IDataBindingService;
}
declare module "jriapp_core/app" {
    import { IElViewFactory, IViewType, IIndexer, IApplication, IPromise, IBindingOptions, IAppOptions, IInternalAppMethods, IBaseObject, TEventHandler, IConverter, ITemplate, ITemplateEvents, ITemplateGroupInfo, IBinding, IElViewRegister } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    export class Application extends BaseObject implements IApplication {
        private static _newInstanceNum;
        private _UC;
        private _app_name;
        private _moduleInits;
        private _objId;
        private _objMaps;
        private _exports;
        protected _options: IAppOptions;
        private _elViewFactory;
        private _elViewRegister;
        private _dataBindingService;
        private _internal;
        private _app_state;
        constructor(options?: IAppOptions);
        private _cleanUpObjMaps();
        private _initAppModules();
        handleError(error: any, source: any): boolean;
        protected _getEventNames(): string[];
        protected onStartUp(): any;
        _getInternal(): IInternalAppMethods;
        addOnStartUp(fn: TEventHandler<IApplication, any>, nmspace?: string, context?: IBaseObject): void;
        removeOnStartUp(nmspace?: string): void;
        getExports(): IIndexer<any>;
        bind(opts: IBindingOptions): IBinding;
        registerConverter(name: string, obj: IConverter): void;
        getConverter(name: string): IConverter;
        registerSvc(name: string, obj: any): void;
        getSvc(name: string): any;
        registerElView(name: string, vw_type: IViewType): void;
        registerObject(name: string, obj: any): void;
        getObject(name: string): any;
        startUp(onStartUp?: (app: Application) => any): IPromise<Application>;
        createTemplate(dataContext?: any, templEvents?: ITemplateEvents): ITemplate;
        loadTemplates(url: string): IPromise<any>;
        loadTemplatesAsync(fn_loader: () => IPromise<string>): IPromise<any>;
        registerTemplateLoader(name: string, fn_loader: () => IPromise<string>): void;
        registerTemplateById(name: string, templateId: string): void;
        getTemplateLoader(name: string): () => IPromise<string>;
        registerTemplateGroup(name: string, group: ITemplateGroupInfo): void;
        destroy(): void;
        toString(): string;
        readonly elViewFactory: IElViewFactory;
        readonly elViewRegister: IElViewRegister;
        readonly uniqueID: string;
        readonly options: IAppOptions;
        readonly appName: string;
        readonly appRoot: Document | HTMLElement;
        readonly UC: any;
        readonly app: this;
    }
}
declare module "jriapp" {
    export { DEBUG_LEVEL, DATE_CONVERSION, FIELD_TYPE, DATA_TYPE, SORT_ORDER, FILTER_TYPE, KEYS, BINDING_MODE, BindTo } from "jriapp_core/const";
    export { TEventHandler, TErrorArgs, TErrorHandler, TPropChangedHandler, IDisposable, IIndexer, IBaseObject, IAppOptions, IApplication, TBindingMode, BaseError, ITemplate, ITemplateEvents, IAbortable, IBinding, IBindingInfo, IBindingOptions, IConverter, IContentFactory, IDatepicker, IDeferred, IElView, IThenable, IVoidPromise, IPromise, ITooltipService, IEditable, ISubmittable, ISelectable, ISelectableProvider, IAbortablePromise, IErrorHandler, IFieldInfo, ILifeTimeScope, ITemplateGroupInfo, ITemplateGroupInfoEx, ITemplateInfo, ITemplateLoaderInfo, IValidationInfo, ITaskQueue, IViewOptions } from "jriapp_core/shared";
    export { SysChecks } from "jriapp_utils/syschecks";
    export { STRS as LocaleSTRS, ERRS as LocaleERRS } from "jriapp_core/lang";
    export { BaseConverter } from "jriapp_core/converter";
    export { BaseObject } from "jriapp_core/object";
    export { Debounce, DblClick, DEBUG, ERROR } from "jriapp_utils/coreutils";
    export { bootstrap } from "jriapp_core/bootstrap";
    export { contentFactories } from "jriapp_content/factory";
    export { Binding } from "jriapp_core/binding";
    export * from "jriapp_core/datepicker";
    export { DataForm, DataFormElView } from "jriapp_core/dataform";
    export { create as createTemplate, TemplateElView, ITemplateOptions } from "jriapp_core/template";
    export * from "jriapp_elview/all";
    export { Utils, PropWatcher, WaitQueue, IWaitQueueItem } from "jriapp_utils/utils";
    export * from "jriapp_core/mvvm";
    export { BaseCollection, BaseDictionary, BaseList, ICollection, ICollectionItem, IItemAspect, IListItem, ITEM_STATUS, CollectionItem, ItemAspect, ListItemAspect, IPermissions, ValidationError, COLL_CHANGE_OPER, COLL_CHANGE_REASON, COLL_CHANGE_TYPE } from "jriapp_collection/collection";
    export { Application } from "jriapp_core/app";
    export const VERSION: string;
}
