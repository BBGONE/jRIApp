import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";

import * as DEMODB from "./demoDB";
import * as COMMON from "common";

const bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, PROP_BAG = utils.sys.PROP_BAG_NAME();

//used as a value in our calculated field
export class JsonBag extends RIAPP.BaseObject implements RIAPP.IPropertyBag, RIAPP.IEditable {
    private _owner: DEMODB.CustomerJSON;
    private vals: any;
    private _saveVals: any = null;

    constructor(owner: DEMODB.CustomerJSON) {
        super();
        this._owner = owner;
        //parse JSON to object
        this.vals = (!this._owner.Data ? {} : JSON.parse(this._owner.Data));
    }

    //implements IEditable
    beginEdit(): boolean {
        if (!this.isEditing) {
            //clone data
            this._saveVals = JSON.parse(JSON.stringify(this.vals));
            return true;
        }
        return false;
    }
    endEdit(): boolean {
        if (this.isEditing) {
            this._saveVals = null;
            let val: string = JSON.stringify(this.vals);
            if (val !== this._owner.Data) {
                this._owner.Data = val;
            }
            return true
        }
        return false;
    }
    cancelEdit(): boolean {
        if (this.isEditing) {
            this.vals = this._saveVals;
            this._saveVals = null;
            return true;
        }
        return false;
    }
    get isEditing(): boolean {
        return !!this._saveVals;
    }
    //override
    _isHasProp(prop: string) {
        return true;
    }
    //implements IPropertyBag
    getProp(name: string): any {
        return utils.core.getValue(this.vals, name, '->');
    }
    setProp(name: string, val: any): void {
        const old = utils.core.getValue(this.vals, name, '->');
        if (old !== val) {
            utils.core.setValue(this.vals, name, val, false, '->');
            this.raisePropertyChanged(name);
        }
    }
    toString() {
        //This is a special name. Any PropertyBag implementation should return it.
        //then property  value resolution will use getProp && setProp methods
        return PROP_BAG;
    }
}

export class CustomerViewModel extends RIAPP.ViewModel<DemoApplication> {
    private _dbSet: DEMODB.CustomerJSONDb;
    private _addNewCommand: RIAPP.ICommand;
    private _loadCommand: RIAPP.ICommand;

    constructor(app: DemoApplication) {
        super(app);
        const self = this;
        this._dbSet = this.dbSets.CustomerJSON;
     
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

        //loads data from the server for the products
        this._loadCommand = new RIAPP.TCommand<any, CustomerViewModel>(function (sender, data, viewModel) {
            viewModel.load();
        }, self, null);

        this._dbSet.defineCustomerField(function (item) {
            let bag = <JsonBag>item._aspect.getCustomVal("jsonBag");
            if (!bag) {
                bag = new JsonBag(item);
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