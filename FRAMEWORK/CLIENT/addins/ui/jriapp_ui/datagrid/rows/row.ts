﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject } from "jriapp_core/object";
import { Utils as utils, Debounce, DblClick, ERROR } from "jriapp_utils/utils";
import { ICollection, ICollectionItem, ICollChangedArgs, COLL_CHANGE_TYPE, COLL_CHANGE_REASON, ITEM_STATUS,
    ICollItemArgs, ICollItemAddedArgs } from "jriapp_collection/collection";

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

const dom = utils.dom, $ = dom.$, document = utils.dom.document;

export class Row extends BaseObject {
    private _grid: DataGrid;
    private _tr: HTMLTableRowElement;
    private _$tr: JQuery;
    private _item: ICollectionItem;
    private _cells: BaseCell<BaseColumn>[];
    private _objId: string;
    private _expanderCell: ExpanderCell;
    private _actionsCell: ActionsCell;
    private _rowSelectorCell: RowSelectorCell;
    private _isCurrent: boolean;
    private _isDeleted: boolean;
    private _isSelected: boolean;
    private _isDetached: boolean;

    constructor(grid: DataGrid, options: { tr: HTMLTableRowElement; item: ICollectionItem; }) {
        super();
        let self = this;
        this._grid = grid;
        this._tr = options.tr;
        this._item = options.item;
        this._$tr = $(this._tr);
        this._cells = null;
        this._objId = "rw" + utils.core.getNewID();
        this._expanderCell = null;
        this._actionsCell = null;
        this._rowSelectorCell = null;
        this._isCurrent = false;
        this._isDeleted = false;
        this._isSelected = false;
        this._isDetached = false;
        this._createCells();
        this._isDeleted = this._item._aspect.isDeleted;
        if (this._isDeleted)
            dom.addClass([this._tr], css.rowDeleted);
        let fn_state = () => {
            let css = self._grid._getInternal().onRowStateChanged(self, (<any>self._item)[self._grid.options.rowStateField]);
            self._setState(css);
        };
        if (!!this.isHasStateField) {
            this._item.addOnPropertyChange(this._grid.options.rowStateField, function (s, a) {
                fn_state();
            }, this._objId);
            fn_state();
        }
    }
    handleError(error: any, source: any): boolean {
        let isHandled = super.handleError(error, source);
        if (!isHandled) {
            return this.grid.handleError(error, source);
        }
        return isHandled;
    }
    private _createCells() {
        let self = this, i = 0;
        self._cells = new Array(this.columns.length);
        this.columns.forEach(function (col) {
            self._cells[i] = self._createCell(col, i);
            i += 1;
        });
    }
    private _createCell(col: BaseColumn, num: number) {
        let self = this, td: HTMLTableCellElement = <HTMLTableCellElement>document.createElement("td"), cell: BaseCell<BaseColumn>;

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
        else
            cell = new DataCell({ row: self, td: td, column: col, num: num });
        return cell;
    }
    protected _setState(css: string) {
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
        let grid = this._grid;
        if (!!grid) {
            if (!this._isDetached) {
                grid._getInternal().removeRow(this);
            }
            if (!!this._tr) {
                this._$tr.remove();
            }
            this._cells.forEach(function (cell) {
                cell.destroy();
            });
            this._cells = null;
        }
        if (!!this._item && !this._item.getIsDestroyCalled()) {
            this._item.removeNSHandlers(this._objId);
            if (this._item._aspect.isEditing)
                this._item._aspect.cancelEdit();
        }
        this._item = null;
        this._expanderCell = null;
        this._tr = null;
        this._$tr = null;
        this._grid = null;
        super.destroy();
    }
    deleteRow() {
        this._item._aspect.deleteItem();
    }
    updateErrorState() {
        //TODO: add implementation to show explanation of error
        let hasErrors = this._item._aspect.getIsHasErrors();
        let $el = $(this._tr);
        utils.dom.setClass($el.toArray(), css.rowError, !hasErrors);
    }
    scrollIntoView(animate?: boolean, pos?: ROW_POSITION) {
        this.grid.scrollToRow({ row: this, animate: animate, pos: pos });
    }
    toString() {
        return "Row";
    }
    get tr() { return this._tr; }
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
    get isCurrent() { return this._isCurrent; }
    set isCurrent(v) {
        let curr = this._isCurrent;
        if (v !== curr) {
            let $el = $(this._tr);
            this._isCurrent = v;
            if (v) {
                $el.addClass(css.rowHighlight);
            }
            else {
                $el.removeClass(css.rowHighlight);
            }
            this.raisePropertyChanged(PROP_NAME.isCurrent);
        }
    }
    get isSelected() { return this._isSelected; }
    set isSelected(v) {
        if (this._isSelected !== v) {
            this._isSelected = v;
            if (!!this._rowSelectorCell)
                this._rowSelectorCell.checked = this._isSelected;
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
        if (!this._tr)
            return true;
        return this._isDeleted;
    }
    set isDeleted(v) {
        if (!this._tr)
            return;
        if (this._isDeleted !== v) {
            this._isDeleted = v;
            if (this._isDeleted) {
                this.isExpanded = false;
            }
            dom.setClass([this._tr], css.rowDeleted, !this._isDeleted);
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