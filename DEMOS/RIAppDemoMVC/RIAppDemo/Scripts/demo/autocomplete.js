var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp", "./common"], function (require, exports, RIAPP, COMMON) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;
    function findElemViewInTemplate(template, name) {
        var arr = template.findElViewsByDataName(name);
        if (!!arr && arr.length > 0)
            return arr[0];
        else
            return null;
    }
    function findElemInTemplate(template, name) {
        var arr = template.findElByDataName(name);
        if (!!arr && arr.length > 0)
            return arr[0];
        else
            return null;
    }
    var AutoCompleteElView = (function (_super) {
        __extends(AutoCompleteElView, _super);
        function AutoCompleteElView(options) {
            _super.call(this, options);
            var self = this;
            this._templateId = options.templateId;
            this._fieldName = options.fieldName;
            this._dbSetName = options.dbSetName;
            this._queryName = options.queryName;
            this._dbContextName = options.dbContext;
            this._minTextLength = (!!options.minTextLength) ? options.minTextLength : 1;
            this._template = null;
            this._gridDataSource = null;
            this._prevText = null;
            this._selectedItem = null;
            this._template = null;
            this._$dropDown = null;
            this._loadTimeout = null;
            this._dataContext = null;
            this._isLoading = false;
            this._width = options.width || '200px';
            this._height = options.height || '300px';
            this._lookupGrid = null;
            this._btnOk = null;
            this._btnCancel = null;
            this._$dlg = null;
            var $el = this.$el;
            $el.on('change.' + this.uniqueID, function (e) {
                e.stopPropagation();
                self._onTextChange();
                self.raisePropertyChanged('value');
            });
            $el.on('keyup.' + this.uniqueID, function (e) {
                e.stopPropagation();
                self._onKeyUp(e.target.value);
                self._onKeyPress(e.keyCode);
            });
            $el.on('keypress.' + this.uniqueID, function (e) {
                e.stopPropagation();
            });
            this._isOpen = false;
            this._createGridDataSource();
            this._template = this._createTemplate();
            this._$dropDown = utils.dom.$(utils.dom.document.createElement("div"));
            this._$dropDown.css({
                "position": "absolute",
                "left": "-2000px",
                "top": "-1000px",
                "z-index": "10000",
                "background-color": "white",
                "border": "1px solid gray",
                "width": this._width,
                "height": this._height
            });
            this._$dropDown.append(this._template.el);
            this._template.el.style.height = '100%';
            this._template.el.style.width = '100%';
            utils.dom.document.body.appendChild(this._$dropDown.get(0));
        }
        AutoCompleteElView.prototype.templateLoading = function (template) {
        };
        AutoCompleteElView.prototype.templateLoaded = function (template, error) {
            if (this._isDestroyCalled)
                return;
            var self = this;
            var gridElView = findElemViewInTemplate(template, 'lookupGrid');
            if (!!gridElView) {
                this._lookupGrid = gridElView.grid;
            }
            this._btnOk = findElemInTemplate(template, 'btnOk');
            this._btnCancel = findElemInTemplate(template, 'btnCancel');
            utils.dom.$(this._btnOk).click(function () {
                self._updateSelection();
                self._hide();
            });
            utils.dom.$(this._btnCancel).click(function () {
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
            var dbContext = this.app.getObject(this._dbContextName);
            if (!dbContext) {
                throw new Error(utils.str.format('dbContext with the name: {0} is not registered', this._dbContextName));
            }
            return dbContext;
        };
        AutoCompleteElView.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return ['hide', 'show'].concat(base_events);
        };
        AutoCompleteElView.prototype._createTemplate = function () {
            var t = this.app.createTemplate(this, this);
            t.templateID = this._templateId;
            return t;
        };
        AutoCompleteElView.prototype._onTextChange = function () {
        };
        AutoCompleteElView.prototype._onKeyUp = function (text) {
            var self = this;
            clearTimeout(this._loadTimeout);
            if (!!text && text.length >= self._minTextLength) {
                this._loadTimeout = setTimeout(function () {
                    if (self._isDestroyCalled)
                        return;
                    if (self._prevText != text) {
                        self._prevText = text;
                        if (!self._isOpen)
                            self._open();
                        self.load(text);
                    }
                }, 500);
            }
            else
                self.gridDataSource.clear();
        };
        AutoCompleteElView.prototype._onKeyPress = function (keyCode) {
            if (keyCode === 27) {
                this._hideAsync();
                return;
            }
            if (keyCode === 13) {
                this._updateSelection();
                this._hideAsync();
                return;
            }
        };
        AutoCompleteElView.prototype._hideAsync = function () {
            var self = this;
            setTimeout(function () {
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
                of: utils.dom.$(this.el),
                offset: "0 0"
            });
        };
        AutoCompleteElView.prototype._onShow = function () {
            this.raiseEvent('show', {});
        };
        AutoCompleteElView.prototype._onHide = function () {
            this.raiseEvent('hide', {});
        };
        AutoCompleteElView.prototype._open = function () {
            if (this._isOpen)
                return;
            var self = this;
            this._$dlg = this.$el.closest(".ui-dialog");
            var dialogdrag = "dialogdrag." + this.uniqueID;
            this._$dlg.on(dialogdrag, null, function (event) {
                if (!self._isOpen)
                    return null;
                self._updatePosition();
                return null;
            });
            this._updatePosition();
            if (!!this._lookupGrid) {
                this._lookupGrid.addOnCellDblClicked(function (s, a) {
                    self._updateSelection();
                    self._hide();
                }, this.uniqueID);
                utils.dom.$(utils.dom.document).on('keyup.' + this.uniqueID, function (e) {
                    e.stopPropagation();
                    if (bootstrap.currentSelectable === self._lookupGrid)
                        self._onKeyPress(e.which);
                });
            }
            this._isOpen = true;
            this._onShow();
        };
        AutoCompleteElView.prototype._hide = function () {
            var self = this;
            if (!this._isOpen)
                return;
            utils.dom.$(utils.dom.document).off('.' + this.uniqueID);
            this._$dlg.off('.' + this.uniqueID);
            if (!!this._lookupGrid) {
                this._lookupGrid.removeNSHandlers(this.uniqueID);
            }
            this._$dropDown.css("left", "-2000px");
            this._isOpen = false;
            this._onHide();
        };
        AutoCompleteElView.prototype.load = function (str) {
            var self = this, query = this.gridDataSource.createQuery(this._queryName);
            query.pageSize = 50;
            query.isClearPrevData = true;
            COMMON.addTextQuery(query, this._fieldName, str + '%');
            query.orderBy(this._fieldName);
            this._isLoading = true;
            this.raisePropertyChanged('isLoading');
            query.load().always(function (res) {
                self._isLoading = false;
                self.raisePropertyChanged('isLoading');
            });
        };
        AutoCompleteElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._hide();
            if (!!this._lookupGrid) {
                this._lookupGrid = null;
            }
            if (!!this._template) {
                this._template.destroy();
                this._template = null;
                this._$dropDown = null;
            }
            this._gridDataSource = null;
            this._dataContext = null;
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(AutoCompleteElView.prototype, "fieldName", {
            get: function () { return this._fieldName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "templateId", {
            get: function () { return this._templateId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "currentSelection", {
            get: function () {
                if (this._gridDataSource.currentItem)
                    return this._gridDataSource.currentItem[this._fieldName];
                else
                    return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "template", {
            get: function () { return this._template; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "dataContext", {
            get: function () { return this._dataContext; },
            set: function (v) {
                if (this._dataContext !== v) {
                    this._dataContext = v;
                    this.raisePropertyChanged('dataContext');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "gridDataSource", {
            get: function () { return this._gridDataSource; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AutoCompleteElView.prototype, "value", {
            get: function () {
                return this.$el.val();
            },
            set: function (v) {
                var x = this.$el.val();
                var str = '' + v;
                v = (v === null) ? '' : str;
                if (x !== v) {
                    this.$el.val(v);
                    this._prevText = v;
                    this.raisePropertyChanged('value');
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
    }(RIAPP.InputElView));
    exports.AutoCompleteElView = AutoCompleteElView;
    function initModule(app) {
        app.registerElView('autocomplete', AutoCompleteElView);
    }
    exports.initModule = initModule;
    ;
});
