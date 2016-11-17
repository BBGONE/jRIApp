/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    APP_NAME, IIndexer, IErrorHandler, TEventHandler, IPromise, IVoidPromise,
    IBaseObject, IThenable, DummyError, LocaleERRS, BaseObject, Utils
} from "jriapp_shared";
import { DATA_ATTR, STORE_KEY } from "./const";
import {
    IElViewStore, IElViewFactory, IElView, IViewType, IApplication,
    IExports, ILifeTimeScope, IBindableElement, IBindingOptions, IAppOptions, IInternalAppMethods,
    TFactoryGetter, IConverter, IContentOptions, ITemplate, ITemplateEvents,
    ITemplateGroupInfo, ITemplateGroupInfoEx, IContentFactory, IDataBindingService,
    IBinding, IElViewRegister
} from "./shared";
import { bootstrap } from "./bootstrap";
import { LifeTimeScope } from "./utils/lifetime";
import { createElViewFactory } from "./elview";
import { createDataBindSvc } from "./databindsvc";
import { $ } from "./utils/jquery";

const utils = Utils, dom = utils.dom, doc = dom.document,
    boot = bootstrap, sys = utils.sys, ERRS = LocaleERRS;

const APP_EVENTS = {
    startup: "startup"
};

const enum AppState { None, Starting, Started, Destroyed, Error }



export class Application extends BaseObject implements IApplication {
    private _UC: any;
    private _moduleInits: IIndexer<(app: IApplication) => void>;
    private _objId: string;
    private _objMaps: any[];
    private _appName: string;
    private _exports: IIndexer<any>;
    protected _options: IAppOptions;
    private _dataBindingService: IDataBindingService;
    private _viewFactory: IElViewFactory;
    private _internal: IInternalAppMethods;
    private _app_state: AppState;

