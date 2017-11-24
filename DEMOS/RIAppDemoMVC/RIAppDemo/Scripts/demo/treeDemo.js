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
define(["require", "exports", "jriapp", "jriapp_db", "./folderBrowserSvc", "common"], function (require, exports, RIAPP, dbMOD, FOLDERBROWSER_SVC, COMMON) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, infoType = "BASE_ROOT";
    var ExProps = (function (_super) {
        __extends(ExProps, _super);
        function ExProps(item, dbContext) {
            var _this = _super.call(this) || this;
            var self = _this;
            _this._item = item;
            _this._dbContext = dbContext;
            _this._childView = null;
            if (item.HasSubDirs)
                _this._childView = _this.createChildView();
            _this._dbSet = item._aspect.dbSet;
            self._toggleCommand = new RIAPP.Command(function (s, a) {
                if (!self.childView)
                    return;
                if (self.childView.count <= 0) {
                    self.loadChildren();
                }
                else {
                    self.childView.items.forEach(function (item) {
                        item._aspect.deleteItem();
                    });
                    self._dbSet.acceptChanges();
                    self.refreshCss();
                }
            }, self, function (s, a) {
                return !!self.childView;
            });
            self._clickCommand = new RIAPP.Command(function (s, a) {
                if (!!self._clickTimeOut) {
                    clearTimeout(self._clickTimeOut);
                    self._clickTimeOut = null;
                    self.objEvents.raise('dblclicked', { item: self._item });
                }
                else {
                    self._clickTimeOut = setTimeout(function () {
                        self._clickTimeOut = null;
                        self.objEvents.raise('clicked', { item: self._item });
                    }, 350);
                }
            }, self, null);
            return _this;
        }
        ExProps.prototype.addOnClicked = function (fn, nmspace) {
            this.objEvents.on('clicked', fn, nmspace);
        };
        ExProps.prototype.removeOnClicked = function (nmspace) {
            this.objEvents.off('clicked', nmspace);
        };
        ExProps.prototype.addOnDblClicked = function (fn, nmspace) {
            this.objEvents.on('dblclicked', fn, nmspace);
        };
        ExProps.prototype.removeOnDblClicked = function (nmspace) {
            this.objEvents.off('dblclicked', nmspace);
        };
        ExProps.prototype.createChildView = function () {
            var self = this;
            var dvw = new dbMOD.ChildDataView({
                association: self._dbContext.associations.getChildToParent(),
                parentItem: self._item
            });
            dvw.addOnFill(function (s, a) {
                self.refreshCss();
            });
            return dvw;
        };
        ExProps.prototype.loadChildren = function () {
            var self = this, query = self._dbSet.createReadChildrenQuery({ parentKey: self.item.Key, level: self.item.Level + 1, path: self.item.fullPath, includeFiles: false, infoType: infoType });
            query.isClearPrevData = false;
            var promise = query.load();
            return promise;
        };
        ExProps.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            var self = this;
            clearTimeout(self._clickTimeOut);
            if (!!this._childView) {
                this._childView.parentItem = null;
                this._childView.dispose();
                this._childView = null;
            }
            this._dbSet = null;
            this._dbContext = null;
            this._item = null;
            _super.prototype.dispose.call(this);
        };
        ExProps.prototype.refreshCss = function () {
            this.objEvents.raiseProp('css1');
            this.objEvents.raiseProp('css2');
        };
        Object.defineProperty(ExProps.prototype, "item", {
            get: function () { return this._item; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExProps.prototype, "childView", {
            get: function () { return this._childView; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExProps.prototype, "toggleCommand", {
            get: function () { return this._toggleCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExProps.prototype, "clickCommand", {
            get: function () { return this._clickCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExProps.prototype, "css1", {
            get: function () {
                var children_css = this.item.HasSubDirs ? ' dynatree-has-children' : '';
                var folder_css = this.item.IsFolder ? ' dynatree-folder' : '';
                var css = '';
                if (!this._childView)
                    css = 'dynatree-node dynatree-exp dynatree-ico-cf';
                else
                    css = this._childView.count > 0 ? 'dynatree-node dynatree-exp-e dynatree-ico-ef' : 'dynatree-node dynatree-exp dynatree-ico-cf';
                css += children_css;
                css += folder_css;
                return css;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExProps.prototype, "css2", {
            get: function () {
                return this.item.HasSubDirs ? 'dynatree-expander' : 'dynatree-connector';
            },
            enumerable: true,
            configurable: true
        });
        return ExProps;
    }(RIAPP.BaseObject));
    exports.ExProps = ExProps;
    var FolderBrowser = (function (_super) {
        __extends(FolderBrowser, _super);
        function FolderBrowser(app, options) {
            var _this = _super.call(this, app) || this;
            var self = _this;
            self._dbSet = self.dbContext.dbSets.FileSystemObject;
            self._collapseCommand = new RIAPP.Command(function (s, a) {
                self.collapse();
            }, self, function (s, a) {
                return true;
            });
            self._reloadCommand = new RIAPP.Command(function (s, a) {
                self.loadAll();
            }, self, function (s, a) {
                return true;
            });
            self.dbContext.dbSets.FileSystemObject.definefullPathField(function (item) {
                return self.getFullPath(item);
            });
            self.dbContext.dbSets.FileSystemObject.defineExtraPropsField(function (item) {
                var res = item._aspect.getCustomVal("exprop");
                if (!res) {
                    res = new ExProps(item, self.dbContext);
                    item._aspect.setCustomVal("exprop", res);
                    res.addOnClicked(function (s, a) { self._onItemClicked(a.item); });
                    res.addOnDblClicked(function (s, a) { self._onItemDblClicked(a.item); });
                }
                return res;
            });
            _this._rootView = _this.createDataView();
            return _this;
        }
        FolderBrowser.prototype._onItemClicked = function (item) {
            alert("clicked item: " + item.fullPath);
        };
        FolderBrowser.prototype._onItemDblClicked = function (item) {
            alert("double clicked item: " + item.fullPath);
        };
        FolderBrowser.prototype._getFullPath = function (item, path) {
            var self = this;
            var part;
            if (utils.check.isNt(path))
                path = '';
            if (!path)
                part = '';
            else
                part = '\\' + path;
            var parent = self.dbContext.associations.getChildToParent().getParentItem(item);
            if (!parent) {
                return item.Name + part;
            }
            else {
                return self._getFullPath(parent, item.Name + part);
            }
        };
        FolderBrowser.prototype.getFullPath = function (item) {
            return this._getFullPath(item, null);
        };
        FolderBrowser.prototype.createDataView = function () {
            var self = this;
            var res = new dbMOD.DataView({
                dataSource: self._dbSet,
                fn_filter: function (item) {
                    return item.Level == 0;
                }
            });
            return res;
        };
        FolderBrowser.prototype.collapse = function () {
            var self = this;
            var items = self._dbSet.items.filter(function (item) {
                return (item.Level > 0);
            });
            items.forEach(function (item) {
                item._aspect.deleteItem();
            });
            self._dbSet.acceptChanges();
            self._dbSet.items.forEach(function (item) {
                var exProps = item._aspect.getCustomVal("exprop");
                if (!exProps)
                    return;
                exProps.refreshCss();
            });
        };
        FolderBrowser.prototype.loadRootFolder = function () {
            var self = this, query = self._dbSet.createReadRootQuery({ includeFiles: false, infoType: infoType });
            query.isClearPrevData = true;
            var promise = query.load();
            promise.then(function (res) {
            });
            return promise;
        };
        FolderBrowser.prototype.loadAll = function () {
            var self = this, query = self._dbSet.createReadAllQuery({ includeFiles: false, infoType: infoType });
            query.isClearPrevData = true;
            var promise = query.load();
            return promise;
        };
        FolderBrowser.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(FolderBrowser.prototype, "dbContext", {
            get: function () { return this.app.dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderBrowser.prototype, "collapseCommand", {
            get: function () { return this._collapseCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderBrowser.prototype, "reloadCommand", {
            get: function () { return this._reloadCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderBrowser.prototype, "dbSet", {
            get: function () { return this._dbSet; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderBrowser.prototype, "rootView", {
            get: function () { return this._rootView; },
            enumerable: true,
            configurable: true
        });
        return FolderBrowser;
    }(RIAPP.ViewModel));
    exports.FolderBrowser = FolderBrowser;
    var DemoApplication = (function (_super) {
        __extends(DemoApplication, _super);
        function DemoApplication(options) {
            var _this = _super.call(this, options) || this;
            _this._errorVM = null;
            _this._fbrowserVM = null;
            return _this;
        }
        DemoApplication.prototype.onStartUp = function () {
            var self = this, options = self.options;
            self._dbContext = new FOLDERBROWSER_SVC.DbContext();
            self._dbContext.initialize({
                serviceUrl: options.service_url,
                permissions: options.permissionInfo
            });
            this._errorVM = new COMMON.ErrorViewModel(this);
            this._fbrowserVM = new FolderBrowser(this, { service_url: options.service_url, permissionInfo: options.permissionInfo });
            this.objEvents.addOnError(function (sender, data) {
                debugger;
                data.isHandled = true;
                self.errorVM.error = data.error;
                self.errorVM.showDialog();
            });
            _super.prototype.onStartUp.call(this);
        };
        DemoApplication.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            var self = this;
            try {
                self._errorVM.dispose();
                self._fbrowserVM.dispose();
            }
            finally {
                _super.prototype.dispose.call(this);
            }
        };
        Object.defineProperty(DemoApplication.prototype, "options", {
            get: function () { return this._options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "errorVM", {
            get: function () { return this._errorVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "TEXT", {
            get: function () { return RIAPP.LocaleSTRS.TEXT; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "fbrowserVM", {
            get: function () { return this._fbrowserVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "dbContext", {
            get: function () { return this._dbContext; },
            enumerable: true,
            configurable: true
        });
        return DemoApplication;
    }(RIAPP.Application));
    exports.DemoApplication = DemoApplication;
    RIAPP.bootstrap.objEvents.addOnError(function (sender, args) {
        debugger;
        alert(args.error.message);
    });
    function start(mainOptions) {
        mainOptions.modulesInits = {
            "COMMON": COMMON.initModule
        };
        bootstrap.stylesLoader.loadStyles(mainOptions.styles);
        return bootstrap.startApp(function () {
            return new DemoApplication(mainOptions);
        }, function (thisApp) { });
    }
    exports.start = start;
});
