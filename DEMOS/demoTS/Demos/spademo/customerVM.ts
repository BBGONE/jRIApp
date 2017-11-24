import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";

import * as DEMODB from "./domainModel";
import { DemoApplication } from "./app";
import { IMyGridEvents, CustomerGridEvents } from "./gridEvents";
import { MainRoute, CustDetRoute } from "./routes";
import { CustomerAddressVM } from "./custAddressVM";
import { OrderVM } from "./orderVM";

export class CustomerVM extends RIAPP.ViewModel<DemoApplication> {
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
    private _uiMainRoute: MainRoute;
    private _uiCustDetRoute: CustDetRoute;
    private _switchViewCommand: RIAPP.ICommand;
    private _switchDetViewCommand: RIAPP.ICommand;
    private _gridEvents: IMyGridEvents<DEMODB.Customer>;

    constructor(app: DemoApplication) {
        super(app);
        const self = this;
        this._dbSet = this.dbSets.Customer;
        this._dbSet.isSubmitOnDelete = true;
        this._propWatcher = new RIAPP.PropWatcher();
        this._uiMainRoute = new MainRoute();
        this._uiCustDetRoute = new CustDetRoute();
        this._uiMainRoute.objEvents.onProp('viewName', function (sender, a) {
            self._uiCustDetRoute.reset();
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
            self.objEvents.raise('page_changed', {});
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
            self.uiMainRoute.viewName = param;
        }, self, null);

        this._switchDetViewCommand = new RIAPP.Command(function (sender, param) {
            self.uiCustDetRoute.viewName = param;
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

        let custAssoc = self.dbContext.associations.getCustAddrToCustomer();

        //the view to filter CustomerAddresses related to the current customer only
        this._custAdressView = new dbMOD.ChildDataView<DEMODB.CustomerAddress>(
            {
                association: custAssoc,
                fn_sort: function (a, b) { return a.AddressID - b.AddressID; }
            });

        this._ordersVM = new OrderVM(this);
        this._customerAddressVM = new CustomerAddressVM(this);
    }
    protected _onCurrentChanged() {
        this._custAdressView.parentItem = this._dbSet.currentItem;
        this.objEvents.raiseProp('currentItem');
    }

    _onGridPageChanged() {
    }
    _onGridRowSelected(item: DEMODB.Customer) {
    }
    _onGridRowExpanded(item: DEMODB.Customer) {
        this.objEvents.raise('row_expanded', { customer: item, isExpanded: true });
    }
    _onGridRowCollapsed(item: DEMODB.Customer) {
        this.objEvents.raise('row_expanded', { customer: item, isExpanded: false });
    }
    //returns promise
    load() {
        let query = this._dbSet.createReadCustomerQuery({ includeNav: true });
        query.pageSize = 50;
        //load without filtering
        query.orderBy('ComplexProp.LastName').thenBy('ComplexProp.MiddleName').thenBy('ComplexProp.FirstName');
        return this.dbContext.load(query);
    }
    dispose() {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        this._propWatcher.dispose();
        this._propWatcher = null;

        if (!!this._dbSet) {
            this._dbSet.objEvents.offNS(this.uniqueID);
        }
        this._gridEvents.dispose();
        this._gridEvents = null;
        this._ordersVM.dispose()
        this._ordersVM = null;
        this._customerAddressVM.dispose();
        this._customerAddressVM = null;
        this._custAdressView.dispose();
        this._custAdressView = null;
        super.dispose();
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
    get uiMainRoute() { return this._uiMainRoute; }
    get uiCustDetRoute() { return this._uiCustDetRoute; }
    get gridEvents() { return this._gridEvents; }
}