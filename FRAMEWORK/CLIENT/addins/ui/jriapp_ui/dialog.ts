/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, IBaseObject, IVoidPromise, IEditable, TEventHandler, IDeferred, IPromise, LocaleSTRS as STRS, BaseObject
} from "jriapp_shared";
import { $ } from "./utils/jquery";
import { DomUtils } from "jriapp/utils/dom";
import { ITemplate, ITemplateEvents, IApplication, ISelectableProvider } from "jriapp/int";
import { createTemplate } from "jriapp/template";
import { bootstrap } from "jriapp/bootstrap";
import { ViewModel } from "jriapp/mvvm";

const utils = Utils, checks = utils.check, strUtils = utils.str,
    coreUtils = utils.core, sys = utils.sys, _async = utils.defer, doc = DomUtils.document,
    ERROR = utils.err, boot = bootstrap;

export const enum DIALOG_ACTION { Default = 0, StayOpen = 1 };

export interface IDialogConstructorOptions {
    dataContext?: any;
    templateID: string;
    width?: any;
    height?: any;
    title?: string;
    submitOnOK?: boolean;
    canRefresh?: boolean;
    canCancel?: boolean;
    fn_OnClose?: (dialog: DataEditDialog) => void;
    fn_OnOK?: (dialog: DataEditDialog) => DIALOG_ACTION;
    fn_OnShow?: (dialog: DataEditDialog) => void;
    fn_OnCancel?: (dialog: DataEditDialog) => DIALOG_ACTION;
    fn_OnTemplateCreated?: (template: ITemplate) => void;
    fn_OnTemplateDestroy?: (template: ITemplate) => void;
}

export interface IButton {
    id: string;
    text: string;
    "class": string;
    click: () => void;
}

interface IDialogOptions {
    width: any;
    height: any;
    title: string;
    autoOpen: boolean;
    modal: boolean;
    close: (event: any, ui: any) => void;
    buttons: IButton[];
}

const DLG_EVENTS = {
    close: "close",
    refresh: "refresh"
};
const PROP_NAME = {
    dataContext: "dataContext",
    isSubmitOnOK: "isSubmitOnOK",
    width: "width",
    height: "height",
    title: "title",
    canRefresh: "canRefresh",
    canCancel: "canCancel"
};

class SubmitInfo
{
    private _submitError: boolean;
    private _dataContext: any;
    private _editable: IEditable;

    constructor(dataContext: any) {
        this._dataContext = dataContext;
        this._submitError = false;
        this._editable = sys.getEditable(this._dataContext);
    }
    submit(): IVoidPromise
    {
        const self = this, submittable = sys.getSubmittable(this._dataContext);
        if (!submittable || !submittable.isCanSubmit) {
            // signals immediatly
            return _async.resolve<void>();
        }
        const promise = submittable.submitChanges();
        promise.then(() => {
            self._submitError = false;
        }, (err) => {
            self._submitError = true;
        });
        return promise;
    }
    reject(): void {
        const submittable = sys.getSubmittable(this._dataContext);
        if (!!submittable) {
            submittable.rejectChanges();
        }
        this._submitError = false;
    }
    cancel(): void {
        if (!!this._editable) {
            this._editable.cancelEdit();
        }
        if (!!this._submitError) {
            this.reject();
        }
    }
    endEdit(): boolean {
        return (!!this._editable && this._editable.isEditing) ? this._editable.endEdit() : true;
    }
    beginEdit(): boolean {
        return (!!this._editable) ? (this._editable.isEditing || this._editable.beginEdit()) : false;
    }
    get dataContext(): any { return this._dataContext; }
    get submitError(): boolean { return this._submitError; }
    get editable(): IEditable {
        return this._editable;
    }
}

export class DataEditDialog extends BaseObject implements ITemplateEvents {
    private _objId: string;
    private _dataContext: any;
    private _templateID: string;
    private _submitOnOK: boolean;
    private _canRefresh: boolean;
    private _canCancel: boolean;
    private _fnOnClose: (dialog: DataEditDialog) => void;
    private _fnOnOK: (dialog: DataEditDialog) => DIALOG_ACTION;
    private _fnOnShow: (dialog: DataEditDialog) => void;
    private _fnOnCancel: (dialog: DataEditDialog) => DIALOG_ACTION;
    private _fnOnTemplateCreated: (template: ITemplate) => void;
    private _fnOnTemplateDestroy: (template: ITemplate) => void;
    private _template: ITemplate;
    private _$dlgEl: JQuery;
    private _result: "ok" | "cancel";
    private _options: IDialogOptions;
    private _submitInfo: SubmitInfo;
    // save the global's currentSelectable  before showing and restore it on dialog's closing
    private _currentSelectable: ISelectableProvider;
    private _deferredTemplate: IDeferred<ITemplate>;

