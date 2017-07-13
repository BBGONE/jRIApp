/// <reference path="../../jriapp/jriapp_shared.d.ts" />
/// <reference path="../../jriapp/jriapp.d.ts" />
/// <reference path="../../jriapp/jriapp_ui.d.ts" />
/// <reference path="../../jriapp/jriapp_db.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

const utils = RIAPP.Utils;

export interface IGridEvents<TItem extends RIAPP.ICollectionItem> {
    regFocusGridFunc(doFocus: () => void): void;
    onDataPageChanged(): void;
    onRowSelected(item: TItem): void;
    onRowExpanded(item: TItem): void;
    onRowCollapsed(item: TItem): void;
}

export function addTextQuery(query: dbMOD.TDataQuery, fldName: string, val: any): dbMOD.TDataQuery {
    let tmp: string;
    if (!!val) {
        if (utils.str.startsWith(val, '%') && utils.str.endsWith(val, '%')) {
            tmp = utils.str.trim(val, '% ');
            query.where(fldName, RIAPP.FILTER_TYPE.Contains, [tmp])
        }
        else if (utils.str.startsWith(val, '%')) {
            tmp = utils.str.trim(val, '% ');
            query.where(fldName, RIAPP.FILTER_TYPE.EndsWith, [tmp])
        }
        else if (utils.str.endsWith(val, '%')) {
            tmp = utils.str.trim(val, '% ');
            query.where(fldName, RIAPP.FILTER_TYPE.StartsWith, [tmp])
        }
        else {
            tmp = utils.str.trim(val);
            query.where(fldName, RIAPP.FILTER_TYPE.Equals, [tmp])
        }
    }
    return query;
};

export interface IDLinkOptions extends RIAPP.IViewOptions {
    baseUri?: string;
}

export class DownloadLinkElView extends uiMOD.BaseElView {
    _baseUri: string;
    _id: string;

    constructor(options: IDLinkOptions) {
        super(options);
        this._baseUri = '';
        if (!!options.baseUri)
            this._baseUri = options.baseUri;
        this._id = '';
    }
    get text() {
        return this.el.textContent;
    }
    set text(v) {
        let el = this.el;
        let x = this.text;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            el.textContent = v;
            this.raisePropertyChanged('text');
        }
    }
    get href(): string {
        return (<HTMLAnchorElement>this.el).href;
    }
    set href(v) {
        let x = this.href;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            (<HTMLAnchorElement>this.el).href = v;
            this.raisePropertyChanged("href");
        }
    }
    get id() { return this._id; }
    set id(v) {
        let x = this._id;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            this._id = v;
            this.href = this._baseUri + '/' + this._id;
            this.raisePropertyChanged('id');
        }
    }
}

export class FileImgElView extends uiMOD.BaseElView {
    private _baseUri: string;
    private _id: string;
    private _fileName: string;
    private _debounce: RIAPP.Debounce;
    private _src: string;

    constructor(options: IDLinkOptions) {
        super(options);
        this._debounce = new RIAPP.Debounce();
        this._baseUri = '';
        if (!!options.baseUri)
            this._baseUri = options.baseUri;
        this._id = '';
        this._src = null;
        this._fileName = null;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._debounce.destroy();
        super.destroy();
    }
    reloadImg(): void {
        if (!!this.src) {
            let src = this.src;
            let pos = src.indexOf('?');
            if (pos >= 0) {
                src = src.substr(0, pos);
            }
            let date = new Date();
            this.src = src + '?v=' + date.getTime();
        }
    }
    get fileName() { return this._fileName; }
    set fileName(v) {
        let x = this._fileName;
        if (x !== v) {
            this._fileName = v;
            this.raisePropertyChanged('fileName');
            this.reloadImg();
        }
    }
    get src() {
        return this._src;
    }
    set src(v) {
        if (this._src !== v) {
            this._src = v;
            this.raisePropertyChanged('src');
        }
        let img = this.el;
        //set empty image as a stub
        (<HTMLImageElement>img).src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

        this._debounce.enque(() => {
            if (!!this._src) {
                (<HTMLImageElement>img).src = this._src;
            }
        });
    }
    get id() { return this._id; }
    set id(v) {
        let x = this._id;
        v = (v === null)? '': ('' + v);
        if (x !== v) {
            this._id = v;
            if (!this._id)
                this.src = null;
            else
                this.src = this._baseUri + '/' + this._id;
            this.raisePropertyChanged('id');
        }
    }
}

export class ErrorViewModel extends RIAPP.ViewModel<RIAPP.IApplication> {
    _error: any;
    _errors: any[];
    _message: string;
    _title: string;
    _dialogVM: uiMOD.DialogVM;

    constructor(app: RIAPP.IApplication) {
        super(app);
        let self = this;
        this._error = null;
        this._errors = [];
        this._message = null;
        this._title = '';
        this._dialogVM = new uiMOD.DialogVM(app);
        let dialogOptions: uiMOD.IDialogConstructorOptions = {
            templateID: 'errorTemplate',
            width: 500,
            height: 300,
            title: '',
            canCancel: false,
            fn_OnShow: function (dialog) {
                while (!!self.error && !!self.error.origError) {
                    //get real error
                    self._error = self.error.origError;
                    self.raisePropertyChanged('error');
                }

                if (self.error instanceof dbMOD.AccessDeniedError)
                    self.title = "ACCESS DENIED";
                else if (self.error instanceof dbMOD.ConcurrencyError)
                    self.title = "CONCURRENCY ERROR";
                else if (self.error instanceof RIAPP.ValidationError)
                    self.title = "VALIDATION ERROR";
                else if (self.error instanceof dbMOD.SvcValidationError)
                    self.title = "VALIDATION ERROR";
                else if (self.error instanceof dbMOD.DataOperationError)
                    self.title = "DATA OPERATION ERROR";
                else
                    self.title = "UNEXPECTED ERROR";

                dialog.title = self.title;
            },
            fn_OnClose: function (dialog) {
                self._error = null;
                self._errors = [];
                self._message = null;
                self.raisePropertyChanged('error');
                self.raisePropertyChanged('message');
            }
        };
        //dialogs are distinguished by their given names
        this._dialogVM.createDialog('errorDialog', dialogOptions);
    }
    showDialog() {
        this._dialogVM.showDialog('errorDialog', this);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._dialogVM.destroy();
        this._dialogVM = null;
        this._error = null;
        this._errors = [];
        this._message = null;
        super.destroy();
    }
    get error() { return this._error; }
    set error(v) {
        let self = this, old = this._error;
        if (!old) {
            this._error = v;
            let msg: string = '';
            if (!!self.error)
                msg = (!self.error.message) ? ('' + self.error) : self.error.message;
            else
                msg = 'Error!';
            this.message = msg;
            this.raisePropertyChanged('error');
        }
        else {
            this._errors.push(v);
            this.raisePropertyChanged('errorCount');
        }
    }
    get title() { return this._title; }
    set title(v) {
        let old = this._title;
        if (old !== v) {
            this._title = v;
            this.raisePropertyChanged('title');
        }
    }
    get message() { return this._message; }
    set message(v) {
        let old = this._message;
        if (old !== v) {
            this._message = v;
            this.raisePropertyChanged('message');
        }
    }
    get errorCount() {
        return this._errors.length + 1;
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView('fileLink', DownloadLinkElView);
    app.registerElView('fileImage', FileImgElView);
};