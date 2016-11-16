/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, IBaseObject, IVoidPromise, IEditable, TEventHandler, IDeferred, IPromise, LocaleSTRS as STRS, BaseObject
} from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { ITemplate, ITemplateEvents, IApplication, ISelectableProvider } from "jriapp/shared";
import { createTemplate } from "jriapp/template";
import { bootstrap } from "jriapp/bootstrap";
import { ViewModel } from "jriapp/mvvm";

const utils = Utils, checks = utils.check, strUtils = utils.str,
    coreUtils = utils.core, sys = utils.sys, doc = utils.dom.document,
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
    'class': string;
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

export class DataEditDialog extends BaseObject implements ITemplateEvents {
    private _objId: string;
    private _dataContext: any;
    private _templateID: string;
    private _submitOnOK: boolean;
    private _canRefresh: boolean;
    private _canCancel: boolean;
    private _fn_OnClose: (dialog: DataEditDialog) => void;
    private _fn_OnOK: (dialog: DataEditDialog) => DIALOG_ACTION;
    private _fn_OnShow: (dialog: DataEditDialog) => void;
    private _fn_OnCancel: (dialog: DataEditDialog) => DIALOG_ACTION;
    private _fn_OnTemplateCreated: (template: ITemplate) => void;
    private _fn_OnTemplateDestroy: (template: ITemplate) => void;
    private _editable: IEditable;
    private _template: ITemplate;
    private _$dlgEl: JQuery;
    private _result: "ok" | "cancel";
    private _options: IDialogOptions;
    private _fn_submitOnOK: () => IVoidPromise;
    //save the global's currentSelectable  before showing and restore it on dialog's closing
    private _currentSelectable: ISelectableProvider;
    private _deferred: IDeferred<ITemplate>;

