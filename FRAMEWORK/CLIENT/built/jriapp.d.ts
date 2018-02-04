/// <reference path="../thirdparty/moment.d.ts" />
/// <reference path="jriapp_shared.d.ts" />
declare module "jriapp/const" {
    export const enum SERVICES {
        TOOLTIP_SVC = "ITooltipService",
        DATEPICKER_SVC = "IDatepicker",
        UIERRORS_SVC = "IUIErrorsService",
    }
    export const enum BINDING_MODE {
        OneTime = 0,
        OneWay = 1,
        TwoWay = 2,
        BackWay = 3,
    }
    export const enum STORE_KEY {
        SVC = "svc.",
        CONVERTER = "cnv.",
        OBJECT = "obj.",
        OPTION = "opt.",
    }
    export const enum DATA_ATTR {
        DATA_BIND = "data-bind",
        DATA_VIEW = "data-view",
        DATA_VIEW_OPTIONS = "data-view-options",
        DATA_EVENT_SCOPE = "data-scope",
        DATA_ITEM_KEY = "data-key",
        DATA_CONTENT = "data-content",
        DATA_COLUMN = "data-column",
        DATA_NAME = "data-name",
        DATA_REQUIRE = "data-require",
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
    export const enum ELVIEW_NM {
        DataForm = "dataform",
    }
    export const enum LOADER_GIF {
        Small = "loader2.gif",
        Default = "loader.gif",
    }
    export const enum BindScope {
        Application = 0,
        Template = 1,
        DataForm = 2,
    }
    export const enum BindTo {
        Source = 0,
        Target = 1,
    }
    export const enum SubscribeFlags {
        delegationOn = 0,
        click = 1,
        change = 2,
        keypress = 3,
        keydown = 4,
        keyup = 5,
    }
}
declare module "jriapp/int" {
    import { BINDING_MODE, BindTo, SubscribeFlags, BindScope } from "jriapp/const";
    import { IBaseObject, IDisposable, IIndexer, IPromise, IVoidPromise, IErrorHandler, TEventHandler, IConfig, IValidationInfo } from "jriapp_shared";
    import { IFieldInfo } from "jriapp_shared/collection/int";
    export interface IJRIAppConfig extends IConfig {
        frameworkPath?: string;
        frameworkJS?: string;
        bust?: string;
    }
    export const Config: IJRIAppConfig;
    export class ButtonCss {
        static Edit: string;
        static Delete: string;
        static OK: string;
        static Cancel: string;
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
    export interface IViewOptions {
        css?: string;
        tip?: string;
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
    export interface IBindArgs {
        readonly scope: Document | Element;
        readonly bind: BindScope;
        readonly dataContext: any;
    }
    export interface IDataBindingService extends IDisposable {
        bindTemplate(templateEl: Element, dataContext: any): IPromise<ILifeTimeScope>;
        bindElements(args: IBindArgs): IPromise<ILifeTimeScope>;
        setUpBindings(): IVoidPromise;
        bind(opts: IBindingOptions): IBinding;
    }
    export interface IBindingOptions {
        targetPath: string;
        sourcePath?: string;
        target?: IBaseObject;
        source?: any;
        isSourceFixed?: boolean;
        mode?: BINDING_MODE;
        converter?: IConverter;
        param?: any;
        isEval?: boolean;
    }
    export type TBindingMode = "OneTime" | "OneWay" | "TwoWay" | "BackWay";
    export interface IBindingInfo {
        targetPath: string;
        sourcePath?: string;
        to?: string;
        target?: any;
        source?: any;
        mode?: TBindingMode;
        converter?: any;
        param?: any;
        isEval?: boolean;
    }
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
    export interface ITemplateInfo {
        readID?: string;
        editID?: string;
    }
    export interface IContentOptions {
        name: string;
        readOnly: boolean;
        initContentFn: (content: IExternallyCachable) => void;
        fieldInfo: IFieldInfo;
        css: {
            readCss?: string;
            editCss?: string;
        };
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
    export interface IInternalAppMethods {
        bindTemplate(templateEl: HTMLElement, dataContext: any): IPromise<ILifeTimeScope>;
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
        readonly appRoot: Document | Element;
        readonly viewFactory: IElViewFactory;
    }
    export interface IAppOptions {
        modulesInits?: IIndexer<(app: IApplication) => void>;
        appRoot?: Document | Element;
    }
}
declare module "jriapp/utils/parser" {
    import { IBindingInfo } from "jriapp/int";
    export class Parser {
        static parseOptions(options: string): any[];
        static parseBindings(bindings: string[]): IBindingInfo[];
        static parseViewOptions(options: string, app: any, dataContext: any): any;
    }
}
declare module "jriapp/elview" {
    import { IElViewFactory, IElViewRegister } from "jriapp/int";
    export function createElViewFactory(register: IElViewRegister): IElViewFactory;
    export function createElViewRegister(next?: IElViewRegister): IElViewRegister;
}
declare module "jriapp/content" {
    import { IContentFactoryList } from "jriapp/int";
    export function createContentFactoryList(): IContentFactoryList;
}
declare module "jriapp/defaults" {
    import { BaseObject } from "jriapp_shared";
    import { ButtonCss } from "jriapp/int";
    export class Defaults extends BaseObject {
        private _imagesPath;
        private _dateFormat;
        private _dateTimeFormat;
        private _timeFormat;
        private _decimalPoint;
        private _thousandSep;
        private _decPrecision;
        constructor();
        toString(): string;
        dateFormat: string;
        timeFormat: string;
        dateTimeFormat: string;
        imagesPath: string;
        decimalPoint: string;
        thousandSep: string;
        decPrecision: number;
        readonly ButtonsCSS: typeof ButtonCss;
    }
}
declare module "jriapp/utils/tloader" {
    import { IPromise, BaseObject } from "jriapp_shared";
    import { IApplication, ITemplateGroupInfoEx, ITemplateLoaderInfo } from "jriapp/int";
    export class TemplateLoader extends BaseObject {
        private _templateLoaders;
        private _templateGroups;
        private _promises;
        private _waitQueue;
        constructor();
        dispose(): void;
        addOnLoaded(fn: (sender: TemplateLoader, args: {
            html: string;
            app: IApplication;
        }) => void, nmspace?: string): void;
        offOnLoaded(nmspace?: string): void;
        waitForNotLoading(callback: (...args: any[]) => any, callbackArgs: any): void;
        private _onLoaded(html, app);
        private _getTemplateGroup(name);
        private _registerTemplateLoaderCore(name, loader);
        private _getTemplateLoaderCore(name);
        loadTemplatesAsync(fnLoader: () => IPromise<string>, app: IApplication): IPromise<any>;
        unRegisterTemplateLoader(name: string): void;
        unRegisterTemplateGroup(name: string): void;
        registerTemplateLoader(name: string, loader: ITemplateLoaderInfo): void;
        getTemplateLoader(name: string): () => IPromise<string>;
        registerTemplateGroup(groupName: string, group: ITemplateGroupInfoEx): void;
        loadTemplates(url: string): void;
        readonly isLoading: boolean;
    }
}
declare module "jriapp/utils/domevents" {
    export type TEventNode = {
        fn: THandlerFunc;
        name: string;
        useCapture?: boolean;
    };
    export type TEventNodeArray = TEventNode[];
    export interface INamespaceMap {
        [ns: string]: TEventNodeArray;
    }
    export type TEventList = INamespaceMap;
    export class EventWrap {
        private _ev;
        private _target;
        private _cancelBubble;
        constructor(ev: Event, target: TDomElement);
        readonly type: string;
        readonly target: TDomElement;
        readonly bubbles: boolean;
        readonly defaultPrevented: boolean;
        readonly cancelable: boolean;
        readonly isTrusted: boolean;
        returnValue: boolean;
        readonly srcElement: Element;
        readonly eventPhase: number;
        cancelBubble: boolean;
        readonly timeStamp: number;
        readonly currentTarget: EventTarget;
        readonly originalEvent: Event;
        readonly AT_TARGET: number;
        readonly BUBBLING_PHASE: number;
        readonly CAPTURING_PHASE: number;
        preventDefault(): void;
        stopPropagation(): void;
        stopImmediatePropagation(): void;
    }
    export type TDomElement = Element | Document | Window;
    export type TEventsArgs = {
        nmspace?: string;
        useCapture?: boolean;
    };
    export type TEventsDelegateArgs = {
        nmspace: string;
        matchElement: (el: Element) => boolean;
    };
    export type TEventsArgsOrNamespace = TEventsArgs | string | TEventsDelegateArgs;
    export type THandlerFunc = (evt: any) => void;
    export class DomEvents {
        static on(el: TDomElement, evType: "MSContentZoom", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureChange", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureDoubleTap", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureEnd", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureHold", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureStart", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureTap", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSInertiaStart", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSManipulationStateChanged", listener: (ev: MSManipulationEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerCancel", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerDown", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerEnter", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerLeave", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerMove", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerOut", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerOver", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerUp", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "abort", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "activate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "beforeactivate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "beforedeactivate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "blur", listener: (ev: FocusEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "canplay", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "canplaythrough", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "change", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "click", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "contextmenu", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dblclick", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "deactivate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "drag", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dragend", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dragenter", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dragleave", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dragover", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dragstart", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "drop", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "durationchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "emptied", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "ended", listener: (ev: MediaStreamErrorEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "error", listener: (ev: ErrorEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "focus", listener: (ev: FocusEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "fullscreenchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "fullscreenerror", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "input", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "invalid", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "keydown", listener: (ev: KeyboardEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "keypress", listener: (ev: KeyboardEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "keyup", listener: (ev: KeyboardEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "load", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "loadeddata", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "loadedmetadata", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "loadstart", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mousedown", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mousemove", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mouseout", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mouseover", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mouseup", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mousewheel", listener: (ev: WheelEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mssitemodejumplistitemremoved", listener: (ev: MSSiteModeEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "msthumbnailclick", listener: (ev: MSSiteModeEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pause", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "play", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "playing", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointercancel", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerdown", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerenter", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerleave", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerlockchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerlockerror", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointermove", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerout", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerover", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerup", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "progress", listener: (ev: ProgressEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "ratechange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "readystatechange", listener: (ev: ProgressEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "reset", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "scroll", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "seeked", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "seeking", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "select", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "selectionchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "selectstart", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "stalled", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "stop", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "submit", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "suspend", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "timeupdate", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "touchcancel", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "touchend", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "touchmove", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "touchstart", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "volumechange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "waiting", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "webkitfullscreenchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "webkitfullscreenerror", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "wheel", listener: (ev: WheelEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: string, listener: (ev: EventWrap) => any, args: TEventsDelegateArgs): void;
        static on(el: TDomElement, evType: string, listener: EventListenerOrEventListenerObject, args?: TEventsArgsOrNamespace): void;
        static off(el: TDomElement, evType?: string, nmspace?: string, useCapture?: boolean): void;
        static offNS(el: TDomElement, nmspace?: string): void;
    }
}
declare module "jriapp/utils/dom" {
    import { TFunc } from "jriapp_shared";
    import { DomEvents } from "jriapp/utils/domevents";
    export type TCheckDOMReady = (closure: TFunc) => void;
    export class DomUtils {
        static readonly window: Window;
        static readonly document: Document;
        static readonly ready: TCheckDOMReady;
        static readonly events: typeof DomEvents;
        static getData(el: Node, key: string): any;
        static setData(el: Node, key: string, val: any): void;
        static removeData(el: Node, key?: string): void;
        static isContained(oNode: any, oCont: any): boolean;
        static fromHTML(html: string): HTMLElement[];
        static queryAll<T>(root: Document | Element, selector: string): T[];
        static queryOne<T extends Element>(root: Document | Element, selector: string): T;
        static append(parent: Node, children: Node[]): void;
        static prepend(parent: Node, child: Node): void;
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
    }
}
declare module "jriapp/utils/path" {
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
declare module "jriapp/utils/sloader" {
    import { IStylesLoader } from "jriapp/int";
    export const frameworkCss = "jriapp.css";
    export function createCssLoader(): IStylesLoader;
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
declare module "jriapp/bootstrap" {
    import { IIndexer, IBaseObject, IPromise, TErrorHandler, TEventHandler, BaseObject, IObjectEvents, IWeakMap } from "jriapp_shared";
    import { IApplication, ISelectableProvider, IExports, IConverter, ISvcStore, IContentFactoryList, IElViewRegister, IStylesLoader } from "jriapp/int";
    import { Defaults } from "jriapp/defaults";
    import { TemplateLoader } from "jriapp/utils/tloader";
    export const subscribeWeakMap: IWeakMap, selectableProviderWeakMap: IWeakMap;
    export interface IInternalBootstrapMethods {
        initialize(): IPromise<Bootstrap>;
        registerApp(app: IApplication): void;
        unregisterApp(app: IApplication): void;
        registerObject(root: IExports, name: string, obj: any): void;
        unregisterObject(root: IExports, name: string): void;
        getObject(root: IExports, name: string): any;
        getConverter(name: string): IConverter;
    }
    export const enum BootstrapState {
        None = 0,
        Initializing = 1,
        Initialized = 2,
        Ready = 3,
        Error = 4,
        Disposed = 5,
    }
    export class Bootstrap extends BaseObject implements IExports, ISvcStore {
        static _initFramework(): void;
        private _app;
        private _selectedControl;
        private _defaults;
        private _templateLoader;
        private _bootState;
        private _exports;
        private _internal;
        private _moduleInits;
        private _elViewRegister;
        private _contentFactory;
        private _objId;
        constructor();
        private _bindGlobalEvents();
        private _onTemplateLoaded(html, app);
        private _processOptions(root, app?);
        private _processTemplates(root, app?);
        private _processHTMLTemplates();
        private _processTemplate(name, html, app);
        protected _createObjEvents(): IObjectEvents;
        private _init();
        private _initialize();
        private _registerApp(app);
        private _unregisterApp(app);
        private _destroyApp();
        private _registerObject(root, name, obj);
        private _unregisterObject(root, name);
        private _getObject(root, name);
        private _getConverter(name);
        private _waitLoaded(onLoad);
        private _registerOptions(name, options);
        _getInternal(): IInternalBootstrapMethods;
        addOnDisposed(handler: TEventHandler<Bootstrap, any>, nmspace?: string, context?: object): void;
        offOnDisposed(nmspace?: string): void;
        addOnError(handler: TErrorHandler<Bootstrap>, nmspace?: string, context?: object): void;
        offOnError(nmspace?: string): void;
        addOnLoad(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject): void;
        addOnUnLoad(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject): void;
        addOnInitialize(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject): void;
        addModuleInit(fn: (app: IApplication) => void): boolean;
        getExports(): IIndexer<any>;
        getApp(): IApplication;
        init(onInit: (bootstrap: Bootstrap) => void): void;
        startApp<TApp extends IApplication>(appFactory: () => TApp, onStartUp?: (app: TApp) => void): IPromise<TApp>;
        dispose(): void;
        registerSvc(name: string, obj: any): void;
        unregisterSvc(name: string): any;
        getSvc<T>(name: string): T;
        registerConverter(name: string, obj: IConverter): void;
        getOptions(name: string): string;
        registerElView(name: string, elViewType: any): void;
        getImagePath(imageName: string): string;
        loadOwnStyle(name: string): IPromise<string>;
        toString(): string;
        readonly stylesLoader: IStylesLoader;
        readonly elViewRegister: IElViewRegister;
        readonly contentFactory: IContentFactoryList;
        readonly templateLoader: TemplateLoader;
        selectedControl: ISelectableProvider;
        readonly defaults: Defaults;
        readonly isReady: boolean;
        readonly state: BootstrapState;
    }
    export const bootstrap: Bootstrap;
}
declare module "jriapp/utils/viewchecks" {
    import { IElView } from "jriapp/int";
    export class ViewChecks {
        static isElView: (obj: any) => obj is IElView;
        static isTemplateElView: (obj: any) => boolean;
        static isDataForm: (el: Element) => boolean;
        static isInsideDataForm: (el: Element) => boolean;
        static isInNestedForm: (root: any, forms: Element[], el: Element) => boolean;
        static getParentDataForm: (rootForm: HTMLElement, el: HTMLElement) => HTMLElement;
    }
}
declare module "jriapp/converter" {
    import { IConverter } from "jriapp/int";
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
declare module "jriapp/binding" {
    import { IBaseObject, BaseObject } from "jriapp_shared";
    import { BINDING_MODE } from "jriapp/const";
    import { IBindingInfo, IBindingOptions, IBinding, IConverter } from "jriapp/int";
    export function getBindingOptions(bindInfo: IBindingInfo, defTarget: IBaseObject, dataContext: any): IBindingOptions;
    export class Binding extends BaseObject implements IBinding {
        private _state;
        private _mode;
        private _converter;
        private _param;
        private _isEval;
        private _srcPath;
        private _tgtPath;
        private _srcFixed;
        private _pathItems;
        private _objId;
        private _srcEnd;
        private _tgtEnd;
        private _source;
        private _target;
        private _umask;
        private _cntUtgt;
        private _cntUSrc;
        constructor(options: IBindingOptions);
        dispose(): void;
        private _update();
        private _onSrcErrChanged(errNotif);
        private _getTgtChangedFn(self, obj, prop, restPath, lvl);
        private _getSrcChangedFn(self, obj, prop, restPath, lvl);
        private _addOnPropChanged(obj, prop, fn);
        private _parseSrc(obj, path, lvl);
        private _parseSrc2(obj, path, lvl);
        private _parseTgt(obj, path, lvl);
        private _parseTgt2(obj, path, lvl);
        private _setPathItem(newObj, bindingTo, lvl, path);
        private _cleanUp(obj);
        protected _setTarget(value: any): boolean;
        protected _setSource(value: any): boolean;
        updateTarget(): void;
        updateSource(): void;
        toString(): string;
        readonly uniqueID: string;
        target: IBaseObject;
        source: any;
        readonly targetPath: string[];
        readonly sourcePath: string[];
        sourceValue: any;
        targetValue: any;
        readonly isSourceFixed: boolean;
        readonly mode: BINDING_MODE;
        readonly converter: IConverter;
        readonly param: any;
        isDisabled: boolean;
    }
}
declare module "jriapp/template" {
    import { ITemplate, ITemplateEvents } from "jriapp/int";
    export const enum css {
        templateContainer = "ria-template-container",
        templateError = "ria-template-error",
    }
    export interface ITemplateOptions {
        dataContext?: any;
        templEvents?: ITemplateEvents;
    }
    export function createTemplate(dataContext?: any, templEvents?: ITemplateEvents): ITemplate;
}
declare module "jriapp/utils/lifetime" {
    import { IBaseObject, BaseObject } from "jriapp_shared";
    import { ILifeTimeScope } from "jriapp/int";
    export class LifeTimeScope extends BaseObject implements ILifeTimeScope {
        private _objs;
        constructor();
        static create(): LifeTimeScope;
        addObj(b: IBaseObject): void;
        removeObj(b: IBaseObject): void;
        getObjs(): IBaseObject[];
        dispose(): void;
        toString(): string;
    }
}
declare module "jriapp/utils/propwatcher" {
    import { IBaseObject, BaseObject } from "jriapp_shared";
    export class PropWatcher extends BaseObject {
        private _objId;
        private _objs;
        constructor();
        static create(): PropWatcher;
        addPropWatch(obj: IBaseObject, prop: string, fnOnChange: (prop: string) => void): void;
        addWatch(obj: IBaseObject, props: string[], fnOnChange: (prop: string) => void): void;
        removeWatch(obj: IBaseObject): void;
        dispose(): void;
        toString(): string;
        readonly uniqueID: string;
    }
}
declare module "jriapp/mvvm" {
    import { BaseObject, IBaseObject, TEventHandler, TErrorHandler } from "jriapp_shared";
    import { IApplication } from "jriapp/int";
    export interface ICommand<TParam = any> {
        canExecute: (sender: any, param: TParam) => boolean;
        execute: (sender: any, param: TParam) => void;
        raiseCanExecuteChanged: () => void;
        addOnCanExecuteChanged(fn: (sender: ICommand<TParam>, args: any) => void, nmspace?: string, context?: IBaseObject): void;
        offOnCanExecuteChanged(nmspace?: string): void;
    }
    export type Action<TParam = any, TThis = any> = (this: TThis, sender: any, param: TParam) => void;
    export type Predicate<TParam = any, TThis = any> = (this: TThis, sender: any, param: TParam) => boolean;
    export class Command<TParam = any, TThis = any> extends BaseObject implements ICommand<TParam> {
        protected _action: Action<TParam, TThis>;
        protected _thisObj: TThis;
        protected _predicate: Predicate<TParam, TThis>;
        private _objId;
        constructor(fnAction: Action<TParam, TThis>, thisObj?: TThis, fnCanExecute?: Predicate<TParam, TThis>);
        protected _canExecute(sender: any, param: TParam, context: any): boolean;
        protected _execute(sender: any, param: TParam, context: any): void;
        addOnCanExecuteChanged(fn: (sender: ICommand<TParam>, args: any) => void, nmspace?: string, context?: IBaseObject): void;
        offOnCanExecuteChanged(nmspace?: string): void;
        canExecute(sender: any, param: TParam): boolean;
        execute(sender: any, param: TParam): void;
        dispose(): void;
        raiseCanExecuteChanged(): void;
        toString(): string;
        readonly uniqueID: string;
    }
    export abstract class BaseCommand<TParam = any, TOwner = any> extends Command<TParam, any> {
        private _owner;
        constructor(owner: TOwner);
        protected abstract action(sender: any, param: TParam): void;
        protected abstract isCanExecute(sender: any, param: TParam): boolean;
        readonly owner: TOwner;
    }
    export class ViewModel<TApp extends IApplication = IApplication> extends BaseObject {
        private _objId;
        private _app;
        constructor(app: TApp);
        addOnDisposed(handler: TEventHandler<ViewModel<TApp>, any>, nmspace?: string, context?: object): void;
        offOnDisposed(nmspace?: string): void;
        addOnError(handler: TErrorHandler<ViewModel<TApp>>, nmspace?: string, context?: object): void;
        offOnError(nmspace?: string): void;
        toString(): string;
        readonly uniqueID: string;
        readonly app: TApp;
    }
}
declare module "jriapp/utils/mloader" {
    import { IModuleLoader } from "jriapp/int";
    export function create(): IModuleLoader;
}
declare module "jriapp/databindsvc" {
    import { IElViewFactory, IDataBindingService } from "jriapp/int";
    export function createDataBindSvc(root: Document | Element, elViewFactory: IElViewFactory): IDataBindingService;
}
declare module "jriapp/app" {
    import { IIndexer, TEventHandler, IPromise, TErrorHandler, IBaseObject, BaseObject } from "jriapp_shared";
    import { IElViewFactory, IViewType, IApplication, IBindingOptions, IAppOptions, IInternalAppMethods, IConverter, ITemplateGroupInfo, IBinding } from "jriapp/int";
    export class Application extends BaseObject implements IApplication {
        private _UC;
        private _moduleInits;
        private _objId;
        private _objMaps;
        private _appName;
        private _exports;
        protected _options: IAppOptions;
        private _dataBindingService;
        private _viewFactory;
        private _internal;
        private _appState;
        constructor(options?: IAppOptions);
        private _cleanUpObjMaps();
        private _initAppModules();
        protected onStartUp(): any;
        _getInternal(): IInternalAppMethods;
        addOnDisposed(handler: TEventHandler<IApplication, any>, nmspace?: string, context?: object): void;
        offOnDisposed(nmspace?: string): void;
        addOnError(handler: TErrorHandler<IApplication>, nmspace?: string, context?: object): void;
        offOnError(nmspace?: string): void;
        addOnStartUp(fn: TEventHandler<IApplication, any>, nmspace?: string, context?: IBaseObject): void;
        offOnStartUp(nmspace?: string): void;
        getExports(): IIndexer<any>;
        bind(opts: IBindingOptions): IBinding;
        registerConverter(name: string, obj: IConverter): void;
        getConverter(name: string): IConverter;
        registerSvc(name: string, obj: any): void;
        getSvc(name: string): any;
        registerElView(name: string, vwType: IViewType): void;
        registerObject(name: string, obj: any): void;
        getObject(name: string): any;
        startUp(onStartUp?: (app: IApplication) => any): IPromise<IApplication>;
        loadTemplates(url: string): IPromise<any>;
        loadTemplatesAsync(fnLoader: () => IPromise<string>): IPromise<any>;
        registerTemplateLoader(name: string, fnLoader: () => IPromise<string>): void;
        registerTemplateById(name: string, templateId: string): void;
        getTemplateLoader(name: string): () => IPromise<string>;
        registerTemplateGroup(name: string, group: ITemplateGroupInfo): void;
        dispose(): void;
        toString(): string;
        readonly uniqueID: string;
        readonly options: IAppOptions;
        readonly appName: string;
        readonly appRoot: Document | Element;
        readonly viewFactory: IElViewFactory;
        readonly UC: any;
        readonly app: IApplication;
    }
}
declare module "jriapp" {
    export * from "jriapp_shared";
    export * from "jriapp_shared/collection/const";
    export * from "jriapp_shared/collection/int";
    export * from "jriapp_shared/utils/jsonbag";
    export { Promise } from "jriapp_shared/utils/deferred";
    export { KEYS, BINDING_MODE, BindTo, SubscribeFlags } from "jriapp/const";
    export { IAppOptions, IApplication, TBindingMode, ITemplate, ITemplateEvents, IBinding, IBindingInfo, IBindingOptions, IConverter, IContentFactory, IDatepicker, IElView, ITooltipService, ISelectable, ISelectableProvider, ILifeTimeScope, ITemplateGroupInfo, ITemplateGroupInfoEx, ITemplateInfo, ITemplateLoaderInfo, IViewOptions, ISubscriber } from "jriapp/int";
    export { DomUtils as DOM } from "jriapp/utils/dom";
    export { ViewChecks } from "jriapp/utils/viewchecks";
    export { BaseConverter } from "jriapp/converter";
    export { bootstrap, subscribeWeakMap, selectableProviderWeakMap } from "jriapp/bootstrap";
    export { Binding } from "jriapp/binding";
    export { createTemplate, ITemplateOptions } from "jriapp/template";
    export { LifeTimeScope } from "jriapp/utils/lifetime";
    export { PropWatcher } from "jriapp/utils/propwatcher";
    export { ViewModel, BaseCommand, Command, ICommand } from "jriapp/mvvm";
    export { Application } from "jriapp/app";
    export const VERSION = "2.11.9";
}
