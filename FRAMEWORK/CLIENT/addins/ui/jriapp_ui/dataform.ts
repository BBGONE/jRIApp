/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, IBaseObject, IEditable, IErrorNotification,
    IValidationInfo, IVoidPromise, BaseObject, LocaleERRS as ERRS,
    LocaleSTRS as STRS, Debounce
} from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { $ } from "jriapp/utils/jquery";
import { DomUtils } from "jriapp/utils/dom";
import { DATA_ATTR, ELVIEW_NM } from "jriapp/const";
import { ViewChecks } from "jriapp/utils/viewchecks";
import {
    IApplication, IContent, IElView, ILifeTimeScope, IViewOptions
} from "jriapp/int";
import {
    Parser
} from "jriapp/utils/parser";
import { bootstrap } from "jriapp/bootstrap";
import { BaseElView, fn_addToolTip } from "./baseview";
import { Binding } from "jriapp/binding";
import { parseContentAttr } from "./content/int";

const utils = Utils, dom = DomUtils, doc = dom.document,
    checks = utils.check, coreUtils = utils.core, strUtils = utils.str,
    sys = utils.sys, parser = Parser, boot = bootstrap, viewChecks = ViewChecks;

export const css = {
    dataform: "ria-dataform",
    error: "ria-form-error"
};

viewChecks.setIsInsideTemplate = function (elView: BaseElView) {
    if (!!elView && elView instanceof DataFormElView) {
        (<DataFormElView>elView).form.isInsideTemplate = true;
    }
};

viewChecks.isDataForm = function (el: HTMLElement): boolean {
    if (!el) {
        return false;
    }

    if (el.hasAttribute(DATA_ATTR.DATA_FORM)) {
        return true;
    }
    else {
        const attr = el.getAttribute(DATA_ATTR.DATA_VIEW);
        if (!attr) {
            return false;
        }
        const opts = parser.parseOptions(attr);
        return (opts.length > 0 && opts[0].name === ELVIEW_NM.DataForm);
    }
};

viewChecks.isInsideDataForm = function (el: HTMLElement): boolean {
    if (!el) {
        return false;
    }

    const parent = el.parentElement;
    if (!!parent) {
        if (!viewChecks.isDataForm(parent)) {
            return viewChecks.isInsideDataForm(parent);
        }
        else {
            return true;
        }
    }
    
    return false;
};

//check if the element inside of any dataform in the forms array
viewChecks.isInNestedForm = function (root: any, forms: HTMLElement[], el: HTMLElement): boolean {
    let i: number, oNode: HTMLElement, len = forms.length;
    if (len === 0) {
        return false;
    }
    oNode = el.parentElement;

    while (!!oNode) {
        for (i = 0; i < len; i += 1) {
            if (oNode === forms[i]) {
                //we found the form to be among the parents
                return true;
            }
        }

        if (!!root && oNode === root) {
            //reached up to the root
            return false;
        }

        //try parent element
        oNode = oNode.parentElement;
    }

    return false;
};

/*
       in case of dataforms nesting, element's parent dataform can be nested dataform
       this function returns element dataform
*/
viewChecks.getParentDataForm = function (rootForm: HTMLElement, el: HTMLElement): HTMLElement {
    if (!el)
        return null;
    let parent = el.parentElement, attr: string, opts: any[];
    if (!!parent) {
        if (parent === rootForm)
            return rootForm;
        if (viewChecks.isDataForm(parent)) {
            return parent;
        }
        else
            return viewChecks.getParentDataForm(rootForm, parent);
    }

    return null;
};

function getFieldInfo(obj: any, fieldName: string): IFieldInfo {
    if (!obj)
        return null;
    if (!!obj._aspect && checks.isFunc(obj._aspect.getFieldInfo)) {
        return obj._aspect.getFieldInfo(fieldName);
    }
    else if (checks.isFunc(obj.getFieldInfo)) {
        return obj.getFieldInfo(fieldName);
    }
    else
        return null;
}

