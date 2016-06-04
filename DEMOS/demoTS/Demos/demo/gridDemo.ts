/// <reference path="../jriapp/jriapp.d.ts" />
/// <reference path="../jriapp/addins/jriapp_db.d.ts" />
/// <reference path="../jriapp/addins/jriapp_ui.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

import * as DEMODB from "./demoDB";
import * as COMMON from "./common";
import * as HEADER from "./header";
import * as  SSEVENTS from "./ssevents"
import * as  WEBSOCK from "./websocket"


var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, coreUtils = RIAPP.Utils.core, $ = utils.dom.$;

//an example how to define a strongly typed command
class ResetCommand extends RIAPP.BaseCommand<any, ProductsFilter>
{
    protected Action(sender: RIAPP.IBaseObject, param: any) {
        this.thisObj.reset();
    }
    protected getIsCanExecute(sender: RIAPP.IBaseObject, param: any): boolean {
        return true;
    }
}

export class ProductsFilter extends RIAPP.BaseObject {
    _prodNumber: any;
    _name: string;
    _parentCategoryID: number;
    _childCategoryID: number;
    _selectedCategory: DEMODB.ProductCategory;
    _selectedModel: DEMODB.ProductModel;
    _modelID: number;
    _parentCategories: dbMOD.DataView<DEMODB.ProductCategory>;
    _childCategories: dbMOD.DataView<DEMODB.ProductCategory>;
    _resetCommand: ResetCommand;
    _app: DemoApplication;
    _saleStart1: Date;
    _saleStart2: Date;
    _sizes: DEMODB.KeyValDictionary;
    _size: number;

    constructor(app: DemoApplication) {
        super();
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
        //filters top level product categories
        this._parentCategories = new dbMOD.DataView<DEMODB.ProductCategory>(
            {
                dataSource: this.ProductCategories,
                fn_sort: function (a, b) { return a.ProductCategoryID - b.ProductCategoryID; },
                fn_filter: function (item) { return item.ParentProductCategoryID == null; }
            });


        //filters product categories which have parent category
        this._childCategories = new dbMOD.DataView<DEMODB.ProductCategory>(
            {
                dataSource: this.ProductCategories,
                fn_sort: function (a, b) { return a.ProductCategoryID - b.ProductCategoryID; },
                fn_filter: function (item) { return item.ParentProductCategoryID !== null && item.ParentProductCategoryID == self.parentCategoryID; }
            });
        this._sizes = new DEMODB.KeyValDictionary();
        this._sizes.fillItems([{ key: 0, val: 'EMPTY' }, { key: 1, val: 'NOT EMPTY' }, { key: 2, val: 'SMALL SIZE' }, { key: 3, val: 'BIG SIZE' }], true);
        this._size = null;
        this._resetCommand = new ResetCommand(self);
    }
    _loadCategories() {
        var query = this.ProductCategories.createReadProductCategoryQuery();
        query.orderBy('Name');
        //returns a promise
        return query.load();
    }
    //returns a promise
    _loadProductModels() {
        var query = this.ProductModels.createReadProductModelQuery();
        query.orderBy('Name');
        //returns promise
        return query.load();
    }
    //returns a promise
    load() {
        //load two dbsets simultaneously
        var promise1 = this._loadCategories(), promise2 = this._loadProductModels();
        return utils.defer.whenAll<any>([promise1, promise2]);
    }
    reset() {
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
    }
    get prodNumber() { return this._prodNumber; }
    set prodNumber(v) {
        if (this._prodNumber != v) {
            this._prodNumber = v;
            this.raisePropertyChanged('prodNumber');
        }
    }
    get name() { return this._name; }
    set name(v) {
        if (this._name != v) {
            this._name = v;
            this.raisePropertyChanged('name');
        }
    }
    get parentCategoryID() { return this._parentCategoryID; }
    set parentCategoryID(v) {
        if (this._parentCategoryID != v) {
            this._parentCategoryID = v;
            this.raisePropertyChanged('parentCategoryID');
            this._childCategories.refresh();
        }
    }
    get childCategoryID() { return this._childCategoryID; }
    set childCategoryID(v) {
        if (this._childCategoryID != v) {
            this._childCategoryID = v;
            this.raisePropertyChanged('childCategoryID');
        }
    }
    get modelID() { return this._modelID; }
    set modelID(v) {
        if (this._modelID != v) {
            this._modelID = v;
            this.raisePropertyChanged('modelID');
        }
    }
    get saleStart1() { return this._saleStart1; }
    set saleStart1(v) {
        if (this._saleStart1 != v) {
            this._saleStart1 = v;
            this.raisePropertyChanged('saleStart1');
        }
    }
    get saleStart2() { return this._saleStart2; }
    set saleStart2(v) {
        if (this._saleStart2 != v) {
            this._saleStart2 = v;
            this.raisePropertyChanged('saleStart2');
        }
    }
    get dbSets() { return this.dbContext.dbSets; }
    get ParentCategories() { return this._parentCategories; }
    get ChildCategories() { return this._childCategories; }
    get ProductModels() { return this.dbSets.ProductModel; }
    get ProductCategories() { return this.dbSets.ProductCategory; }
    get resetCommand() { return this._resetCommand; }
    get searchTextToolTip() { return "Use placeholder <span style='font-size: larger'><b>%</b></span><br/> for searching by part of the value"; }
    get selectedCategory() { return this._selectedCategory; }
    set selectedCategory(v) {
        if (this._selectedCategory != v) {
            this._selectedCategory = v;
            this.raisePropertyChanged('selectedCategory');
        }
    }
    get selectedModel() { return this._selectedModel; }
    set selectedModel(v) {
        if (this._selectedModel != v) {
            this._selectedModel = v;
            this.raisePropertyChanged('selectedModel');
        }
    }
    get sizes() { return this._sizes; }
    get size() { return this._size; }
    set size(v) {
        if (this._size != v) {
            this._size = v;
            this.raisePropertyChanged('size');
        }
    }
    set modelData(data: {
        names: dbMOD.IFieldName[];
        rows: dbMOD.IRowData[];
    }) { this.ProductModels.fillData(data); }
    set categoryData(data: {
        names: dbMOD.IFieldName[];
        rows: dbMOD.IRowData[];
    }) { this.ProductCategories.fillData(data); }
    get dbContext() { return this._app.dbContext; }
}

