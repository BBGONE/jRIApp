/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IPromise, LocaleERRS, BaseObject, WaitQueue, Utils } from "jriapp_shared";
import { ITemplateGroupInfo } from "../int";


const utils = Utils, { isFunc } = utils.check, { getValue, setValue, removeValue } = utils.core,
    { format } = utils.str, { createDeferred, reject } = utils.defer, ERRS = LocaleERRS, DEBUG = utils.debug,
    LOG = utils.log, http = utils.http;

const enum LOADER_EVENTS {
    loaded = "loaded"
}

function getGroupName(fullName: string): string {
    const parts: string[] = fullName.split(".");
    if (parts.length > 2) {
        throw new Error(`Invalid template name: ${fullName}`);
    }
    return (parts.length === 1) ? "" : parts[0];
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
    addOnLoaded(fn: (sender: TemplateLoader, args: { html: string; }) => void, nmspace?: string): void {
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
    private _onLoaded(html: string): void {
        this.objEvents.raise(LOADER_EVENTS.loaded, { html: html });
    }
    private _getTemplateGroup(name: string): ITemplateGroupInfo {
        return getValue(this._templateGroups, name);
    }
    private _registerTemplateLoader(name: string, loader: () => IPromise<string>): void {
        setValue(this._templateLoaders, name, loader, false);
    }
    private _getTemplateLoader(name: string): () => IPromise<string> {
        return getValue(this._templateLoaders, name);
    }
    public loadTemplatesAsync(loader: () => IPromise<string>): IPromise<any> {
        const self = this, promise = loader(), old = self.isLoading;
        self._promises.push(promise);
        if (self.isLoading !== old) {
            self.objEvents.raiseProp("isLoading");
        }
        const res = promise.then((html: string) => {
            self._onLoaded(html);
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
    public registerTemplateLoader(name: string, loader: () => IPromise<string>): void {
        const self = this;
        if (!isFunc(loader)) {
            throw new Error(format(ERRS.ERR_ASSERTION_FAILED, "loader is Function"));
        }
        return self._registerTemplateLoader(name, loader);
    }
    // this function will return a promise resolved with the template's html
    public getTemplateLoader(name: string): () => IPromise<string> {
        const self = this;
        const loader = self._getTemplateLoader(name);
        if (!!loader) {
            return loader;
        } else {
            const groupName = getGroupName(name);
            if (!groupName) {
                return null;
            } else {
                // load the group of templates
                const group = self._getTemplateGroup(groupName);
                if (!group) {
                    throw new Error(format(ERRS.ERR_TEMPLATE_GROUP_NOTREGISTERED, groupName));
                }

                return () => {
                    // it prevents double loading
                    if (!group.promise) {
                        // start loading only if no another loading in progress
                        group.promise = self.loadTemplatesAsync(group.loader);
                    }

                    const deferred = createDeferred<string>(true);

                    group.promise.then(() => {
                        const loader = self._getTemplateLoader(name);
                        if (!loader) {
                            const error = format(ERRS.ERR_TEMPLATE_NOTREGISTERED, name), rejected = reject<string>(error, true);
                            // template failed to load, register function which rejects immediately
                            self.registerTemplateLoader(name, () => rejected);
                            if (DEBUG.isDebugging()) {
                                LOG.error(error);
                            }
                            throw new Error(error);
                        }

                        const promise = loader();
                        promise.then((html) => {
                            deferred.resolve(html);
                        }, (err) => {
                            deferred.reject(err);
                        });
                    }).catch((err) => {
                        deferred.reject(err);
                    });

                    return deferred.promise();
                };
            }
        }
    }
    public registerTemplateGroup(group: ITemplateGroupInfo): void {
        const self = this;

        if (!!group.url && !group.loader) {
            // make a function to load from this url
            group.loader = () => {
                return http.getAjax(group.url);
            };
        }

        setValue(self._templateGroups, group.name, group, false);
    }
    public loadTemplates(url: string): IPromise<any> {
        return this.loadTemplatesAsync(() => http.getAjax(url));
    }
    get isLoading(): boolean {
        return this._promises.length > 0;
    }
}