    constructor(options: IDialogConstructorOptions) {
        super();
        const self = this;
        options = coreUtils.extend({
            dataContext: null,
            templateID: null,
            width: 500,
            height: 350,
            title: "Data edit dialog",
            submitOnOK: false,
            canRefresh: false,
            canCancel: true,
            fn_OnClose: null,
            fn_OnOK: null,
            fn_OnShow: null,
            fn_OnCancel: null,
            fn_OnTemplateCreated: null,
            fn_OnTemplateDestroy: null
        }, options);
        this._objId = coreUtils.getNewID("dlg");
        this._dataContext = options.dataContext;
        this._templateID = options.templateID;
        this._submitOnOK = options.submitOnOK;
        this._canRefresh = options.canRefresh;
        this._canCancel = options.canCancel;
        this._fnOnClose = options.fn_OnClose;
        this._fnOnOK = options.fn_OnOK;
        this._fnOnShow = options.fn_OnShow;
        this._fnOnCancel = options.fn_OnCancel;
        this._fnOnTemplateCreated = options.fn_OnTemplateCreated;
        this._fnOnTemplateDestroy = options.fn_OnTemplateDestroy;

        this._template = null;
        this._$dlgEl = null;
        this._result = null;
        this._currentSelectable = null;
        this._submitInfo = null;
        this._options = {
            width: options.width,
            height: options.height,
            title: options.title,
            autoOpen: false,
            modal: true,
            close: (event, ui) => {
                self._onClose();
            },
            buttons: self._getButtons()
        };
        this._deferredTemplate = utils.defer.createDeferred<ITemplate>();
        this._createDialog();
    }
    addOnClose(fn: TEventHandler<DataEditDialog, any>, nmspace?: string, context?: IBaseObject) {
        this._addHandler(DLG_EVENTS.close, fn, nmspace, context);
    }
    removeOnClose(nmspace?: string) {
        this._removeHandler(DLG_EVENTS.close, nmspace);
    }
    addOnRefresh(fn: TEventHandler<DataEditDialog, { isHandled: boolean; }>, nmspace?: string, context?: IBaseObject) {
        this._addHandler(DLG_EVENTS.refresh, fn, nmspace, context);
    }
    removeOnRefresh(nmspace?: string) {
        this._removeHandler(DLG_EVENTS.refresh, nmspace);
    }
    protected _createDialog() {
        try {
            this._template = this._createTemplate();
            this._$dlgEl = $(this._template.el);
            doc.body.appendChild(this._template.el);
            (<any>this._$dlgEl).dialog(this._options);
        } catch (ex) {
            ERROR.reThrow(ex, this.handleError(ex, this));
        }
    }
    protected _getEventNames() {
        const baseEvents = super._getEventNames();
        return [DLG_EVENTS.close, DLG_EVENTS.refresh].concat(baseEvents);
    }
    templateLoading(template: ITemplate): void {
        // noop
    }
    templateLoaded(template: ITemplate, error?: any): void {
        if (this.getIsDestroyCalled() || !!error) {
            if (!!this._deferredTemplate) {
                this._deferredTemplate.reject(error);
            }
            return;
        }
        if (!!this._fnOnTemplateCreated) {
            this._fnOnTemplateCreated(template);
        }
        this._deferredTemplate.resolve(template);
    }
    templateUnLoading(template: ITemplate): void {
        if (!!this._fnOnTemplateDestroy) {
            this._fnOnTemplateDestroy(template);
        }
    }
    protected _createTemplate(): ITemplate {
        const template = createTemplate(null, this);
        template.templateID = this._templateID;
        return template;
    }
    protected _destroyTemplate() {
        if (!!this._template) {
            this._template.destroy();
        }
    }
    protected _getButtons(): IButton[] {
        const self = this, buttons = [
            {
                "id": self._objId + "_Refresh",
                "text": STRS.TEXT.txtRefresh,
                "class": "btn btn-info",
                "click": () => {
                    self._onRefresh();
                }
            },
            {
                "id": self._objId + "_Ok",
                "text": STRS.TEXT.txtOk,
                "class": "btn btn-info",
                "click": () => {
                    self._onOk();
                }
            },
            {
                "id": self._objId + "_Cancel",
                "text": STRS.TEXT.txtCancel,
                "class": "btn btn-info",
                "click": () => {
                    self._onCancel();
                }
            }
        ];
        if (!this.canRefresh) {
            buttons.shift();
        }
        if (!this.canCancel) {
            buttons.pop();
        }
        return buttons;
    }
    protected _getOkButton() {
        return $("#" + this._objId + "_Ok");
    }
    protected _getCancelButton() {
        return $("#" + this._objId + "_Cancel");
    }
    protected _getRefreshButton() {
        return $("#" + this._objId + "_Refresh");
    }
    protected _getAllButtons() {
        return [this._getOkButton(), this._getCancelButton(), this._getRefreshButton()];
    }
    protected _disableButtons(isDisable: boolean) {
        const btns = this._getAllButtons();
        btns.forEach(($btn) => {
            $btn.prop("disabled", !!isDisable);
        });
    }
    protected _onOk() {
        const self = this, action = (!!this._fnOnOK) ? this._fnOnOK(this) : DIALOG_ACTION.Default;
        if (action === DIALOG_ACTION.StayOpen) {
            return;
        }

        if (!this._dataContext) {
            self.hide();
            return;
        }

        const canCommit = this._submitInfo.endEdit();

        if (!canCommit) {
            return;
        }

        if (this._submitOnOK) {
            this._disableButtons(true);
            const title = this.title;
            this.title = STRS.TEXT.txtSubmitting;
            const promise = this._submitInfo.submit();
            promise.always(() => {
                self._disableButtons(false);
                self.title = title;
            });

            promise.then(() => {
                self._result = "ok";
                self.hide();
            }).catch(() => {
                if (!self._submitInfo.beginEdit()) {
                    self._result = "cancel";
                    self.hide();
                }
            });
        } else {
            self._result = "ok";
            self.hide();
        }
    }
    protected _onCancel() {
        const action = (!!this._fnOnCancel) ? this._fnOnCancel(this) : DIALOG_ACTION.Default;
        if (action === DIALOG_ACTION.StayOpen) {
            return;
        }
        this._submitInfo.cancel();
        this._result = "cancel";
        this.hide();
    }
    protected _onRefresh() {
        const args = { isHandled: false };
        this.raiseEvent(DLG_EVENTS.refresh, args);
        if (args.isHandled) {
            return;
        }
        const dctx = this._dataContext;
        if (!!dctx) {
            if (checks.isFunc(dctx.refresh)) {
                dctx.refresh();
            } else if (!!dctx._aspect && checks.isFunc(dctx._aspect.refresh)) {
                dctx._aspect.refresh();
            }
        }
    }
    protected _onClose() {
        try {
            if (this._result !== "ok" && !!this._submitInfo) {
                this._submitInfo.cancel();
            }
            if (!!this._fnOnClose) {
                this._fnOnClose(this);
            }
            this.raiseEvent(DLG_EVENTS.close, {});
        } finally {
            this._template.dataContext = null;
            this._submitInfo = null;
        }
        let csel = this._currentSelectable;
        this._currentSelectable = null;
        utils.queue.enque(() => { boot.currentSelectable = csel; csel = null; });
    }
    protected _onShow() {
        this._currentSelectable = boot.currentSelectable;
        this._submitInfo = new SubmitInfo(this.dataContext);
        if (!!this._fnOnShow) {
            this._fnOnShow(this);
        }
    }
    show(): IPromise<DataEditDialog> {
        const self = this;
        if (self.getIsDestroyCalled()) {
            return utils.defer.createDeferred<DataEditDialog>().reject();
        }
        self._result = null;
        return this._deferredTemplate.promise().then((template) => {
            if (self.getIsDestroyCalled() || !self._$dlgEl) {
                ERROR.abort();
            }
            (<any>self._$dlgEl).dialog("option", "buttons", self._getButtons());
            template.dataContext = self._dataContext;
            self._onShow();
            (<any>self._$dlgEl).dialog("open");
        }).then(() => {
            return self;
        }, (err) => {
            if (!self.getIsDestroyCalled()) {
                self.handleError(err, self);
            }
            ERROR.abort();
        });
    }
    hide() {
        const self = this;
        if (!this._$dlgEl) {
            return;
        }
        (<any>self._$dlgEl).dialog("close");
    }
    getOption(name: string) {
        if (!this._$dlgEl) {
            return checks.undefined;
        }
        return (<any>this._$dlgEl).dialog("option", name);
    }
    setOption(name: string, value: any) {
        const self = this;
        (<any>self._$dlgEl).dialog("option", name, value);
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        this.hide();
        this._destroyTemplate();
        this._$dlgEl = null;
        this._template = null;
        this._dataContext = null;
        this._submitInfo = null;
        super.destroy();
    }
    get dataContext() { return this._dataContext; }
    set dataContext(v) {
        if (v !== this._dataContext) {
            this._dataContext = v;
            this._submitInfo = new SubmitInfo(this._dataContext);
            this.raisePropertyChanged(PROP_NAME.dataContext);
        }
    }
    get result() { return this._result; }
    get template() { return this._template; }
    get isSubmitOnOK() { return this._submitOnOK; }
    set isSubmitOnOK(v) {
        if (this._submitOnOK !== v) {
            this._submitOnOK = v;
            this.raisePropertyChanged(PROP_NAME.isSubmitOnOK);
        }
    }
    get width() { return this.getOption("width"); }
    set width(v) {
        const x = this.getOption("width");
        if (v !== x) {
            this.setOption("width", v);
            this.raisePropertyChanged(PROP_NAME.width);
        }
    }
    get height() { return this.getOption("height"); }
    set height(v) {
        const x = this.getOption("height");
        if (v !== x) {
            this.setOption("height", v);
            this.raisePropertyChanged(PROP_NAME.height);
        }
    }
    get title() { return this.getOption("title"); }
    set title(v) {
        const x = this.getOption("title");
        if (v !== x) {
            this.setOption("title", v);
            this.raisePropertyChanged(PROP_NAME.title);
        }
    }
    get canRefresh() { return this._canRefresh; }
    set canRefresh(v) {
        const x = this._canRefresh;
        if (v !== x) {
            this._canRefresh = v;
            this.raisePropertyChanged(PROP_NAME.canRefresh);
        }
    }
    get canCancel() { return this._canCancel; }
    set canCancel(v) {
        const x = this._canCancel;
        if (v !== x) {
            this._canCancel = v;
            this.raisePropertyChanged(PROP_NAME.canCancel);
        }
    }
}

