/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BINDING_MODE, BindTo, SubscribeFlags, BindScope } from "./const";
import {
    IBaseObject, IDisposable, IIndexer, IPromise,
    IVoidPromise, IErrorHandler, TEventHandler, IConfig, IValidationInfo
} from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";

// config global variable can be used using this interface
export interface IJRIAppConfig extends IConfig {
    frameworkPath?: string; // "/Scripts/jriapp/"
    frameworkJS?: string; // "jriapp.js"
    bust?: string; // "bust=xyz"
}

// get config variable
export const Config: IJRIAppConfig = (<any>window).jriapp_config || {};

export class ButtonCss {
    static Edit: string = "jriapp-actions jriapp-edit";
    static Delete: string = "jriapp-actions jriapp-delete";
    static OK: string = "jriapp-actions jriapp-ok";
    static Cancel: string = "jriapp-actions jriapp-cancel";
}

export interface ILifeTimeScope extends IBaseObject {
    addObj(b: IBaseObject): void;
    removeObj(b: IBaseObject): void;
    getObjs(): IBaseObject[];
    findAll<TObj extends IBaseObject>(predicate: (obj: IBaseObject) => boolean): TObj[];
    findFirst<TObj extends IBaseObject>(predicate: (obj: IBaseObject) => boolean): TObj;
}

export interface ISubscriber {
    isSubscribed(flag: SubscribeFlags): boolean;
}

export interface IDatepicker {
    datepickerRegion: string;
    dateFormat: string;
    attachTo(el: HTMLElement, options?: any, onSelect?: (dateText?: string) => void): void;
    detachFrom(el: HTMLElement): void;
    parseDate(str: string): Date;
    formatDate(date: Date): string;
}

export interface ISelectable {
    onKeyDown(key: number, event: Event): void;
    onKeyUp(key: number, event: Event): void;
}

export interface ISelectableProvider {
    readonly selectable: ISelectable;
}

export interface IDataProvider {
    getData(): IIndexer<any>;
}

export interface ISvcStore {
    getSvc<T>(name: string): T;
    getSvc(name: string): any;
}

export interface ITemplateLoaderInfo {
    loader: () => IPromise<string>;
    owner: IDataProvider;
}

export interface ITemplateGroupInfo {
    name: string;
    url: string;
    loader: () => IPromise<string>;
    promise: IPromise<string>;
    owner: IDataProvider;
}

export interface IUnResolvedBindingArgs {
    bindTo: BindTo;
    root: any;
    path: string;
    propName: string;
}

// --Template interfaces
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

export interface IViewErrorsService {
    setErrors(el: HTMLElement, errors: IValidationInfo[], toolTip?: string): void;
}

// --ElView interfaces
export interface IViewOptions {
    css?: string;
    tip?: string;
    //use event delegation or not
    nodelegate?: boolean;
    errorsService?: IViewErrorsService;
}

export interface IElViewStore {
    getElView(el: HTMLElement): IElView;
    setElView(el: HTMLElement, view?: IElView): void;
    dispose(): void;
}

export interface IElViewRegister {
    registerElView(name: string, vwType: IViewType): void;
    getElViewType(name: string): IViewType;
    dispose(): void;
}

export interface IElViewInfo {
    readonly el: HTMLElement;
    readonly name: string;
    readonly options: IViewOptions;
}

export interface IElViewFactory {
    createElView(viewInfo: IElViewInfo): IElView;
    getElView(el: HTMLElement): IElView;
    getOrCreateElView(el: Element, dataContext: any): IElView;
    getElementViewInfo(el: Element, dataContext: any): IElViewInfo;
    store: IElViewStore;
    register: IElViewRegister;
    dispose(): void;
}


export interface IViewType {
    new (el: HTMLElement, options: IViewOptions): IElView;
}

export interface IElView extends IBaseObject {
    readonly el: HTMLElement;
    readonly app: IApplication;
    readonly uniqueID: string;
    viewMounted?: () => void;
}

export interface ITemplateElView extends IElView, ITemplateEvents {
}

export interface IConverter {
    convertToSource(val: any, param: any, dataContext: any): any;
    convertToTarget(val: any, param: any, dataContext: any): any;
}

export interface IBinding extends IBaseObject {
    target: IBaseObject;
    source: IBaseObject;
    targetPath: string[];
    sourcePath: string[];
    sourceValue: any;
    targetValue: any;
    readonly isSourceFixed: boolean;
    readonly mode: BINDING_MODE;
    readonly converter: IConverter;
    readonly param: any;
    isDisabled: boolean;
    updateTarget(): void;
    updateSource(): void;
}

