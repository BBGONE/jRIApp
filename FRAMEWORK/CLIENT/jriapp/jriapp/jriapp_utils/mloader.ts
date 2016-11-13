/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IIndexer, IViewType, IApplication, IPromise, IDeferred, IModuleLoader } from "../jriapp_core/shared";
import { Utils } from "./utils";
import { createCssLoader as createCSSLoader } from "./sloader";

const utils = Utils, coreUtils = utils.core, strUtils = utils.str, defer = utils.defer, arr = utils.arr,
    resolvedPromise = defer.createSyncDeferred<void>().resolve(),
    CSSPrefix = "css!";

let _moduleLoader: IModuleLoader = null;

export function create(): IModuleLoader {
    if (!_moduleLoader)
        _moduleLoader = new ModuleLoader();
    return _moduleLoader;
}

const enum LOAD_STATE {
    NONE = 0, LOADING = 1, LOADED = 2
}

interface IModuleLoad {
    name: string;
    err: any;
    state: LOAD_STATE;
    defered: IDeferred<any>;
}

function whenAll(loads: IModuleLoad[]): IPromise<any> {
    if (!loads || loads.length === 0)
        return resolvedPromise;
    if (loads.length === 1)
        return loads[0].defered.promise();

    let cnt = loads.length, resolved = 0, err: any = null;
    for (let i = 0; i < cnt; i += 1) {
        if (loads[i].state === LOAD_STATE.LOADED) {
            ++resolved;
            if (!!loads[i].err)
                err = loads[i].err;
        }
    }

    if (resolved === cnt) {
        if (!err)
            return resolvedPromise;
        else {
            return defer.createDeferred<void>().reject(err);
        }
    }
    else {
        return defer.whenAll(loads.map((load) => { return load.defered.promise(); }));
    }
}

class ModuleLoader implements IModuleLoader {
    private _loads: IIndexer<IModuleLoad>;
    private _cssLoads: IIndexer<IModuleLoad>;

    constructor() {
        this._loads = {};
        this._cssLoads = {};
    }

    load(names: string[]): IPromise<void> {
        let self = this;

        //load CSS too if they are in the array
        let cssNames = names.filter((val) => { return self.isCSS(val); });
        let cssLoads = self.loadCSS(cssNames);

        let modNames = names.filter((val) => { return !self.isCSS(val); });
        let forLoad = modNames.filter((val) => { return !self._loads[val]; });

        if (forLoad.length > 0) {
            forLoad.forEach((name) => {
                self._loads[name] = {
                    name: name,
                    err: null,
                    state: LOAD_STATE.LOADING,
                    defered: defer.createSyncDeferred<any>()
                };
            });

            require(forLoad, () => {
                forLoad.forEach((name) => {
                    let load = self._loads[name];
                    load.state = LOAD_STATE.LOADED;
                    load.defered.resolve();
                });
            }, (err) => {
                forLoad.forEach((name) => {
                    let load = self._loads[name];
                    load.state = LOAD_STATE.LOADED;
                    load.err = err;
                    load.defered.reject(utils.str.format("Error loading modules: {0}", err));
                });
            });
        }

        let loads = modNames.map((name) => {
            return self._loads[name];
        });

        loads = loads.concat(cssLoads);
        return whenAll(loads);
    }
    whenAllLoaded(): IPromise<void>
    {
        let loads: IModuleLoad[] = [];
        coreUtils.iterateIndexer(this._loads, (name, val) => {
            loads.push(val);
        });
        return whenAll(loads);
    }

    private loadCSS(names: string[]): IModuleLoad[] {
        let self = this;
        let forLoad = names.filter((val) => { return !self._cssLoads[val]; });
        let urls = forLoad.map((val) => { return self.getUrl(val); });
       
        if (forLoad.length > 0) {
            let cssLoader = createCSSLoader();

            forLoad.forEach((name) => {
                self._cssLoads[name] = {
                    name: name,
                    err: null,
                    state: LOAD_STATE.LOADING,
                    defered: defer.createSyncDeferred<any>()
                };
            });

            cssLoader.loadStyles(urls).then(() => {
                forLoad.forEach((name) => {
                    let load = self._cssLoads[name];
                    load.state = LOAD_STATE.LOADED;
                    load.defered.resolve();
                });
            }, (err) => {
                forLoad.forEach((name) => {
                    let load = self._cssLoads[name];
                    load.state = LOAD_STATE.LOADED;
                    load.err = err;
                    load.defered.reject(err);
                });
            });
        }

        let loads = names.map((name) => {
            return self._cssLoads[name];
        });
        return loads;
    }
    private isCSS(name: string): boolean {
        return !!name && strUtils.startsWith(name, CSSPrefix);
    }
    private getUrl(name: string): string
    {
        if (this.isCSS(name)) {
            name = name.substr(CSSPrefix.length);
        }
        return require.toUrl(name);
    }
}