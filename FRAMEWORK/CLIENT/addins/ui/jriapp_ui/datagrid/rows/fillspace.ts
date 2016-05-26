/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject } from "jriapp_core/object";
import { Utils as utils } from "jriapp_utils/utils";

import { css } from "../const";
import { FillSpaceCell } from "../cells/fillspace";
import { DataGrid } from "../datagrid"

const $ = utils.dom.$;

export class FillSpaceRow extends BaseObject {
    private _grid: DataGrid;
    private _tr: HTMLTableRowElement;
    private _$tr: JQuery;
    private _cell: FillSpaceCell;

    constructor(options: { grid: DataGrid; tr: HTMLTableRowElement; }) {
        super();
        let self = this;
        this._grid = options.grid;
        this._tr = options.tr;
        this._cell = null;
        this._createCell();
        this._$tr = $(this._tr);
        this._$tr.addClass(css.fillVSpace);
    }
    private _createCell() {
        let td: HTMLTableCellElement = <HTMLTableCellElement>document.createElement("td");
        this._cell = new FillSpaceCell({ row: this, td: td });
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._cell) {
            this._cell.destroy();
            this._cell = null;
        }
        this._$tr.remove();
        this._$tr = null;
        this._tr = null;
        this._grid = null;
        super.destroy();
    }
    toString() {
        return "FillSpaceRow";
    }
    attach() {
        this._grid._tBodyEl.appendChild(this._tr);
    }
    detach() {
        utils.dom.removeNode(this._tr);
    }
    get tr() { return this._tr; }
    get $tr() { return this._$tr; }
    get grid() { return this._grid; }
    get cell() { return this._cell; }
    get height() { return this._cell.height; }
    set height(v) { this._cell.height = v; }
}