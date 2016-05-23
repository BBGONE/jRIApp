/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { ITemplate, ITemplateEvents, IApplication, IVoidPromise, IEditable, IBaseObject,
    TEventHandler, ISelectableProvider, IDeferred } from "jriapp_core/shared";
import * as langMOD from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { Utils as utils, ERROR } from "jriapp_utils/utils";
import { bootstrap } from "jriapp_core/bootstrap";
import { ViewModel } from "jriapp_core/mvvm";

const checks = utils.check, strUtils = utils.str, coreUtils = utils.core;
const  $ = utils.dom.$, document = utils.dom.document;

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
    fn_OnOK?: (dialog: DataEditDialog) => number;
    fn_OnShow?: (dialog: DataEditDialog) => void;
    fn_OnCancel?: (dialog: DataEditDialog) => number;
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
    private _fn_OnOK: (dialog: DataEditDialog) => number;
    private _fn_OnShow: (dialog: DataEditDialog) => void;
    private _fn_OnCancel: (dialog: DataEditDialog) => number;
    private _fn_OnTemplateCreated: (template: ITemplate) => void;
    private _fn_OnTemplateDestroy: (template: ITemplate) => void;
    private _isEditable: IEditable;
    private _template: ITemplate;
    private _$dlgEl: JQuery;
    private _result: string;
    private _options: IDialogOptions;
    private _fn_submitOnOK: () => IVoidPromise;
    private _app: IApplication;
    //save the global's currentSelectable  before showing and restore it on dialog's closing
    private _currentSelectable: ISelectableProvider;
    private _templateDeferred: IDeferred<ITemplate>;

    constructor(app: IApplication, options: IDialogConstructorOptions) {
        super();
        let self = this;
        options = coreUtils.extend({
            dataContext: null,
            templateID: null,
            width: 500,
            height: 350,
            title: "data edit dialog",
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
        this._app = app;
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

        this._isEditable = null;
        this._template = null;
        this._$dlgEl = null;
        this._result = null;
        this._currentSelectable = null;
        this._fn_submitOnOK = function () {
            let iSubmittable = utils.getSubmittable(self._dataContext);
            if (!iSubmittable || !iSubmittable.isCanSubmit) {
                //signals immediatly
                return utils.defer.createDeferred<void>().resolve();
           }
            return iSubmittable.submitChanges();
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
        this._templateDeferred = utils.defer.createDeferred<ITemplate>();
        this._createDialog();
   }
    handleError(error: any, source: any): boolean {
        let isHandled = super.handleError(error, source);
        if (!isHandled) {
            return this._app.handleError(error, source);
       }
        return isHandled;
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
        this._isEditable = utils.getEditable(this._dataContext);
   }
    protected _createDialog() {
        try {
            this._template = this._createTemplate();
            this._$dlgEl = $(this._template.el);
            document.body.appendChild(this._template.el);
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
        if (this._isDestroyCalled)
            return;
        if (!!this._fn_OnTemplateCreated) {
            this._fn_OnTemplateCreated(template);
       }
        this._templateDeferred.resolve(template);
   }
    templateUnLoading(template: ITemplate): void {
        if (!!this._fn_OnTemplateDestroy) {
            this._fn_OnTemplateDestroy(template);
       }
   }
    protected _createTemplate(): ITemplate {
        let template = this.app.createTemplate(null, this);
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
                'text': langMOD.STRS.TEXT.txtRefresh,
                'class': "btn btn-info",
                'click': function () {
                    self._onRefresh();
               }
           },
            {
                'id': self._objId + "Ok",
                'text': langMOD.STRS.TEXT.txtOk,
                'class': "btn btn-info",
                'click': function () {
                    self._onOk();
               }
           },
            {
                'id': self._objId + "Cancel",
                'text': langMOD.STRS.TEXT.txtCancel,
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

        if (!!this._isEditable)
            canCommit = this._isEditable.endEdit();
        else
            canCommit = true;

        if (canCommit) {
            if (this._submitOnOK) {
                this._disableButtons(true);
                let title = this.title;
                this.title = langMOD.STRS.TEXT.txtSubmitting;
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
                    if (!!self._isEditable) {
                        if (!self._isEditable.beginEdit()) {
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
        if (!!this._isEditable)
            this._isEditable.cancelEdit();
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
                if (!!this._isEditable) {
                    this._isEditable.cancelEdit();
               }
                if (this._submitOnOK) {
                    let subm = utils.getSubmittable(this._dataContext);
                    if (!!subm)
                        subm.rejectChanges();
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
        setTimeout(function () { bootstrap.currentSelectable = csel; csel = null; }, 0);
   }
    protected _onShow() {
        this._currentSelectable = bootstrap.currentSelectable;
        if (!!this._fn_OnShow) {
            this._fn_OnShow(this);
       }
   }
    show() {
        let self = this;
        self._result = null;
        (<any>self._$dlgEl).dialog("option", "buttons", this._getButtons());
        this._templateDeferred.promise().then((template) => {
            template.dataContext = self._dataContext;
            self._onShow();
            (<any>self._$dlgEl).dialog("open");
       });
   }
    hide() {
        let self = this;
        if (!self._$dlgEl)
            return;
        (<any>self._$dlgEl).dialog("close");
   }
    getOption(name: string) {
        if (!this._$dlgEl)
            return undefined;
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
        this._isEditable = null;
        this._app = null;
        super.destroy();
   }
    get app() { return this._app; }
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
    createDialog(name: string, options: IDialogConstructorOptions) {
        let self = this;
        //the map stores functions those create dialogs (aka factories)
        this._factories[name] = function () {
            let dialog = self._dialogs[name];
            if (!dialog) {
                dialog = new DataEditDialog(self.app, options);
                self._dialogs[name] = dialog;
           }
            return dialog;
       };
        return this._factories[name];
   }
    showDialog(name: string, dataContext: any) {
        let dlg = this.getDialog(name);
        if (!dlg)
            throw new Error(strUtils.format("Invalid Dialog name:  {0}", name));
        dlg.dataContext = dataContext;
        dlg.show();
        return dlg;
   }
    getDialog(name: string) {
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