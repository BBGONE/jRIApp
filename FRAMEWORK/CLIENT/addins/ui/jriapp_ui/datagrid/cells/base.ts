/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject, Utils } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { ICollectionItem } from "jriapp_shared/collection/int";
import { SubscribeFlags } from "jriapp/const";
import { ISubscriber } from "jriapp/int";
import { subscribeWeakMap } from "jriapp/bootstrap";

import { DblClick } from "../../utils/dblclick";
import { Row } from "../rows/row";
import { BaseColumn } from "../columns/base";
import { DataGrid } from "../datagrid";

const utils = Utils, dom = DomUtils, subscribeMap = subscribeWeakMap;

export interface ICellOptions {
    row: Row;
    td: HTMLTableCellElement;
    column: BaseColumn;
    num: number;
}

export class BaseCell<TColumn extends BaseColumn> extends BaseObject implements ISubscriber {
    private _row: Row;
    private _td: HTMLTableCellElement;
    private _column: TColumn;
    protected _click: DblClick;
    private _num: number;

    constructor(options: ICellOptions) {
        super();
        options = utils.core.extend(
            {
                row: null,
                td: null,
                column: null,
                num: 0
            }, options);
        this._row = options.row;
        this._td = options.td;
        subscribeMap.set(this._td, this);
        this._column = <TColumn>options.column;
        this._num = options.num;
        if (!!this._column.options.rowCellCss) {
            dom.addClass([this._td], this._column.options.rowCellCss);
        }
        this._click = new DblClick();
        this._row.tr.appendChild(this._td);
    }
    protected _onCellClicked(row?: Row) {
    }
    protected _onDblClicked(row?: Row) {
        this.grid._getInternal().onCellDblClicked(this);
    }
    isSubscribed(flag: SubscribeFlags): boolean {
        return flag === SubscribeFlags.click;
    }
    handle_click(e: Event) {
        this.grid._getInternal().setCurrentColumn(this.column);
        this.click();
    }
    click() {
        this.grid.currentRow = this._row;
        this._click.click();
    }
    scrollIntoView() {
        this.row.scrollIntoView();
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        subscribeMap.delete(this._td);
        if (!!this._click) {
            this._click.dispose();
            this._click = null;
        }
        dom.removeData(this._td);
        this._row = null;
        this._td = null;
        this._column = null;
        super.dispose();
    }
    toString(): string {
        return "BaseCell";
    }
    get td(): HTMLTableCellElement { return this._td; }
    get row(): Row { return this._row; }
    get column(): TColumn { return this._column; }
    get grid(): DataGrid { return this._row.grid; }
    get item(): ICollectionItem { return this._row.item; }
    get uniqueID(): string { return this._row.uniqueID + "_" + this._num; }
    get num(): number { return this._num; }
}
