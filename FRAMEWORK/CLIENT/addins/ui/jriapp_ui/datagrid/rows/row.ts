/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject, Debounce, Utils } from "jriapp_shared";
import { ICollection, ICollectionItem, ICollChangedArgs, COLL_CHANGE_TYPE, COLL_CHANGE_REASON, ITEM_STATUS,
    ICollItemArgs, ICollItemAddedArgs
} from "jriapp_shared/collection/int";
import { $ } from "jriapp/utils/jquery";
import { DblClick } from "../../utils/dblclick";
import { css, ROW_POSITION, PROP_NAME } from "../const";
import { BaseCell } from "../cells/base";
import { ExpanderCell } from "../cells/expander";
import { DataCell } from "../cells/data";
import { ActionsCell } from "../cells/actions";
import { RowSelectorCell } from "../cells/rowselector";

import { BaseColumn, IColumnInfo } from "../columns/base";
import { ExpanderColumn } from "../columns/expander";
import { DataColumn } from "../columns/data";
import { ActionsColumn } from "../columns/actions";
import { RowSelectorColumn } from "../columns/rowselector";

import { DataGrid } from "../datagrid"

const utils = Utils, dom = utils.dom, doc = dom.document;

const fn_state = (row: Row) => {
    const val = !row.item ? null : (<any>row.item)[row.grid.options.rowStateField];
    const css = row.grid._getInternal().onRowStateChanged(row, val);
    row._setState(css);
};

export class Row extends BaseObject {
    private _grid: DataGrid;
    private _$tr: JQuery;
    private _item: ICollectionItem;
    private _cells: BaseCell<BaseColumn>[];
    private _objId: string;
    private _expanderCell: ExpanderCell;
    private _actionsCell: ActionsCell;
    private _rowSelectorCell: RowSelectorCell;
    private _isDeleted: boolean;
    private _isSelected: boolean;
    private _isDetached: boolean;
    
