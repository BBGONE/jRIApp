import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

import * as COMMON from "common";
import * as DEMODB from "./domainModel";
import { DemoApplication } from "./app";
import { OrderDetailVM } from "./orderDetVM";

var utils = RIAPP.Utils, $ = utils.dom.$;

export class ProductVM extends RIAPP.ViewModel<DemoApplication> {
    private _orderDetailVM: OrderDetailVM;
    private _dbSet: DEMODB.ProductDb;

    constructor(orderDetailVM: OrderDetailVM) {
        super(orderDetailVM.app);
        var self = this;
        this._orderDetailVM = orderDetailVM;
        this._dbSet = this.dbSets.Product;

        this._customerDbSet.addOnCleared(function (s, a) {
            self.clear();
        }, self.uniqueID);

        //here we load products which are referenced in order details
        this._orderDetailVM.dbSet.addOnFill(function (sender, args) {
            self.loadProductsForOrderDetails(args.items);
        }, self.uniqueID);

        this._dbSet.addOnPropertyChange('currentItem', function (sender, args) {
            self._onCurrentChanged();
        }, self.uniqueID);
    }
    protected _onCurrentChanged() {
        this.raisePropertyChanged('currentItem');
    }
    clear() {
        this.dbSet.clear();
    }
    //returns promise
    loadProductsForOrderDetails(orderDetails: DEMODB.SalesOrderDetail[]) {
        var ids: number[] = orderDetails.map(function (item) {
            return item.ProductID;
        }).filter(function (id) {
            return id !== null;
        });

        return this.load(RIAPP.Utils.arr.distinct(ids), false);
    }
    //returns promise
    load(ids: number[], isClearTable: boolean) {
        var query = this.dbSet.createReadProductByIdsQuery({ productIDs: ids });
        query.isClearPrevData = isClearTable;
        return query.load();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._dbSet) {
            this._dbSet.removeNSHandlers(this.uniqueID);
        }
        this._customerDbSet.removeNSHandlers(this.uniqueID);
        this._orderDetailVM.removeNSHandlers(this.uniqueID);
        this._orderDetailVM = null;
        super.destroy();
    }
    get _customerDbSet() { return this._orderDetailVM.orderVM.customerVM.dbSet; }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get currentItem() { return this._dbSet.currentItem; }
    get dbSet() { return this._dbSet; }
}