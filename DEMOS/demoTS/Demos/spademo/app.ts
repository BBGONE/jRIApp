/// <reference path="../../built/shared/shared.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

import * as DEMODB from "./domainModel";
import { ErrorViewModel } from "common";
import { CustomerVM } from "./customerVM";

//local variables for optimization
var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;

export interface IMainOptions extends RIAPP.IAppOptions {
    service_url: string;
    permissionInfo?: dbMOD.IPermissionsInfo;
    images_path: string;
    spa_template1_url: string;
    spa_template2_url: string;
    spa_template3_url: string;
}

export class DemoApplication extends RIAPP.Application {
    private _dbContext: DEMODB.DbContext;
    private _errorVM: ErrorViewModel;
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
        function toText(str:string) {
            if (str === null)
                return '';
            else
                return str;
        };

        this._dbContext.dbSets.Customer.defineComplexProp_NameField(function (item) {
            return toText(item.ComplexProp.LastName) + '  ' + toText(item.ComplexProp.MiddleName) + '  ' + toText(item.ComplexProp.FirstName);
        });
        //register globally accesible dbContext's instance
        this.registerObject('dbContext', this._dbContext);
        this._errorVM = new ErrorViewModel(this);
        this._customerVM = new CustomerVM(this);

        function handleError(sender:any, data:any) {
            self._handleError(sender, data);
        };
        //here we could process application's errors
        this.addOnError(handleError);
        this._dbContext.addOnError(handleError);

        super.onStartUp();
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