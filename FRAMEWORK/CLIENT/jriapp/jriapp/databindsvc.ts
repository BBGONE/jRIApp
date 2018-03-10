﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    Utils, IIndexer, IErrorHandler, IPromise, IVoidPromise, DummyError, BaseObject
} from "jriapp_shared";
import { DATA_ATTR, ELVIEW_NM, BindScope } from "./const";
import {
    IElViewFactory, IElView, ILifeTimeScope, IBindArgs,
    TBindingOptions, IDataBindingService, IModuleLoader, IApplication
} from "./int";
import { LifeTimeScope } from "./utils/lifetime";
import { DomUtils } from "./utils/dom";
import { create as createModulesLoader } from "./utils/mloader";
import { getBindingOptions, Binding } from "./binding";
import { ViewChecks } from "./utils/viewchecks";
import { Parser } from "./utils/parser";

const utils = Utils, { createDeferred } = utils.defer, viewChecks = ViewChecks, dom = DomUtils,
    { startsWith, fastTrim } = utils.str, parser = Parser, { forEachProp } = utils.core;

export function createDataBindSvc(app: IApplication): IDataBindingService {
    return new DataBindingService(app);
}

interface IBindable {
    el: Element;
    needToBind: boolean;
    dataForm: boolean;
    bindings: string[];
}

interface IBindElViewArgs {
    readonly elView: IElView;
    readonly bind: IBindable;
    readonly lftm: ILifeTimeScope;
    readonly dataContext: any;
}


function toBindable(el: Element): IBindable {
    let attr: Attr;
    const allAttrs = el.attributes, res: IBindable = {
        el: el,
        needToBind: false,
        dataForm: false,
        bindings: []
    };
    const n = allAttrs.length;
    let dataViewName: string, hasOptions = false;
    for (let i = 0; i < n; i++) {
        attr = allAttrs[i];
        if (startsWith(attr.name, DATA_ATTR.DATA_BIND)) {
            res.bindings.push(attr.value);
        }
        if (attr.name === DATA_ATTR.DATA_VIEW) {
            dataViewName = attr.value;
        }
        if (attr.name === DATA_ATTR.DATA_VIEW_OPTIONS) {
            hasOptions = true;
        }
    }

    if (dataViewName === ELVIEW_NM.DataForm) {
        res.dataForm = true;
    }
    res.needToBind = !!dataViewName || hasOptions || res.bindings.length > 0;
    return res.needToBind? res : null;
 }

function getBindables(scope: Document | Element): IBindable[] {
    const result: IBindable[] = [], allElems = dom.queryAll<Element>(scope, "*");
    allElems.forEach((el) => {
        const res = toBindable(el);
        if (!!res) {
            result.push(res);
        }
    });

    return result;
}

function getRequiredModules(el: Element): string[] {
    const attr = el.getAttribute(DATA_ATTR.DATA_REQUIRE);
    if (!attr) {
        return <string[]>[];
    }
    const reqArr = attr.split(",");

    const hashMap: IIndexer<any> = {};
    reqArr.forEach((name) => {
        if (!name) {
            return;
        }
        name = fastTrim(name);
        if (!!name) {
            hashMap[name] = name;
        }
    });
    return Object.keys(hashMap);
}

function filterBindables(scope: Document | Element, bindElems: IBindable[]): IBindable[] {
    // select all dataforms inside the scope
    const forms = bindElems.filter((bindElem) => {
        return !!bindElem.dataForm;
    }).map((bindElem) => {
        return bindElem.el;
        });

    if (forms.length === 0) {
        return bindElems;
    }
    // skip all the bindings inside dataforms (because a dataform performs databinding itself in its own scope)
    // check if the element inside of any dataform in the forms array
    return bindElems.filter((bindElem) => {
        return !viewChecks.isInNestedForm(scope, forms, bindElem.el);
    });
}

class DataBindingService extends BaseObject implements IDataBindingService, IErrorHandler {
    private _root: Document | Element;
    private _elViewFactory: IElViewFactory;
    private _objLifeTime: ILifeTimeScope;
    private _mloader: IModuleLoader;
    private _app: IApplication;

