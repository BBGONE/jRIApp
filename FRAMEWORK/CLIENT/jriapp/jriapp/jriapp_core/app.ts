/// <reference path="../../thirdparty/jquery.d.ts" />
/// <reference path="../../thirdparty/moment.d.ts" />
/// <reference path="../../thirdparty/qtip2.d.ts" />
/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR, STORE_KEY } from "./const";
import { IElViewStore, IElViewFactory, IElView, IViewType, IIndexer, IApplication, IErrorHandler, IExports, ILifeTimeScope, IBindableElement, IPromise, IVoidPromise, DummyError,
    IBindingOptions, IAppOptions, IInternalAppMethods, IBaseObject, TFactoryGetter, TEventHandler, IConverter, IContentOptions, ITemplate, ITemplateEvents,
    ITemplateGroupInfo, ITemplateGroupInfoEx, IContentFactory, IDataBindingService, IBinding, IElViewRegister, IThenable
} from "./shared";
import { ERRS } from "./lang";
import { BaseObject }  from "./object";
import { bootstrap } from "./bootstrap";
import { SysChecks, ERROR } from "../jriapp_utils/coreutils";
import { LifeTimeScope, Utils as utils } from "../jriapp_utils/utils";
import { createFactory as createElViewFactory, createRegister as createElViewRegister } from "../jriapp_elview/factory";
import { create as createDataBindSvc } from "./databindsvc";
import { ITemplateOptions, create as createTemplate } from "./template";
import { parser } from "./parser";

const $ = utils.dom.$, document = utils.dom.document;

const APP_EVENTS = {
    startup: "startup"
};

const enum AppState { None, Starting, Started, Destroyed, Error }



export class Application extends BaseObject implements IApplication {
    private static _newInstanceNum = 1;
    private _UC: any;
    private _app_name: string;
    private _moduleInits: IIndexer<(app: IApplication) => void>;
    private _objId: string;
    private _objMaps: any[];
    private _exports: IIndexer<any>;
    protected _options: IAppOptions;
    private _elViewFactory: IElViewFactory;
    private _elViewRegister: IElViewRegister;
    private _dataBindingService: IDataBindingService;
    private _internal: IInternalAppMethods;
    private _app_state: AppState;