export class DialogVM extends ViewModel<IApplication> {
    private _factories: { [name: string]: () => DataEditDialog; };
    private _dialogs: { [name: string]: DataEditDialog; };

    constructor(app: IApplication) {
        super(app);
        this._factories = {};
        this._dialogs = {};
    }
    createDialog(name: string, options: IDialogConstructorOptions): () => DataEditDialog {
        const self = this;
        // the map stores functions those create dialogs (aka factories)
        this._factories[name] = () => {
            let dialog = self._dialogs[name];
            if (!dialog) {
                dialog = new DataEditDialog(options);
                self._dialogs[name] = dialog;
            }
            return dialog;
        };
        return this._factories[name];
    }
    showDialog(name: string, dataContext: any): DataEditDialog {
        const dlg = this.getDialog(name);
        if (!dlg) {
            throw new Error(strUtils.format("Invalid DataEditDialog name:  {0}", name));
        }
        dlg.dataContext = dataContext;
        // timeout helps to set dialog properties on returned DataEditDialog before its showing
        setTimeout(() => {
            dlg.show();
        }, 0);
        return dlg;
    }
    getDialog(name: string): DataEditDialog {
        const factory = this._factories[name];
        if (!factory) {
            return null;
        }
        return factory();
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        const self = this, keys = Object.keys(this._dialogs);
        keys.forEach((key: string) => {
            self._dialogs[key].destroy();
        });
        this._factories = {};
        this._dialogs = {};
        super.destroy();
    }
}
