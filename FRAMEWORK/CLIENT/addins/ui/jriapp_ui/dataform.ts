/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    Utils, IBaseObject, IEditable, IErrorNotification,
    IValidationInfo, IVoidPromise, BaseObject, LocaleERRS as ERRS,
    LocaleSTRS as STRS, IValidatable
} from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { DomUtils } from "jriapp/utils/dom";
import { DATA_ATTR, ELVIEW_NM, BindScope } from "jriapp/const";
import { ViewChecks } from "jriapp/utils/viewchecks";
import { IContent, IElView, ILifeTimeScope, IViewOptions, IApplication } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { fn_addToolTip, cssStyles } from "./int";
import { addError, removeError } from "./utils/errors";
import { BaseElView } from "./baseview";

import { Binding } from "jriapp/binding";
import { parseContentAttr } from "./content/int";

const utils = Utils, dom = DomUtils, checks = utils.check, { getNewID } = utils.core, strUtils = utils.str,
    sys = utils.sys, boot = bootstrap, viewChecks = ViewChecks, _async = utils.defer;

viewChecks.isDataForm = (el: Element) => {
    if (!el) {
        return false;
    }
    const attr = el.getAttribute(DATA_ATTR.DATA_VIEW);
    return (!attr) ? false : (attr === ELVIEW_NM.DataForm);
};

viewChecks.isInsideDataForm = (el: Element) => {
    if (!el) {
        return false;
    }

    const parent = el.parentElement;
    if (!!parent) {
        if (!viewChecks.isDataForm(parent)) {
            return viewChecks.isInsideDataForm(parent);
        } else {
            return true;
        }
    }

    return false;
};

// check if the element inside of any dataform in the forms array
viewChecks.isInNestedForm = (root: any, forms: Element[], el: Element) => {
    const len = forms.length;
    if (len === 0) {
        return false;
    }
    let oNode = el.parentElement;

    while (!!oNode) {
        for (let i = 0; i < len; i += 1) {
            if (oNode === forms[i]) {
                // we found the form to be among the parents
                return true;
            }
        }

        if (!!root && oNode === root) {
            // reached up to the root
            return false;
        }

        // try parent element
        oNode = oNode.parentElement;
    }

    return false;
};

/*
       in case of dataforms nesting, element's parent dataform can be nested dataform
       this function returns element dataform
*/
viewChecks.getParentDataForm = (rootForm: HTMLElement, el: HTMLElement) => {
    if (!el) {
        return null;
    }
    const parent = el.parentElement;
    if (!!parent) {
        if (parent === rootForm) {
            return rootForm;
        }
        if (viewChecks.isDataForm(parent)) {
            return parent;
        } else {
            return viewChecks.getParentDataForm(rootForm, parent);
        }
    }

    return null;
};

function getFieldInfo(obj: any, fieldName: string): IFieldInfo {
    if (!obj) {
        return null;
    }
    if (!!obj._aspect && checks.isFunc(obj._aspect.getFieldInfo)) {
        return obj._aspect.getFieldInfo(fieldName);
    } else if (checks.isFunc(obj.getFieldInfo)) {
        return obj.getFieldInfo(fieldName);
    } else {
        return null;
    }
}

 function getErrorTipInfo(errors: IValidationInfo[]): string {
    const tip = ["<b>", STRS.VALIDATE.errorInfo, "</b>", "<ul>"];
    errors.forEach((info) => {
        const fieldName = info.fieldName;
        let res = "";
        if (!!fieldName) {
            res = STRS.VALIDATE.errorField + " " + fieldName;
        }
        info.errors.forEach((str) => {
            if (!!res) {
                res = res + " -> " + str;
            } else {
                res = str;
            }
        });
        tip.push("<li>" + res + "</li>");
        res = "";
    });
    tip.push("</ul>");
    return tip.join("");
}

export class DataForm extends BaseObject implements IValidatable {
    private static _DATA_FORM_SELECTOR = ["*[", DATA_ATTR.DATA_VIEW, "='", ELVIEW_NM.DataForm, "']"].join("");
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
    private _contentPromise: IVoidPromise;
    private _errorGliph: HTMLElement;

