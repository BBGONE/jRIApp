import * as RIAPP from "jriapp";
import * as DEMODB from "./domainModel";
import * as AUTOCOMPLETE from "autocomplete";

export class ProductAutoComplete extends AUTOCOMPLETE.AutoCompleteElView {
    private _lastLoadedID: number;
    private _lookupSource: DEMODB.ProductDb;

    constructor(options: AUTOCOMPLETE.IAutocompleteOptions) {
        super(options);
        const self = this;
        this._lastLoadedID = null;
        this._lookupSource = <DEMODB.ProductDb>this._getDbContext().getDbSet('Product');
        this._lookupSource.addOnCollChanged(function (sender, args) {
            self._updateValue();
        }, self.uniqueID);
    }
    //override
    protected _updateSelection() {
        if (!!this.dataContext) {
            const id = this.currentSelection;
            this.getDataContext().ProductID = id;
        }
    }
    //new method
    protected _updateValue() {
        if (!this.dataContext) {
            this.value = '';
            return;
        }
        const productID = this.getDataContext().ProductID, product = this._lookupSource.findEntity(productID);
        if (!!product) {
            this.value = product.Name;
        } else {
            this.value = '';
            if (this._lastLoadedID !== productID) {
                //this prevents the cicles of loading of the same item
                this._lastLoadedID = productID;
                let query = this._lookupSource.createReadProductByIdsQuery({ productIDs: [productID] });
                query.isClearPrevData = false;
                query.load();
            }
        }
    }
    //override
    protected setDataContext(v: DEMODB.SalesOrderDetail) {
        const old = this.getDataContext();
        const self = this;
        if (old !== v) {
            const dxt = v;
            if (!!dxt) {
                dxt.addOnPropertyChange('ProductID', (sender, a) => {
                    self._updateValue();
                }, this.uniqueID);
            }
            super.setDataContext(v);
            self._updateValue();
        }
    }
    protected getDataContext() { return <DEMODB.SalesOrderDetail>super.getDataContext(); }
    //overriden base property
    get currentSelection() {
        if (!!this.gridDataSource.currentItem) {
            return <number>(<any>this.gridDataSource.currentItem)['ProductID'];
        } else {
            return null;
        }
    }
}

//this function is executed when the application is created
//it can be used to initialize application's specific resources in the namespace
export function initModule(app: RIAPP.Application) {
    app.registerElView('productAutocomplete', ProductAutoComplete);
};