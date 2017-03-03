import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

import * as COMMON from "common";
import * as DEMODB from "../demo/demoDB";
import { ProductsFilter } from "./filters";
import { DemoApplication } from "./app";
import { TestInvokeCommand } from "./commands";
import { RowStateProvider, OptionStateProvider, OptionTextProvider } from "./states";

var utils = RIAPP.Utils;


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
    private _columnCommand: RIAPP.ICommand;
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

        this._dbSet.addOnFill(function (sender, args) {
            if (args.reason === RIAPP.COLL_CHANGE_REASON.Sorting)
                setTimeout(() => {
                    self._updateSelection();
                }, 0);
        }, self.uniqueID);

        //auto submit changes when an entity is deleted
        this._dbSet.isSubmitOnDelete = true;

        //example of using custom validation on client (in addition to a built-in validation)
        const validations = [{
            fieldName: <string>null, fn: (item: DEMODB.Product, errors: string[]) => {
                if (!!item.SellEndDate) { //check it must be after Start Date
                    if (item.SellEndDate < item.SellStartDate) {
                        errors.push('End Date must be after Start Date');
                    }
                }
            }
        },
        {
            fieldName: "Weight", fn: (item: DEMODB.Product, errors: string[]) => {
                if (item.Weight > 20000) {
                    errors.push('Weight must be less than 20000');
                }
            }
        }];

        //example of using custom validation on client (in addition to a built-in validation)
        this._dbSet.addOnValidateField(function (sender, args) {
            var item = args.item;
            validations.filter((val) => {
                return args.fieldName === val.fieldName;
            }).forEach((val) => {
                val.fn(item, args.errors);
            });
        }, self.uniqueID);

        this._dbSet.addOnValidateItem(function (sender, args) {
            var item = args.item;
            validations.filter((val) => {
                return !val.fieldName;
            }).forEach((val) => {
                let errors: string[] = [];
                val.fn(item, errors);
                if (errors.length > 0) {
                    args.result.push({ fieldName: null, errors: errors });
                }
            });
        }, self.uniqueID);

        //adds new product - uses dialog to enter the data
        this._addNewCommand = new RIAPP.TCommand<any, ProductViewModel>(function (sender, param) {
            //grid will show the edit dialog, because we set grid options isHandleAddNew:true
            //see the options for the grid on the HTML demo page
            self._dbSet.addNew();
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


        //for testing templates in datagrid columns
        this._columnCommand = new RIAPP.TCommand<DEMODB.Product, ProductViewModel>(function (sender, cmdParam, viewModel) {
            let dataName = "";
            if (sender instanceof uiMOD.BaseElView) {
                dataName = (<uiMOD.BaseElView>sender).dataName;
            }

            alert(utils.str.format("You clicked on \"{0}\", current ProductID is: {1}", dataName, (!cmdParam ? "Not selected" : cmdParam.ProductID)));
        }, self, function (sender, param, thisobj) {
            return !!self.currentItem;
        });

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
        this._columnCommand.raiseCanExecuteChanged();
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
    get columnCommand() { return this._columnCommand; }
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