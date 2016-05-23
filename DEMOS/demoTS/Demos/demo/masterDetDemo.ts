/// <reference path="../jriapp/jriapp.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as DEMODB from "./demoDB";
import * as AUTOCOMPLETE from "./autocomplete";
import * as COMMON from "./common";

var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = utils.dom.$;

export class CustomerVM extends RIAPP.ViewModel<DemoApplication> {
    private _dataGrid: uiMOD.DataGrid;
    private _dbSet: DEMODB.CustomerDb;
    private _propWatcher: RIAPP.PropWatcher;
    private _addNewCommand: RIAPP.ICommand;
    private _saveCommand: RIAPP.ICommand;
    private _undoCommand: RIAPP.ICommand;
    private _loadCommand: RIAPP.ICommand;
    private _custAdressView: dbMOD.ChildDataView<DEMODB.CustomerAddress>;
    private _ordersVM: OrderVM;

    constructor(app: DemoApplication) {
        super(app);
        var self = this;
        this._dataGrid = null;
        this._dbSet = this.dbSets.Customer;
        this._dbSet.isSubmitOnDelete = true;
        this._propWatcher = new RIAPP.PropWatcher();

        this._dbSet.addOnItemDeleting(function (sender, args) {
            if (!confirm('Are you sure that you want to delete customer ?'))
                args.isCancel = true;
        }, self.uniqueID);

        this._dbSet.addOnPageIndexChanged(function (sender, args) {
            self.raiseEvent('page_changed', {});
        }, self.uniqueID);

        //example of using custom validation on client (in addition to a built-in validation)
        this._dbSet.addOnValidate(function (sender, args) {
            var item = args.item;
            //check complex property value
            if (args.fieldName == "ComplexProp.ComplexProp.Phone") {
                if (utils.str.startsWith(args.item.ComplexProp.ComplexProp.Phone, '888')) {
                    args.errors.push('Phone must not start with 888!');
                }
            }
        }, self.uniqueID);

        this._dbSet.addOnItemAdded((s, args) => {
            args.item.NameStyle = false;
            args.item.ComplexProp.LastName = "DummyLastName";
            args.item.ComplexProp.FirstName = "DummyFirstName";
        });

        //adds new customer - uses dialog to enter the data
        this._addNewCommand = new RIAPP.Command(function (sender, param) {
            //showing of the dialog is handled by the datagrid
            self._dbSet.addNew();
        }, self, function (sender, param) {
            //the command is always enabled
            return true;
        });

        //saves changes (submitts them to the service)
        this._saveCommand = new RIAPP.Command(function (sender, param) {
            self.dbContext.submitChanges();
        }, self, function (s, p) {
            //the command is enabled when there are pending changes
            return self.dbContext.isHasChanges;
        });


        this._undoCommand = new RIAPP.Command(function (sender, param) {
            self.dbContext.rejectChanges();
        }, self, function (s, p) {
            //the command is enabled when there are pending changes
            return self.dbContext.isHasChanges;
        });

        //load data from the server
        this._loadCommand = new RIAPP.Command(function (sender, args) {
            self.load();
        }, self, null);

        //the property watcher helps us handling properties changes
        //more convenient than using addOnPropertyChange
        this._propWatcher.addPropWatch(self.dbContext, 'isHasChanges', function (prop) {
            self._saveCommand.raiseCanExecuteChanged();
            self._undoCommand.raiseCanExecuteChanged();
        });

        this._propWatcher.addPropWatch(this._dbSet, 'currentItem', function (prop) {
            self._onCurrentChanged();
        });

        this._dbSet.addOnCleared(function (s, a) {
            self.dbSets.CustomerAddress.clear();
            self.dbSets.Address.clear();
        }, self.uniqueID);

        var custAssoc = self.dbContext.associations.getCustAddrToCustomer();

        //the view to filter CustomerAddresses related to the current customer only
        this._custAdressView = new dbMOD.ChildDataView<DEMODB.CustomerAddress>(
            {
                association: custAssoc,
                fn_sort: function (a, b) { return a.AddressID - b.AddressID; }
            });

        this._ordersVM = new OrderVM(this);
    }
    protected _addGrid(grid: uiMOD.DataGrid): void {
        var self = this;
        if (!!this._dataGrid)
            this._removeGrid();
        this._dataGrid = grid;
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
    protected onRowExpanded(row: uiMOD.DataGridRow): void {
        this.raiseEvent('row_expanded', { customer: row.item, isExpanded: true });
    }
    protected onRowCollapsed(row: uiMOD.DataGridRow): void {
        this.raiseEvent('row_expanded', { customer: row.item, isExpanded: false });
    }
    protected onCellDblClicked(cell: uiMOD.DataGridCell): void {
        alert("You double clicked " + cell.uniqueID);
    }

    protected _getEventNames() {
        var base_events = super._getEventNames();
        return ['row_expanded', 'page_changed'].concat(base_events);
    }
    protected _onCurrentChanged() {
        this._custAdressView.parentItem = this._dbSet.currentItem;
        this.raisePropertyChanged('currentItem');
    }
    //returns promise
    load() {
        var self = this, query = this._dbSet.createReadCustomerQuery({ includeNav: true });
        query.pageSize = 50;
        query.orderBy('ComplexProp.LastName').thenBy('ComplexProp.MiddleName').thenBy('ComplexProp.FirstName');
        let res = query.load();
        /*
        //for testing 
        res.then((data) => {
            setTimeout(() => {
                self.dbSet.fillItems(data.fetchedItems);
            }, 2000);
        });
        */
        return res;
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

        this._ordersVM.destroy()
        this._ordersVM = null;
        super.destroy();
    }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get dbSet() { return this._dbSet; }
    get currentItem() { return this._dbSet.currentItem; }
    get addNewCommand() { return this._addNewCommand; }
    get saveCommand() { return this._saveCommand; }
    get undoCommand() { return this._undoCommand; }
    get loadCommand() { return this._loadCommand; }
    get ordersVM() { return this._ordersVM; }
    get custAdressView() { return this._custAdressView; }
    get grid(): uiMOD.DataGrid { return this._dataGrid; }
    set grid(v: uiMOD.DataGrid) {
        if (!!v)
            this._addGrid(v);
        else
            this._removeGrid();
    }
}

export class OrderVM extends RIAPP.ViewModel<DemoApplication> implements uiMOD.ITabsEvents {
    private _customerVM: CustomerVM;
    private _dbSet: DEMODB.SalesOrderHeaderDb;
    private _currentCustomer: DEMODB.Customer;
    private _dataGrid: uiMOD.DataGrid;
    private _tabs: uiMOD.ITabs;
    private _selectedTabIndex: number;
    private _orderStatuses: DEMODB.KeyValDictionary;
    private _addNewCommand: RIAPP.ICommand;
    private _addressVM: AddressVM;
    private _orderDetailVM: OrderDetailVM;

