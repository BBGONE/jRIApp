var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp", "jriapp_ui", "./folderBrowserSvc", "common"], function (require, exports, RIAPP, uiMOD, FOLDERBROWSER_SVC, COMMON) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, coreUtils = RIAPP.Utils.core, $ = uiMOD.$;
    var FolderBrowser = (function (_super) {
        __extends(FolderBrowser, _super);
        function FolderBrowser(app, options) {
            _super.call(this, app);
            var self = this;
            self._includeFiles = options.includeFiles;
            self._$tree = options.$tree;
            this._infotype = null;
            self._dbSet = self.dbContext.dbSets.FileSystemObject;
            self._loadRootCommand = new RIAPP.Command(function (s, a) {
                self.loadRootFolder();
            }, self, function (s, a) {
                return true;
            });
            this._createDynaTree();
        }
        FolderBrowser.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return ['node_selected'].concat(base_events);
        };
        FolderBrowser.prototype.addOnNodeSelected = function (fn, namespace) {
            this.addHandler('node_selected', fn, namespace);
        };
        FolderBrowser.prototype._createDynaTree = function () {
            var self = this;
            this._$tree.dynatree({
                onActivate: function (node) {
                    self.raiseEvent('node_selected', { item: node.data.item });
                },
                onClick: function (node, event) {
                },
                onDblClick: function (node, event) {
                },
                onExpand: function (flag, node) {
                    if (!flag) {
                        node.visit(function (child) {
                            var item = child.data.item;
                            if (!item)
                                return;
                            item._aspect.deleteItem();
                        }, false);
                        node.removeChildren();
                        self.dbContext.acceptChanges();
                    }
                },
                onLazyRead: function (node) {
                    self.loadChildren(node.data.item).then(function () {
                        self._addItemsToNode(node, node.data.item.Children);
                        node.setLazyNodeStatus(DTNodeStatus_Ok);
                    });
                }
            });
            this._$treeRoot = this._$tree.dynatree("getRoot");
        };
        FolderBrowser.prototype.loadRootFolder = function () {
            var self = this, query = self._dbSet.createReadRootQuery({ includeFiles: self._includeFiles, infoType: self.infotype });
            query.isClearPrevData = true;
            var promise = query.load();
            promise.then(function (res) {
                self._onLoaded(res.fetchedItems);
            });
            return promise;
        };
        FolderBrowser.prototype.loadChildren = function (item) {
            var self = this, query = self._dbSet.createReadChildrenQuery({ parentKey: item.Key, level: item.Level + 1, path: item.fullPath, includeFiles: self._includeFiles, infoType: self.infotype });
            query.isClearPrevData = false;
            var promise = query.load();
            promise.then(function (res) {
                self._onLoaded(res.fetchedItems);
            });
            return promise;
        };
        FolderBrowser.prototype._onLoaded = function (fetchedItems) {
            var self = this;
            try {
                var topLevel = fetchedItems.filter(function (item) {
                    return item.Level == 0;
                });
                if (topLevel.length > 0) {
                    self._addItemsToTree(topLevel);
                }
            }
            catch (ex) {
                utils.err.reThrow(ex, self.handleError(ex, self));
            }
        };
        FolderBrowser.prototype._addItemsToNode = function (node, items) {
            var arr = items.map(function (item) {
                return { title: item.Name, isLazy: item.HasSubDirs, isFolder: item.IsFolder, item: item };
            });
            node.removeChildren();
            node.addChild(arr);
        };
        FolderBrowser.prototype._addItemsToTree = function (items) {
            this._addItemsToNode(this._$treeRoot, items);
        };
        FolderBrowser.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this;
            if (!!this._$treeRoot)
                this._$treeRoot.removeChildren();
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(FolderBrowser.prototype, "dbContext", {
            get: function () { return this.app.dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderBrowser.prototype, "loadRootCommand", {
            get: function () { return this._loadRootCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderBrowser.prototype, "infotype", {
            get: function () { return this._infotype; },
            set: function (v) { if (this._infotype !== v) {
                this._infotype = v;
                this.raisePropertyChanged('infotype');
            } },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderBrowser.prototype, "dbSet", {
            get: function () { return this._dbSet; },
            enumerable: true,
            configurable: true
        });
        return FolderBrowser;
    }(RIAPP.ViewModel));
    exports.FolderBrowser = FolderBrowser;
    function fn_getTemplateElement(template, name) {
        var t = template;
        var els = t.findElByDataName(name);
        if (els.length < 1)
            return null;
        return els[0];
    }
    ;
    var FolderBrowserVM = (function (_super) {
        __extends(FolderBrowserVM, _super);
        function FolderBrowserVM(app, options) {
            _super.call(this, app);
            var self = this;
            this._selectedItem = null;
            this._dialogVM = new uiMOD.DialogVM(app);
            this._folderBrowser = null;
            this._options = options;
            this._infotype = null;
            var title = self._options.includeFiles ? 'Выбор файла' : 'Выбор папки';
            var dialogOptions = {
                templateID: 'treeTemplate',
                width: 650,
                height: 700,
                title: title,
                fn_OnTemplateCreated: function (template) {
                    var dialog = this;
                    var $tree = $(fn_getTemplateElement(template, 'tree'));
                    var options = coreUtils.merge(self._options, { $tree: $tree });
                    self._folderBrowser = new FolderBrowser(app, options);
                    self._folderBrowser.addOnNodeSelected(function (s, a) {
                        self.selectedItem = a.item;
                    }, self.uniqueID);
                    self.raisePropertyChanged('folderBrowser');
                },
                fn_OnShow: function (dialog) {
                    self.selectedItem = null;
                    self._folderBrowser.infotype = self.infotype;
                    self._folderBrowser.loadRootFolder();
                },
                fn_OnClose: function (dialog) {
                    if (dialog.result == 'ok' && !!self._selectedItem) {
                        self._onSelected(self._selectedItem, self._selectedItem.fullPath);
                    }
                }
            };
            this._dialogVM.createDialog('folderBrowser', dialogOptions);
            this._dialogCommand = new RIAPP.Command(function (sender, param) {
                try {
                    self.showDialog();
                }
                catch (ex) {
                    self.handleError(ex, this);
                }
            }, self, function (sender, param) {
                return true;
            });
        }
        FolderBrowserVM.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return ['item_selected'].concat(base_events);
        };
        FolderBrowserVM.prototype.addOnItemSelected = function (fn, namespace) {
            this.addHandler('item_selected', fn, namespace);
        };
        FolderBrowserVM.prototype._onSelected = function (item, fullPath) {
            this.raiseEvent('item_selected', { fullPath: fullPath });
        };
        FolderBrowserVM.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this;
            if (!!self._folderBrowser) {
                self._folderBrowser.destroy();
                self._folderBrowser = null;
            }
            if (!!self._dialogVM) {
                self._dialogVM.destroy();
                self._dialogVM = null;
            }
            _super.prototype.destroy.call(this);
        };
        FolderBrowserVM.prototype.showDialog = function () {
            this._dialogVM.showDialog('folderBrowser', this);
        };
        Object.defineProperty(FolderBrowserVM.prototype, "folderBrowser", {
            get: function () { return this._folderBrowser; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderBrowserVM.prototype, "selectedItem", {
            get: function () { return this._selectedItem; },
            set: function (v) {
                if (v !== this._selectedItem) {
                    this._selectedItem = v;
                    this.raisePropertyChanged('selectedItem');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderBrowserVM.prototype, "dialogCommand", {
            get: function () { return this._dialogCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderBrowserVM.prototype, "includeFiles", {
            get: function () { return this._options.includeFiles; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FolderBrowserVM.prototype, "infotype", {
            get: function () { return this._infotype; },
            set: function (v) { if (this._infotype !== v) {
                this._infotype = v;
                this.raisePropertyChanged('infotype');
            } },
            enumerable: true,
            configurable: true
        });
        return FolderBrowserVM;
    }(RIAPP.ViewModel));
    exports.FolderBrowserVM = FolderBrowserVM;
    var DemoApplication = (function (_super) {
        __extends(DemoApplication, _super);
        function DemoApplication(options) {
            _super.call(this, options);
            var self = this;
            this._errorVM = null;
            this._fbrowserVM1 = null;
            this._fbrowserVM2 = null;
            this._selectedPath = null;
        }
        DemoApplication.prototype.onStartUp = function () {
            var self = this, options = self.options;
            self._dbContext = new FOLDERBROWSER_SVC.DbContext();
            self._dbContext.initialize({
                serviceUrl: options.service_url,
                permissions: options.permissionInfo
            });
            self._dbContext.dbSets.FileSystemObject.definefullPathField(function (item) {
                return self.getFullPath(item);
            });
            self._dbContext.dbSets.FileSystemObject.defineExtraPropsField(function (item) {
                return null;
            });
            this._errorVM = new COMMON.ErrorViewModel(this);
            this._fbrowserVM1 = new FolderBrowserVM(this, { service_url: options.service_url, permissionInfo: options.permissionInfo, includeFiles: false });
            this._fbrowserVM2 = new FolderBrowserVM(this, { service_url: options.service_url, permissionInfo: options.permissionInfo, includeFiles: true });
            this._fbrowserVM1.infotype = "BASE_ROOT";
            this._fbrowserVM2.infotype = "BASE_ROOT";
            this._fbrowserVM1.addOnItemSelected(function (s, a) {
                self._selectedPath = s.infotype + '\\' + a.fullPath;
                self.raisePropertyChanged('selectedPath');
            });
            this._fbrowserVM2.addOnItemSelected(function (s, a) {
                self._selectedPath = s.infotype + '\\' + a.fullPath;
                self.raisePropertyChanged('selectedPath');
            });
            this.addOnError(function (sender, data) {
                debugger;
                data.isHandled = true;
                self.errorVM.error = data.error;
                self.errorVM.showDialog();
            });
            _super.prototype.onStartUp.call(this);
        };
        DemoApplication.prototype._getFullPath = function (item, path) {
            var self = this, part;
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
        DemoApplication.prototype.getFullPath = function (item) {
            return this._getFullPath(item, null);
        };
        DemoApplication.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this;
            try {
                self._errorVM.destroy();
                self._fbrowserVM1.destroy();
                self._fbrowserVM2.destroy();
            }
            finally {
                _super.prototype.destroy.call(this);
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
        Object.defineProperty(DemoApplication.prototype, "fbrowserVM1", {
            get: function () { return this._fbrowserVM1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "fbrowserVM2", {
            get: function () { return this._fbrowserVM2; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "selectedPath", {
            get: function () { return this._selectedPath; },
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
    RIAPP.bootstrap.addOnError(function (sender, args) {
        debugger;
        alert(args.error.message);
    });
    function start(mainOptions) {
        mainOptions.modulesInits = {
            "COMMON": COMMON.initModule
        };
        bootstrap.startApp(function () {
            return new DemoApplication(mainOptions);
        }, function (thisApp) { });
    }
    exports.start = start;
});
