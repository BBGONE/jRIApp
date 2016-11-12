/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR, ELVIEW_NM } from "../jriapp_core/const";
import {
    IApplication, IFieldInfo, IBaseObject, IContent, IEditable, IElView, IErrorNotification,
    IValidationInfo, ILifeTimeScope, IVoidPromise, IViewOptions
} from "../jriapp_core/shared";
import { ERRS, STRS } from "../jriapp_core/lang";
import { BaseObject } from "../jriapp_core/object";
import { bootstrap } from "../jriapp_core/bootstrap";
import { contentFactories } from "../jriapp_content/factory";
import { parser } from "../jriapp_core/parser";
import { Utils } from "../jriapp_utils/utils";
import { BaseElView, fn_addToolTip } from "../jriapp_elview/elview";
import { Binding } from "binding";
import { parseContentAttr } from "../jriapp_content/int";

const utils = Utils, dom = utils.dom, $ = dom.$, doc = dom.document, checks = utils.check, coreUtils = utils.core, strUtils = utils.str,
    syschecks = utils.sys, parse = parser, boot = bootstrap;

export const css = {
    dataform: "ria-dataform",
    error: "ria-form-error"
};

syschecks._setIsInsideTemplate = function (elView: BaseElView) {
    if (!!elView && elView instanceof DataFormElView) {
        (<DataFormElView>elView).form.isInsideTemplate = true;
    }
};

syschecks._isDataForm = function (el: HTMLElement): boolean {
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
        const opts = parse.parseOptions(attr);
        return (opts.length > 0 && opts[0].name === ELVIEW_NM.DataForm);
    }
};

syschecks._isInsideDataForm = function (el: HTMLElement): boolean {
    if (!el) {
        return false;
    }

    const parent = el.parentElement;
    if (!!parent) {
        if (!syschecks._isDataForm(parent)) {
            return syschecks._isInsideDataForm(parent);
        }
        else {
            return true;
        }
    }
    
    return false;
};

//check if the element inside of any dataform in the forms array
syschecks._isInNestedForm = function (root: any, forms: HTMLElement[], el: HTMLElement): boolean {
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
syschecks._getParentDataForm = function (rootForm: HTMLElement, el: HTMLElement): HTMLElement {
    if (!el)
        return null;
    let parent = el.parentElement, attr: string, opts: any[];
    if (!!parent) {
        if (parent === rootForm)
            return rootForm;
        if (syschecks._isDataForm(parent)) {
            return parent;
        }
        else
            return syschecks._getParentDataForm(rootForm, parent);
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
    private _$el: JQuery;
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
        let self = this, parent: HTMLElement;
        this._el = options.el;
        this._$el = $(this._el);
        this._objId = "frm" + coreUtils.getNewID();
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

        parent = syschecks._getParentDataForm(null, this._el);
        //if this form is nested inside another dataform
        //subscribe for parent's destroy event
        if (!!parent) {
            self._parentDataForm = boot.getApp().viewFactory.getOrCreateElView(parent);
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
            if (syschecks._isBinding(arr[i]))
                res.push(arr[i]);
        }
        return res;
    }
    private _getElViews(): BaseElView[] {
        if (!this._lfTime)
            return [];
        let arr: any[] = this._lfTime.getObjs(), res: BaseElView[] = [];
        for (let i = 0, len = arr.length; i < len; i += 1) {
            if (syschecks._isElView(arr[i]))
                res.push(arr[i]);
        }
        return res;
    }
    private _createContent(): IVoidPromise {
        let dctx: any = this._dataContext, self = this;
        if (!dctx) {
            return;
        }
        let contentElements = coreUtils.arr.fromList<HTMLElement>(this._el.querySelectorAll(DataForm._DATA_CONTENT_SELECTOR)),
            isEditing = this.isEditing;

        //select all dataforms inside the scope
        let forms = coreUtils.arr.fromList<HTMLElement>(this._el.querySelectorAll(DataForm._DATA_FORM_SELECTOR));

        contentElements.forEach(function (el) {
            //check if the element inside a nested dataform
            if (syschecks._isInNestedForm(self._el, forms, el))
                return;
            let attr = el.getAttribute(DATA_ATTR.DATA_CONTENT),
                op = parseContentAttr(attr);
            if (!!op.fieldName && !op.fieldInfo) {
                op.fieldInfo = getFieldInfo(dctx, op.fieldName);
                if (!op.fieldInfo) {
                    throw new Error(strUtils.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, "", op.fieldName));
                }
            }

            let contentType = contentFactories.getContentType(op);
            let content = new contentType({ parentEl: el, contentOptions: op, dataContext: dctx, isEditing: isEditing });
            self._content.push(content);
        });

        let promise = self.app._getInternal().bindElements(this._el, dctx, true, this.isInsideTemplate);
        return promise.then((lftm) => {
            if (self.getIsDestroyCalled()) {
                lftm.destroy();
                return;
            }
            self._lfTime = lftm;
            let bindings = self._getBindings();
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
        let self = this;
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
        let dataContext = this._dataContext, self = this;
        if (!dataContext)
            return;
        if (!!dataContext) {
            this._editable = utils.getEditable(dataContext);
            this._errNotification = utils.getErrorNotification(dataContext);
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
        let dataContext = this._dataContext;
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
        this._$el = null;
        this._unbindDS();
        let parentDataForm = this._parentDataForm;
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
        try {
            if (v === this._dataContext)
                return;
            if (!!v && !syschecks._isBaseObj(v)) {
                throw new Error(ERRS.ERR_DATAFRM_DCTX_INVALID);
            }
            this._unbindDS();
            this._dataContext = v;
            this._bindDS();
            this._updateContent();
            this.raisePropertyChanged(PROP_NAME.dataContext);
            if (!!this._dataContext) {
                if (!!this._editable && this._isEditing !== this._editable.isEditing) {
                    this.isEditing = this._editable.isEditing;
                }
                if (!!this._errNotification) {
                    this._onDSErrorsChanged();
                }
            }
        } catch (ex) {
            utils.err.reThrow(ex, this.handleError(ex, this));
        }
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

    constructor(options: IViewOptions) {
        super(options);
        let self = this;
        this._form = new DataForm(options);
        this._form.addOnDestroyed(function () {
            self._form = null;
            self.raisePropertyChanged(PROP_NAME.form);
        });
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
        let tip = ["<b>", STRS.VALIDATE.errorInfo, "</b>", "<ul>"];
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
        let $el = this.$el;
        if (!!errors && errors.length > 0) {
            let $img = $(`<div data-name="error_info" class="${css.error}" />`);
            $el.prepend($img);
            fn_addToolTip($img, this._getErrorTipInfo(errors), true);
            this._setFieldError(true);
        }
        else {
            $el.children('div[data-name="error_info"]').remove();
            this._setFieldError(false);
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._form && !this._form.getIsDestroyCalled()) {
            this._form.destroy();
        }
        this._form = null;
        super.destroy();
    }
    toString() {
        return "DataFormElView";
    }
    get dataContext() {
        if (this._isDestroyCalled)
            return null;
        return this._form.dataContext;
    }
    set dataContext(v) {
        if (this._isDestroyCalled)
            return;
        if (this.dataContext !== v) {
            this._form.dataContext = v;
        }
    }
    get form() { return this._form; }
}

boot.registerElView(ELVIEW_NM.DataForm, DataFormElView);