    constructor(el: HTMLElement, options: IViewOptions) {
        super();
        const self = this;
        this._el = el;
        this._objId = getNewID("frm");
        this._dataContext = null;
        this._errorGliph = null;
        dom.addClass([el], cssStyles.dataform);
        this._isEditing = false;
        this._content = [];
        this._lfTime = null;
        this._contentCreated = false;
        this._editable = null;
        this._errNotification = null;
        this._parentDataForm = null;
        this._errors = null;
        this._contentPromise = null;

        const parent = viewChecks.getParentDataForm(null, el);
        // if this form is nested inside another dataform
        // subscribe for parent's dispose event
        if (!!parent) {
            self._parentDataForm = this.app.viewFactory.getElView(parent);
            self._parentDataForm.objEvents.addOnDisposed(() => {
                // dispose itself if parent form is destroyed
                if (!self.getIsStateDirty()) {
                    self.dispose();
                }
            }, self._objId);
        }
    }
    private _getBindings(): Binding[] {
        if (!this._lfTime) {
            return [];
        }
        const arr: any[] = this._lfTime.getObjs(), res: Binding[] = [], len = arr.length;
        for (let i = 0; i < len; i += 1) {
            if (sys.isBinding(arr[i])) {
                res.push(arr[i]);
            }
        }
        return res;
    }
    private _createContent(): IVoidPromise {
        const dctx: any = this._dataContext, self = this;
        if (!dctx) {
            return _async.reject<void>("DataForm's DataContext is not set");
        }
        const contentElements = utils.arr.fromList<HTMLElement>(this._el.querySelectorAll(DataForm._DATA_CONTENT_SELECTOR)),
            isEditing = this.isEditing;

        // select all dataforms inside the scope
        const forms = utils.arr.fromList<HTMLElement>(this._el.querySelectorAll(DataForm._DATA_FORM_SELECTOR));

        contentElements.forEach((el) => {
            // check if the element inside a nested dataform
            if (viewChecks.isInNestedForm(self._el, forms, el)) {
                return;
            }
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
        const promise = self.app._getInternal().bindElements({
            scope: this._el,
            bind: BindScope.DataForm,
            dataContext: dctx
        });

        return promise.then((lftm: ILifeTimeScope) => {
            if (self.getIsStateDirty()) {
                lftm.dispose();
                return;
            }
            self._lfTime = lftm;
            const bindings = self._getBindings();
            bindings.forEach((binding) => {
                if (!binding.isSourceFixed) {
                    binding.source = dctx;
                }
            });
            self._contentCreated = true;
        });
    }
    private _updateCreatedContent(): void {
        const dctx: any = this._dataContext, self = this;
        try {
            this._content.forEach((content) => {
                content.dataContext = dctx;
                content.isEditing = self.isEditing;
            });

            const bindings = this._getBindings();
            bindings.forEach((binding) => {
                if (!binding.isSourceFixed) {
                    binding.source = dctx;
                }
            });
        } catch (ex) {
            utils.err.reThrow(ex, this.handleError(ex, this));
        }
    }
    private _updateContent(): void {
        const self = this;
        try {
            if (self._contentCreated) {
                self._updateCreatedContent();
            } else {
                if (!!self._contentPromise) {
                    self._contentPromise.then(() => {
                        if (self.getIsStateDirty()) {
                            return;
                        }
                        self._updateCreatedContent();
                    }, (err) => {
                        if (self.getIsStateDirty()) {
                            return;
                        }
                        self.handleError(err, self);
                    });
                } else {
                    self._contentPromise = self._createContent();
                }
            }
        } catch (ex) {
            utils.err.reThrow(ex, self.handleError(ex, self));
        }
    }
    private _onDSErrorsChanged(): void {
        if (!!this._errNotification) {
            this.validationErrors = this._errNotification.getAllErrors();
        }
    }
    _onIsEditingChanged(): void {
        this.isEditing = this._editable.isEditing;
    }
    private _bindDS(): void {
        const dataContext = this._dataContext, self = this;
        if (!dataContext) {
            return;
        }

        if (!!dataContext) {
            this._editable = sys.getEditable(dataContext);
            this._errNotification = sys.getErrorNotification(dataContext);
        }

        dataContext.objEvents.addOnDisposed(() => {
            self.dataContext = null;
        }, self._objId);

        if (!!this._editable) {
            this._editable.objEvents.onProp("isEditing", self._onIsEditingChanged, self._objId, self);
        }

        if (!!this._errNotification) {
            this._errNotification.addOnErrorsChanged(self._onDSErrorsChanged, self._objId, self);
        }
    }
    private _unbindDS(): void {
        const dataContext = this._dataContext;
        this.validationErrors = null;
        if (!!dataContext && !dataContext.getIsStateDirty()) {
            dataContext.objEvents.offNS(this._objId);
            if (!!this._editable) {
                this._editable.objEvents.offNS(this._objId);
            }
            if (!!this._errNotification) {
                this._errNotification.offOnErrorsChanged(this._objId);
            }
        }
        this._editable = null;
        this._errNotification = null;
    }
    private _clearContent(): void {
        this._content.forEach((content) => {
            content.dispose();
        });
        this._content = [];
        if (!!this._lfTime) {
            this._lfTime.dispose();
            this._lfTime = null;
        }
        this._contentCreated = false;
    }
    protected _setErrors(errors: IValidationInfo[]): void {
        const el = this.el;
        if (!!errors && errors.length > 0) {
            if (!this._errorGliph) {
                this._errorGliph = dom.fromHTML(`<div data-name="error_info" class="${cssStyles.error}" />`)[0];
                dom.prepend(el, this._errorGliph);
            }
            fn_addToolTip(this._errorGliph, getErrorTipInfo(errors), true);
            addError(el);
        } else {
            if (!!this._errorGliph) {
                fn_addToolTip(this._errorGliph, null);
                dom.removeNode(this._errorGliph);
                this._errorGliph = null;
            }
            removeError(el);
        }
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this.validationErrors = null;
        this._clearContent();
        dom.removeClass([this.el], cssStyles.dataform);
        this._unbindDS();
        const parentDataForm = this._parentDataForm;
        this._parentDataForm = null;
        if (!!parentDataForm && !parentDataForm.getIsStateDirty()) {
            parentDataForm.objEvents.offNS(this._objId);
        }
        this._dataContext = null;
        this._contentCreated = false;
        this._contentPromise = null;
        this._el = null;
        super.dispose();
    }
    toString(): string {
        return "DataForm";
    }
    get app(): IApplication {
        return boot.getApp();
    }
    get el(): HTMLElement {
        return this._el;
    }
    get dataContext(): IBaseObject {
        return this._dataContext;
    }
    set dataContext(v) {
        if (v === this._dataContext) {
            return;
        }

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

        this.objEvents.raiseProp("dataContext");
    }
    get isEditing(): boolean {
        return this._isEditing;
    }
    set isEditing(v) {
        const dataContext = this._dataContext;
        if (!dataContext) {
            return;
        }
        const isEditing = this._isEditing;
        let editable: IEditable;

        if (!!this._editable) {
            editable = this._editable;
        }

        if (!editable && v !== isEditing) {
            this._isEditing = v;
            this._updateContent();
            this.objEvents.raiseProp("isEditing");
            return;
        }


        if (v !== isEditing && !!editable) {
            try {
                if (v) {
                    editable.beginEdit();
                } else {
                    editable.endEdit();
                }
            } catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, dataContext));
            }
        }