class RowStateProvider implements uiMOD.IRowStateProvider {
    getCSS(item: RIAPP.ICollectionItem, val: any): string {
        return (!val) ? 'rowInactive' : null;
    }
}

class OptionTextProvider implements uiMOD.IOptionTextProvider {
    getText(item: RIAPP.ICollectionItem, itemIndex: number, text: string): string {
        if (itemIndex > 0)
            return itemIndex + ') ' + text;
        else
            return text;
    }
}

class OptionStateProvider implements uiMOD.IOptionStateProvider {
    getCSS(item: RIAPP.ICollectionItem, itemIndex: number, val: any): string {
        //var name: string = val;
        if (itemIndex % 2 == 0)
            return "gray-bgc";
        else
            return "white-bgc";
    }
}

//an example how to define a strongly typed command
class TestInvokeCommand extends RIAPP.BaseCommand<DEMODB.Product, ProductViewModel>
{
    protected Action(sender: RIAPP.IBaseObject, param: DEMODB.Product) {
        var self = this.thisObj;
        self.invokeResult = null;
        var promise = self.dbContext.serviceMethods.TestInvoke({ param1: [10, 11, 12, 13, 14], param2: param.Name });
        promise.then(function (res) {
            self.invokeResult = res;
            self.showDialog();
        }, function () {
            //do something on fail if you need
            //but the error message display is automatically shown
        });
    }
    protected getIsCanExecute(sender: RIAPP.IBaseObject, param: DEMODB.Product): boolean {
        var self = this.thisObj;
        //just for the test: this command can be executed only when this condition is true!
        return self.currentItem !== null;
    }
}

