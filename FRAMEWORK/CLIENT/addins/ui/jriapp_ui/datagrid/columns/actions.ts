/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR } from "jriapp/const";
import { DomUtils } from "jriapp/utils/dom";
import { css, ROW_ACTION } from "../const";
import { IColumnInfo, BaseColumn, ICellInfo } from "./base";
import { ActionsCell } from "../cells/actions";
import { DataGrid } from "../datagrid";

const dom = DomUtils;

export interface IActionsColumnInfo extends IColumnInfo {
}

export class ActionsColumn extends BaseColumn {
    constructor(grid: DataGrid, options: ICellInfo) {
        super(grid, options);
        const self = this;
        dom.addClass([this.col], css.rowActions);
        dom.events.on(this.grid.table, "click", (e) => {
            e.stopPropagation();
            const btn = <HTMLElement>e.target, name = btn.getAttribute(DATA_ATTR.DATA_NAME),
                cell = <ActionsCell>dom.getData(btn, "cell");
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
        }, {
                nmspace: this.uniqueID,
                // using delegation
                matchElement: (el: Element) => {
                    const attr = el.getAttribute(DATA_ATTR.DATA_EVENT_SCOPE),
                        tag = el.tagName.toLowerCase();
                    return self.uniqueID === attr && tag === "span";
                }
            });

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
        if (!cell.row) {
            return;
        }
        cell.row.endEdit();
        cell.update();
    }
    protected _onCancel(cell: ActionsCell) {
        if (!cell.row) {
            return;
        }
        cell.row.cancelEdit();
        cell.update();
    }
    protected _onDelete(cell: ActionsCell) {
        if (!cell.row) {
            return;
        }
        cell.row.deleteRow();
    }
    protected _onEdit(cell: ActionsCell) {
        if (!cell.row) {
            return;
        }
        cell.row.beginEdit();
        cell.update();
        this.grid.showEditDialog();
    }
    toString() {
        return "ActionsColumn";
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        dom.events.offNS(this.grid.table, this.uniqueID);
        this.grid.objEvents.offNS(this.uniqueID);
        super.dispose();
    }
}
