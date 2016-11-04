/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR } from "jriapp_core/const";
import { IContentOptions, ITemplateEvents, ITemplate } from "jriapp_core/shared";
import { BaseObject } from "jriapp_core/object";
import { Utils } from "jriapp_utils/utils";
import { fn_addToolTip } from "jriapp_elview/elview";
import { bootstrap } from "jriapp_core/bootstrap";

import { css } from "../const";
import { BaseCell } from "../cells/base";
import { DataGrid } from "../datagrid";

const utils = Utils, dom = utils.dom, $ = dom.$;

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
    private _$col: JQuery;
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

        let colDiv = dom.document.createElement("div");
        this._$col = $(colDiv);

        utils.dom.addClass([colDiv], css.column);
        if (!!this._options.colCellCss) {
            utils.dom.addClass([colDiv], this._options.colCellCss);
        }

        this._$col.click(function (e) {
            e.stopPropagation();
            bootstrap.currentSelectable = grid;
            grid._getInternal().setCurrentColumn(self);
            self._onColumnClicked();
        });

        this._grid._getInternal().get$Header().append(colDiv);

        this.grid.$table.on("click", this._event_scope, function (e) {
            e.stopPropagation();
            let $td = $(this), cell = <BaseCell<BaseColumn>>$td.data("cell");
            if (!!cell) {
                bootstrap.currentSelectable = grid;
                grid._getInternal().setCurrentColumn(self);
                cell.click();
            }
        });

        let $th = $(this._th);
        if (!!this._options.width) {
            $th.css("width", this._options.width);
        }

        if (!!this._options.templateID) {
            this._template = this.grid.app.createTemplate(this.grid.app, this);
            this._template.templateID = this._options.templateID;
            this._$col.append(this._template.el);
        }
        else if (!!this._options.title) {
            this._$col.html(this._options.title);
        }

        if (!!this._options.tip) {
            fn_addToolTip(this._$col, this._options.tip, false, "bottom center");
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this.grid.$table.off("click", this._event_scope);

        if (!!this._options.tip) {
            fn_addToolTip(this._$col, null);
        }

        if (!!this._template) {
            $(this._template.el).remove();
            this._template.destroy();
            this._template = null;
        }
        this._$col.empty();
        this._$col = null;
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
        this._$col[0].scrollIntoView(!!isUp);
    }
    protected _onColumnClicked() {
    }
    toString() {
        return "BaseColumn";
    }
    get uniqueID() { return this._objId; }
    get th() { return this._th; }
    get $col() { return this._$col; }
    get grid() { return this._grid; }
    get options() { return this._options; }
    get title() { return this._options.title; }
    get isSelected() { return this._isSelected; }
    set isSelected(v) {
        if (this._isSelected !== v) {
            this._isSelected = v;
            utils.dom.setClass(this._$col.toArray(), css.columnSelected, !this._isSelected);
        }
    }
}