﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BINDING_MODE, BindTo, SubscribeFlags } from "./const";
import {
    IBaseObject, IDisposable, IIndexer, IPromise,
    IVoidPromise, IValidationInfo, IErrorHandler, TEventHandler, IConfig
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

export interface IConverter {
    convertToSource(val: any, param: any, dataContext: any): any;
    convertToTarget(val: any, param: any, dataContext: any): any;
}

export interface ISelectable {
    onKeyDown(key: number, event: Event): void;
    onKeyUp(key: number, event: Event): void;
}

export interface ISelectableProvider {
    readonly selectable: ISelectable;
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
    bindTo: BindTo;
    root: any;
    path: string;
    propName: string;
}


export interface IBindableElement {
    el: Element;
    needToBind: boolean;
    dataForm: boolean;
    bindings: string[];
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

// --ElView interfaces
export interface IViewOptions {
    css?: string;
    tip?: string;
    el: HTMLElement;
    //use event delegation or not
    nodelegate?: boolean;
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
    readonly name: string;
    readonly options: IViewOptions;
}

export interface IElViewFactory {
    createElView(viewInfo: IElViewInfo): IElView;
    getOrCreateElView(el: Element, dataContext: any): IElView;
    getElementViewInfo(el: Element, dataContext: any): IElViewInfo;
    store: IElViewStore;
    register: IElViewRegister;
    dispose(): void;
}


export interface IViewType {
    new (options: IViewOptions): IElView;
}

export interface IElView extends IBaseObject {
    el: HTMLElement;
    app: IApplication;
    validationErrors: IValidationInfo[];
}

export interface IBindArgs  {
    readonly scope: Document | Element;
    readonly dataContext: any;
    readonly isDataForm: boolean;
    readonly isTemplate: boolean;
}

export interface IDataBindingService extends IDisposable {
    bindTemplateElements(templateEl: Element, dataContext: any): IPromise<ILifeTimeScope>;
    bindElements(args: IBindArgs): IPromise<ILifeTimeScope>;
    setUpBindings(): IVoidPromise;
    bind(opts: IBindingOptions): IBinding;
}

// --Binding interfaces
export interface IBindingOptions {
    mode?: BINDING_MODE;
    converterParam?: any;
    converter?: IConverter;
    targetPath: string;
    sourcePath?: string;
    target?: IBaseObject;
    source?: any;
    isSourceFixed?: boolean;
}

export type TBindingMode = "OneTime" | "OneWay" | "TwoWay" | "BackWay";

// the result of parsing a data binding expression -typically all properties are strings here
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
    mode: BINDING_MODE;
    converter: IConverter;
    converterParam: any;
    isSourceFixed: boolean;
    isDisabled: boolean;
}

// --Content interfaces
export interface IExternallyCachable {
    addOnObjectCreated(fn: (sender: any, args: { objectKey: string; object: IBaseObject; isCachedExternally: boolean; }) => void, nmspace?: string): void;
    addOnObjectNeeded(fn: (sender: any, args: { objectKey: string; object: IBaseObject; }) => void, nmspace?: string): void;
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
export interface IInternalAppMethods {
    bindTemplateElements(templateEl: HTMLElement, dataContext: any): IPromise<ILifeTimeScope>;
    bindElements(args: IBindArgs): IPromise<ILifeTimeScope>;
}

export interface IApplication extends IErrorHandler, IExports, IBaseObject {
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
    loadTemplatesAsync(fnLoader: () => IPromise<string>): IPromise<any>;
    registerTemplateLoader(name: string, fnLoader: () => IPromise<string>): void;
    getTemplateLoader(name: string): () => IPromise<string>;
    registerTemplateGroup(name: string, group: {
        fn_loader?: () => IPromise<string>;
        url?: string;
        names: string[];
   }): void;
    bind(opts: IBindingOptions): IBinding;
    startUp(onStartUp?: (app: IApplication) => any): IPromise<IApplication>;
    readonly uniqueID: string;
    readonly appName: string;
    readonly appRoot: Document | HTMLElement;
    readonly viewFactory: IElViewFactory;
}

export interface IAppOptions {
    modulesInits?: IIndexer<(app: IApplication) => void>;
    appRoot?: Document | HTMLElement;
}