    constructor(customerVM: CustomerVM) {
        super(customerVM.app);
        var self = this;
        this._customerVM = customerVM;
        this._dbSet = this.dbSets.SalesOrderHeader;
        this._currentCustomer = null;
        this._dataGrid = null;
        this._selectedTabIndex = null;
        this._tabs = null;
        this._orderStatuses = new DEMODB.KeyValDictionary();
        this._orderStatuses.fillItems([{ key: 0, val: 'New Order' }, { key: 1, val: 'Status 1' },
            { key: 2, val: 'Status 2' }, { key: 3, val: 'Status 3' },
            { key: 4, val: 'Status 4' }, { key: 5, val: 'Completed Order' }], true);

        //loads the data only when customer's row is expanded
        this._customerVM.addHandler('row_expanded', function (sender, args) {
            if (args.isExpanded) {
                self.currentCustomer = args.customer;
            }
            else {
                self.currentCustomer = null;
            }
        }, self.uniqueID);

        this._dbSet.addOnPropertyChange('currentItem', function (sender, args) {
            self._onCurrentChanged();
        }, self.uniqueID);

        this._dbSet.addOnItemDeleting(function (sender, args) {
            if (!confirm('Are you sure that you want to delete order ?'))
                args.isCancel = true;
        }, self.uniqueID);

        this._dbSet.addOnItemAdded(function (sender, args) {
            //can be solved soon with generics
            var item = args.item;
            item.Customer = self.currentCustomer;
            //datejs extension
            item.OrderDate = moment().toDate();
            item.DueDate = moment().add(7, 'days').toDate();
            item.OnlineOrderFlag = false;
        }, self.uniqueID);

        //adds new order - uses dialog to fill the data
        this._addNewCommand = new RIAPP.Command(function (sender, param) {
            //the dialog shown by the datagrid
            self._dbSet.addNew();
        }, self, function (sender, param) {
            return true;
        });

        this._addressVM = new AddressVM(this);
        this._orderDetailVM = new OrderDetailVM(this);
    }
    protected _getEventNames() {
        var base_events = super._getEventNames();
        return ['row_expanded'].concat(base_events);
    }
    protected _addGrid(grid: uiMOD.DataGrid): void {
        var self = this;
        if (!!this._dataGrid)
            this._removeGrid();
        this._dataGrid = grid;
        this._dataGrid.addOnRowExpanded(function (s, args) {
            if (args.isExpanded)
                self.onRowExpanded(args.expandedRow);
            else
                self.onRowCollapsed(args.collapsedRow);
        }, this.uniqueID, this);
    }
    protected _removeGrid(): void {
        if (!this._dataGrid)
            return;
        this._dataGrid.removeNSHandlers(this.uniqueID);
        this._dataGrid = null;
    }
    protected onRowExpanded(row: uiMOD.DataGridRow): void {
        this.raiseEvent('row_expanded', { order: row.item, isExpanded: true });
        if (!!this._tabs)
            this.onTabSelected(this._tabs);
    }
    protected onRowCollapsed(row: uiMOD.DataGridRow): void {
        this.raiseEvent('row_expanded', { order: row.item, isExpanded: false });
    }

