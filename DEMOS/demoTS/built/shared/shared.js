var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("common", ["require", "exports", "jriapp", "jriapp_db", "jriapp_ui"], function (require, exports, RIAPP, dbMOD, uiMOD) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = RIAPP.Utils;
    function addTextQuery(query, fldName, val) {
        var tmp;
        if (!!val) {
            if (utils.str.startsWith(val, '%') && utils.str.endsWith(val, '%')) {
                tmp = utils.str.trim(val, ['%', ' ']);
                query.where(fldName, 4, [tmp]);
            }
            else if (utils.str.startsWith(val, '%')) {
                tmp = utils.str.trim(val, ['%', ' ']);
                query.where(fldName, 3, [tmp]);
            }
            else if (utils.str.endsWith(val, '%')) {
                tmp = utils.str.trim(val, ['%', ' ']);
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
    ;
    var DownloadLinkElView = (function (_super) {
        __extends(DownloadLinkElView, _super);
        function DownloadLinkElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            _this._baseUri = '';
            if (!!options.baseUri)
                _this._baseUri = options.baseUri;
            _this._id = '';
            return _this;
        }
        Object.defineProperty(DownloadLinkElView.prototype, "text", {
            get: function () {
                return this.el.textContent;
            },
            set: function (v) {
                var el = this.el;
                var x = this.text;
                v = (!v) ? "" : ("" + v);
                if (x !== v) {
                    el.textContent = v;
                    this.objEvents.raiseProp('text');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DownloadLinkElView.prototype, "href", {
            get: function () {
                return this.el.href;
            },
            set: function (v) {
                var x = this.href;
                v = (!v) ? "" : ("" + v);
                if (x !== v) {
                    this.el.href = v;
                    this.objEvents.raiseProp("href");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DownloadLinkElView.prototype, "id", {
            get: function () {
                return this._id;
            },
            set: function (v) {
                var x = this._id;
                v = (!v) ? "" : ("" + v);
                if (x !== v) {
                    this._id = v;
                    this.href = this._baseUri + '/' + this._id;
                    this.objEvents.raiseProp('id');
                }
            },
            enumerable: true,
            configurable: true
        });
        return DownloadLinkElView;
    }(uiMOD.BaseElView));
    exports.DownloadLinkElView = DownloadLinkElView;
    var FileImgElView = (function (_super) {
        __extends(FileImgElView, _super);
        function FileImgElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            _this._debounce = new RIAPP.Debounce();
            _this._baseUri = '';
            if (!!options.baseUri) {
                _this._baseUri = options.baseUri;
            }
            _this._id = '';
            _this._src = null;
            _this._fileName = null;
            return _this;
        }
        FileImgElView.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            this._debounce.dispose();
            _super.prototype.dispose.call(this);
        };
        FileImgElView.prototype.reloadImg = function () {
            if (!!this.src) {
                var src = this.src, pos = src.indexOf('?');
                if (pos >= 0) {
                    src = src.substr(0, pos);
                }
                var date = new Date();
                this.src = src + '?v=' + date.getTime();
            }
        };
        Object.defineProperty(FileImgElView.prototype, "fileName", {
            get: function () {
                return this._fileName;
            },
            set: function (v) {
                var x = this._fileName;
                if (x !== v) {
                    this._fileName = v;
                    this.objEvents.raiseProp('fileName');
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
                    this.objEvents.raiseProp('src');
                }
                var img = this.el;
                img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
                this._debounce.enque(function () {
                    if (!!_this._src) {
                        img.src = _this._src;
                    }
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileImgElView.prototype, "id", {
            get: function () {
                return this._id;
            },
            set: function (v) {
                var x = this._id;
                v = (v === null) ? '' : ('' + v);
                if (x !== v) {
                    this._id = v;
                    if (!this._id)
                        this.src = null;
                    else
                        this.src = this._baseUri + '/' + this._id;
                    this.objEvents.raiseProp('id');
                }
            },
            enumerable: true,
            configurable: true
        });
        return FileImgElView;
    }(uiMOD.BaseElView));
    exports.FileImgElView = FileImgElView;
    var ErrorViewModel = (function (_super) {
        __extends(ErrorViewModel, _super);
        function ErrorViewModel(app) {
            var _this = _super.call(this, app) || this;
            var self = _this;
            _this._error = null;
            _this._errors = [];
            _this._message = null;
            _this._title = '';
            _this._dialogVM = new uiMOD.DialogVM(app);
            var dialogOptions = {
                templateID: 'errorTemplate',
                width: 500,
                height: 300,
                title: '',
                canCancel: false,
                fn_OnShow: function (dialog) {
                    while (!!self.error && !!self.error.origError) {
                        self._error = self.error.origError;
                        self.objEvents.raiseProp('error');
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
                    self.objEvents.raiseProp('error');
                    self.objEvents.raiseProp('message');
                }
            };
            _this._dialogVM.createDialog('errorDialog', dialogOptions);
            return _this;
        }
        ErrorViewModel.prototype.showDialog = function () {
            this._dialogVM.showDialog('errorDialog', this);
        };
        ErrorViewModel.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            this._dialogVM.dispose();
            this._dialogVM = null;
            this._error = null;
            this._errors = [];
            this._message = null;
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(ErrorViewModel.prototype, "error", {
            get: function () {
                return this._error;
            },
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
                    this.objEvents.raiseProp('error');
                }
                else {
                    this._errors.push(v);
                    this.objEvents.raiseProp('errorCount');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ErrorViewModel.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (v) {
                var old = this._title;
                if (old !== v) {
                    this._title = v;
                    this.objEvents.raiseProp('title');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ErrorViewModel.prototype, "message", {
            get: function () {
                return this._message;
            },
            set: function (v) {
                var old = this._message;
                if (old !== v) {
                    this._message = v;
                    this.objEvents.raiseProp('message');
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
    ;
});
define("autocomplete", ["require", "exports", "jriapp", "jriapp_ui", "common"], function (require, exports, RIAPP, uiMOD, COMMON) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = uiMOD.$, dom = RIAPP.DOM;
    function findElemViewInTemplate(template, name) {
        var arr = template.findElViewsByDataName(name);
        return (!!arr && arr.length > 0) ? arr[0] : null;
    }
    function findElemInTemplate(template, name) {
        var arr = template.findElByDataName(name);
        return (!!arr && arr.length > 0) ? arr[0] : null;
    }
    var AutoCompleteElView = (function (_super) {
        __extends(AutoCompleteElView, _super);
        function AutoCompleteElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            var self = _this;
            _this._templateId = options.templateId;
            _this._fieldName = options.fieldName;
            _this._dbSetName = options.dbSetName;
            _this._queryName = options.queryName;
            _this._dbContext = options.dbContext;
            _this._minTextLength = (!!options.minTextLength) ? options.minTextLength : 1;
            _this._template = null;
            _this._gridDataSource = null;
            _this._prevText = null;
            _this._template = null;
            _this._$dropDown = null;
            _this._loadTimeout = null;
            _this._dataContext = null;
            _this._isLoading = false;
            _this._lookupGrid = null;
            _this._btnOk = null;
            _this._btnCancel = null;
            _this._width = options.width || '200px';
            _this._height = options.height || '330px';
            var $el = $(_this.el);
            $el.on('change.' + _this.uniqueID, function (e) {
                e.stopPropagation();
                self._onTextChange();
                self.objEvents.raiseProp('value');
            });
            $el.on('keyup.' + _this.uniqueID, function (e) {
                e.stopPropagation();
                self._onKeyUp(e.target.value, e.keyCode);
                self._onKeyPress(e.keyCode);
            });
            $el.on('keypress.' + _this.uniqueID, function (e) {
                e.stopPropagation();
            });
            _this._isOpen = false;
            _this._createGridDataSource();
            _this._template = _this._createTemplate();
            _this._$dropDown = $(dom.document.createElement("div"));
            _this._$dropDown.css({
                "position": "absolute",
                "z-index": "10000",
                "left": "-2000px",
                "top": "-1000px",
                "background-color": "white",
                "border": "1px solid gray",
                "width": _this._width,
                "height": _this._height
            });
            _this._$dropDown.append(_this._template.el);
            _this._template.el.style.height = '100%';
            _this._template.el.style.width = '100%';
            dom.document.body.appendChild(_this._$dropDown.get(0));
            return _this;
        }
        AutoCompleteElView.prototype.templateLoading = function (template) {
        };
        AutoCompleteElView.prototype.templateLoaded = function (template, error) {
            if (this.getIsStateDirty() || error)
                return;
            var self = this, gridElView = findElemViewInTemplate(template, 'lookupGrid');
            if (!!gridElView) {
                this._lookupGrid = gridElView.grid;
            }
            this._btnOk = findElemInTemplate(template, 'btnOk');
            this._btnCancel = findElemInTemplate(template, 'btnCancel');
            $(this._btnOk).click(function () {
                self._updateSelection();
                self._hide();
            });
            $(this._btnCancel).click(function () {
                self._hide();
            });
        };
        AutoCompleteElView.prototype.templateUnLoading = function (template) {
        };
        AutoCompleteElView.prototype._createGridDataSource = function () {
            this._gridDataSource = this._getDbContext().getDbSet(this._dbSetName);
            if (!this._gridDataSource) {
                throw new Error(utils.str.format('dbContext does not contain dbSet with the name: {0}', this._dbSetName));
            }
        };
        AutoCompleteElView.prototype._getDbContext = function () {
            return this._dbContext;
        };
        AutoCompleteElView.prototype._createTemplate = function () {
            var t = RIAPP.createTemplate(this, this);
            t.templateID = this._templateId;
            return t;
        };
        AutoCompleteElView.prototype._onTextChange = function () {
        };
        AutoCompleteElView.prototype._onKeyUp = function (text, keyCode) {
            var self = this;
            clearTimeout(this._loadTimeout);
            if (!!text && text.length >= self._minTextLength) {
                this._loadTimeout = setTimeout(function () {
                    if (self.getIsStateDirty()) {
                        return;
                    }
                    if (self._prevText != text) {
                        self._prevText = text;
                        if (!((keyCode === 27) || (keyCode == 13))) {
                            if (!self._isOpen) {
                                self._open();
                            }
                            self.load(text);
                        }
                    }
                }, 500);
            }
            else {
                self.gridDataSource.clear();
            }
        };
        AutoCompleteElView.prototype._onKeyPress = function (keyCode) {
            if (keyCode === 13) {
                this._updateSelection();
            }
            if (keyCode === 27 || keyCode === 9 || keyCode === 13) {
                this._hideAsync();
                return true;
            }
            return false;
        };
        AutoCompleteElView.prototype._hideAsync = function () {
            var self = this;
            return utils.defer.delay(function () {
                self._hide();
            }, 100);
        };
        AutoCompleteElView.prototype._updateSelection = function () {
            this.value = this.currentSelection;
        };
        AutoCompleteElView.prototype._updatePosition = function () {
            this._$dropDown.position({
                my: "left top",
                at: "left bottom",
                of: $(this.el),
                offset: "0 0"
            });
        };
        AutoCompleteElView.prototype._onShow = function () {
            this.objEvents.raise('show', {});
        };
        AutoCompleteElView.prototype._onHide = function () {
            this.objEvents.raise('hide', {});
            this.objEvents.raiseProp("value");
        };
        AutoCompleteElView.prototype._open = function () {
            if (this._isOpen)
                return;
            var self = this;
            if (!!this._lookupGrid) {
                var dlg_1 = this._$dropDown.get(0), txtEl_1 = self.el;
                $(dom.document).on('mousedown.' + this.uniqueID, function (e) {
                    if (!(dom.isContained(e.target, dlg_1) || dom.isContained(e.target, txtEl_1))) {
                        self._hideAsync();
                    }
                });
                this._lookupGrid.addOnCellDblClicked(function (s, a) {
                    self._updateSelection();
                    self._hide();
                }, this.uniqueID);
                bootstrap.selectedControl = self._lookupGrid;
                $(dom.document).on('keyup.' + this.uniqueID, function (e) {
                    if (bootstrap.selectedControl === self._lookupGrid) {
                        if (self._onKeyPress(e.which))
                            e.stopPropagation();
                    }
                });
            }
            this._updatePosition();
            this._isOpen = true;
            this._onShow();
        };
        AutoCompleteElView.prototype._hide = function () {
            if (!this._isOpen)
                return;
            $(dom.document).off('.' + this.uniqueID);
            if (!!this._lookupGrid) {
                this._lookupGrid.objEvents.offNS(this.uniqueID);
            }
            this._$dropDown.css({ left: "-2000px" });
            this._isOpen = false;
            this._onHide();
        };
        AutoCompleteElView.prototype.getDataContext = function () {
            return this._dataContext;
        };
        AutoCompleteElView.prototype.setDataContext = function (v) {
            var old = this._dataContext;
            if (this._dataContext !== v) {
                if (!!old) {
                    old.objEvents.offNS(this.uniqueID);
                }
                this._dataContext = v;
                this.objEvents.raiseProp('dataContext');
                if (!this._dataContext) {
                    this._hideAsync();
                }
            }
        };
        AutoCompleteElView.prototype.load = function (str) {
            var self = this, query = this.gridDataSource.createQuery(this._queryName);
            query.pageSize = 50;
            query.isClearPrevData = true;
            COMMON.addTextQuery(query, this._fieldName, str + '%');
            query.orderBy(this._fieldName);
            this._isLoading = true;
            this.objEvents.raiseProp('isLoading');
            query.load().always(function (res) {
                self._isLoading = false;
                self.objEvents.raiseProp('isLoading');
            });
        };
        AutoCompleteElView.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            this._hide();
            $(this.el).off('.' + this.uniqueID);
            if (!!this._lookupGrid) {
                this._lookupGrid = null;
            }
            if (!!this._template) {
                this._template.dispose();
                this._template = null;
                this._$dropDown = null;
            }
            this._gridDataSource = null;
            this._dataContext = null;
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(AutoCompleteElView.prototype, "fieldName", {
            get: function () {
                return this._fieldName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "templateId", {
            get: function () {
                return this._templateId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "currentSelection", {
            get: function () {
                if (this._gridDataSource.currentItem) {
                    return this._gridDataSource.currentItem[this._fieldName];
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "template", {
            get: function () {
                return this._template;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "dataContext", {
            get: function () {
                return this.getDataContext();
            },
            set: function (v) {
                this.setDataContext(v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "gridDataSource", {
            get: function () {
                return this._gridDataSource;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "value", {
            get: function () {
                return this.el.value;
            },
            set: function (v) {
                var x = this.value, str = "" + v;
                v = (!v) ? "" : str;
                if (x !== v) {
                    this.el.value = v;
                    this._prevText = v;
                    this.objEvents.raiseProp("value");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "isLoading", {
            get: function () {
                return this._isLoading;
            },
            enumerable: true,
            configurable: true
        });
        return AutoCompleteElView;
    }(uiMOD.InputElView));
    exports.AutoCompleteElView = AutoCompleteElView;
    function initModule(app) {
        app.registerElView('autocomplete', AutoCompleteElView);
    }
    exports.initModule = initModule;
});
define("header", ["require", "exports", "jriapp", "jriapp_ui"], function (require, exports, RIAPP, uiMOD) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = uiMOD.$;
    exports.topPanel = "#demoHeader";
    exports.contentPanel = "#demoContent";
    var HeaderVM = (function (_super) {
        __extends(HeaderVM, _super);
        function HeaderVM(app) {
            var _this = _super.call(this, app) || this;
            _this._$topPanel = $(exports.topPanel);
            _this._$contentPanel = $(exports.contentPanel);
            _this._contentPanelHeight = 0;
            if (!!_this._$contentPanel) {
                _this._contentPanelHeight = _this._$contentPanel.height();
            }
            _this._expanderCommand = new RIAPP.Command(function (param) {
                if (param.isExpanded) {
                    _this.expand();
                }
                else {
                    _this.collapse();
                }
            });
            return _this;
        }
        HeaderVM.prototype.addOnUpdateUI = function (fn, namespace) {
            this.objEvents.on('updateUI', fn, namespace);
        };
        HeaderVM.prototype.expand = function () {
            var _this = this;
            this._$topPanel.slideDown('fast', function () { return _this.updateUI(false); });
        };
        HeaderVM.prototype.collapse = function () {
            var _this = this;
            this._$topPanel.slideUp('fast', function () { return _this.updateUI(true); });
        };
        HeaderVM.prototype.updateUI = function (isUp) {
            var args = { isHandled: false, isUp: isUp };
            this.objEvents.raise('updateUI', args);
            if (args.isHandled)
                return;
            if (!!this._$contentPanel) {
                if (isUp)
                    this._$contentPanel.height(this._contentPanelHeight);
                else
                    this._$contentPanel.height(this._contentPanelHeight - this._$topPanel.outerHeight());
            }
        };
        Object.defineProperty(HeaderVM.prototype, "expanderCommand", {
            get: function () { return this._expanderCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HeaderVM.prototype, "$contentPanel", {
            get: function () { return this._$contentPanel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HeaderVM.prototype, "$topPanel", {
            get: function () { return this._$topPanel; },
            enumerable: true,
            configurable: true
        });
        return HeaderVM;
    }(RIAPP.ViewModel));
    exports.HeaderVM = HeaderVM;
});
define("mixobj", ["require", "exports", "jriapp_shared/utils/checks", "jriapp_shared/utils/error", "jriapp_shared/utils/weakmap", "jriapp_shared/object"], function (require, exports, checks_1, error_1, weakmap_1, object_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var checks = checks_1.Checks, signature = object_1.objSignature, weakmap = weakmap_1.createWeakMap();
    function MixObject(Base) {
        return (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, args) || this;
                weakmap.set(_this, { objState: 0, events: null });
                return _this;
            }
            class_1.prototype.isHasProp = function (prop) {
                return checks.isHasProp(this, prop);
            };
            class_1.prototype.handleError = function (error, source) {
                if (error_1.ERROR.checkIsDummy(error)) {
                    return true;
                }
                if (!error.message) {
                    error = new Error("Error: " + error);
                }
                var args = { error: error, source: source, isHandled: false };
                this.objEvents.raise("error", args);
                var isHandled = args.isHandled;
                if (!isHandled) {
                    isHandled = error_1.ERROR.handleError(this, error, source);
                }
                return isHandled;
            };
            class_1.prototype.getIsDisposed = function () {
                var state = weakmap.get(this);
                return !state || state.objState === 2;
            };
            class_1.prototype.getIsStateDirty = function () {
                var state = weakmap.get(this);
                return !state || state.objState !== 0;
            };
            class_1.prototype.dispose = function () {
                var state = weakmap.get(this);
                if (!state || state.objState === 2) {
                    return;
                }
                try {
                    if (!!state.events) {
                        state.events.raise("disposed", {});
                        state.events.off();
                        state.events = null;
                    }
                }
                finally {
                    state.objState = 2;
                    weakmap.delete(this);
                }
            };
            Object.defineProperty(class_1.prototype, "objEvents", {
                get: function () {
                    var state = weakmap.get(this);
                    if (!state || state.objState === 2) {
                        return object_1.dummyEvents;
                    }
                    if (!state.events) {
                        state.events = object_1.createObjectEvents(this);
                    }
                    return state.events;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(class_1.prototype, "__objSig", {
                get: function () {
                    return signature;
                },
                enumerable: true,
                configurable: true
            });
            return class_1;
        }(Base));
    }
    exports.MixObject = MixObject;
});
define("monthpicker", ["require", "exports", "jriapp_ui"], function (require, exports, uiMOD) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var $ = uiMOD.$;
    var MonthPickerElView = (function (_super) {
        __extends(MonthPickerElView, _super);
        function MonthPickerElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            var self = _this, $el = $(_this.el);
            $el.MonthPicker({
                OnAfterChooseMonth: function (selectedDate) {
                    self.objEvents.raiseProp("value");
                },
                Button: "<button class='btn lnkbtn btn-info'>...</button>"
            });
            return _this;
        }
        MonthPickerElView.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            var $el = $(this.el);
            uiMOD.JQueryUtils.dispose$Plugin($el, "MonthPicker");
            _super.prototype.dispose.call(this);
        };
        MonthPickerElView.prototype.toString = function () {
            return "MonthPickerElView";
        };
        return MonthPickerElView;
    }(uiMOD.TextBoxElView));
    exports.MonthPickerElView = MonthPickerElView;
    function initModule(app) {
        app.registerElView("monthpicker", MonthPickerElView);
    }
    exports.initModule = initModule;
});
define("ssevents", ["require", "exports", "jriapp"], function (require, exports, RIAPP) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;
    var SSEventsVM = (function (_super) {
        __extends(SSEventsVM, _super);
        function SSEventsVM(baseUrl, clientID) {
            var _this = _super.call(this) || this;
            var self = _this;
            _this._es = null;
            _this._deffered = null;
            _this._baseUrl = baseUrl;
            _this._clientID = clientID;
            _this._url = _this._baseUrl + "?id=" + clientID;
            _this._closeClientUrl = _this._baseUrl + "/CloseClient?id=" + clientID;
            _this._postMsgUrl = _this._baseUrl + "/PostMessage";
            _this._openESCommand = new RIAPP.Command(function () {
                self.open().catch(function (res) {
                    self.handleError(res, self);
                });
            }, function () {
                return !_this._es;
            });
            _this._closeESCommand = new RIAPP.Command(function () {
                self.close();
            }, function () {
                return !!_this._es;
            });
            bootstrap.addOnUnLoad(function () { return self.close(); });
            return _this;
        }
        SSEventsVM.isSupported = function () {
            try {
                return !!EventSource;
            }
            catch (e) {
                return false;
            }
        };
        SSEventsVM.prototype.getEventNames = function () {
            return ['open', 'close', 'error', 'message'];
        };
        SSEventsVM.prototype._onEsOpen = function (event) {
            clearTimeout(this._timeOut);
            this._timeOut = null;
            if (!!this._deffered) {
                this._deffered.resolve();
                this._deffered = null;
            }
        };
        SSEventsVM.prototype._onEsError = function (event) {
            this.handleError("EventSource error", this);
            this.close();
        };
        SSEventsVM.prototype._onMsg = function (event) {
            var data = JSON.parse(event.data);
            this.objEvents.raise('message', { message: event.data, data: data });
        };
        SSEventsVM.prototype._close = function () {
            if (!!this._timeOut)
                clearTimeout(this._timeOut);
            this._timeOut = null;
            if (!!this._deffered) {
                this._deffered.reject({ message: "EventSource closed" });
            }
            this._deffered = null;
            if (!!this._es) {
                try {
                    this._es.close();
                    this._es = null;
                    this._openESCommand.raiseCanExecuteChanged();
                    this._closeESCommand.raiseCanExecuteChanged();
                }
                catch (e) {
                    this._es = null;
                }
            }
        };
        SSEventsVM.prototype.addOnMessage = function (fn, namespace) {
            this.objEvents.on('message', fn, namespace);
        };
        SSEventsVM.prototype.open = function () {
            var self = this;
            if (!!this._deffered)
                return this._deffered.promise();
            this._deffered = utils.defer.createDeferred();
            this._timeOut = setTimeout(function () {
                self._timeOut = null;
                if (!!self._deffered) {
                    self._deffered.reject({ message: "EventSource connect timeout!" });
                    self._deffered = null;
                    self._close();
                }
            }, 10000);
            if (!this._es) {
                this._es = new EventSource(self.url);
                this._es.addEventListener('message', function (e) {
                    self._onMsg(e);
                }, false);
                this._es.addEventListener('open', function (e) {
                    self._onEsOpen(e);
                }, false);
                this._es.addEventListener('error', function (e) {
                    self._onEsError(e);
                }, false);
                this._openESCommand.raiseCanExecuteChanged();
                this._closeESCommand.raiseCanExecuteChanged();
            }
            return this._deffered.promise();
        };
        SSEventsVM.prototype.close = function () {
            var postData = null;
            if (!this._es)
                return;
            try {
                this._close();
            }
            finally {
                utils.http.postAjax(this._closeClientUrl, postData);
            }
        };
        SSEventsVM.prototype.post = function (message, clientID) {
            var payload = { message: message }, postData = JSON.stringify({ payload: payload, clientID: !clientID ? this._clientID : clientID });
            var req_promise = utils.http.postAjax(this._postMsgUrl, postData);
            return req_promise;
        };
        SSEventsVM.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            try {
                this.close();
            }
            finally {
                _super.prototype.dispose.call(this);
            }
        };
        Object.defineProperty(SSEventsVM.prototype, "es", {
            get: function () { return this._es; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSEventsVM.prototype, "openESCommand", {
            get: function () { return this._openESCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSEventsVM.prototype, "closeESCommand", {
            get: function () { return this._closeESCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSEventsVM.prototype, "url", {
            get: function () { return this._url; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSEventsVM.prototype, "baseUrl", {
            get: function () { return this._baseUrl; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSEventsVM.prototype, "clientID", {
            get: function () { return this._clientID; },
            enumerable: true,
            configurable: true
        });
        return SSEventsVM;
    }(RIAPP.BaseObject));
    exports.SSEventsVM = SSEventsVM;
});
define("uploader", ["require", "exports", "jriapp_shared"], function (require, exports, RIAPP) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = RIAPP.Utils, _async = utils.defer, CHUNK_SIZE = (512 * 1024);
    var Uploader = (function (_super) {
        __extends(Uploader, _super);
        function Uploader(uploadUrl, file) {
            var _this = _super.call(this) || this;
            _this._uploadUrl = uploadUrl;
            _this._file = file;
            return _this;
        }
        Uploader.prototype.addOnProgress = function (fn, nmspace) {
            this.objEvents.on('progress', fn, nmspace);
        };
        Uploader.prototype.addOnAddHeaders = function (fn, nmspace) {
            this.objEvents.on('addheaders', fn, nmspace);
        };
        Uploader.prototype.uploadFile = function () {
            var self = this, chunks = [], file = this._file, FILE_SIZE = file.size;
            var streamPos = 0, endPos = CHUNK_SIZE;
            while (streamPos < FILE_SIZE) {
                chunks.push(file.slice(streamPos, endPos));
                streamPos = endPos;
                endPos = streamPos + CHUNK_SIZE;
            }
            var len = chunks.length;
            var funcs = chunks.map(function (chunk, i) { return function () { return self.uploadFileChunk(file, chunk, i + 1, len); }; });
            var res = _async.promiseSerial(funcs).then(function (res) {
                self.objEvents.raise('progress', 100);
                return file.name;
            });
            return res;
        };
        Uploader.prototype.uploadFileChunk = function (file, chunk, part, total) {
            var self = this, xhr = new XMLHttpRequest(), upload = xhr.upload;
            xhr.responseType = "text";
            var deffered = _async.createDeferred();
            upload.onload = function (e) {
                deffered.resolve(part);
            };
            upload.onerror = function (e) {
                deffered.reject(new Error("Uploading file " + file.name + " error"));
            };
            deffered.promise().then(function () { return self.objEvents.raise('progress', part / total); });
            xhr.open("post", self.uploadUrl, true);
            var name = encodeURIComponent(file.name);
            xhr.setRequestHeader("Content-Type", "multipart/form-data");
            xhr.setRequestHeader("X-File-Name", name);
            xhr.setRequestHeader("X-File-Size", file.size.toString());
            xhr.setRequestHeader("X-File-Type", file.type);
            xhr.setRequestHeader("X-Chunk-Num", part.toString());
            xhr.setRequestHeader("X-Chunk-Size", chunk.size.toString());
            xhr.setRequestHeader("X-Chunk-Count", total.toString());
            var args = { xhr: xhr, promise: null };
            self.objEvents.raise('addheaders', args);
            var addHeadersPromise = !args.promise ? _async.resolve() : args.promise;
            return addHeadersPromise.then(function () {
                xhr.send(chunk);
                return deffered.promise();
            });
        };
        Object.defineProperty(Uploader.prototype, "uploadUrl", {
            get: function () { return this._uploadUrl; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Uploader.prototype, "fileName", {
            get: function () { return this._file.name; },
            enumerable: true,
            configurable: true
        });
        return Uploader;
    }(RIAPP.BaseObject));
    exports.Uploader = Uploader;
});
define("websocket", ["require", "exports", "jriapp"], function (require, exports, RIAPP) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;
    var WebSocketsVM = (function (_super) {
        __extends(WebSocketsVM, _super);
        function WebSocketsVM(url) {
            var _this = _super.call(this) || this;
            var self = _this;
            _this._ws = null;
            _this._clientID = null;
            _this._deffered = null;
            _this._url = url;
            _this._openWsCommand = new RIAPP.Command(function () {
                _this.open().catch(function (res) {
                    self.handleError(res, self);
                });
            }, function () {
                return !self._ws;
            });
            _this._closeWsCommand = new RIAPP.Command(function () {
                _this.close();
            }, function () {
                return !!_this._ws;
            });
            bootstrap.addOnUnLoad(function (s, a) { return self.close(); });
            return _this;
        }
        WebSocketsVM.createUrl = function (port, svcName, isSSL) {
            svcName = !!svcName ? svcName : "PollingService";
            var url = (!isSSL ? "ws://" : "wss://") + window.location.host.split(":")[0] + ":" + port + "/" + svcName;
            return url;
        };
        WebSocketsVM.isSupported = function () {
            try {
                return !!WebSocket;
            }
            catch (e) {
                return false;
            }
        };
        WebSocketsVM.prototype.getEventNames = function () {
            return ['open', 'close', 'error', 'message'];
        };
        WebSocketsVM.prototype._onWsOpen = function (event) {
        };
        WebSocketsVM.prototype._onWsClose = function (event) {
            this._ws = null;
            this._clientID = null;
            clearTimeout(this._timeOut);
            this._timeOut = null;
            this._ws = null;
            this._clientID = null;
            this._openWsCommand.raiseCanExecuteChanged();
            this._closeWsCommand.raiseCanExecuteChanged();
            if (!!this._deffered) {
                this._deffered.reject("Websocket closed");
                this._deffered = null;
            }
            this.objEvents.raise('close', {});
        };
        WebSocketsVM.prototype._onWsError = function (event) {
            this.handleError("Websocket error", this);
            this.close();
        };
        WebSocketsVM.prototype._onMsg = function (event) {
            var res = JSON.parse(event.data);
            if (res.Tag == "connect") {
                clearTimeout(this._timeOut);
                this._timeOut = null;
                this._clientID = res.Payload.id;
                if (!!this._deffered) {
                    this._deffered.resolve(this._clientID);
                    this._deffered = null;
                }
            }
            else if (res.Tag == "closed") {
                this.close();
            }
            else if (res.Tag == "message") {
                this.objEvents.raise('message', { message: event.data, data: res.Payload });
            }
            else {
                console.log(event.data);
            }
        };
        WebSocketsVM.prototype.addOnMessage = function (fn, nmspace, context) {
            this.objEvents.on('message', fn, nmspace, context);
        };
        WebSocketsVM.prototype.open = function () {
            var self = this;
            if (!!this._deffered)
                return this._deffered.promise();
            this._deffered = utils.defer.createDeferred();
            if (!!this._ws && !!this._clientID) {
                this._deffered.resolve(this._clientID);
                var promise = this._deffered.promise();
                this._deffered = null;
                return promise;
            }
            this._timeOut = setTimeout(function () {
                self._timeOut = null;
                if (!!self._deffered) {
                    self._deffered.reject("Websocket connection timeout: " + self._url);
                    self._deffered = null;
                    self.close();
                }
            }, 5000);
            if (!this._ws) {
                this._ws = new WebSocket(self.url);
                this._ws.onopen = function (e) { self._onWsOpen(e); };
                this._ws.onclose = function (e) { self._onWsClose(e); };
                this._ws.onmessage = function (e) { self._onMsg(e); };
                this._ws.onerror = function (e) { self._onWsError(e); };
                this._openWsCommand.raiseCanExecuteChanged();
                this._closeWsCommand.raiseCanExecuteChanged();
            }
            return this._deffered.promise();
        };
        WebSocketsVM.prototype.close = function () {
            clearTimeout(this._timeOut);
            this._timeOut = null;
            if (!!this._deffered) {
                this._deffered.reject("Websocket closed");
            }
            this._deffered = null;
            if (!!this._ws) {
                try {
                    this._ws.close();
                    this._ws = null;
                    this._clientID = null;
                    this._openWsCommand.raiseCanExecuteChanged();
                    this._closeWsCommand.raiseCanExecuteChanged();
                }
                catch (e) {
                    this._ws = null;
                    this._clientID = null;
                }
            }
        };
        WebSocketsVM.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            try {
                this.close();
            }
            finally {
                _super.prototype.dispose.call(this);
            }
        };
        Object.defineProperty(WebSocketsVM.prototype, "ws", {
            get: function () { return this._ws; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocketsVM.prototype, "openWsCommand", {
            get: function () { return this._openWsCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocketsVM.prototype, "closeWsCommand", {
            get: function () { return this._closeWsCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocketsVM.prototype, "url", {
            get: function () { return this._url; },
            set: function (v) { this._url = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocketsVM.prototype, "clientID", {
            get: function () { return this._clientID; },
            enumerable: true,
            configurable: true
        });
        return WebSocketsVM;
    }(RIAPP.BaseObject));
    exports.WebSocketsVM = WebSocketsVM;
});
