import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

import * as COMMON from "common";
import * as DEMODB from "../demo/demoDB";
import { DemoApplication } from "./app";
import { OrderVM } from "./orderVM";
import { ProductVM } from "./productVM";

let utils = RIAPP.Utils, $ = uiMOD.$;

export class OrderDetailVM extends RIAPP.ViewModel<DemoApplication> {
    private _orderVM: OrderVM;
    private _dbSet: DEMODB.SalesOrderDetailDb;
    private _currentOrder: DEMODB.SalesOrderHeader;
    private _productVM: ProductVM;

    constructor(orderVM: OrderVM) {
        super(orderVM.app);
        let self = this;
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
            let deferred = utils.defer.createDeferred<dbMOD.IQueryResult<DEMODB.SalesOrderDetail>>();
            deferred.reject();
            return deferred.promise();
        }
        let query = this.dbSet.createReadSalesOrderDetailQuery();
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