/// <reference path="../jriapp/jriapp.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

import * as DEMO from "./spaDemoApp";
import * as DEMODB from "./domainModel";
import * as COMMON from "./common";
import * as AUTOCOMPLETE from "./autocomplete";
import * as ANIMATION from "./animation";

var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = utils.dom.$;

export class MainViewVM extends RIAPP.BaseObject {
    private _custTemplName: string;
    private _custDetTemplName: string;
    private _viewName: string;
    private _animation: uiMOD.IDynaContentAnimation;

    constructor() {
        super();
        this._custTemplName = 'SPAcustTemplate';
        this._custDetTemplName = 'SPAcustDetailTemplate';
        this._viewName = this._custTemplName;
        this._animation = new ANIMATION.FadeAnimation(true);
    }
    goToAllCust() {
        this.viewName = this.custTemplName;
    }
    goToCustDet() {
        this.viewName = this.custDetTemplName;
    }
    reset() {
        this.viewName = this._custTemplName;
    }
    get animation() { return this._animation; }
    set animation(v) {
        if (v !== this._animation) {
            this._animation = v;
            this.raisePropertyChanged('animation');
        }
    }
    get viewName() { return this._viewName; }
    set viewName(v) {
        if (v !== this._viewName) {
            this._viewName = v;
            this.raisePropertyChanged('viewName');
        }
    }
    get custTemplName() { return this._custTemplName; }
    get custDetTemplName() { return this._custDetTemplName; }
}

export class CustDetViewVM extends RIAPP.BaseObject {
    private _infoTemplName: string;
    private _adrTemplName: string;
    private _viewName: string;
    private _animation: uiMOD.IDynaContentAnimation;

    constructor() {
        super();
        this._infoTemplName = 'customerInfo';
        this._adrTemplName = 'customerAddr';
        this._viewName = this._infoTemplName;
        this._animation = new ANIMATION.SlideAnimation(false);
    }
    goToCustInfo() {
        this.viewName = this.infoTemplName;
    }
    goToAdrInfo() {
        this.viewName = this.adrTemplName;
    }
    reset() {
        this.viewName = this._infoTemplName;
    }
    get animation() { return this._animation; }
    set animation(v) {
        if (v !== this._animation) {
            this._animation = v;
            this.raisePropertyChanged('animation');
        }
    }
    get viewName() { return this._viewName; }
    set viewName(v) {
        if (v !== this._viewName) {
            this._viewName = v;
            this.raisePropertyChanged('viewName');
        }
    }
    get infoTemplName() { return this._infoTemplName; }
    get adrTemplName() { return this._adrTemplName; }
}

export class AddrViewVM extends RIAPP.BaseObject {
    private _linkAdrTemplate: string;
    private _newAdrTemplate: string;
    private _viewName: string;
    constructor() {
        super();
        this._linkAdrTemplate = 'linkAdrTemplate';
        this._newAdrTemplate = 'newAdrTemplate';
        this._viewName = this._linkAdrTemplate;
    }
    goToLinkAdr() {
        this.viewName = this.linkAdrTemplate;
    }
    goToNewAdr() {
        this.viewName = this.newAdrTemplate;
    }
    get viewName() { return this._viewName; }
    set viewName(v) {
        if (v !== this._viewName) {
            this._viewName = v;
            this.raisePropertyChanged('viewName');
        }
    }
    get linkAdrTemplate() { return this._linkAdrTemplate; }
    get newAdrTemplate() { return this._newAdrTemplate; }
}

export interface IMyGridEvents<TItem extends RIAPP.ICollectionItem> extends COMMON.IGridEvents<TItem> {
    destroy(): void;
    focusGrid(): void;
}

//instead of obtaining a reference to the real dataGrid instance
//we communicate with the dataGrid through this object
//achieving a loose coupling between UI control and a ViewModel
export class CustomerGridEvents extends RIAPP.BaseObject implements IMyGridEvents<DEMODB.Customer> {
    private _customerVM: CustomerVM;
    private _doFocus: () => void;

