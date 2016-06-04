/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BindTo, DUMY_ERROR, TOOLTIP_SVC, STORE_KEY } from "const";
import { IApplication, ISelectable, ISelectableProvider, IExports, IConverter, ISvcStore, IIndexer, IBaseObject, IPromise,
    TEventHandler, IUnResolvedBindingArgs, IStylesLoader, IContentFactory, IContentFactoryList, TFactoryGetter,
    IContentConstructor, IContentOptions, IElViewRegister } from "shared";
import { createRegister as createElViewRegister } from "../jriapp_elview/factory";
import { ERRS } from "lang";
import { BaseObject }  from "object";
import { Defaults } from "defaults";
import { StringUtils as strUtils, CoreUtils as coreUtils, ERROR } from "../jriapp_utils/coreutils";
import { TemplateLoader } from "../jriapp_utils/tloader";
import { create as createCssLoader } from "../jriapp_utils/sloader";
import { PathHelper } from "../jriapp_utils/path";
import { create as createToolTipSvc } from "../jriapp_utils/tooltip";
import { DomUtils as dom } from "../jriapp_utils/dom";
import { AsyncUtils as defer } from "../jriapp_utils/async";

const $ = dom.$, document = dom.document, window = dom.window;

export const cssRiaTemplate = "ria-template";

const GLOB_EVENTS = {
    load: "load",
    unload: "unload",
    initialized: "initialize"
};

const PROP_NAME = {
    curSelectable: "currentSelectable",
    isReady: "isReady"
};


export interface IInternalBootstrapMethods {
    initialize(): void;
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

const _TEMPLATES_SELECTOR = ["section.", cssRiaTemplate].join("");
const _TEMPLATE_SELECTOR = '*[data-role="template"]';
const _TEMPLATE_SELECTOR2 = 'script[type="text/html"][data-role="template"]';
const stylesLoader = createCssLoader();
//load jriapp.css (it will load only if it is not loaded yet)
stylesLoader.loadOwnStyle();

const enum BootstrapState {
    None = 0, Initializing = 1, Initialized = 2, Ready = 3, Error = 4
}

export class Bootstrap extends BaseObject implements IExports, ISvcStore {
    public static _initFramework() {
        $(document).ready(function ($) {
            bootstrap._getInternal().initialize();
        });
    }
    private _appInst: { [name: string]: IApplication; };
    private _currentSelectable: ISelectableProvider;
    private _defaults: Defaults;
    private _templateLoader: TemplateLoader;
    private _bootState: BootstrapState;
    private _exports: IIndexer<any>;
    private _internal: IInternalBootstrapMethods;
    private _moduleInits: { (app: IApplication): void; }[];
    private _elViewRegister: IElViewRegister;

