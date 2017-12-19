/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    LocaleERRS, Utils, IIndexer, IErrorHandler, IPromise, IVoidPromise, DummyError,
    BaseObject
} from "jriapp_shared";
import { DATA_ATTR, ELVIEW_NM } from "./const";
import {
    IElViewFactory, IElView, ILifeTimeScope, IBindArgs,
    IBindableElement, IBindingOptions, IBindingInfo, IDataBindingService, IModuleLoader
} from "./int";
import { bootstrap } from "./bootstrap";
import { LifeTimeScope } from "./utils/lifetime";
import { DomUtils } from "./utils/dom";
import { create as createModulesLoader } from "./utils/mloader";
import { getBindingOptions, Binding } from "./binding";
import { ViewChecks } from "./utils/viewchecks";
import { Parser } from "./utils/parser";

const utils = Utils, _async = utils.defer, viewChecks = ViewChecks, dom = DomUtils, doc = dom.document,
    strUtils = utils.str, boot = bootstrap, ERRS = LocaleERRS, parser = Parser;

export function createDataBindSvc(root: Document | Element, elViewFactory: IElViewFactory): IDataBindingService {
    return new DataBindingService(root, elViewFactory);
}

function fn_toBindableElement(el: Element): IBindableElement {
    let val: string, attr: Attr;
    const allAttrs = el.attributes, res: IBindableElement = {
        el: el,
        needToBind: false,
        dataForm: false,
        bindings: []
    };
    const n = allAttrs.length;
    let dataViewName: string, hasOptions = false;
    for (let i = 0; i < n; i++) {
        attr = allAttrs[i];
        if (strUtils.startsWith(attr.name, DATA_ATTR.DATA_BIND)) {
            val = strUtils.fastTrim(attr.value);
            if (!val) {
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, attr.name, "empty"));
            }
            if (val[0] !== "{" && val[val.length - 1] !== "}") {
                val = "{" + val + "}";
            }
            res.bindings.push(val);
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
    res.needToBind = !!dataViewName || hasOptions || res.bindings.length > 0
    return res.needToBind? res : null;
 }

function fn_getBindableElements(scope: Document | Element): IBindableElement[] {
    const result: IBindableElement[] = [], allElems = dom.queryAll<Element>(scope, "*");
    allElems.forEach((el) => {
        const res = fn_toBindableElement(el);
        if (!!res) {
            result.push(res);
        }
    });

    return result;
}

function fn_getRequiredModules(el: Element): string[] {
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
        name = strUtils.fastTrim(name);
        if (!!name) {
            hashMap[name] = name;
        }
    });
    return Object.keys(hashMap);
}

function fn_getDataFormElements(bindElems: IBindableElement[]): Element[] {
    return bindElems.filter((bindElem) => {
        return !!bindElem.dataForm;
    }).map((bindElem) => {
        return bindElem.el;
    });
}

interface IBindElViewArgs {
    readonly elView: IElView;
    readonly bindElem: IBindableElement;
    readonly lftm: ILifeTimeScope;
    readonly isTemplate: boolean;
    readonly dataContext: any;
}

class DataBindingService extends BaseObject implements IDataBindingService, IErrorHandler {
    private _root: Document | Element;
    private _elViewFactory: IElViewFactory;
    private _objLifeTime: ILifeTimeScope;
    private _mloader: IModuleLoader;