const PROP_NAME = {
    dataContext: "dataContext",
    isEditing: "isEditing",
    validationErrors: "validationErrors",
    form: "form"
};

export class DataForm extends BaseObject {
    private static _DATA_FORM_SELECTOR = ["*[", DATA_ATTR.DATA_FORM, "]"].join("");
    private static _DATA_CONTENT_SELECTOR = ["*[", DATA_ATTR.DATA_CONTENT, "]:not([", DATA_ATTR.DATA_COLUMN, "])"].join("");
    private _el: HTMLElement;
    private _objId: string;
    private _dataContext: IBaseObject;
    private _isEditing: boolean;
    private _content: IContent[];
    private _lfTime: ILifeTimeScope;
    private _contentCreated: boolean;
    private _editable: IEditable;
    private _errNotification: IErrorNotification;
    private _parentDataForm: IElView;
    private _errors: IValidationInfo[];
    private _isInsideTemplate: boolean;
    private _contentPromise: IVoidPromise;
 
    constructor(options: IViewOptions) {
        super();
        const self = this;
        this._el = options.el;
        this._objId = coreUtils.getNewID("frm");
        this._dataContext = null;
        dom.addClass([this._el], css.dataform);
        this._isEditing = false;
        this._content = [];
        this._lfTime = null;
        this._contentCreated = false;
        this._editable = null;
        this._errNotification = null;
        this._parentDataForm = null;
        this._errors = null;
        this._contentPromise = null;
       
        const parent = viewChecks.getParentDataForm(null, this._el);
        //if this form is nested inside another dataform
        //subscribe for parent's destroy event
        if (!!parent) {
            self._parentDataForm = this.app.viewFactory.getOrCreateElView(parent);
            self._parentDataForm.addOnDestroyed(function (sender, args) {
                //destroy itself if parent form is destroyed
                if (!self._isDestroyCalled)
                    self.destroy();
            }, self._objId);
        }
    }
    private _getBindings(): Binding[] {
        if (!this._lfTime)
            return [];
        let arr: any[] = this._lfTime.getObjs(), res: Binding[] = [];
        for (let i = 0, len = arr.length; i < len; i += 1) {
            if (sys.isBinding(arr[i]))
                res.push(arr[i]);
        }
        return res;
    }
    private _getElViews(): BaseElView[] {
        if (!this._lfTime)
            return [];
        let arr: any[] = this._lfTime.getObjs(), res: BaseElView[] = [];
        for (let i = 0, len = arr.length; i < len; i += 1) {
            if (viewChecks.isElView(arr[i]))
                res.push(arr[i]);
        }
        return res;
    }
    private _createContent(): IVoidPromise {
        const dctx: any = this._dataContext, self = this;
        if (!dctx) {
            return;
        }
        const contentElements = utils.arr.fromList<HTMLElement>(this._el.querySelectorAll(DataForm._DATA_CONTENT_SELECTOR)),
            isEditing = this.isEditing;

        //select all dataforms inside the scope
        const forms = utils.arr.fromList<HTMLElement>(this._el.querySelectorAll(DataForm._DATA_FORM_SELECTOR));

        contentElements.forEach(function (el) {
            //check if the element inside a nested dataform
            if (viewChecks.isInNestedForm(self._el, forms, el))
                return;
            const attr = el.getAttribute(DATA_ATTR.DATA_CONTENT),
                op = parseContentAttr(attr);
            if (!!op.fieldName && !op.fieldInfo) {
                op.fieldInfo = getFieldInfo(dctx, op.fieldName);
                if (!op.fieldInfo) {
                    throw new Error(strUtils.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, "", op.fieldName));
                }
            }

            const contentType = boot.contentFactory.getContentType(op);
            const content = new contentType({ parentEl: el, contentOptions: op, dataContext: dctx, isEditing: isEditing });
            self._content.push(content);
            content.render();
        });

