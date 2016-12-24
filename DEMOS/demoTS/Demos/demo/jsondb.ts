import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";

import * as DEMODB from "./demoDB";
import * as COMMON from "common";

const bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;

export class CustomerBag extends RIAPP.JsonBag {
    private _addressVal: RIAPP.ArrayVal = null;
  
    constructor(json: string, jsonChanged: (json: string) => void) {
        super(json, jsonChanged);
    }
    setJson(json: string): void {
        super.setJson(json);
        if (!!this._addressVal) {
            this._addressVal.setArr(this.getAddressArray());
        }
    }
    getAddressArray(): any[] {
        const arr = utils.core.getValue(this.val, this.getAddressPath(), '->');
        return (!arr) ? [] : arr;
    }
    protected setAddressArray(arr: any[]): void {
        utils.core.setValue(this.val, this.getAddressPath(), arr, false, '->');
        this._checkChanges();
    }
    getAddressPath(): string {
        return "Addresses";
    }

    //gets addresses in the form of the collection from the json value
    get AddressList() {
        if (!this._addressVal) {
            this._addressVal = new RIAPP.ArrayVal(this.getAddressArray(), () => {
                //sets modified array
                this.setAddressArray(this._addressVal.getArr());
            });
        }
        return this._addressVal.list;
    }
}

export class CustomerViewModel extends RIAPP.ViewModel<DemoApplication> {
    private _dbSet: DEMODB.CustomerJSONDb;
    private _addNewCommand: RIAPP.ICommand;
    private _saveCommand: RIAPP.ICommand;
    private _undoCommand: RIAPP.ICommand;
    private _loadCommand: RIAPP.ICommand;
    private _propWatcher: RIAPP.PropWatcher;

    constructor(app: DemoApplication) {
        super(app);
        const self = this;
        this._dbSet = this.dbSets.CustomerJSON;
        this._propWatcher = new RIAPP.PropWatcher();
     
        //when currentItem property changes, invoke our viewmodel's method
        this._dbSet.addOnPropertyChange('currentItem', function (sender, data) {
            self._onCurrentChanged();
        }, self.uniqueID);

        //if we need to confirm the deletion, this is how it is done
        this._dbSet.addOnItemDeleting(function (sender, args) {
            if (!confirm('Are you sure that you want to delete ' + args.item.CustomerID + ' ?'))
                args.isCancel = true;
        }, self.uniqueID);


        //auto submit changes when an entity is deleted
        this._dbSet.isSubmitOnDelete = true;

        //adds new product - uses dialog to enter the data
        this._addNewCommand = new RIAPP.TCommand<any, CustomerViewModel>(function (sender, param) {
            //grid will show the edit dialog, because we set grid options isHandleAddNew:true
            //see the options for the grid on the HTML demo page
            var item = self._dbSet.addNew();
            //P.S. - grids editor options also has submitOnOK:true, which means
            //on clicking OK button all changes are submitted to the service
        });

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

        //the property watcher helps us handling properties changes
        //more convenient than using addOnPropertyChange
        this._propWatcher.addPropWatch(self.dbContext, 'isHasChanges', function (prop) {
            self._saveCommand.raiseCanExecuteChanged();
            self._undoCommand.raiseCanExecuteChanged();
        });

        //loads data from the server for the products
        this._loadCommand = new RIAPP.TCommand<any, CustomerViewModel>(function (sender, data, viewModel) {
            viewModel.load();
        }, self, null);

        this._dbSet.defineCustomerField(function (item) {
            let bag = <CustomerBag>item._aspect.getCustomVal("jsonBag");
            if (!bag) {
                bag = new CustomerBag(item.Data, (data: string) => {
                   const saveIsEditing = item._aspect.isEditing;
                   if (item.Data !== data) {
                       
                       if (!saveIsEditing) {
                           self._dbSet.isUpdating = true;
                           item._aspect.beginEdit();
                       }

                       //update data
                       item.Data = data;

                       if (!saveIsEditing) {
                           item._aspect.endEdit();
                           self._dbSet.isUpdating = false;
                       }
                    }
                });

                item.addOnPropertyChange("Data", (s, a) => {
                    bag.setJson(item.Data);
                }, null, null, RIAPP.TPriority.AboveNormal);

                item._aspect.setCustomVal("jsonBag", bag);
            }

            return bag;
        });
    }
    protected _onCurrentChanged() {
        this.raisePropertyChanged('currentItem');
    }
    load() {
        var query = this.dbSet.createReadCustomerJSONQuery();
        query.pageSize = 50;
        query.orderBy('CustomerID');
        return query.load();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._dbSet) {
            this._dbSet.removeNSHandlers(this.uniqueID);
        }
        super.destroy();
    }
    get dbSet() { return this._dbSet; }
    get addNewCommand() { return this._addNewCommand; }
    get saveCommand() { return this._saveCommand; }
    get undoCommand() { return this._undoCommand; }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get currentItem() { return this._dbSet.currentItem; }
    get loadCommand() { return this._loadCommand; }
}

export interface IMainOptions extends RIAPP.IAppOptions {
    service_url: string;
    permissionInfo?: dbMOD.IPermissionsInfo;
}

//strongly typed aplication's class
export class DemoApplication extends RIAPP.Application {
    private _dbContext: DEMODB.DbContext;
    private _errorVM: COMMON.ErrorViewModel;
    private _customerVM: CustomerViewModel;

    constructor(options: IMainOptions) {
        super(options);
        var self = this;
        this._dbContext = null;
        this._errorVM = null;
        this._customerVM = null;
    }
    onStartUp() {
        const self = this, options: IMainOptions = self.options;
        this._dbContext = new DEMODB.DbContext();
        this._dbContext.initialize({ serviceUrl: options.service_url, permissions: options.permissionInfo });
        this._errorVM = new COMMON.ErrorViewModel(this);
        this._customerVM = new CustomerViewModel(this);
        function handleError(sender: any, data: any) {
            self._handleError(sender, data);
        };
        //here we could process application's errors
        this.addOnError(handleError);
        this._dbContext.addOnError(handleError);

        super.onStartUp();
    }
    private _handleError(sender: any, data: any) {
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
        const self = this;
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
}

//bootstrap error handler - the last resort (typically display message to the user)
bootstrap.addOnError(function (sender, args) {
    debugger;
    alert(args.error.message);
    args.isHandled = true;
});

export function start(options: IMainOptions) {

    options.modulesInits = {
        "COMMON": COMMON.initModule
    };

    bootstrap.init((bootstrap) => {
        //replace default buttons styles with something custom
        const ButtonsCSS = bootstrap.defaults.ButtonsCSS;
        ButtonsCSS.Edit = 'icon icon-pencil';
        ButtonsCSS.Delete = 'icon icon-trash';
        ButtonsCSS.OK = 'icon icon-ok';
        ButtonsCSS.Cancel = 'icon icon-remove';
    });

    //create and start application here
    return bootstrap.startApp(() => {
        return new DemoApplication(options);
    }, (app) => { }).then((app) => {
        return app.customerVM.load();
    });
}