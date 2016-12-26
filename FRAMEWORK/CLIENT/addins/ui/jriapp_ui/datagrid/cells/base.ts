/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject, Utils } from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { DomUtils } from "jriapp/utils/dom";
import { DATA_ATTR } from "jriapp/const";
import { ICollectionItem } from "jriapp_shared/collection/int";

import { DblClick } from "../../utils/dblclick";
import { css } from "../const";
import { Row } from "../rows/row";
import { BaseColumn } from "../columns/base";
import { DataGrid } from "../datagrid"

const utils = Utils, dom = DomUtils;

export interface ICellOptions {
    row: Row;
    td: HTMLTableCellElement;
    column: BaseColumn;
    num: number;
}

export class BaseCell<TColumn extends BaseColumn> extends BaseObject {
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
        this._column = <TColumn>options.column;
        this._num = options.num;
        this._td.setAttribute(DATA_ATTR.DATA_EVENT_SCOPE, this._column.uniqueID);
        $(this._td).data("cell", this);
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
    click() {
        this.grid.currentRow = this._row;
        this._click.click();
    }
    scrollIntoView() {
        this.row.scrollIntoView();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._click) {
            this._click.destroy();
            this._click = null;
        }
        let $td = $(this._td);
        $td.removeData();
        $td.off();
        $td.empty();
        this._row = null;
        this._td = null;
        this._column = null;
        super.destroy();
    }
    toString() {
        return "BaseCell";
    }
    get td() { return this._td; }
    get row() { return this._row; }
    get column() { return this._column; }
    get grid() { return this._row.grid; }
    get item() { return this._row.item; }
    get uniqueID() { return this._row.uniqueID + "_" + this._num; }
    get num() { return this._num; }
}