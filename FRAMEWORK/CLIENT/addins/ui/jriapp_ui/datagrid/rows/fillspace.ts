/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { css } from "../const";
import { FillSpaceCell } from "../cells/fillspace";
import { DataGrid } from "../datagrid";

const dom = DomUtils;

export class FillSpaceRow extends BaseObject {
    private _grid: DataGrid;
    private _tr: HTMLTableRowElement;
    private _cell: FillSpaceCell;

    constructor(options: { grid: DataGrid; tr: HTMLTableRowElement; }) {
        super();
        const tr = options.tr;
        this._grid = options.grid;
        this._tr = tr;
        this._cell = null;
        this._createCell();
        dom.addClass([tr], css.fillVSpace);
    }
    private _createCell() {
        const td: HTMLTableCellElement = <HTMLTableCellElement>document.createElement("td");
        this._cell = new FillSpaceCell({ row: this, td: td });
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        if (!!this._cell) {
            this._cell.dispose();
            this._cell = null;
        }
        dom.removeNode(this.tr);
        this._tr = null;
        this._grid = null;
        super.dispose();
    }
    toString() {
        return "FillSpaceRow";
    }
    attach() {
        this._grid._tBodyEl.appendChild(this.tr);
    }
    detach() {
        dom.removeNode(this.tr);
    }
    get tr() { return this._tr; }
    get grid() { return this._grid; }
    get cell() { return this._cell; }
    get height() { return this._cell.height; }
    set height(v) { this._cell.height = v; }
}
