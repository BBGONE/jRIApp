import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as DEMODB from "../demo/demoDB";
import { DemoApplication } from "./app";
import { CustomerVM } from "./customerVM";
import { AddAddressVM } from "./addAddressVM";

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