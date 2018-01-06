/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils, IIndexer, IPromise, IDeferred } from "jriapp_shared";
import { IModuleLoader } from "../int";
import { createCssLoader as createCSSLoader } from "./sloader";

const utils = Utils, { forEachProp } = utils.core, strUtils = utils.str, _async = utils.defer,
    arr = utils.arr, CSSPrefix = "css!";
//ambient require function
declare var require: any;

let _moduleLoader: IModuleLoader = null;

export function create(): IModuleLoader {
    if (!_moduleLoader) {
        _moduleLoader = new ModuleLoader();
    }
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
    if (!loads || loads.length === 0) {
        return _async.resolve<void>(void 0, true);
    }
    if (loads.length === 1) {
        return loads[0].defered.promise();
    }

    const cnt = loads.length;
    let resolved = 0, err: any = null;
    for (let i = 0; i < cnt; i += 1) {
        if (loads[i].state === LOAD_STATE.LOADED) {
            ++resolved;
            if (!!loads[i].err) {
                err = loads[i].err;
            }
        }
    }

    if (resolved === cnt) {
        return !err ? _async.resolve<void>(void 0, true) : _async.reject(err);
    } else {
        return _async.whenAll(loads.map((load) => {
            return load.defered.promise();
        }));
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
        const self = this;

        // load CSS too if they are in the array
        const cssNames = names.filter((val) => { return self.isCSS(val); }), cssLoads = self.loadCSS(cssNames),
            modNames = names.filter((val) => { return !self.isCSS(val); }), forLoad = modNames.filter((val) => {
                return !self._loads[val];
            });

        if (forLoad.length > 0) {
            forLoad.forEach((name) => {
                self._loads[name] = {
                    name: name,
                    err: null,
                    state: LOAD_STATE.LOADING,
                    defered: _async.createDeferred<any>(true)
                };
            });

            //load the modules providing module names to ambient require
            require(forLoad, () => {
                forLoad.forEach((name) => {
                    const load = self._loads[name];
                    load.state = LOAD_STATE.LOADED;
                    load.defered.resolve();
                });
            }, (err: any) => {
                forLoad.forEach((name) => {
                    const load = self._loads[name];
                    load.state = LOAD_STATE.LOADED;
                    load.err = err;
                    load.defered.reject(utils.str.format("Error loading modules: {0}", err));
                });
            });
        }

        const loads = arr.merge<IModuleLoad>([modNames.map((name) => {
            return self._loads[name];
        }), cssLoads]);

        return whenAll(loads);
    }
    whenAllLoaded(): IPromise<void> {
        const loads: IModuleLoad[] = [];
        forEachProp(this._loads, (name, val) => {
            loads.push(val);
        });
        return whenAll(loads);
    }

    private loadCSS(names: string[]): IModuleLoad[] {
        const self = this, forLoad = names.filter((val) => {
            return !self._cssLoads[val];
        }), urls = forLoad.map((val) => {
            return self.getUrl(val);
        });

        if (forLoad.length > 0) {
            const cssLoader = createCSSLoader();

            forLoad.forEach((name) => {
                self._cssLoads[name] = {
                    name: name,
                    err: null,
                    state: LOAD_STATE.LOADING,
                    defered: _async.createDeferred<any>(true)
                };
            });

            cssLoader.loadStyles(urls).then(() => {
                forLoad.forEach((name) => {
                    const load = self._cssLoads[name];
                    load.state = LOAD_STATE.LOADED;
                    load.defered.resolve();
                });
            }, (err) => {
                forLoad.forEach((name) => {
                    const load = self._cssLoads[name];
                    load.state = LOAD_STATE.LOADED;
                    load.err = err;
                    load.defered.reject(err);
                });
            });
        }

        const loads = names.map((name) => {
            return self._cssLoads[name];
        });
        return loads;
    }
    private isCSS(name: string): boolean {
        return !!name && strUtils.startsWith(name, CSSPrefix);
    }
    private getUrl(name: string): string {
        if (this.isCSS(name)) {
            name = name.substr(CSSPrefix.length);
        }

        //convert the name to url using ambient require
        return require.toUrl(name);
    }
}