    constructor(customerVM: CustomerVM) {
        super();
        this._customerVM = customerVM;
        this._doFocus =null;
    }
    regFocusGridFunc(doFocus: () => void) {
        this._doFocus = doFocus;
    }
    onDataPageChanged() {
        this._customerVM._onGridPageChanged();
    }
    onRowSelected(item: DEMODB.Customer) {
        this._customerVM._onGridRowSelected(item);
    }
    onRowExpanded(item: DEMODB.Customer) {
        this._customerVM._onGridRowExpanded(item);
    }
    onRowCollapsed(item: DEMODB.Customer) {
        this._customerVM._onGridRowCollapsed(item);
    }
    focusGrid() {
        if (!!this._doFocus)
            this._doFocus();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._doFocus = null;
        super.destroy();
    }
}

export class CustomerVM extends RIAPP.ViewModel<DEMO.DemoApplication> {
    private _dbSet: DEMODB.CustomerDb;
    private _propWatcher: RIAPP.PropWatcher;
    private _addNewCommand: RIAPP.ICommand;
    private _saveCommand: RIAPP.ICommand;
    private _undoCommand: RIAPP.ICommand;
    private _loadCommand: RIAPP.ICommand;
    private _editCommand: RIAPP.ICommand;
    private _endEditCommand: RIAPP.ICommand;
    private _cancelEditCommand: RIAPP.ICommand;
    private _custAdressView: dbMOD.ChildDataView<DEMODB.CustomerAddress>;
    private _customerAddressVM: CustomerAddressVM;
    private _ordersVM: OrderVM;
    private _uiMainView: MainViewVM;
    private _uiDetailView: CustDetViewVM;
    private _switchViewCommand: RIAPP.ICommand;
    private _switchDetViewCommand: RIAPP.ICommand;
    private _gridEvents: IMyGridEvents<DEMODB.Customer>;