        const promise = self.app._getInternal().bindElements(this._el, dctx, true, this.isInsideTemplate);
        return promise.then((lftm) => {
            if (self.getIsDestroyCalled()) {
                lftm.destroy();
                return;
            }
            self._lfTime = lftm;
            const bindings = self._getBindings();
            bindings.forEach((binding) => {
                if (!binding.isSourceFixed)
                    binding.source = dctx;
            });
            self._contentCreated = true;
        });
    }
    private _updateCreatedContent() {
        let dctx: any = this._dataContext, self = this;
        try {
            this._content.forEach(function (content) {
                content.dataContext = dctx;
                content.isEditing = self.isEditing;
            });

            let bindings = this._getBindings();
            bindings.forEach(function (binding) {
                if (!binding.isSourceFixed)
                    binding.source = dctx;
            });
        }
        catch (ex) {
            utils.err.reThrow(ex, this.handleError(ex, this));
        }
    }
    private _updateContent() {
        const self = this;
        try {
            if (self._contentCreated) {
                self._updateCreatedContent();
            }
            else {
                if (!!self._contentPromise) {
                    self._contentPromise.then(() => {
                        if (self.getIsDestroyCalled())
                            return;
                        self._updateCreatedContent();
                    }, (err) => {
                        if (self.getIsDestroyCalled())
                            return;
                        self.handleError(err, self);
                    });
                }
                else {
                    self._contentPromise = self._createContent();
                }
            }
        }
        catch (ex) {
            utils.err.reThrow(ex, self.handleError(ex, self));
        }
    }
    private _onDSErrorsChanged(sender?: any, args?: any) {
        if (!!this._errNotification)
            this.validationErrors = this._errNotification.getAllErrors();
    }
    _onIsEditingChanged(sender: any, args: any) {
        this.isEditing = this._editable.isEditing;
    }
    private _bindDS() {
        const dataContext = this._dataContext, self = this;
        if (!dataContext)
            return;

        if (!!dataContext) {
            this._editable = sys.getEditable(dataContext);
            this._errNotification = sys.getErrorNotification(dataContext);
        }

        dataContext.addOnDestroyed(function (s, a) {
            self.dataContext = null;
        }, self._objId);

        if (!!this._editable) {
            (<IBaseObject><any>this._editable).addOnPropertyChange(PROP_NAME.isEditing, self._onIsEditingChanged, self._objId, self);
        }

        if (!!this._errNotification) {
            this._errNotification.addOnErrorsChanged(self._onDSErrorsChanged, self._objId, self);
        }
    }
    private _unbindDS() {
        const dataContext = this._dataContext;
        this.validationErrors = null;
        if (!!dataContext && !dataContext.getIsDestroyCalled()) {
            dataContext.removeNSHandlers(this._objId);
            if (!!this._editable) {
                (<IBaseObject><any>this._editable).removeNSHandlers(this._objId);
            }
            if (!!this._errNotification) {
                this._errNotification.removeOnErrorsChanged(this._objId);
            }
        }
        this._editable = null;
        this._errNotification = null;
    }
    private _clearContent() {
        this._content.forEach(function (content) {
            content.destroy();
        });
        this._content = [];
        if (!!this._lfTime) {
            this._lfTime.destroy();
            this._lfTime = null;
        }
        this._contentCreated = false;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._clearContent();
        dom.removeClass([this.el], css.dataform);
        this._el = null;
        this._unbindDS();
        const parentDataForm = this._parentDataForm;
        this._parentDataForm = null;
        if (!!parentDataForm && !parentDataForm.getIsDestroyCalled()) {
            parentDataForm.removeNSHandlers(this._objId);
        }
        this._dataContext = null;
        this._contentCreated = false;
        this._contentPromise = null;
        super.destroy();
    }
    toString() {
        return "DataForm";
    }
    get app() { return boot.getApp(); }
    get el() { return this._el; }
    get dataContext() { return this._dataContext; }
    set dataContext(v) {
        if (v === this._dataContext)
            return;

        if (!!v && !sys.isBaseObj(v)) {
            throw new Error(ERRS.ERR_DATAFRM_DCTX_INVALID);
        }

        this._unbindDS();
        this._dataContext = v;

        this._bindDS();
        this._updateContent();
        if (!!this._dataContext) {
            if (!!this._editable && this._isEditing !== this._editable.isEditing) {
                this.isEditing = this._editable.isEditing;
            }
            if (!!this._errNotification) {
                this._onDSErrorsChanged();
            }
        }

        this.raisePropertyChanged(PROP_NAME.dataContext);
    }
    get isEditing() { return this._isEditing; }
    set isEditing(v) {
        let dataContext: any = this._dataContext;
        if (!dataContext)
            return;
        let isEditing = this._isEditing, editable: IEditable;

        if (!!this._editable)
            editable = this._editable;

        if (!editable && v !== isEditing) {
            this._isEditing = v;
            this._updateContent();
            this.raisePropertyChanged(PROP_NAME.isEditing);
            return;
        }


        if (v !== isEditing && !!editable) {
            try {
                if (v) {
                    editable.beginEdit();
                }
                else {
                    editable.endEdit();
                }
            }
            catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, dataContext));
            }
        }

        if (!!editable && editable.isEditing !== isEditing) {
            this._isEditing = editable.isEditing;
            this._updateContent();
            this.raisePropertyChanged(PROP_NAME.isEditing);
        }
    }
    get validationErrors() { return this._errors; }
    set validationErrors(v) {
        if (v !== this._errors) {
            this._errors = v;
            this.raisePropertyChanged(PROP_NAME.validationErrors);
        }
    }
    get isInsideTemplate() { return this._isInsideTemplate; }
    set isInsideTemplate(v) {
        this._isInsideTemplate = v;
    }
}

