/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject } from "jriapp_core/object";
import { Utils } from "jriapp_utils/utils";

import { css } from "../const";
import { FillSpaceRow } from "../rows/fillspace";
import { DataGrid } from "../datagrid"

const utils = Utils, dom = utils.dom;

export class FillSpaceCell extends BaseObject {
    private _row: FillSpaceRow;
    private _td: HTMLTableCellElement;
    private _div: HTMLElement;

    constructor(options: { row: FillSpaceRow; td: HTMLTableCellElement; }) {
        super();
        this._row = options.row;
        this._td = options.td;
        this._td.colSpan = this.grid.columns.length;
        this._row.tr.appendChild(this._td);
        this._div = dom.document.createElement("div");
        this._div.className = css.fillVSpace;
        this._td.appendChild(this._div);
    }
    protected _getAppName() {
        return !this.grid ? "" : this.grid.appName;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._row = null;
        this._td = null;
        this._div = null;
        super.destroy();
    }
    toString() {
        return "FillSpaceCell";
    }
    get td() { return this._td; }
    get row() { return this._row; }
    get grid() { return this._row.grid; }
    get div() { return this._div; }
    get height() { return this._div.offsetHeight; }
    set height(v) { this._div.style.height = (!v ? 0 : v) + "px"; }
}