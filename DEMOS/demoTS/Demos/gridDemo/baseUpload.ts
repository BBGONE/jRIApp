import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";
import { Uploader } from "uploader";
export { Uploader, IAddHeadersArgs } from "uploader";
const utils = RIAPP.Utils, $ = uiMOD.$;

//helper function to get html DOM element  inside template's instance
//by custom data-name attribute value
function fn_getTemplateElement(template: RIAPP.ITemplate, name: string) {
    const t = template, els = t.findElByDataName(name);
    if (els.length < 1) {
        return null;
    }
    return els[0];
}

export class BaseUploadVM<TApp extends RIAPP.IApplication> extends RIAPP.ViewModel<TApp> implements RIAPP.IEditable {
    private _uploadUrl: string;
    private _formEl: HTMLFormElement;
    private _fileEl: HTMLInputElement;
    private _progressBar: JQuery;
    private _percentageCalc: JQuery;
    private _progressDiv: JQuery;
    private _fileInfo: string;
    private _fileName: string;
    private _id: string;
    private _fileUploaded: boolean;
    private _uploadCommand: RIAPP.ICommand;

    constructor(app: TApp, url: string) {
        super(app);
        const self = this;
        this._uploadUrl = url;
        this._formEl = null;
        this._fileEl = null;
        this._progressBar = null;
        this._percentageCalc = null;
        this._progressDiv = null;
        this._fileInfo = null;
        this._id = null;
        this._fileUploaded = false;

        this._uploadCommand = new RIAPP.Command(function (this: BaseUploadVM<TApp>, sender, param) {
            try {
                self.uploadFiles(self._fileEl.files);
            } catch (ex) {
                self.handleError(ex, this);
            }
        }, self, function (sender, param) {
            return self._canUpload();
        });
    }
    protected _initUI() {
        const self = this;
        self.formEl.reset();
        self.fileInfo = null;
        self.fileName = null;
        self._fileUploaded = false;
    }
    protected _onProgress(val: number): void {
        const self = this;
        self._progressBar.prop("max", 100);
        self._progressBar.prop("value", Math.floor(val * 100));
        self._percentageCalc.html(Math.floor(val * 100) + "%");
    }
    protected _onLoadStart(): void {
        const self = this;
        self._progressBar.prop("max", 100);
        self._progressBar.prop("value", 0);
        self._percentageCalc.html("0%");
        self._progressDiv.show();
    }
    protected _onLoadComplete(): void {
        const self = this;
        self.fileInfo = 'File uploaded';
        self._progressDiv.hide();
        self._onFileUploaded();
    }
    protected _onLoadError(): void {
        const self = this;
        self.fileInfo = 'Upload Error!';
        self._progressDiv.hide();
        self.handleError(new Error(utils.str.format("File upload error: {0}", 'Upload Error')), self);
    }
    protected _onFileUploaded() {
        this._fileUploaded = true;
    }
    // can be overriden
    protected _addHeaders(xhr: XMLHttpRequest, file: File): RIAPP.IPromise<void> {
        xhr.setRequestHeader("X-Data-ID", this.id);
        return null;
    }
    protected _onIDChanged() {
        this._uploadCommand.raiseCanExecuteChanged();
    }
    protected _canUpload() {
        return !!this._fileInfo;
    }
    protected _getDataID() {
        return this.id;
    }
    protected _prepareTemplate(template: RIAPP.ITemplate, isLoaded: boolean) {
        const self = this;
        try {
            const t = template, templEl = t.el;
            if (isLoaded) {
                self._onTemplateCreated(template);
            } else {
                const fileEl = $(fn_getTemplateElement(template, 'files-to-upload'));
                fileEl.off('change');
                $('*[data-name="btn-input"]', templEl).off('click');
            }
        } catch (ex) {
            self.handleError(ex, this);
        }
    }
    protected _onTemplateCreated(template: RIAPP.ITemplate) {
        const self = this;
        self._fileEl = <HTMLInputElement>fn_getTemplateElement(template, 'files-to-upload');
        self._formEl = <HTMLFormElement>fn_getTemplateElement(template, 'uploadForm');
        self._progressBar = $(fn_getTemplateElement(template, 'progressBar'));
        self._percentageCalc = $(fn_getTemplateElement(template, 'percentageCalc'));
        self._progressDiv = $(fn_getTemplateElement(template, 'progressDiv'));
        self._progressDiv.hide();
        $(self._fileEl).on('change', function (this: HTMLInputElement, e) {
            const fileEl = this;
            e.stopPropagation();
            const fileList = fileEl.files;
            self.fileInfo = null;
            let txt = '';
            for (let i = 0, l = fileList.length; i < l; i++) {
                txt += utils.str.format('<p>{0} ({1} KB)</p>', fileList[i].name, utils.str.formatNumber(fileList[i].size / 1024, 2, '.', ','));
            }
            self.fileInfo = txt;
            self.fileName = fileList.length > 0 ? fileList[0].name : null;
        });

        const templEl = template.el, $fileEl = $(self._fileEl);

        $fileEl.change(function (this: HTMLInputElement, e) {
            $('input[data-name="files-input"]', templEl).val($(this).val());
        });
        $('*[data-name="btn-input"]', templEl).click(function (this: HTMLElement, e) {
            e.preventDefault();
            e.stopPropagation();
            $fileEl.click();
        });
    }
    uploadFiles(fileList: FileList) {
        if (!!fileList) {
            for (let i = 0, l = fileList.length; i < l; i++) {
                this.uploadFile(fileList[i]);
            }
        }
    }
    uploadFile(file: File) {
        const self = this, uploader = new Uploader(this._uploadUrl, file);
        self._onLoadStart();
        uploader.addOnProgress((s, val) => {
            self._onProgress(val);
        });
        uploader.addOnAddHeaders((s, args) => {
            args.promise = self._addHeaders(args.xhr, file);
        });
        uploader.uploadFile().then((fileName) => {
            uploader.destroy();
            self._onLoadComplete();

        }).catch((err) => {
            uploader.destroy();
            self._onLoadError();
        });
    }
    get uploadUrl() { return this._uploadUrl; }
    get fileUploaded() { return this._fileUploaded; }
    get formEl() { return this._formEl; }
    get fileInfo() { return this._fileInfo; }
    set fileInfo(v) {
        if (this._fileInfo !== v) {
            this._fileInfo = v;
            this.raisePropertyChanged('fileInfo');
            this._uploadCommand.raiseCanExecuteChanged();
        }
    }
    get fileName() { return this._fileName; }
    set fileName(v) {
        if (this._fileName !== v) {
            this._fileName = v;
            this.raisePropertyChanged('fileName');
        }
    }
    get uploadCommand() { return this._uploadCommand; }
    //id of the record in database
    get id() { return this._id; }
    set id(v: string) {
        var old = this._id;
        if (old !== v) {
            this._id = v;
            this.raisePropertyChanged('id');
            this._onIDChanged();
        }
    }
    beginEdit() {
        return true;
    }
    endEdit() {
        return true;
    }
    cancelEdit() {
        return true;
    }
    get isEditing() { return true; }
}