export class DataFormElView extends BaseElView {
    private _form: DataForm;
    private _errorGliph: HTMLElement;

    constructor(options: IViewOptions) {
        super(options);
        const self = this;
        this._form = new DataForm(options);
        this._errorGliph = null;
        this._form.addOnPropertyChange("*", function (form, args) {
            switch (args.property) {
                case PROP_NAME.validationErrors:
                    self.validationErrors = form.validationErrors;
                    break;
                case PROP_NAME.dataContext:
                    self.raisePropertyChanged(args.property);
                    break;
            }
        }, this.uniqueID);
    }
    protected _getErrorTipInfo(errors: IValidationInfo[]) {
        const tip = ["<b>", STRS.VALIDATE.errorInfo, "</b>", "<ul>"];
        errors.forEach(function (info) {
            let fieldName = info.fieldName, res = "";
            if (!!fieldName) {
                res = STRS.VALIDATE.errorField + " " + fieldName
            }
            info.errors.forEach(function (str) {
                if (!!res)
                    res = res + " -> " + str;
                else
                    res = str;
            });
            tip.push("<li>" + res + "</li>");
            res = "";
        });
        tip.push("</ul>");
        return tip.join("");
    }
    protected _updateErrorUI(el: HTMLElement, errors: IValidationInfo[]) {
        if (!el) {
            return;
        }
        if (!!errors && errors.length > 0) {
            if (!this._errorGliph) {
                this._errorGliph = dom.fromHTML(`<div data-name="error_info" class="${css.error}" />`)[0];
                dom.prepend(el, this._errorGliph);
            }
            fn_addToolTip(this._errorGliph, this._getErrorTipInfo(errors), true);
            this._setFieldError(true);
        }
        else {
            if (!!this._errorGliph) {
                fn_addToolTip(this._errorGliph, null);
                dom.removeNode(this._errorGliph);
                this._errorGliph = null;
            }
            this._setFieldError(false);
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._errorGliph) {
            dom.removeNode(this._errorGliph);
            this._errorGliph = null;
        }
        if (!this._form.getIsDestroyCalled()) {
            this._form.destroy();
        }
        super.destroy();
    }
    toString() {
        return "DataFormElView";
    }
    get dataContext() {
        return this._form.dataContext;
    }
    set dataContext(v) {
        if (this.dataContext !== v) {
            this._form.dataContext = v;
        }
    }
    get form() { return this._form; }
}

boot.registerElView(ELVIEW_NM.DataForm, DataFormElView);