    //#begin uiMOD.ITabsEvents
    addTabs(tabs: uiMOD.ITabs): void {
        this._tabs = tabs;
    }
    removeTabs(): void {
        this._tabs = null;
    }
    onTabSelected(tabs: uiMOD.ITabs): void {
        this._selectedTabIndex = tabs.tabIndex;
        this.raisePropertyChanged('selectedTabIndex');

        if (this._selectedTabIndex == 2) {
            //load details only when the tab which contains the details grid is selected
            this._orderDetailVM.currentOrder = this.dbSet.currentItem;
        }
    }
    //#end uiMOD.ITabsEvents

    protected _onCurrentChanged() {
        this.raisePropertyChanged('currentItem');
    }
    clear() {
        this.dbSet.clear();
    }
    //returns promise
    load() {
        //explicitly clear before every load
        this.clear();
        if (!this.currentCustomer || this.currentCustomer._aspect.isNew) {
            var deferred = utils.defer.createDeferred<dbMOD.IQueryResult<DEMODB.SalesOrderHeader>>();
            deferred.reject();
            return deferred.promise();
        }
        var query = this.dbSet.createReadSalesOrderHeaderQuery();
        query.where('CustomerID', RIAPP.FILTER_TYPE.Equals, [this.currentCustomer.CustomerID]);
        query.orderBy('OrderDate').thenBy('SalesOrderID');
        return query.load();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._dbSet) {
            this._dbSet.removeNSHandlers(this.uniqueID);
        }
        if (!!this._dataGrid) {
            this._dataGrid.removeNSHandlers(this.uniqueID);
        }
        this.currentCustomer = null;
        this._addressVM.destroy();
        this._addressVM = null;
        this._orderDetailVM.destroy();
        this._orderDetailVM = null;
        this._customerVM = null;
        super.destroy();
    }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get currentItem() { return this._dbSet.currentItem; }
    get dbSet() { return this._dbSet; }
    get addNewCommand() { return this._addNewCommand; }
    get orderStatuses() { return this._orderStatuses; }
    get currentCustomer() { return this._currentCustomer; }
    set currentCustomer(v) {
        if (v !== this._currentCustomer) {
            this._currentCustomer = v;
            this.raisePropertyChanged('currentCustomer');
            this.load();
        }
    }
    get customerVM() { return this._customerVM; }
    get orderDetailsVM() { return this._orderDetailVM; }
    get selectedTabIndex() { return this._selectedTabIndex; }

