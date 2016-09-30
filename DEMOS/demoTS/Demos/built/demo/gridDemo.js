var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp", "jriapp_db", "jriapp_ui", "./demoDB", "./common", "./header", "./ssevents", "./websocket"], function (require, exports, RIAPP, dbMOD, uiMOD, DEMODB, COMMON, HEADER, SSEVENTS, WEBSOCK) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, coreUtils = RIAPP.Utils.core, $ = utils.dom.$;
    var ResetCommand = (function (_super) {
        __extends(ResetCommand, _super);
        function ResetCommand() {
            _super.apply(this, arguments);
        }
        ResetCommand.prototype.Action = function (sender, param) {
            this.thisObj.reset();
        };
        ResetCommand.prototype.getIsCanExecute = function (sender, param) {
            return true;
        };
        return ResetCommand;
    }(RIAPP.BaseCommand));
    var ProductsFilter = (function (_super) {
        __extends(ProductsFilter, _super);
        function ProductsFilter(app) {
            _super.call(this);
            var self = this;
            this._app = app;
            this._prodNumber = null;
            this._name = null;
            this._parentCategoryID = null;
            this._childCategoryID = null;
            this._selectedCategory = null;
            this._selectedModel = null;
            this._modelID = null;
            this._saleStart1 = null;
            this._saleStart2 = null;
            this._parentCategories = new dbMOD.DataView({
                dataSource: this.ProductCategories,
                fn_sort: function (a, b) { return a.ProductCategoryID - b.ProductCategoryID; },
                fn_filter: function (item) { return item.ParentProductCategoryID == null; }
            });
            this._childCategories = new dbMOD.DataView({
                dataSource: this.ProductCategories,
                fn_sort: function (a, b) { return a.ProductCategoryID - b.ProductCategoryID; },
                fn_filter: function (item) { return item.ParentProductCategoryID !== null && item.ParentProductCategoryID == self.parentCategoryID; }
            });
            this._sizes = new DEMODB.KeyValDictionary();
            this._sizes.fillItems([{ key: 0, val: 'EMPTY' }, { key: 1, val: 'NOT EMPTY' }, { key: 2, val: 'SMALL SIZE' }, { key: 3, val: 'BIG SIZE' }], true);
            this._size = null;
            this._resetCommand = new ResetCommand(self);
        }
        ProductsFilter.prototype._loadCategories = function () {
            var query = this.ProductCategories.createReadProductCategoryQuery();
            query.orderBy('Name');
            return query.load();
        };
        ProductsFilter.prototype._loadProductModels = function () {
            var query = this.ProductModels.createReadProductModelQuery();
            query.orderBy('Name');
            return query.load();
        };
        ProductsFilter.prototype.load = function () {
            var promise1 = this._loadCategories(), promise2 = this._loadProductModels();
            return utils.defer.whenAll([promise1, promise2]);
        };
        ProductsFilter.prototype.reset = function () {
            this.parentCategoryID = null;
            this.childCategoryID = null;
            this.prodNumber = null;
            this.name = null;
            this.modelID = null;
            this.selectedModel = null;
            this.selectedCategory = null;
            this.saleStart1 = null;
            this.saleStart2 = null;
            this.size = null;
        };
        Object.defineProperty(ProductsFilter.prototype, "prodNumber", {
            get: function () { return this._prodNumber; },
            set: function (v) {
                if (this._prodNumber != v) {
                    this._prodNumber = v;
                    this.raisePropertyChanged('prodNumber');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "name", {
            get: function () { return this._name; },
            set: function (v) {
                if (this._name != v) {
                    this._name = v;
                    this.raisePropertyChanged('name');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "parentCategoryID", {
            get: function () { return this._parentCategoryID; },
            set: function (v) {
                if (this._parentCategoryID != v) {
                    this._parentCategoryID = v;
                    this.raisePropertyChanged('parentCategoryID');
                    this._childCategories.refresh();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "childCategoryID", {
            get: function () { return this._childCategoryID; },
            set: function (v) {
                if (this._childCategoryID != v) {
                    this._childCategoryID = v;
                    this.raisePropertyChanged('childCategoryID');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "modelID", {
            get: function () { return this._modelID; },
            set: function (v) {
                if (this._modelID != v) {
                    this._modelID = v;
                    this.raisePropertyChanged('modelID');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "saleStart1", {
            get: function () { return this._saleStart1; },
            set: function (v) {
                if (this._saleStart1 != v) {
                    this._saleStart1 = v;
                    this.raisePropertyChanged('saleStart1');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "saleStart2", {
            get: function () { return this._saleStart2; },
            set: function (v) {
                if (this._saleStart2 != v) {
                    this._saleStart2 = v;
                    this.raisePropertyChanged('saleStart2');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "dbSets", {
            get: function () { return this.dbContext.dbSets; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "ParentCategories", {
            get: function () { return this._parentCategories; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "ChildCategories", {
            get: function () { return this._childCategories; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "ProductModels", {
            get: function () { return this.dbSets.ProductModel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "ProductCategories", {
            get: function () { return this.dbSets.ProductCategory; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "resetCommand", {
            get: function () { return this._resetCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "searchTextToolTip", {
            get: function () { return "Use placeholder <span style='font-size: larger'><b>%</b></span><br/> for searching by part of the value"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "selectedCategory", {
            get: function () { return this._selectedCategory; },
            set: function (v) {
                if (this._selectedCategory != v) {
                    this._selectedCategory = v;
                    this.raisePropertyChanged('selectedCategory');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "selectedModel", {
            get: function () { return this._selectedModel; },
            set: function (v) {
                if (this._selectedModel != v) {
                    this._selectedModel = v;
                    this.raisePropertyChanged('selectedModel');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "sizes", {
            get: function () { return this._sizes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "size", {
            get: function () { return this._size; },
            set: function (v) {
                if (this._size != v) {
                    this._size = v;
                    this.raisePropertyChanged('size');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "modelData", {
            set: function (data) { this.ProductModels.fillData(data); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "categoryData", {
            set: function (data) { this.ProductCategories.fillData(data); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "dbContext", {
            get: function () { return this._app.dbContext; },
            enumerable: true,
            configurable: true
        });
        return ProductsFilter;
    }(RIAPP.BaseObject));
    exports.ProductsFilter = ProductsFilter;
    var RowStateProvider = (function () {
        function RowStateProvider() {
        }
        RowStateProvider.prototype.getCSS = function (item, val) {
            return (!val) ? 'rowInactive' : null;
        };
        return RowStateProvider;
    }());
    var OptionTextProvider = (function () {
        function OptionTextProvider() {
        }
        OptionTextProvider.prototype.getText = function (item, itemIndex, text) {
            if (itemIndex > 0)
                return itemIndex + ') ' + text;
            else
                return text;
        };
        return OptionTextProvider;
    }());
    var OptionStateProvider = (function () {
        function OptionStateProvider() {
        }
        OptionStateProvider.prototype.getCSS = function (item, itemIndex, val) {
            if (itemIndex % 2 == 0)
                return "gray-bgc";
            else
                return "white-bgc";
        };
        return OptionStateProvider;
    }());
    var TestInvokeCommand = (function (_super) {
        __extends(TestInvokeCommand, _super);
        function TestInvokeCommand() {
            _super.apply(this, arguments);
        }
        TestInvokeCommand.prototype.Action = function (sender, param) {
            var self = this.thisObj;
            self.invokeResult = null;
            var promise = self.dbContext.serviceMethods.TestInvoke({ param1: [10, 11, 12, 13, 14], param2: param.Name });
            promise.then(function (res) {
                self.invokeResult = res;
                self.showDialog();
            }, function () {
            });
        };
        TestInvokeCommand.prototype.getIsCanExecute = function (sender, param) {
            var self = this.thisObj;
            return self.currentItem !== null;
        };
        return TestInvokeCommand;
    }(RIAPP.BaseCommand));
    var ProductViewModel = (function (_super) {
        __extends(ProductViewModel, _super);
        function ProductViewModel(app) {
            var _this = this;
            _super.call(this, app);
            var self = this;
            this._filter = new ProductsFilter(app);
            this._dbSet = this.dbSets.Product;
            this._dataGrid = null;
            this._propWatcher = new RIAPP.PropWatcher();
            this._selected = {};
            this._selectedCount = 0;
            this._invokeResult = null;
            this._rowStateProvider = new RowStateProvider();
            this._optionTextProvider = new OptionTextProvider();
            this._optionStateProvider = new OptionStateProvider();
            var sodAssoc = self.dbContext.associations.getOrdDetailsToProduct();
            this._vwSalesOrderDet = new dbMOD.ChildDataView({
                association: sodAssoc,
                fn_sort: function (a, b) { return a.SalesOrderDetailID - b.SalesOrderDetailID; }
            });
            this._dbSet.addOnPropertyChange('currentItem', function (sender, data) {
                self._onCurrentChanged();
            }, self.uniqueID);
            this._dbSet.addOnItemDeleting(function (sender, args) {
                if (!confirm('Are you sure that you want to delete ' + args.item.Name + ' ?'))
                    args.isCancel = true;
            }, self.uniqueID);
            this._dbSet.addOnCleared(function (sender, args) {
                _this.dbContext.dbSets.SalesOrderDetail.clear();
            }, self.uniqueID);
            this._dbSet.addOnEndEdit(function (sender, args) {
                if (!args.isCanceled) {
                    self._testInvokeCommand.raiseCanExecuteChanged();
                }
            }, self.uniqueID);
            this._dbSet.isSubmitOnDelete = true;
            this._dbSet.addOnValidate(function (sender, args) {
                var item = args.item;
                if (!args.fieldName) {
                    if (!!item.SellEndDate) {
                        if (item.SellEndDate < item.SellStartDate) {
                            args.errors.push('End Date must be after Start Date');
                        }
                    }
                }
                else {
                    if (args.fieldName == "Weight") {
                        if (args.item.Weight > 20000) {
                            args.errors.push('Weight must be less than 20000');
                        }
                    }
                }
            }, self.uniqueID);
            this._addNewCommand = new RIAPP.TCommand(function (sender, param) {
                var item = self._dbSet.addNew();
            });
            this._loadCommand = new RIAPP.TCommand(function (sender, data, viewModel) {
                viewModel.load();
            }, self, null);
            this._testInvokeCommand = new TestInvokeCommand(this);
            this._columnCommand = new RIAPP.TCommand(function (sender, cmdParam, viewModel) {
                var dataName = "";
                if (sender instanceof RIAPP.BaseElView) {
                    dataName = sender.dataName;
                }
                alert(utils.str.format("You clicked on \"{0}\", current ProductID is: {1}", dataName, (!cmdParam ? "Not selected" : cmdParam.ProductID)));
            }, self, function (sender, param, thisobj) {
                return !!self.currentItem;
            });
            this._propWatcher.addWatch(self, ['currentItem'], function (property) {
                self._testInvokeCommand.raiseCanExecuteChanged();
            });
            this._dialogVM = new uiMOD.DialogVM(app);
            var dialogOptions = {
                templateID: 'invokeResultTemplate',
                width: 600,
                height: 250,
                canCancel: false,
                title: 'Result of a service method invocation',
                fn_OnClose: function (dialog) {
                    self.invokeResult = null;
                }
            };
            this._dialogVM.createDialog('testDialog', dialogOptions);
        }
        ProductViewModel.prototype._addGrid = function (grid) {
            var self = this;
            if (!!this._dataGrid)
                this._removeGrid();
            this._dataGrid = grid;
            this._dataGrid.addOnPageChanged(function (s, args) {
                self.onDataPageChanged();
            }, this.uniqueID, this);
            this._dataGrid.addOnRowSelected(function (s, args) {
                self.onRowSelected(args.row);
            }, this.uniqueID, this);
            this._dataGrid.addOnRowExpanded(function (s, args) {
                if (args.isExpanded)
                    self.onRowExpanded(args.expandedRow);
                else
                    self.onRowCollapsed(args.collapsedRow);
            }, this.uniqueID, this);
            this._dataGrid.addOnCellDblClicked(function (s, args) {
                self.onCellDblClicked(args.cell);
            }, this.uniqueID, this);
        };
        ProductViewModel.prototype._removeGrid = function () {
            if (!this._dataGrid)
                return;
            this._dataGrid.removeNSHandlers(this.uniqueID);
            this._dataGrid = null;
        };
        ProductViewModel.prototype.addTabs = function (tabs) {
            console.log('tabs created');
        };
        ProductViewModel.prototype.removeTabs = function () {
            console.log('tabs destroyed');
        };
        ProductViewModel.prototype.onTabSelected = function (tabs) {
            console.log('tab selected: ' + tabs.tabIndex);
        };
        ProductViewModel.prototype.onDataPageChanged = function () {
            this._updateSelection();
        };
        ProductViewModel.prototype.onRowSelected = function (row) {
            this._productSelected(row.item, row.isSelected);
        };
        ProductViewModel.prototype.onRowExpanded = function (row) {
            this._vwSalesOrderDet.parentItem = this.currentItem;
        };
        ProductViewModel.prototype.onRowCollapsed = function (row) {
        };
        ProductViewModel.prototype.onCellDblClicked = function (cell) {
            alert("You double clicked " + cell.uniqueID);
        };
        ProductViewModel.prototype._onCurrentChanged = function () {
            this.raisePropertyChanged('currentItem');
            this._columnCommand.raiseCanExecuteChanged();
        };
        ProductViewModel.prototype._updateSelection = function () {
            var self = this, keys = self.selectedIDs, grid = self._dataGrid;
            keys.forEach(function (key) {
                var item = self.dbSet.getItemByKey(key);
                if (!!item) {
                    var row = grid.findRowByItem(item);
                    if (!!row)
                        row.isSelected = true;
                }
            });
        };
        ProductViewModel.prototype._clearSelection = function () {
            this._selected = {};
            this.selectedCount = 0;
        };
        ProductViewModel.prototype._productSelected = function (item, isSelected) {
            if (!item)
                return;
            if (isSelected) {
                if (!this._selected[item._key]) {
                    this._selected[item._key] = item;
                    this.selectedCount += 1;
                }
            }
            else {
                if (!!this._selected[item._key]) {
                    delete this._selected[item._key];
                    this.selectedCount -= 1;
                }
            }
        };
        ProductViewModel.prototype.load = function () {
            this._clearSelection();
            var query = this.dbSet.createReadProductQuery({ param1: [10, 11, 12, 13, 14], param2: 'Test' });
            query.pageSize = 50;
            COMMON.addTextQuery(query, 'ProductNumber', this._filter.prodNumber);
            COMMON.addTextQuery(query, 'Name', this._filter.name);
            if (!utils.check.isNt(this._filter.childCategoryID)) {
                query.where('ProductCategoryID', 0, [this._filter.childCategoryID]);
            }
            if (!utils.check.isNt(this._filter.modelID)) {
                query.where('ProductModelID', 0, [this._filter.modelID]);
            }
            if (!utils.check.isNt(this._filter.saleStart1) && !utils.check.isNt(this._filter.saleStart2)) {
                query.where('SellStartDate', 1, [this._filter.saleStart1, this._filter.saleStart2]);
            }
            else if (!utils.check.isNt(this._filter.saleStart1))
                query.where('SellStartDate', 7, [this._filter.saleStart1]);
            else if (!utils.check.isNt(this._filter.saleStart2))
                query.where('SellStartDate', 8, [this._filter.saleStart2]);
            switch (this.filter.size) {
                case 0:
                    query.where('Size', 0, [null]);
                    break;
                case 1:
                    query.where('Size', 9, [null]);
                    break;
                case 2:
                    query.where('Size', 2, ['S']);
                    break;
                case 3:
                    query.where('Size', 2, ['X']);
                    break;
                default:
                    break;
            }
            query.orderBy('Name').thenBy('SellStartDate', 1);
            return query.load();
        };
        ProductViewModel.prototype.showDialog = function (name) {
            this._dialogVM.showDialog(name || 'testDialog', this);
        };
        ProductViewModel.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._propWatcher.destroy();
            this._propWatcher = null;
            if (!!this._dbSet) {
                this._dbSet.removeNSHandlers(this.uniqueID);
            }
            if (!!this._dataGrid) {
                this._dataGrid.removeNSHandlers(this.uniqueID);
            }
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(ProductViewModel.prototype, "dbSet", {
            get: function () { return this._dbSet; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "testInvokeCommand", {
            get: function () { return this._testInvokeCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "addNewCommand", {
            get: function () { return this._addNewCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "dbContext", {
            get: function () { return this.app.dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "dbSets", {
            get: function () { return this.dbContext.dbSets; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "currentItem", {
            get: function () { return this._dbSet.currentItem; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "filter", {
            get: function () { return this._filter; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "loadCommand", {
            get: function () { return this._loadCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "columnCommand", {
            get: function () { return this._columnCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "selectedCount", {
            get: function () { return this._selectedCount; },
            set: function (v) {
                var old = this._selectedCount;
                if (old !== v) {
                    this._selectedCount = v;
                    this.raisePropertyChanged('selectedCount');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "selectedIDs", {
            get: function () { return Object.keys(this._selected); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "invokeResult", {
            get: function () { return this._invokeResult; },
            set: function (v) {
                var old = this._invokeResult;
                if (old !== v) {
                    this._invokeResult = v;
                    this.raisePropertyChanged('invokeResult');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "vwSalesOrderDet", {
            get: function () { return this._vwSalesOrderDet; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "rowStateProvider", {
            get: function () { return this._rowStateProvider; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "optionTextProvider", {
            get: function () { return this._optionTextProvider; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "optionStateProvider", {
            get: function () { return this._optionStateProvider; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "tabsEvents", {
            get: function () { return this; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "grid", {
            get: function () { return this._dataGrid; },
            set: function (v) {
                if (!!v)
                    this._addGrid(v);
                else
                    this._removeGrid();
            },
            enumerable: true,
            configurable: true
        });
        return ProductViewModel;
    }(RIAPP.ViewModel));
    exports.ProductViewModel = ProductViewModel;
    var BaseUploadVM = (function (_super) {
        __extends(BaseUploadVM, _super);
        function BaseUploadVM(url) {
            _super.call(this);
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
                }
                catch (ex) {
                    self.handleError(ex, this);
                }
            }, self, function (sender, param) {
                return self._canUpload();
            });
        }
        BaseUploadVM.prototype._initXhr = function () {
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
                var progressBar = $("#progressBar");
                var percentageDiv = $("#percentageCalc");
                if (!!e.lengthComputable) {
                    self._progressBar.prop("max", e.total);
                    self._progressBar.prop("value", e.loaded);
                    self._percentageCalc.html(Math.round(e.loaded / e.total * 100) + "%");
                }
            };
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
        };
        BaseUploadVM.prototype._onFileUploaded = function () {
            this._fileUploaded = true;
        };
        BaseUploadVM.prototype.uploadFiles = function (fileList) {
            if (!!fileList) {
                for (var i = 0, l = fileList.length; i < l; i++) {
                    this.uploadFile(fileList[i]);
                }
            }
        };
        BaseUploadVM.prototype.uploadFile = function (file) {
            if (!this._initOk)
                return;
            var xhr = this.xhr;
            xhr.open("post", this._uploadUrl, true);
            xhr.setRequestHeader("Content-Type", "multipart/form-data");
            xhr.setRequestHeader("X-File-Name", file.name);
            xhr.setRequestHeader("X-File-Size", file.size.toString());
            xhr.setRequestHeader("X-File-Type", file.type);
            xhr.setRequestHeader("X-Data-ID", this._getDataID());
            xhr.send(file);
        };
        BaseUploadVM.prototype._onIDChanged = function () {
            this._uploadCommand.raiseCanExecuteChanged();
        };
        BaseUploadVM.prototype._canUpload = function () {
            return this._initOk && !!this._fileInfo && !utils.check.isNt(this.id);
        };
        BaseUploadVM.prototype._getDataID = function () {
            return this.id;
        };
        Object.defineProperty(BaseUploadVM.prototype, "fileInfo", {
            get: function () { return this._fileInfo; },
            set: function (v) {
                if (this._fileInfo !== v) {
                    this._fileInfo = v;
                    this.raisePropertyChanged('fileInfo');
                    this._uploadCommand.raiseCanExecuteChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseUploadVM.prototype, "uploadCommand", {
            get: function () { return this._uploadCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseUploadVM.prototype, "id", {
            get: function () { return this._id; },
            set: function (v) {
                var old = this._id;
                if (old !== v) {
                    this._id = v;
                    this.raisePropertyChanged('id');
                    this._onIDChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        return BaseUploadVM;
    }(RIAPP.BaseObject));
    exports.BaseUploadVM = BaseUploadVM;
    var fn_getTemplateElement = function (template, name) {
        var t = template;
        var els = t.findElByDataName(name);
        if (els.length < 1)
            return null;
        return els[0];
    };
    var UploadThumbnailVM = (function (_super) {
        __extends(UploadThumbnailVM, _super);
        function UploadThumbnailVM(app, url) {
            _super.call(this, url);
            var self = this;
            this._product = null;
            this._dialogVM = new uiMOD.DialogVM(app);
            var dialogOptions = {
                templateID: 'uploadTemplate',
                width: 450,
                height: 250,
                title: 'Upload product thumbnail',
                fn_OnTemplateCreated: function (template) {
                    var dialog = this;
                    self._fileEl = fn_getTemplateElement(template, 'files-to-upload');
                    self._formEl = fn_getTemplateElement(template, 'uploadForm');
                    self._progressBar = $(fn_getTemplateElement(template, 'progressBar'));
                    self._percentageCalc = $(fn_getTemplateElement(template, 'percentageCalc'));
                    self._progressDiv = $(fn_getTemplateElement(template, 'progressDiv'));
                    self._progressDiv.hide();
                    $(self._fileEl).on('change', function (e) {
                        var fileEl = this;
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
                        self.raiseEvent('files_uploaded', { id: self.id, product: self._product });
                    }
                }
            };
            this._dialogVM.createDialog('uploadDialog', dialogOptions);
            this._dialogCommand = new RIAPP.Command(function (sender, param) {
                try {
                    self._product = param;
                    self.id = self._product.ProductID.toString();
                    self._dialogVM.showDialog('uploadDialog', self);
                }
                catch (ex) {
                    self.handleError(ex, this);
                }
            }, self, function (sender, param) {
                return true;
            });
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
                }
                catch (ex) {
                    self.handleError(ex, this);
                }
            }, self, function (sender, param) {
                return true;
            });
        }
        UploadThumbnailVM.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return ['files_uploaded'].concat(base_events);
        };
        UploadThumbnailVM.prototype.addOnFilesUploaded = function (fn, nmspace) {
            this.addHandler('files_uploaded', fn, nmspace);
        };
        UploadThumbnailVM.prototype.removeOnFilesUploaded = function (nmspace) {
            this.removeHandler('files_uploaded', nmspace);
        };
        UploadThumbnailVM.prototype._onDialogClose = function () {
            return this._fileUploaded;
        };
        Object.defineProperty(UploadThumbnailVM.prototype, "dialogCommand", {
            get: function () { return this._dialogCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UploadThumbnailVM.prototype, "templateCommand", {
            get: function () { return this._templateCommand; },
            enumerable: true,
            configurable: true
        });
        UploadThumbnailVM.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._dialogVM.destroy();
            this._dialogVM = null;
            _super.prototype.destroy.call(this);
        };
        return UploadThumbnailVM;
    }(BaseUploadVM));
    exports.UploadThumbnailVM = UploadThumbnailVM;
    var DemoApplication = (function (_super) {
        __extends(DemoApplication, _super);
        function DemoApplication(options) {
            _super.call(this, options);
            var self = this;
            this._dbContext = null;
            this._errorVM = null;
            this._headerVM = null;
            this._productVM = null;
            this._uploadVM = null;
            this._sseVM = null;
            this._websockVM = null;
        }
        DemoApplication.prototype.onStartUp = function () {
            var self = this, options = self.options;
            this._dbContext = new DEMODB.DbContext();
            this._dbContext.initialize({ serviceUrl: options.service_url, permissions: options.permissionInfo });
            function toText(str) {
                if (str === null)
                    return '';
                else
                    return str;
            }
            ;
            this._dbContext.dbSets.Product.defineIsActiveField(function (item) {
                return !item.SellEndDate;
            });
            this._errorVM = new COMMON.ErrorViewModel(this);
            this._headerVM = new HEADER.HeaderVM(this);
            this._productVM = new ProductViewModel(this);
            this._uploadVM = new UploadThumbnailVM(this, options.upload_thumb_url);
            function handleError(sender, data) {
                self._handleError(sender, data);
            }
            ;
            this.addOnError(handleError);
            this._dbContext.addOnError(handleError);
            if (!!options.sse_url && SSEVENTS.SSEventsVM.isSupported()) {
                this._sseVM = new SSEVENTS.SSEventsVM(options.sse_url, options.sse_clientID);
                this._sseVM.addOnMessage(function (s, a) { self._sseMessage = a.data.message; self.raisePropertyChanged('sseMessage'); });
                this._sseVM.addOnError(handleError);
            }
            if (WEBSOCK.WebSocketsVM.isSupported()) {
                this._websockVM = new WEBSOCK.WebSocketsVM(WEBSOCK.WebSocketsVM.createUrl(81, 'PollingService', false));
                this._websockVM.addOnMessage(this._onWebsockMsg, this.uniqueID, this);
                this._websockVM.addOnError(handleError);
            }
            this._uploadVM.addOnFilesUploaded(function (s, a) {
                a.product._aspect.refresh();
            });
            if (!!options.modelData && !!options.categoryData) {
                this.productVM.filter.modelData = options.modelData;
                this.productVM.filter.categoryData = options.categoryData;
                this.productVM.load().then(function (loadRes) {
                    return;
                });
            }
            else {
                this.productVM.filter.load().then(function () {
                    self.productVM.load().then(function (loadRes) { return; });
                });
            }
            _super.prototype.onStartUp.call(this);
        };
        DemoApplication.prototype._handleError = function (sender, data) {
            debugger;
            data.isHandled = true;
            this.errorVM.error = data.error;
            this.errorVM.showDialog();
        };
        DemoApplication.prototype._onWebsockMsg = function (sender, args) {
            this._sseMessage = args.data.message;
            this.raisePropertyChanged('sseMessage');
        };
        DemoApplication.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this;
            try {
                self._errorVM.destroy();
                self._headerVM.destroy();
                self._productVM.destroy();
                self._uploadVM.destroy();
                self._dbContext.destroy();
                if (!!self._sseVM)
                    self._sseVM.destroy();
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
        Object.defineProperty(DemoApplication.prototype, "dbContext", {
            get: function () { return this._dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "errorVM", {
            get: function () { return this._errorVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "headerVM", {
            get: function () { return this._headerVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "productVM", {
            get: function () { return this._productVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "uploadVM", {
            get: function () { return this._uploadVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "sseMessage", {
            get: function () { return this._sseMessage; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "sseVM", {
            get: function () { return this._sseVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "websockVM", {
            get: function () { return this._websockVM; },
            enumerable: true,
            configurable: true
        });
        return DemoApplication;
    }(RIAPP.Application));
    exports.DemoApplication = DemoApplication;
    bootstrap.addOnError(function (sender, args) {
        debugger;
        alert(args.error.message);
        args.isHandled = true;
    });
    function start(mainOptions) {
        mainOptions.modulesInits = {
            "COMMON": COMMON.initModule
        };
        bootstrap.init(function (bootstrap) {
            var ButtonsCSS = bootstrap.defaults.ButtonsCSS;
            ButtonsCSS.Edit = 'icon icon-pencil';
            ButtonsCSS.Delete = 'icon icon-trash';
            ButtonsCSS.OK = 'icon icon-ok';
            ButtonsCSS.Cancel = 'icon icon-remove';
        });
        bootstrap.startApp(function () {
            return new DemoApplication(mainOptions);
        }, function (thisApp) {
            thisApp.loadTemplates(mainOptions.templates_url);
            thisApp.registerTemplateLoader('productEditTemplate', coreUtils.memoize(function () {
                return utils.http.getAjax(mainOptions.productEditTemplate_url);
            }));
        });
    }
    exports.start = start;
});
