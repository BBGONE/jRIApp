/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    DUMY_ERROR, IIndexer, IBaseObject, IPromise,
    TEventHandler, TPriority, LocaleERRS, BaseObject, Utils
} from "jriapp_shared";
import { BindTo, TOOLTIP_SVC, STORE_KEY } from "./const";
import { IApplication, ISelectable, ISelectableProvider, IExports, IConverter, ISvcStore,
    IUnResolvedBindingArgs, IStylesLoader, IContentFactory,
    IContentFactoryList, TFactoryGetter, IContentConstructor, IContentOptions, IElViewRegister
} from "./int";
import { createElViewRegister } from "./elview";
import { createContentFactoryList } from "./content";
import { Defaults } from "defaults";
import { TemplateLoader } from "./utils/tloader";
import { createCssLoader } from "./utils/sloader";
import { PathHelper } from "./utils/path";
import { $ } from "./utils/jquery";
import { Promise } from "jriapp_shared/utils/deferred";
import { createQueue, IQueue } from "jriapp_shared/utils/queue";


const utils = Utils, dom = utils.dom, win = dom.window, doc = win.document, arrHelper = utils.arr,
    _async = utils.defer, coreUtils = utils.core, strUtils = utils.str, ERROR = utils.err,
    ERRS = LocaleERRS;

//Implements polyfill for requestAnimationFrame API && Promise
(function() {
    let win: any = dom.window;

    //check if requestAnimationFrame implemented
    if (!win.requestAnimationFrame) {
        let requestAnimationFrame = win.requestAnimationFrame || win.mozRequestAnimationFrame ||
            win.webkitRequestAnimationFrame || win.msRequestAnimationFrame;

        let cancelAnimationFrame = win.cancelAnimationFrame || win.mozCancelAnimationFrame ||
            (win.webkitCancelAnimationFrame || win.webkitCancelRequestAnimationFrame) ||
            win.msCancelAnimationFrame;

        if (!requestAnimationFrame || !cancelAnimationFrame) {
            const queue = createQueue(40);

            requestAnimationFrame = queue.enque;
            cancelAnimationFrame = queue.cancel;
        }

        win.requestAnimationFrame = requestAnimationFrame;
        win.cancelAnimationFrame = cancelAnimationFrame;
    }

    //check if promise implemented
    if (!win.Promise) {
        win.Promise = Promise;
    }
})();

const _TEMPLATE_SELECTOR = 'script[type="text/html"]';
const stylesLoader = createCssLoader();

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
    initialize(): IPromise<Bootstrap>;
    trackSelectable(selectable: ISelectableProvider): void;
    untrackSelectable(selectable: ISelectableProvider): void;
    registerApp(app: IApplication): void;
    unregisterApp(app: IApplication): void;
    registerObject(root: IExports, name: string, obj: any): void;
    unregisterObject(root: IExports, name: string): void;
    getObject(root: IExports, name: string): any;
    getConverter(name: string): IConverter;
}

export const enum BootstrapState {
    None = 0, Initializing = 1, Initialized = 2, Ready = 3, Error = 4, Destroyed = 5
}

export class Bootstrap extends BaseObject implements IExports, ISvcStore {
    public static _initFramework() {
        $(doc).ready(function ($) {
            bootstrap._getInternal().initialize();
        });
    }
    private _appInst: IApplication; 
    private _currentSelectable: ISelectableProvider;
    private _defaults: Defaults;
    private _templateLoader: TemplateLoader;
    private _bootState: BootstrapState;
    private _exports: IIndexer<any>;
    private _internal: IInternalBootstrapMethods;
    private _moduleInits: { (app: IApplication): void; }[];
    private _elViewRegister: IElViewRegister;
    private _contentFactory: IContentFactoryList;

