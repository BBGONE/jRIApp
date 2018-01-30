/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BaseObject, Utils } from "jriapp_shared";
import { ICollectionItem } from "jriapp_shared/collection/int";
import { DomUtils } from "jriapp/utils/dom";
import { css, ROW_POSITION } from "../const";
import { Row } from "./row";
import { DetailsCell } from "../cells/details";
import { DataGrid } from "../datagrid";

const utils = Utils, coreUtils = utils.core, dom = DomUtils, doc = dom.document,
    { getNewID } = coreUtils;

export class DetailsRow extends BaseObject {
    private _grid: DataGrid;
    private _tr: HTMLTableRowElement;
    private _item: ICollectionItem;
    private _cell: DetailsCell;
    private _parentRow: Row;
    private _objId: string;
    private _isFirstShow: boolean;

    constructor(options: { grid: DataGrid; details_id: string; }) {
        super();
        const self = this, tr = <HTMLTableRowElement>doc.createElement("tr");
        this._grid = options.grid;
        this._tr = tr;
        this._item = null;
        this._cell = null;
        this._parentRow = null;
        this._isFirstShow = true;
        this._objId = getNewID("drow");
        this._createCell(options.details_id);
        dom.addClass([tr], css.rowDetails);
        this._grid.addOnRowExpanded((sender, args) => {
            if (!args.isExpanded && !!args.collapsedRow) {
                self._setParentRow(null);
            }
        }, this._objId);
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._grid.objEvents.offNS(this._objId);
        if (!!this._cell) {
            this._cell.dispose();
            this._cell = null;
        }
        dom.removeNode(this._tr);
        this._item = null;
        this._tr = null;
        this._grid = null;
        super.dispose();
    }
    private _createCell(detailsId: string): void {
        this._cell = new DetailsCell({ row: this, details_id: detailsId });
    }
    protected _setParentRow(row: Row): void {
        const self = this;
        this._item = null;
        this._cell.item = null;
        dom.removeNode(this.tr);
        if (!row || row.getIsStateDirty()) {
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
            if (!parentRow || parentRow.getIsStateDirty()) {
                return;
            }
            if (self.grid.options.isUseScrollIntoDetails) {
                parentRow.scrollIntoView(true, ROW_POSITION.Details);
            }
        });
    }
    private _initShow(): void {
        const animation = this._grid.animation;
        animation.beforeShow(this._cell.template.el);
    }
    private _show(onEnd: () => void): void {
        const animation = this._grid.animation;
        this._isFirstShow = false;
        animation.beforeShow(this._cell.template.el);
        animation.show(onEnd);
    }
    private _hide(onEnd: () => void): void {
        const animation = this._grid.animation;
        animation.beforeHide(this._cell.template.el);
        animation.hide(onEnd);
    }
    toString(): string {
        return "DetailsRow";
    }
    get rect(): ClientRect {
        return this.tr.getBoundingClientRect();
    }
    get height(): number {
        return this.tr.offsetHeight;
    }
    get width(): number {
        return this.tr.offsetHeight;
    }
    get tr(): HTMLTableRowElement {
        return this._tr;
    }
    get grid(): DataGrid {
        return this._grid;
    }
    get item(): ICollectionItem {
        return this._item;
    }
    set item(v: ICollectionItem) {
        if (this._item !== v) {
            this._item = v;
        }
    }
    get cell(): DetailsCell {
        return this._cell;
    }
    get uniqueID(): string {
        return this._objId;
    }
    get itemKey(): string {
        return (!this._item) ? null : this._item._key;
    }
    get parentRow(): Row {
        return this._parentRow;
    }
    set parentRow(v: Row) {
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
