/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    LocaleERRS, Utils, IIndexer, IErrorHandler, IPromise, IVoidPromise, DummyError,
    BaseObject
} from "jriapp_shared";
import { DATA_ATTR } from "./const";
import {
    IElViewFactory, IElView, ILifeTimeScope,
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

export function createDataBindSvc(root: Document | HTMLElement, elViewFactory: IElViewFactory): IDataBindingService {
    return new DataBindingService(root, elViewFactory);
}

function fn_toBindableElement(el: HTMLElement): IBindableElement {
    let val: string, attr: Attr;
    const allAttrs = el.attributes, res: IBindableElement = { el: el, dataView: null, dataForm: null, expressions: [] };
    const n = allAttrs.length;
    for (let i = 0; i < n; i++) {
        attr = allAttrs[i];
        if (strUtils.startsWith(attr.name, DATA_ATTR.DATA_BIND)) {
            val = attr.value.trim();
            if (!val) {
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, attr.name, "empty"));
            }
            if (val[0] !== "{" && val[val.length - 1] !== "}") {
                val = "{" + val + "}";
            }
            res.expressions.push(val);
        }
        if (strUtils.startsWith(attr.name, DATA_ATTR.DATA_FORM)) {
            res.dataForm = attr.value.trim();
        }
        if (strUtils.startsWith(attr.name, DATA_ATTR.DATA_VIEW)) {
            res.dataView = attr.value.trim();
        }
    }
    return (!!res.dataView || res.expressions.length > 0) ? res : null;
 }

function fn_getBindableElements(scope: Document | HTMLElement): IBindableElement[] {
    const result: IBindableElement[] = [], allElems = dom.queryAll<HTMLElement>(scope, "*");
    allElems.forEach((el) => {
        const res = fn_toBindableElement(el);
        if (!!res) {
            result.push(res);
        }
    });

    return result;
}

function fn_getRequiredModules(el: HTMLElement): string[] {
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

function fn_getDataFormElements(bindElems: IBindableElement[]): HTMLElement[] {
    return bindElems.filter((bindElem) => {
        return !!bindElem.dataForm;
    }).map((bindElem) => {
        return bindElem.el;
    });
}

// mark all dataforms for easier checking that the element is a dataform
function fn_updDataFormAttr(bindElems: IBindableElement[]): void {
    bindElems.forEach((bindElem) => {
        if (!bindElem.dataForm && viewChecks.isDataForm(bindElem.el)) {
            bindElem.el.setAttribute(DATA_ATTR.DATA_FORM, "yes");
            bindElem.dataForm = "yes";
        }
    });
}

class DataBindingService extends BaseObject implements IDataBindingService, IErrorHandler {
    private _root: Document | HTMLElement;
    private _elViewFactory: IElViewFactory;
    private _objLifeTime: ILifeTimeScope;
    private _mloader: IModuleLoader;

    constructor(root: Document | HTMLElement, elViewFactory: IElViewFactory) {
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
    private _bindElView(elView: IElView, bindElem: IBindableElement, lftm: ILifeTimeScope, isInsideTemplate: boolean, defSource: any) {
        const self = this;
        lftm.addObj(elView);
        if (isInsideTemplate) {
            viewChecks.setIsInsideTemplate(elView);
        }

        // then create databinding if element has data-bind attribute
        const bindAttr = bindElem.expressions.join("");
        if (!!bindAttr) {
            const tempOpts: IBindingInfo[] = parser.parseOptions(bindAttr), len = tempOpts.length;
            for (let j = 0; j < len; j += 1) {
                const info = tempOpts[j];
                const op: IBindingOptions = getBindingOptions(info, elView, defSource);
                const binding = self.bind(op);
                lftm.addObj(binding);
            }
        }
    }
    private _bindTemplateElements(templateEl: HTMLElement): IPromise<ILifeTimeScope> {
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

            fn_updDataFormAttr(bindElems);

            // select all dataforms inside the scope
            const forms = fn_getDataFormElements(bindElems), needBinding = bindElems.filter((bindElem) => {
                return !viewChecks.isInNestedForm(templateEl, forms, bindElem.el);
            });

            needBinding.forEach((bindElem) => {
                const elView = self._elViewFactory.getOrCreateElView(bindElem.el);
                self._bindElView(elView, bindElem, lftm, true, null);
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
    bindTemplateElements(templateEl: HTMLElement): IPromise<ILifeTimeScope> {
        const self = this, requiredModules = fn_getRequiredModules(templateEl);
        let res: IPromise<ILifeTimeScope>;
        if (requiredModules.length > 0) {
            res = self._mloader.load(requiredModules).then(() => {
                return self._bindTemplateElements(templateEl);
            });
        } else {
            res = self._bindTemplateElements(templateEl);
        }

        res.catch((err) => {
            utils.queue.enque(() => {
                self.handleError(err, self);
            });
        });

        return res;
    }
    bindElements(scope: Document | HTMLElement, defaultDataContext: any, isDataFormBind: boolean, isInsideTemplate: boolean): IPromise<ILifeTimeScope> {
        const self = this, defer = _async.createDeferred<ILifeTimeScope>(true);
        scope = scope || doc;
        try {
            const bindElems = fn_getBindableElements(scope), lftm = new LifeTimeScope();

            if (!isDataFormBind) {
                fn_updDataFormAttr(bindElems);
            }

            // select all dataforms inside the scope
            const forms =fn_getDataFormElements(bindElems), needBinding = bindElems.filter((bindElem) => {
                return !viewChecks.isInNestedForm(scope, forms, bindElem.el);
            });

            needBinding.forEach((bindElem) => {
                const elView = self._elViewFactory.getOrCreateElView(bindElem.el);
                self._bindElView(elView, bindElem, lftm, isInsideTemplate, defaultDataContext);
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
        const defScope = this._root, defaultDataContext = boot.getApp(), self = this;
        this._cleanUp();
        const promise = this.bindElements(defScope, defaultDataContext, false, false);
        return promise.then((lftm) => {
            if (self.getIsDisposing()) {
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
