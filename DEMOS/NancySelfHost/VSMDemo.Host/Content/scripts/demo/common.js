var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp", "jriapp_db", "jriapp_ui"], function (require, exports, RIAPP, dbMOD, uiMOD) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = utils.dom.$;
    function addTextQuery(query, fldName, val) {
        var tmp;
        if (!!val) {
            if (utils.str.startsWith(val, '%') && utils.str.endsWith(val, '%')) {
                tmp = utils.str.trim(val, '% ');
                query.where(fldName, 4, [tmp]);
            }
            else if (utils.str.startsWith(val, '%')) {
                tmp = utils.str.trim(val, '% ');
                query.where(fldName, 3, [tmp]);
            }
            else if (utils.str.endsWith(val, '%')) {
                tmp = utils.str.trim(val, '% ');
                query.where(fldName, 2, [tmp]);
            }
            else {
                tmp = utils.str.trim(val);
                query.where(fldName, 0, [tmp]);
            }
        }
        return query;
    }
    exports.addTextQuery = addTextQuery;
    var DownloadLinkElView = (function (_super) {
        __extends(DownloadLinkElView, _super);
        function DownloadLinkElView(options) {
            _super.call(this, options);
            this._baseUri = '';
            if (!!options.baseUri)
                this._baseUri = options.baseUri;
            this._id = '';
        }
        Object.defineProperty(DownloadLinkElView.prototype, "text", {
            get: function () {
                return this.$el.text();
            },
            set: function (v) {
                var $el = this.$el;
                var x = $el.text();
                if (v === null)
                    v = '';
                else
                    v = '' + v;
                if (x !== v) {
                    $el.text(v);
                    this.raisePropertyChanged('text');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DownloadLinkElView.prototype, "href", {
            get: function () {
                return this.$el.prop('href');
            },
            set: function (v) {
                var x = this.$el.prop('href');
                if (v === null)
                    v = '';
                else
                    v = '' + v;
                if (x !== v) {
                    this.$el.prop('href', v);
                    this.raisePropertyChanged('href');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DownloadLinkElView.prototype, "id", {
            get: function () { return this._id; },
            set: function (v) {
                var x = this._id;
                if (v === null)
                    v = '';
                else
                    v = '' + v;
                if (x !== v) {
                    this._id = v;
                    this.href = this._baseUri + '/' + this._id;
                    this.raisePropertyChanged('id');
                }
            },
            enumerable: true,
            configurable: true
        });
        return DownloadLinkElView;
    }(RIAPP.BaseElView));
    exports.DownloadLinkElView = DownloadLinkElView;
    var FileImgElView = (function (_super) {
        __extends(FileImgElView, _super);
        function FileImgElView(options) {
            _super.call(this, options);
            this._debounce = null;
            this._baseUri = '';
            if (!!options.baseUri)
                this._baseUri = options.baseUri;
            this._id = '';
            this._src = null;
            this._fileName = null;
        }
        FileImgElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            clearTimeout(this._debounce);
            this._debounce = null;
            _super.prototype.destroy.call(this);
        };
        FileImgElView.prototype.reloadImg = function () {
            if (!!this.src) {
                var src = this.src;
                var pos = src.indexOf('?');
                if (pos >= 0) {
                    src = src.substr(0, pos);
                }
                var date = new Date();
                this.src = src + '?v=' + date.getTime();
            }
        };
        Object.defineProperty(FileImgElView.prototype, "fileName", {
            get: function () { return this._fileName; },
            set: function (v) {
                var x = this._fileName;
                if (x !== v) {
                    this._fileName = v;
                    this.raisePropertyChanged('fileName');
                    this.reloadImg();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileImgElView.prototype, "src", {
            get: function () {
                return this._src;
            },
            set: function (v) {
                var _this = this;
                if (this._src !== v) {
                    this._src = v;
                    this.raisePropertyChanged('src');
                }
                clearTimeout(this._debounce);
                this._debounce = setTimeout(function () {
                    _this._debounce = null;
                    var $img = _this.$el;
                    if (!!_this._src) {
                        $img.prop('src', _this._src);
                    }
                    else {
                        $img.prop('src', "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");
                    }
                }, 100);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileImgElView.prototype, "id", {
            get: function () { return this._id; },
            set: function (v) {
                var x = this._id;
                if (v === null)
                    v = '';
                else
                    v = '' + v;
                if (x !== v) {
                    this._id = v;
                    if (!this._id)
                        this.src = null;
                    else
                        this.src = this._baseUri + '/' + this._id;
                    this.raisePropertyChanged('id');
                }
            },
            enumerable: true,
            configurable: true
        });
        return FileImgElView;
    }(RIAPP.BaseElView));
    exports.FileImgElView = FileImgElView;
    var ErrorViewModel = (function (_super) {
        __extends(ErrorViewModel, _super);
        function ErrorViewModel(app) {
            _super.call(this, app);
            var self = this;
            this._error = null;
            this._errors = [];
            this._message = null;
            this._title = '';
            this._dialogVM = new uiMOD.DialogVM(app);
            var dialogOptions = {
                templateID: 'errorTemplate',
                width: 500,
                height: 300,
                title: '',
                canCancel: false,
                fn_OnShow: function (dialog) {
                    while (!!self.error && !!self.error.origError) {
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
            this._dialogVM.createDialog('errorDialog', dialogOptions);
        }
        ErrorViewModel.prototype.showDialog = function () {
            this._dialogVM.showDialog('errorDialog', this);
        };
        ErrorViewModel.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._dialogVM.destroy();
            this._dialogVM = null;
            this._error = null;
            this._errors = [];
            this._message = null;
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(ErrorViewModel.prototype, "error", {
            get: function () { return this._error; },
            set: function (v) {
                var self = this, old = this._error;
                if (!old) {
                    this._error = v;
                    var msg = '';
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
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ErrorViewModel.prototype, "title", {
            get: function () { return this._title; },
            set: function (v) {
                var old = this._title;
                if (old !== v) {
                    this._title = v;
                    this.raisePropertyChanged('title');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ErrorViewModel.prototype, "message", {
            get: function () { return this._message; },
            set: function (v) {
                var old = this._message;
                if (old !== v) {
                    this._message = v;
                    this.raisePropertyChanged('message');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ErrorViewModel.prototype, "errorCount", {
            get: function () {
                return this._errors.length + 1;
            },
            enumerable: true,
            configurable: true
        });
        return ErrorViewModel;
    }(RIAPP.ViewModel));
    exports.ErrorViewModel = ErrorViewModel;
    function initModule(app) {
        app.registerElView('fileLink', DownloadLinkElView);
        app.registerElView('fileImage', FileImgElView);
    }
    exports.initModule = initModule;
});
