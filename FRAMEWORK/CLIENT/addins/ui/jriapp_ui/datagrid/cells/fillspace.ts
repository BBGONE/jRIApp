/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BaseObject } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { css } from "../consts";
import { FillSpaceRow } from "../rows/fillspace";
import { DataGrid } from "../datagrid";

const dom = DomUtils, doc = dom.document;

export class FillSpaceCell extends BaseObject {
    private _row: FillSpaceRow;
    private _td: HTMLTableCellElement;
    private _div: HTMLElement;

    constructor(options: { row: FillSpaceRow }) {
        super();
        this._row = options.row;
        this._td = <HTMLTableCellElement>document.createElement("td");
        this._td.colSpan = this.grid.columns.length;
        this._row.tr.appendChild(this._td);
        this._div = doc.createElement("div");
        this._div.className = css.fillVSpace;
        this._td.appendChild(this._div);
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._row = null;
        this._td = null;
        this._div = null;
        super.dispose();
    }
    toString(): string {
        return "FillSpaceCell";
    }
    get td(): HTMLTableCellElement {
        return this._td;
    }
    get row(): FillSpaceRow {
        return this._row;
    }
    get grid(): DataGrid {
        return this._row.grid;
    }
    get div(): HTMLElement {
        return this._div;
    }
    get height(): number {
        return this._div.offsetHeight;
    }
    set height(v: number) {
        this._div.style.height = (!v ? 0 : v) + "px";
    }
}