    constructor(app: DEMO.DemoApplication) {
        super(app);
        var self = this;
        this._dbSet = this.dbSets.Customer;
        this._dbSet.isSubmitOnDelete = true;
        this._propWatcher = new RIAPP.PropWatcher();
        this._uiMainView = new MainViewVM();
        this._uiDetailView = new CustDetViewVM();
        this._uiMainView.addOnPropertyChange('viewName', function (sender, a) {
            self._uiDetailView.reset();
            if (sender.viewName == sender.custTemplName) {
                setTimeout(function () {
                    if (!!self._gridEvents) {
                        self._gridEvents.focusGrid();
                    }
                }, 0);
            }
        });
        this._gridEvents = new CustomerGridEvents(this);


        this._dbSet.addOnItemDeleting(function (sender, args) {
            if (!confirm('Are you sure that you want to delete customer?'))
                args.isCancel = true;
        }, self.uniqueID);

        this._dbSet.addOnPageIndexChanged(function (sender, args) {
            self.raiseEvent('page_changed', {});
        }, self.uniqueID);

        this._dbSet.addOnItemAdded((s, args) => {
            args.item.NameStyle = false;
            args.item.ComplexProp.LastName = "Dummy1";
            args.item.ComplexProp.FirstName = "Dummy2";
        });

        this._editCommand = new RIAPP.Command(function (sender, param) {
            self.currentItem._aspect.beginEdit();
        }, self,
            function (sender, param) {
                return !!self.currentItem;
            });


        this._endEditCommand = new RIAPP.Command(function (sender, param) {
            if (self.currentItem._aspect.endEdit())
                self.dbContext.submitChanges();
        }, self,
            function (sender, param) {
                return !!self.currentItem;
            });

        this._cancelEditCommand = new RIAPP.Command(function (sender, param) {
            self.currentItem._aspect.cancelEdit();
            self.dbContext.rejectChanges();
        }, self,
            function (sender, param) {
                return !!self.currentItem;
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
    
        this._switchViewCommand = new RIAPP.Command(function (sender, param) {
            self.uiMainView.viewName = param;
        }, self, null);

        this._switchDetViewCommand = new RIAPP.Command(function (sender, param) {
            self.uiDetailView.viewName = param;
        }, self, null);


        //the property watcher helps us handling properties changes
        //more convenient than using addOnPropertyChange
        this._propWatcher.addPropWatch(self.dbContext, 'isHasChanges', function (prop) {
            self._saveCommand.raiseCanExecuteChanged();
            self._undoCommand.raiseCanExecuteChanged();
        });

        this._propWatcher.addPropWatch(this._dbSet, 'currentItem', function (prop) {
            self._editCommand.raiseCanExecuteChanged();
            self._endEditCommand.raiseCanExecuteChanged();
            self._cancelEditCommand.raiseCanExecuteChanged();
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
        this._customerAddressVM = new CustomerAddressVM(this);
    }
    protected _getEventNames() {
        var base_events = super._getEventNames();
        return ['row_expanded', 'page_changed'].concat(base_events);
    }
    protected _onCurrentChanged() {
        this._custAdressView.parentItem = this._dbSet.currentItem;
        this.raisePropertyChanged('currentItem');
    }

    _onGridPageChanged() {
    }
    _onGridRowSelected(item: DEMODB.Customer) {
    }
    _onGridRowExpanded(item: DEMODB.Customer) {
        this.raiseEvent('row_expanded', { customer: item, isExpanded: true });
    }
    _onGridRowCollapsed(item: DEMODB.Customer) {
        this.raiseEvent('row_expanded', { customer: item, isExpanded: false });
    }
    //returns promise
    load() {
        var query = this._dbSet.createReadCustomerQuery({ includeNav: true });
        query.pageSize = 50;
        //load without filtering
        query.orderBy('ComplexProp.LastName').thenBy('ComplexProp.MiddleName').thenBy('ComplexProp.FirstName');
        return this.dbContext.load(query);
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
        this._gridEvents.destroy();
        this._gridEvents = null;
        this._ordersVM.destroy()
        this._ordersVM = null;
        this._customerAddressVM.destroy();
        this._customerAddressVM = null;
        this._custAdressView.destroy();
        this._custAdressView = null;
        super.destroy();
    }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get dbSet() { return this._dbSet; }
    get currentItem() { return this._dbSet.currentItem; }
    get editCommand() { return this._editCommand; }
    get endEditCommand() { return this._endEditCommand; }
    get cancelEditCommand() { return this._cancelEditCommand; }
    get addNewCommand() { return this._addNewCommand; }
    get saveCommand() { return this._saveCommand; }
    get undoCommand() { return this._undoCommand; }
    get loadCommand() { return this._loadCommand; }
    get ordersVM() { return this._ordersVM; }
    get custAdressView() { return this._custAdressView; }
    get customerAddressVM() { return this._customerAddressVM; }
    get switchViewCommand() { return this._switchViewCommand; }
    get switchDetViewCommand() { return this._switchDetViewCommand; }
    get uiMainView() { return this._uiMainView; }
    get uiDetailView() { return this._uiDetailView; }
    get gridEvents() { return this._gridEvents; }
}

//instead of obtaining a reference to the real dataGrid instance
//we communicate with the dataGrid through this object
//achieving a loose coupling between UI control and a ViewModel
export class OrderGridEvents extends RIAPP.BaseObject implements IMyGridEvents<DEMODB.SalesOrderHeader> {
    private _orderVM: OrderVM;
    private _doFocus: () => void;
    constructor(orderVM: OrderVM) {
        super();
        this._orderVM = orderVM;
        this._doFocus = null;
    }
    regFocusGridFunc(doFocus: () => void) {
        this._doFocus = doFocus;
    }
    onDataPageChanged() {
        this._orderVM._onGridPageChanged();
    }
    onRowSelected(item: DEMODB.SalesOrderHeader) {
        this._orderVM._onGridRowSelected(item);
    }
    onRowExpanded(item: DEMODB.SalesOrderHeader) {
        this._orderVM._onGridRowExpanded(item);
    }
    onRowCollapsed(item: DEMODB.SalesOrderHeader) {
        this._orderVM._onGridRowCollapsed(item);
    }
    focusGrid() {
        if (!!this._doFocus)
            this._doFocus();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._doFocus = null;
        super.destroy();
    }
}

export class OrderVM extends RIAPP.ViewModel<DEMO.DemoApplication> implements uiMOD.ITabsEvents{
    private _customerVM: CustomerVM;
    private _dbSet: DEMODB.SalesOrderHeaderDb;
    private _currentCustomer: DEMODB.Customer;
    private _gridEvents: IMyGridEvents<DEMODB.SalesOrderHeader>;
    private _selectedTabIndex: number;
    private _orderStatuses: DEMODB.KeyValDictionary;
    private _addNewCommand: RIAPP.ICommand;
    private _addressVM: AddressVM;
    private _orderDetailVM: OrderDetailVM;
    private _tabs: uiMOD.ITabs;

    constructor(customerVM: CustomerVM) {
        super(customerVM.app);
        var self = this;
        this._customerVM = customerVM;
        this._dbSet = this.dbSets.SalesOrderHeader;
        this._currentCustomer = null;
        this._gridEvents = new OrderGridEvents(this);
        this._selectedTabIndex = null;
        this._orderStatuses = new DEMODB.KeyValDictionary();
        this._orderStatuses.fillItems([{ key: 0, val: 'New Order' }, { key: 1, val: 'Status 1' },
            { key: 2, val: 'Status 2' }, { key: 3, val: 'Status 3' },
            { key: 4, val: 'Status 4' }, { key: 5, val: 'Completed Order' }], true);
        this._tabs = null;

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
            if (!confirm('Are you sure that you want to delete the order?'))
                args.isCancel = true;
        }, self.uniqueID);


        this._dbSet.addOnItemAdded(function (sender, args) {
            var item = args.item;
            item.Customer = self.currentCustomer;
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

    _onGridPageChanged() {
    }
    _onGridRowSelected(item: DEMODB.SalesOrderHeader) {
    }
    _onGridRowExpanded(item: DEMODB.SalesOrderHeader) {
        this.raiseEvent('row_expanded', { order: item, isExpanded: true });
        if (!!this._tabs)
            this.onTabSelected(this._tabs);
    }
    _onGridRowCollapsed(item: DEMODB.SalesOrderHeader) {
        this.raiseEvent('row_expanded', { order: item, isExpanded: false });
    }

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
        this.currentCustomer = null;
        this._gridEvents.destroy();
        this._gridEvents = null;
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
    set currentCustomer(v: DEMODB.Customer) {
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
    get gridEvents() { return this._gridEvents; }
}

export class OrderDetailVM extends RIAPP.ViewModel<DEMO.DemoApplication> {
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
        var query = this.dbSet.createQuery('ReadSalesOrderDetail');
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

export class AddressVM extends RIAPP.ViewModel<DEMO.DemoApplication> {
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
    //returns a promise
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
    //returns a promise
    load(ids: number[], isClearTable: boolean) {
        var query = this.dbSet.createReadAddressByIdsQuery({ addressIDs: ids });
        //if true, then the previous data will be cleared when the new is loaded
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
    //overriden base method
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
    //new method
    protected _updateValue() {
        if (!this.dataContext) {
            this.value = '';
            return;
        }
        var productID = this.dataContext.ProductID;
        var product = this._lookupSource.findEntity(productID);
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
    //overriden base property
    get dataContext() { return <DEMODB.Product>this._dataContext; }
    set dataContext(v) {
        var self = this;
        if (this._dataContext !== v) {
            if (!!this._dataContext) {
                this._dataContext.removeNSHandlers(this.uniqueID);
            }
            this._dataContext = v;
            if (!!this._dataContext) {
                this._dataContext.addOnPropertyChange('ProductID', (sender, a) => {
                    self._updateValue();
                }, this.uniqueID);
            }
            self._updateValue();
            this.raisePropertyChanged('dataContext');
        }
    }
    //overriden base property
    get currentSelection() {
        if (!!this.gridDataSource.currentItem)
            return <number>(<any>this.gridDataSource.currentItem)['ProductID'];
        else
            return null;
    }
}

export class ProductVM extends RIAPP.ViewModel<DEMO.DemoApplication> {
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
    protected _onCurrentChanged() {
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

export class CustomerAddressVM extends RIAPP.ViewModel<DEMO.DemoApplication> {
    private _customerVM: CustomerVM;
    private _addressesDb: DEMODB.AddressDb;
    private _custAdressDb: DEMODB.CustomerAddressDb;
    private _currentCustomer: DEMODB.Customer;
    private _addAddressVM: AddAddressVM;
    private _addressesView: dbMOD.DataView<DEMODB.Address>;

    constructor(customerVM: CustomerVM) {
        super(customerVM.app);
        var self = this;
        this._customerVM = customerVM;
        this._addAddressVM = null;
        this._currentCustomer = self._customerVM.currentItem;
        this._addressesDb = this.dbSets.Address;
        this._custAdressDb = this.dbSets.CustomerAddress;

        this._custAdressDb.addOnItemDeleting(function (sender, args) {
            if (!confirm('Are you sure that you want to unlink Address from this customer?'))
                args.isCancel = true;
        }, self.uniqueID);

        this._custAdressDb.addOnBeginEdit(function (sender, args) {
            var item = args.item;
            //start editing Address entity, when CustomerAddress begins editing
            //p.s.- Address is navigation property
            var address = item.Address;
            if (!!address)
                address._aspect.beginEdit();
        }, self.uniqueID);

        this._custAdressDb.addOnEndEdit(function (sender, args) {
            var item = args.item;
            var address = item.Address;
            if (!args.isCanceled) {
                if (!!address)
                    address._aspect.endEdit();
            }
            else {
                if (address)
                    address._aspect.cancelEdit();
            }
        }, self.uniqueID);

        this._addressesDb.addOnItemDeleting(function (sender, args) {
            if (!confirm('Are you sure that you want to delete the Customer\'s Address?'))
                args.isCancel = true;
        }, self.uniqueID);

        //the view to filter addresses related to the current customer
        this._addressesView = new dbMOD.DataView<DEMODB.Address>(
            {
                dataSource: this._addressesDb,
                fn_sort: function (a, b) { return a.AddressID - b.AddressID; },
                fn_filter: function (item) {
                    if (!self._currentCustomer)
                        return false;
                    return item.CustomerAddresses.some(function (ca) {
                        return self._currentCustomer === ca.Customer;
                    });
                },
                fn_itemsProvider: function (ds) {
                    if (!self._currentCustomer)
                        return [];
                    var custAdrs = self._currentCustomer.CustomerAddresses;
                    return custAdrs.map(function (m) {
                        return m.Address;
                    }).filter(function (address) {
                            return !!address;
                        });
                }
            });
        /*
        this._addressesView.addOnEndEdit((s, a) => {
            self.dbContext.submitChanges();
        }, self.uniqueID, self, false);
        */
        this._custAdressView.addOnViewRefreshed(function (s, a) {
            self._addressesView.refresh();
        }, self.uniqueID);

        this._customerVM.addOnPropertyChange('currentItem', function (sender, args) {
            self._currentCustomer = self._customerVM.currentItem;
            self.raisePropertyChanged('currentCustomer');
        }, self.uniqueID);

    }
    //async load, returns promise
    _loadAddresses(addressIDs: number[], isClearTable: boolean) {
        var query = this._addressesDb.createReadAddressByIdsQuery({ addressIDs: addressIDs });
        //if true, we clear all previous data in the TDbSet
        query.isClearPrevData = isClearTable;
        //returns promise
        return query.load();
    }
    _addNewAddress() {
        //use the TDataView, not TDbSet
        var adr = this.addressesView.addNew();
        return adr;
    }
    _addNewCustAddress(address: DEMODB.Address) {
        var cust = this.currentCustomer;
        //to add item here, use the TDataView, not TDbSet
        var ca = this.custAdressView.addNew();
        ca.CustomerID = cust.CustomerID;
        //this is default, can edit later
        ca.AddressType = "Main Office";
        //create relationship with the address
        //if the address is new, then the primary keys will be aquired when the data is submitted to the server
        ca.Address = address;
        ca._aspect.endEdit();
        return ca;
    }
    load(customers: DEMODB.Customer[]) {
        var self = this, custArr = customers || [];

        //customerIDs for all loaded customers entities (for current page only, not which in cache if query.loadPageCount>1)
        var custIDs = custArr.map(function (item) {
            return item.CustomerID;
        });

        var query = this._custAdressDb.createReadAddressForCustomersQuery({ custIDs: custIDs });
        query.load();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;

        if (!!this._addressesDb) {
            this._addressesDb.removeNSHandlers(this.uniqueID);
        }
        if (!!this._custAdressDb) {
            this._custAdressDb.removeNSHandlers(this.uniqueID);
        }
        if (!!this._customerVM) {
            this._customerVM.removeNSHandlers(this.uniqueID);
        }
        if (!!this._custAdressView) {
            this._custAdressView.removeNSHandlers(this.uniqueID);
        }
        if (this._addAddressVM) {
            this._addAddressVM.destroy();
            this._addAddressVM = null;
        }
        super.destroy();
    }
    private get _custAdressView() { return this._customerVM.custAdressView; }

    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get addressesDb() { return this._addressesDb; }
    get custAdressDb() { return this._custAdressDb; }
    get addressesView() { return this._addressesView; }
    get custAdressView() { return this._custAdressView; }
    get addAddressVM() {
        if (!this._addAddressVM) {
            this._addAddressVM = new AddAddressVM(this);
        }
        return this._addAddressVM;
    }
    get currentCustomer() { return this._currentCustomer; }
}

export class AddAddressVM extends RIAPP.ViewModel<DEMO.DemoApplication> implements RIAPP.ISubmittable {
    private _customerAddressVM: CustomerAddressVM;
    private _addressInfosDb: DEMODB.AddressInfoDb;
    private _currentCustomer: DEMODB.Customer;
    private _searchToolTip: string;
    private _newAddress: DEMODB.Address;
    private _adressInfosGrid: uiMOD.DataGrid;
    private _searchString: string;
    private _dialogVM: uiMOD.DialogVM;
    private _addressInfosView: dbMOD.DataView<DEMODB.AddressInfo>;
    private _linkCommand: RIAPP.ICommand;
    private _addNewCommand: RIAPP.ICommand;
    private _unLinkCommand: RIAPP.ICommand;
    private _execSearchCommand: RIAPP.ICommand;
    private _addNewAddressCommand: RIAPP.ICommand;
    private _propChangeCommand: RIAPP.ICommand;
    private _uiViewVM: AddrViewVM;

    constructor(customerAddressVM: CustomerAddressVM) {
        super(customerAddressVM.app);
        var self = this;
        this._customerAddressVM = customerAddressVM;
        this._addressInfosDb = this.dbContext.dbSets.AddressInfo;
        this._currentCustomer = self._customerAddressVM.currentCustomer;
        this._searchToolTip = 'enter any address part then press search button';
        this._newAddress = null;
        this._adressInfosGrid = null;
        this._searchString = null;
        //for switching user interface current view
        this._uiViewVM = new AddrViewVM();

        this._dialogVM = new uiMOD.DialogVM(self.app);
        var dialogOptions: uiMOD.IDialogConstructorOptions = {
            templateID: 'addAddressTemplate',
            width: 950,
            height: 600,
            title: 'add new customer address',
            submitOnOK: true,
            fn_OnClose: function (dialog) {
                if (dialog.result != 'ok') {
                    //if new address is not explicitly accepted then reject added address
                    if (!!self._newAddress) {
                        self._cancelAddNewAddress();
                    }
                    self.dbContext.rejectChanges();
                }
                self._addressInfosDb.clear();
                self.searchString = null;
            },
            fn_OnOK: function (dialog) {
                if (self.uiViewVM.viewName != self.uiViewVM.newAdrTemplate) {
                    //allow to close the dialog
                    return uiMOD.DIALOG_ACTION.Default;
                }
                if (!self._newAddress._aspect.endEdit())
                    return uiMOD.DIALOG_ACTION.StayOpen;
                var custAdress = self._customerAddressVM._addNewCustAddress(self._newAddress);
                custAdress._aspect.endEdit();
                self._newAddress = null;
                self.uiViewVM.goToLinkAdr();
                self.raisePropertyChanged('newAddress');
                return uiMOD.DIALOG_ACTION.StayOpen;
            },
            fn_OnCancel: function (dialog) {
                if (self.uiViewVM.viewName != self.uiViewVM.newAdrTemplate) {
                    return uiMOD.DIALOG_ACTION.Default;
                }
                if (!!self._newAddress) {
                    self._cancelAddNewAddress();
                }
                return uiMOD.DIALOG_ACTION.StayOpen;
            }
        };
        this._dialogVM.createDialog('addressDialog', dialogOptions);

        //this data displayed in the right panel - contains available (existing in db) addresses
        this._addressInfosView = new dbMOD.DataView<DEMODB.AddressInfo>(
            {
                dataSource: this._addressInfosDb,
                fn_sort: function (a: DEMODB.AddressInfo, b: DEMODB.AddressInfo) { return a.AddressID - b.AddressID; },
                fn_filter: function (item: DEMODB.AddressInfo) {
                    return !item.CustomerAddresses.some(function (CustAdr) {
                        return self._currentCustomer === CustAdr.Customer;
                    });
                }
            });

        //enable paging in the data view
        this._addressInfosView.isPagingEnabled = true;
        this._addressInfosView.pageSize = 50;

        this._addressInfosView.addOnPropertyChange('currentItem', function (sender, args) {
            self.raisePropertyChanged('currentAddressInfo');
            self._linkCommand.raiseCanExecuteChanged();
        }, self.uniqueID);

        this._customerAddressVM.addOnPropertyChange('currentCustomer', function (sender, args) {
            self._currentCustomer = self._customerAddressVM.currentCustomer;
            self.raisePropertyChanged('customer');
            self._addNewCommand.raiseCanExecuteChanged();
        }, self.uniqueID);

        //this data is displayed on the left panel - addresses currently linked to the customer
        this.custAdressView.addOnPropertyChange('currentItem', function (sender, args) {
            self._unLinkCommand.raiseCanExecuteChanged();
        }, self.uniqueID);

        //add new or existing address
        this._addNewCommand = new RIAPP.Command(function (sender, param) {
            try {
                self._dialogVM.showDialog('addressDialog', self);
            } catch (ex) {
                self.handleError(ex, this);
            }
        }, self,
            function (sender, param) {
                //enable this command when customer is not null
                return !!self.customer;
            });

        //load searched address data from the server
        this._execSearchCommand = new RIAPP.Command(function (sender, args) {
            self.loadAddressInfos();
        }, self, null);

        //adds new address to the customer
        this._addNewAddressCommand = new RIAPP.Command(function (sender, args) {
            self._addNewAddress();
        }, self, null);

        //adds existed address to the customer
        this._linkCommand = new RIAPP.Command(function (sender, args) {
            self._linkAddress();
        }, self, function (s, a) {
                return !!self._addressInfosView.currentItem;
            });

        this._unLinkCommand = new RIAPP.Command(function (sender, args) {
            self._unLinkAddress();
        }, self, function (s, a) {
                return !!self.custAdressView.currentItem;
            });

        //this is databound to the grid element view on the page
        //by this command we can get hold of the datagrid control
        //this command executed when an element view property changes
        //we grab grid property from the sender (which is the element view, and has a property - grid)
        this._propChangeCommand = new RIAPP.PropChangedCommand(function (sender, args) {
            if (args.property == '*' || args.property == 'grid') {
                self._adressInfosGrid = sender.grid;
            }
        }, self, null);
    }
    protected _cancelAddNewAddress() {
        var self = this;
        self._newAddress._aspect.cancelEdit();
        self._newAddress._aspect.rejectChanges();
        self._newAddress = null;
        self.uiViewVM.goToLinkAdr();
        self.raisePropertyChanged('newAddress');
    }
    protected _addNewAddress() {
        this._newAddress = this._customerAddressVM._addNewAddress();
        this.uiViewVM.goToNewAdr();
        this.raisePropertyChanged('newAddress');
    }
    protected _linkAddress() {
        var self = this, adrInfo = this.currentAddressInfo, adrView = self.custAdressView, adrID: number;
        if (!adrInfo) {
            alert('_linkAddress error: adrInfoEntity is null');
            return;
        }
        adrID = adrInfo.AddressID;
        var existedAddr: boolean = adrView.items.some(function (item) {
            return item.AddressID === adrID;
        });

        if (existedAddr) {
            alert('Customer already has this address!');
            return;
        }

        //don't clear, append to the existing
        var promise = this._customerAddressVM._loadAddresses([adrID], false);
        promise.then(function (res) {
            var address = self._customerAddressVM.addressesDb.findEntity(adrID);
            if (!!address) {
                self._customerAddressVM._addNewCustAddress(address);
                //remove address from right panel
                self._removeAddressRP(adrID);
            }
        });
    }
    protected _unLinkAddress() {
        var item = this.custAdressView.currentItem;
        if (!item) {
            return;
        }
        var id = item.AddressID;
        //delete it from the left panel
        if (item._aspect.deleteItem())
            //and then add the address to the right panel (really adds an addressInfo, not the address entity)
            this._addAddressRP(id);
    }
    //adds an addressInfo to the right panel
    protected _addAddressRP(addressID: number) {
        //if address already on client, just make it be displayed in the view
        if (this._checkAddressInRP(addressID)) {
            var deferred = utils.defer.createDeferred<dbMOD.IQueryResult<DEMODB.AddressInfo>>();
            deferred.reject();
            return deferred.promise();
        }
        //if we are here, we need to load the address from the server
        var self = this, query = this._addressInfosDb.createReadAddressInfoQuery();
        //dont clear, append to the existing
        query.isClearPrevData = false;
        query.where('AddressID', RIAPP.FILTER_TYPE.Equals, [addressID]);
        var promise = query.load();
        promise.then(function () {
            self._checkAddressInRP(addressID);
        });
        return promise;
    }
    //make sure if the addressInfo already on the client, adds it to the view
    protected _checkAddressInRP(addressID: number) {
        //try to find it in the TDbSet
        var item = this._addressInfosDb.findEntity(addressID);
        if (!!item) {
            //if found, try append to the view
            var appended = this._addressInfosView.appendItems([item]);
            this._addressInfosView.currentItem = item;
            if (!!this._adressInfosGrid)
                this._adressInfosGrid.scrollToCurrent(uiMOD.ROW_POSITION.Up);
        }
        return !!item;
    }
    //remove the address from the right panel (it is done by removing the item from the view)
    protected _removeAddressRP(addressID: number) {
        var item = this._addressInfosView.findByPK(addressID);
        if (!!item) {
            this._addressInfosView.removeItem(item);
        }
    }
    //returns a promise
    loadAddressInfos() {
        var query = this._addressInfosDb.createReadAddressInfoQuery();
        query.isClearPrevData = true;
        COMMON.addTextQuery(query, 'AddressLine1', '%' + this.searchString + '%');
        query.orderBy('AddressLine1');
        return query.load();
    }
    submitChanges(): RIAPP.IPromise<any> { return this.dbContext.submitChanges(); }
    rejectChanges() { }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._addressInfosDb) {
            this._addressInfosDb.removeNSHandlers(this.uniqueID);
            this._addressInfosDb.clear();
            this._addressInfosDb = null;
        }
        if (!!this._addressInfosView) {
            this._addressInfosView.destroy();
            this._addressInfosView = null;
        }
        this.custAdressView.removeNSHandlers(this.uniqueID);
        if (!!this._customerAddressVM) {
            this._customerAddressVM.removeNSHandlers(this.uniqueID);
            this._customerAddressVM = null;
        }
        super.destroy();
    }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get isCanSubmit(): boolean { return true; }
    get addressInfosDb() { return this._addressInfosDb; }
    get addressInfosView() { return this._addressInfosView; }
    get addressesView() { return this._customerAddressVM.addressesView; }
    get custAdressView() { return this._customerAddressVM.custAdressView; }
    get currentAddressInfo() { return <DEMODB.AddressInfo>this._addressInfosView.currentItem; }
    get searchString() { return this._searchString; }
    set searchString(v) {
        if (this._searchString !== v) {
            this._searchString = v;
            this.raisePropertyChanged('searchString');
        }
    }
    get addNewCommand() { return this._addNewCommand; }
    get execSearchCommand() { return this._execSearchCommand; }
    get addNewAddressCommand() { return this._addNewAddressCommand; }
    //links an address to the customer
    get linkCommand() { return this._linkCommand; }
    get unLinkCommand() { return this._unLinkCommand; }
    get newAddress() { return this._newAddress; }
    get customer() { return this._currentCustomer; }
    get propChangeCommand() { return this._propChangeCommand; }
    get searchToolTip() { return this._searchToolTip; }
    get uiViewVM() { return this._uiViewVM; }
}

//this function is executed when the application is created
//it can be used to initialize application specific resources in the module
export function initModule(app: RIAPP.Application) {
    app.registerElView('productAutocomplete', ProductAutoComplete);
}