export class ProductViewModel extends RIAPP.ViewModel<DemoApplication> implements uiMOD.ITabsEvents {
    private _filter: ProductsFilter;
    private _dbSet: DEMODB.ProductDb;
    private _dataGrid: uiMOD.DataGrid;
    private _propWatcher: RIAPP.PropWatcher;
    private _selected: any;
    private _selectedCount: number;
    private _invokeResult: any;
    //_templateID: string;
    private _testInvokeCommand: RIAPP.ICommand;
    private _addNewCommand: RIAPP.ICommand;
    private _loadCommand: RIAPP.ICommand;
    private _dialogVM: uiMOD.DialogVM;
    private _vwSalesOrderDet: dbMOD.ChildDataView<DEMODB.SalesOrderDetail>;
    private _rowStateProvider: uiMOD.IRowStateProvider;
    private _optionTextProvider: uiMOD.IOptionTextProvider;
    private _optionStateProvider: uiMOD.IOptionStateProvider;

    constructor(app: DemoApplication) {
        super(app);
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
        //this._templateID = 'productEditTemplate';

        var sodAssoc = self.dbContext.associations.getOrdDetailsToProduct();

        //the view to filter DEMODB.SalesOrderDetails related to the currently selected product only
        this._vwSalesOrderDet = new dbMOD.ChildDataView<DEMODB.SalesOrderDetail>(
            {
                association: sodAssoc,
                fn_sort: function (a, b) { return a.SalesOrderDetailID - b.SalesOrderDetailID; }
            });

        //when currentItem property changes, invoke our viewmodel's method
        this._dbSet.addOnPropertyChange('currentItem', function (sender, data) {
            self._onCurrentChanged();
        }, self.uniqueID);

        //if we need to confirm the deletion, this is how it is done
        this._dbSet.addOnItemDeleting(function (sender, args) {
            if (!confirm('Are you sure that you want to delete ' + args.item.Name + ' ?'))
                args.isCancel = true;
        }, self.uniqueID);

        this._dbSet.addOnCleared((sender, args) => {
            this.dbContext.dbSets.SalesOrderDetail.clear();
        }, self.uniqueID);

        //the end edit event- the entity potentially changed its data. we can recheck conditions based on
        //entities data here
        this._dbSet.addOnEndEdit(function (sender, args) {
            if (!args.isCanceled) {
                //at the end of the editing, let the command will check: can it be executed?
                self._testInvokeCommand.raiseCanExecuteChanged();
            }
        }, self.uniqueID);

        //auto submit changes when an entity is deleted
        this._dbSet.isSubmitOnDelete = true;

        //example of using custom validation on client (in addition to a built-in validation)
        this._dbSet.addOnValidate(function (sender, args) {
            var item = args.item;
            if (!args.fieldName) { //full item validation
                if (!!item.SellEndDate) { //check it must be after Start Date
                    if (item.SellEndDate < item.SellStartDate) {
                        args.errors.push('End Date must be after Start Date');
                    }
                }
            }
            else //validation of field value
            {
                if (args.fieldName == "Weight") {
                    if (args.item.Weight > 20000) {
                        args.errors.push('Weight must be less than 20000');
                    }
                }
            }
        }, self.uniqueID);

        //adds new product - uses dialog to enter the data
        this._addNewCommand = new RIAPP.TCommand<any, ProductViewModel>(function (sender, param) {
            //grid will show the edit dialog, because we set grid options isHandleAddNew:true
            //see the options for the grid on the HTML demo page
            var item = self._dbSet.addNew();
            //P.S. - grids editor options also has submitOnOK:true, which means
            //on clicking OK button all changes are submitted to the service
        });

        //loads data from the server for the products
        this._loadCommand = new RIAPP.TCommand<any, ProductViewModel>(function (sender, data, viewModel) {
            viewModel.load();
        }, self, null);

        //example of using a method invocation on the service
        //invokes test service method with parameters and displays result with alert
        this._testInvokeCommand = new TestInvokeCommand(this);

        //the property watcher helps us handling properties changes
        //more convenient than using addOnPropertyChange
        this._propWatcher.addWatch(self, ['currentItem'], function (property: string) {
            self._testInvokeCommand.raiseCanExecuteChanged();
        });

        this._dialogVM = new uiMOD.DialogVM(app);
        var dialogOptions: uiMOD.IDialogConstructorOptions = {
            templateID: 'invokeResultTemplate',
            width: 600,
            height: 250,
            canCancel: false, //no cancel button
            title: 'Result of a service method invocation',
            fn_OnClose: function (dialog) {
                self.invokeResult = null;
            }
        };
        this._dialogVM.createDialog('testDialog', dialogOptions);
    }
    protected _addGrid(grid: uiMOD.DataGrid): void {
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
    }
    protected _removeGrid(): void {
        if (!this._dataGrid)
            return;
        this._dataGrid.removeNSHandlers(this.uniqueID);
        this._dataGrid = null;
    }

