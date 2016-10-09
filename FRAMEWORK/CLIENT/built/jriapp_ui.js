var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("jriapp_ui/dialog", ["require", "exports", "jriapp_core/lang", "jriapp_core/object", "jriapp_utils/utils", "jriapp_core/bootstrap", "jriapp_core/mvvm"], function (require, exports, langMOD, object_1, utils_1, bootstrap_1, mvvm_1) {
    "use strict";
    var checks = utils_1.Utils.check, strUtils = utils_1.Utils.str, coreUtils = utils_1.Utils.core;
    var $ = utils_1.Utils.dom.$, document = utils_1.Utils.dom.document;
    (function (DIALOG_ACTION) {
        DIALOG_ACTION[DIALOG_ACTION["Default"] = 0] = "Default";
        DIALOG_ACTION[DIALOG_ACTION["StayOpen"] = 1] = "StayOpen";
    })(exports.DIALOG_ACTION || (exports.DIALOG_ACTION = {}));
    var DIALOG_ACTION = exports.DIALOG_ACTION;
    ;
    var DLG_EVENTS = {
        close: "close",
        refresh: "refresh"
    };
    var PROP_NAME = {
        dataContext: "dataContext",
        isSubmitOnOK: "isSubmitOnOK",
        width: "width",
        height: "height",
        title: "title",
        canRefresh: "canRefresh",
        canCancel: "canCancel"
    };
    var DataEditDialog = (function (_super) {
        __extends(DataEditDialog, _super);
        function DataEditDialog(app, options) {
            _super.call(this);
            var self = this;
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
                var iSubmittable = utils_1.Utils.getSubmittable(self._dataContext);
                if (!iSubmittable || !iSubmittable.isCanSubmit) {
                    return utils_1.Utils.defer.createDeferred().resolve();
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
            this._templateDeferred = utils_1.Utils.defer.createDeferred();
            this._createDialog();
        }
        DataEditDialog.prototype.handleError = function (error, source) {
            var isHandled = _super.prototype.handleError.call(this, error, source);
            if (!isHandled) {
                return this._app.handleError(error, source);
            }
            return isHandled;
        };
        DataEditDialog.prototype.addOnClose = function (fn, nmspace, context) {
            this._addHandler(DLG_EVENTS.close, fn, nmspace, context);
        };
        DataEditDialog.prototype.removeOnClose = function (nmspace) {
            this._removeHandler(DLG_EVENTS.close, nmspace);
        };
        DataEditDialog.prototype.addOnRefresh = function (fn, nmspace, context) {
            this._addHandler(DLG_EVENTS.refresh, fn, nmspace, context);
        };
        DataEditDialog.prototype.removeOnRefresh = function (nmspace) {
            this._removeHandler(DLG_EVENTS.refresh, nmspace);
        };
        DataEditDialog.prototype._updateIsEditable = function () {
            this._isEditable = utils_1.Utils.getEditable(this._dataContext);
        };
        DataEditDialog.prototype._createDialog = function () {
            try {
                this._template = this._createTemplate();
                this._$dlgEl = $(this._template.el);
                document.body.appendChild(this._template.el);
                this._$dlgEl.dialog(this._options);
            }
            catch (ex) {
                utils_1.ERROR.reThrow(ex, this.handleError(ex, this));
            }
        };
        DataEditDialog.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [DLG_EVENTS.close, DLG_EVENTS.refresh].concat(base_events);
        };
        DataEditDialog.prototype.templateLoading = function (template) {
        };
        DataEditDialog.prototype.templateLoaded = function (template, error) {
            if (this._isDestroyCalled)
                return;
            if (!!this._fn_OnTemplateCreated) {
                this._fn_OnTemplateCreated(template);
            }
            this._templateDeferred.resolve(template);
        };
        DataEditDialog.prototype.templateUnLoading = function (template) {
            if (!!this._fn_OnTemplateDestroy) {
                this._fn_OnTemplateDestroy(template);
            }
        };
        DataEditDialog.prototype._createTemplate = function () {
            var template = this.app.createTemplate(null, this);
            template.templateID = this._templateID;
            return template;
        };
        DataEditDialog.prototype._destroyTemplate = function () {
            if (!!this._template)
                this._template.destroy();
        };
        DataEditDialog.prototype._getButtons = function () {
            var self = this, buttons = [
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
        };
        DataEditDialog.prototype._getOkButton = function () {
            return $("#" + this._objId + "Ok");
        };
        DataEditDialog.prototype._getCancelButton = function () {
            return $("#" + this._objId + "Cancel");
        };
        DataEditDialog.prototype._getRefreshButton = function () {
            return $("#" + this._objId + "Refresh");
        };
        DataEditDialog.prototype._getAllButtons = function () {
            return [this._getOkButton(), this._getCancelButton(), this._getRefreshButton()];
        };
        DataEditDialog.prototype._disableButtons = function (isDisable) {
            var btns = this._getAllButtons();
            btns.forEach(function ($btn) {
                $btn.prop("disabled", !!isDisable);
            });
        };
        DataEditDialog.prototype._onOk = function () {
            var self = this, canCommit, action = 0;
            if (!!this._fn_OnOK) {
                action = this._fn_OnOK(this);
            }
            if (action === 1)
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
                    var title_1 = this.title;
                    this.title = langMOD.STRS.TEXT.txtSubmitting;
                    var promise = this._fn_submitOnOK();
                    promise.always(function () {
                        self._disableButtons(false);
                        self.title = title_1;
                    });
                    promise.then(function () {
                        self._result = "ok";
                        self.hide();
                    }, function () {
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
        };
        DataEditDialog.prototype._onCancel = function () {
            var action = 0;
            if (!!this._fn_OnCancel) {
                action = this._fn_OnCancel(this);
            }
            if (action === 1)
                return;
            if (!!this._isEditable)
                this._isEditable.cancelEdit();
            this._result = "cancel";
            this.hide();
        };
        DataEditDialog.prototype._onRefresh = function () {
            var args = { isHandled: false };
            this.raiseEvent(DLG_EVENTS.refresh, args);
            if (args.isHandled)
                return;
            var dctx = this._dataContext;
            if (!!dctx) {
                if (checks.isFunc(dctx.refresh)) {
                    dctx.refresh();
                }
                else if (!!dctx._aspect && checks.isFunc(dctx._aspect.refresh)) {
                    dctx._aspect.refresh();
                }
            }
        };
        DataEditDialog.prototype._onClose = function () {
            try {
                if (this._result !== "ok" && !!this._dataContext) {
                    if (!!this._isEditable) {
                        this._isEditable.cancelEdit();
                    }
                    if (this._submitOnOK) {
                        var subm = utils_1.Utils.getSubmittable(this._dataContext);
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
            var csel = this._currentSelectable;
            this._currentSelectable = null;
            setTimeout(function () { bootstrap_1.bootstrap.currentSelectable = csel; csel = null; }, 0);
        };
        DataEditDialog.prototype._onShow = function () {
            this._currentSelectable = bootstrap_1.bootstrap.currentSelectable;
            if (!!this._fn_OnShow) {
                this._fn_OnShow(this);
            }
        };
        DataEditDialog.prototype.show = function () {
            var self = this;
            self._result = null;
            self._$dlgEl.dialog("option", "buttons", this._getButtons());
            this._templateDeferred.promise().then(function (template) {
                template.dataContext = self._dataContext;
                self._onShow();
                self._$dlgEl.dialog("open");
            });
        };
        DataEditDialog.prototype.hide = function () {
            var self = this;
            if (!self._$dlgEl)
                return;
            self._$dlgEl.dialog("close");
        };
        DataEditDialog.prototype.getOption = function (name) {
            if (!this._$dlgEl)
                return undefined;
            return this._$dlgEl.dialog("option", name);
        };
        DataEditDialog.prototype.setOption = function (name, value) {
            var self = this;
            self._$dlgEl.dialog("option", name, value);
        };
        DataEditDialog.prototype.destroy = function () {
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
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(DataEditDialog.prototype, "app", {
            get: function () { return this._app; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "dataContext", {
            get: function () { return this._dataContext; },
            set: function (v) {
                if (v !== this._dataContext) {
                    this._dataContext = v;
                    this._updateIsEditable();
                    this.raisePropertyChanged(PROP_NAME.dataContext);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "result", {
            get: function () { return this._result; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "template", {
            get: function () { return this._template; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "isSubmitOnOK", {
            get: function () { return this._submitOnOK; },
            set: function (v) {
                if (this._submitOnOK !== v) {
                    this._submitOnOK = v;
                    this.raisePropertyChanged(PROP_NAME.isSubmitOnOK);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "width", {
            get: function () { return this.getOption("width"); },
            set: function (v) {
                var x = this.getOption("width");
                if (v !== x) {
                    this.setOption("width", v);
                    this.raisePropertyChanged(PROP_NAME.width);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "height", {
            get: function () { return this.getOption("height"); },
            set: function (v) {
                var x = this.getOption("height");
                if (v !== x) {
                    this.setOption("height", v);
                    this.raisePropertyChanged(PROP_NAME.height);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "title", {
            get: function () { return this.getOption("title"); },
            set: function (v) {
                var x = this.getOption("title");
                if (v !== x) {
                    this.setOption("title", v);
                    this.raisePropertyChanged(PROP_NAME.title);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "canRefresh", {
            get: function () { return this._canRefresh; },
            set: function (v) {
                var x = this._canRefresh;
                if (v !== x) {
                    this._canRefresh = v;
                    this.raisePropertyChanged(PROP_NAME.canRefresh);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "canCancel", {
            get: function () { return this._canCancel; },
            set: function (v) {
                var x = this._canCancel;
                if (v !== x) {
                    this._canCancel = v;
                    this.raisePropertyChanged(PROP_NAME.canCancel);
                }
            },
            enumerable: true,
            configurable: true
        });
        return DataEditDialog;
    }(object_1.BaseObject));
    exports.DataEditDialog = DataEditDialog;
    var DialogVM = (function (_super) {
        __extends(DialogVM, _super);
        function DialogVM(app) {
            _super.call(this, app);
            this._factories = {};
            this._dialogs = {};
        }
        DialogVM.prototype.createDialog = function (name, options) {
            var self = this;
            this._factories[name] = function () {
                var dialog = self._dialogs[name];
                if (!dialog) {
                    dialog = new DataEditDialog(self.app, options);
                    self._dialogs[name] = dialog;
                }
                return dialog;
            };
            return this._factories[name];
        };
        DialogVM.prototype.showDialog = function (name, dataContext) {
            var dlg = this.getDialog(name);
            if (!dlg)
                throw new Error(strUtils.format("Invalid Dialog name:  {0}", name));
            dlg.dataContext = dataContext;
            dlg.show();
            return dlg;
        };
        DialogVM.prototype.getDialog = function (name) {
            var factory = this._factories[name];
            if (!factory)
                return null;
            return factory();
        };
        DialogVM.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this, keys = Object.keys(this._dialogs);
            keys.forEach(function (key) {
                self._dialogs[key].destroy();
            });
            this._factories = {};
            this._dialogs = {};
            _super.prototype.destroy.call(this);
        };
        return DialogVM;
    }(mvvm_1.ViewModel));
    exports.DialogVM = DialogVM;
});
define("jriapp_ui/dynacontent", ["require", "exports", "jriapp_utils/utils", "jriapp_core/bootstrap", "jriapp_elview/elview"], function (require, exports, utils_2, bootstrap_2, elview_1) {
    "use strict";
    var checks = utils_2.Utils.check, strUtils = utils_2.Utils.str, coreUtils = utils_2.Utils.core;
    var PROP_NAME = {
        template: "template",
        templateID: "templateID",
        dataContext: "dataContext",
        animation: "animation"
    };
    var DynaContentElView = (function (_super) {
        __extends(DynaContentElView, _super);
        function DynaContentElView(options) {
            _super.call(this, options);
            this._dataContext = null;
            this._prevTemplateID = null;
            this._templateID = null;
            this._template = null;
            this._animation = null;
        }
        DynaContentElView.prototype.templateLoading = function (template) {
            if (this.getIsDestroyCalled())
                return;
            var isFirstShow = !this._prevTemplateID, canShow = !!this._animation && (this._animation.isAnimateFirstShow || (!this._animation.isAnimateFirstShow && !isFirstShow));
            if (canShow) {
                this._animation.beforeShow(template, isFirstShow);
            }
        };
        DynaContentElView.prototype.templateLoaded = function (template, error) {
            if (this.getIsDestroyCalled())
                return;
            if (!utils_2.Utils.dom.isContained(template.el, this.el)) {
                this.el.appendChild(template.el);
            }
            var isFirstShow = !this._prevTemplateID, canShow = !!this._animation && (this._animation.isAnimateFirstShow || (!this._animation.isAnimateFirstShow && !isFirstShow));
            if (canShow) {
                this._animation.show(template, isFirstShow);
            }
        };
        DynaContentElView.prototype.templateUnLoading = function (template) {
        };
        DynaContentElView.prototype._templateChanging = function (oldName, newName) {
            var self = this;
            try {
                if (!newName && !!this._template) {
                    if (!!this._animation && !!this._template.loadedElem) {
                        this._animation.stop();
                        this._animation.beforeHide(this._template);
                        this._animation.hide(this._template).always(function () {
                            if (self.getIsDestroyCalled())
                                return;
                            self._template.destroy();
                            self._template = null;
                            self.raisePropertyChanged(PROP_NAME.template);
                        });
                    }
                    else {
                        self._template.destroy();
                        self._template = null;
                        self.raisePropertyChanged(PROP_NAME.template);
                    }
                    return;
                }
            }
            catch (ex) {
                this.handleError(ex, this);
                utils_2.ERROR.throwDummy(ex);
            }
            try {
                if (!this._template) {
                    this._template = this.app.createTemplate(this._dataContext, this);
                    this._template.templateID = newName;
                    self.raisePropertyChanged(PROP_NAME.template);
                    return;
                }
                if (!!this._animation && !!this._template.loadedElem) {
                    this._animation.stop();
                    this._animation.beforeHide(this._template);
                    this._animation.hide(this._template).always(function () {
                        if (self.getIsDestroyCalled())
                            return;
                        self._template.templateID = newName;
                    });
                }
                else
                    self._template.templateID = newName;
            }
            catch (ex) {
                this.handleError(ex, this);
                utils_2.ERROR.throwDummy(ex);
            }
        };
        DynaContentElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var a = this._animation;
            this._animation = null;
            var t = this._template;
            this._template = null;
            if (checks.isBaseObject(a)) {
                a.destroy();
            }
            if (!!t) {
                t.destroy();
            }
            this._dataContext = null;
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(DynaContentElView.prototype, "template", {
            get: function () { return this._template; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DynaContentElView.prototype, "templateID", {
            get: function () {
                return this._templateID;
            },
            set: function (v) {
                var old = this._templateID;
                if (old !== v) {
                    this._prevTemplateID = this._templateID;
                    this._templateID = v;
                    this._templateChanging(old, v);
                    this.raisePropertyChanged(PROP_NAME.templateID);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DynaContentElView.prototype, "dataContext", {
            get: function () { return this._dataContext; },
            set: function (v) {
                if (this._dataContext !== v) {
                    this._dataContext = v;
                    if (!!this._template) {
                        this._template.dataContext = this._dataContext;
                    }
                    this.raisePropertyChanged(PROP_NAME.dataContext);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DynaContentElView.prototype, "animation", {
            get: function () { return this._animation; },
            set: function (v) {
                if (this._animation !== v) {
                    this._animation = v;
                    this.raisePropertyChanged(PROP_NAME.animation);
                }
            },
            enumerable: true,
            configurable: true
        });
        return DynaContentElView;
    }(elview_1.BaseElView));
    exports.DynaContentElView = DynaContentElView;
    bootstrap_2.bootstrap.registerElView("dynacontent", DynaContentElView);
});
define("jriapp_ui/datagrid/const", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.COLUMN_TYPE = {
        DATA: "data",
        ROW_EXPANDER: "row_expander",
        ROW_ACTIONS: "row_actions",
        ROW_SELECTOR: "row_selector"
    };
    (function (ROW_POSITION) {
        ROW_POSITION[ROW_POSITION["Up"] = 0] = "Up";
        ROW_POSITION[ROW_POSITION["Bottom"] = 1] = "Bottom";
        ROW_POSITION[ROW_POSITION["Details"] = 2] = "Details";
    })(exports.ROW_POSITION || (exports.ROW_POSITION = {}));
    var ROW_POSITION = exports.ROW_POSITION;
    (function (ROW_ACTION) {
        ROW_ACTION[ROW_ACTION["OK"] = 0] = "OK";
        ROW_ACTION[ROW_ACTION["EDIT"] = 1] = "EDIT";
        ROW_ACTION[ROW_ACTION["CANCEL"] = 2] = "CANCEL";
        ROW_ACTION[ROW_ACTION["DELETE"] = 3] = "DELETE";
    })(exports.ROW_ACTION || (exports.ROW_ACTION = {}));
    var ROW_ACTION = exports.ROW_ACTION;
    exports.css = {
        container: "ria-table-container",
        dataTable: "ria-data-table",
        columnInfo: "ria-col-info",
        column: "ria-col-ex",
        headerDiv: "ria-table-header",
        wrapDiv: "ria-table-wrap",
        dataColumn: "ria-data-column",
        dataCell: "ria-data-cell",
        rowCollapsed: "ria-row-collapsed",
        rowExpanded: "ria-row-expanded",
        rowExpander: "ria-row-expander",
        columnSelected: "ria-col-selected",
        rowActions: "ria-row-actions",
        rowDetails: "ria-row-details",
        rowSelector: "ria-row-selector",
        rowHighlight: "ria-row-highlight",
        rowDeleted: "ria-row-deleted",
        rowError: "ria-row-error",
        fillVSpace: "ria-fill-vspace",
        nobr: "ria-nobr",
        colSortable: "ria-sortable",
        colSortAsc: "ria-sort-asc",
        colSortDesc: "ria-sort-desc"
    };
    exports.actionsSelector = 'span[data-role="row-action"]';
    exports.editSelector = '*[data-name="img_edit"]';
    exports.deleteSelector = '*[data-name="img_delete"]';
    exports.txtMap = {
        img_ok: "txtOk",
        img_cancel: "txtCancel",
        img_edit: "txtEdit",
        img_delete: "txtDelete"
    };
    exports.PROP_NAME = {
        isCurrent: "isCurrent",
        isSelected: "isSelected",
        sortOrder: "sortOrder",
        checked: "checked",
        editingRow: "editingRow",
        dataSource: "dataSource",
        currentRow: "currentRow",
        grid: "grid",
        animation: "animation",
        stateProvider: "stateProvider"
    };
});
define("jriapp_ui/datagrid/animation", ["require", "exports", "jriapp_core/object"], function (require, exports, object_2) {
    "use strict";
    var DefaultAnimation = (function (_super) {
        __extends(DefaultAnimation, _super);
        function DefaultAnimation() {
            _super.call(this);
            this._$el = null;
        }
        DefaultAnimation.prototype.beforeShow = function (el) {
            this.stop();
            this._$el = $(el);
            this._$el.hide();
        };
        DefaultAnimation.prototype.show = function (onEnd) {
            this._$el.slideDown(400, onEnd);
        };
        DefaultAnimation.prototype.beforeHide = function (el) {
            this.stop();
            this._$el = $(el);
        };
        DefaultAnimation.prototype.hide = function (onEnd) {
            this._$el.slideUp(400, onEnd);
        };
        DefaultAnimation.prototype.stop = function () {
            if (!!this._$el) {
                this._$el.finish();
                this._$el = null;
            }
        };
        DefaultAnimation.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            try {
                this.stop();
            }
            finally {
                _super.prototype.destroy.call(this);
            }
        };
        return DefaultAnimation;
    }(object_2.BaseObject));
    exports.DefaultAnimation = DefaultAnimation;
});
define("jriapp_ui/datagrid/columns/base", ["require", "exports", "jriapp_core/const", "jriapp_core/object", "jriapp_utils/utils", "jriapp_elview/elview", "jriapp_core/bootstrap", "jriapp_ui/datagrid/const"], function (require, exports, const_1, object_3, utils_3, elview_2, bootstrap_3, const_2) {
    "use strict";
    var $ = utils_3.Utils.dom.$;
    var BaseColumn = (function (_super) {
        __extends(BaseColumn, _super);
        function BaseColumn(grid, options) {
            _super.call(this);
            var self = this;
            this._grid = grid;
            this._th = options.th;
            this._options = options.colInfo;
            this._isSelected = false;
            this._objId = "col" + utils_3.Utils.core.getNewID();
            this._event_scope = ["td[", const_1.DATA_ATTR.DATA_EVENT_SCOPE, '="', this._objId, '"]'].join("");
            var colDiv = document.createElement("div");
            this._$col = $(colDiv);
            this._$col.addClass(const_2.css.column);
            this._$col.click(function (e) {
                e.stopPropagation();
                bootstrap_3.bootstrap.currentSelectable = grid;
                grid._getInternal().setCurrentColumn(self);
                self._onColumnClicked();
            });
            this._grid._getInternal().get$Header().append(colDiv);
            var $table = this.grid.$table;
            $table.on("click", this._event_scope, function (e) {
                e.stopPropagation();
                var $td = $(this), cell = $td.data("cell");
                if (!!cell) {
                    bootstrap_3.bootstrap.currentSelectable = grid;
                    grid._getInternal().setCurrentColumn(self);
                    cell.click();
                }
            });
            var $th = $(this._th);
            if (!!this._options.width) {
                $th.css("width", this._options.width);
            }
            if (!!this._options.templateID) {
                this._template = this.grid.app.createTemplate(this.grid.app, this);
                this._template.templateID = this._options.templateID;
                this._$col.append(this._template.el);
            }
            else if (!!this._options.title) {
                this._$col.html(this._options.title);
            }
            if (!!this._options.tip) {
                elview_2.fn_addToolTip(this._$col, this._options.tip, false, "bottom center");
            }
            if (!!this._options.colCellCss) {
                this._$col.addClass(this._options.colCellCss);
            }
        }
        BaseColumn.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var $table = this.grid.$table;
            $table.off("click", this._event_scope);
            if (!!this._options.tip) {
                elview_2.fn_addToolTip(this._$col, null);
            }
            if (!!this._template) {
                $(this._template.el).remove();
                this._template.destroy();
                this._template = null;
            }
            this._$col.empty();
            this._$col = null;
            this._th = null;
            this._grid = null;
            this._options = null;
            _super.prototype.destroy.call(this);
        };
        BaseColumn.prototype.templateLoading = function (template) {
        };
        BaseColumn.prototype.templateLoaded = function (template, error) {
        };
        BaseColumn.prototype.templateUnLoading = function (template) {
        };
        BaseColumn.prototype.scrollIntoView = function (isUp) {
            if (!this._$col)
                return;
            var div = this._$col.get(0);
            div.scrollIntoView(!!isUp);
        };
        BaseColumn.prototype._onColumnClicked = function () {
        };
        BaseColumn.prototype.toString = function () {
            return "BaseColumn";
        };
        Object.defineProperty(BaseColumn.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "th", {
            get: function () { return this._th; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "$col", {
            get: function () { return this._$col; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "grid", {
            get: function () { return this._grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "options", {
            get: function () { return this._options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "title", {
            get: function () { return this._options.title; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "isSelected", {
            get: function () { return this._isSelected; },
            set: function (v) {
                if (this._isSelected !== v) {
                    this._isSelected = v;
                    if (this._isSelected) {
                        this._$col.addClass(const_2.css.columnSelected);
                    }
                    else
                        this._$col.removeClass(const_2.css.columnSelected);
                }
            },
            enumerable: true,
            configurable: true
        });
        return BaseColumn;
    }(object_3.BaseObject));
    exports.BaseColumn = BaseColumn;
});
define("jriapp_ui/datagrid/columns/expander", ["require", "exports", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/columns/base"], function (require, exports, const_3, base_1) {
    "use strict";
    var ExpanderColumn = (function (_super) {
        __extends(ExpanderColumn, _super);
        function ExpanderColumn(grid, options) {
            _super.call(this, grid, options);
            this.$col.addClass(const_3.css.rowExpander);
        }
        ExpanderColumn.prototype.toString = function () {
            return "ExpanderColumn";
        };
        return ExpanderColumn;
    }(base_1.BaseColumn));
    exports.ExpanderColumn = ExpanderColumn;
});
define("jriapp_ui/datagrid/cells/expander", ["require", "exports", "jriapp_utils/utils", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/base"], function (require, exports, utils_4, const_4, base_2) {
    "use strict";
    var $ = utils_4.Utils.dom.$;
    var ExpanderCell = (function (_super) {
        __extends(ExpanderCell, _super);
        function ExpanderCell(options) {
            var _this = this;
            _super.call(this, options);
            this._click.add(function () {
                _this._onCellClicked(_this._row);
            });
            var $el = $(this._td);
            $el.addClass(const_4.css.rowCollapsed);
            $el.addClass(const_4.css.rowExpander);
        }
        ExpanderCell.prototype._onCellClicked = function (row) {
            var clicked_row = row || this._row;
            if (!clicked_row)
                return;
            _super.prototype._onCellClicked.call(this, clicked_row);
            clicked_row.isExpanded = !clicked_row.isExpanded;
        };
        ExpanderCell.prototype.toggleImage = function () {
            var $el = $(this.td);
            if (this._row.isExpanded) {
                $el.removeClass(const_4.css.rowCollapsed);
                $el.addClass(const_4.css.rowExpanded);
            }
            else {
                $el.removeClass(const_4.css.rowExpanded);
                $el.addClass(const_4.css.rowCollapsed);
            }
        };
        ExpanderCell.prototype.toString = function () {
            return "ExpanderCell";
        };
        return ExpanderCell;
    }(base_2.BaseCell));
    exports.ExpanderCell = ExpanderCell;
});
define("jriapp_ui/datagrid/columns/data", ["require", "exports", "jriapp_utils/utils", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/columns/base"], function (require, exports, utils_5, const_5, base_3) {
    "use strict";
    var $ = utils_5.Utils.dom.$;
    var DataColumn = (function (_super) {
        __extends(DataColumn, _super);
        function DataColumn(grid, options) {
            _super.call(this, grid, options);
            this._objCache = {};
            this.$col.addClass(const_5.css.dataColumn);
            this._sortOrder = null;
            if (this.isSortable) {
                this.$col.addClass(const_5.css.colSortable);
            }
        }
        DataColumn.prototype._onColumnClicked = function () {
            if (this.isSortable && !!this.sortMemberName) {
                var sortOrd = this._sortOrder;
                this.grid._getInternal().resetColumnsSort();
                if (sortOrd === 0) {
                    this.sortOrder = 1;
                }
                else if (sortOrd === 1) {
                    this.sortOrder = 0;
                }
                else
                    this.sortOrder = 0;
                this.grid.sortByColumn(this);
            }
        };
        DataColumn.prototype._cacheObject = function (key, obj) {
            this._objCache[key] = obj;
        };
        DataColumn.prototype._getCachedObject = function (key) {
            return this._objCache[key];
        };
        DataColumn.prototype._getInitContentFn = function () {
            var self = this;
            return function (content) {
                content.addOnObjectCreated(function (sender, args) {
                    self._cacheObject(args.objectKey, args.object);
                    args.isCachedExternally = !!self._getCachedObject(args.objectKey);
                });
                content.addOnObjectNeeded(function (sender, args) {
                    args.object = self._getCachedObject(args.objectKey);
                });
            };
        };
        DataColumn.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this;
            utils_5.Utils.core.forEachProp(self._objCache, function (key) {
                self._objCache[key].destroy();
            });
            self._objCache = null;
            _super.prototype.destroy.call(this);
        };
        DataColumn.prototype.toString = function () {
            return "DataColumn";
        };
        Object.defineProperty(DataColumn.prototype, "isSortable", {
            get: function () { return !!(this.options.sortable); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataColumn.prototype, "sortMemberName", {
            get: function () { return this.options.sortMemberName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataColumn.prototype, "sortOrder", {
            get: function () { return this._sortOrder; },
            set: function (v) {
                this.$col.removeClass([const_5.css.colSortAsc, const_5.css.colSortDesc].join(" "));
                switch (v) {
                    case 0:
                        this.$col.addClass(const_5.css.colSortAsc);
                        break;
                    case 1:
                        this.$col.addClass(const_5.css.colSortDesc);
                        break;
                }
                this._sortOrder = v;
                this.raisePropertyChanged(const_5.PROP_NAME.sortOrder);
            },
            enumerable: true,
            configurable: true
        });
        return DataColumn;
    }(base_3.BaseColumn));
    exports.DataColumn = DataColumn;
});
define("jriapp_ui/datagrid/cells/data", ["require", "exports", "jriapp_core/lang", "jriapp_content/factory", "jriapp_utils/utils", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/base"], function (require, exports, lang_1, factory_1, utils_6, const_6, base_4) {
    "use strict";
    var $ = utils_6.Utils.dom.$;
    var DataCell = (function (_super) {
        __extends(DataCell, _super);
        function DataCell(options) {
            var _this = this;
            _super.call(this, options);
            this._content = null;
            this._stateCss = null;
            this._click.interval = 350;
            this._click.add(function () {
                _this._onCellClicked(_this._row);
            }, function () {
                _this._onDblClicked(_this._row);
            });
            var $el = $(this._td);
            $el.addClass(const_6.css.dataCell);
            this._initContent();
        }
        DataCell.prototype._initContent = function () {
            var contentOptions = this.column.options.content;
            if (!contentOptions.fieldInfo && !!contentOptions.fieldName) {
                contentOptions.fieldInfo = this.item._aspect.getFieldInfo(contentOptions.fieldName);
                if (!contentOptions.fieldInfo) {
                    throw new Error(utils_6.Utils.str.format(lang_1.ERRS.ERR_DBSET_INVALID_FIELDNAME, "", contentOptions.fieldName));
                }
            }
            var self = this, app = this.grid.app;
            contentOptions.initContentFn = null;
            try {
                var contentType = factory_1.contentFactories.getContentType(contentOptions);
                if (factory_1.contentFactories.isExternallyCachable(contentType)) {
                    contentOptions.initContentFn = this.column._getInitContentFn();
                }
                if (this.grid.isHasEditor) {
                    contentOptions.readOnly = true;
                }
                this._content = new contentType({
                    parentEl: this._td,
                    contentOptions: contentOptions,
                    dataContext: this.item,
                    isEditing: this.item._aspect.isEditing,
                    app: app
                });
            }
            finally {
                delete contentOptions.initContentFn;
            }
        };
        DataCell.prototype._beginEdit = function () {
            if (!this._content.isEditing) {
                this._content.isEditing = true;
            }
        };
        DataCell.prototype._endEdit = function (isCanceled) {
            if (this._content.isEditing) {
                this._content.isEditing = false;
            }
        };
        DataCell.prototype._setState = function (css) {
            if (this._stateCss !== css) {
                var $el = $(this._td);
                if (!!this._stateCss)
                    $el.removeClass(this._stateCss);
                this._stateCss = css;
                if (!!this._stateCss)
                    $el.addClass(this._stateCss);
            }
        };
        DataCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._content) {
                this._content.destroy();
                this._content = null;
            }
            _super.prototype.destroy.call(this);
        };
        DataCell.prototype.toString = function () {
            return "DataCell";
        };
        return DataCell;
    }(base_4.BaseCell));
    exports.DataCell = DataCell;
});
define("jriapp_ui/datagrid/columns/actions", ["require", "exports", "jriapp_core/const", "jriapp_utils/utils", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/columns/base"], function (require, exports, const_7, utils_7, const_8, base_5) {
    "use strict";
    var $ = utils_7.Utils.dom.$;
    var ActionsColumn = (function (_super) {
        __extends(ActionsColumn, _super);
        function ActionsColumn(grid, options) {
            _super.call(this, grid, options);
            var self = this, opts = this.options;
            this._event_act_scope = ["span[", const_7.DATA_ATTR.DATA_EVENT_SCOPE, '="', this.uniqueID, '"]'].join("");
            this.$col.addClass(const_8.css.rowActions);
            var $table = this.grid.$table;
            $table.on("click", this._event_act_scope, function (e) {
                e.stopPropagation();
                var $img = $(this), name = $img.attr(const_7.DATA_ATTR.DATA_NAME), cell = $img.data("cell");
                self.grid.currentRow = cell.row;
                switch (name) {
                    case "img_ok":
                        self._onOk(cell);
                        break;
                    case "img_cancel":
                        self._onCancel(cell);
                        break;
                    case "img_edit":
                        self._onEdit(cell);
                        break;
                    case "img_delete":
                        self._onDelete(cell);
                        break;
                }
            });
            this.grid.addOnRowAction(function (sender, args) {
                switch (args.action) {
                    case 0:
                        self._onOk(args.row.actionsCell);
                        break;
                    case 1:
                        self._onEdit(args.row.actionsCell);
                        break;
                    case 2:
                        self._onCancel(args.row.actionsCell);
                        break;
                    case 3:
                        self._onDelete(args.row.actionsCell);
                        break;
                }
            }, this.uniqueID);
        }
        ActionsColumn.prototype._onOk = function (cell) {
            if (!cell.row)
                return;
            cell.row.endEdit();
            cell.update();
        };
        ActionsColumn.prototype._onCancel = function (cell) {
            if (!cell.row)
                return;
            cell.row.cancelEdit();
            cell.update();
        };
        ActionsColumn.prototype._onDelete = function (cell) {
            if (!cell.row)
                return;
            cell.row.deleteRow();
        };
        ActionsColumn.prototype._onEdit = function (cell) {
            if (!cell.row)
                return;
            cell.row.beginEdit();
            cell.update();
            this.grid.showEditDialog();
        };
        ActionsColumn.prototype.toString = function () {
            return "ActionsColumn";
        };
        ActionsColumn.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var $table = this.grid.$table;
            $table.off("click", this._event_act_scope);
            this.grid.removeNSHandlers(this.uniqueID);
            _super.prototype.destroy.call(this);
        };
        return ActionsColumn;
    }(base_5.BaseColumn));
    exports.ActionsColumn = ActionsColumn;
});
define("jriapp_ui/datagrid/cells/actions", ["require", "exports", "jriapp_core/const", "jriapp_core/lang", "jriapp_core/shared", "jriapp_elview/elview", "jriapp_utils/utils", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/base"], function (require, exports, const_9, lang_2, shared_1, elview_3, utils_8, const_10, base_6) {
    "use strict";
    var $ = utils_8.Utils.dom.$, strUtils = utils_8.Utils.str;
    var _editImages = '<span data-role="row-action" data-name="img_ok" class="{0}"></span><span data-role="row-action" data-name="img_cancel" class="{1}"></span>';
    var _viewImages = '<span data-role="row-action" data-name="img_edit" class="{0}"></span><span data-role="row-action" data-name="img_delete" class="{1}"></span>';
    var editImages = undefined, viewImages = undefined;
    var ActionsCell = (function (_super) {
        __extends(ActionsCell, _super);
        function ActionsCell(options) {
            _super.call(this, options);
            var $el = $(this._td);
            $el.addClass([const_10.css.rowActions, const_10.css.nobr].join(" "));
            this._createButtons(this._row.isEditing);
        }
        ActionsCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var $el = $(this._td);
            var $imgs = $el.find(const_10.actionsSelector);
            $imgs.each(function (index, img) {
                var $img = $(img);
                $img.removeData();
            });
            _super.prototype.destroy.call(this);
        };
        ActionsCell.prototype._setupImages = function ($images) {
            var self = this;
            $images.each(function (index, img) {
                var $img = $(img);
                $img.data("cell", self);
                var name = $img.attr(const_9.DATA_ATTR.DATA_NAME);
                elview_3.fn_addToolTip($img, lang_2.STRS.TEXT[const_10.txtMap[name]]);
                $img.attr(const_9.DATA_ATTR.DATA_EVENT_SCOPE, self._column.uniqueID);
            });
        };
        Object.defineProperty(ActionsCell.prototype, "editImages", {
            get: function () {
                if (!editImages)
                    editImages = strUtils.format(_editImages, shared_1.ButtonCss.OK, shared_1.ButtonCss.Cancel);
                return editImages;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionsCell.prototype, "viewImages", {
            get: function () {
                if (!viewImages)
                    viewImages = strUtils.format(_viewImages, shared_1.ButtonCss.Edit, shared_1.ButtonCss.Delete);
                return viewImages;
            },
            enumerable: true,
            configurable: true
        });
        ActionsCell.prototype._createButtons = function (isEditing) {
            if (!this._td)
                return;
            var self = this, $el = $(this._td), $newElems;
            $el.empty();
            if (isEditing) {
                self._isEditing = true;
                $newElems = $(self.editImages);
                self._setupImages($newElems.filter(const_10.actionsSelector));
            }
            else {
                self._isEditing = false;
                $newElems = $(self.viewImages);
                if (!self.isCanEdit) {
                    $newElems = $newElems.not(const_10.editSelector);
                }
                if (!self.isCanDelete) {
                    $newElems = $newElems.not(const_10.deleteSelector);
                }
                self._setupImages($newElems.filter(const_10.actionsSelector));
            }
            $el.append($newElems);
        };
        ActionsCell.prototype.update = function () {
            if (!this._row)
                return;
            if (this._isEditing !== this._row.isEditing) {
                this._createButtons(this._row.isEditing);
            }
        };
        ActionsCell.prototype.toString = function () {
            return "ActionsCell";
        };
        Object.defineProperty(ActionsCell.prototype, "isCanEdit", {
            get: function () { return this.grid.isCanEdit; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionsCell.prototype, "isCanDelete", {
            get: function () { return this.grid.isCanDelete; },
            enumerable: true,
            configurable: true
        });
        return ActionsCell;
    }(base_6.BaseCell));
    exports.ActionsCell = ActionsCell;
});
define("jriapp_ui/datagrid/columns/rowselector", ["require", "exports", "jriapp_utils/utils", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/columns/base"], function (require, exports, utils_9, const_11, base_7) {
    "use strict";
    var $ = utils_9.Utils.dom.$;
    var RowSelectorColumn = (function (_super) {
        __extends(RowSelectorColumn, _super);
        function RowSelectorColumn(grid, options) {
            _super.call(this, grid, options);
            var self = this;
            this._val = false;
            this.$col.addClass(const_11.css.rowSelector);
            var $chk = $('<input type="checkbox"/>');
            this.$col.append($chk);
            this._$chk = $chk;
            $chk.click(function (e) {
                e.stopPropagation();
                self._onCheckBoxClicked(this.checked);
            });
            $chk.on("change", function (e) {
                e.stopPropagation();
                self.checked = this.checked;
            });
        }
        RowSelectorColumn.prototype._onCheckBoxClicked = function (isChecked) {
            this.grid.selectRows(isChecked);
        };
        RowSelectorColumn.prototype.toString = function () {
            return "RowSelectorColumn";
        };
        Object.defineProperty(RowSelectorColumn.prototype, "checked", {
            get: function () { return this._val; },
            set: function (v) {
                var $el = this._$chk;
                if (v !== null)
                    v = !!v;
                if (v !== this._val) {
                    this._val = v;
                    if (!!$el)
                        $el.prop("checked", !!this._val);
                    this.raisePropertyChanged(const_11.PROP_NAME.checked);
                }
            },
            enumerable: true,
            configurable: true
        });
        RowSelectorColumn.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._$chk.off();
            this._$chk.remove();
            this._$chk = null;
            _super.prototype.destroy.call(this);
        };
        return RowSelectorColumn;
    }(base_7.BaseColumn));
    exports.RowSelectorColumn = RowSelectorColumn;
});
define("jriapp_ui/datagrid/cells/rowselector", ["require", "exports", "jriapp_content/bool", "jriapp_utils/utils", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/base"], function (require, exports, bool_1, utils_10, const_12, base_8) {
    "use strict";
    var $ = utils_10.Utils.dom.$;
    var RowSelectContent = (function (_super) {
        __extends(RowSelectContent, _super);
        function RowSelectContent() {
            _super.apply(this, arguments);
        }
        RowSelectContent.prototype.getIsCanBeEdited = function () {
            return true;
        };
        RowSelectContent.prototype.toString = function () {
            return "RowSelectContent";
        };
        return RowSelectContent;
    }(bool_1.BoolContent));
    var RowSelectorCell = (function (_super) {
        __extends(RowSelectorCell, _super);
        function RowSelectorCell(options) {
            _super.call(this, options);
            this._content = null;
            var $el = $(this._td);
            $el.addClass(const_12.css.rowSelector);
            this._init();
        }
        RowSelectorCell.prototype._init = function () {
            var bindInfo = {
                target: null, source: null,
                targetPath: null, sourcePath: const_12.PROP_NAME.isSelected,
                mode: "TwoWay",
                converter: null, converterParam: null
            };
            var contentOpts = {
                fieldName: const_12.PROP_NAME.isSelected,
                bindingInfo: bindInfo,
                displayInfo: null
            };
            this._content = new RowSelectContent({
                parentEl: this._td,
                contentOptions: contentOpts,
                dataContext: this.row,
                isEditing: true,
                app: this.grid.app
            });
        };
        RowSelectorCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._content) {
                this._content.destroy();
                this._content = null;
            }
            _super.prototype.destroy.call(this);
        };
        RowSelectorCell.prototype.toString = function () {
            return "RowSelectorCell";
        };
        return RowSelectorCell;
    }(base_8.BaseCell));
    exports.RowSelectorCell = RowSelectorCell;
});
define("jriapp_ui/datagrid/rows/row", ["require", "exports", "jriapp_core/object", "jriapp_utils/utils", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/expander", "jriapp_ui/datagrid/cells/data", "jriapp_ui/datagrid/cells/actions", "jriapp_ui/datagrid/cells/rowselector", "jriapp_ui/datagrid/columns/expander", "jriapp_ui/datagrid/columns/actions", "jriapp_ui/datagrid/columns/rowselector"], function (require, exports, object_4, utils_11, const_13, expander_1, data_1, actions_1, rowselector_1, expander_2, actions_2, rowselector_2) {
    "use strict";
    var $ = utils_11.Utils.dom.$, document = utils_11.Utils.dom.document;
    var Row = (function (_super) {
        __extends(Row, _super);
        function Row(grid, options) {
            _super.call(this);
            var self = this;
            this._grid = grid;
            this._tr = options.tr;
            this._item = options.item;
            this._$tr = $(this._tr);
            this._cells = null;
            this._objId = "rw" + utils_11.Utils.core.getNewID();
            this._expanderCell = null;
            this._actionsCell = null;
            this._rowSelectorCell = null;
            this._isCurrent = false;
            this._isDeleted = false;
            this._isSelected = false;
            this._isDetached = false;
            this._createCells();
            this._isDeleted = this._item._aspect.isDeleted;
            var fn_state = function () {
                var css = self._grid._getInternal().onRowStateChanged(self, self._item[self._grid.options.rowStateField]);
                self._setState(css);
            };
            if (!!this.isHasStateField) {
                this._item.addOnPropertyChange(this._grid.options.rowStateField, function (s, a) {
                    fn_state();
                }, this._objId);
                fn_state();
            }
        }
        Row.prototype.handleError = function (error, source) {
            var isHandled = _super.prototype.handleError.call(this, error, source);
            if (!isHandled) {
                return this.grid.handleError(error, source);
            }
            return isHandled;
        };
        Row.prototype._createCells = function () {
            var self = this, i = 0;
            self._cells = new Array(this.columns.length);
            this.columns.forEach(function (col) {
                self._cells[i] = self._createCell(col, i);
                i += 1;
            });
        };
        Row.prototype._createCell = function (col, num) {
            var self = this, td = document.createElement("td"), cell;
            if (col instanceof expander_2.ExpanderColumn) {
                this._expanderCell = new expander_1.ExpanderCell({ row: self, td: td, column: col, num: num });
                cell = this._expanderCell;
            }
            else if (col instanceof actions_2.ActionsColumn) {
                this._actionsCell = new actions_1.ActionsCell({ row: self, td: td, column: col, num: num });
                cell = this._actionsCell;
            }
            else if (col instanceof rowselector_2.RowSelectorColumn) {
                this._rowSelectorCell = new rowselector_1.RowSelectorCell({ row: self, td: td, column: col, num: num });
                cell = this._rowSelectorCell;
            }
            else
                cell = new data_1.DataCell({ row: self, td: td, column: col, num: num });
            return cell;
        };
        Row.prototype._setState = function (css) {
            for (var i = 0, len = this._cells.length; i < len; i++) {
                var cell = this._cells[i];
                if (cell instanceof data_1.DataCell) {
                    cell._setState(css);
                }
            }
        };
        Row.prototype._onBeginEdit = function () {
            var self = this;
            self._cells.forEach(function (cell) {
                if (cell instanceof data_1.DataCell) {
                    cell._beginEdit();
                }
            });
            if (!!this._actionsCell)
                this._actionsCell.update();
        };
        Row.prototype._onEndEdit = function (isCanceled) {
            var self = this;
            self._cells.forEach(function (cell) {
                if (cell instanceof data_1.DataCell) {
                    cell._endEdit(isCanceled);
                }
            });
            if (!!this._actionsCell)
                this._actionsCell.update();
        };
        Row.prototype.beginEdit = function () {
            return this._item._aspect.beginEdit();
        };
        Row.prototype.endEdit = function () {
            return this._item._aspect.endEdit();
        };
        Row.prototype.cancelEdit = function () {
            return this._item._aspect.cancelEdit();
        };
        Row.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var grid = this._grid;
            if (!!grid) {
                if (!this._isDetached) {
                    grid._getInternal().removeRow(this);
                }
                if (!!this._tr) {
                    this._$tr.remove();
                }
                this._cells.forEach(function (cell) {
                    cell.destroy();
                });
                this._cells = null;
            }
            if (!!this._item && !this._item.getIsDestroyCalled()) {
                this._item.removeNSHandlers(this._objId);
                if (this._item._aspect.isEditing)
                    this._item._aspect.cancelEdit();
            }
            this._item = null;
            this._expanderCell = null;
            this._tr = null;
            this._$tr = null;
            this._grid = null;
            _super.prototype.destroy.call(this);
        };
        Row.prototype.deleteRow = function () {
            this._item._aspect.deleteItem();
        };
        Row.prototype.updateErrorState = function () {
            var hasErrors = this._item._aspect.getIsHasErrors();
            var $el = $(this._tr);
            if (hasErrors) {
                $el.addClass(const_13.css.rowError);
            }
            else
                $el.removeClass(const_13.css.rowError);
        };
        Row.prototype.scrollIntoView = function (animate, pos) {
            this.grid.scrollToRow({ row: this, animate: animate, pos: pos });
        };
        Row.prototype.toString = function () {
            return "Row";
        };
        Object.defineProperty(Row.prototype, "tr", {
            get: function () { return this._tr; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "$tr", {
            get: function () { return this._$tr; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "grid", {
            get: function () { return this._grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "item", {
            get: function () { return this._item; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "cells", {
            get: function () { return this._cells; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "columns", {
            get: function () { return this._grid.columns; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "itemKey", {
            get: function () {
                if (!this._item)
                    return null;
                return this._item._key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isCurrent", {
            get: function () { return this._isCurrent; },
            set: function (v) {
                var curr = this._isCurrent;
                if (v !== curr) {
                    var $el = $(this._tr);
                    this._isCurrent = v;
                    if (v) {
                        $el.addClass(const_13.css.rowHighlight);
                    }
                    else {
                        $el.removeClass(const_13.css.rowHighlight);
                    }
                    this.raisePropertyChanged(const_13.PROP_NAME.isCurrent);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isSelected", {
            get: function () { return this._isSelected; },
            set: function (v) {
                if (this._isSelected !== v) {
                    this._isSelected = v;
                    this.raisePropertyChanged(const_13.PROP_NAME.isSelected);
                    this.grid._getInternal().onRowSelectionChanged(this);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isExpanded", {
            get: function () { return this.grid._getInternal().isRowExpanded(this); },
            set: function (v) {
                if (v !== this.isExpanded) {
                    if (!v && this.isExpanded) {
                        this.grid._getInternal().expandDetails(this, false);
                    }
                    else if (v) {
                        this.grid._getInternal().expandDetails(this, true);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "expanderCell", {
            get: function () { return this._expanderCell; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "actionsCell", {
            get: function () { return this._actionsCell; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isDeleted", {
            get: function () {
                if (!this._tr)
                    return true;
                return this._isDeleted;
            },
            set: function (v) {
                if (!this._tr)
                    return;
                if (this._isDeleted !== v) {
                    this._isDeleted = v;
                    if (this._isDeleted) {
                        this.isExpanded = false;
                        $(this._tr).addClass(const_13.css.rowDeleted);
                    }
                    else
                        $(this._tr).removeClass(const_13.css.rowDeleted);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isDetached", {
            get: function () {
                return this._isDetached;
            },
            set: function (v) {
                this._isDetached = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isEditing", {
            get: function () { return !!this._item && this._item._aspect.isEditing; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isHasStateField", {
            get: function () { return !!this._grid.options.rowStateField; },
            enumerable: true,
            configurable: true
        });
        return Row;
    }(object_4.BaseObject));
    exports.Row = Row;
});
define("jriapp_ui/datagrid/cells/base", ["require", "exports", "jriapp_core/const", "jriapp_core/object", "jriapp_utils/utils"], function (require, exports, const_14, object_5, utils_12) {
    "use strict";
    var $ = utils_12.Utils.dom.$;
    var BaseCell = (function (_super) {
        __extends(BaseCell, _super);
        function BaseCell(options) {
            _super.call(this);
            this._isEditing = false;
            options = utils_12.Utils.core.extend({
                row: null,
                td: null,
                column: null,
                num: 0
            }, options);
            this._row = options.row;
            this._td = options.td;
            this._column = options.column;
            this._num = options.num;
            var $td = $(this._td);
            $td.attr(const_14.DATA_ATTR.DATA_EVENT_SCOPE, this._column.uniqueID);
            $td.data("cell", this);
            if (!!this._column.options.rowCellCss) {
                $td.addClass(this._column.options.rowCellCss);
            }
            this._click = new utils_12.DblClick();
            this._row.tr.appendChild(this._td);
        }
        BaseCell.prototype._onCellClicked = function (row) {
        };
        BaseCell.prototype._onDblClicked = function (row) {
            this.grid._getInternal().onCellDblClicked(this);
        };
        BaseCell.prototype.handleError = function (error, source) {
            var isHandled = _super.prototype.handleError.call(this, error, source);
            if (!isHandled) {
                return this.row.handleError(error, source);
            }
            return isHandled;
        };
        BaseCell.prototype.click = function () {
            this.grid.currentRow = this._row;
            this._click.click();
        };
        BaseCell.prototype.scrollIntoView = function () {
            this.row.scrollIntoView();
        };
        BaseCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._click) {
                this._click.destroy();
                this._click = null;
            }
            var $td = $(this._td);
            $td.removeData();
            $td.off();
            $td.empty();
            this._row = null;
            this._td = null;
            this._column = null;
            _super.prototype.destroy.call(this);
        };
        BaseCell.prototype.toString = function () {
            return "BaseCell";
        };
        Object.defineProperty(BaseCell.prototype, "td", {
            get: function () { return this._td; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "row", {
            get: function () { return this._row; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "column", {
            get: function () { return this._column; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "grid", {
            get: function () { return this._row.grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "item", {
            get: function () { return this._row.item; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "uniqueID", {
            get: function () { return this._row.uniqueID + "_" + this._num; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "num", {
            get: function () { return this._num; },
            enumerable: true,
            configurable: true
        });
        return BaseCell;
    }(object_5.BaseObject));
    exports.BaseCell = BaseCell;
});
define("jriapp_ui/datagrid/rows/details", ["require", "exports", "jriapp_core/object", "jriapp_utils/utils", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/details"], function (require, exports, object_6, utils_13, const_15, details_1) {
    "use strict";
    var checks = utils_13.Utils.check, strUtils = utils_13.Utils.str, coreUtils = utils_13.Utils.core, ArrayHelper = utils_13.Utils.arr;
    var $ = utils_13.DomUtils.$, document = utils_13.DomUtils.document;
    var DetailsRow = (function (_super) {
        __extends(DetailsRow, _super);
        function DetailsRow(options) {
            _super.call(this);
            var self = this;
            this._grid = options.grid;
            this._tr = options.tr;
            this._item = null;
            this._cell = null;
            this._parentRow = null;
            this._isFirstShow = true;
            this._objId = "drw" + coreUtils.getNewID();
            this._createCell(options.details_id);
            this._$tr = $(this._tr);
            this._$tr.addClass(const_15.css.rowDetails);
            this._grid.addOnRowExpanded(function (sender, args) {
                if (!args.isExpanded && !!args.collapsedRow)
                    self._setParentRow(null);
            }, this._objId, this);
        }
        DetailsRow.prototype._createCell = function (details_id) {
            var td = document.createElement("td");
            this._cell = new details_1.DetailsCell({ row: this, td: td, details_id: details_id });
        };
        DetailsRow.prototype._setParentRow = function (row) {
            var self = this;
            this._item = null;
            this._cell.item = null;
            utils_13.DomUtils.removeNode(this._tr);
            if (!row || row.getIsDestroyCalled()) {
                this._parentRow = null;
                return;
            }
            this._parentRow = row;
            this._item = row.item;
            this._cell.item = this._item;
            if (this._isFirstShow)
                this._initShow();
            utils_13.DomUtils.insertAfter(row.tr, this._tr);
            this._show(function () {
                var row = self._parentRow;
                if (!row || row.getIsDestroyCalled())
                    return;
                if (self.grid.options.isUseScrollIntoDetails)
                    row.scrollIntoView(true, 2);
            });
        };
        DetailsRow.prototype._initShow = function () {
            var animation = this._grid.animation;
            animation.beforeShow(this._cell.template.el);
        };
        DetailsRow.prototype._show = function (onEnd) {
            var animation = this._grid.animation;
            this._isFirstShow = false;
            animation.beforeShow(this._cell.template.el);
            animation.show(onEnd);
        };
        DetailsRow.prototype._hide = function (onEnd) {
            var animation = this._grid.animation;
            animation.beforeHide(this._cell.template.el);
            animation.hide(onEnd);
        };
        DetailsRow.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._grid.removeNSHandlers(this._objId);
            if (!!this._cell) {
                this._cell.destroy();
                this._cell = null;
            }
            this._$tr.remove();
            this._$tr = null;
            this._item = null;
            this._tr = null;
            this._grid = null;
            _super.prototype.destroy.call(this);
        };
        DetailsRow.prototype.toString = function () {
            return "DetailsRow";
        };
        Object.defineProperty(DetailsRow.prototype, "tr", {
            get: function () { return this._tr; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "$tr", {
            get: function () { return this._$tr; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "grid", {
            get: function () { return this._grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "item", {
            get: function () { return this._item; },
            set: function (v) {
                if (this._item !== v) {
                    this._item = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "cell", {
            get: function () { return this._cell; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "itemKey", {
            get: function () {
                if (!this._item)
                    return null;
                return this._item._key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "parentRow", {
            get: function () { return this._parentRow; },
            set: function (v) {
                var self = this;
                if (v !== this._parentRow) {
                    if (!!self._parentRow) {
                        self._hide(function () {
                            self._setParentRow(v);
                        });
                    }
                    else {
                        self._setParentRow(v);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        return DetailsRow;
    }(object_6.BaseObject));
    exports.DetailsRow = DetailsRow;
});
define("jriapp_ui/datagrid/cells/details", ["require", "exports", "jriapp_core/object"], function (require, exports, object_7) {
    "use strict";
    var DetailsCell = (function (_super) {
        __extends(DetailsCell, _super);
        function DetailsCell(options) {
            _super.call(this);
            this._row = options.row;
            this._td = options.td;
            this._init(options);
        }
        DetailsCell.prototype._init = function (options) {
            var details_id = options.details_id;
            if (!details_id)
                return;
            this._td.colSpan = this.grid.columns.length;
            this._row.tr.appendChild(this._td);
            this._template = this.grid.app.createTemplate(null, this);
            this._template.templateID = details_id;
            this._td.appendChild(this._template.el);
        };
        DetailsCell.prototype.templateLoading = function (template) {
        };
        DetailsCell.prototype.templateLoaded = function (template, error) {
        };
        DetailsCell.prototype.templateUnLoading = function (template) {
        };
        DetailsCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._template) {
                this._td.removeChild(this._template.el);
                this._template.destroy();
                this._template = null;
            }
            this._row = null;
            this._td = null;
            _super.prototype.destroy.call(this);
        };
        DetailsCell.prototype.toString = function () {
            return "DetailsCell";
        };
        Object.defineProperty(DetailsCell.prototype, "td", {
            get: function () { return this._td; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsCell.prototype, "row", {
            get: function () { return this._row; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsCell.prototype, "grid", {
            get: function () { return this._row.grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsCell.prototype, "item", {
            get: function () { return this._template.dataContext; },
            set: function (v) { this._template.dataContext = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsCell.prototype, "template", {
            get: function () { return this._template; },
            enumerable: true,
            configurable: true
        });
        return DetailsCell;
    }(object_7.BaseObject));
    exports.DetailsCell = DetailsCell;
});
define("jriapp_ui/datagrid/rows/fillspace", ["require", "exports", "jriapp_core/object", "jriapp_utils/utils", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/fillspace"], function (require, exports, object_8, utils_14, const_16, fillspace_1) {
    "use strict";
    var $ = utils_14.Utils.dom.$;
    var FillSpaceRow = (function (_super) {
        __extends(FillSpaceRow, _super);
        function FillSpaceRow(options) {
            _super.call(this);
            var self = this;
            this._grid = options.grid;
            this._tr = options.tr;
            this._cell = null;
            this._createCell();
            this._$tr = $(this._tr);
            this._$tr.addClass(const_16.css.fillVSpace);
        }
        FillSpaceRow.prototype._createCell = function () {
            var td = document.createElement("td");
            this._cell = new fillspace_1.FillSpaceCell({ row: this, td: td });
        };
        FillSpaceRow.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._cell) {
                this._cell.destroy();
                this._cell = null;
            }
            this._$tr.remove();
            this._$tr = null;
            this._tr = null;
            this._grid = null;
            _super.prototype.destroy.call(this);
        };
        FillSpaceRow.prototype.toString = function () {
            return "FillSpaceRow";
        };
        FillSpaceRow.prototype.attach = function () {
            this._grid._tBodyEl.appendChild(this._tr);
        };
        FillSpaceRow.prototype.detach = function () {
            utils_14.Utils.dom.removeNode(this._tr);
        };
        Object.defineProperty(FillSpaceRow.prototype, "tr", {
            get: function () { return this._tr; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceRow.prototype, "$tr", {
            get: function () { return this._$tr; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceRow.prototype, "grid", {
            get: function () { return this._grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceRow.prototype, "cell", {
            get: function () { return this._cell; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceRow.prototype, "height", {
            get: function () { return this._cell.height; },
            set: function (v) { this._cell.height = v; },
            enumerable: true,
            configurable: true
        });
        return FillSpaceRow;
    }(object_8.BaseObject));
    exports.FillSpaceRow = FillSpaceRow;
});
define("jriapp_ui/datagrid/cells/fillspace", ["require", "exports", "jriapp_core/object", "jriapp_utils/utils", "jriapp_ui/datagrid/const"], function (require, exports, object_9, utils_15, const_17) {
    "use strict";
    var $ = utils_15.Utils.dom.$;
    var FillSpaceCell = (function (_super) {
        __extends(FillSpaceCell, _super);
        function FillSpaceCell(options) {
            _super.call(this);
            this._row = options.row;
            this._td = options.td;
            this._td.colSpan = this.grid.columns.length;
            this._row.tr.appendChild(this._td);
            this._$div = $("<div></div>");
            this._$div.addClass(const_17.css.fillVSpace);
            this._$div.appendTo(this._td);
        }
        FillSpaceCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._row = null;
            this._td = null;
            _super.prototype.destroy.call(this);
        };
        FillSpaceCell.prototype.toString = function () {
            return "FillSpaceCell";
        };
        Object.defineProperty(FillSpaceCell.prototype, "td", {
            get: function () { return this._td; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "row", {
            get: function () { return this._row; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "grid", {
            get: function () { return this._row.grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "$div", {
            get: function () { return this._$div; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "height", {
            get: function () { return this._$div.height(); },
            set: function (v) { this._$div.height(v); },
            enumerable: true,
            configurable: true
        });
        return FillSpaceCell;
    }(object_9.BaseObject));
    exports.FillSpaceCell = FillSpaceCell;
});
define("jriapp_ui/datagrid/datagrid", ["require", "exports", "jriapp_core/const", "jriapp_core/lang", "jriapp_core/object", "jriapp_utils/utils", "jriapp_core/bootstrap", "jriapp_core/parser", "jriapp_elview/elview", "jriapp_content/int", "jriapp_ui/dialog", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/animation", "jriapp_ui/datagrid/rows/row", "jriapp_ui/datagrid/rows/details", "jriapp_ui/datagrid/rows/fillspace", "jriapp_ui/datagrid/columns/expander", "jriapp_ui/datagrid/columns/data", "jriapp_ui/datagrid/columns/actions", "jriapp_ui/datagrid/columns/rowselector", "jriapp_ui/datagrid/rows/row", "jriapp_ui/datagrid/columns/base", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/animation"], function (require, exports, const_18, lang_3, object_10, utils_16, bootstrap_4, parser_1, elview_4, int_1, dialog_1, const_19, animation_1, row_1, details_2, fillspace_2, expander_3, data_2, actions_3, rowselector_3, row_2, base_9, const_20, animation_2) {
    "use strict";
    exports.DataGridRow = row_2.Row;
    exports.DataGridColumn = base_9.BaseColumn;
    exports.ROW_POSITION = const_20.ROW_POSITION;
    exports.COLUMN_TYPE = const_20.COLUMN_TYPE;
    exports.ROW_ACTION = const_20.ROW_ACTION;
    exports.DefaultAnimation = animation_2.DefaultAnimation;
    var checks = utils_16.Utils.check, strUtils = utils_16.Utils.str, coreUtils = utils_16.Utils.core;
    var $ = utils_16.Utils.dom.$, document = utils_16.Utils.dom.document;
    var _columnWidthInterval, _gridsCount = 0;
    var _created_grids = {};
    function getDataGrids() {
        var keys = Object.keys(_created_grids);
        var res = [];
        for (var i = 0; i < keys.length; i += 1) {
            var grid = _created_grids[keys[i]];
            res.push(grid);
        }
        return res;
    }
    exports.getDataGrids = getDataGrids;
    function findDataGrid(gridName) {
        var keys = Object.keys(_created_grids);
        for (var i = 0; i < keys.length; i += 1) {
            var grid = _created_grids[keys[i]];
            if (grid.$table.attr(const_18.DATA_ATTR.DATA_NAME) === gridName)
                return grid;
        }
        return null;
    }
    exports.findDataGrid = findDataGrid;
    function _gridCreated(grid) {
        _created_grids[grid.uniqueID] = grid;
        _gridsCount += 1;
        if (_gridsCount === 1) {
            $(window).on('resize.datagrid', _checkGridWidth);
            _columnWidthInterval = setInterval(_checkGridWidth, 400);
        }
        setTimeout(grid._getInternal().columnWidthCheck, 0);
    }
    function _gridDestroyed(grid) {
        delete _created_grids[grid.uniqueID];
        _gridsCount -= 1;
        if (_gridsCount === 0) {
            $(window).off('resize.datagrid');
            clearInterval(_columnWidthInterval);
        }
    }
    function _checkGridWidth() {
        coreUtils.forEachProp(_created_grids, function (id) {
            var grid = _created_grids[id];
            if (grid.getIsDestroyCalled())
                return;
            grid._getInternal().columnWidthCheck();
        });
    }
    var GRID_EVENTS = {
        row_expanded: "row_expanded",
        row_selected: "row_selected",
        page_changed: "page_changed",
        row_state_changed: "row_state_changed",
        cell_dblclicked: "cell_dblclicked",
        row_action: "row_action"
    };
    var DataGrid = (function (_super) {
        __extends(DataGrid, _super);
        function DataGrid(options) {
            _super.call(this);
            var self = this;
            options = coreUtils.merge(options, {
                app: null,
                el: null,
                dataSource: null,
                animation: null,
                isUseScrollInto: true,
                isUseScrollIntoDetails: true,
                containerCss: null,
                wrapCss: null,
                headerCss: null,
                rowStateField: null,
                isCanEdit: null,
                isCanDelete: null,
                isHandleAddNew: false,
                isPrependNewRows: false,
                isPrependAllRows: false
            });
            if (!!options.dataSource && !checks.isCollection(options.dataSource))
                throw new Error(lang_3.ERRS.ERR_GRID_DATASRC_INVALID);
            this._options = options;
            this._table = this._options.el;
            var $t = $(this._table);
            this._$table = $t;
            $t.addClass(const_19.css.dataTable);
            this._name = $t.attr(const_18.DATA_ATTR.DATA_NAME);
            this._objId = "grd" + coreUtils.getNewID();
            this._rowMap = {};
            this._rows = [];
            this._columns = [];
            this._currentRow = null;
            this._expandedRow = null;
            this._details = null;
            this._fillSpace = null;
            this._expanderCol = null;
            this._actionsCol = null;
            this._rowSelectorCol = null;
            this._currentColumn = null;
            this._editingRow = null;
            this._dialog = null;
            this._$header = null;
            this._$wrapper = null;
            this._$contaner = null;
            this._wrapTable();
            this._colSizeDebounce = new utils_16.Debounce();
            this._scrollDebounce = new utils_16.Debounce();
            this._selectable = {
                getContainerEl: function () {
                    return self._$contaner[0];
                },
                getUniqueID: function () {
                    return self.uniqueID;
                },
                onKeyDown: function (key, event) {
                    self._onKeyDown(key, event);
                },
                onKeyUp: function (key, event) {
                    self._onKeyUp(key, event);
                }
            };
            var tw = this._table.offsetWidth;
            this._internal = {
                isRowExpanded: function (row) {
                    return self._isRowExpanded(row);
                },
                get$Header: function () {
                    return self._$header;
                },
                get$Container: function () {
                    return self._$contaner;
                },
                get$Wrapper: function () {
                    return self._$wrapper;
                },
                setCurrentColumn: function (column) {
                    self._setCurrentColumn(column);
                },
                onRowStateChanged: function (row, val) {
                    return self._onRowStateChanged(row, val);
                },
                onCellDblClicked: function (cell) {
                    self._onCellDblClicked(cell);
                },
                onRowSelectionChanged: function (row) {
                    self._onRowSelectionChanged(row);
                },
                resetColumnsSort: function () {
                    self._resetColumnsSort();
                },
                getLastRow: function () {
                    return self._getLastRow();
                },
                removeRow: function (row) {
                    self._removeRow(row);
                },
                expandDetails: function (parentRow, expanded) {
                    self._expandDetails(parentRow, expanded);
                },
                columnWidthCheck: function () {
                    if (self.getIsDestroyCalled())
                        return;
                    var tw2 = self._table.offsetWidth;
                    if (tw !== tw2) {
                        tw = tw2;
                        self.updateColumnsSize();
                    }
                }
            };
            this._createColumns();
            this._bindDS();
            bootstrap_4.bootstrap._getInternal().trackSelectable(this);
            _gridCreated(this);
        }
        DataGrid.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            var events = Object.keys(GRID_EVENTS).map(function (key, i, arr) { return GRID_EVENTS[key]; });
            return events.concat(base_events);
        };
        DataGrid.prototype.addOnRowExpanded = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.row_expanded, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnRowExpanded = function (nmspace) {
            this._removeHandler(GRID_EVENTS.row_expanded, nmspace);
        };
        DataGrid.prototype.addOnRowSelected = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.row_selected, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnRowSelected = function (nmspace) {
            this._removeHandler(GRID_EVENTS.row_selected, nmspace);
        };
        DataGrid.prototype.addOnPageChanged = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.page_changed, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnPageChanged = function (nmspace) {
            this._removeHandler(GRID_EVENTS.page_changed, nmspace);
        };
        DataGrid.prototype.addOnRowStateChanged = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.row_state_changed, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnRowStateChanged = function (nmspace) {
            this._removeHandler(GRID_EVENTS.row_state_changed, nmspace);
        };
        DataGrid.prototype.addOnCellDblClicked = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.cell_dblclicked, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnCellDblClicked = function (nmspace) {
            this._removeHandler(GRID_EVENTS.cell_dblclicked, nmspace);
        };
        DataGrid.prototype.addOnRowAction = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.row_action, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnRowAction = function (nmspace) {
            this._removeHandler(GRID_EVENTS.row_action, nmspace);
        };
        DataGrid.prototype._onKeyDown = function (key, event) {
            var ds = this.dataSource, self = this;
            if (!ds)
                return;
            switch (key) {
                case 38:
                    event.preventDefault();
                    if (ds.movePrev(true)) {
                        if (self.isUseScrollInto) {
                            self.scrollToCurrent(0);
                        }
                    }
                    break;
                case 40:
                    event.preventDefault();
                    if (ds.moveNext(true)) {
                        if (self.isUseScrollInto) {
                            self.scrollToCurrent(1);
                        }
                    }
                    break;
                case 34:
                    event.preventDefault();
                    if (ds.pageIndex > 0)
                        ds.pageIndex = ds.pageIndex - 1;
                    break;
                case 33:
                    event.preventDefault();
                    ds.pageIndex = ds.pageIndex + 1;
                    break;
                case 13:
                    if (!!this._currentRow && !!this._actionsCol) {
                        event.preventDefault();
                    }
                    break;
                case 27:
                    if (!!this._currentRow && !!this._actionsCol) {
                        if (this._currentRow.isEditing) {
                            event.preventDefault();
                        }
                    }
                    break;
                case 32:
                    if (!!this._rowSelectorCol && !!this._currentRow && (!this._currentRow.isExpanded && !this._currentRow.isEditing))
                        event.preventDefault();
                    break;
            }
        };
        DataGrid.prototype._onKeyUp = function (key, event) {
            var ds = this.dataSource;
            if (!ds)
                return;
            switch (key) {
                case 13:
                    if (!!this._currentRow && !!this._actionsCol) {
                        event.preventDefault();
                        if (this._currentRow.isEditing) {
                            this.raiseEvent(GRID_EVENTS.row_action, { row: this._currentRow, action: 0 });
                        }
                        else {
                            this.raiseEvent(GRID_EVENTS.row_action, { row: this._currentRow, action: 1 });
                        }
                    }
                    break;
                case 27:
                    if (!!this._currentRow && !!this._actionsCol) {
                        if (this._currentRow.isEditing) {
                            event.preventDefault();
                            this.raiseEvent(GRID_EVENTS.row_action, { row: this._currentRow, action: 2 });
                        }
                    }
                    break;
                case 32:
                    if (!!this._rowSelectorCol && !!this._currentRow && (!this._currentRow.isExpanded && !this._currentRow.isEditing)) {
                        event.preventDefault();
                        this._currentRow.isSelected = !this._currentRow.isSelected;
                    }
                    break;
            }
        };
        DataGrid.prototype._isRowExpanded = function (row) {
            return this._expandedRow === row;
        };
        DataGrid.prototype._setCurrentColumn = function (column) {
            if (!!this._currentColumn)
                this._currentColumn.isSelected = false;
            this._currentColumn = column;
            if (!!this._currentColumn)
                this._currentColumn.isSelected = true;
        };
        DataGrid.prototype._onRowStateChanged = function (row, val) {
            var args = { row: row, val: val, css: null };
            this.raiseEvent(GRID_EVENTS.row_state_changed, args);
            return args.css;
        };
        DataGrid.prototype._onCellDblClicked = function (cell) {
            var args = { cell: cell };
            this.raiseEvent(GRID_EVENTS.cell_dblclicked, args);
        };
        DataGrid.prototype._onRowSelectionChanged = function (row) {
            this.raiseEvent(GRID_EVENTS.row_selected, { row: row });
        };
        DataGrid.prototype._resetColumnsSort = function () {
            this.columns.forEach(function (col) {
                if (col instanceof data_2.DataColumn) {
                    col.sortOrder = null;
                }
            });
        };
        DataGrid.prototype._getLastRow = function () {
            if (this._rows.length === 0)
                return null;
            var i = this._rows.length - 1, row = this._rows[i];
            while (row.isDeleted && i > 0) {
                i -= 1;
                row = this._rows[i];
            }
            if (row.isDeleted)
                return null;
            else
                return row;
        };
        DataGrid.prototype._removeRow = function (row) {
            if (this._isRowExpanded(row)) {
                this.collapseDetails();
            }
            if (this._rows.length === 0)
                return;
            var rowkey = row.itemKey, i = utils_16.Utils.arr.remove(this._rows, row), oldRow;
            try {
                if (i > -1) {
                    oldRow = row;
                    if (!oldRow.getIsDestroyCalled())
                        oldRow.destroy();
                }
            }
            finally {
                if (!!this._rowMap[rowkey])
                    delete this._rowMap[rowkey];
            }
        };
        DataGrid.prototype._expandDetails = function (parentRow, expanded) {
            if (!this._options.details)
                return;
            if (!this._details) {
                this._details = this._createDetails();
                this._fillSpace = this._createFillSpace();
            }
            var old = this._expandedRow;
            if (old === parentRow) {
                if (!!old && expanded)
                    return;
            }
            this._expandedRow = null;
            this._details.parentRow = null;
            if (expanded) {
                this._expandedRow = parentRow;
                this._details.parentRow = parentRow;
                this._expandedRow.expanderCell.toggleImage();
                this._fillSpace.attach();
            }
            else {
                this._expandedRow = null;
                this._details.parentRow = null;
                if (!!old) {
                    old.expanderCell.toggleImage();
                }
                this._fillSpace.detach();
                this._fillSpace.height = 0;
            }
            if (old !== parentRow) {
                if (!!old)
                    old.expanderCell.toggleImage();
            }
            this.raiseEvent(GRID_EVENTS.row_expanded, { collapsedRow: old, expandedRow: parentRow, isExpanded: expanded });
        };
        DataGrid.prototype._parseColumnAttr = function (column_attr, content_attr) {
            var defaultOp = {
                "type": const_19.COLUMN_TYPE.DATA,
                title: null,
                sortable: false,
                sortMemberName: null,
                content: null
            };
            var options;
            var temp_opts = parser_1.parser.parseOptions(column_attr);
            if (temp_opts.length > 0)
                options = coreUtils.extend(defaultOp, temp_opts[0]);
            else
                options = defaultOp;
            if (!!content_attr) {
                options.content = int_1.parseContentAttr(content_attr);
                if (!options.sortMemberName && !!options.content.fieldName)
                    options.sortMemberName = options.content.fieldName;
            }
            return options;
        };
        DataGrid.prototype._findUndeleted = function (row, isUp) {
            if (!row)
                return null;
            if (!row.isDeleted)
                return row;
            var delIndex = this.rows.indexOf(row), i = delIndex, len = this.rows.length;
            if (!isUp) {
                i -= 1;
                if (i >= 0)
                    row = this.rows[i];
                while (i >= 0 && row.isDeleted) {
                    i -= 1;
                    if (i >= 0)
                        row = this.rows[i];
                }
                if (row.isDeleted)
                    row = null;
            }
            else {
                i += 1;
                if (i < len)
                    row = this.rows[i];
                while (i < len && row.isDeleted) {
                    i += 1;
                    if (i < len)
                        row = this.rows[i];
                }
                if (row.isDeleted)
                    row = null;
            }
            return row;
        };
        DataGrid.prototype._updateCurrent = function (row, withScroll) {
            this.currentRow = row;
            if (withScroll && !!row && !row.isDeleted)
                this.scrollToCurrent();
        };
        DataGrid.prototype.handleError = function (error, source) {
            var isHandled = _super.prototype.handleError.call(this, error, source);
            if (!isHandled) {
                return bootstrap_4.bootstrap.handleError(error, source);
            }
            return isHandled;
        };
        DataGrid.prototype._onDSCurrentChanged = function (sender, args) {
            var ds = this.dataSource, cur;
            if (!!ds)
                cur = ds.currentItem;
            if (!cur)
                this._updateCurrent(null, false);
            else {
                this._updateCurrent(this._rowMap[cur._key], false);
            }
        };
        DataGrid.prototype._onDSCollectionChanged = function (sender, args) {
            var self = this, row, items = args.items;
            switch (args.changeType) {
                case 2:
                    {
                        if (args.reason === 0) {
                            self._resetColumnsSort();
                        }
                        self._refresh(args.reason === 1);
                    }
                    break;
                case 1:
                    {
                        self._appendItems(args.items);
                        self._updateTableDisplay();
                    }
                    break;
                case 0:
                    {
                        items.forEach(function (item) {
                            var row = self._rowMap[item._key];
                            if (!!row) {
                                self._removeRow(row);
                            }
                        });
                        self._updateTableDisplay();
                    }
                    break;
                case 3:
                    {
                        row = self._rowMap[args.old_key];
                        if (!!row) {
                            delete self._rowMap[args.old_key];
                            self._rowMap[args.new_key] = row;
                        }
                    }
                    break;
                default:
                    throw new Error(strUtils.format(lang_3.ERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
            }
        };
        DataGrid.prototype._updateTableDisplay = function () {
            if (!this.dataSource || this.dataSource.count === 0)
                this.$table.css("visibility", "hidden");
            else
                this.$table.css("visibility", "visible");
        };
        DataGrid.prototype._onPageChanged = function () {
            if (!!this._rowSelectorCol) {
                this._rowSelectorCol.checked = false;
            }
            this.raiseEvent(GRID_EVENTS.page_changed, {});
        };
        DataGrid.prototype._onItemEdit = function (item, isBegin, isCanceled) {
            var row = this._rowMap[item._key];
            if (!row)
                return;
            if (isBegin) {
                row._onBeginEdit();
                this._editingRow = row;
            }
            else {
                row._onEndEdit(isCanceled);
                this._editingRow = null;
            }
            this.raisePropertyChanged(const_19.PROP_NAME.editingRow);
        };
        DataGrid.prototype._onItemAdded = function (sender, args) {
            var item = args.item, row = this._rowMap[item._key];
            if (!row)
                return;
            this._updateCurrent(row, true);
            if (this._options.isHandleAddNew && !args.isAddNewHandled) {
                args.isAddNewHandled = this.showEditDialog();
            }
        };
        DataGrid.prototype._onItemStatusChanged = function (item, oldStatus) {
            var newStatus = item._aspect.status, ds = this.dataSource;
            var row = this._rowMap[item._key];
            if (!row)
                return;
            if (newStatus === 3) {
                row.isDeleted = true;
                var row2 = this._findUndeleted(row, true);
                if (!row2) {
                    row2 = this._findUndeleted(row, false);
                }
                if (!!row2) {
                    ds.currentItem = row2.item;
                }
            }
            else if (oldStatus === 3) {
                row.isDeleted = false;
            }
        };
        DataGrid.prototype._onDSErrorsChanged = function (sender, args) {
            var row = this._rowMap[args.item._key];
            if (!row)
                return;
            row.updateErrorState();
        };
        DataGrid.prototype._bindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds) {
                this._updateTableDisplay();
                return;
            }
            ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
            ds.addOnCurrentChanged(self._onDSCurrentChanged, self._objId, self);
            ds.addOnBeginEdit(function (sender, args) {
                self._onItemEdit(args.item, true, false);
            }, self._objId);
            ds.addOnEndEdit(function (sender, args) {
                self._onItemEdit(args.item, false, args.isCanceled);
            }, self._objId);
            ds.addOnErrorsChanged(self._onDSErrorsChanged, self._objId, self);
            ds.addOnStatusChanged(function (sender, args) {
                self._onItemStatusChanged(args.item, args.oldStatus);
            }, self._objId);
            ds.addOnItemAdded(self._onItemAdded, self._objId, self);
            ds.addOnItemAdding(function (s, a) {
                self.collapseDetails();
            }, self._objId);
            this._refresh(false);
            this._onDSCurrentChanged();
        };
        DataGrid.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            this._updateTableDisplay();
            if (!ds)
                return;
            ds.removeNSHandlers(self._objId);
        };
        DataGrid.prototype._clearGrid = function () {
            if (this._rows.length === 0)
                return;
            this.collapseDetails();
            var self = this, tbody = self._tBodyEl, newTbody = document.createElement("tbody");
            this._table.replaceChild(newTbody, tbody);
            var rows = this._rows;
            this._rows = [];
            this._rowMap = {};
            rows.forEach(function (row) {
                row.isDetached = true;
                row.destroy();
            });
            this._currentRow = null;
        };
        DataGrid.prototype._wrapTable = function () {
            var $table = this._$table, $headerDiv, $wrapDiv, $container, self = this, doc = utils_16.Utils.dom.document;
            $table.wrap($("<div></div>").addClass(const_19.css.wrapDiv));
            $wrapDiv = $table.parent();
            $wrapDiv.wrap($("<div></div>").addClass(const_19.css.container));
            $container = $wrapDiv.parent();
            $headerDiv = $("<div></div>").addClass(const_19.css.headerDiv).insertBefore($wrapDiv);
            $(this._tHeadRow).addClass(const_19.css.columnInfo);
            this._$wrapper = $wrapDiv;
            this._$header = $headerDiv;
            this._$contaner = $container;
            if (this._options.containerCss) {
                $container.addClass(this._options.containerCss);
            }
            if (this._options.wrapCss) {
                $wrapDiv.addClass(this._options.wrapCss);
            }
            if (this._options.headerCss) {
                $headerDiv.addClass(this._options.headerCss);
            }
        };
        DataGrid.prototype._unWrapTable = function () {
            var $table = this._$table;
            if (!this._$header)
                return;
            this._$header.remove();
            this._$header = null;
            $table.unwrap();
            this._$wrapper = null;
            $table.unwrap();
            this._$contaner = null;
        };
        DataGrid.prototype._createColumns = function () {
            var self = this, headCells = this._tHeadCells, cellInfos = [];
            var cnt = headCells.length;
            for (var i = 0; i < cnt; i += 1) {
                var th = headCells[i];
                var attr = this._parseColumnAttr(th.getAttribute(const_18.DATA_ATTR.DATA_COLUMN), th.getAttribute(const_18.DATA_ATTR.DATA_CONTENT));
                cellInfos.push({ th: th, colInfo: attr });
            }
            cellInfos.forEach(function (cellInfo) {
                var col = self._createColumn(cellInfo);
                if (!!col)
                    self._columns.push(col);
            });
        };
        DataGrid.prototype._createColumn = function (cellInfo) {
            var col;
            switch (cellInfo.colInfo.type) {
                case const_19.COLUMN_TYPE.ROW_EXPANDER:
                    if (!this._expanderCol) {
                        col = new expander_3.ExpanderColumn(this, cellInfo);
                        this._expanderCol = col;
                    }
                    break;
                case const_19.COLUMN_TYPE.ROW_ACTIONS:
                    if (!this._actionsCol) {
                        col = new actions_3.ActionsColumn(this, cellInfo);
                        this._actionsCol = col;
                    }
                    break;
                case const_19.COLUMN_TYPE.ROW_SELECTOR:
                    if (!this._rowSelectorCol) {
                        col = new rowselector_3.RowSelectorColumn(this, cellInfo);
                        this._rowSelectorCol = col;
                    }
                    break;
                case const_19.COLUMN_TYPE.DATA:
                    col = new data_2.DataColumn(this, cellInfo);
                    break;
                default:
                    throw new Error(strUtils.format(lang_3.ERRS.ERR_GRID_COLTYPE_INVALID, cellInfo.colInfo.type));
            }
            return col;
        };
        DataGrid.prototype._appendItems = function (newItems) {
            if (this.getIsDestroyCalled())
                return;
            var self = this, item, tbody = this._tBodyEl;
            for (var i = 0, k = newItems.length; i < k; i += 1) {
                item = newItems[i];
                if (!self._rowMap[item._key]) {
                    var isPrepend = self.options.isPrependAllRows || (self.options.isPrependNewRows && item._aspect.isNew);
                    self._createRowForItem(tbody, item, isPrepend);
                }
            }
            this._colSizeDebounce.enqueue(function () {
                self.updateColumnsSize();
            });
        };
        DataGrid.prototype._refresh = function (isPageChanged) {
            var _this = this;
            var self = this, ds = this.dataSource;
            if (self.getIsDestroyCalled())
                return;
            self._clearGrid();
            if (!ds)
                return;
            var docFr = document.createDocumentFragment(), oldTbody = this._tBodyEl, newTbody = document.createElement("tbody");
            ds.items.forEach(function (item, index) {
                self._createRowForItem(docFr, item, false);
            });
            newTbody.appendChild(docFr);
            self._table.replaceChild(newTbody, oldTbody);
            if (isPageChanged) {
                self._onPageChanged();
            }
            this._scrollDebounce.enqueue(function () {
                if (_this.getIsDestroyCalled())
                    return;
                if (_this.isUseScrollInto)
                    _this.scrollToCurrent();
            });
            this._colSizeDebounce.enqueue(function () {
                self.updateColumnsSize();
                self._updateTableDisplay();
            });
        };
        DataGrid.prototype._createRowForItem = function (parent, item, prepend) {
            var self = this, tr = document.createElement("tr");
            var gridRow = new row_1.Row(self, { tr: tr, item: item });
            self._rowMap[item._key] = gridRow;
            self._rows.push(gridRow);
            if (!prepend) {
                parent.appendChild(gridRow.tr);
            }
            else {
                if (!parent.firstChild)
                    parent.appendChild(gridRow.tr);
                else
                    parent.insertBefore(gridRow.tr, parent.firstChild);
            }
            return gridRow;
        };
        DataGrid.prototype._createDetails = function () {
            var details_id = this._options.details.templateID;
            var tr = document.createElement("tr");
            return new details_2.DetailsRow({ grid: this, tr: tr, details_id: details_id });
        };
        DataGrid.prototype._createFillSpace = function () {
            var tr = document.createElement("tr");
            return new fillspace_2.FillSpaceRow({ grid: this, tr: tr });
        };
        DataGrid.prototype._getInternal = function () {
            return this._internal;
        };
        DataGrid.prototype.updateColumnsSize = function () {
            if (this.getIsDestroyCalled())
                return;
            var width = 0, headerDiv = this._$header;
            this._columns.forEach(function (col) {
                width += col.th.offsetWidth;
            });
            headerDiv.css("width", width);
            this._columns.forEach(function (col) {
                col.$col.css("width", col.th.offsetWidth);
            });
        };
        DataGrid.prototype.getISelectable = function () {
            return this._selectable;
        };
        DataGrid.prototype.sortByColumn = function (column) {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            var sorts = column.sortMemberName.split(";");
            var promise = ds.sort(sorts, column.sortOrder);
        };
        DataGrid.prototype.selectRows = function (isSelect) {
            this._rows.forEach(function (row) {
                if (row.isDeleted)
                    return;
                row.isSelected = isSelect;
            });
        };
        DataGrid.prototype.findRowByItem = function (item) {
            var row = this._rowMap[item._key];
            if (!row)
                return null;
            return row;
        };
        DataGrid.prototype.collapseDetails = function () {
            if (!this._details)
                return;
            var old = this._expandedRow;
            if (!!old) {
                this._expandDetails(old, false);
            }
        };
        DataGrid.prototype.getSelectedRows = function () {
            var res = [];
            this._rows.forEach(function (row) {
                if (row.isDeleted)
                    return;
                if (row.isSelected) {
                    res.push(row);
                }
            });
            return res;
        };
        DataGrid.prototype.showEditDialog = function () {
            if (!this.isHasEditor || !this._editingRow)
                return false;
            var dialogOptions, item = this._editingRow.item;
            if (!item._aspect.isEditing)
                item._aspect.beginEdit();
            if (!this._dialog) {
                dialogOptions = coreUtils.extend({
                    dataContext: item,
                    templateID: null
                }, this._options.editor);
                this._dialog = new dialog_1.DataEditDialog(this.app, dialogOptions);
            }
            else
                this._dialog.dataContext = item;
            this._dialog.canRefresh = !!this.dataSource.permissions.canRefreshRow && !item._aspect.isNew;
            this._dialog.show();
            return true;
        };
        DataGrid.prototype.scrollToRow = function (args) {
            if (!args || !args.row)
                return;
            if (!!this._fillSpace) {
                this._fillSpace.height = 0;
            }
            var $tr = args.row.$tr, animate = !!args.animate, alignBottom = (args.pos === 1), viewPortHeight = this._$wrapper.innerHeight(), rowHeight = $tr.outerHeight(), currentScrollTop = this._$wrapper.scrollTop(), offsetDiff = currentScrollTop + $tr.offset().top - this._$wrapper.offset().top;
            if (alignBottom) {
                offsetDiff = Math.floor(offsetDiff + 1);
            }
            else {
                offsetDiff = Math.floor(offsetDiff - 1);
            }
            var contentHeight = rowHeight;
            if (args.row.isExpanded) {
                contentHeight = contentHeight + this._details.$tr.outerHeight();
            }
            contentHeight = Math.min(viewPortHeight, contentHeight);
            var yOffset = viewPortHeight - contentHeight;
            var yPos = offsetDiff;
            if (alignBottom)
                yPos -= yOffset;
            var maxScrollTop = this.$table.outerHeight() - viewPortHeight + 1, deltaY = 0;
            if (yPos < 0) {
                yPos = 0;
            }
            else if (yPos > maxScrollTop) {
                deltaY = yPos - maxScrollTop;
            }
            if (!!this._fillSpace) {
                this._fillSpace.height = deltaY;
            }
            if ((args.pos !== 2) && (currentScrollTop < offsetDiff && currentScrollTop > (offsetDiff - yOffset)))
                return;
            if (animate) {
                this._$wrapper.animate({
                    scrollTop: yPos
                }, {
                    duration: 500,
                    specialEasing: {
                        width: "linear",
                        height: "easeOutBounce"
                    }
                });
            }
            else
                this._$wrapper.scrollTop(yPos);
        };
        DataGrid.prototype.scrollToCurrent = function (pos, animate) {
            this.scrollToRow({ row: this.currentRow, animate: animate, pos: pos });
        };
        DataGrid.prototype.focus = function () {
            this.scrollToCurrent(0);
            bootstrap_4.bootstrap.currentSelectable = this;
        };
        DataGrid.prototype.addNew = function () {
            var ds = this.dataSource;
            try {
                ds.addNew();
                this.showEditDialog();
            }
            catch (ex) {
                utils_16.ERROR.reThrow(ex, this.handleError(ex, this));
            }
        };
        DataGrid.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._clearGrid();
            _gridDestroyed(this);
            bootstrap_4.bootstrap._getInternal().untrackSelectable(this);
            this._colSizeDebounce.destroy();
            this._scrollDebounce.destroy();
            if (!!this._details) {
                this._details.destroy();
                this._details = null;
            }
            if (!!this._fillSpace) {
                this._fillSpace.destroy();
                this._fillSpace = null;
            }
            if (this._options.animation) {
                this._options.animation.stop();
                this._options.animation = null;
            }
            if (!!this._dialog) {
                this._dialog.destroy();
                this._dialog = null;
            }
            this.dataSource = null;
            this._unWrapTable();
            this._$table.removeClass(const_19.css.dataTable);
            $(this._tHeadRow).removeClass(const_19.css.columnInfo);
            this._table = null;
            this._$table = null;
            this._options.app = null;
            this._options = {};
            this._selectable = null;
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(DataGrid.prototype, "$table", {
            get: function () {
                return this._$table;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "app", {
            get: function () { return this._options.app; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "options", {
            get: function () { return this._options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tBodyEl", {
            get: function () { return this._table.tBodies[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tHeadEl", {
            get: function () { return this._table.tHead; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tFootEl", {
            get: function () { return this._table.tFoot; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tHeadRow", {
            get: function () {
                if (!this._tHeadEl)
                    return null;
                var trs = this._tHeadEl.rows;
                if (trs.length === 0)
                    return null;
                return trs[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tHeadCells", {
            get: function () {
                var row = this._tHeadRow;
                if (!row)
                    return [];
                return utils_16.Utils.arr.fromList(row.cells);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "dataSource", {
            get: function () { return this._options.dataSource; },
            set: function (v) {
                if (v === this.dataSource)
                    return;
                if (!!this.dataSource) {
                    this._unbindDS();
                }
                this._clearGrid();
                this._options.dataSource = v;
                if (!!this.dataSource)
                    this._bindDS();
                this.raisePropertyChanged(const_19.PROP_NAME.dataSource);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "rows", {
            get: function () { return this._rows; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "columns", {
            get: function () { return this._columns; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "currentRow", {
            get: function () { return this._currentRow; },
            set: function (row) {
                var ds = this.dataSource, old = this._currentRow, isChanged = false;
                if (!ds)
                    return;
                if (old !== row) {
                    this._currentRow = row;
                    if (!!old) {
                        old.isCurrent = false;
                    }
                    if (!!row)
                        row.isCurrent = true;
                    isChanged = true;
                }
                if (!!row) {
                    if (row.item !== ds.currentItem)
                        ds.currentItem = row.item;
                }
                else
                    ds.currentItem = null;
                if (isChanged)
                    this.raisePropertyChanged(const_19.PROP_NAME.currentRow);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "editingRow", {
            get: function () { return this._editingRow; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isHasEditor", {
            get: function () {
                return (this._options.editor && this._options.editor.templateID);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isCanEdit", {
            get: function () {
                if (this._options.isCanEdit !== null)
                    return this._options.isCanEdit;
                var ds = this.dataSource;
                return !!ds && ds.permissions.canEditRow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isCanDelete", {
            get: function () {
                if (this._options.isCanDelete !== null)
                    return this._options.isCanDelete;
                var ds = this.dataSource;
                return !!ds && ds.permissions.canDeleteRow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isCanAddNew", {
            get: function () {
                var ds = this.dataSource;
                return !!ds && ds.permissions.canAddRow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isUseScrollInto", {
            get: function () { return this._options.isUseScrollInto; },
            set: function (v) { this._options.isUseScrollInto = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "animation", {
            get: function () {
                if (!this.options.animation) {
                    this.options.animation = new animation_1.DefaultAnimation();
                }
                return this.options.animation;
            },
            enumerable: true,
            configurable: true
        });
        return DataGrid;
    }(object_10.BaseObject));
    exports.DataGrid = DataGrid;
    var DataGridElView = (function (_super) {
        __extends(DataGridElView, _super);
        function DataGridElView(options) {
            _super.call(this, options);
            this._stateProvider = null;
            this._grid = null;
            this._options = options;
            this._createGrid();
        }
        DataGridElView.prototype.toString = function () {
            return "DataGridElView";
        };
        DataGridElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._grid && !this._grid.getIsDestroyCalled()) {
                this._grid.destroy();
            }
            this._grid = null;
            this._stateProvider = null;
            _super.prototype.destroy.call(this);
        };
        DataGridElView.prototype._createGrid = function () {
            var options = coreUtils.extend({
                app: this.app,
                el: this.el,
                dataSource: null,
                animation: null
            }, this._options);
            this._grid = new DataGrid(options);
            this._bindGridEvents();
        };
        DataGridElView.prototype._bindGridEvents = function () {
            if (!this._grid)
                return;
            this._grid.addOnRowStateChanged(function (s, args) {
                var self = this;
                if (!!self._stateProvider) {
                    args.css = self._stateProvider.getCSS(args.row.item, args.val);
                }
            }, this.uniqueID, this);
            this._grid.addOnDestroyed(function (s, args) {
                var self = this;
                self._grid = null;
                self.invokePropChanged(const_19.PROP_NAME.grid);
                self.raisePropertyChanged(const_19.PROP_NAME.grid);
            }, this.uniqueID, this);
        };
        Object.defineProperty(DataGridElView.prototype, "dataSource", {
            get: function () {
                if (this._isDestroyCalled)
                    return undefined;
                return this.grid.dataSource;
            },
            set: function (v) {
                if (this._isDestroyCalled)
                    return;
                if (this.dataSource !== v) {
                    this.grid.dataSource = v;
                    this.raisePropertyChanged(const_19.PROP_NAME.dataSource);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridElView.prototype, "grid", {
            get: function () { return this._grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridElView.prototype, "stateProvider", {
            get: function () { return this._stateProvider; },
            set: function (v) {
                if (v !== this._stateProvider) {
                    this._stateProvider = v;
                    this.raisePropertyChanged(const_19.PROP_NAME.stateProvider);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridElView.prototype, "animation", {
            get: function () {
                if (this._isDestroyCalled)
                    return undefined;
                return this._grid.options.animation;
            },
            set: function (v) {
                if (this._isDestroyCalled)
                    return;
                if (this.animation !== v) {
                    this._grid.options.animation = v;
                    this.raisePropertyChanged(const_19.PROP_NAME.animation);
                }
            },
            enumerable: true,
            configurable: true
        });
        return DataGridElView;
    }(elview_4.BaseElView));
    exports.DataGridElView = DataGridElView;
    bootstrap_4.bootstrap.registerElView("table", DataGridElView);
    bootstrap_4.bootstrap.registerElView("datagrid", DataGridElView);
    bootstrap_4.bootstrap.loadOwnStyle("jriapp_ui");
});
define("jriapp_ui/pager", ["require", "exports", "jriapp_core/lang", "jriapp_core/object", "jriapp_utils/utils", "jriapp_core/bootstrap", "jriapp_elview/elview"], function (require, exports, lang_4, object_11, utils_17, bootstrap_5, elview_5) {
    "use strict";
    var $ = utils_17.Utils.dom.$, document = utils_17.Utils.dom.document, checks = utils_17.Utils.check, strUtils = utils_17.Utils.str, coreUtils = utils_17.Utils.core;
    var _STRS = lang_4.STRS.PAGER;
    var css = {
        pager: "ria-pager",
        info: "ria-pager-info",
        currentPage: "ria-pager-current-page",
        otherPage: "ria-pager-other-page"
    };
    var PROP_NAME = {
        dataSource: "dataSource",
        rowCount: "rowCount",
        currentPage: "currentPage",
        pager: "pager"
    };
    var Pager = (function (_super) {
        __extends(Pager, _super);
        function Pager(options) {
            _super.call(this);
            options = coreUtils.extend({
                app: null,
                el: null,
                dataSource: null,
                showTip: true,
                showInfo: false,
                showNumbers: true,
                showFirstAndLast: true,
                showPreviousAndNext: false,
                useSlider: true,
                hideOnSinglePage: true,
                sliderSize: 25
            }, options);
            if (!!options.dataSource && !checks.isCollection(options.dataSource))
                throw new Error(lang_4.ERRS.ERR_PAGER_DATASRC_INVALID);
            this._options = options;
            this._$el = $(options.el);
            this._objId = "pgr" + coreUtils.getNewID();
            this._rowsPerPage = 0;
            this._rowCount = 0;
            this._currentPage = 1;
            this._$el.addClass(css.pager);
            this._renderDebounce = new utils_17.Debounce(50);
            if (!!this._options.dataSource) {
                this._bindDS();
            }
        }
        Pager.prototype._createElement = function (tag) {
            return $(document.createElement(tag));
        };
        Pager.prototype._render = function () {
            var $el = this._$el, rowCount, currentPage, pageCount;
            this._clearContent();
            if (this.rowsPerPage <= 0) {
                return;
            }
            rowCount = this.rowCount;
            if (rowCount === 0) {
                return;
            }
            currentPage = this.currentPage;
            if (currentPage === 0) {
                return;
            }
            pageCount = this.pageCount;
            if (this.hideOnSinglePage && (pageCount === 1)) {
                $el.hide();
            }
            else {
                $el.show();
                if (this.showInfo) {
                    var $span = this._createElement("span");
                    var info = strUtils.format(_STRS.pageInfo, currentPage, pageCount);
                    $span.addClass(css.info).text(info).appendTo($el);
                }
                if (this.showFirstAndLast && (currentPage !== 1)) {
                    $el.append(this._createFirst());
                }
                if (this.showPreviousAndNext && (currentPage !== 1)) {
                    $el.append(this._createPrevious());
                }
                if (this.showNumbers) {
                    var start = 1, end = pageCount, sliderSize = this.sliderSize, half = void 0, above = void 0, below = void 0;
                    if (this.useSlider && (sliderSize > 0)) {
                        half = Math.floor(((sliderSize - 1) / 2));
                        above = (currentPage + half) + ((sliderSize - 1) % 2);
                        below = (currentPage - half);
                        if (below < 1) {
                            above += (1 - below);
                            below = 1;
                        }
                        if (above > pageCount) {
                            below -= (above - pageCount);
                            if (below < 1) {
                                below = 1;
                            }
                            above = pageCount;
                        }
                        start = below;
                        end = above;
                    }
                    for (var i = start; i <= end; i++) {
                        if (i === currentPage) {
                            $el.append(this._createCurrent());
                        }
                        else {
                            $el.append(this._createOther(i));
                        }
                    }
                }
                if (this.showPreviousAndNext && (currentPage !== pageCount)) {
                    $el.append(this._createNext());
                }
                if (this.showFirstAndLast && (currentPage !== pageCount)) {
                    $el.append(this._createLast());
                }
            }
        };
        Pager.prototype.render = function () {
            var _this = this;
            this._renderDebounce.enqueue(function () { _this._render(); });
        };
        Pager.prototype._setDSPageIndex = function (page) {
            this.dataSource.pageIndex = page - 1;
        };
        Pager.prototype._onPageSizeChanged = function (ds, args) {
            this.rowsPerPage = ds.pageSize;
        };
        Pager.prototype._onPageIndexChanged = function (ds, args) {
            this.currentPage = ds.pageIndex + 1;
        };
        Pager.prototype._onTotalCountChanged = function (ds, args) {
            this.rowCount = ds.totalCount;
        };
        Pager.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._renderDebounce.destroy();
            this._renderDebounce = null;
            this._unbindDS();
            this._clearContent();
            this._$el.removeClass(css.pager);
            this._$el = null;
            this._options = {};
            _super.prototype.destroy.call(this);
        };
        Pager.prototype._bindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.addOnCollChanged(function (s, args) {
                switch (args.changeType) {
                    case 2:
                        {
                            if (args.reason !== 1) {
                                self._reset();
                            }
                        }
                        break;
                }
            }, self._objId);
            ds.addOnPageIndexChanged(self._onPageIndexChanged, self._objId, self);
            ds.addOnPageSizeChanged(self._onPageSizeChanged, self._objId, self);
            ds.addOnTotalCountChanged(self._onTotalCountChanged, self._objId, self);
            this._reset();
        };
        Pager.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.removeNSHandlers(self._objId);
        };
        Pager.prototype._clearContent = function () {
            this._$el.empty();
        };
        Pager.prototype._reset = function () {
            var ds = this.dataSource;
            if (!ds) {
                this._currentPage = 1;
                this._rowsPerPage = 100;
                this._rowCount = 0;
                this.render();
                return;
            }
            this._currentPage = ds.pageIndex + 1;
            this._rowsPerPage = ds.pageSize;
            this._rowCount = ds.totalCount;
            this.render();
        };
        Pager.prototype._createLink = function (page, text, tip) {
            var a = this._createElement("a"), self = this;
            a.text("" + text);
            a.attr("href", "javascript:void(0)");
            if (!!tip) {
                elview_5.fn_addToolTip(a, tip);
            }
            a.click(function (e) {
                e.preventDefault();
                self._setDSPageIndex(page);
                self.currentPage = page;
            });
            return a;
        };
        Pager.prototype._createFirst = function () {
            var $span = this._createElement("span"), tip, a;
            if (this.showTip) {
                tip = _STRS.firstPageTip;
            }
            a = this._createLink(1, _STRS.firstText, tip);
            $span.addClass(css.otherPage).append(a);
            return $span;
        };
        Pager.prototype._createPrevious = function () {
            var span = this._createElement("span"), previousPage = this.currentPage - 1, tip, a;
            if (this.showTip) {
                tip = strUtils.format(_STRS.prevPageTip, previousPage);
            }
            a = this._createLink(previousPage, _STRS.previousText, tip);
            span.addClass(css.otherPage).append(a);
            return span;
        };
        Pager.prototype._createCurrent = function () {
            var span = this._createElement("span"), currentPage = this.currentPage;
            span.text("" + currentPage);
            if (this.showTip) {
                elview_5.fn_addToolTip(span, this._buildTip(currentPage));
            }
            span.addClass(css.currentPage);
            return span;
        };
        Pager.prototype._createOther = function (page) {
            var span = this._createElement("span"), tip, a;
            if (this.showTip) {
                tip = this._buildTip(page);
            }
            a = this._createLink(page, "" + page, tip);
            span.addClass(css.otherPage);
            span.append(a);
            return span;
        };
        Pager.prototype._createNext = function () {
            var span = this._createElement("span"), nextPage = this.currentPage + 1, tip, a;
            if (this.showTip) {
                tip = strUtils.format(_STRS.nextPageTip, nextPage);
            }
            a = this._createLink(nextPage, _STRS.nextText, tip);
            span.addClass(css.otherPage).append(a);
            return span;
        };
        Pager.prototype._createLast = function () {
            var span = this._createElement("span"), tip, a;
            if (this.showTip) {
                tip = _STRS.lastPageTip;
            }
            a = this._createLink(this.pageCount, _STRS.lastText, tip);
            span.addClass(css.otherPage).append(a);
            return span;
        };
        Pager.prototype._buildTip = function (page) {
            var rowsPerPage = this.rowsPerPage, rowCount = this.rowCount, start = (((page - 1) * rowsPerPage) + 1), end = (page === this.pageCount) ? rowCount : (page * rowsPerPage), tip = "";
            if (page === this.currentPage) {
                tip = strUtils.format(_STRS.showingTip, start, end, rowCount);
            }
            else {
                tip = strUtils.format(_STRS.showTip, start, end, rowCount);
            }
            return tip;
        };
        Pager.prototype.toString = function () {
            return "Pager";
        };
        Object.defineProperty(Pager.prototype, "app", {
            get: function () { return this._options.app; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "el", {
            get: function () { return this._options.el; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "dataSource", {
            get: function () { return this._options.dataSource; },
            set: function (v) {
                if (v === this.dataSource)
                    return;
                if (!!this.dataSource) {
                    this._unbindDS();
                }
                this._options.dataSource = v;
                if (!!this.dataSource)
                    this._bindDS();
                this.raisePropertyChanged(PROP_NAME.dataSource);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "pageCount", {
            get: function () {
                var rowCount = this.rowCount, rowsPerPage = this.rowsPerPage, result;
                if ((rowCount === 0) || (rowsPerPage === 0)) {
                    return 0;
                }
                if ((rowCount % rowsPerPage) === 0) {
                    return (rowCount / rowsPerPage);
                }
                else {
                    result = (rowCount / rowsPerPage);
                    result = Math.floor(result) + 1;
                    return result;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "rowCount", {
            get: function () { return this._rowCount; },
            set: function (v) {
                if (this._rowCount !== v) {
                    this._rowCount = v;
                    this.render();
                    this.raisePropertyChanged(PROP_NAME.rowCount);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "rowsPerPage", {
            get: function () { return this._rowsPerPage; },
            set: function (v) {
                if (this._rowsPerPage !== v) {
                    this._rowsPerPage = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "currentPage", {
            get: function () { return this._currentPage; },
            set: function (v) {
                if (this._currentPage !== v) {
                    this._currentPage = v;
                    this.render();
                    this.raisePropertyChanged(PROP_NAME.currentPage);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "useSlider", {
            get: function () { return this._options.useSlider; },
            set: function (v) {
                if (this.useSlider !== v) {
                    this._options.useSlider = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "sliderSize", {
            get: function () { return this._options.sliderSize; },
            set: function (v) {
                if (this.sliderSize !== v) {
                    this._options.sliderSize = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "hideOnSinglePage", {
            get: function () { return this._options.hideOnSinglePage; },
            set: function (v) {
                if (this.hideOnSinglePage !== v) {
                    this._options.hideOnSinglePage = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "showTip", {
            get: function () { return this._options.showTip; },
            set: function (v) {
                if (this.showTip !== v) {
                    this._options.showTip = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "showInfo", {
            get: function () { return this._options.showInfo; },
            set: function (v) {
                if (this._options.showInfo !== v) {
                    this._options.showInfo = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "showFirstAndLast", {
            get: function () { return this._options.showFirstAndLast; },
            set: function (v) {
                if (this.showFirstAndLast !== v) {
                    this._options.showFirstAndLast = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "showPreviousAndNext", {
            get: function () { return this._options.showPreviousAndNext; },
            set: function (v) {
                if (this.showPreviousAndNext !== v) {
                    this._options.showPreviousAndNext = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "showNumbers", {
            get: function () { return this._options.showNumbers; },
            set: function (v) {
                if (this.showNumbers !== v) {
                    this._options.showNumbers = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        return Pager;
    }(object_11.BaseObject));
    exports.Pager = Pager;
    var PagerElView = (function (_super) {
        __extends(PagerElView, _super);
        function PagerElView(options) {
            _super.call(this, options);
            var self = this;
            this._pager = null;
            this._pager = new Pager(options);
            this._pager.addOnDestroyed(function () {
                self._pager = null;
                self.invokePropChanged(PROP_NAME.pager);
                self.raisePropertyChanged(PROP_NAME.pager);
            });
        }
        PagerElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._pager && !this._pager.getIsDestroyCalled()) {
                this._pager.destroy();
            }
            this._pager = null;
            _super.prototype.destroy.call(this);
        };
        PagerElView.prototype.toString = function () {
            return "PagerElView";
        };
        Object.defineProperty(PagerElView.prototype, "dataSource", {
            get: function () {
                if (this._isDestroyCalled)
                    return undefined;
                return this._pager.dataSource;
            },
            set: function (v) {
                if (this._isDestroyCalled)
                    return;
                if (this.dataSource !== v) {
                    this._pager.dataSource = v;
                    this.raisePropertyChanged(PROP_NAME.dataSource);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PagerElView.prototype, "pager", {
            get: function () { return this._pager; },
            enumerable: true,
            configurable: true
        });
        return PagerElView;
    }(elview_5.BaseElView));
    exports.PagerElView = PagerElView;
    bootstrap_5.bootstrap.registerElView("pager", PagerElView);
    bootstrap_5.bootstrap.loadOwnStyle("jriapp_ui");
});
define("jriapp_ui/listbox", ["require", "exports", "jriapp_core/lang", "jriapp_core/object", "jriapp_core/bootstrap", "jriapp_core/parser", "jriapp_utils/utils", "jriapp_elview/elview", "jriapp_elview/span", "jriapp_content/basic", "jriapp_content/factory"], function (require, exports, lang_5, object_12, bootstrap_6, parser_2, utils_18, elview_6, span_1, basic_1, factory_2) {
    "use strict";
    var $ = utils_18.Utils.dom.$, document = utils_18.Utils.dom.document, checks = utils_18.Utils.check, strUtils = utils_18.Utils.str, coreUtils = utils_18.Utils.core;
    var PROP_NAME = {
        dataSource: "dataSource",
        selectedItem: "selectedItem",
        selectedValue: "selectedValue",
        valuePath: "valuePath",
        textPath: "textPath",
        isEnabled: "isEnabled",
        listBox: "listBox",
        value: "value",
        textProvider: "textProvider",
        stateProvider: "stateProvider"
    };
    var LISTBOX_EVENTS = {
        refreshed: "refreshed"
    };
    var ListBox = (function (_super) {
        __extends(ListBox, _super);
        function ListBox(options) {
            _super.call(this);
            var self = this;
            options = coreUtils.extend({
                app: null,
                el: null,
                dataSource: null,
                valuePath: null,
                textPath: null,
                statePath: null
            }, options);
            if (!!options.dataSource && !checks.isCollection(options.dataSource))
                throw new Error(lang_5.ERRS.ERR_LISTBOX_DATASRC_INVALID);
            this._$el = $(options.el);
            this._options = options;
            this._objId = "lst" + coreUtils.getNewID();
            this._$el.on("change." + this._objId, function (e) {
                e.stopPropagation();
                if (self._isRefreshing)
                    return;
                self._onChanged();
            });
            this._textProvider = null;
            this._stateProvider = null;
            this._isRefreshing = false;
            this._selectedItem = null;
            this._prevSelected = null;
            this._keyMap = {};
            this._valMap = {};
            this._savedValue = undefined;
            this._tempValue = undefined;
            var ds = this._options.dataSource;
            this._options.dataSource = null;
            this.dataSource = ds;
            this._fn_state = function (sender) {
                var item = sender;
                var data = self._keyMap[item._key];
                if (!data)
                    return;
                var css = self._onOptionStateChanged(data);
                data.op.className = css;
            };
        }
        ListBox.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._unbindDS();
            this._$el.off("." + this._objId);
            this._clear(true);
            this._$el = null;
            this._tempValue = undefined;
            this._selectedItem = null;
            this._prevSelected = null;
            this._savedValue = null;
            this._options = {};
            this._textProvider = null;
            this._stateProvider = null;
            _super.prototype.destroy.call(this);
        };
        ListBox.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            var events = Object.keys(LISTBOX_EVENTS).map(function (key, i, arr) { return LISTBOX_EVENTS[key]; });
            return events.concat(base_events);
        };
        ListBox.prototype.addOnRefreshed = function (fn, nmspace, context) {
            this._addHandler(LISTBOX_EVENTS.refreshed, fn, nmspace, context);
        };
        ListBox.prototype.removeOnRefreshed = function (nmspace) {
            this._removeHandler(LISTBOX_EVENTS.refreshed, nmspace);
        };
        ListBox.prototype._onChanged = function () {
            var op = null, key, data;
            if (this.el.selectedIndex >= 0) {
                op = this.el.options[this.el.selectedIndex];
                key = op.value;
                data = this._keyMap[key];
            }
            if (!data && !!this._selectedItem) {
                this.selectedItem = null;
            }
            else if (data.item !== this._selectedItem) {
                this.selectedItem = data.item;
            }
        };
        ListBox.prototype._getStringValue = function (item) {
            var v = this._getValue(item);
            if (checks.isNt(v))
                return "";
            return "" + v;
        };
        ListBox.prototype._getValue = function (item) {
            if (!item)
                return null;
            if (!!this._options.valuePath) {
                return parser_2.parser.resolvePath(item, this._options.valuePath);
            }
            else
                return undefined;
        };
        ListBox.prototype._getText = function (item, index) {
            var res = "";
            if (!item)
                return res;
            if (!!this._options.textPath) {
                var t = parser_2.parser.resolvePath(item, this._options.textPath);
                if (checks.isNt(t))
                    return "";
                res = "" + t;
            }
            else {
                res = this._getStringValue(item);
            }
            if (!this._textProvider)
                return res;
            res = this._textProvider.getText(item, index, res);
            return res;
        };
        ListBox.prototype._onDSCollectionChanged = function (sender, args) {
            var self = this, data;
            switch (args.changeType) {
                case 2:
                    {
                        this._refresh();
                    }
                    break;
                case 1:
                    args.items.forEach(function (item) {
                        self._addOption(item, item._aspect.isNew);
                    });
                    break;
                case 0:
                    args.items.forEach(function (item) {
                        self._removeOption(item);
                    });
                    if (!!self._textProvider)
                        self._resetText();
                    break;
                case 3:
                    {
                        data = self._keyMap[args.old_key];
                        if (!!data) {
                            delete self._keyMap[args.old_key];
                            self._keyMap[args.new_key] = data;
                            data.op.value = args.new_key;
                        }
                    }
                    break;
            }
        };
        ListBox.prototype._onEdit = function (item, isBegin, isCanceled) {
            var self = this, key, data, oldVal, val;
            if (isBegin) {
                this._savedValue = this._getStringValue(item);
            }
            else {
                oldVal = this._savedValue;
                this._savedValue = undefined;
                if (!isCanceled) {
                    key = item._key;
                    data = self._keyMap[key];
                    if (!!data) {
                        data.op.text = self._getText(item, data.op.index);
                        val = this._getStringValue(item);
                        if (oldVal !== val) {
                            if (!!oldVal) {
                                delete self._valMap[oldVal];
                            }
                            if (!!val) {
                                self._valMap[val] = data;
                            }
                        }
                    }
                    else {
                        if (!!oldVal) {
                            delete self._valMap[oldVal];
                        }
                    }
                }
            }
        };
        ListBox.prototype._onStatusChanged = function (item, oldStatus) {
            var newStatus = item._aspect.status;
            if (newStatus === 3) {
                this._removeOption(item);
                if (!!this._textProvider)
                    this._resetText();
            }
        };
        ListBox.prototype._onCommitChanges = function (item, isBegin, isRejected, status) {
            var self = this, oldVal, val, data;
            if (isBegin) {
                if (isRejected && status === 1) {
                    return;
                }
                else if (!isRejected && status === 3) {
                    return;
                }
                this._savedValue = this._getStringValue(item);
            }
            else {
                oldVal = this._savedValue;
                this._savedValue = undefined;
                if (isRejected && status === 3) {
                    this._addOption(item, true);
                    return;
                }
                val = this._getStringValue(item);
                data = self._keyMap[item._key];
                if (oldVal !== val) {
                    if (oldVal !== "") {
                        delete self._valMap[oldVal];
                    }
                    if (!!data && val !== "") {
                        self._valMap[val] = data;
                    }
                }
                if (!!data) {
                    data.op.text = self._getText(item, data.op.index);
                }
            }
        };
        ListBox.prototype._onOptionStateChanged = function (data) {
            if (!this._stateProvider)
                return "";
            return this._stateProvider.getCSS(data.item, data.op.index, parser_2.parser.resolvePath(data.item, this.statePath));
        };
        ListBox.prototype._bindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
            ds.addOnBeginEdit(function (sender, args) {
                self._onEdit(args.item, true, undefined);
            }, self._objId);
            ds.addOnEndEdit(function (sender, args) {
                self._onEdit(args.item, false, args.isCanceled);
            }, self._objId);
            ds.addOnStatusChanged(function (sender, args) {
                self._onStatusChanged(args.item, args.oldStatus);
            }, self._objId);
            ds.addOnCommitChanges(function (sender, args) {
                self._onCommitChanges(args.item, args.isBegin, args.isRejected, args.status);
            }, self._objId);
        };
        ListBox.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.removeNSHandlers(self._objId);
        };
        ListBox.prototype._addOption = function (item, first) {
            if (this._isDestroyCalled)
                return null;
            var oOption, key = "", val, text;
            if (!!item) {
                key = item._key;
            }
            if (!!this._keyMap[key]) {
                return null;
            }
            var selEl = this.el;
            text = this._getText(item, selEl.options.length);
            val = this._getStringValue(item);
            oOption = document.createElement("option");
            oOption.text = text;
            oOption.value = key;
            var data = { item: item, op: oOption };
            this._keyMap[key] = data;
            if (!!val)
                this._valMap[val] = data;
            if (!!first) {
                if (selEl.options.length < 2)
                    selEl.add(oOption, null);
                else {
                    var firstOp = selEl.options[1];
                    selEl.add(oOption, firstOp);
                }
            }
            else
                selEl.add(oOption, null);
            if (!!this.statePath && !!item) {
                item.addOnPropertyChange(this.statePath, this._fn_state, this._objId, this);
                this._fn_state(item);
            }
            return oOption;
        };
        ListBox.prototype._mapByValue = function () {
            var self = this;
            this._valMap = {};
            coreUtils.forEachProp(this._keyMap, function (key) {
                var data = self._keyMap[key], val = self._getStringValue(data.item);
                if (!!val)
                    self._valMap[val] = data;
            });
        };
        ListBox.prototype._resetText = function () {
            var self = this;
            coreUtils.forEachProp(this._keyMap, function (key) {
                var data = self._keyMap[key];
                data.op.text = self._getText(data.item, data.op.index);
            });
        };
        ListBox.prototype._removeOption = function (item) {
            if (this._isDestroyCalled)
                return;
            var key = "", data, val;
            if (!!item) {
                key = item._key;
                data = this._keyMap[key];
                if (!data) {
                    return;
                }
                item.removeNSHandlers(this._objId);
                this.el.remove(data.op.index);
                val = this._getStringValue(item);
                delete this._keyMap[key];
                if (!!val)
                    delete this._valMap[val];
                if (this._prevSelected === item) {
                    this._prevSelected = null;
                }
                if (this.selectedItem === item) {
                    this.selectedItem = this._prevSelected;
                }
            }
        };
        ListBox.prototype._clear = function (isDestroy) {
            var self = this;
            coreUtils.forEachProp(this._keyMap, function (key) {
                var data = self._keyMap[key];
                if (!!data.item)
                    data.item.removeNSHandlers(self._objId);
            });
            this.el.options.length = 0;
            this._keyMap = {};
            this._valMap = {};
            this._prevSelected = null;
            if (!isDestroy) {
                this._addOption(null, false);
                this.selectedItem = null;
            }
            else
                this.selectedItem = null;
        };
        ListBox.prototype._refresh = function () {
            var self = this, ds = this.dataSource, oldItem = this._selectedItem, tmp = self._tempValue;
            this._isRefreshing = true;
            try {
                this.clear();
                if (!!ds) {
                    ds.forEach(function (item) {
                        self._addOption(item, false);
                    });
                    if (checks.isUndefined(tmp)) {
                        self.el.selectedIndex = self._findItemIndex(oldItem);
                    }
                    else {
                        oldItem = self.findItemByValue(tmp);
                        self.selectedItem = oldItem;
                        if (!oldItem)
                            self._tempValue = tmp;
                        else
                            self._tempValue = undefined;
                    }
                }
            }
            finally {
                self._isRefreshing = false;
            }
            self._onChanged();
            this.raiseEvent(LISTBOX_EVENTS.refreshed, {});
        };
        ListBox.prototype._findItemIndex = function (item) {
            if (!item || item.getIsDestroyCalled())
                return 0;
            var data = this._keyMap[item._key];
            if (!data)
                return 0;
            return data.op.index;
        };
        ListBox.prototype._setIsEnabled = function (el, v) {
            el.disabled = !v;
        };
        ListBox.prototype._getIsEnabled = function (el) {
            return !el.disabled;
        };
        ListBox.prototype.clear = function () {
            this._clear(false);
        };
        ListBox.prototype.findItemByValue = function (val) {
            if (checks.isNt(val))
                return null;
            val = "" + val;
            var data = this._valMap[val];
            if (!data)
                return null;
            return data.item;
        };
        ListBox.prototype.getTextByValue = function (val) {
            if (checks.isNt(val))
                return "";
            val = "" + val;
            var data = this._valMap[val];
            if (!data)
                return "";
            else
                return data.op.text;
        };
        ListBox.prototype.toString = function () {
            return "ListBox";
        };
        Object.defineProperty(ListBox.prototype, "dataSource", {
            get: function () { return this._options.dataSource; },
            set: function (v) {
                if (this.dataSource !== v) {
                    if (!!this.dataSource) {
                        this._tempValue = this.selectedValue;
                        this._unbindDS();
                    }
                    this._options.dataSource = v;
                    if (!!this.dataSource) {
                        this._bindDS();
                    }
                    this._refresh();
                    if (!!this.dataSource)
                        this._tempValue = undefined;
                    this.raisePropertyChanged(PROP_NAME.dataSource);
                    this.raisePropertyChanged(PROP_NAME.selectedItem);
                    this.raisePropertyChanged(PROP_NAME.selectedValue);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "selectedValue", {
            get: function () {
                if (!!this.dataSource)
                    return this._getValue(this.selectedItem);
                else
                    return undefined;
            },
            set: function (v) {
                var self = this;
                if (!!this.dataSource) {
                    if (this.selectedValue !== v) {
                        var item = self.findItemByValue(v);
                        self.selectedItem = item;
                        if (!checks.isUndefined(v) && !item)
                            self._tempValue = v;
                        else
                            self._tempValue = undefined;
                    }
                }
                else {
                    if (this._tempValue !== v) {
                        this._selectedItem = null;
                        this._tempValue = v;
                        this.raisePropertyChanged(PROP_NAME.selectedItem);
                        this.raisePropertyChanged(PROP_NAME.selectedValue);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "selectedItem", {
            get: function () {
                if (!!this.dataSource)
                    return this._selectedItem;
                else
                    return undefined;
            },
            set: function (v) {
                if (this._selectedItem !== v) {
                    if (!!this._selectedItem) {
                        this._prevSelected = this._selectedItem;
                    }
                    this._selectedItem = v;
                    this.el.selectedIndex = this._findItemIndex(this._selectedItem);
                    this.raisePropertyChanged(PROP_NAME.selectedItem);
                    this.raisePropertyChanged(PROP_NAME.selectedValue);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "valuePath", {
            get: function () { return this._options.valuePath; },
            set: function (v) {
                if (v !== this.valuePath) {
                    this._options.valuePath = v;
                    this._mapByValue();
                    this.raisePropertyChanged(PROP_NAME.valuePath);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "textPath", {
            get: function () { return this._options.textPath; },
            set: function (v) {
                if (v !== this.textPath) {
                    this._options.textPath = v;
                    this._resetText();
                    this.raisePropertyChanged(PROP_NAME.textPath);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "statePath", {
            get: function () { return this._options.statePath; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "isEnabled", {
            get: function () { return this._getIsEnabled(this.el); },
            set: function (v) {
                if (v !== this.isEnabled) {
                    this._setIsEnabled(this.el, v);
                    this.raisePropertyChanged(PROP_NAME.isEnabled);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "textProvider", {
            get: function () { return this._textProvider; },
            set: function (v) {
                if (v !== this._textProvider) {
                    this._textProvider = v;
                    this.raisePropertyChanged(PROP_NAME.textProvider);
                    this._resetText();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "stateProvider", {
            get: function () { return this._stateProvider; },
            set: function (v) {
                if (v !== this._stateProvider) {
                    this._stateProvider = v;
                    this.raisePropertyChanged(PROP_NAME.stateProvider);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "el", {
            get: function () { return this._options.el; },
            enumerable: true,
            configurable: true
        });
        return ListBox;
    }(object_12.BaseObject));
    exports.ListBox = ListBox;
    var ListBoxElView = (function (_super) {
        __extends(ListBoxElView, _super);
        function ListBoxElView(options) {
            _super.call(this, options);
            var self = this;
            self._listBox = new ListBox(options);
            self._listBox.addOnDestroyed(function () {
                self._listBox = null;
                self.invokePropChanged(PROP_NAME.listBox);
                self.raisePropertyChanged(PROP_NAME.listBox);
            }, this.uniqueID);
            self._listBox.addOnPropertyChange("*", function (sender, args) {
                switch (args.property) {
                    case PROP_NAME.dataSource:
                    case PROP_NAME.isEnabled:
                    case PROP_NAME.selectedValue:
                    case PROP_NAME.selectedItem:
                    case PROP_NAME.valuePath:
                    case PROP_NAME.textPath:
                    case PROP_NAME.textProvider:
                    case PROP_NAME.stateProvider:
                        self.raisePropertyChanged(args.property);
                        break;
                }
            }, self.uniqueID);
        }
        ListBoxElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._listBox && !this._listBox.getIsDestroyCalled()) {
                this._listBox.destroy();
            }
            this._listBox = null;
            _super.prototype.destroy.call(this);
        };
        ListBoxElView.prototype.toString = function () {
            return "ListBoxElView";
        };
        Object.defineProperty(ListBoxElView.prototype, "isEnabled", {
            get: function () { return !this.$el.prop("disabled"); },
            set: function (v) {
                v = !!v;
                if (v !== this.isEnabled) {
                    this.$el.prop("disabled", !v);
                    this.raisePropertyChanged(PROP_NAME.isEnabled);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "dataSource", {
            get: function () {
                if (this._isDestroyCalled)
                    return undefined;
                return this._listBox.dataSource;
            },
            set: function (v) {
                var self = this;
                if (self.dataSource !== v) {
                    self._listBox.dataSource = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "selectedValue", {
            get: function () {
                if (this.getIsDestroyCalled())
                    return undefined;
                return this._listBox.selectedValue;
            },
            set: function (v) {
                if (this._listBox.selectedValue !== v) {
                    this._listBox.selectedValue = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "selectedItem", {
            get: function () {
                if (this.getIsDestroyCalled())
                    return undefined;
                return this._listBox.selectedItem;
            },
            set: function (v) {
                this._listBox.selectedItem = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "valuePath", {
            get: function () { return this._listBox.valuePath; },
            set: function (v) {
                this._listBox.valuePath = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "textPath", {
            get: function () { return this._listBox.textPath; },
            set: function (v) {
                this._listBox.textPath = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "textProvider", {
            get: function () { return this._listBox.textProvider; },
            set: function (v) {
                this._listBox.textProvider = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "stateProvider", {
            get: function () { return this._listBox.stateProvider; },
            set: function (v) {
                this._listBox.stateProvider = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "listBox", {
            get: function () { return this._listBox; },
            enumerable: true,
            configurable: true
        });
        return ListBoxElView;
    }(elview_6.BaseElView));
    exports.ListBoxElView = ListBoxElView;
    var LOOKUP_EVENTS = {
        obj_created: "object_created",
        obj_needed: "object_needed"
    };
    var LookupContent = (function (_super) {
        __extends(LookupContent, _super);
        function LookupContent(options) {
            if (options.contentOptions.name !== "lookup") {
                throw new Error(strUtils.format(lang_5.ERRS.ERR_ASSERTION_FAILED, "contentOptions.name === 'lookup'"));
            }
            _super.call(this, options);
            this._spanView = null;
            this._listBoxElView = null;
            this._isListBoxCachedExternally = false;
            this._valBinding = null;
            this._listBinding = null;
            this._value = null;
            this._objId = "lku" + coreUtils.getNewID();
        }
        LookupContent.prototype.init = function () {
            if (!!this._options.initContentFn) {
                this._options.initContentFn(this);
            }
        };
        LookupContent.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [LOOKUP_EVENTS.obj_created, LOOKUP_EVENTS.obj_needed].concat(base_events);
        };
        LookupContent.prototype.addOnObjectCreated = function (fn, nmspace) {
            this._addHandler(LOOKUP_EVENTS.obj_created, fn, nmspace);
        };
        LookupContent.prototype.removeOnObjectCreated = function (nmspace) {
            this._removeHandler(LOOKUP_EVENTS.obj_created, nmspace);
        };
        LookupContent.prototype.addOnObjectNeeded = function (fn, nmspace) {
            this._addHandler(LOOKUP_EVENTS.obj_needed, fn, nmspace);
        };
        LookupContent.prototype.removeOnObjectNeeded = function (nmspace) {
            this._removeHandler(LOOKUP_EVENTS.obj_needed, nmspace);
        };
        LookupContent.prototype.getListBoxElView = function () {
            if (!!this._listBoxElView)
                return this._listBoxElView;
            var lookUpOptions = this._options.options, objectKey = "listBoxElView";
            var args1 = { objectKey: objectKey, object: null };
            this.raiseEvent(LOOKUP_EVENTS.obj_needed, args1);
            if (!!args1.object) {
                this._isListBoxCachedExternally = true;
                this._listBoxElView = args1.object;
            }
            if (!!this._listBoxElView) {
                this._listBoxElView.listBox.addOnRefreshed(this.onListRefreshed, this.uniqueID, this);
                return this._listBoxElView;
            }
            var listBoxElView = this.createListBoxElView(lookUpOptions);
            var args2 = { objectKey: objectKey, object: listBoxElView, isCachedExternally: false };
            this.raiseEvent(LOOKUP_EVENTS.obj_created, args2);
            this._isListBoxCachedExternally = args2.isCachedExternally;
            this._listBoxElView = listBoxElView;
            this._listBoxElView.listBox.addOnRefreshed(this.onListRefreshed, this.uniqueID, this);
            return this._listBoxElView;
        };
        LookupContent.prototype.onListRefreshed = function () {
            this.updateTextValue();
        };
        LookupContent.prototype.createListBoxElView = function (lookUpOptions) {
            var options = {
                valuePath: lookUpOptions.valuePath,
                textPath: lookUpOptions.textPath,
                statePath: (!lookUpOptions.statePath) ? null : lookUpOptions.statePath,
                app: this.app,
                el: document.createElement("select")
            }, el = options.el, dataSource = parser_2.parser.resolvePath(this.app, lookUpOptions.dataSource);
            el.setAttribute("size", "1");
            var elView = new ListBoxElView(options);
            elView.dataSource = dataSource;
            return elView;
        };
        LookupContent.prototype.updateTextValue = function () {
            var spanView = this.getSpanView();
            spanView.value = this.getLookupText();
        };
        LookupContent.prototype.getLookupText = function () {
            var listBoxView = this.getListBoxElView();
            return listBoxView.listBox.getTextByValue(this.value);
        };
        LookupContent.prototype.getSpanView = function () {
            if (!!this._spanView) {
                return this._spanView;
            }
            var el = document.createElement("span"), displayInfo = this._options.displayInfo;
            var spanView = new span_1.SpanElView({ app: this.app, el: el });
            if (!!displayInfo) {
                if (!!displayInfo.displayCss) {
                    spanView.$el.addClass(displayInfo.displayCss);
                }
            }
            this._spanView = spanView;
            return this._spanView;
        };
        LookupContent.prototype.render = function () {
            this.cleanUp();
            this.createTargetElement();
            this._parentEl.appendChild(this._el);
        };
        LookupContent.prototype.createTargetElement = function () {
            var tgt, el, selectView, spanView;
            if (this.isEditing && this.getIsCanBeEdited()) {
                selectView = this.getListBoxElView();
                this._listBinding = this.bindToList(selectView);
                tgt = selectView;
            }
            else {
                spanView = this.getSpanView();
                this._valBinding = this.bindToValue();
                tgt = spanView;
            }
            this._el = tgt.el;
            this.updateCss();
            return tgt;
        };
        LookupContent.prototype.cleanUp = function () {
            if (!!this._el) {
                utils_18.Utils.dom.removeNode(this._el);
                this._el = null;
            }
            if (!!this._listBinding) {
                this._listBinding.destroy();
                this._listBinding = null;
            }
            if (!!this._valBinding) {
                this._valBinding.destroy();
                this._valBinding = null;
            }
            if (!!this._listBoxElView && this._isListBoxCachedExternally) {
                if (!this._listBoxElView.getIsDestroyCalled())
                    this._listBoxElView.listBox.removeOnRefreshed(this.uniqueID);
                this._listBoxElView = null;
            }
        };
        LookupContent.prototype.updateBindingSource = function () {
            if (!!this._valBinding) {
                this._valBinding.source = this._dataContext;
            }
            if (!!this._listBinding) {
                this._listBinding.source = this._dataContext;
            }
        };
        LookupContent.prototype.bindToValue = function () {
            if (!this._options.fieldName)
                return null;
            var options = {
                target: this, source: this._dataContext,
                targetPath: PROP_NAME.value, sourcePath: this._options.fieldName,
                mode: 1,
                converter: null, converterParam: null, isSourceFixed: false
            };
            return this.app.bind(options);
        };
        LookupContent.prototype.bindToList = function (selectView) {
            if (!this._options.fieldName)
                return null;
            var options = {
                target: selectView, source: this._dataContext,
                targetPath: PROP_NAME.selectedValue, sourcePath: this._options.fieldName,
                mode: 2,
                converter: null, converterParam: null, isSourceFixed: false
            };
            return this.app.bind(options);
        };
        LookupContent.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this.cleanUp();
            if (!!this._listBoxElView && !this._listBoxElView.getIsDestroyCalled()) {
                this._listBoxElView.listBox.removeOnRefreshed(this.uniqueID);
                if (!this._isListBoxCachedExternally)
                    this._listBoxElView.destroy();
            }
            this._listBoxElView = null;
            if (!!this._spanView) {
                this._spanView.destroy();
            }
            this._spanView = null;
            _super.prototype.destroy.call(this);
        };
        LookupContent.prototype.toString = function () {
            return "LookupContent";
        };
        Object.defineProperty(LookupContent.prototype, "value", {
            get: function () { return this._value; },
            set: function (v) {
                if (this._value !== v) {
                    this._value = v;
                    this.raisePropertyChanged(PROP_NAME.value);
                }
                this.updateTextValue();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LookupContent.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        return LookupContent;
    }(basic_1.BasicContent));
    exports.LookupContent = LookupContent;
    var ContentFactory = (function () {
        function ContentFactory(nextFactory) {
            this._nextFactory = nextFactory;
        }
        ContentFactory.prototype.getContentType = function (options) {
            if (options.name === "lookup") {
                return LookupContent;
            }
            if (!this._nextFactory)
                throw new Error(lang_5.ERRS.ERR_BINDING_CONTENT_NOT_FOUND);
            else
                return this._nextFactory.getContentType(options);
        };
        ContentFactory.prototype.createContent = function (options) {
            var contentType = this.getContentType(options);
            return new contentType(options);
        };
        ContentFactory.prototype.isExternallyCachable = function (contentType) {
            if (LookupContent === contentType)
                return true;
            return this._nextFactory.isExternallyCachable(contentType);
        };
        return ContentFactory;
    }());
    exports.ContentFactory = ContentFactory;
    factory_2.contentFactories.addFactory(function (nextFactory) {
        return new ContentFactory(nextFactory);
    });
    bootstrap_6.bootstrap.registerElView("select", ListBoxElView);
});
define("jriapp_ui/stackpanel", ["require", "exports", "jriapp_core/const", "jriapp_core/lang", "jriapp_core/object", "jriapp_utils/utils", "jriapp_core/bootstrap", "jriapp_elview/elview"], function (require, exports, const_21, lang_6, object_13, utils_19, bootstrap_7, elview_7) {
    "use strict";
    var $ = utils_19.Utils.dom.$, document = utils_19.Utils.dom.document, checks = utils_19.Utils.check, strUtils = utils_19.Utils.str, coreUtils = utils_19.Utils.core;
    var css = {
        stackpanel: "ria-stackpanel",
        item: "ria-stackpanel-item",
        horizontal: "ria-horizontal-panel",
        currentItem: "ria-current-item"
    };
    var PROP_NAME = {
        dataSource: "dataSource",
        currentItem: "currentItem",
        panel: "panel",
        panelEvents: "panelEvents"
    };
    var VERTICAL = "vertical", HORIZONTAL = "horizontal";
    var PNL_EVENTS = {
        item_clicked: "item_clicked"
    };
    var StackPanel = (function (_super) {
        __extends(StackPanel, _super);
        function StackPanel(options) {
            _super.call(this);
            var self = this;
            options = coreUtils.extend({
                app: null,
                el: null,
                dataSource: null,
                templateID: null,
                orientation: VERTICAL
            }, options);
            if (!!options.dataSource && !checks.isCollection(options.dataSource))
                throw new Error(lang_6.ERRS.ERR_STACKPNL_DATASRC_INVALID);
            if (!options.templateID)
                throw new Error(lang_6.ERRS.ERR_STACKPNL_TEMPLATE_INVALID);
            this._options = options;
            this._$el = $(options.el);
            var eltag = options.el.tagName.toLowerCase();
            if (eltag === "ul" || eltag === "ol")
                this._item_tag = "li";
            else
                this._item_tag = "div";
            if (this.orientation === HORIZONTAL) {
                this._$el.addClass(css.horizontal);
            }
            this._objId = "pnl" + coreUtils.getNewID();
            this._isKeyNavigation = false;
            this._event_scope = [this._item_tag, "[", const_21.DATA_ATTR.DATA_EVENT_SCOPE, '="', this._objId, '"]'].join("");
            this._currentItem = null;
            this._$el.addClass(css.stackpanel);
            this._itemMap = {};
            this._selectable = {
                getContainerEl: function () {
                    return self._getContainerEl();
                },
                getUniqueID: function () {
                    return self.uniqueID;
                },
                onKeyDown: function (key, event) {
                    self._onKeyDown(key, event);
                },
                onKeyUp: function (key, event) {
                    self._onKeyUp(key, event);
                }
            };
            this._$el.on("click", this._event_scope, function (e) {
                e.stopPropagation();
                bootstrap_7.bootstrap.currentSelectable = self;
                var $el = $(this), mappedItem = $el.data("data");
                self._onItemClicked(mappedItem.el, mappedItem.item);
            });
            if (!!options.dataSource) {
                this._bindDS();
            }
            bootstrap_7.bootstrap._getInternal().trackSelectable(this);
        }
        StackPanel.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [PNL_EVENTS.item_clicked].concat(base_events);
        };
        StackPanel.prototype.templateLoading = function (template) {
        };
        StackPanel.prototype.templateLoaded = function (template) {
        };
        StackPanel.prototype.templateUnLoading = function (template) {
        };
        StackPanel.prototype.addOnItemClicked = function (fn, nmspace, context) {
            this._addHandler(PNL_EVENTS.item_clicked, fn, nmspace, context);
        };
        StackPanel.prototype.removeOnItemClicked = function (nmspace) {
            this._removeHandler(PNL_EVENTS.item_clicked, nmspace);
        };
        StackPanel.prototype._getContainerEl = function () { return this._options.el; };
        StackPanel.prototype._onKeyDown = function (key, event) {
            var ds = this.dataSource, self = this;
            if (!ds)
                return;
            if (this.orientation === HORIZONTAL) {
                switch (key) {
                    case 37:
                        event.preventDefault();
                        this._isKeyNavigation = true;
                        if (ds.movePrev(true)) {
                            self.scrollToItem(ds.currentItem, true);
                        }
                        break;
                    case 39:
                        event.preventDefault();
                        this._isKeyNavigation = true;
                        if (ds.moveNext(true)) {
                            self.scrollToItem(ds.currentItem, false);
                        }
                        break;
                }
            }
            else {
                switch (key) {
                    case 38:
                        event.preventDefault();
                        this._isKeyNavigation = true;
                        if (ds.movePrev(true)) {
                            self.scrollToItem(ds.currentItem, true);
                        }
                        break;
                    case 40:
                        event.preventDefault();
                        this._isKeyNavigation = true;
                        if (ds.moveNext(true)) {
                            self.scrollToItem(ds.currentItem, false);
                        }
                        break;
                }
            }
            this._isKeyNavigation = false;
        };
        StackPanel.prototype._onKeyUp = function (key, event) {
        };
        StackPanel.prototype._updateCurrent = function (item, withScroll) {
            var self = this, old = self._currentItem, mappedItem;
            if (old !== item) {
                this._currentItem = item;
                if (!!old) {
                    mappedItem = self._itemMap[old._key];
                    if (!!mappedItem) {
                        $(mappedItem.el).removeClass(css.currentItem);
                    }
                }
                if (!!item) {
                    mappedItem = self._itemMap[item._key];
                    if (!!mappedItem) {
                        $(mappedItem.el).addClass(css.currentItem);
                        if (withScroll && !this._isKeyNavigation)
                            this.scrollToCurrent(false);
                    }
                }
                this.raisePropertyChanged(PROP_NAME.currentItem);
            }
        };
        StackPanel.prototype._onDSCurrentChanged = function (sender, args) {
            var ds = this.dataSource, cur = ds.currentItem;
            if (!cur)
                this._updateCurrent(null, false);
            else {
                this._updateCurrent(cur, true);
            }
        };
        StackPanel.prototype._onDSCollectionChanged = function (sender, args) {
            var self = this, items = args.items;
            switch (args.changeType) {
                case 2:
                    {
                        this._refresh();
                    }
                    break;
                case 1:
                    {
                        self._appendItems(args.items);
                    }
                    break;
                case 0:
                    items.forEach(function (item) {
                        self._removeItem(item);
                    });
                    break;
                case 3:
                    {
                        var mappedItem = self._itemMap[args.old_key];
                        if (!!mappedItem) {
                            delete self._itemMap[args.old_key];
                            self._itemMap[args.new_key] = mappedItem;
                        }
                    }
                    break;
                default:
                    throw new Error(strUtils.format(lang_6.ERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
            }
        };
        StackPanel.prototype._onItemStatusChanged = function (item, oldStatus) {
            var newStatus = item._aspect.status;
            var obj = this._itemMap[item._key];
            if (!obj)
                return;
            if (newStatus === 3) {
                $(obj.el).hide();
            }
            else if (oldStatus === 3) {
                $(obj.el).show();
            }
        };
        StackPanel.prototype._createTemplate = function (item) {
            var template = this.app.createTemplate(item, this);
            template.templateID = this.templateID;
            return template;
        };
        StackPanel.prototype._appendItems = function (newItems) {
            if (this.getIsDestroyCalled())
                return;
            var self = this;
            newItems.forEach(function (item) {
                if (!!self._itemMap[item._key])
                    return;
                self._appendItem(item);
            });
        };
        StackPanel.prototype._appendItem = function (item) {
            if (!item._key)
                return;
            var self = this, $item_el = self._createElement(this._item_tag), item_el = $item_el.get(0);
            $item_el.addClass(css.item);
            $item_el.attr(const_21.DATA_ATTR.DATA_EVENT_SCOPE, this.uniqueID);
            self._$el.append($item_el);
            var mappedItem = { el: item_el, template: null, item: item };
            $item_el.data("data", mappedItem);
            self._itemMap[item._key] = mappedItem;
            mappedItem.template = self._createTemplate(item);
            mappedItem.el.appendChild(mappedItem.template.el);
        };
        StackPanel.prototype._bindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
            ds.addOnCurrentChanged(self._onDSCurrentChanged, self._objId, self);
            ds.addOnStatusChanged(function (sender, args) {
                self._onItemStatusChanged(args.item, args.oldStatus);
            }, self._objId);
            this._refresh();
        };
        StackPanel.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.removeNSHandlers(self._objId);
        };
        StackPanel.prototype._createElement = function (tag) {
            return $(document.createElement(tag));
        };
        StackPanel.prototype._onItemClicked = function (div, item) {
            this._updateCurrent(item, false);
            this.dataSource.currentItem = item;
            this.raiseEvent(PNL_EVENTS.item_clicked, { item: item });
        };
        StackPanel.prototype._clearContent = function () {
            var self = this;
            self._$el.empty();
            coreUtils.forEachProp(self._itemMap, function (key) {
                self._removeItemByKey(key);
            });
        };
        StackPanel.prototype._removeItemByKey = function (key) {
            var self = this, mappedItem = self._itemMap[key];
            if (!mappedItem)
                return;
            delete self._itemMap[key];
            mappedItem.template.destroy();
            mappedItem.template = null;
            $(mappedItem.el).removeData("data");
            $(mappedItem.el).remove();
        };
        StackPanel.prototype._removeItem = function (item) {
            this._removeItemByKey(item._key);
        };
        StackPanel.prototype._refresh = function () {
            var ds = this.dataSource, self = this;
            this._clearContent();
            if (!ds)
                return;
            ds.forEach(function (item) {
                self._appendItem(item);
            });
        };
        StackPanel.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            bootstrap_7.bootstrap._getInternal().untrackSelectable(this);
            this._unbindDS();
            this._clearContent();
            this._$el.off("click", this._event_scope);
            this._$el.removeClass(css.stackpanel);
            if (this.orientation === HORIZONTAL)
                this._$el.removeClass(css.horizontal);
            this._$el = null;
            this._currentItem = null;
            this._itemMap = {};
            this._options = {};
            _super.prototype.destroy.call(this);
        };
        StackPanel.prototype.getISelectable = function () {
            return this._selectable;
        };
        StackPanel.prototype.scrollToItem = function (item, isUp) {
            if (!item)
                return;
            var mappedItem = this._itemMap[item._key];
            if (!mappedItem) {
                return;
            }
            var isVert = this.orientation === VERTICAL, $item = $(mappedItem.el), viewPortSize = isVert ? this._$el.innerHeight() : this._$el.innerWidth(), itemSize = isVert ? $item.outerHeight() : $item.outerWidth(), currentPos = isVert ? this._$el.scrollTop() : this._$el.scrollLeft(), offsetDiff = isVert ? (currentPos + $item.offset().top - this._$el.offset().top) : (currentPos + $item.offset().left - this._$el.offset().left);
            var contentSize = Math.min(itemSize, viewPortSize);
            var offset = viewPortSize - contentSize;
            var pos = !isUp ? Math.floor(offsetDiff - offset + 1) : Math.floor(offsetDiff - 1);
            if (pos < 0)
                pos = 0;
            if ((currentPos < offsetDiff && currentPos > (offsetDiff - offset))) {
                return;
            }
            if (isVert)
                this._$el.scrollTop(pos);
            else
                this._$el.scrollLeft(pos);
        };
        StackPanel.prototype.scrollToCurrent = function (isUp) {
            this.scrollToItem(this._currentItem, isUp);
        };
        StackPanel.prototype.focus = function () {
            this.scrollToCurrent(true);
            bootstrap_7.bootstrap.currentSelectable = this;
        };
        StackPanel.prototype.getDivElementByItem = function (item) {
            var mappedItem = this._itemMap[item._key];
            if (!mappedItem)
                return null;
            return mappedItem.el;
        };
        StackPanel.prototype.toString = function () {
            return "StackPanel";
        };
        Object.defineProperty(StackPanel.prototype, "app", {
            get: function () { return this._options.app; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "el", {
            get: function () { return this._options.el; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "orientation", {
            get: function () { return this._options.orientation; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "templateID", {
            get: function () { return this._options.templateID; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "dataSource", {
            get: function () { return this._options.dataSource; },
            set: function (v) {
                if (v === this.dataSource)
                    return;
                if (!!this.dataSource) {
                    this._unbindDS();
                }
                this._options.dataSource = v;
                if (!!this.dataSource)
                    this._bindDS();
                this.raisePropertyChanged(PROP_NAME.dataSource);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "currentItem", {
            get: function () { return this._currentItem; },
            enumerable: true,
            configurable: true
        });
        return StackPanel;
    }(object_13.BaseObject));
    exports.StackPanel = StackPanel;
    var StackPanelElView = (function (_super) {
        __extends(StackPanelElView, _super);
        function StackPanelElView(options) {
            _super.call(this, options);
            this._panel = null;
            this._panelEvents = null;
            this._createPanel(options);
        }
        StackPanelElView.prototype._createPanel = function (opts) {
            this._panel = new StackPanel(opts);
            this._panel.addOnItemClicked(function (sender, args) {
                var self = this;
                if (!!self._panelEvents) {
                    self._panelEvents.onItemClicked(args.item);
                }
            }, this.uniqueID, this);
            this._panel.addOnDestroyed(function () {
                var self = this;
                self._panel = null;
                self.invokePropChanged(PROP_NAME.panel);
                self.raisePropertyChanged(PROP_NAME.panel);
            }, this.uniqueID, this);
        };
        StackPanelElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._panel && !this._panel.getIsDestroyCalled()) {
                this._panel.destroy();
            }
            this._panelEvents = null;
            this._panel = null;
            _super.prototype.destroy.call(this);
        };
        StackPanelElView.prototype.toString = function () {
            return "StackPanelElView";
        };
        Object.defineProperty(StackPanelElView.prototype, "dataSource", {
            get: function () {
                if (this.getIsDestroyCalled() || !this._panel)
                    return undefined;
                return this._panel.dataSource;
            },
            set: function (v) {
                if (this._isDestroyCalled)
                    return;
                if (this.dataSource !== v) {
                    this._panel.dataSource = v;
                    this.raisePropertyChanged(PROP_NAME.dataSource);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanelElView.prototype, "panelEvents", {
            get: function () { return this._panelEvents; },
            set: function (v) {
                var old = this._panelEvents;
                if (v !== old) {
                    this._panelEvents = v;
                    this.raisePropertyChanged(PROP_NAME.panelEvents);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanelElView.prototype, "panel", {
            get: function () { return this._panel; },
            enumerable: true,
            configurable: true
        });
        return StackPanelElView;
    }(elview_7.BaseElView));
    exports.StackPanelElView = StackPanelElView;
    bootstrap_7.bootstrap.registerElView("stackpanel", StackPanelElView);
    bootstrap_7.bootstrap.registerElView("ul", StackPanelElView);
    bootstrap_7.bootstrap.registerElView("ol", StackPanelElView);
    bootstrap_7.bootstrap.loadOwnStyle("jriapp_ui");
});
define("jriapp_ui/tabs", ["require", "exports", "jriapp_utils/utils", "jriapp_core/bootstrap", "jriapp_elview/elview"], function (require, exports, utils_20, bootstrap_8, elview_8) {
    "use strict";
    var coreUtils = utils_20.Utils.core;
    var PROP_NAME = {
        tabIndex: "tabIndex",
        tabsEvents: "tabsEvents"
    };
    var TabsElView = (function (_super) {
        __extends(TabsElView, _super);
        function TabsElView(options) {
            _super.call(this, options);
            this._tabOpts = options;
            this._tabsEvents = null;
            this._tabsCreated = false;
            this._createTabs();
        }
        TabsElView.prototype._createTabs = function () {
            var $el = this.$el, self = this, tabOpts = {
                activate: function (e, tab) {
                    if (!!self._tabsEvents) {
                        self._tabsEvents.onTabSelected(self);
                    }
                    self.raisePropertyChanged(PROP_NAME.tabIndex);
                }
            };
            tabOpts = coreUtils.extend(tabOpts, self._tabOpts);
            $el.tabs(tabOpts);
            setTimeout(function () {
                if (self.getIsDestroyCalled())
                    return;
                self._tabsCreated = true;
                self._onTabsCreated();
                self.raisePropertyChanged(PROP_NAME.tabIndex);
            }, 0);
        };
        TabsElView.prototype._destroyTabs = function () {
            var $el = this.$el;
            utils_20.Utils.dom.destroyJQueryPlugin($el, "tabs");
            this._tabsCreated = false;
            if (!!this._tabsEvents) {
                this._tabsEvents.removeTabs();
            }
        };
        TabsElView.prototype._onTabsCreated = function () {
            var self = this, $el = self.$el;
            if (!!self._tabsEvents) {
                self._tabsEvents.addTabs(self);
            }
            if (!!self._tabsEvents) {
                self._tabsEvents.onTabSelected(self);
            }
        };
        TabsElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._destroyTabs();
            this._tabsEvents = null;
            _super.prototype.destroy.call(this);
        };
        TabsElView.prototype.toString = function () {
            return "TabsElView";
        };
        Object.defineProperty(TabsElView.prototype, "tabsEvents", {
            get: function () { return this._tabsEvents; },
            set: function (v) {
                var old = this._tabsEvents;
                if (v !== old) {
                    if (!!old)
                        old.removeTabs();
                    this._tabsEvents = v;
                    this.raisePropertyChanged(PROP_NAME.tabsEvents);
                    if (this._tabsCreated) {
                        this._onTabsCreated();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TabsElView.prototype, "tabIndex", {
            get: function () {
                return this.$el.tabs("option", "active");
            },
            set: function (v) {
                this.$el.tabs("option", "active", v);
            },
            enumerable: true,
            configurable: true
        });
        return TabsElView;
    }(elview_8.BaseElView));
    exports.TabsElView = TabsElView;
    bootstrap_8.bootstrap.registerElView("tabs", TabsElView);
});
define("jriapp_ui", ["require", "exports", "jriapp_core/bootstrap", "jriapp_ui/dialog", "jriapp_ui/dynacontent", "jriapp_ui/datagrid/datagrid", "jriapp_ui/pager", "jriapp_ui/listbox", "jriapp_ui/stackpanel", "jriapp_ui/tabs"], function (require, exports, bootstrap_9, dialog_2, dynacontent_1, datagrid_1, pager_1, listbox_1, stackpanel_1, tabs_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    exports.DIALOG_ACTION = dialog_2.DIALOG_ACTION;
    exports.DataEditDialog = dialog_2.DataEditDialog;
    exports.DialogVM = dialog_2.DialogVM;
    exports.DynaContentElView = dynacontent_1.DynaContentElView;
    exports.DataGrid = datagrid_1.DataGrid;
    exports.DataGridColumn = datagrid_1.DataGridColumn;
    exports.DataGridRow = datagrid_1.DataGridRow;
    exports.DataGridElView = datagrid_1.DataGridElView;
    exports.ROW_POSITION = datagrid_1.ROW_POSITION;
    exports.findDataGrid = datagrid_1.findDataGrid;
    exports.getDataGrids = datagrid_1.getDataGrids;
    __export(pager_1);
    exports.ListBox = listbox_1.ListBox;
    exports.ListBoxElView = listbox_1.ListBoxElView;
    exports.LookupContent = listbox_1.LookupContent;
    __export(stackpanel_1);
    __export(tabs_1);
    bootstrap_9.bootstrap.loadOwnStyle("jriapp_ui");
});
