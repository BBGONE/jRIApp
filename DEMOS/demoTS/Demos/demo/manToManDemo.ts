/// <reference path="../jriapp/jriapp.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as DEMODB from "./demoDB";
import * as COMMON from "./common";
import * as AUTOCOMPLETE from "./autocomplete";

var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = utils.dom.$;

export class CustomerVM extends RIAPP.ViewModel<DemoApplication> {
    private _dbSet: DEMODB.CustomerDb;
    private _addNewCommand: RIAPP.ICommand;
    private _saveCommand: RIAPP.ICommand;
    private _undoCommand: RIAPP.ICommand;
    private _loadCommand: RIAPP.ICommand;
    private _helpCommand: RIAPP.ICommand;
    private _customerAddressVM: CustomerAddressVM;

    constructor(app: DemoApplication) {
        super(app);
        var self = this;
        this._dbSet = this.dbSets.Customer;
        this._dbSet.isSubmitOnDelete = true;

        this._dbSet.addOnPropertyChange('currentItem', function (sender, args) {
            self._onCurrentChanged();
        }, self.uniqueID);

        this._dbSet.addOnItemDeleting(function (s, a) {
            if (!confirm('Are you sure that you want to delete customer ?'))
                a.isCancel = true;
        }, self.uniqueID);

        this._dbSet.addOnEndEdit(function (sender, args) {
            if (!args.isCanceled) {
                self.dbContext.submitChanges();
            }
        }, self.uniqueID);


        this._dbSet.addOnFill(function (sender, args) {
            //when filled, then raise our custom event
            self.raiseEvent('data_filled', args);
        }, self.uniqueID);

        this._dbSet.addOnItemAdded((s, args) => {
            args.item.NameStyle = false;
            args.item.ComplexProp.LastName = "DummyLastName";
            args.item.ComplexProp.FirstName = "DummyFirstName";
        });

        //initialize new item with default values
        this._dbSet.addOnItemAdded(function (sender, args) {
            var item = args.item;
            item.NameStyle = false;
        }, self.uniqueID);

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


        //an example of using command parameter for a command
        this._helpCommand = new RIAPP.Command(function (sender, param) {
            alert('Help command executed for AddressID: ' + (!!param ? param.AddressID : '???'));
        }, self, null);

        this._customerAddressVM = null;
    }
    //here we added a custom event
    _getEventNames() {
        var base_events = super._getEventNames();
        return ['data_filled'].concat(base_events);
    }
    _onCurrentChanged() {
        this.raisePropertyChanged('currentItem');
    }
    load() {
        var query = this.dbSet.createReadCustomerQuery({ includeNav: false });
        query.pageSize = 50;
        //when loadPageCount > 1 the we are loading several pages at once
        //when moving to the next page, the data is retrived from the local cache
        query.loadPageCount = 10;
        //we clear the previous cached data for each loading data from the server
        query.isClearCacheOnEveryLoad = true;
        query.orderBy('ComplexProp.LastName').thenBy('ComplexProp.MiddleName').thenBy('ComplexProp.FirstName');
        return query.load();

    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._customerAddressVM) {
            this._customerAddressVM.destroy();
            this._customerAddressVM = null;
        }
        if (!!this._dbSet) {
            this._dbSet.removeNSHandlers(this.uniqueID);
        }
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
    get helpCommand() { return this._helpCommand; }
    get customerAddressVM() {
        if (!this._customerAddressVM)
            this._customerAddressVM = new CustomerAddressVM(this);
        return this._customerAddressVM;
    }
}

export class CustomerAddressVM extends RIAPP.ViewModel<DemoApplication> {
    private _customerVM: CustomerVM;
    private _addressesDb: DEMODB.AddressDb;
    private _custAdressDb: DEMODB.CustomerAddressDb;
    private _currentCustomer: DEMODB.Customer;
    private _addAddressVM: AddAddressVM;
    private _custAdressView: dbMOD.ChildDataView<DEMODB.CustomerAddress>;
    private _addressesView: dbMOD.DataView<DEMODB.Address>;

    constructor(customerVM: CustomerVM) {
        super(customerVM.app);
        var self = this;
        this._customerVM = customerVM;
        this._addAddressVM = null;
        this._currentCustomer = null;
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
            if (!confirm('Are you sure that you want to delete Customer\'s Address ?'))
                args.isCancel = true;
        }, self.uniqueID);

        this._customerVM.dbSet.addOnFill(function (sender, args) {
            self.load(args.items);
        }, self.uniqueID);

        var custAssoc = self.dbContext.associations.getCustAddrToCustomer();

        //the view to filter CustomerAddresses related to the current customer only
        this._custAdressView = new dbMOD.ChildDataView<DEMODB.CustomerAddress>(
            {
                association: custAssoc,
                fn_sort: function (a, b) { return a.AddressID - b.AddressID; }
            });

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

        this._custAdressView.addOnViewRefreshed(function (s, a) {
            self._addressesView.refresh();
        }, self.uniqueID);

        this._customerVM.addOnPropertyChange('currentItem', function (sender, args) {
            self._currentCustomer = self._customerVM.currentItem;
            self._custAdressView.parentItem = self._currentCustomer;
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
        var custIDs = custArr.map(function (item) {
            return item.CustomerID;
        });

        var query = this._custAdressDb.createReadAddressForCustomersQuery({ custIDs: custIDs });
        query.isClearPrevData = true;
        var promise = query.load();
        //load related addresses based on what customerAddress items just loaded
        promise.then(function (res) {
            var addressIDs = res.fetchedItems.map(function (item) {
                return item.AddressID;
            });
            //load new addresses and clear all previous addresses
            self._loadAddresses(addressIDs, true);
        });
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
        if (this._addAddressVM) {
            this._addAddressVM.destroy();
            this._addAddressVM = null;
        }
        super.destroy();
    }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get addressesDb() { return this._addressesDb; }
    get custAdressDb() { return this._custAdressDb; }
    get addressesView() { return this._addressesView; }
    get custAdressView() { return this._custAdressView; }
    get addAddressVM() {
        if (this._addAddressVM === null) {
            this._addAddressVM = new AddAddressVM(this);
        }
        return this._addAddressVM;
    }
    get currentCustomer() { return this._currentCustomer; }
}

