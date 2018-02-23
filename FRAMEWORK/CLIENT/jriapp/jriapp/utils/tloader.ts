/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IPromise, LocaleERRS, BaseObject, WaitQueue, Utils } from "jriapp_shared";
import { IApplication, ITemplateGroupInfoEx, ITemplateLoaderInfo } from "../int";

const utils = Utils, { isFunc } = utils.check, { getValue, setValue, removeValue, extend } = utils.core,
    { format } = utils.str, { createDeferred } = utils.defer, ERRS = LocaleERRS, DEBUG = utils.debug,
    LOG = utils.log, http = utils.http;

const enum LOADER_EVENTS {
    loaded = "loaded"
}

export class TemplateLoader extends BaseObject {
    private _templateLoaders: any;
    private _templateGroups: any;
    private _promises: IPromise<string>[];
    private _waitQueue: WaitQueue;

    constructor() {
        super();
        const self = this;
        this._templateLoaders = {};
        this._templateGroups = {};
        this._promises = [];
        this._waitQueue = new WaitQueue(self);
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        const self = this;
        self._promises = [];
        self._templateLoaders = {};
        self._templateGroups = {};
        if (!!self._waitQueue) {
            self._waitQueue.dispose();
            self._waitQueue = null;
        }
        super.dispose();
    }
    addOnLoaded(fn: (sender: TemplateLoader, args: { html: string; app: IApplication; }) => void, nmspace?: string): void {
        this.objEvents.on(LOADER_EVENTS.loaded, fn, nmspace);
    }
    offOnLoaded(nmspace?: string): void {
        this.objEvents.off(LOADER_EVENTS.loaded, nmspace);
    }
    public waitForNotLoading(callback: (...args: any[]) => any, callbackArgs: any): void {
        this._waitQueue.enQueue({
            prop: "isLoading",
            groupName: null,
            predicate: (val: any) => !val,
            action: callback,
            actionArgs: callbackArgs
        });
    }
    private _onLoaded(html: string, app: IApplication): void {
        this.objEvents.raise(LOADER_EVENTS.loaded, { html: html, app: app });
    }
    private _getTemplateGroup(name: string): ITemplateGroupInfoEx {
        return getValue(this._templateGroups, name);
    }
    private _registerTemplateLoaderCore(name: string, loader: ITemplateLoaderInfo): void {
        setValue(this._templateLoaders, name, loader, false);
    }
    private _getTemplateLoaderCore(name: string): ITemplateLoaderInfo {
        return getValue(this._templateLoaders, name);
    }
    public loadTemplatesAsync(fnLoader: () => IPromise<string>, app: IApplication): IPromise<any> {
        const self = this, promise = fnLoader(), old = self.isLoading;
        self._promises.push(promise);
        if (self.isLoading !== old) {
            self.objEvents.raiseProp("isLoading");
        }
        const res = promise.then((html: string) => {
            self._onLoaded(html, app);
        });

        res.always(() => {
            utils.arr.remove(self._promises, promise);
            if (!self.isLoading) {
                self.objEvents.raiseProp("isLoading");
            }
        });
        return res;
    }
    /*
     fn_loader must load template and return promise which resolves with the loaded HTML string
    */
    public unRegisterTemplateLoader(name: string): void {
        removeValue(this._templateLoaders, name);
    }
    public unRegisterTemplateGroup(name: string): void {
        removeValue(this._templateGroups, name);
    }
    public registerTemplateLoader(name: string, loader: ITemplateLoaderInfo): void {
        const self = this;
        loader = extend({
            fn_loader: null,
            groupName: null
        }, loader);

        if (!loader.groupName && !isFunc(loader.fn_loader)) {
            throw new Error(format(ERRS.ERR_ASSERTION_FAILED, "fn_loader is Function"));
        }
        const prevLoader = self._getTemplateLoaderCore(name);
        if (!!prevLoader) {
            // can overwrite previous loader with new one, only if the old did not have loader function and the new has it
            if ((!prevLoader.fn_loader && !!prevLoader.groupName) && (!loader.groupName && !!loader.fn_loader)) {
                return self._registerTemplateLoaderCore(name, loader);
            }
            throw new Error(format(ERRS.ERR_TEMPLATE_ALREADY_REGISTERED, name));
        }
        return self._registerTemplateLoaderCore(name, loader);
    }
    // this function will return promise resolved with the template's html
    public getTemplateLoader(name: string): () => IPromise<string> {
        const self = this, loader = self._getTemplateLoaderCore(name);
        if (!loader) {
            return null;
        }
        if (!loader.fn_loader && !!loader.groupName) {
            const group = self._getTemplateGroup(loader.groupName);
            if (!group) {
                throw new Error(format(ERRS.ERR_TEMPLATE_GROUP_NOTREGISTERED, loader.groupName));
            }

            // this function will return promise resolved with the template's html
            return () => {
                // it prevents double loading
                if (!group.promise) {
                    // start loading only if no another loading in progress
                    group.promise = self.loadTemplatesAsync(group.fn_loader, group.app);
                }

                const deferred = createDeferred<string>(true);

                group.promise.then(() => {
                    group.promise = null;
                    group.names.forEach((name) => {
                        if (!!group.app) {
                            name = group.app.appName + "." + name;
                        }
                        const loader = self._getTemplateLoaderCore(name);
                        if (!loader || !loader.fn_loader) {
                            const error = format(ERRS.ERR_TEMPLATE_NOTREGISTERED, name);
                            if (DEBUG.isDebugging()) {
                                LOG.error(error);
                            }
                            throw new Error(error);
                        }
                    });

                    const loader = self._getTemplateLoaderCore(name);
                    if (!loader || !loader.fn_loader) {
                        const error = format(ERRS.ERR_TEMPLATE_NOTREGISTERED, name);
                        if (DEBUG.isDebugging()) {
                            LOG.error(error);
                        }
                        throw new Error(error);
                    }

                    delete self._templateGroups[loader.groupName];
                    const promise = loader.fn_loader();
                    promise.then((html) => {
                        deferred.resolve(html);
                    }, (err) => {
                        deferred.reject(err);
                    });
                }).catch((err) => {
                    group.promise = null;
                    deferred.reject(err);
                });

                return deferred.promise();
            };
        } else {
            return loader.fn_loader;
        }
    }
    public registerTemplateGroup(groupName: string, group: ITemplateGroupInfoEx): void {
        const self = this, group2: ITemplateGroupInfoEx = extend({
            fn_loader: <() => IPromise<string>>null,
            url: <string>null,
            names: <string[]>null,
            promise: <IPromise<string>>null,
            app: <IApplication>null
        }, group);

        if (!!group2.url && !group2.fn_loader) {
            // make a function to load from this url
            group2.fn_loader = () => {
                return http.getAjax(group2.url);
            };
        }

        setValue(self._templateGroups, groupName, group2, true);
        group2.names.forEach((name) => {
            if (!!group2.app) {
                name = group2.app.appName + "." + name;
            }
            // for each template in the group register dummy loader function which has only group name
            // when template will be requested, this dummy loader will be replaced with the real one
            self.registerTemplateLoader(name, {
                groupName: groupName,
                fn_loader: null // no loader function
            });
        });
    }
    public loadTemplates(url: string): IPromise<any> {
        return this.loadTemplatesAsync(() => http.getAjax(url), null);
    }
    get isLoading(): boolean {
        return this._promises.length > 0;
    }
}