export interface IBindArgs  {
    readonly scope: Document | Element;
    readonly bind: BindScope;
    readonly dataContext: any;
}

export interface IDataBindingService extends IDisposable {
    bindTemplate(templateEl: Element, dataContext: any): IPromise<ILifeTimeScope>;
    bindElements(args: IBindArgs): IPromise<ILifeTimeScope>;
    setUpBindings(): IVoidPromise;
    bind(opts: TBindingOptions): IBinding;
}

// --Binding interfaces
export type TBindingOptions = {
    targetPath: string;
    sourcePath?: string;
    target?: IBaseObject;
    source?: any;
    isSourceFixed?: boolean;
    mode?: BINDING_MODE;
    converter?: IConverter;
    param?: any;
    isBind?: boolean;
};

export type TBindingMode = "OneTime" | "OneWay" | "TwoWay" | "BackWay";

// the result of parsing a data binding expression - typically all properties are strings here
export type TBindingInfo = {
    targetPath: string;
    sourcePath?: string;
    to?: string;
    target?: any;
    source?: any;
    mode?: TBindingMode;
    converter?: any;
    param?: any;
    isBind?: boolean;
};

// --Content interfaces
export interface IExternallyCachable {
    addOnObjectCreated(fn: (sender: any, args: {
        objectKey: string;
        result: IBaseObject;
        isCachedExternally: boolean;
    }) => void, nmspace?: string): void;
    addOnObjectNeeded(fn: (sender: any, args: {
        objectKey: string;
        result: IBaseObject;
    }) => void, nmspace?: string): void;
}

export interface IContent extends IBaseObject {
    isEditing: boolean;
    dataContext: any;
    render(): void;
}

export interface IContentConstructor {
    new (options: IConstructorContentOptions): IContent;
}

// it can have two template ids - one for display and one for editing
export interface ITemplateInfo {
    readID?: string;
    editID?: string;
}

export interface IContentOptions {
    name: string;
    readOnly: boolean;
    initContentFn: (content: IExternallyCachable) => void;
    fieldInfo: IFieldInfo;
    css: { readCss?: string; editCss?: string; };
    template: ITemplateInfo;
    fieldName: string;
    options: any;
}

export interface IConstructorContentOptions {
    parentEl: HTMLElement;
    contentOptions: IContentOptions;
    dataContext: any;
    isEditing: boolean;
}

export interface IContentFactory {
    getContentType(options: IContentOptions): IContentConstructor;
    isExternallyCachable(contentType: IContentConstructor): boolean;
}

export interface IContentFactoryList extends IContentFactory {
    addFactory(factoryGetter: TFactoryGetter): void;
}

export type TFactoryGetter = (nextFactory?: IContentFactory) => IContentFactory;

export interface ITooltipService {
    addToolTip(el: Element, tip: string, isError?: boolean, pos?: string): void;
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

// --Application interfaces
export interface IInternalAppMethods extends IDataProvider {
    bindTemplate(templateEl: HTMLElement, dataContext: any): IPromise<ILifeTimeScope>;
    bindElements(args: IBindArgs): IPromise<ILifeTimeScope>;
    getTemplateLoaderInfo(name: string): ITemplateLoaderInfo;
}

export interface IApplication extends IErrorHandler, IDataProvider, IBaseObject {
    _getInternal(): IInternalAppMethods;
    addOnStartUp(fn: TEventHandler<IApplication, any>, nmspace?: string, context?: IBaseObject): void;
    offOnStartUp(nmspace?: string): void;
    registerElView(name: string, vwType: IViewType): void;
    registerConverter(name: string, obj: IConverter): void;
    getConverter(name: string): IConverter;
    registerSvc(name: string, obj: any): void;
    getSvc<T>(name: string): T;
    getSvc(name: string): any;
    registerObject(name: string, obj: any): void;
    getObject<T>(name: string): T;
    getObject(name: string): any;
    loadTemplates(url: string): IPromise<any>;
    registerTemplateLoader(name: string, loader: () => IPromise<string>): void;
    getTemplateLoader(name: string): () => IPromise<string>;
    registerTemplateGroup(name: string, url: string): void;
    getOptions(name: string): string;
    bind(opts: TBindingOptions): IBinding;
    startUp(onStartUp?: (app: IApplication) => any): IPromise<IApplication>;
    readonly uniqueID: string;
    readonly appName: string;
    readonly appRoot: Document | Element;
    readonly viewFactory: IElViewFactory;
}

export interface IAppOptions {
    modulesInits?: IIndexer<(app: IApplication) => void>;
    appRoot?: Document | Element;
}