//RIAPP.ISubmittable allows for the edit dialog to submit changes automatically
export class AddAddressVM extends RIAPP.ViewModel<DemoApplication> implements RIAPP.ISubmittable {
    private _customerAddressVM: CustomerAddressVM;
    private _addressInfosDb: DEMODB.AddressInfoDb;
    private _currentCustomer: DEMODB.Customer;
    private _searchToolTip: string;
    private _newAddress: DEMODB.Address;
    private _adressInfosGrid: uiMOD.DataGrid;
    private _searchString: string;
    private _isAddingNew: boolean;
    private _dialogVM: uiMOD.DialogVM;
    private _addressInfosView: dbMOD.DataView<DEMODB.AddressInfo>;
    private _linkCommand: RIAPP.ICommand;
    private _addNewCommand: RIAPP.ICommand;
    private _unLinkCommand: RIAPP.ICommand;
    private _execSearchCommand: RIAPP.ICommand;
    private _addNewAddressCommand: RIAPP.ICommand;
    private _propChangeCommand: RIAPP.ICommand;

    constructor(customerAddressVM: CustomerAddressVM) {
        super(customerAddressVM.app);
        var self = this;
        this._customerAddressVM = customerAddressVM;
        this._addressInfosDb = this.dbContext.dbSets.AddressInfo;
        this._currentCustomer = null;
        this._searchToolTip = 'enter any address part then press search button';
        this._newAddress = null;
        this._adressInfosGrid = null;
        this._searchString = null;
        this._isAddingNew = false;
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
                if (!self._isAddingNew) {
                    //allow to close the dialog
                    return uiMOD.DIALOG_ACTION.Default;
                }
                if (!self._newAddress._aspect.endEdit())
                    return uiMOD.DIALOG_ACTION.StayOpen;
                var custAdress = self._customerAddressVM._addNewCustAddress(self._newAddress);
                custAdress._aspect.endEdit();
                self._newAddress = null;
                self._isAddingNew = false;
                self.raisePropertyChanged('newAddress');
                self.raisePropertyChanged('isAddingNew');
                return uiMOD.DIALOG_ACTION.StayOpen;
            },
            fn_OnCancel: function (dialog) {
                if (!self._isAddingNew) {
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

        //this is bound to the grid element view on the page
        //by this command we can get hold of the datagrid control
        //this command executed when element view property changes
        //we grab grid property from the sender (which is element view, and has property - grid)
        this._propChangeCommand = new RIAPP.PropChangedCommand(function (sender, args) {
            if (args.property == '*' || args.property == 'grid') {
                self._adressInfosGrid = sender.grid;
            }
        }, self, null);
    }
    get isCanSubmit(): boolean { return true; }
    submitChanges(): RIAPP.IVoidPromise { return this.dbContext.submitChanges(); }
    rejectChanges(): void {
    }
    protected _cancelAddNewAddress() {
        var self = this;
        self._newAddress._aspect.cancelEdit();
        self._newAddress._aspect.rejectChanges();
        self._newAddress = null;
        self._isAddingNew = false;
        self.raisePropertyChanged('newAddress');
        self.raisePropertyChanged('isAddingNew');
    }
    //returns promise
    loadAddressInfos() {
        var query = this._addressInfosDb.createReadAddressInfoQuery();
        query.isClearPrevData = true;
        COMMON.addTextQuery(query, 'AddressLine1', '%' + this.searchString + '%');
        query.orderBy('AddressLine1');
        return query.load();
    }
    _addNewAddress() {
        this._newAddress = this._customerAddressVM._addNewAddress();
        this._isAddingNew = true;
        this.raisePropertyChanged('newAddress');
        this.raisePropertyChanged('isAddingNew');
    }
    _linkAddress() {
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

        //dont clear, append to the existing
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
    _unLinkAddress() {
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
    _addAddressRP(addressID: number) {
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
    _checkAddressInRP(addressID: number) {
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
    _removeAddressRP(addressID: number) {
        var item = this._addressInfosView.findByPK(addressID);
        if (!!item) {
            this._addressInfosView.removeItem(item);
        }
    }
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
    get isAddingNew() { return this._isAddingNew; }
    get propChangeCommand() { return this._propChangeCommand; }
    get searchToolTip() { return this._searchToolTip; }
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
        function toText(str: any) {
            if (str === null)
                return '';
            else
                return str;
        };

        this._dbContext.dbSets.Customer.defineComplexProp_NameField(function (item) {
            return toText(item.ComplexProp.LastName) + '  ' + toText(item.ComplexProp.MiddleName) + '  ' + toText(item.ComplexProp.FirstName);
        });

        this.registerObject("dbContext", this._dbContext);
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

export function start(mainOptions: IMainOptions) {
    mainOptions.modulesInits = {
        "COMMON" : COMMON.initModule,
        "AUTOCOMPLETE": AUTOCOMPLETE.initModule
    };

    //create and start application here
    bootstrap.startApp(() => {
        return new DemoApplication(mainOptions);
    }, (thisApp) => {});
}