    //#begin uiMOD.ITabsEvents
    addTabs(tabs: uiMOD.ITabs): void {
        console.log('tabs created');
    }
    removeTabs(): void {
        console.log('tabs destroyed');
    }
    onTabSelected(tabs: uiMOD.ITabs): void {
        console.log('tab selected: ' + tabs.tabIndex);
    }
    //#end uiMOD.ITabsEvents

    protected onDataPageChanged(): void {
        //restore selected rows on the current data page
        this._updateSelection();
    }
    protected onRowSelected(row: uiMOD.DataGridRow): void {
        this._productSelected(row.item, row.isSelected);
    }
    protected onRowExpanded(row: uiMOD.DataGridRow): void {
        this._vwSalesOrderDet.parentItem = this.currentItem;
    }
    protected onRowCollapsed(row: uiMOD.DataGridRow): void {
    }
    protected onCellDblClicked(cell: uiMOD.DataGridCell): void {
        alert("You double clicked " + cell.uniqueID);
    }

    protected _onCurrentChanged() {
        this.raisePropertyChanged('currentItem');
    }
    protected _updateSelection() {
        var self = this, keys = self.selectedIDs, grid = self._dataGrid;
        keys.forEach(function (key) {
            var item = self.dbSet.getItemByKey(key);
            if (!!item) {
                var row = grid.findRowByItem(item);
                if (!!row)
                    row.isSelected = true;
            }
        });
    }
    _clearSelection() {
        //clear all selection
        this._selected = {};
        this.selectedCount = 0;
    }
    //when product is selected (unselected) by the user in the grid (clicking checkboxes)
    //we store the entities keys in the map (it survives going to another page and return back)
    protected _productSelected(item: RIAPP.ICollectionItem, isSelected: boolean) {
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
    }
    load() {
        //clear selected items
        this._clearSelection();
        //you can create several methods on the service which return the same entity type
        //but they must have different names (no overloads)
        //the query'service method can accept additional parameters which you can supply with the query
        var query = this.dbSet.createReadProductQuery({ param1: [10, 11, 12, 13, 14], param2: 'Test' });
        query.pageSize = 50;
        COMMON.addTextQuery(query, 'ProductNumber', this._filter.prodNumber);
        COMMON.addTextQuery(query, 'Name', this._filter.name);

        if (!utils.check.isNt(this._filter.childCategoryID)) {
            query.where('ProductCategoryID', RIAPP.FILTER_TYPE.Equals, [this._filter.childCategoryID]);
        }
        if (!utils.check.isNt(this._filter.modelID)) {
            query.where('ProductModelID', RIAPP.FILTER_TYPE.Equals, [this._filter.modelID]);
        }

        if (!utils.check.isNt(this._filter.saleStart1) && !utils.check.isNt(this._filter.saleStart2)) {
            query.where('SellStartDate', RIAPP.FILTER_TYPE.Between, [this._filter.saleStart1, this._filter.saleStart2]);
        }
        else if (!utils.check.isNt(this._filter.saleStart1))
            query.where('SellStartDate', RIAPP.FILTER_TYPE.GtEq, [this._filter.saleStart1]);
        else if (!utils.check.isNt(this._filter.saleStart2))
            query.where('SellStartDate', RIAPP.FILTER_TYPE.LtEq, [this._filter.saleStart2]);
        switch (this.filter.size) {
            case 0: //EMPTY
                query.where('Size', RIAPP.FILTER_TYPE.Equals, [null]);
                break;
            case 1: //NOT EMPTY
                query.where('Size', RIAPP.FILTER_TYPE.NotEq, [null]);
                break;
            case 2: //SMALL SIZE
                query.where('Size', RIAPP.FILTER_TYPE.StartsWith, ['S']);
                break;
            case 3: //BIG SIZE
                query.where('Size', RIAPP.FILTER_TYPE.StartsWith, ['X']);
                break;
            default: //ALL
                break;
        }
        query.orderBy('Name').thenBy('SellStartDate', RIAPP.SORT_ORDER.DESC);
        return query.load();
    }
    showDialog(name?: string) {
        this._dialogVM.showDialog(name || 'testDialog', this);
    }
    destroy() {
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
        super.destroy();
    }
    get dbSet() { return this._dbSet; }
    //get templateID() { return this._templateID; }
    get testInvokeCommand() { return this._testInvokeCommand; }
    get addNewCommand() { return this._addNewCommand; }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get currentItem() { return this._dbSet.currentItem; }
    get filter() { return this._filter; }
    get loadCommand() { return this._loadCommand; }
    get selectedCount() { return this._selectedCount; }
    set selectedCount(v) {
        var old = this._selectedCount;
        if (old !== v) {
            this._selectedCount = v;
            this.raisePropertyChanged('selectedCount');
        }
    }
    get selectedIDs() { return Object.keys(this._selected); }
    get invokeResult() { return this._invokeResult; }
    set invokeResult(v) {
        var old = this._invokeResult;
        if (old !== v) {
            this._invokeResult = v;
            this.raisePropertyChanged('invokeResult');
        }
    }
    get vwSalesOrderDet() { return this._vwSalesOrderDet; }

