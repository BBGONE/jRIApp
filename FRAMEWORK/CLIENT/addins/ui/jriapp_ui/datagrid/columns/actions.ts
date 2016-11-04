/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR } from "jriapp_core/const";
import { Utils } from "jriapp_utils/utils";

import { css, ROW_ACTION } from "../const";
import { IColumnInfo, BaseColumn, ICellInfo } from "./base";
import { ActionsCell } from "../cells/actions";
import { DataGrid } from "../datagrid";

const utils = Utils, dom = utils.dom, $ = dom.$;

export interface IActionsColumnInfo extends IColumnInfo {
}

export class ActionsColumn extends BaseColumn {
    private _event_act_scope: string;

    constructor(grid: DataGrid, options: ICellInfo) {
        super(grid, options);

        const self = this, opts: IActionsColumnInfo = this.options;
        this._event_act_scope = ["span[", DATA_ATTR.DATA_EVENT_SCOPE, '="', this.uniqueID, '"]'].join("");
        dom.addClass(this.$col.toArray(), css.rowActions);
        const $table = this.grid.$table;
        $table.on("click", this._event_act_scope, function (e) {
            e.stopPropagation();
            let $img = $(this), name = $img.attr(DATA_ATTR.DATA_NAME), cell: ActionsCell = <any>$img.data("cell");
            self.grid.currentRow = cell.row;
            switch (name) {
                case "img_ok":
                    self._onOk(cell);
                    break;
                case "img_cancel":
                    self._onCancel(cell);
                    break;
                case "img_edit":
                    self._onEdit(cell);
                    break;
                case "img_delete":
                    self._onDelete(cell);
                    break;
            }
        });

        /*
        $table.on("mouseenter", actionsSelector, function (e) {
            e.stopPropagation();
            $(this).css("opacity", 0.5);
       });
        $table.on("mouseout", actionsSelector, function (e) {
            e.stopPropagation();
            $(this).css("opacity", 1.0);
       });
        */

        this.grid.addOnRowAction((sender, args) => {
            switch (args.action) {
                case ROW_ACTION.OK:
                    self._onOk(args.row.actionsCell);
                    break;
                case ROW_ACTION.EDIT:
                    self._onEdit(args.row.actionsCell);
                    break;
                case ROW_ACTION.CANCEL:
                    self._onCancel(args.row.actionsCell);
                    break;
                case ROW_ACTION.DELETE:
                    self._onDelete(args.row.actionsCell);
                    break;
            }
        }, this.uniqueID);
    }
    protected _onOk(cell: ActionsCell) {
        if (!cell.row)
            return;
        cell.row.endEdit();
        cell.update();
    }
    protected _onCancel(cell: ActionsCell) {
        if (!cell.row)
            return;
        cell.row.cancelEdit();
        cell.update();
    }
    protected _onDelete(cell: ActionsCell) {
        if (!cell.row)
            return;
        cell.row.deleteRow();
    }
    protected _onEdit(cell: ActionsCell) {
        if (!cell.row)
            return;
        cell.row.beginEdit();
        cell.update();
        this.grid.showEditDialog();
    }
    toString() {
        return "ActionsColumn";
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let $table = this.grid.$table;
        $table.off("click", this._event_act_scope);
        /*
        $table.off("mouseenter", actionsSelector);
        $table.off("mouseout", actionsSelector);
        */
        this.grid.removeNSHandlers(this.uniqueID);
        super.destroy();
    }
}