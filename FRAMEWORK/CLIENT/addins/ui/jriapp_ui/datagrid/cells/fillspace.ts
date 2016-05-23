import { BaseObject } from "jriapp_core/object";
import { Utils as utils } from "jriapp_utils/utils";

import { css } from "../const";
import { FillSpaceRow } from "../rows/fillspace";
import { DataGrid } from "../datagrid"

const $ = utils.dom.$;

export class FillSpaceCell extends BaseObject {
    private _row: FillSpaceRow;
    private _td: HTMLTableCellElement;
    private _$div: JQuery;

    constructor(options: { row: FillSpaceRow; td: HTMLTableCellElement; }) {
        super();
        this._row = options.row;
        this._td = options.td;
        this._td.colSpan = this.grid.columns.length;
        this._row.tr.appendChild(this._td);
        this._$div = $("<div></div>");
        this._$div.addClass(css.fillVSpace);
        this._$div.appendTo(this._td);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._row = null;
        this._td = null;
        super.destroy();
    }
    toString() {
        return "FillSpaceCell";
    }
    get td() { return this._td; }
    get row() { return this._row; }
    get grid() { return this._row.grid; }
    get $div() { return this._$div; }
    get height() { return this._$div.height(); }
    set height(v) { this._$div.height(v); }
}