    constructor() {
        super();
        let self = this;
        if (!!bootstrap)
            throw new Error(ERRS.ERR_GLOBAL_SINGLTON);
        this._bootState = BootstrapState.None;
        this._appInst = {};
        this._currentSelectable = null;
        //exported types
        this._exports = {};
        this._moduleInits = [];
        this._templateLoader = null;
        this._templateLoader = new TemplateLoader();
        this._templateLoader.addOnLoaded((s, a) => { self._onTemplateLoaded(a.html, a.app); });
        this._templateLoader.addOnError((s, a) => {
            return self.handleError(a.error, a.source);
        });
        this._elViewRegister = createElViewRegister(null);
        this._internal = {
            initialize: () => {
                self._initialize();
            },
            trackSelectable: (selectable: ISelectableProvider) => {
                self._trackSelectable(selectable);
            },
            untrackSelectable: (selectable: ISelectableProvider) => {
                self._untrackSelectable(selectable);
            },
            registerApp: (app: IApplication) => {
                self._registerApp(app);
            },
            unregisterApp: (app: IApplication) => {
                self._unregisterApp(app);
            },
            destroyApps: () => {
                self._destroyApps();
            },
            registerObject: (root: IExports, name: string, obj: any) => {
                self._registerObject(root, name, obj);
            },
            unregisterObject: (root: IExports, name: string) => {
                self._unregisterObject(root, name);
            },
            getObject: (root: IExports, name: string) => {
                return self._getObject(root, name);
            },
            getConverter: (name: string) => {
                return self._getConverter(name);
            }
        };
        this._defaults = new Defaults(this);
        this.defaults.imagesPath = PathHelper.getFrameworkImgPath();
    }
    private _onInit(): void {
        let self = this;
        let $win = $(window), $doc = $(document);

        //when clicked outside any Selectable set _currentSelectable = null
        $doc.on("click.global", function (e) {
            e.stopPropagation();
            self.currentSelectable = null;
        });
        $doc.on("keydown.global", function (e) {
            e.stopPropagation();
            if (!!self._currentSelectable) {
                self._currentSelectable.getISelectable().onKeyDown(e.which, e);
            }
        });
        $doc.on("keyup.global", function (e) {
            e.stopPropagation();
            if (!!self._currentSelectable) {
                self._currentSelectable.getISelectable().onKeyUp(e.which, e);
            }
        });
        $win.unload(function () {
            self.raiseEvent(GLOB_EVENTS.unload, {});
        });

        //this is a way to attach for correct work in firefox
        dom.window.onerror = function (msg: any, url: string, linenumber: number) {
            if (!!msg && msg.toString().indexOf(DUMY_ERROR) > -1) {
                return true;
            }
            alert("Error: " + msg + "\nURL: " + url + "\nLine Number: " + linenumber);
            return false;
        }
    }
    private _onTemplateLoaded(html: string, app: IApplication) {
        let tmpDiv = document.createElement("div");
        tmpDiv.innerHTML = html;
        this._processTemplateSection(tmpDiv, app);
    }
    /*
    private _processTemplateSections(): void {
        let self = this, root = dom.document;
        let sections = coreUtils.arr.fromList<HTMLElement>(root.querySelectorAll(_TEMPLATES_SELECTOR));
        sections.forEach(function (el) {
            self._processTemplateSection(el, null);
            dom.removeNode(el);
        });
    }
    */
    private _processTemplateSection(templateSection: { querySelectorAll: (selectors: string) => NodeList; }, app: IApplication): void {
        let self = this, templates = coreUtils.arr.fromList<HTMLElement>(templateSection.querySelectorAll(_TEMPLATE_SELECTOR));
        templates.forEach(function (el) {
            let html: string, name = el.getAttribute("id");
            if (!name)
                throw new Error(ERRS.ERR_TEMPLATE_HAS_NO_ID);
            el.removeAttribute("id");
            html = el.outerHTML;
            self._processTemplate(name, html, app);
        });
    }
    //process templates inside script tags
    private _processScriptTemplates(): void {
        let self = this, root = dom.document, templates = coreUtils.arr.fromList<HTMLScriptElement>(root.querySelectorAll(_TEMPLATE_SELECTOR2));
        templates.forEach(function (el) {
            let name = el.getAttribute("id");
            if (!name)
                throw new Error(ERRS.ERR_TEMPLATE_HAS_NO_ID);
            let html = el.innerHTML;
            self._processTemplate(name, html, null);
        });
    }
    private _processTemplate(name: string, html: string, app: IApplication): void {
        let self = this, deferred = defer.createSyncDeferred<string>();
        deferred.resolve(html);
        let fn = function () {
            return deferred.promise();
        };
        if (!!app) {
            name = app.appName + "." + name;
        }
        //template already loaded, register function which returns the template immediately
        self.templateLoader.registerTemplateLoader(name, {
            fn_loader: fn
        });
    }
    protected _getEventNames(): string[] {
        let base_events = super._getEventNames();
        let events = Object.keys(GLOB_EVENTS).map((key, i, arr) => { return <string>(<any>GLOB_EVENTS)[key]; });
        return events.concat(base_events);
    }
    protected _addHandler(name: string, fn: (sender: any, args: any) => void, nmspace?: string, context?: IBaseObject, prepend?: boolean) {
        let self = this, isReady = self._bootState === BootstrapState.Ready;
        let isIntialized = (self._bootState === BootstrapState.Initialized || self._bootState === BootstrapState.Ready);

        if ((name === GLOB_EVENTS.load && isReady) || (name === GLOB_EVENTS.initialized && isIntialized)) {
            //when already is ready, immediately raise the event
            setTimeout(function () { fn.apply(self, [self, {}]); }, 0);
            return;
        }
        super._addHandler(name, fn, nmspace, context, prepend);
    }
    private _init(): void {
        let self = this;
        if (self.getIsDestroyCalled())
            return;
        this._onInit();
        self.registerSvc(TOOLTIP_SVC, createToolTipSvc());
        self.addOnInitialize((s, a) => {
            setTimeout(() => {
                if (self.getIsDestroyCalled())
                    return;
                self.removeHandler(GLOB_EVENTS.initialized, null);
            }, 0);
        });
        self._bootState = BootstrapState.Initialized;
        self.raiseEvent(GLOB_EVENTS.initialized, {});
        try {
            //self._processTemplateSections();
            self._processScriptTemplates();
        }
        catch (err) {
            self._bootState = BootstrapState.Error;
            self.handleError(err, self);
            ERROR.throwDummy(err);
        }

        self.addOnLoad((s, a) => {
            setTimeout(() => {
                if (self.getIsDestroyCalled())
                    return;
                self.removeHandler(GLOB_EVENTS.load, null);
            }, 0);
        });
        self._bootState = BootstrapState.Ready;
        setTimeout(() => {
            if (self.getIsDestroyCalled())
                return;
            self.raisePropertyChanged(PROP_NAME.isReady);
            self.raiseEvent(GLOB_EVENTS.load, {});
        }, 0);
    }
    private _initialize(): void {
        if (this._bootState !== BootstrapState.None)
            return;
        this._bootState = BootstrapState.Initializing;
        this.stylesLoader.whenAllLoaded().then((val) => {
            this._init();
        }, (err) => {
            this._bootState = BootstrapState.Error;
            this.handleError(err, this);
        });
    }
    private _trackSelectable(selectable: ISelectableProvider): void {
        let self = this, isel = selectable.getISelectable(), el = isel.getContainerEl();
        $(el).on("click." + isel.getUniqueID(), function (e) {
            e.stopPropagation();
            let target = e.target;
            if (dom.isContained(target, el))
                self.currentSelectable = selectable;
        });
    }
    private _untrackSelectable(selectable: ISelectableProvider): void {
        let self = this, isel = selectable.getISelectable(), el = isel.getContainerEl();
        $(el).off("click." + isel.getUniqueID());
        if (this.currentSelectable === selectable)
            this.currentSelectable = null;
    }
    private _registerApp(app: IApplication): void {
        if (!this._appInst[app.appName])
            this._appInst[app.appName] = app;
    }
    private _unregisterApp(app: IApplication): void {
        if (!this._appInst[app.appName])
            return;
        delete this._appInst[app.appName];
        this.templateLoader.unRegisterTemplateGroup(app.appName);
        this.templateLoader.unRegisterTemplateLoader(app.appName);
    }
    private _destroyApps(): void {
        let self = this;
        coreUtils.forEachProp(this._appInst, function (id) {
            self._appInst[id].destroy();
        });
    }
    private _registerObject(root: IExports, name: string, obj: any): void {
        coreUtils.setValue(root.getExports(), name, obj, true);
    }
    private _unregisterObject(root: IExports, name: string): any {
        return coreUtils.removeValue(root.getExports(), name);
    }
    private _getObject(root: IExports, name: string): any {
        return coreUtils.getValue(root.getExports(), name);
    }
    private _getConverter(name: string): IConverter {
        let name2 = STORE_KEY.CONVERTER + name;
        let res = this._getObject(this, name2);
        if (!res)
            throw new Error(strUtils.format(ERRS.ERR_CONVERTER_NOTREGISTERED, name));
        return res;
    }
    _getInternal(): IInternalBootstrapMethods {
        return this._internal;
    }
    addOnLoad(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject) {
        this._addHandler(GLOB_EVENTS.load, fn, nmspace, context, false);
    }
    addOnUnLoad(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject) {
        this._addHandler(GLOB_EVENTS.unload, fn, nmspace, context, false);
    }
    addOnInitialize(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject) {
        this._addHandler(GLOB_EVENTS.initialized, fn, nmspace, context, false);
    }
    addModuleInit(fn: (app: IApplication) => void): boolean {
        if (this._moduleInits.filter((val) => { return val === fn; }).length === 0) {
            this._moduleInits.push(fn);
            return true;
        }
        return false;
    }
    getExports(): IIndexer<any> {
        return this._exports;
    }
    findApp(name: string): IApplication {
        return this._appInst[name];
    }
    init(onInit: (bootstrap: Bootstrap) => void): void {
        let self = this;
        self.addOnInitialize((s, a) => {
            try {
                onInit(self);
            }
            catch (err) {
                self.handleError(err, self);
                throw err;
            }
        });
    }
    startApp<TApp extends IApplication>(appFactory: () => TApp, onStartUp?: (app: TApp) => void): void {
        let self = this;
        let fn_start = () => {
            try {
                let app = appFactory();
                app.startUp(onStartUp);
            }
            catch (err) {
                self.handleError(err, self);
                throw err;
            }
        };
        self.init((sender) => {
            self.addOnLoad((s, a) => { setTimeout(() => { fn_start(); }, 0); });
        });
    }
    destroy(): void {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let self = this;
        self._removeHandler();
        self._destroyApps();
        self._exports = {};
        if (self._templateLoader !== null) {
            self._templateLoader.destroy();
            self._templateLoader = null;
        }
        self._elViewRegister.destroy();
        self._elViewRegister = null;
        self._moduleInits = [];
        $(dom.document).off(".global");
        dom.window.onerror = null;
        super.destroy();
    }
    registerSvc(name: string, obj: any) {
        let name2 = STORE_KEY.SVC + name;
        return this._registerObject(this, name2, obj);
    }
    unregisterSvc(name: string, obj: any) {
        let name2 = STORE_KEY.SVC + name;
        return this._unregisterObject(this, name2);
    }
    getSvc<T>(name: string): T;
    getSvc(name: string): any {
        let name2 = STORE_KEY.SVC + name;
        return this._getObject(this, name2);
    }
    registerConverter(name: string, obj: IConverter) {
        let name2 = STORE_KEY.CONVERTER + name;
        if (!this._getObject(this, name2)) {
            this._registerObject(this, name2, obj);
        }
        else
            throw new Error(strUtils.format(ERRS.ERR_OBJ_ALREADY_REGISTERED, name));
    }
    registerElView(name: string, elViewType: any) {
        this._elViewRegister.registerElView(name, elViewType);
    }
    getImagePath(imageName: string) {
        let images = this.defaults.imagesPath;
        return images + imageName;
    }
    //Loads CSS placed in Framework's styles directory (it needs just file name)
    //if no name provided it loads jriapp.css
    loadOwnStyle(name: string): IPromise<string> {
        return this.stylesLoader.loadOwnStyle(name);
    }
    toString() {
        return "JRIApp Bootstrap";
    }
    get stylesLoader() { return stylesLoader; }
    get elViewRegister() { return this._elViewRegister; }
    get templateLoader() { return this._templateLoader; }
    get currentSelectable() {
        return this._currentSelectable;
    }
    set currentSelectable(v: ISelectableProvider) {
        if (this._currentSelectable !== v) {
            this._currentSelectable = v;
            this.raisePropertyChanged(PROP_NAME.curSelectable);
        }
    }
    get defaults() {
        return this._defaults;
    }
    get isReady() {
        return this._bootState === BootstrapState.Ready;
    }
}

export const bootstrap = new Bootstrap();