import * as RIAPP from "jriapp";

var utils = RIAPP.Utils;

export class BaseUploadVM extends RIAPP.BaseObject {
    private _uploadUrl: string;
    protected _formEl: HTMLFormElement;
    protected _fileEl: HTMLInputElement;
    protected _progressBar: JQuery;
    protected _percentageCalc: JQuery;
    protected _progressDiv: JQuery;
    protected _fileInfo: string;
    protected _id: string;
    protected _fileUploaded: boolean;
    protected _initOk: boolean;
    protected _uploadCommand: RIAPP.ICommand;
    protected xhr: XMLHttpRequest;

    constructor(url: string) {
        super();
        var self = this;
        this._uploadUrl = url;
        this._formEl = null;
        this._fileEl = null;
        this._progressBar = null;
        this._percentageCalc = null;
        this._progressDiv = null;
        this._fileInfo = null;
        this._id = null;
        this._fileUploaded = false;

        this._initOk = this._initXhr();
        this._uploadCommand = new RIAPP.Command(function (sender, param) {
            try {
                self.uploadFiles(self._fileEl.files);
            } catch (ex) {
                self.handleError(ex, self);
            }
        }, self, function (sender, param) {
            return self._canUpload();
        });
    }
    protected _initXhr() {
        this.xhr = new XMLHttpRequest();
        if (!this.xhr.upload) {
            this.xhr = null;
            this.handleError('Browser dose not support HTML5 files upload interface', this);
            return false;
        }
        var self = this, xhr = this.xhr, upload = xhr.upload;
        upload.onloadstart = function (e) {
            self._progressBar.prop("max", 100);
            self._progressBar.prop("value", 0);
            self._percentageCalc.html("0%");
            self._progressDiv.show();
        };

        upload.onprogress = function (e) {
            if (!!e.lengthComputable) {
                self._progressBar.prop("max", e.total);
                self._progressBar.prop("value", e.loaded);
                self._percentageCalc.html(Math.round(e.loaded / e.total * 100) + "%");
            }
        };

        //File uploaded
        upload.onload = function (e) {
            self.fileInfo = 'the File is uploaded';
            self._progressDiv.hide();
            self._onFileUploaded();
        };

        upload.onerror = function (e) {
            self.fileInfo = null;
            self._progressDiv.hide();
            self.handleError(new Error('File uploading error'), self);
        };

        xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status >= 400) {
                    self.handleError(new Error(utils.str.format("File upload error: {0}", xhr.statusText)), self);
                }
            }
        };

        return true;
    }
    protected _onFileUploaded() {
        this._fileUploaded = true;
    }
    uploadFiles(fileList: FileList) {
        if (!!fileList) {
            for (var i = 0, l = fileList.length; i < l; i++) {
                this.uploadFile(fileList[i]);
            }
        }
    }
    uploadFile(file: File) {
        if (!this._initOk)
            return;
        var xhr = this.xhr;
        xhr.open("post", this._uploadUrl, true);
        // Set appropriate headers
        // We're going to use these in the UploadFile method
        // To determine what is being uploaded.
        xhr.setRequestHeader("Content-Type", "multipart/form-data");
        xhr.setRequestHeader("X-File-Name", file.name);
        xhr.setRequestHeader("X-File-Size", file.size.toString());
        xhr.setRequestHeader("X-File-Type", file.type);
        xhr.setRequestHeader("X-Data-ID", this._getDataID());

        // Send the file
        xhr.send(file);
    }
    _onIDChanged() {
        this._uploadCommand.raiseCanExecuteChanged();
    }
    _canUpload() {
        return this._initOk && !!this._fileInfo && !utils.check.isNt(this.id);
    }
    _getDataID() {
        return this.id;
    }
    get fileInfo() { return this._fileInfo; }
    set fileInfo(v) {
        if (this._fileInfo !== v) {
            this._fileInfo = v;
            this.raisePropertyChanged('fileInfo');
            this._uploadCommand.raiseCanExecuteChanged();
        }
    }
    get uploadCommand() { return this._uploadCommand; }
    get id() { return this._id; }
    set id(v: string) {
        var old = this._id;
        if (old !== v) {
            this._id = v;
            this.raisePropertyChanged('id');
            this._onIDChanged();
        }
    }
}