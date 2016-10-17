/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as constsMOD from "const";

//config global variable can be used using this interface
export interface IJRIAppConfig {
    frameworkPath?: string; // "/Scripts/jriapp/"
    frameworkJS?: string; // "jriapp.js"
    bust?: string; // "bust=xyz"
    debugLevel?: constsMOD.DEBUG_LEVEL;
}

//obtain config variable
export const Config: IJRIAppConfig = (<any>window).jriapp_config || {};
export let DebugLevel = (!Config.debugLevel) ? constsMOD.DEBUG_LEVEL.NONE : Config.debugLevel;

export class ButtonCss {
    static Edit: string = "jriapp-actions jriapp-edit";
    static Delete: string = "jriapp-actions jriapp-delete";
    static OK: string = "jriapp-actions jriapp-ok";
    static Cancel: string = "jriapp-actions jriapp-cancel";
}

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

export interface IListNode {
    context: any
    fn: TEventHandler<any, any>;
    next: IListNode;
}
export type IListBucket = IListNode[];

export interface IList {
    //two lists : one - for high priority events, two - ordinary events
    one: { [ns: string]: IListBucket; };
    two: { [ns: string]: IListBucket; };
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

//--Template interfaces
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

//--Collection interfaces
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


//--ElView interfaces
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
    createElView(view_info: { name: string; options: IViewOptions; }): IElView;
    getOrCreateElView(el: HTMLElement): IElView;
    getElementViewInfo(el: HTMLElement): { name: string; options: IViewOptions; };
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

//--Binding interfaces
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

//the result of parsing a data binding expression -typically all properties are strings here
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

//--Content interfaces
export interface IExternallyCachable {
    addOnObjectCreated(fn: (sender: any, args: { objectKey: string; object: IBaseObject; isCachedExternally: boolean; }) => void, nmspace?: string): void;
    addOnObjectNeeded(fn: (sender: any, args: { objectKey: string; object: IBaseObject; }) => void, nmspace?: string): void;
}

export interface IContent extends IBaseObject {
    isEditing: boolean;
    dataContext: any;
}

export interface IContentConstructor {
    new (options: IConstructorContentOptions): IContent;
}

//it can have two template ids - one for display and one for editing
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
    displayInfo?: { displayCss?: string; editCss?: string; };
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

//--Application interfaces
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
        super(constsMOD.DUMY_ERROR);
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
        super(constsMOD.DUMY_ERROR);
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