    get tabsEvents(): uiMOD.ITabsEvents { return this; }
    get grid(): uiMOD.DataGrid { return this._dataGrid; }
    set grid(v: uiMOD.DataGrid) {
        if (!!v)
            this._addGrid(v);
        else
            this._removeGrid();
    }
}

export class OrderDetailVM extends RIAPP.ViewModel<DemoApplication> {
    private _orderVM: OrderVM;
    private _dbSet: DEMODB.SalesOrderDetailDb;
    private _currentOrder: DEMODB.SalesOrderHeader;
    private _productVM: ProductVM;

    constructor(orderVM: OrderVM) {
        super(orderVM.app);
        var self = this;
        this._dbSet = this.dbSets.SalesOrderDetail;
        this._orderVM = orderVM;
        this._currentOrder = null;

        this._orderVM.dbSet.addOnCleared(function (s, a) {
            self.clear();
        }, self.uniqueID);

        this._dbSet.addOnPropertyChange('currentItem', function (sender, args) {
            self._onCurrentChanged();
        }, self.uniqueID);

        this._productVM = new ProductVM(this);
    }
    protected _onCurrentChanged() {
        this.raisePropertyChanged('currentItem');
    }
    //returns promise
    load() {
        this.clear();

        if (!this.currentOrder || this.currentOrder._aspect.isNew) {
            var deferred = utils.defer.createDeferred<dbMOD.IQueryResult<DEMODB.SalesOrderDetail>>();
            deferred.reject();
            return deferred.promise();
        }
        var query = this.dbSet.createReadSalesOrderDetailQuery();
        query.where('SalesOrderID', RIAPP.FILTER_TYPE.Equals, [this.currentOrder.SalesOrderID]);
        query.orderBy('SalesOrderDetailID');
        return query.load();
    }
    clear() {
        this.dbSet.clear();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._dbSet) {
            this._dbSet.removeNSHandlers(this.uniqueID);
        }
        this.currentOrder = null;
        this._productVM.destroy();
        this._orderVM.dbSet.removeNSHandlers(this.uniqueID);
        this._orderVM.removeNSHandlers(this.uniqueID);
        this._orderVM = null;
        super.destroy();
    }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get currentItem() { return this._dbSet.currentItem; }
    get dbSet() { return this._dbSet; }
    get currentOrder() { return this._currentOrder; }
    set currentOrder(v) {
        if (v !== this._currentOrder) {
            this._currentOrder = v;
            this.raisePropertyChanged('currentOrder');
            this.load();
        }
    }
    get orderVM() { return this._orderVM; }
}

export class AddressVM extends RIAPP.ViewModel<DemoApplication> {
    private _orderVM: OrderVM;
    private _dbSet: DEMODB.AddressDb;

    constructor(orderVM: OrderVM) {
        super(orderVM.app);
        var self = this;
        this._orderVM = orderVM;
        this._dbSet = this.dbSets.Address;
        this._orderVM.dbSet.addOnFill(function (sender, args) {
            self.loadAddressesForOrders(args.items);
        }, self.uniqueID);

        this._dbSet.addOnPropertyChange('currentItem', function (sender, args) {
            self._onCurrentChanged();
        }, self.uniqueID);
    }
    protected _onCurrentChanged() {
        this.raisePropertyChanged('currentItem');
    }
    //returns promise
    loadAddressesForOrders(orders: DEMODB.SalesOrderHeader[]) {
        var ids1: number[] = orders.map(function (item) {
            return item.ShipToAddressID;
        });
        var ids2: number[] = orders.map(function (item) {
            return item.BillToAddressID;
        });
        var ids: number[] = ids1.concat(ids2).filter(function (id) {
            return id !== null;
        });
        return this.load(RIAPP.Utils.arr.distinct(ids), false);
    }
    //returns promise
    load(ids: number[], isClearTable: boolean) {
        var query = this.dbSet.createReadAddressByIdsQuery({ addressIDs: ids });
        //if true, previous data will be cleared when the new is loaded
        query.isClearPrevData = isClearTable;
        return query.load();
    }
    clear() {
        this.dbSet.clear();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._dbSet) {
            this._dbSet.removeNSHandlers(this.uniqueID);
        }
        this._customerDbSet.removeNSHandlers(this.uniqueID);
        this._orderVM.removeNSHandlers(this.uniqueID);
        this._orderVM = null;
        this._customerDbSet = null;
        super.destroy();
    }
    get _customerDbSet() { return this._orderVM.customerVM.dbSet; }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get currentItem() { return this._dbSet.currentItem; }
    get dbSet() { return this._dbSet; }
    get orderVM() { return this._orderVM; }
}