    constructor(app: IApplication) {
        super();
        this._app = app;
        this._root = app.appRoot;
        this._elViewFactory = app.viewFactory;
        this._objLifeTime = null;
        this._mloader = createModulesLoader();
    }
    dispose(): void {
        this._cleanUp();
        this._elViewFactory = null;
        this._mloader = null;
        this._app = null;
        super.dispose();
    }
    private _cleanUp(): void {
        if (!!this._objLifeTime) {
            this._objLifeTime.dispose();
            this._objLifeTime = null;
        }
    }
    private _bindElView(args: IBindElViewArgs): void {
        const self = this;
        args.lftm.addObj(args.elView);
     
        // then create databinding if element has data-bind attribute
        const bindings = args.bind.bindings;
        if (!!bindings && bindings.length > 0) {
            const bindInfos = parser.parseBindings(bindings, this._app),
                len = bindInfos.length;
            for (let j = 0; j < len; j += 1) {
                const op = getBindingOptions(bindInfos[j], args.elView, args.dataContext);
                const binding = self.bind(op);
                args.lftm.addObj(binding);
            }
        }
    }
    bindTemplate(templateEl: Element, dataContext: any): IPromise<ILifeTimeScope> {
        const self = this, requiredModules = getRequiredModules(templateEl);
        let res: IPromise<ILifeTimeScope>;
        if (requiredModules.length > 0) {
            res = self._mloader.load(requiredModules).then(() => {
                return self.bindElements({
                    scope: templateEl,
                    bind: BindScope.Template,
                    dataContext: dataContext
                });
            });
        } else {
            res = self.bindElements({
                scope: templateEl,
                bind: BindScope.Template,
                dataContext: dataContext
            });
        }

        res.catch((err) => {
            utils.queue.enque(() => {
                self.handleError(err, self);
            });
        });

        return res;
    }
    bindElements(args: IBindArgs): IPromise<ILifeTimeScope> {
        const self = this, defer = createDeferred<ILifeTimeScope>(true), scope = args.scope,
            lftm: ILifeTimeScope = new LifeTimeScope();

        let bindElems: IBindable[];
        try {
            let rootBindEl: IBindable = null;
            switch (args.bind) {
                case BindScope.Application:
                    bindElems = getBindables(scope);
                    break;
                case BindScope.Template:
                    rootBindEl = toBindable(<Element>scope);
                    if (!!rootBindEl && !!rootBindEl.dataForm) {
                        bindElems = [rootBindEl];
                    } else {
                        bindElems = getBindables(scope);
                        if (!!rootBindEl) {
                            bindElems.push(rootBindEl);
                        }
                    }
                    break;
                case BindScope.DataForm:
                    bindElems = getBindables(<Element>scope);
                    break;
                default:
                    throw new Error("Invalid Operation");
            }
            
            // skip all the bindings inside dataforms (because a dataform performs databinding itself in its own scope)
            const bindables = filterBindables(scope, bindElems);

            const viewsArr = bindables.map((bindElem) => {
                const elView = self._elViewFactory.getOrCreateElView(bindElem.el, args.dataContext);
                self._bindElView({
                    elView: elView,
                    bind: bindElem,
                    lftm: lftm,
                    dataContext: args.dataContext
                });
                return elView;
            }).filter((v) => !!v.viewMounted);

            const viewMap = utils.arr.toMap(viewsArr, (v) => v.uniqueID);
            forEachProp(viewMap, (n, v) => { v.viewMounted(); });

            defer.resolve(lftm);
        } catch (err) {
            lftm.dispose();
            self.handleError(err, self);
            setTimeout(() => {
                defer.reject(new DummyError(err));
            }, 0);
        }

        return defer.promise();
    }
    setUpBindings(): IVoidPromise {
        const bindScope = this._root, dataContext = this._app, self = this;
        this._cleanUp();
        const promise = this.bindElements({
            scope: bindScope,
            bind: BindScope.Application,
            dataContext: dataContext
        });

        return promise.then((lftm: ILifeTimeScope) => {
            if (self.getIsStateDirty()) {
                lftm.dispose();
                return;
            }
            self._objLifeTime = lftm;
        });
    }
    bind(opts: TBindingOptions): Binding {
        return new Binding(opts);
    }
 }
