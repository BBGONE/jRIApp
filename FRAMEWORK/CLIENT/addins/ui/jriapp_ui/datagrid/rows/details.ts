/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject, Utils } from "jriapp_shared";
import { ICollectionItem } from "jriapp_shared/collection/int";
import { DomUtils } from "jriapp/utils/dom";
import { css, ROW_POSITION } from "../const";
import { Row } from "./row";
import { DetailsCell } from "../cells/details";
import { DataGrid } from "../datagrid";

const utils = Utils, coreUtils = utils.core, dom = DomUtils, document = dom.document;

export class DetailsRow extends BaseObject {
    private _grid: DataGrid;
    private _tr: HTMLTableRowElement;
    private _item: ICollectionItem;
    private _cell: DetailsCell;
    private _parentRow: Row;
    private _objId: string;
    private _isFirstShow: boolean;

    constructor(options: { grid: DataGrid; tr: HTMLTableRowElement; details_id: string; }) {
        super();
        const self = this, tr = options.tr;
        this._grid = options.grid;
        this._tr = tr;
        this._item = null;
        this._cell = null;
        this._parentRow = null;
        this._isFirstShow = true;
        this._objId = coreUtils.getNewID("drow");
        this._createCell(options.details_id);
        dom.addClass([tr], css.rowDetails);
        this._grid.addOnRowExpanded((sender, args) => {
            if (!args.isExpanded && !!args.collapsedRow) {
                self._setParentRow(null);
            }
        }, this._objId);
    }
    private _createCell(detailsId: string) {
        const td: HTMLTableCellElement = <HTMLTableCellElement>document.createElement("td");
        this._cell = new DetailsCell({ row: this, td: td, details_id: detailsId });
    }
    protected _setParentRow(row: Row) {
        const self = this;
        this._item = null;
        this._cell.item = null;
        dom.removeNode(this.tr);
        if (!row || row.getIsDestroyCalled()) {
            this._parentRow = null;
            return;
        }
        this._parentRow = row;
        this._item = row.item;
        this._cell.item = this._item;
        if (this._isFirstShow) {
            this._initShow();
        }
        dom.insertAfter(this.tr, row.tr);
        this._show(() => {
            const parentRow = self._parentRow;
            if (!parentRow || parentRow.getIsDestroyCalled()) {
                return;
            }
            if (self.grid.options.isUseScrollIntoDetails) {
                parentRow.scrollIntoView(true, ROW_POSITION.Details);
            }
        });
    }
    private _initShow() {
        const animation = this._grid.animation;
        animation.beforeShow(this._cell.template.el);
    }
    private _show(onEnd: () => void) {
        const animation = this._grid.animation;
        this._isFirstShow = false;
        animation.beforeShow(this._cell.template.el);
        animation.show(onEnd);
    }
    private _hide(onEnd: () => void) {
        const animation = this._grid.animation;
        animation.beforeHide(this._cell.template.el);
        animation.hide(onEnd);
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        this._grid.removeNSHandlers(this._objId);
        if (!!this._cell) {
            this._cell.destroy();
            this._cell = null;
        }
        dom.removeNode(this._tr);
        this._item = null;
        this._tr = null;
        this._grid = null;
        super.destroy();
    }
    toString() {
        return "DetailsRow";
    }
    get rect() {
        return this.tr.getBoundingClientRect();
    }
    get height() {
        return this.tr.offsetHeight;
    }
    get width() {
        return this.tr.offsetHeight;
    }
    get tr() { return this._tr; }
    get grid() { return this._grid; }
    get item() { return this._item; }
    set item(v) {
        if (this._item !== v) {
            this._item = v;
        }
    }
    get cell() { return this._cell; }
    get uniqueID() { return this._objId; }
    get itemKey() {
        return (!this._item) ? null : this._item._key;
    }
    get parentRow() { return this._parentRow; }
    set parentRow(v) {
        const self = this;
        if (v !== this._parentRow) {
            if (!!self._parentRow) {
                self._hide(() => {
                    self._setParentRow(v);
                });
            } else {
                self._setParentRow(v);
            }
        }
    }
}
