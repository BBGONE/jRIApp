/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject, Utils } from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { DATA_ATTR } from "jriapp/const";
import { IContentOptions, ITemplateEvents, ITemplate } from "jriapp/shared";
import { createTemplate } from "jriapp/template";
import { fn_addToolTip } from "../../generic";
import { bootstrap } from "jriapp/bootstrap";

import { css } from "../const";
import { BaseCell } from "../cells/base";
import { DataGrid } from "../datagrid";

const utils = Utils, dom = utils.dom, doc = dom.document, boot = bootstrap;

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
    private _event_scope: string;
    private _template: ITemplate;

    constructor(grid: DataGrid, options: ICellInfo) {
        super();
        let self = this;
        this._grid = grid;
        this._th = options.th;
        this._options = options.colInfo;
        this._isSelected = false;
        this._objId = "col" + utils.core.getNewID();
        this._event_scope = ["td[", DATA_ATTR.DATA_EVENT_SCOPE, '="', this._objId, '"]'].join("");

        const col = doc.createElement("div");
        const $col = $(col);
        this._col = col;

        dom.addClass([col], css.column);

        if (!!this._options.colCellCss) {
            dom.addClass([col], this._options.colCellCss);
        }

        this._grid._getInternal().get$Header().append(col);

        $col.on("click", function (e) {
            e.stopPropagation();
            boot.currentSelectable = grid;
            grid._getInternal().setCurrentColumn(self);
            self._onColumnClicked();
        });

        this.grid.$table.on("click", this._event_scope, function (e) {
            e.stopPropagation();
            const $td = $(this), cell = <BaseCell<BaseColumn>>$td.data("cell");
            if (!!cell) {
                boot.currentSelectable = grid;
                grid._getInternal().setCurrentColumn(self);
                cell.click();
            }
        });

        if (!!this._options.width) {
            this._th.style.width = this._options.width;
        }

        if (!!this._options.templateID) {
            this._template = createTemplate(null, this);
            this._template.templateID = this._options.templateID;
            $col.append(this._template.el);
        }
        else if (!!this._options.title) {
            $col.html(this._options.title);
        }

        if (!!this._options.tip) {
            fn_addToolTip($col, this._options.tip, false, "bottom center");
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this.grid.$table.off("click", this._event_scope);

        if (!!this._options.tip) {
            fn_addToolTip($(this._col), null);
        }

        if (!!this._template) {
            this._template.destroy();
            this._template = null;
        }

        const $col = $(this._col);
        $col.off();
        $col.empty();
        this._col = null;
        this._th = null;
        this._grid = null;
        this._options = null;
        super.destroy();
    }
    templateLoading(template: ITemplate): void {
        //noop
    }
    templateLoaded(template: ITemplate, error?: any): void {
        //noop
    }
    templateUnLoading(template: ITemplate): void {
        //noop
    }
    scrollIntoView(isUp: boolean) {
        if (this.getIsDestroyCalled())
            return;
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