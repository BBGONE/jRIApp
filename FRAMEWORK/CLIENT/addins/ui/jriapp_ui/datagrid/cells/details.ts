/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject } from "jriapp_shared";
import { ITemplate } from "jriapp/int";
import { createTemplate } from "jriapp/template";
import { ICollectionItem } from "jriapp_shared/collection/int";

import { DetailsRow } from "../rows/details";
import { DataGrid } from "../datagrid"

export class DetailsCell extends BaseObject {
    private _row: DetailsRow;
    private _td: HTMLTableCellElement;
    private _template: ITemplate;

    constructor(options: {
        row: DetailsRow;
        td: HTMLTableCellElement; details_id: string;
    }) {
        super();
        this._row = options.row;
        this._td = options.td;
        if (!options.details_id)
            return;
        this._td.colSpan = this.grid.columns.length;
        this._row.tr.appendChild(this._td);
        this._template = createTemplate(null, null);
        this._template.templateID = options.details_id;
        this._td.appendChild(this._template.el);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._template) {
            this._template.destroy();
            this._template = null;
        }
        this._row = null;
        this._td = null;
        super.destroy();
    }
    toString(): string {
        return "DetailsCell";
    }
    get td(): HTMLTableCellElement { return this._td; }
    get row(): DetailsRow { return this._row; }
    get grid(): DataGrid { return this._row.grid; }
    get item(): ICollectionItem {
        return this._template.dataContext;
    }
    set item(v: ICollectionItem) {
        this._template.dataContext = v;
    }
    get template(): ITemplate { return this._template; }
}