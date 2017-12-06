/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject, Utils } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { IContentOptions, ITemplateEvents, ITemplate } from "jriapp/int";
import { createTemplate } from "jriapp/template";
import { fn_addToolTip } from "../../baseview";
import { selectableWeakMap } from "jriapp/bootstrap";

import { css } from "../const";
import { DataGrid } from "../datagrid";

const utils = Utils, dom = DomUtils, doc = dom.document;

export interface IColumnInfo {
    "type"?: string;
    title?: string;
    sortable?: boolean;
    sortMemberName?: string;
    colCellCss?: string;
    rowCellCss?: string;
    width?: any;
    content?: IContentOptions;
    tip?: string;
    templateID?: string;
}

export interface ICellInfo {
    th: HTMLTableHeaderCellElement;
    colInfo: IColumnInfo;
}

export class BaseColumn extends BaseObject implements ITemplateEvents {
    private _grid: DataGrid;
    private _th: HTMLTableHeaderCellElement;
    private _options: IColumnInfo;
    private _isSelected: boolean;
    private _objId: string;
    private _col: HTMLDivElement;
    private _template: ITemplate;

    constructor(grid: DataGrid, options: ICellInfo) {
        super();
        const self = this;
        this._grid = grid;
        this._th = options.th;
        this._options = options.colInfo;
        this._isSelected = false;
        this._objId = utils.core.getNewID("th");
        const col = doc.createElement("div");
        this._col = col;

        dom.addClass([col], css.column);

        if (!!this._options.colCellCss) {
            dom.addClass([col], this._options.colCellCss);
        }

        this._grid._getInternal().getHeader().appendChild(col);
        selectableWeakMap.set(this._col, this._grid);

        // a click on column itself
        dom.events.on(this._col, "click", (e) => {
            grid._getInternal().setCurrentColumn(self);
            self._onColumnClicked();
        }, this.uniqueID);

        if (!!this._options.width) {
            this._th.style.width = this._options.width;
        }

        if (!!this._options.templateID) {
            this._template = createTemplate(null, this);
            this._template.templateID = this._options.templateID;
            dom.append(col, [this._template.el]);
        } else if (!!this._options.title) {
            col.innerHTML = this._options.title;
        }

        if (!!this._options.tip) {
            fn_addToolTip(col, this._options.tip, false, "bottom center");
        }
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        selectableWeakMap.delete(this._col);
        dom.events.offNS(this.grid.table, this.uniqueID);

        if (!!this._options.tip) {
            fn_addToolTip(this._col, null);
        }

        if (!!this._template) {
            this._template.dispose();
            this._template = null;
        }
        dom.events.offNS(this._col, this.uniqueID);
        this._col = null;
        this._th = null;
        this._grid = null;
        this._options = null;
        super.dispose();
    }
    templateLoading(template: ITemplate): void {
        // noop
    }
    templateLoaded(template: ITemplate, error?: any): void {
        // noop
    }
    templateUnLoading(template: ITemplate): void {
        // noop
    }
    scrollIntoView(isUp: boolean) {
        if (this.getIsStateDirty()) {
            return;
        }
        this._col.scrollIntoView(!!isUp);
    }
    updateWidth() {
        this._col.style.width = this._th.offsetWidth + "px";
    }
    protected _onColumnClicked() {
    }
    toString() {
        return "BaseColumn";
    }
    get uniqueID() { return this._objId; }
    get width() { return this._th.offsetWidth; }
    get th() { return this._th; }
    get col() { return this._col; }
    get grid() { return this._grid; }
    get options() { return this._options; }
    get title() { return this._options.title; }
    get isSelected() { return this._isSelected; }
    set isSelected(v) {
        if (!!this._col && this._isSelected !== v) {
            this._isSelected = v;
            dom.setClass([this._col], css.columnSelected, !this._isSelected);
        }
    }
}