export class ProductAutoComplete extends AUTOCOMPLETE.AutoCompleteElView {
    private _lastLoadedID: number;
    private _lookupSource: DEMODB.ProductDb;

    constructor(options: AUTOCOMPLETE.IAutocompleteOptions) {
        super(options);
        var self = this;
        this._lastLoadedID = null;
        this._lookupSource = <DEMODB.ProductDb>this._getDbContext().getDbSet('Product');
        this._lookupSource.addOnCollChanged(function (sender, args) {
            self._updateValue();
        }, self.uniqueID);
    }
    //override
    protected _updateSelection() {
        if (!!this.dataContext) {
            var id = this.currentSelection;
            this.dataContext.ProductID = id;
        }
    }
    protected _onHide() {
        super._onHide();
        this._updateValue();
    }
    //new
    protected _updateValue() {
        if (!this.dataContext) {
            this.value = '';
            return;
        }
        var productID = this.dataContext.ProductID;
        //casting will be solved with generics soon
        var product: DEMODB.Product = this._lookupSource.findEntity(productID);
        if (!!product) {
            this.value = product.Name;
        }
        else {
            this.value = '';
            if (this._lastLoadedID !== productID) {
                //this prevents the cicles of loading of the same item
                this._lastLoadedID = productID;
                var query = this._lookupSource.createReadProductByIdsQuery({ productIDs: [productID] });
                query.isClearPrevData = false;
                query.load();
            }
        }
    }
    //override
    get dataContext() { return <DEMODB.Product>this._dataContext; }
    set dataContext(v) {
        var self = this;
        if (this._dataContext !== v) {
            if (!!this._dataContext) {
                this._dataContext.removeNSHandlers(this.uniqueID);
            }
            this._dataContext = v;
            if (!!this._dataContext) {
                this._dataContext.addOnPropertyChange('ProductID', function (sender, a) {
                    self._updateValue();
                }, this.uniqueID);
            }
            self._updateValue();
            this.raisePropertyChanged('dataContext');
        }
    }
    //override
    get currentSelection() {
        if (!!this.gridDataSource.currentItem)
            return <number>(<any>this.gridDataSource.currentItem)['ProductID'];
        else
            return null;
    }
}

export class ProductVM extends RIAPP.ViewModel<DemoApplication> {
    private _orderDetailVM: OrderDetailVM;
    private _dbSet: DEMODB.ProductDb;

    constructor(orderDetailVM: OrderDetailVM) {
        super(orderDetailVM.app);
        var self = this;
        this._orderDetailVM = orderDetailVM;
        this._dbSet = this.dbSets.Product;

        this._customerDbSet.addOnCleared(function (s, a) {
            self.clear();
        }, self.uniqueID);

        //here we load products which are referenced in order details
        this._orderDetailVM.dbSet.addOnFill(function (sender, args) {
            self.loadProductsForOrderDetails(args.items);
        }, self.uniqueID);

        this._dbSet.addOnPropertyChange('currentItem', function (sender, args) {
            self._onCurrentChanged();
        }, self.uniqueID);
    }
    _onCurrentChanged() {
        this.raisePropertyChanged('currentItem');
    }
    clear() {
        this.dbSet.clear();
    }
    //returns promise
    loadProductsForOrderDetails(orderDetails: DEMODB.SalesOrderDetail[]) {
        var ids: number[] = orderDetails.map(function (item) {
            return item.ProductID;
        }).filter(function (id) {
            return id !== null;
        });

        return this.load(RIAPP.Utils.arr.distinct(ids), false);
    }
    //returns promise
    load(ids: number[], isClearTable: boolean) {
        var query = this.dbSet.createReadProductByIdsQuery({ productIDs: ids });
        query.isClearPrevData = isClearTable;
        return query.load();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._dbSet) {
            this._dbSet.removeNSHandlers(this.uniqueID);
        }
        this._customerDbSet.removeNSHandlers(this.uniqueID);
        this._orderDetailVM.removeNSHandlers(this.uniqueID);
        this._orderDetailVM = null;
        this._customerDbSet = null;
        super.destroy();
    }
    get _customerDbSet() { return this._orderDetailVM.orderVM.customerVM.dbSet; }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get currentItem() { return this._dbSet.currentItem; }
    get dbSet() { return this._dbSet; }
}

