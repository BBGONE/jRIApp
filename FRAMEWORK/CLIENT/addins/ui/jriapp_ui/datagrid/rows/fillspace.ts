/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BaseObject } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { css } from "../consts";
import { FillSpaceCell } from "../cells/fillspace";
import { DataGrid } from "../datagrid";

const dom = DomUtils, doc = dom.document;

export class FillSpaceRow extends BaseObject {
    private _grid: DataGrid;
    private _tr: HTMLTableRowElement;
    private _cell: FillSpaceCell;

    constructor(options: { grid: DataGrid; }) {
        super();
        const tr = <HTMLTableRowElement>doc.createElement("tr");
        this._grid = options.grid;
        this._tr = tr;
        this._cell = null;
        this._createCell();
        dom.addClass([tr], css.fillVSpace);
    }
    dispose(): void {
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
    private _createCell(): void {
        this._cell = new FillSpaceCell({ row: this });
    }
    toString(): string {
        return "FillSpaceRow";
    }
    attach(): void {
        this._grid._tBodyEl.appendChild(this.tr);
    }
    detach(): void {
        dom.removeNode(this.tr);
    }
    get tr(): HTMLTableRowElement {
        return this._tr;
    }
    get grid(): DataGrid {
        return this._grid;
    }
    get cell(): FillSpaceCell {
        return this._cell;
    }
    get height(): number {
        return this._cell.height;
    }
    set height(v: number) {
        this._cell.height = v;
    }
}