    constructor(options?: IAppOptions) {
        super();
        let self = this, app_name = "default", moduleInits = <IIndexer<(app: IApplication) => void>>{};
        this._options = null;
        if (!!options) {
            this._options = options;
            if (!!options.appName)
                app_name = options.appName;
            if (!!options.modulesInits)
                moduleInits = options.modulesInits;
        }
        if (!!bootstrap.findApp(app_name))
            throw new Error(utils.str.format(ERRS.ERR_APP_NAME_NOT_UNIQUE, app_name));
        this._app_name = app_name;
        this._objId = "app:" + utils.core.getNewID();
        this._app_state = AppState.None;
        this._moduleInits = moduleInits;
        this._elViewRegister = createElViewRegister(bootstrap.elViewRegister);
        this._elViewFactory = createElViewFactory(this, Application._newInstanceNum, this._elViewRegister);
        this._dataBindingService = createDataBindSvc(this, this.appRoot, this._elViewFactory);

        Application._newInstanceNum += 1;
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

        bootstrap._getInternal().registerApp(this);
    }
    private _cleanUpObjMaps() {
        let self = this;
        this._objMaps.forEach((objMap) => {
            utils.core.forEachProp(objMap, (name) => {
                let obj = objMap[name];
                if (obj instanceof BaseObject) {
                    if (!(<IBaseObject>obj).getIsDestroyed()) {
                        (<IBaseObject>obj).removeNSHandlers(self.uniqueID);
                    }
                }
            });
        });
        this._objMaps = [];
    }
    private _initAppModules() {
        let self = this;
        let keys = Object.keys(self._moduleInits);
        keys.forEach((key) => {
            let initFn = self._moduleInits[key];
            initFn(self);
        });
    }
    public handleError(error: any, source: any): boolean {
        if (ERROR.checkIsDummy(error)) {
            return true;
        }
        let isHandled = super.handleError(error, source);
        if (!isHandled) {
            return bootstrap.handleError(error, source);
        }
        return isHandled;
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return [APP_EVENTS.startup].concat(base_events);
    }
    //can override this method in derived classes
    protected onStartUp(): void {
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
        if (!bootstrap._getInternal().getObject(this, name2)) {
            bootstrap._getInternal().registerObject(this, name2, obj);
        }
        else
            throw new Error(utils.str.format(ERRS.ERR_OBJ_ALREADY_REGISTERED, name));
    }
    getConverter(name: string): IConverter {
        let name2 = STORE_KEY.CONVERTER + name;
        let res = bootstrap._getInternal().getObject(this, name2);
        if (!res) {
            res = bootstrap._getInternal().getObject(bootstrap, name2);
        }
        if (!res)
            throw new Error(utils.str.format(ERRS.ERR_CONVERTER_NOTREGISTERED, name));
        return res;
    }
    registerSvc(name: string, obj: any): void {
        let name2 = STORE_KEY.SVC + name;
        return bootstrap._getInternal().registerObject(this, name2, obj);
    }
    getSvc(name: string): any;
    getSvc<T>(name: string): T {
        let name2 = STORE_KEY.SVC + name;
        let res = bootstrap._getInternal().getObject(this, name2);
        if (!res) {
            res = bootstrap._getInternal().getObject(bootstrap, name2);
        }
        return res;
    }
    registerElView(name: string, vw_type: IViewType): void {
        this._elViewRegister.registerElView(name, vw_type);
    }
    //registers instances of objects, so they can be retrieved later anywhere in the application's code
    //very similar to the dependency injection container - you can later obtain the registerd object with the getObject function
    registerObject(name: string, obj: any): void {
        let self = this, name2 = STORE_KEY.OBJECT + name;
        if (utils.check.isBaseObject(obj)) {
            (<IBaseObject>obj).addOnDestroyed((s, a) => {
                bootstrap._getInternal().unregisterObject(self, name2);
            }, self.uniqueID);
        }
        let objMap = bootstrap._getInternal().registerObject(this, name2, obj);
        if (this._objMaps.indexOf(objMap) < 0) {
            this._objMaps.push(objMap);
        }
    }
    getObject(name: string): any;
    getObject<T>(name: string): T {
        let name2 = STORE_KEY.OBJECT + name;
        let res = bootstrap._getInternal().getObject(this, name2);
        return res;
    }
    //set up application - use onStartUp callback to setUp handlers on objects, create viewModels and etc.
    //all  that we need to do before setting up databindings
    //onStartUp can optionally return a promise 
    startUp(onStartUp?: (app: Application) => any): IPromise<void> {
        let self = this, deferred = utils.defer.createSyncDeferred<void>();

        if (this._app_state !== AppState.None) {
            return deferred.reject(new Error("Application can not be started again! Create a new one!"));
        }

        let fn_init = () => {
            try {
                self._initAppModules();
                self.onStartUp();
                self.raiseEvent(APP_EVENTS.startup, {});
                let res:any = null;
                if (!!onStartUp)
                    res = onStartUp.apply(self, [self]);
                if (utils.check.isThenable(res)) {
                    (<IThenable<any>>res).then(() => {
                        deferred.resolve(self._dataBindingService.setUpBindings());
                    }, (err) => {
                        deferred.reject(err);
                    });
                }
                else {
                    deferred.resolve(self._dataBindingService.setUpBindings());
                }
            }
            catch (ex) {
                deferred.reject(ex);
            }
        };

        this._app_state = AppState.Starting;

        let promise = deferred.promise().then(() => {
            self._app_state = AppState.Started;
        }, (err) => {
            self._app_state = AppState.Error;
            throw err;
            });

        try {
            if (!!onStartUp && !utils.check.isFunc(onStartUp))
                throw new Error(ERRS.ERR_APP_SETUP_INVALID);

            //wait until all templates have been loaded (if any)
            bootstrap.templateLoader.waitForNotLoading(fn_init, null);
        }
        catch (ex) {
            deferred.reject(ex);
        }

        return promise;
    }
    createTemplate(dataContext?: any, templEvents?: ITemplateEvents): ITemplate {
        let options: ITemplateOptions = {
            app: this,
            dataContext: dataContext,
            templEvents: templEvents
        }
        return createTemplate(options);
    }
    //loads a group of templates from the server
    loadTemplates(url: string): IPromise<any> {
        return this.loadTemplatesAsync(function () {
            return utils.http.getAjax(url);
        });
    }
    //loads a group of templates from the server
    loadTemplatesAsync(fn_loader: () => IPromise<string>): IPromise<any> {
        return bootstrap.templateLoader.loadTemplatesAsync(fn_loader, this);
    }
    //fn_loader must load template and return promise which resolves with the loaded HTML string
    registerTemplateLoader(name: string, fn_loader: () => IPromise<string>): void {
        bootstrap.templateLoader.registerTemplateLoader(this.appName + "." + name, {
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
        let res = bootstrap.templateLoader.getTemplateLoader(this.appName + "." + name);
        if (!res) {
            res = bootstrap.templateLoader.getTemplateLoader(name);
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
        bootstrap.templateLoader.registerTemplateGroup(this.appName + "." + name, group2);
    }
    destroy(): void {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let self = this;
        try {
            self._app_state = AppState.Destroyed;
            bootstrap._getInternal().unregisterApp(self);
            self._cleanUpObjMaps();
            self._dataBindingService.destroy();
            self._dataBindingService = null;
            self._elViewFactory.destroy();
            self._elViewFactory = null;
            this._elViewRegister.destroy();
            this._elViewRegister = null;
            self._exports = {};
            self._moduleInits = {};
            self._UC = {};
            self._options = null;
        } finally {
            super.destroy();
        }
    }
    toString() {
        return "Application: " + this.appName;
    }
    get elViewFactory() { return this._elViewFactory; }
    get elViewRegister() { return this._elViewRegister; }
    get uniqueID() { return this._objId; }
    get options() { return this._options; }
    get appName() { return this._app_name; }
    get appRoot(): Document | HTMLElement {
        if (!this._options || !this._options.appRoot)
            return document;
        else
            return this._options.appRoot;
    }
    //Namespace for attaching custom user code (functions and objects - anything)
    get UC() { return this._UC; }
    get app() { return this; }
}