    constructor() {
        super();
        const self = this;
        if (!!bootstrap)
            throw new Error(ERRS.ERR_GLOBAL_SINGLTON);
        this._bootState = BootstrapState.None;
        this._appInst = null;
        this._currentSelectable = null;
        //exported types
        this._exports = {};
        this._moduleInits = [];
        this._templateLoader = null;
        this._templateLoader = new TemplateLoader();
        this._templateLoader.addOnLoaded((s, a) => {
            self._onTemplateLoaded(a.html, a.app);
        });
        this._templateLoader.addOnError((s, a) => {
            return self.handleError(a.error, a.source);
        });
        this._elViewRegister = createElViewRegister(null);
        this._contentFactory = createContentFactoryList();
        this._internal = {
            initialize: () => {
                return self._initialize();
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
        //load jriapp.css (it will load only if it is not loaded yet)
        stylesLoader.loadOwnStyle();
        ERROR.addHandler("*", this);
    }
    private _bindGlobalEvents(): void {
        const self = this, $win = $(win), $doc = $(doc);

        //when clicked outside any Selectable set _currentSelectable = null
        $doc.on("click.jriapp", function (e) {
            e.stopPropagation();
            self.currentSelectable = null;
        });
        $doc.on("keydown.jriapp", function (e) {
            e.stopPropagation();
            if (!!self._currentSelectable) {
                self._currentSelectable.getISelectable().onKeyDown(e.which, e);
            }
        });
        $doc.on("keyup.jriapp", function (e) {
            e.stopPropagation();
            if (!!self._currentSelectable) {
                self._currentSelectable.getISelectable().onKeyUp(e.which, e);
            }
        });
        $win.on("beforeunload.jriapp", function () {
            self.raiseEvent(GLOB_EVENTS.unload, {});
        });

        //this is a way to attach for correct work in firefox
        win.onerror = function (msg: any, url: string, linenumber: number) {
            if (!!msg && msg.toString().indexOf(DUMY_ERROR) > -1) {
                return true;
            }
            alert("Error: " + msg + "\nURL: " + url + "\nLine Number: " + linenumber);
            return false;
        };
    }
    private _onTemplateLoaded(html: string, app: IApplication) {
        let tmpDiv = doc.createElement("div");
        tmpDiv.innerHTML = strUtils.fastTrim(html);
        this._processTemplates(tmpDiv, app);
    }
    private _processTemplates(root: HTMLElement | HTMLDocument, app: IApplication = null): void {
        const self = this, templates = coreUtils.arr.fromList<HTMLElement>(root.querySelectorAll(_TEMPLATE_SELECTOR));
        templates.forEach(function (el) {
            let name = el.getAttribute("id");
            if (!name)
                throw new Error(ERRS.ERR_TEMPLATE_HAS_NO_ID);
            let html = el.innerHTML;
            self._processTemplate(name, html, app);
        });
    }
    //process templates in HTML Document
    private _processHTMLTemplates(): void {
        this._processTemplates(doc);
    }
    private _processTemplate(name: string, html: string, app: IApplication): void {
        const self = this, deferred = _async.createSyncDeferred<string>();
        const res = strUtils.fastTrim(html);

        const loader = {
            fn_loader: function (): IPromise<string> {
                return deferred.promise();
            }
        };

        //template already loaded, register function which returns the template immediately
        self.templateLoader.registerTemplateLoader(!app ? name : (app.appName + "." + name), loader);
        deferred.resolve(res);
    }
    protected _getEventNames(): string[] {
        const base_events = super._getEventNames();
        const events = Object.keys(GLOB_EVENTS).map((key, i, arr) => { return <string>(<any>GLOB_EVENTS)[key]; });
        return events.concat(base_events);
    }
    //override
    protected _addHandler(name: string, fn: (sender: any, args: any) => void, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        const self = this, isReady = self._bootState === BootstrapState.Ready;
        const isIntialized = (self._bootState === BootstrapState.Initialized || self._bootState === BootstrapState.Ready);

        if ((name === GLOB_EVENTS.load && isReady) || (name === GLOB_EVENTS.initialized && isIntialized)) {
            //when already is ready, immediately raise the event
            setTimeout(function () { fn.apply(self, [self, {}]); }, 0);
            return;
        }
        super._addHandler(name, fn, nmspace, context, priority);
    }
    private _init(): IPromise<Bootstrap> {
        const self = this;
        const promise  = self.stylesLoader.whenAllLoaded().then(() => {
            if (self._bootState !== BootstrapState.None)
                throw new Error("Invalid operation: bootState !== BootstrapState.None");

            self._bootState = BootstrapState.Initializing;

            self._bindGlobalEvents();

            self._bootState = BootstrapState.Initialized;
            self.raiseEvent(GLOB_EVENTS.initialized, {});
            self.removeHandler(GLOB_EVENTS.initialized);

            return _async.delay(() => {
                if (self.getIsDestroyCalled())
                    throw new Error("Bootstrap is in destroyed state");
                self._processHTMLTemplates();
                self._bootState = BootstrapState.Ready;
                self.raisePropertyChanged(PROP_NAME.isReady);
                return self;
            });
        });

       const res = promise.then((boot) => {
            if (boot._bootState !== BootstrapState.Ready)
                throw new Error("Invalid operation: bootState !== BootstrapState.Ready");
            boot.raiseEvent(GLOB_EVENTS.load, {});
            boot.removeHandler(GLOB_EVENTS.load);
            return boot;
        });

       return res;
    }
    private _initialize(): IPromise<Bootstrap> {
        const self = this;
        return self._init().then(() => {
            return self;
        }, (err) => {
            self._bootState = BootstrapState.Error;
            ERROR.reThrow(err, this.handleError(err, self));
        });
    }
    private _trackSelectable(selectable: ISelectableProvider): void {
        const self = this, isel = selectable.getISelectable(), el = isel.getContainerEl();
        $(el).on("click." + isel.getUniqueID(), function (e) {
            e.stopPropagation();
            const target = e.target;
            if (dom.isContained(target, el))
                self.currentSelectable = selectable;
        });
    }
    private _untrackSelectable(selectable: ISelectableProvider): void {
        const self = this, isel = selectable.getISelectable(),
            el = isel.getContainerEl();
        $(el).off("click." + isel.getUniqueID());
        if (this.currentSelectable === selectable)
            this.currentSelectable = null;
    }
    private _registerApp(app: IApplication): void {
        if (!!this._appInst) {
            throw new Error("Application already registered");
        }
        this._appInst = app;
        ERROR.addHandler(app.appName, app);
    }
    private _unregisterApp(app: IApplication): void {
        if (!this._appInst || this._appInst.appName !== app.appName) {
            throw new Error("Invalid operation");
        }

        try {
            ERROR.removeHandler(app.appName);
            this.templateLoader.unRegisterTemplateGroup(app.appName);
            this.templateLoader.unRegisterTemplateLoader(app.appName)
        }
        finally {
            this._appInst = null;
        }
    }
    private _destroyApp(): void {
        const self = this, app = self._appInst;
        if (!!app && !app.getIsDestroyCalled()) {
            app.destroy();
        }
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
        const name2 = STORE_KEY.CONVERTER + name;
        const res = this._getObject(this, name2);
        if (!res)
            throw new Error(strUtils.format(ERRS.ERR_CONVERTER_NOTREGISTERED, name));
        return res;
    }
    private _waitLoaded(onLoad: (bootstrap: Bootstrap) => void): void {
        const self = this;

        self.init(() => {
            self.addOnLoad((s, a) => {
                setTimeout(() => {
                    try {
                        onLoad(self);
                    }
                    catch (err) {
                        ERROR.reThrow(err, self.handleError(err, self));
                    }
                }, 0);
            });
        });
    }
    _getInternal(): IInternalBootstrapMethods {
        return this._internal;
    }
    addOnLoad(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject) {
        this._addHandler(GLOB_EVENTS.load, fn, nmspace, context);
    }
    addOnUnLoad(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject) {
        this._addHandler(GLOB_EVENTS.unload, fn, nmspace, context);
    }
    addOnInitialize(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject) {
        this._addHandler(GLOB_EVENTS.initialized, fn, nmspace, context);
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
    getApp(): IApplication {
        return this._appInst;
    }
    init(onInit: (bootstrap: Bootstrap) => void): void {
        const self = this;
        self.addOnInitialize((s, a) => {
            setTimeout(() => {
                try {
                    onInit(self);
                }
                catch (err) {
                    ERROR.reThrow(err, self.handleError(err, self));
                }
            }, 0);
        });
    }
    //starting application - use onStartUp callback to setUp handlers on objects, create viewModels and etc.
    //all  that we need to do before setting up databindings
    //returns Promise
    startApp<TApp extends IApplication>(appFactory: () => TApp, onStartUp?: (app: TApp) => void): IPromise<TApp> {
        const self = this, deferred = _async.createDeferred<TApp>(), promise = deferred.promise();

        self._waitLoaded(() => {
            try {
                const app = appFactory();
                deferred.resolve(app.startUp(onStartUp));
            }
            catch (err) {
                deferred.reject(err);
            }
        });

        let res = promise.then((app) => {
            return app;
        }, (err) => {
            ERROR.reThrow(err, self.handleError(err, self));
        });

        return res;
    }
    destroy(): void {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        const self = this;
        self._removeHandler();
        self._destroyApp();
        self._exports = {};
        if (self._templateLoader !== null) {
            self._templateLoader.destroy();
            self._templateLoader = null;
        }
        self._elViewRegister.destroy();
        self._elViewRegister = null;
        self._contentFactory = null;
        self._moduleInits = [];
        $(doc).off(".jriapp");
        win.onerror = null;
        $(win).off(".jriapp");
        ERROR.removeHandler("*");
        this._bootState = BootstrapState.Destroyed;
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
    get contentFactory() { return this._contentFactory; }
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
    get state() {
        return this._bootState;
    }
}

export const bootstrap = new Bootstrap();