    constructor(grid: DataGrid, options: {
        tr: HTMLTableRowElement;
        item: ICollectionItem;
    }) {
        super();
        const self = this, item = options.item, tr = options.tr;
        this._grid = grid;
        this._$tr = $(tr);
        this._item = item;
        this._cells = [];
        this._objId = "rw" + utils.core.getNewID();
        this._expanderCell = null;
        this._actionsCell = null;
        this._rowSelectorCell = null;
        this._isDeleted = false;
        this._isSelected = false;
        this._isDetached = false;
        this._isDeleted = item._aspect.isDeleted;
        if (this._isDeleted) {
            dom.addClass([tr], css.rowDeleted);
        }

        this._createCells();
        if (!!this._item && !!this.isHasStateField) {
            this._item.addOnPropertyChange(this._grid.options.rowStateField, function (s, a) {
                fn_state(self);
            }, this._objId);
            fn_state(self);
        }
    }
    private _createCells() {
        const self = this, cols = self.columns, len = cols.length;
        for (let i = 0; i < len; i += 1) {
            self._cells.push(self._createCell(cols[i], i));
        }
    }
    private _createCell(col: BaseColumn, num: number) {
        let self = this, td: HTMLTableCellElement = <HTMLTableCellElement>doc.createElement("td"), cell: BaseCell<BaseColumn>;

        if (col instanceof ExpanderColumn) {
            this._expanderCell = new ExpanderCell({ row: self, td: td, column: col, num: num });
            cell = this._expanderCell;
        }
        else if (col instanceof ActionsColumn) {
            this._actionsCell = new ActionsCell({ row: self, td: td, column: col, num: num });
            cell = this._actionsCell;
        }
        else if (col instanceof RowSelectorColumn) {
            this._rowSelectorCell = new RowSelectorCell({ row: self, td: td, column: col, num: num });
            cell = this._rowSelectorCell;
        }
        else {
            cell = new DataCell({ row: self, td: td, column: col, num: num });
        }
        return cell;
    }
    _setState(css: string) {
        for (let i = 0, len = this._cells.length; i < len; i++) {
            let cell = this._cells[i];
            if (cell instanceof DataCell) {
                (<DataCell>cell)._setState(css);
            }
        }
    }
    _onBeginEdit() {
        let self = this;
        self._cells.forEach(function (cell) {
            if (cell instanceof DataCell) {
                (<DataCell>cell)._beginEdit();
            }
        });
        if (!!this._actionsCell)
            this._actionsCell.update();
    }
    _onEndEdit(isCanceled: boolean) {
        let self = this;
        self._cells.forEach(function (cell) {
            if (cell instanceof DataCell) {
                (<DataCell>cell)._endEdit(isCanceled);
            }
        });
        if (!!this._actionsCell)
            this._actionsCell.update();
    }
    beginEdit() {
        return this._item._aspect.beginEdit();
    }
    endEdit() {
        return this._item._aspect.endEdit();
    }
    cancelEdit() {
        return this._item._aspect.cancelEdit();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        const grid = this._grid;
        if (!!grid) {
            if (!this._isDetached) {
                grid._getInternal().removeRow(this);
            }
            this._$tr.remove();
            const cells = this._cells, len = cells.length;
            for (let i = 0; i < len; i += 1) {
                cells[i].destroy();
            }
            this._cells = [];
        }
        this._item.removeNSHandlers(this._objId);
        this._item = null;
        this._expanderCell = null;
        this._$tr = null;
        this._grid = null;
        super.destroy();
    }
    deleteRow() {
        this._item._aspect.deleteItem();
    }
    updateErrorState() {
        //TODO: add implementation to show explanation of error
        const hasErrors = this._item._aspect.getIsHasErrors();
        dom.setClass(this._$tr.toArray(), css.rowError, !hasErrors);
    }
    scrollIntoView(animate?: boolean, pos?: ROW_POSITION) {
        this.grid.scrollToRow({ row: this, animate: animate, pos: pos });
    }
    toString() {
        return "Row";
    }
    get offset() {
        return this.$tr.offset();
    }
    get height() {
        return this.$tr.outerHeight();
    }
    get width() {
        return this.$tr.outerWidth();
    }
    get tr() { return this._$tr[0]; }
    get $tr() { return this._$tr; }
    get grid() { return this._grid; }
    get item() { return this._item; }
    get cells() { return this._cells; }
    get columns() { return this._grid.columns; }
    get uniqueID() { return this._objId; }
    get itemKey() {
        if (!this._item)
            return null;
        return this._item._key;
    }
    get isCurrent() {
        return this.grid.currentItem === this.item;
    }
    get isSelected() { return this._isSelected; }
    set isSelected(v) {
        if (this._isSelected !== v) {
            this._isSelected = v;
            if (!!this._rowSelectorCell) {
                this._rowSelectorCell.checked = this._isSelected;
            }
            this.raisePropertyChanged(PROP_NAME.isSelected);
            this.grid._getInternal().onRowSelectionChanged(this);
        }
    }
    get isExpanded() { return this.grid._getInternal().isRowExpanded(this); }
    set isExpanded(v) {
        if (v !== this.isExpanded) {
            if (!v && this.isExpanded) {
                this.grid._getInternal().expandDetails(this, false);
            }
            else if (v) {
                this.grid._getInternal().expandDetails(this, true);
            }
        }
    }
    get expanderCell() { return this._expanderCell; }
    get actionsCell() { return this._actionsCell; }
    get isDeleted() {
        if (this._isDestroyCalled)
            return true;
        return this._isDeleted;
    }
    set isDeleted(v) {
        if (this._isDestroyCalled)
            return;
        if (this._isDeleted !== v) {
            this._isDeleted = v;
            if (this._isDeleted) {
                this.isExpanded = false;
            }
            dom.setClass(this._$tr.toArray(), css.rowDeleted, !this._isDeleted);
        }
    }
    get isDetached() {
        return this._isDetached;
    }
    set isDetached(v) {
        this._isDetached = v;
    }
    get isEditing() { return !!this._item && this._item._aspect.isEditing; }
    get isHasStateField() { return !!this._grid.options.rowStateField; }
}