    constructor(options: IDialogConstructorOptions) {
        super();
        let self = this;
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
        this._objId = "dlg" + coreUtils.getNewID();
        this._dataContext = options.dataContext;
        this._templateID = options.templateID;
        this._submitOnOK = options.submitOnOK;
        this._canRefresh = options.canRefresh;
        this._canCancel = options.canCancel;
        this._fn_OnClose = options.fn_OnClose;
        this._fn_OnOK = options.fn_OnOK;
        this._fn_OnShow = options.fn_OnShow;
        this._fn_OnCancel = options.fn_OnCancel;
        this._fn_OnTemplateCreated = options.fn_OnTemplateCreated;
        this._fn_OnTemplateDestroy = options.fn_OnTemplateDestroy;

        this._editable = null;
        this._template = null;
        this._$dlgEl = null;
        this._result = null;
        this._currentSelectable = null;
        this._fn_submitOnOK = function () {
            let submittable = sys.getSubmittable(self._dataContext);
            if (!submittable || !submittable.isCanSubmit) {
                //signals immediatly
                return utils.defer.createDeferred<void>().resolve();
            }
            return submittable.submitChanges();
        };
        this._updateIsEditable();
        this._options = {
            width: options.width,
            height: options.height,
            title: options.title,
            autoOpen: false,
            modal: true,
            close: function (event, ui) {
                self._onClose();
            },
            buttons: self._getButtons()
        };
        this._deferred = utils.defer.createDeferred<ITemplate>();
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
    protected _updateIsEditable() {
        this._editable = sys.getEditable(this._dataContext);
    }
    protected _createDialog() {
        try {
            this._template = this._createTemplate();
            this._$dlgEl = $(this._template.el);
            doc.body.appendChild(this._template.el);
            (<any>this._$dlgEl).dialog(this._options);
        }
        catch (ex) {
            ERROR.reThrow(ex, this.handleError(ex, this));
        }
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return [DLG_EVENTS.close, DLG_EVENTS.refresh].concat(base_events);
    }
    templateLoading(template: ITemplate): void {
        //noop
    }
    templateLoaded(template: ITemplate, error?: any): void {
        if (this.getIsDestroyCalled() || !!error) {
            if (!!this._deferred)
                this._deferred.reject(error);
            return;
        }
        if (!!this._fn_OnTemplateCreated) {
            this._fn_OnTemplateCreated(template);
        }
        this._deferred.resolve(template);
    }
    templateUnLoading(template: ITemplate): void {
        if (!!this._fn_OnTemplateDestroy) {
            this._fn_OnTemplateDestroy(template);
        }
    }
    protected _createTemplate(): ITemplate {
        const template = createTemplate(null, this);
        template.templateID = this._templateID;
        return template;
    }
    protected _destroyTemplate() {
        if (!!this._template)
            this._template.destroy();
    }
    protected _getButtons(): IButton[] {
        let self = this, buttons = [
            {
                'id': self._objId + "Refresh",
                'text': STRS.TEXT.txtRefresh,
                'class': "btn btn-info",
                'click': function () {
                    self._onRefresh();
                }
            },
            {
                'id': self._objId + "Ok",
                'text': STRS.TEXT.txtOk,
                'class': "btn btn-info",
                'click': function () {
                    self._onOk();
                }
            },
            {
                'id': self._objId + "Cancel",
                'text': STRS.TEXT.txtCancel,
                'class': "btn btn-info",
                'click': function () {
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
        return $("#" + this._objId + "Ok");
    }
    protected _getCancelButton() {
        return $("#" + this._objId + "Cancel");
    }
    protected _getRefreshButton() {
        return $("#" + this._objId + "Refresh");
    }
    protected _getAllButtons() {
        return [this._getOkButton(), this._getCancelButton(), this._getRefreshButton()];
    }
    protected _disableButtons(isDisable: boolean) {
        let btns = this._getAllButtons();
        btns.forEach(function ($btn) {
            $btn.prop("disabled", !!isDisable);
        });
    }
    protected _onOk() {
        let self = this, canCommit: boolean, action = DIALOG_ACTION.Default;
        if (!!this._fn_OnOK) {
            action = this._fn_OnOK(this);
        }
        if (action === DIALOG_ACTION.StayOpen)
            return;

        if (!this._dataContext) {
            self.hide();
            return;
        }

        if (!!this._editable)
            canCommit = this._editable.endEdit();
        else
            canCommit = true;

        if (canCommit) {
            if (this._submitOnOK) {
                this._disableButtons(true);
                let title = this.title;
                this.title = STRS.TEXT.txtSubmitting;
                let promise = this._fn_submitOnOK();
                promise.always(function () {
                    self._disableButtons(false);
                    self.title = title;
                });
                promise.then(function () {
                    self._result = "ok";
                    self.hide();
                }, function () {
                    //resume editing if fn_onEndEdit callback returns false in isOk argument
                    if (!!self._editable) {
                        if (!self._editable.beginEdit()) {
                            self._result = "cancel";
                            self.hide();
                        }
                    }
                });
            }
            else {
                self._result = "ok";
                self.hide();
            }
        }
    }
    protected _onCancel() {
        let action = DIALOG_ACTION.Default;
        if (!!this._fn_OnCancel) {
            action = this._fn_OnCancel(this);
        }
        if (action === DIALOG_ACTION.StayOpen)
            return;
        if (!!this._editable)
            this._editable.cancelEdit();
        this._result = "cancel";
        this.hide();
    }
    protected _onRefresh() {
        let args = { isHandled: false };
        this.raiseEvent(DLG_EVENTS.refresh, args);
        if (args.isHandled)
            return;
        let dctx = this._dataContext;
        if (!!dctx) {
            if (checks.isFunc(dctx.refresh)) {
                dctx.refresh();
            }
            else if (!!dctx._aspect && checks.isFunc(dctx._aspect.refresh)) {
                dctx._aspect.refresh();
            }
        }
    }
    protected _onClose() {
        try {
            if (this._result !== "ok" && !!this._dataContext) {
                if (!!this._editable) {
                    this._editable.cancelEdit();
                }
            }
            if (!!this._fn_OnClose)
                this._fn_OnClose(this);
            this.raiseEvent(DLG_EVENTS.close, {});
        }
        finally {
            this._template.dataContext = null;
        }
        let csel = this._currentSelectable;
        this._currentSelectable = null;
        setTimeout(function () { boot.currentSelectable = csel; csel = null; }, 0);
    }
    protected _onShow() {
        this._currentSelectable = boot.currentSelectable;
        if (!!this._fn_OnShow) {
            this._fn_OnShow(this);
        }
    }
    show(): IPromise<DataEditDialog> {
        let self = this;
        if (self.getIsDestroyCalled())
            return utils.defer.createDeferred<DataEditDialog>().reject();
        self._result = null;
        return this._deferred.promise().then((template) => {
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
            if (!self.getIsDestroyCalled())
                self.handleError(err, self);
            ERROR.abort();
        });
    }
    hide() {
        let self = this;
        if (!this._$dlgEl)
            return;
        (<any>self._$dlgEl).dialog("close");
    }
    getOption(name: string) {
        if (!this._$dlgEl)
            return checks.undefined;
        return (<any>this._$dlgEl).dialog("option", name);
    }
    setOption(name: string, value: any) {
        let self = this;
        (<any>self._$dlgEl).dialog("option", name, value);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this.hide();
        this._destroyTemplate();
        this._$dlgEl = null;
        this._template = null;
        this._dataContext = null;
        this._fn_submitOnOK = null;
        this._editable = null;
        super.destroy();
    }
    get dataContext() { return this._dataContext; }
    set dataContext(v) {
        if (v !== this._dataContext) {
            this._dataContext = v;
            this._updateIsEditable();
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
        let x = this.getOption("width");
        if (v !== x) {
            this.setOption("width", v);
            this.raisePropertyChanged(PROP_NAME.width);
        }
    }
    get height() { return this.getOption("height"); }
    set height(v) {
        let x = this.getOption("height");
        if (v !== x) {
            this.setOption("height", v);
            this.raisePropertyChanged(PROP_NAME.height);
        }
    }
    get title() { return this.getOption("title"); }
    set title(v) {
        let x = this.getOption("title");
        if (v !== x) {
            this.setOption("title", v);
            this.raisePropertyChanged(PROP_NAME.title);
        }
    }
    get canRefresh() { return this._canRefresh; }
    set canRefresh(v) {
        let x = this._canRefresh;
        if (v !== x) {
            this._canRefresh = v;
            this.raisePropertyChanged(PROP_NAME.canRefresh);
        }
    }
    get canCancel() { return this._canCancel; }
    set canCancel(v) {
        let x = this._canCancel;
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
        let self = this;
        //the map stores functions those create dialogs (aka factories)
        this._factories[name] = function () {
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
        let dlg = this.getDialog(name);
        if (!dlg)
            throw new Error(strUtils.format("Invalid DataEditDialog name:  {0}", name));
        dlg.dataContext = dataContext;
        //timeout helps to set dialog properties on returned DataEditDialog before its showing
        setTimeout(() => {
            dlg.show();
        }, 0);
        return dlg;
    }
    getDialog(name: string): DataEditDialog {
        let factory = this._factories[name];
        if (!factory)
            return null;
        return factory();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let self = this, keys = Object.keys(this._dialogs);
        keys.forEach(function (key: string) {
            self._dialogs[key].destroy();
        });
        this._factories = {};
        this._dialogs = {};
        super.destroy();
    }
}