    constructor(options?: IAppOptions) {
        super();
        if (!options) {
            options = {};
        }
        const self = this, moduleInits = options.modulesInits || <IIndexer<(app: IApplication) => void>>{}, app_name = APP_NAME;
        this._appName = app_name;
        this._options = options;
        if (!!boot.getApp())
            throw new Error(utils.str.format(ERRS.ERR_APP_NAME_NOT_UNIQUE, app_name));
        this._objId = "app:" + utils.core.getNewID();
        this._app_state = AppState.None;
        this._moduleInits = moduleInits;
        this._viewFactory = createElViewFactory(boot.elViewRegister);
        this._dataBindingService = createDataBindSvc(this.appRoot, this._viewFactory);

        this._objMaps = [];
        //registered exported types
        this._exports = {};
        this._UC = {};
        this._internal = {
            bindTemplateElements: (templateEl: HTMLElement) => {
                return self._dataBindingService.bindTemplateElements(templateEl);
            },
            bindElements: (scope: Document | HTMLElement, dctx: any, isDataFormBind: boolean, isInsideTemplate: boolean) => {
                return self._dataBindingService.bindElements(scope, dctx, isDataFormBind, isInsideTemplate);
            }
        };

        boot._getInternal().registerApp(this);
    }
    private _cleanUpObjMaps() {
        const self = this;
        this._objMaps.forEach((objMap) => {
            utils.core.forEachProp(objMap, (name) => {
                let obj = objMap[name];
                if (sys.isBaseObj(obj)) {
                    if (!(<IBaseObject>obj).getIsDestroyed()) {
                        (<IBaseObject>obj).removeNSHandlers(self.uniqueID);
                    }
                }
            });
        });
        this._objMaps = [];
    }
    private _initAppModules() {
        const self = this, keys = Object.keys(self._moduleInits);
        keys.forEach((key) => {
            let initFn = self._moduleInits[key];
            initFn(self);
        });
    }
    protected _getEventNames() {
        const base_events = super._getEventNames();
        return [APP_EVENTS.startup].concat(base_events);
    }
    /**
    can be overriden in derived classes
    it can return a promise when it's needed
    */
    protected onStartUp(): any {
    }
    _getInternal(): IInternalAppMethods {
        return this._internal;
    }
    addOnStartUp(fn: TEventHandler<IApplication, any>, nmspace?: string, context?: IBaseObject): void {
        this._addHandler(APP_EVENTS.startup, fn, nmspace, context);
    }
    removeOnStartUp(nmspace?: string): void {
        this._removeHandler(APP_EVENTS.startup, nmspace);
    }
    getExports(): IIndexer<any> {
        return this._exports;
    }
    bind(opts: IBindingOptions): IBinding {
        return this._dataBindingService.bind(opts);
    }
    registerConverter(name: string, obj: IConverter): void {
        let name2 = STORE_KEY.CONVERTER + name;
        if (!boot._getInternal().getObject(this, name2)) {
            boot._getInternal().registerObject(this, name2, obj);
        }
        else
            throw new Error(utils.str.format(ERRS.ERR_OBJ_ALREADY_REGISTERED, name));
    }
    getConverter(name: string): IConverter {
        let name2 = STORE_KEY.CONVERTER + name;
        let res = boot._getInternal().getObject(this, name2);
        if (!res) {
            res = boot._getInternal().getObject(boot, name2);
        }
        if (!res)
            throw new Error(utils.str.format(ERRS.ERR_CONVERTER_NOTREGISTERED, name));
        return res;
    }
    registerSvc(name: string, obj: any): void {
        let name2 = STORE_KEY.SVC + name;
        return boot._getInternal().registerObject(this, name2, obj);
    }
    getSvc(name: string): any;
    getSvc<T>(name: string): T {
        let name2 = STORE_KEY.SVC + name;
        let res = boot._getInternal().getObject(this, name2);
        if (!res) {
            res = boot._getInternal().getObject(boot, name2);
        }
        return res;
    }
    registerElView(name: string, vw_type: IViewType): void {
        this._viewFactory.register.registerElView(name, vw_type);
    }
    /**
    registers instances of objects, so they can be retrieved later anywhere in the application's code
    very similar to the dependency injection container - you can later obtain the registerd object with the getObject function
    */
    registerObject(name: string, obj: any): void {
        let self = this, name2 = STORE_KEY.OBJECT + name;
        if (sys.isBaseObj(obj)) {
            (<IBaseObject>obj).addOnDestroyed((s, a) => {
                boot._getInternal().unregisterObject(self, name2);
            }, self.uniqueID);
        }
        let objMap = boot._getInternal().registerObject(this, name2, obj);
        if (this._objMaps.indexOf(objMap) < 0) {
            this._objMaps.push(objMap);
        }
    }
    getObject(name: string): any;
    getObject<T>(name: string): T {
        let name2 = STORE_KEY.OBJECT + name;
        let res = boot._getInternal().getObject(this, name2);
        return res;
    }
    /**
    set up application - use onStartUp callback to setUp handlers on objects, create viewModels and etc.
    all  that we need to do before setting up databindings
    */
    startUp(onStartUp?: (app: Application) => any): IPromise<Application> {
        let self = this, deferred = utils.defer.createDeferred<Application>();

        if (this._app_state !== AppState.None) {
            return deferred.reject(new Error("Application can not be started when state != AppState.None"));
        }

        let fn_startApp = () => {
            try {
                self._initAppModules();
                let onStartupRes1: any = self.onStartUp();
                let setupPromise1: IThenable<void>;
                if (utils.check.isThenable(onStartupRes1)) {
                    setupPromise1 = (<IThenable<any>>onStartupRes1)
                }
                else {
                    setupPromise1 = utils.defer.createDeferred<void>().resolve();
                }

                let promise = setupPromise1.then(() => {
                    self.raiseEvent(APP_EVENTS.startup, {});
                    let onStartupRes2: any = (!!onStartUp) ? onStartUp.apply(self, [self]) : null;
                    let setupPromise2: IThenable<void>;

                    if (utils.check.isThenable(onStartupRes2)) {
                        setupPromise2 = (<IThenable<any>>onStartupRes2).then(() => {
                            return self._dataBindingService.setUpBindings();
                        }, (err) => {
                            deferred.reject(err);
                        });
                    }
                    else {
                        setupPromise2 = self._dataBindingService.setUpBindings();
                    }

                    return setupPromise2;
                });



                //resolved with an application instance
                promise.then(() => {
                    deferred.resolve(self);
                }, (err) => {
                    deferred.reject(err);
                });
            }
            catch (ex) {
                deferred.reject(ex);
            }
        };

        this._app_state = AppState.Starting;

        let promise = deferred.promise().then((app) => {
            self._app_state = AppState.Started;
            return self;
        }, (err) => {
            self._app_state = AppState.Error;
            throw err;
        });

        try {
            if (!!onStartUp && !utils.check.isFunc(onStartUp))
                throw new Error(ERRS.ERR_APP_SETUP_INVALID);

            //wait until all templates have been loaded (if any)
            boot.templateLoader.waitForNotLoading(fn_startApp, null);
        }
        catch (ex) {
            deferred.reject(ex);
        }

        return promise;
    }
    //loads a group of templates from the server
    loadTemplates(url: string): IPromise<any> {
        return this.loadTemplatesAsync(function () {
            return utils.http.getAjax(url);
        });
    }
    //loads a group of templates from the server
    loadTemplatesAsync(fn_loader: () => IPromise<string>): IPromise<any> {
        return boot.templateLoader.loadTemplatesAsync(fn_loader, this);
    }
    //fn_loader must load template and return promise which resolves with the loaded HTML string
    registerTemplateLoader(name: string, fn_loader: () => IPromise<string>): void {
        boot.templateLoader.registerTemplateLoader(this.appName + "." + name, {
            fn_loader: fn_loader
        });
    }
    //register loading a template from html element by its id value
    registerTemplateById(name: string, templateId: string): void {
        this.registerTemplateLoader(name, utils.core.memoize(() => {
            let deferred = utils.defer.createSyncDeferred<string>();
            let str = $("#" + templateId).html();
            deferred.resolve(str);
            return deferred.promise();
        }));
    }
    getTemplateLoader(name: string): () => IPromise<string> {
        let res = boot.templateLoader.getTemplateLoader(this.appName + "." + name);
        if (!res) {
            res = boot.templateLoader.getTemplateLoader(name);
            if (!res)
                return () => { return utils.defer.createDeferred<string>().reject(new Error(utils.str.format(ERRS.ERR_TEMPLATE_NOTREGISTERED, name))) };
        }
        return res;
    }
    registerTemplateGroup(name: string, group: ITemplateGroupInfo): void {
        let group2: ITemplateGroupInfoEx = utils.core.extend({
            fn_loader: <() => IPromise<string>>null,
            url: <string>null,
            names: <string[]>null,
            promise: <IPromise<string>>null,
            app: this
        }, group);
        boot.templateLoader.registerTemplateGroup(this.appName + "." + name, group2);
    }
    destroy(): void {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        const self = this;
        try {
            self._app_state = AppState.Destroyed;
            boot._getInternal().unregisterApp(self);
            self._cleanUpObjMaps();
            self._dataBindingService.destroy();
            self._dataBindingService = null;
            self._viewFactory.destroy();
            self._exports = {};
            self._moduleInits = {};
            self._UC = {};
            self._options = null;
            self._viewFactory = null;
        } finally {
            super.destroy();
        }
    }
    toString() {
        return "Application: " + this.appName;
    }
    get uniqueID() { return this._objId; }
    get options() { return this._options; }
    get appName() { return this._appName; }
    get appRoot(): Document | HTMLElement {
        if (!this._options || !this._options.appRoot)
            return doc;
        else
            return this._options.appRoot;
    }
    get viewFactory(): IElViewFactory {
        return this._viewFactory;
    }
    //Namespace for attaching custom user code (functions and objects - anything)
    get UC() { return this._UC; }
    get app() { return this; }
}