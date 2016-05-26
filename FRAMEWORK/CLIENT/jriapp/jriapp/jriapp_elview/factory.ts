/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR, STORE_KEY } from "../jriapp_core/const";
import { IElViewStore, IElView, IIndexer, IViewType, IApplication, IExports, IViewOptions, IErrorHandler,
    IElViewFactory, IElViewRegister } from "../jriapp_core/shared";
import { bootstrap } from "../jriapp_core/bootstrap";
import { ERRS } from "../jriapp_core/lang";
import { parser } from "../jriapp_core/parser";
import { SysChecks, ERROR } from "../jriapp_utils/coreutils";
import { LifeTimeScope, Utils as utils } from "../jriapp_utils/utils";

let $ = utils.dom.$;

export function createFactory(app: IApplication, num: number, register: IElViewRegister): IElViewFactory {
    return new ElViewFactory(app, num, register);
}
export function createRegister(next?: IElViewRegister): IElViewRegister {
    return new ElViewRegister(next);
}

class ElViewRegister implements IElViewRegister, IExports {
    private _exports: IIndexer<any>;
    private _next: IElViewRegister;

    constructor(next?: IElViewRegister) {
        this._exports = {};
        this._next = next;
    }
    registerElView(name: string, vw_type: IViewType): void {
        if (!bootstrap._getInternal().getObject(this, name)) {
            bootstrap._getInternal().registerObject(this, name, vw_type);
        }
        else
            throw new Error(utils.str.format(ERRS.ERR_OBJ_ALREADY_REGISTERED, name));
    }
    getElViewType(name: string): IViewType {
        let res = bootstrap._getInternal().getObject(this, name);
        if (!res && !!this._next) {
            res = this._next.getElViewType(name);
        }
        return res;
    }
    destroy(): void {
        this._exports = {};
    }
    getExports(): IIndexer<any> {
        return this._exports;
    }
}

class ElViewStore implements IElViewStore {
    private _ELV_STORE_KEY: string;

    constructor(instanceNum: number) {
        this._ELV_STORE_KEY = DATA_ATTR.EL_VIEW_KEY + instanceNum;
    }

    public destroy(): void {
    }
    //get element view associated with HTML element(if any)
    getElView(el: HTMLElement): IElView {
        return $.data(el, this._ELV_STORE_KEY);
    }
    //store association of HTML element with its element View
    setElView(el: HTMLElement, view?: IElView): void {
        if (!view) {
            $.removeData(el, this._ELV_STORE_KEY);
        }
        else {
            $.data(el, this._ELV_STORE_KEY, view);
        }
    }
}

class ElViewFactory implements IElViewFactory, IErrorHandler {
    private _store: IElViewStore;
    private _register: IElViewRegister;
    private _app: IApplication;

    constructor(app: IApplication, num: number, register: IElViewRegister) {
        this._app = app;
        this._store = new ElViewStore(num);
        this._register = register;
    }
    public destroy(): void {
        if (!this._store)
            return;
        this._store.destroy();
        this._store = null;
        this._register = null;
        this._app = null;
    }
    public handleError(error: any, source: any): boolean {
        if (ERROR.checkIsDummy(error)) {
            return true;
        }
        return this._app.handleError(error, source);
    }
    createElView(view_info: { name: string; options: IViewOptions; }): IElView {
        let viewType: IViewType, elView: IElView, options = view_info.options;
        let el = options.el;

        if (!!view_info.name) {
            viewType = this._register.getElViewType(view_info.name);
            if (!viewType)
                throw new Error(utils.str.format(ERRS.ERR_ELVIEW_NOT_REGISTERED, view_info.name));
        }
        if (!viewType) {
            let nodeNm = el.nodeName.toLowerCase(), attrType: string;
            switch (nodeNm) {
                case "input":
                    {
                        attrType = el.getAttribute("type");
                        nodeNm = nodeNm + ":" + attrType;
                        viewType = this._register.getElViewType(nodeNm);
                    }
                    break;
                default:
                    viewType = this._register.getElViewType(nodeNm);
                    break;
            }

            if (!viewType)
                throw new Error(utils.str.format(ERRS.ERR_ELVIEW_NOT_CREATED, nodeNm));
        }

        try {
            elView = new viewType(options);
        }
        catch (e) {
            //ensure clean up
            this._store.setElView(el, null);
            throw e;
        }
        return elView;
    }
    //checks if the element already has created and attached an ElView, if no then it creates and attaches ElView for the element
    getOrCreateElView(el: HTMLElement): IElView {
        let elView = this.store.getElView(el);
        //check if element view is already created for this element
        if (!!elView)
            return elView;
        let info = this.getElementViewInfo(el);
        return this.createElView(info);
    }
    getElementViewInfo(el: HTMLElement): { name: string; options: IViewOptions; } {
        let view_name: string = null, vw_options: IViewOptions = null, attr: string, data_view_op_arr: any[],
            data_view_op: any;
        if (el.hasAttribute(DATA_ATTR.DATA_VIEW)) {
            attr = el.getAttribute(DATA_ATTR.DATA_VIEW);
            data_view_op_arr = parser.parseOptions(attr);
            if (!!data_view_op_arr && data_view_op_arr.length > 0) {
                data_view_op = data_view_op_arr[0];
                if (!!data_view_op.name && data_view_op.name !== "default") {
                    view_name = data_view_op.name;
                }
                vw_options = data_view_op.options;
            }
        }
        let options: IViewOptions = utils.core.merge({ app: this._app, el: el }, vw_options);
        return { name: view_name, options: options };
    }
    get store() {
        return this._store;
    }
    get app() {
        return this._app;
    }
}