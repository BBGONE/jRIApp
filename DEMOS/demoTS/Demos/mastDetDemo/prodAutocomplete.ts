import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

import * as COMMON from "common";
import * as DEMODB from "../demo/demoDB";
import * as AUTOCOMPLETE from "autocomplete";

var utils = RIAPP.Utils, $ = RIAPP.$;

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
    get dataContext() { return <DEMODB.SalesOrderDetail>this._dataContext; }
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

//this function is executed when the application is created
//it can be used to initialize application's specific resources in the namespace
export function initModule(app: RIAPP.Application) {
    app.registerElView('productAutocomplete', ProductAutoComplete);
};