    get rowStateProvider() { return this._rowStateProvider; }
    get optionTextProvider() { return this._optionTextProvider; }
    get optionStateProvider() { return this._optionStateProvider }
    get tabsEvents(): uiMOD.ITabsEvents { return this; }
    get grid(): uiMOD.DataGrid { return this._dataGrid; }
    set grid(v: uiMOD.DataGrid) {
        if (!!v)
            this._addGrid(v);
        else
            this._removeGrid();
    }
}

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
    protected  _uploadCommand: RIAPP.ICommand;
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
                self.handleError(ex, this);
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
            var progressBar = $("#progressBar");
            var percentageDiv = $("#percentageCalc");
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

export interface IMainOptions extends RIAPP.IAppOptions {
    service_url: string;
    permissionInfo?: dbMOD.IPermissionsInfo;
    upload_thumb_url: string;
    templates_url: string;
    productEditTemplate_url: string;
    modelData: any;
    categoryData: any;
    sse_url: string;
    sse_clientID: string;
}

//strongly typed aplication's class
export class DemoApplication extends RIAPP.Application {
    private _dbContext: DEMODB.DbContext;
    private _errorVM: COMMON.ErrorViewModel;
    private _headerVM: HEADER.HeaderVM;
    private _productVM: ProductViewModel;
    private _uploadVM: UploadThumbnailVM;
    private _sseVM: SSEVENTS.SSEventsVM;
    private _sseMessage: string;
    private _websockVM: WEBSOCK.WebSocketsVM;

