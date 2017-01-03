import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

import * as DEMODB from "../demo/demoDB";
import { BaseUploadVM } from "./baseUpload";

var utils = RIAPP.Utils, coreUtils = RIAPP.Utils.core, $ = uiMOD.$;


//helper function to get html DOM element  inside template's instance
//by custom data-name attribute value
var fn_getTemplateElement = function (template: RIAPP.ITemplate, name: string) {
    var t = template;
    var els = t.findElByDataName(name);
    if (els.length < 1)
        return null;
    return els[0];
};

export class UploadThumbnailVM extends BaseUploadVM {
    private _product: DEMODB.Product;
    private _dialogVM: uiMOD.DialogVM;
    private _dialogCommand: RIAPP.ICommand;
    private _templateCommand: RIAPP.ICommand;

    constructor(app: RIAPP.Application, url: string) {
        super(url);
        var self = this;
        this._product = null;
        //we defined this custom type in common.js
        this._dialogVM = new uiMOD.DialogVM(app);
        var dialogOptions: uiMOD.IDialogConstructorOptions = {
            templateID: 'uploadTemplate',
            width: 450,
            height: 250,
            title: 'Upload product thumbnail',
            fn_OnTemplateCreated: function (template) {
                //function executed in the context of the dialog
                var dialog = this;
                self._fileEl = <HTMLInputElement>fn_getTemplateElement(template, 'files-to-upload');
                self._formEl = <HTMLFormElement>fn_getTemplateElement(template, 'uploadForm');
                self._progressBar = $(fn_getTemplateElement(template, 'progressBar'));
                self._percentageCalc = $(fn_getTemplateElement(template, 'percentageCalc'));
                self._progressDiv = $(fn_getTemplateElement(template, 'progressDiv'));
                self._progressDiv.hide();
                $(self._fileEl).on('change', function (e: JQueryEventObject) {
                    var fileEl: HTMLInputElement = this;
                    e.stopPropagation();
                    var fileList = fileEl.files, txt = '';
                    self.fileInfo = null;
                    for (var i = 0, l = fileList.length; i < l; i++) {
                        txt += utils.str.format('<p>{0} ({1} KB)</p>', fileList[i].name, utils.str.formatNumber(fileList[i].size / 1024, 2, '.', ','));
                    }
                    self.fileInfo = txt;
                });

                var templEl = template.el, $fileEl = $(self._fileEl);
                $fileEl.change(function (e) {
                    $('input[data-name="files-input"]', templEl).val($(this).val());
                });
                $('*[data-name="btn-input"]', templEl).click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $fileEl.click();
                });
            },
            fn_OnShow: function (dialog) {
                self._formEl.reset();
                self.fileInfo = null;
                self._fileUploaded = false;
            },
            fn_OnClose: function (dialog) {
                if (dialog.result == 'ok' && self._onDialogClose()) {
                    //raise our custom event
                    self.raiseEvent('files_uploaded', { id: self.id, product: self._product });
                }
            }
        };
        //dialogs are distinguished by their given names
        this._dialogVM.createDialog('uploadDialog', dialogOptions);
        //shows dialog when executed
        this._dialogCommand = new RIAPP.Command(function (sender, param) {
            try {
                //using command parameter to provide the product item
                self._product = param;
                self.id = self._product.ProductID.toString();
                self._dialogVM.showDialog('uploadDialog', self);
            } catch (ex) {
                self.handleError(ex, this);
            }
        }, self, function (sender, param) {
            return true;
        });
        //executed when template is loaded or unloading
        this._templateCommand = new RIAPP.TemplateCommand(function (sender, param) {
            try {
                var template = param.template, fileEl = $('input[data-name="files-to-upload"]', template.el);
                if (fileEl.length == 0)
                    return;

                if (param.isLoaded) {
                    fileEl.change(function (e) {
                        $('input[data-name="files-input"]', template.el).val($(this).val());
                    });
                    $('*[data-name="btn-input"]', template.el).click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        fileEl.click();
                    });
                }
                else {
                    fileEl.off('change');
                    $('*[data-name="btn-input"]', template.el).off('click');
                }
            } catch (ex) {
                self.handleError(ex, this);
            }
        }, self, function (sender, param) {
            return true;
        });

    }
    protected _getEventNames() {
        var base_events = super._getEventNames();
        return ['files_uploaded'].concat(base_events);
    }
    addOnFilesUploaded(fn: (sender: UploadThumbnailVM, args: { id: string; product: dbMOD.IEntityItem; }) => void, nmspace?: string) {
        this.addHandler('files_uploaded', fn, nmspace);
    }
    removeOnFilesUploaded(nmspace?: string) {
        this.removeHandler('files_uploaded', nmspace);
    }
    _onDialogClose() {
        return this._fileUploaded;
    }
    get dialogCommand() { return this._dialogCommand; }
    get templateCommand() { return this._templateCommand; }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._dialogVM.destroy();
        this._dialogVM = null;
        super.destroy();
    }
}