export interface IMainOptions extends RIAPP.IAppOptions {
    service_url: string;
    permissionInfo?: dbMOD.IPermissionsInfo;
}

export class DemoApplication extends RIAPP.Application {
    private _dbContext: DEMODB.DbContext;
    private _errorVM: COMMON.ErrorViewModel;
    private _customerVM: CustomerVM;

    constructor(options: IMainOptions) {
        super(options);
        var self = this;
        this._dbContext = null;
        this._errorVM = null;
        this._customerVM = null;
    }
    onStartUp() {
        var self = this, options: IMainOptions = self.options;
        this._dbContext = new DEMODB.DbContext();
        this._dbContext.initialize({ serviceUrl: options.service_url, permissions: options.permissionInfo });
        function toText(str:any) {
            if (str === null)
                return '';
            else
                return str;
        };

        this._dbContext.dbSets.Customer.defineComplexProp_NameField(function (item) {
            //executed in the context of the entity
            return toText(item.ComplexProp.LastName) + '  ' + toText(item.ComplexProp.MiddleName) + '  ' + toText(item.ComplexProp.FirstName);
        });
        this.registerObject('dbContext', this._dbContext);
        this._errorVM = new COMMON.ErrorViewModel(this);
        this._customerVM = new CustomerVM(this);

        function handleError(sender:any, data:any) {
            self._handleError(sender, data);
        };
        //here we could process application's errors
        this.addOnError(handleError);
        this._dbContext.addOnError(handleError);

        super.onStartUp();
        this._customerVM.load();
    }
    private _handleError(sender:any, data:any) {
        debugger;
        data.isHandled = true;
        this.errorVM.error = data.error;
        this.errorVM.showDialog();
    }
    //really, the destroy method is redundant here because the application lives while the page lives
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        var self = this;
        try {
            self._errorVM.destroy();
            self._customerVM.destroy();
            self._dbContext.destroy();
        } finally {
            super.destroy();
        }
    }
    get options() { return <IMainOptions>this._options; }
    get dbContext() { return this._dbContext; }
    get errorVM() { return this._errorVM; }
    get customerVM() { return this._customerVM; }
    get TEXT() { return RIAPP.LocaleSTRS.TEXT; }
}

//bootstrap error handler - the last resort (typically display message to the user)
bootstrap.addOnError(function (sender, args) {
    debugger;
    alert(args.error.message);
});

bootstrap.addOnUnResolvedBinding((s, args) => {
    var msg = "unresolved databound property for";
    if (args.bindTo == RIAPP.BindTo.Source) {
        msg += " Source: "
    }
    else {
        msg += " Target: "
    }
    msg += "'" + args.root + "'";
    msg += ", property: '" + args.propName + "'";
    msg += ", binding path: '" + args.path + "'";

    console.log(msg);
});

//this function is executed when the application is created
//it can be used to initialize application's specific resources in the namespace
function initModule(app: RIAPP.Application) {
    app.registerElView('productAutocomplete', ProductAutoComplete);
};

export function start(mainOptions: IMainOptions) {
    mainOptions.modulesInits = {
        "COMMON": COMMON.initModule,
        "AUTOCOMPLETE": AUTOCOMPLETE.initModule,
        "MDETDEMO": initModule
    };

    //create and start application here
    bootstrap.startApp(() => {
        return new DemoApplication(mainOptions);
    }, (thisApp) => { });
}