    constructor(options: IMainOptions) {
        super(options);
        var self = this;
        this._dbContext = null;
        this._errorVM = null;
        this._headerVM = null;
        this._productVM = null;
        this._uploadVM = null;
        this._sseVM = null;
        this._websockVM = null;
    }
    onStartUp() {
        var self = this, options: IMainOptions = self.options;
        this._dbContext = new DEMODB.DbContext();
        this._dbContext.initialize({ serviceUrl: options.service_url, permissions: options.permissionInfo });
        function toText(str: any) {
            if (str === null)
                return '';
            else
                return str;
        };

        this._dbContext.dbSets.Product.defineIsActiveField(function (item) {
            return !item.SellEndDate;
        });
        this._errorVM = new COMMON.ErrorViewModel(this);
        this._headerVM = new HEADER.HeaderVM(this);
        this._productVM = new ProductViewModel(this);
        this._uploadVM = new UploadThumbnailVM(this, options.upload_thumb_url);
        function handleError(sender:any, data: any) {
            self._handleError(sender, data);
        };
        //here we could process application's errors
        this.addOnError(handleError);
        this._dbContext.addOnError(handleError);
        //instead of server side events i added websocket

        if (!!options.sse_url && SSEVENTS.SSEventsVM.isSupported()) {
            this._sseVM = new SSEVENTS.SSEventsVM(options.sse_url, options.sse_clientID);
            this._sseVM.addOnMessage((s, a) => { self._sseMessage = a.data.message; self.raisePropertyChanged('sseMessage'); });
            this._sseVM.addOnError(handleError);
        }


        if (WEBSOCK.WebSocketsVM.isSupported()) {
            this._websockVM = new WEBSOCK.WebSocketsVM(WEBSOCK.WebSocketsVM.createUrl(81, 'PollingService', false));
            this._websockVM.addOnMessage(this._onWebsockMsg, this.uniqueID, this);
            this._websockVM.addOnError(handleError);
        }

        //adding event handler for our custom event
        this._uploadVM.addOnFilesUploaded(function (s, a) {
            //need to update ThumbnailPhotoFileName
            a.product._aspect.refresh();
        });

        if (!!options.modelData && !!options.categoryData) {
            //the data was embedded into HTML page as json, just use it
            this.productVM.filter.modelData = options.modelData;
            this.productVM.filter.categoryData = options.categoryData;
            this.productVM.load().then(function (loadRes) {
                //alert(loadRes.outOfBandData.test);
                return;
            });

        }
        else {
            //there was no embedded data for the filter on the HTML page, so load it first, and then load products
            this.productVM.filter.load().then(() => {
                self.productVM.load().then(function (loadRes) {/*alert(loadRes.outOfBandData.test);*/ return; });
            });
        }

        super.onStartUp();
    }
    private _handleError(sender:any, data:any) {
        debugger;
        data.isHandled = true;
        this.errorVM.error = data.error;
        this.errorVM.showDialog();
    }
    private _onWebsockMsg(sender: WEBSOCK.WebSocketsVM, args: { message: string; data: any; }) {
        this._sseMessage = args.data.message; this.raisePropertyChanged('sseMessage');
    }
    //really, the destroy method is redundant here because the application lives while the page lives
    destroy() {
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
        } finally {
            super.destroy();
        }
    }
    get options() { return <IMainOptions>this._options; }
    get dbContext() { return this._dbContext; }
    get errorVM() { return this._errorVM; }
    get headerVM() { return this._headerVM; }
    get productVM() { return this._productVM; }
    get uploadVM() { return this._uploadVM; }
    //server side events and websocket
    get sseMessage() { return this._sseMessage; }
    get sseVM() { return this._sseVM; }
    get websockVM() { return this._websockVM; }
}

//bootstrap error handler - the last resort (typically display message to the user)
bootstrap.addOnError(function (sender, args) {
    debugger;
    alert(args.error.message);
    args.isHandled = true;
});

export function start(mainOptions: IMainOptions) {
    mainOptions.modulesInits = {
        "COMMON": COMMON.initModule
    };

    bootstrap.init((bootstrap) => {
        //replace default buttons styles with something custom
        let ButtonsCSS = bootstrap.defaults.ButtonsCSS;
        ButtonsCSS.Edit = 'icon icon-pencil';
        ButtonsCSS.Delete = 'icon icon-trash';
        ButtonsCSS.OK = 'icon icon-ok';
        ButtonsCSS.Cancel = 'icon icon-remove';
    });

    //create and start application here
    bootstrap.startApp(() => {
        return new DemoApplication(mainOptions);
    }, (thisApp) => {
        //example of how to preload a group of templates from the server - see spaDEMO.ts for a better way
        thisApp.loadTemplates(mainOptions.templates_url);

        //***here are two examples how we can register template's loader functions for individual templates***
        //this registered function will be invoked every  time when the template with that name is needed
        //P.S. - but the best way how to load templates is to register templates' groups
        //see the Single Page RIAPP.Application Demo (spaDEMO.ts) how it is done there
        thisApp.registerTemplateLoader('productEditTemplate', coreUtils.memoize(() => {
            return utils.http.getAjax(mainOptions.productEditTemplate_url);
        })
        );

        /*
        //example of how to do ajax calls to load lookups - first load lookups, then load products
        //at the end it displays in an alert out of band data returned from the server (see ReadProduct data service method)
        
         thisApp.productVM.filter.load().then(function()
         {
            return thisApp.productVM.load();}
         ).then(function(data: dbMOD.ILoadResult){alert( data.outOfBandData.test);},function(){alert('load failed');});
        */
    });
}