        if (!!editable && editable.isEditing !== isEditing) {
            this._isEditing = editable.isEditing;
            this._updateContent();
            this.objEvents.raiseProp("isEditing");
        }
    }
    get validationErrors(): IValidationInfo[] {
        return this._errors;
    }
    set validationErrors(v) {
        if (v !== this._errors) {
            this._errors = v;
            this._setErrors(this._errors);
            this.objEvents.raiseProp("validationErrors");
        }
    }
}

export class DataFormElView extends BaseElView {
    private _form: DataForm;

    constructor(el: HTMLElement, options: IViewOptions) {
        super(el, options);
        const self = this;
        this._form = new DataForm(el, options);
        this._form.objEvents.onProp("*", (form, args) => {
            switch (args.property) {
                case "validationErrors":
                case "dataContext":
                    self.objEvents.raiseProp(args.property);
                    break;
            }
        }, this.uniqueID);
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        if (!this._form.getIsStateDirty()) {
            this._form.dispose();
        }
        super.dispose();
    }
    // override
    protected _getErrors(): IValidationInfo[] {
        return this._form.validationErrors;
    }
    // override
    protected _setErrors(v: IValidationInfo[]): void {
        this._form.validationErrors = v;
    }
    toString(): string {
        return "DataFormElView";
    }
    get dataContext(): IBaseObject {
        return this._form.dataContext;
    }
    set dataContext(v: IBaseObject) {
        if (this.dataContext !== v) {
            this._form.dataContext = v;
        }
    }
    get form(): DataForm {
        return this._form;
    }
}

boot.registerElView(ELVIEW_NM.DataForm, DataFormElView);
