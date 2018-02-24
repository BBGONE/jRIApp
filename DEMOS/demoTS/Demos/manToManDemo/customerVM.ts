import * as RIAPP from "jriapp";
import * as DEMODB from "../demo/demoDB";
import { DemoApplication } from "./app";
import { CustomerAddressVM } from "./custAddressVM";

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
        const self = this;
        this._dbSet = this.dbSets.Customer;
        this._dbSet.isSubmitOnDelete = true;

        this._dbSet.objEvents.onProp('currentItem', function (_s, args) {
            self._onCurrentChanged();
        }, self.uniqueID);

        this._dbSet.addOnItemDeleting(function (s, a) {
            if (!confirm('Are you sure that you want to delete customer ?'))
                a.isCancel = true;
        }, self.uniqueID);

        this._dbSet.addOnEndEdit(function (_s, args) {
            if (!args.isCanceled) {
                self.dbContext.submitChanges();
            }
        }, self.uniqueID);


        this._dbSet.addOnFill(function (_s, args) {
            //when filled, then raise our custom event
            self.objEvents.raise('data_filled', args);
        }, self.uniqueID);

        this._dbSet.addOnItemAdded((_s, args) => {
            args.item.NameStyle = false;
            args.item.ComplexProp.LastName = "DummyLastName";
            args.item.ComplexProp.FirstName = "DummyFirstName";
        });

        //initialize new item with default values
        this._dbSet.addOnItemAdded(function (_s, args) {
            const item = args.item;
            item.NameStyle = false;
        }, self.uniqueID);

        //adds new customer - uses dialog to enter the data
        this._addNewCommand = new RIAPP.Command(function () {
            //showing of the dialog is handled by the datagrid
            self._dbSet.addNew();
        });

        //saves changes (submitts them to the service)
        this._saveCommand = new RIAPP.Command(function () {
            self.dbContext.submitChanges();
        }, function () {
            //the command is enabled when there are pending changes
            return self.dbContext.isHasChanges;
        });


        this._undoCommand = new RIAPP.Command(function () {
            self.dbContext.rejectChanges();
        }, function () {
            //the command is enabled when there are pending changes
            return self.dbContext.isHasChanges;
        });

        //load data from the server
        this._loadCommand = new RIAPP.Command(function () {
            self.load();
        });


        //an example of using command parameter for a command
        this._helpCommand = new RIAPP.Command<{ readonly AddressID: number }>(function (_s, param) {
            alert('Help command executed for AddressID: ' + (!!param ? param.AddressID : '???'));
        }, null);

        this._customerAddressVM = null;
    }
    _onCurrentChanged() {
        this.objEvents.raiseProp('currentItem');
    }
    load() {
        let query = this.dbSet.createReadCustomerQuery({ includeNav: false });
        query.pageSize = 50;
        //when loadPageCount > 1 the we are loading several pages at once
        //when moving to the next page, the data is retrived from the local cache
        query.loadPageCount = 10;
        //we clear the previous cached data for each loading data from the server
        query.isClearCacheOnEveryLoad = true;
        query.orderBy('ComplexProp.LastName').thenBy('ComplexProp.MiddleName').thenBy('ComplexProp.FirstName');
        return query.load();

    }
    dispose() {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        if (!!this._customerAddressVM) {
            this._customerAddressVM.dispose();
            this._customerAddressVM = null;
        }
        if (!!this._dbSet) {
            this._dbSet.objEvents.offNS(this.uniqueID);
        }
        super.dispose();
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