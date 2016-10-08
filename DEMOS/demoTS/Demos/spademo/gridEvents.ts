import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as DEMODB from "./domainModel";
import * as COMMON from "common";

import { CustomerVM } from "./customerVM";
import { OrderVM } from "./orderVM";

export interface IMyGridEvents<TItem extends RIAPP.ICollectionItem> extends COMMON.IGridEvents<TItem> {
    destroy(): void;
    focusGrid(): void;
}

//instead of obtaining a reference to the real dataGrid instance
//we communicate with the dataGrid through this object
//achieving a loose coupling between UI control and a ViewModel
export class CustomerGridEvents extends RIAPP.BaseObject implements IMyGridEvents<DEMODB.Customer> {
    private _customerVM: CustomerVM;
    private _doFocus: () => void;

    constructor(customerVM: CustomerVM) {
        super();
        this._customerVM = customerVM;
        this._doFocus = null;
    }
    regFocusGridFunc(doFocus: () => void) {
        this._doFocus = doFocus;
    }
    onDataPageChanged() {
        this._customerVM._onGridPageChanged();
    }
    onRowSelected(item: DEMODB.Customer) {
        this._customerVM._onGridRowSelected(item);
    }
    onRowExpanded(item: DEMODB.Customer) {
        this._customerVM._onGridRowExpanded(item);
    }
    onRowCollapsed(item: DEMODB.Customer) {
        this._customerVM._onGridRowCollapsed(item);
    }
    focusGrid() {
        if (!!this._doFocus)
            this._doFocus();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._doFocus = null;
        super.destroy();
    }
}

//instead of obtaining a reference to the real dataGrid instance
//we communicate with the dataGrid through this object
//achieving a loose coupling between UI control and a ViewModel
export class OrderGridEvents extends RIAPP.BaseObject implements IMyGridEvents<DEMODB.SalesOrderHeader> {
    private _orderVM: OrderVM;
    private _doFocus: () => void;

    constructor(orderVM: OrderVM) {
        super();
        this._orderVM = orderVM;
        this._doFocus = null;
    }
    regFocusGridFunc(doFocus: () => void) {
        this._doFocus = doFocus;
    }
    onDataPageChanged() {
        this._orderVM._onGridPageChanged();
    }
    onRowSelected(item: DEMODB.SalesOrderHeader) {
        this._orderVM._onGridRowSelected(item);
    }
    onRowExpanded(item: DEMODB.SalesOrderHeader) {
        this._orderVM._onGridRowExpanded(item);
    }
    onRowCollapsed(item: DEMODB.SalesOrderHeader) {
        this._orderVM._onGridRowCollapsed(item);
    }
    focusGrid() {
        if (!!this._doFocus)
            this._doFocus();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._doFocus = null;
        super.destroy();
    }
}