    constructor(root: Document | Element, elViewFactory: IElViewFactory) {
        super();
        this._root = root;
        this._elViewFactory = elViewFactory;
        this._objLifeTime = null;
        this._mloader = createModulesLoader();
    }
    private _cleanUp() {
        if (!!this._objLifeTime) {
            this._objLifeTime.dispose();
            this._objLifeTime = null;
        }
    }
    private _bindElView(args: IBindElViewArgs) {
        const self = this;
        args.lftm.addObj(args.elView);
        if (args.isTemplate) {
            viewChecks.setIsInsideTemplate(args.elView);
        }
     
        // then create databinding if element has data-bind attribute
        const bindings = args.bindElem.bindings;
        if (!!bindings && bindings.length > 0) {
            const bindInfos: IBindingInfo[] = parser.parseBindings(bindings),
                len = bindInfos.length;
            for (let j = 0; j < len; j += 1) {
                const op = getBindingOptions(bindInfos[j], args.elView, args.dataContext),
                    binding = self.bind(op);
                args.lftm.addObj(binding);
            }
        }
    }
    private _bindTemplateElements(templateEl: Element, dataContext: any): IPromise<ILifeTimeScope> {
        const self = this, defer = _async.createDeferred<ILifeTimeScope>(true);
        let bindElems: IBindableElement[];
        try {
            const rootBindEl: IBindableElement = fn_toBindableElement(templateEl), lftm: ILifeTimeScope = new LifeTimeScope();
            if (!!rootBindEl && !!rootBindEl.dataForm) {
                // in this case process only this element
                bindElems = [rootBindEl];
            } else {
                bindElems = fn_getBindableElements(templateEl);
                if (!!rootBindEl) {
                    bindElems.push(rootBindEl);
                }
            }

            // select all dataforms inside the scope
            const forms = fn_getDataFormElements(bindElems);
            const needBinding = bindElems.filter((bindElem) => {
                    return !viewChecks.isInNestedForm(templateEl, forms, bindElem.el);
                });

            needBinding.forEach((bindElem) => {
                const elView = self._elViewFactory.getOrCreateElView(bindElem.el, dataContext);
                self._bindElView({
                    elView: elView,
                    bindElem: bindElem,
                    lftm: lftm,
                    isTemplate: true,
                    dataContext: dataContext
                });
            });

            defer.resolve(lftm);
        } catch (err) {
            self.handleError(err, self);
            setTimeout(() => {
                defer.reject(new DummyError(err));
            }, 0);
        }

        return defer.promise();
    }
    bindTemplateElements(templateEl: Element, dataContext: any): IPromise<ILifeTimeScope> {
        const self = this, requiredModules = fn_getRequiredModules(templateEl);
        let res: IPromise<ILifeTimeScope>;
        if (requiredModules.length > 0) {
            res = self._mloader.load(requiredModules).then(() => {
                return self._bindTemplateElements(templateEl, dataContext);
            });
        } else {
            res = self._bindTemplateElements(templateEl, dataContext);
        }

        res.catch((err) => {
            utils.queue.enque(() => {
                self.handleError(err, self);
            });
        });

        return res;
    }
    bindElements(args: IBindArgs): IPromise<ILifeTimeScope> {
        const self = this, defer = _async.createDeferred<ILifeTimeScope>(true);
        const scope = args.scope || doc;
        try {
            const bindElems = fn_getBindableElements(scope), lftm = new LifeTimeScope();
            // select all dataforms inside the scope
            const forms = fn_getDataFormElements(bindElems);
            const needsBinding = bindElems.filter((bindElem) => {
                    return !viewChecks.isInNestedForm(scope, forms, bindElem.el);
                });

            needsBinding.forEach((bindElem) => {
                const elView = self._elViewFactory.getOrCreateElView(bindElem.el, args.dataContext);
                self._bindElView({
                    elView: elView,
                    bindElem: bindElem,
                    lftm: lftm,
                    isTemplate: args.isTemplate,
                    dataContext: args.dataContext
                });
            });

            defer.resolve(lftm);
        } catch (err) {
            self.handleError(err, self);
            setTimeout(() => {
                defer.reject(new DummyError(err));
            }, 0);
        }

        return defer.promise();
    }
    setUpBindings(): IVoidPromise {
        const defScope = this._root, dataContext = boot.getApp(), self = this;
        this._cleanUp();
        const promise = this.bindElements({
            scope: defScope,
            dataContext: dataContext,
            isDataForm: false,
            isTemplate: false
        });
        return promise.then((lftm) => {
            if (self.getIsStateDirty()) {
                lftm.dispose();
                return;
            }
            self._objLifeTime = lftm;
        });
    }
    bind(opts: IBindingOptions): Binding {
        return new Binding(opts);
    }
    dispose() {
        this._cleanUp();
        this._elViewFactory = null;
        this._mloader = null;
        super.dispose();
    }
}
