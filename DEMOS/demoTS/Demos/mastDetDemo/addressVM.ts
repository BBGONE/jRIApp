import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

import * as COMMON from "common";
import * as DEMODB from "../demo/demoDB";
import { DemoApplication } from "./app";
import { OrderVM } from "./orderVM";

export class AddressVM extends RIAPP.ViewModel<DemoApplication> {
    private _orderVM: OrderVM;
    private _dbSet: DEMODB.AddressDb;

    constructor(orderVM: OrderVM) {
        super(orderVM.app);
        const self = this;
        this._orderVM = orderVM;
        this._dbSet = this.dbSets.Address;
        this._orderVM.dbSet.addOnFill(function (sender, args) {
            self.loadAddressesForOrders(args.items);
        }, self.uniqueID);

        this._dbSet.objEvents.onProp('currentItem', function (sender, args) {
            self._onCurrentChanged();
        }, self.uniqueID);
    }
    protected _onCurrentChanged() {
        this.objEvents.raiseProp('currentItem');
    }
    //returns promise
    loadAddressesForOrders(orders: DEMODB.SalesOrderHeader[]) {
        let ids1: number[] = orders.map(function (item) {
            return item.ShipToAddressID;
        });
        let ids2: number[] = orders.map(function (item) {
            return item.BillToAddressID;
        });
        let ids: number[] = ids1.concat(ids2).filter(function (id) {
            return id !== null;
        });
        return this.load(RIAPP.Utils.arr.distinct(ids), false);
    }
    //returns promise
    load(ids: number[], isClearTable: boolean) {
        let query = this.dbSet.createReadAddressByIdsQuery({ addressIDs: ids });
        //if true, previous data will be cleared when the new is loaded
        query.isClearPrevData = isClearTable;
        return query.load();
    }
    clear() {
        this.dbSet.clear();
    }
    dispose() {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        if (!!this._dbSet) {
            this._dbSet.objEvents.offNS(this.uniqueID);
        }
        this._customerDbSet.objEvents.offNS(this.uniqueID);
        this._orderVM.objEvents.offNS(this.uniqueID);
        this._orderVM = null;
        super.dispose();
    }
    get _customerDbSet() { return this._orderVM.customerVM.dbSet; }
    get dbContext() { return this.app.dbContext; }
    get dbSets() { return this.dbContext.dbSets; }
    get currentItem() { return this._dbSet.currentItem; }
    get dbSet() { return this._dbSet; }
    get orderVM() { return this._orderVM; }
}