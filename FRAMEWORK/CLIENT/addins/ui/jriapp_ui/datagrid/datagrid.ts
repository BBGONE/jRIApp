/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    TEventHandler, IIndexer, LocaleERRS as ERRS, BaseObject,
    Debounce, Utils, IPromise
} from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { DATA_ATTR, KEYS } from "jriapp/const";
import {
    ISelectableProvider, ISelectable, IViewOptions
} from "jriapp/int";
import {
    Parser
} from "jriapp/utils/parser";
import { bootstrap, selectableProviderWeakMap } from "jriapp/bootstrap";
import {
    COLL_CHANGE_REASON, ITEM_STATUS, COLL_CHANGE_TYPE
} from "jriapp_shared/collection/const";
import {
    ICollectionItem, ICollChangedArgs, ICollItemArgs, ICollection, ICollItemAddedArgs
} from "jriapp_shared/collection/int";
import { BaseElView } from "../baseview";
import { parseContentAttr } from "../content/int";
import { IDialogConstructorOptions, DataEditDialog } from "../dialog";

import { css, ROW_POSITION, COLUMN_TYPE, ROW_ACTION } from "./const";
import { IDataGridAnimation, DefaultAnimation } from "./animation";

import { BaseCell } from "./cells/base";

import { Row } from "./rows/row";
import { DetailsRow } from "./rows/details";
import { FillSpaceRow } from "./rows/fillspace";

import { BaseColumn, IColumnInfo, ICellInfo } from "./columns/base";
import { ExpanderColumn } from "./columns/expander";
import { DataColumn } from "./columns/data";
import { ActionsColumn } from "./columns/actions";
import { RowSelectorColumn } from "./columns/rowselector";

export type DataGridCell = BaseCell<BaseColumn>;
export { Row as DataGridRow } from "./rows/row";
export { BaseColumn as DataGridColumn } from "./columns/base";

export { ROW_POSITION, COLUMN_TYPE, ROW_ACTION } from "./const";
export { IDataGridAnimation, DefaultAnimation } from "./animation";
import { $ } from "../utils/jquery";


const utils = Utils, strUtils = utils.str, coreUtils = utils.core, ERROR = utils.err, sys = utils.sys,
    dom = DomUtils, parser = Parser, doc = dom.document, win = dom.window, boot = bootstrap;

let _columnWidthInterval: number, _gridsCount: number = 0;
const _createdGrids: IIndexer<DataGrid> = {};

export function getDataGrids(): DataGrid[] {
    const keys = Object.keys(_createdGrids), res: DataGrid[] = [];
    for (let i = 0; i < keys.length; i += 1) {
        const grid = _createdGrids[keys[i]];
        res.push(grid);
    }

    return res;
}

export function findDataGrid(gridName: string): DataGrid {
    const keys = Object.keys(_createdGrids);
    for (let i = 0; i < keys.length; i += 1) {
        const grid = _createdGrids[keys[i]];
        if (!!grid.table && grid.table.getAttribute(DATA_ATTR.DATA_NAME) === gridName) {
            return grid;
        }
    }

    return null;
}

function updateWidth() {
    _checkGridWidth();
    _columnWidthInterval = win.requestAnimationFrame(updateWidth);
}

function _gridCreated(grid: DataGrid) {
    _createdGrids[grid.uniqueID] = grid;
    _gridsCount += 1;
    if (_gridsCount === 1) {
        _columnWidthInterval = win.requestAnimationFrame(updateWidth);
    }
}

function _gridDestroyed(grid: DataGrid) {
    delete _createdGrids[grid.uniqueID];
    _gridsCount -= 1;
    if (_gridsCount === 0) {
        win.cancelAnimationFrame(_columnWidthInterval);
    }
}

function _checkGridWidth() {
    coreUtils.forEachProp(_createdGrids, (id) => {
        const grid = _createdGrids[id];
        if (grid.getIsStateDirty()) {
            return;
        }
        grid._getInternal().columnWidthCheck();
    });
}

const enum GRID_EVENTS {
    row_expanded = "row_expanded",
    row_selected = "row_selected",
    page_changed = "page_changed",
    row_state_changed = "row_state_changed",
    cell_dblclicked = "cell_dblclicked",
    row_action = "row_action"
}

export interface IRowStateProvider {
    getCSS(item: ICollectionItem, val: any): string;
}

export interface IDataGridOptions {
    isUseScrollInto: boolean;
    isUseScrollIntoDetails: boolean;
    containerCss: string;
    wrapCss: string;
    headerCss: string;
    rowStateField: string;
    isCanEdit: boolean;
    isCanDelete: boolean;
    isHandleAddNew: boolean;
    details?: { templateID: string; };
    editor?: IDialogConstructorOptions;
    // if newly created items are prepended to the table (instead of appended)
    isPrependNewRows?: boolean;
    // if all additionally added rows are prepended to the table (instead of appended)
    isPrependAllRows?: boolean;
    // show or not tooltips on edit and delete buttons (false by default)
    isActionsToolTips?: boolean;
    syncSetDatasource?: boolean;
}


export interface IDataGridConstructorOptions extends IDataGridOptions {
    el: HTMLTableElement;
    dataSource: ICollection<ICollectionItem>;
    animation: IDataGridAnimation;
}

export interface IInternalDataGridMethods {
    isRowExpanded(row: Row): boolean;
    getHeader(): HTMLElement;
    getContainer(): HTMLElement;
    getWrapper(): HTMLElement;
    setCurrentColumn(column: BaseColumn): void;
    onRowStateChanged(row: Row, val: any): string;
    onCellDblClicked(cell: BaseCell<BaseColumn>): void;
    onRowSelectionChanged(row: Row): void;
    resetColumnsSort(): void;
    getLastRow(): Row;
    removeRow(row: Row): void;
    expandDetails(parentRow: Row, expanded: boolean): void;
    columnWidthCheck: () => void;
}

export class DataGrid extends BaseObject implements ISelectableProvider {
    private _options: IDataGridConstructorOptions;
    private _table: HTMLTableElement;
    private _name: string;
    private _objId: string;
    private _rowMap: IIndexer<Row>;
    private _rows: Row[];
    private _columns: BaseColumn[];
    private _expandedRow: Row;
    private _details: DetailsRow;
    private _fillSpace: FillSpaceRow;
    private _expanderCol: ExpanderColumn;
    private _actionsCol: ActionsColumn;
    private _rowSelectorCol: RowSelectorColumn;
    private _currentColumn: BaseColumn;
    private _editingRow: Row;
    private _dialog: DataEditDialog;
    private _header: HTMLElement;
    private _wrapper: HTMLElement;
    private _contaner: HTMLElement;
    private _internal: IInternalDataGridMethods;
    private _selectable: ISelectable;
    private _scrollDebounce: Debounce;
    private _dsDebounce: Debounce;
    private _pageDebounce: Debounce;
    private _updateCurrent: () => void;

    constructor(options: IDataGridConstructorOptions) {
        super();
        const self = this;
        options = coreUtils.merge(options,
            {
                el: null,
                dataSource: null,
                animation: null,
                isUseScrollInto: true,
                isUseScrollIntoDetails: true,
                containerCss: null, // div that wraps all table and header
                wrapCss: null, // div that wraps only table without header
                headerCss: null, // div inside which are column cells
                rowStateField: null,
                isCanEdit: null,
                isCanDelete: null,
                isHandleAddNew: false,
                isPrependNewRows: false,
                isPrependAllRows: false,
                isActionsToolTips: false,
                syncSetDatasource: false
            });

        if (!!options.dataSource && !sys.isCollection(options.dataSource)) {
            throw new Error(ERRS.ERR_GRID_DATASRC_INVALID);
        }
        this._options = options;
        const table = this._options.el;
        this._table = table;
        dom.addClass([table], css.dataTable);
        this._name = table.getAttribute(DATA_ATTR.DATA_NAME);
        this._objId = coreUtils.getNewID("grd");
        this._rowMap = {};
        this._rows = [];
        this._columns = [];
        this._expandedRow = null;
        this._details = null;
        this._fillSpace = null;
        this._expanderCol = null;
        this._actionsCol = null;
        this._rowSelectorCol = null;
        this._currentColumn = null;
        this._editingRow = null;
        this._dialog = null;
        this._header = null;
        this._wrapper = null;
        this._contaner = null;
        this._wrapTable();
        this._scrollDebounce = new Debounce();
        this._dsDebounce = new Debounce();
        this._pageDebounce = new Debounce();

        this._selectable = {
            onKeyDown: (key: number, event: Event) => {
                self._onKeyDown(key, event);
            },
            onKeyUp: (key: number, event: Event) => {
                self._onKeyUp(key, event);
            }
        };
        this._updateCurrent = () => { };
        let tw = table.offsetWidth;

        this._internal = {
            isRowExpanded: (row: Row) => {
                return self._isRowExpanded(row);
            },
            getHeader: () => {
                return self._header;
            },
            getContainer: () => {
                return self._contaner;
            },
            getWrapper: () => {
                return self._wrapper;
            },
            setCurrentColumn: (column: BaseColumn) => {
                self._setCurrentColumn(column);
            },
            onRowStateChanged: (row: Row, val: any) => {
                return self._onRowStateChanged(row, val);
            },
            onCellDblClicked: (cell: BaseCell<BaseColumn>) => {
                self._onCellDblClicked(cell);
            },
            onRowSelectionChanged: (row: Row) => {
                self._onRowSelectionChanged(row);
            },
            resetColumnsSort: () => {
                self._resetColumnsSort();
            },
            getLastRow: () => {
                return self._getLastRow();
            },
            removeRow: (row: Row) => {
                self._removeRow(row);
            },
            expandDetails: (parentRow: Row, expanded: boolean) => {
                self._expandDetails(parentRow, expanded);
            },
            columnWidthCheck: () => {
                if (self.getIsStateDirty()) {
                    return;
                }
                const tw2 = table.offsetWidth;
                if (tw !== tw2) {
                    tw = tw2;
                    self.updateColumnsSize();
                }
            }
        };
        this._createColumns();
        selectableProviderWeakMap.set(table, this);
        _gridCreated(this);

        const ds = this._options.dataSource;
        this.setDataSource(ds);
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        selectableProviderWeakMap.delete(this._table);
        this._scrollDebounce.dispose();
        this._dsDebounce.dispose();
        this._pageDebounce.dispose();
        this._updateCurrent = () => { };
        this._clearGrid();
        this._unbindDS();
        _gridDestroyed(this);
        if (!!this._details) {
            this._details.dispose();
            this._details = null;
        }
        if (!!this._fillSpace) {
            this._fillSpace.dispose();
            this._fillSpace = null;
        }
        if (this._options.animation) {
            this._options.animation.stop();
            this._options.animation = null;
        }
        if (!!this._dialog) {
            this._dialog.dispose();
            this._dialog = null;
        }
        this._unWrapTable();
        dom.removeClass([this._table], css.dataTable);
        dom.removeClass([this._tHeadRow], css.columnInfo);
        this._columns.forEach((col) => { col.dispose(); });
        this._columns = [];
        this._table = null;
        this._options = <any>{};
        this._selectable = null;
        this._internal = null;
        super.dispose();
    }
    protected _updateContentOptions(): void {
        this.columns.filter((column) => column instanceof DataColumn).forEach((column: DataColumn) => {
            column.updateContentOptions();
        });
    }
    protected _onKeyDown(key: number, event: Event): void {
        const ds = this.dataSource, self = this;
        if (!ds) {
            return;
        }
        const currentRow = this.currentRow;
        switch (key) {
            case KEYS.up:
                event.preventDefault();
                if (ds.movePrev(true)) {
                    if (self.isUseScrollInto) {
                        self.scrollToCurrent(ROW_POSITION.Up);
                    }
                }
                break;
            case KEYS.down:
                event.preventDefault();
                if (ds.moveNext(true)) {
                    if (self.isUseScrollInto) {
                        self.scrollToCurrent(ROW_POSITION.Bottom);
                    }
                }
                break;
            case KEYS.pageDown:
                event.preventDefault();
                this._pageDebounce.enque(() => {
                    if (ds.pageIndex > 0) {
                        ds.pageIndex = ds.pageIndex - 1;
                    }
                });
                break;
            case KEYS.pageUp:
                event.preventDefault();
                this._pageDebounce.enque(() => {
                    ds.pageIndex = ds.pageIndex + 1;
                });
                break;
            case KEYS.enter:
                if (!!currentRow && !!this._actionsCol) {
                    event.preventDefault();
                }
                break;
            case KEYS.esc:
                if (!!currentRow && !!this._actionsCol) {
                    if (currentRow.isEditing) {
                        event.preventDefault();
                    }
                }
                break;
            case KEYS.space:
                if (!!this._rowSelectorCol && !!currentRow && (!currentRow.isExpanded && !currentRow.isEditing)) {
                    event.preventDefault();
                }
                break;
        }
    }
    protected _onKeyUp(key: number, event: Event): void {
        const ds = this.dataSource;
        if (!ds) {
            return;
        }
        const currentRow = this.currentRow;
        switch (key) {
            case KEYS.enter:
                if (!!currentRow && !!this._actionsCol) {
                    event.preventDefault();
                    if (currentRow.isEditing) {
                        this.objEvents.raise(GRID_EVENTS.row_action, { row: currentRow, action: ROW_ACTION.OK });
                    } else {
                        this.objEvents.raise(GRID_EVENTS.row_action, { row: currentRow, action: ROW_ACTION.EDIT });
                    }
                }
                break;
            case KEYS.esc:
                if (!!currentRow && !!this._actionsCol) {
                    if (currentRow.isEditing) {
                        event.preventDefault();
                        this.objEvents.raise(GRID_EVENTS.row_action, { row: currentRow, action: ROW_ACTION.CANCEL });
                    }
                }
                break;
            case KEYS.space:
                if (!!this._rowSelectorCol && !!currentRow && (!currentRow.isExpanded && !currentRow.isEditing)) {
                    event.preventDefault();
                    currentRow.isSelected = !currentRow.isSelected;
                }
                break;
        }
    }
    protected _isRowExpanded(row: Row): boolean {
        return this._expandedRow === row;
    }
    protected _setCurrentColumn(column: BaseColumn): void {
        if (!!this._currentColumn) {
            this._currentColumn.isSelected = false;
        }
        this._currentColumn = column;
        if (!!this._currentColumn) {
            this._currentColumn.isSelected = true;
        }
    }
    protected _onRowStateChanged(row: Row, val: any): string {
        const args = { row: row, val: val, css: <string>null };
        this.objEvents.raise(GRID_EVENTS.row_state_changed, args);
        return args.css;
    }
    protected _onCellDblClicked(cell: BaseCell<BaseColumn>): void {
        const args = { cell: cell };
        this.objEvents.raise(GRID_EVENTS.cell_dblclicked, args);
    }
    protected _onRowSelectionChanged(row: Row): void {
        this.objEvents.raise(GRID_EVENTS.row_selected, { row: row });
    }
    protected _resetColumnsSort(): void {
        this.columns.forEach((col) => {
            if (col instanceof DataColumn) {
                (<DataColumn>col).sortOrder = null;
            }
        });
    }
    protected _getLastRow(): Row {
        if (this._rows.length === 0) {
            return null;
        }
        let i = this._rows.length - 1, row = this._rows[i];
        while (row.isDeleted && i > 0) {
            i -= 1;
            row = this._rows[i];
        }
        return (row.isDeleted) ? null : row;
    }
    protected _removeRow(row: Row): number {
        if (this._isRowExpanded(row)) {
            this.collapseDetails();
        }
        if (this._rows.length === 0) {
            return -1;
        }
        const rowkey = row.itemKey, i = utils.arr.remove(this._rows, row);
        try {
            if (i > -1) {
                if (!row.getIsStateDirty()) {
                    row.dispose();
                }
            }
        } finally {
            if (!!this._rowMap[rowkey]) {
                delete this._rowMap[rowkey];
            }
        }
        return i;
    }
    protected _expandDetails(parentRow: Row, expanded: boolean): void {
        if (!this._options.details) {
            return;
        }
        if (!this._details) {
            this._details = this._createDetails();
            this._fillSpace = this._createFillSpace();
        }
        const old = this._expandedRow;
        if (old === parentRow && (!!old && expanded)) {
            return;
        }
        this._expandedRow = null;
        this._details.parentRow = null;

        if (expanded) {
            this._expandedRow = parentRow;
            this._details.parentRow = parentRow;
            this._expandedRow.expanderCell.toggleImage();
            this._fillSpace.attach();
        } else {
            this._expandedRow = null;
            this._details.parentRow = null;
            if (!!old) {
                old.expanderCell.toggleImage();
            }
            this._fillSpace.detach();
            this._fillSpace.height = 0;
        }
        if (old !== parentRow && !!old) {
            old.expanderCell.toggleImage();
        }
        this.objEvents.raise(GRID_EVENTS.row_expanded, { collapsedRow: old, expandedRow: parentRow, isExpanded: expanded });
    }
    protected _parseColumnAttr(columnAttr: string, contentAttr: string) {
        const defaultOp: IColumnInfo = {
            "type": COLUMN_TYPE.DATA, // default column type
            title: null,
            sortable: false,
            sortMemberName: null,
            content: null
        };
        let options: IColumnInfo;

        const tempOpts = parser.parseOptions(columnAttr);
        if (tempOpts.length > 0) {
            options = coreUtils.extend(defaultOp, tempOpts[0]);
        } else {
            options = defaultOp;
        }

        if (!!contentAttr) {
            options.content = parseContentAttr(contentAttr);
            if (!options.sortMemberName && !!options.content.fieldName) {
                options.sortMemberName = options.content.fieldName;
            }
        }

        return options;
    }
    protected _findUndeleted(row: Row, isUp: boolean) {
        if (!row) {
            return null;
        }
        if (!row.isDeleted) {
            return row;
        }
        // find nearest nondeleted row (search up and down)
        const delIndex = this.rows.indexOf(row), len = this.rows.length;
        let i = delIndex;

        if (!isUp) {
            i -= 1;
            if (i >= 0) {
                row = this.rows[i];
            }
            while (i >= 0 && row.isDeleted) {
                i -= 1;
                if (i >= 0) {
                    row = this.rows[i];
                }
            }
            if (row.isDeleted) {
                row = null;
            }
        } else {
            i += 1;
            if (i < len) {
                row = this.rows[i];
            }
            while (i < len && row.isDeleted) {
                i += 1;
                if (i < len) {
                    row = this.rows[i];
                }
            }
            if (row.isDeleted) {
                row = null;
            }
        }
        return row;
    }
    protected _onDSCurrentChanged(prevCurrent: ICollectionItem, newCurrent: ICollectionItem) {
        if (prevCurrent !== newCurrent) {
            const oldRow = !prevCurrent ? null : this._rowMap[prevCurrent._key];
            const newRow = !newCurrent ? null : this._rowMap[newCurrent._key];
            if (!!oldRow) {
                oldRow.objEvents.raiseProp("isCurrent");
                dom.removeClass([oldRow.tr], css.rowHighlight);
            }
            if (!!newRow) {
                newRow.objEvents.raiseProp("isCurrent");
                dom.addClass([newRow.tr], css.rowHighlight);
            }
        }
    }
    protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>) {
        const self = this;
        switch (args.changeType) {
            case COLL_CHANGE_TYPE.Reset:
                {
                    if (args.reason === COLL_CHANGE_REASON.None) {
                        self._resetColumnsSort();
                    }
                    self._refresh(args.reason === COLL_CHANGE_REASON.PageChange);
                }
                break;
            case COLL_CHANGE_TYPE.Add:
                {
                    self._appendItems(args.items);
                    self._updateTableDisplay();
                }
                break;
            case COLL_CHANGE_TYPE.Remove:
                {
                    let rowpos = -1;
                    args.items.forEach((item) => {
                        const row = self._rowMap[item._key];
                        if (!!row) {
                            rowpos = self._removeRow(row);
                        }
                    });
                    // positioning the row after deletion
                    const rowlen = this._rows.length;
                    if (rowpos > -1 && rowlen > 0) {
                        if (rowpos < rowlen) {
                            this.currentRow = this._rows[rowpos];
                        } else {
                            this.currentRow = this._rows[rowlen - 1];
                        }
                    }

                    self._updateTableDisplay();
                }
                break;
            case COLL_CHANGE_TYPE.Remap:
                {
                    const row = self._rowMap[args.old_key];
                    if (!!row) {
                        delete self._rowMap[args.old_key];
                        self._rowMap[args.new_key] = row;
                    }
                }
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
        }
    }
    protected _updateTableDisplay() {
        if (!this._table) {
            return;
        }
        if (!this.dataSource || this.dataSource.count === 0) {
            this._table.style.visibility = "hidden";
        } else {
            this._table.style.visibility = "visible";
        }
    }
    protected _onPageChanged() {
        if (!!this._rowSelectorCol) {
            this._rowSelectorCol.checked = false;
        }
        this.objEvents.raise(GRID_EVENTS.page_changed, {});
    }
    protected _onItemEdit(item: ICollectionItem, isBegin: boolean, isCanceled: boolean) {
        const row = this._rowMap[item._key];
        if (!row) {
            return;
        }
        if (isBegin) {
            row._onBeginEdit();
            this._editingRow = row;
        } else {
            row._onEndEdit(isCanceled);
            this._editingRow = null;
        }
        this.objEvents.raiseProp("editingRow");
    }
    protected _onItemAdded(sender: any, args: ICollItemAddedArgs<ICollectionItem>) {
        const item = args.item, row = this._rowMap[item._key];
        if (!row) {
            return;
        }
        this.scrollToCurrent();
        // row.isExpanded = true;
        if (this._options.isHandleAddNew && !args.isAddNewHandled) {
            args.isAddNewHandled = this.showEditDialog();
        }
    }
    protected _onItemStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS) {
        const newStatus: ITEM_STATUS = item._aspect.status, ds = this.dataSource, row = this._rowMap[item._key];
        if (!row) {
             return;
        }
        if (newStatus === ITEM_STATUS.Deleted) {
            row.isDeleted = true;
            let row2 = this._findUndeleted(row, true);
            if (!row2) {
                row2 = this._findUndeleted(row, false);
            }
            if (!!row2) {
                ds.currentItem = row2.item;
            }
        } else if (oldStatus === ITEM_STATUS.Deleted) {
            row.isDeleted = false;
        }
    }
    protected _onDSErrorsChanged(sender: any, args: ICollItemArgs<ICollectionItem>) {
        const row = this._rowMap[args.item._key];
        if (!row) {
            return;
        }
        row.updateErrorState();
    }
    protected _bindDS() {
        const self = this, ds = this.dataSource;
        if (!ds) {
            this._updateTableDisplay();
            return;
        }
        let oldCurrent: ICollectionItem = null;
        this._updateCurrent = () => {
            const coll = this.dataSource;
            self._onDSCurrentChanged(oldCurrent, coll.currentItem);
            oldCurrent = coll.currentItem;
        };

        ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
        ds.addOnCurrentChanged(() => {
            self._updateCurrent();
        }, self._objId, self);
        ds.addOnBeginEdit((sender, args) => {
            self._onItemEdit(args.item, true, false);
        }, self._objId);
        ds.addOnEndEdit((sender, args) => {
            self._onItemEdit(args.item, false, args.isCanceled);
        }, self._objId);
        ds.addOnErrorsChanged(self._onDSErrorsChanged, self._objId, self);
        ds.addOnStatusChanged((sender, args) => {
            self._onItemStatusChanged(args.item, args.oldStatus);
        }, self._objId);
        ds.addOnItemAdded(self._onItemAdded, self._objId, self);
        ds.addOnItemAdding((s, a) => {
            self.collapseDetails();
        }, self._objId);
    }
    protected _unbindDS() {
        const self = this, ds = this.dataSource;
        this._updateTableDisplay();
        if (!ds) {
            return;
        }
        ds.objEvents.offNS(self._objId);
    }
    protected _clearGrid() {
        if (this._rows.length === 0) {
            return;
        }
        this.collapseDetails();
        const self = this, tbody = self._tBodyEl, newTbody = doc.createElement("tbody");
        this.table.replaceChild(newTbody, tbody);
        const rows = this._rows;
        this._rows = [];
        this._rowMap = {};
        rows.forEach((row) => {
            row.isDetached = true;
            row.dispose();
        });
    }
    protected _wrapTable() {
        const options = this._options;
        const wrapper = doc.createElement("div"), container = doc.createElement("div"),
            header = doc.createElement("div");
        dom.addClass([wrapper], css.wrapDiv);
        dom.addClass([container], css.container);
        dom.addClass([header], css.headerDiv);
        if (options.wrapCss) {
            dom.addClass([wrapper], options.wrapCss);
        }
        if (options.containerCss) {
            dom.addClass([container], options.containerCss);
        }
        if (options.headerCss) {
            dom.addClass([header], options.headerCss);
        }

        dom.wrap(this.table, wrapper);
        dom.wrap(wrapper, container);
        dom.insertBefore(header, wrapper);
        dom.addClass([this._tHeadRow], css.columnInfo);

        this._wrapper = wrapper;
        this._header = header;
        this._contaner = container;
        selectableProviderWeakMap.set(this._contaner, this);
    }
    protected _unWrapTable() {
        if (!this._header) {
            return;
        }
        selectableProviderWeakMap.delete(this._contaner);
        this._header.remove();
        this._header = null;
        // first call to remove wrap div
        dom.unwrap(this.table);
        // second call to remove container div
        dom.unwrap(this.table);
        this._wrapper = null;
        this._contaner = null;
    }
    protected _createColumns() {
        const self = this, headCells = this._tHeadCells, cellInfos: ICellInfo[] = [];
        const cnt = headCells.length;

        for (let i = 0; i < cnt; i += 1) {
            const th = headCells[i], attr = this._parseColumnAttr(th.getAttribute(DATA_ATTR.DATA_COLUMN), th.getAttribute(DATA_ATTR.DATA_CONTENT));
            cellInfos.push({ th: th, colInfo: attr });
        }

        cellInfos.forEach((cellInfo) => {
            const col = self._createColumn(cellInfo);
            if (!!col) {
                self._columns.push(col);
            }
        });

        self.updateColumnsSize();
    }
    protected _createColumn(cellInfo: ICellInfo) {
        let col: BaseColumn;
        switch (cellInfo.colInfo.type) {
            case COLUMN_TYPE.ROW_EXPANDER:
                if (!this._expanderCol) {
                    col = new ExpanderColumn(this, cellInfo);
                    this._expanderCol = <ExpanderColumn>col;
                }
                break;
            case COLUMN_TYPE.ROW_ACTIONS:
                if (!this._actionsCol) {
                    col = new ActionsColumn(this, cellInfo);
                    this._actionsCol = <ActionsColumn>col;
                }
                break;
            case COLUMN_TYPE.ROW_SELECTOR:
                if (!this._rowSelectorCol) {
                    col = new RowSelectorColumn(this, cellInfo);
                    this._rowSelectorCol = <RowSelectorColumn>col;
                }
                break;
            case COLUMN_TYPE.DATA:
                col = new DataColumn(this, cellInfo);
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_GRID_COLTYPE_INVALID, cellInfo.colInfo.type));
        }
        return col;
    }
    protected _appendItems(newItems: ICollectionItem[]) {
        const self = this, tbody = this._tBodyEl;
        let isPrepend = self.options.isPrependAllRows;
        const isPrependNew = self.options.isPrependNewRows;

        if (newItems.length === 1) {
            const item = newItems[0];
            if (!self._rowMap[item._key]) {
                isPrepend = isPrepend || (isPrependNew && item._aspect.isNew);
                self._createRowForItem(tbody, item, isPrepend);
            }
        } else {
            const docFr = doc.createDocumentFragment(), k = newItems.length;
            for (let i = 0; i < k; i += 1) {
                const item = newItems[i];
                if (!self._rowMap[item._key]) {
                    self._createRowForItem(docFr, item, (isPrependNew && item._aspect.isNew));
                }
            }

            self._addNodeToParent(tbody, docFr, isPrepend);
        }

        self.updateColumnsSize();
    }
    protected _refresh(isPageChanged: boolean) {
        const self = this, ds = this.dataSource;
        if (!ds || self.getIsStateDirty()) {
            return;
        }
        this._clearGrid();
        const docFr = doc.createDocumentFragment(), oldTbody = this._tBodyEl, newTbody = doc.createElement("tbody");
        ds.items.forEach((item, index) => {
            self._createRowForItem(docFr, item, false);
        });
        newTbody.appendChild(docFr);
        self.table.replaceChild(newTbody, oldTbody);
        if (isPageChanged) {
            self._onPageChanged();
        }
        if (self.isUseScrollInto) {
            self.scrollToCurrent();
        }

        self.updateColumnsSize();
        self._updateTableDisplay();
        self._updateCurrent();
    }
    protected _addNodeToParent(parent: Node, node: Node, prepend: boolean) {
        if (!prepend) {
            dom.append(parent, [node]);
        } else {
            dom.prepend(parent, node);
        }
    }
    protected _createRowForItem(parent: Node, item: ICollectionItem, prepend: boolean) {
        const self = this, tr = doc.createElement("tr"), gridRow = new Row(self, { tr: tr, item: item });
        self._rowMap[item._key] = gridRow;
        if (!prepend) {
            self._rows.push(gridRow);
        } else {
            self._rows.unshift(gridRow);
        }
        self._addNodeToParent(parent, gridRow.tr, prepend);
        return gridRow;
    }
    protected _createDetails() {
        const detailsId = this._options.details.templateID, tr = doc.createElement("tr");
        return new DetailsRow({ grid: this, tr: tr, details_id: detailsId });
    }
    protected _createFillSpace() {
        const tr: HTMLTableRowElement = doc.createElement("tr");
        return new FillSpaceRow({ grid: this, tr: tr });
    }
    protected _scrollTo(yPos: number, animate: boolean) {
        if (animate) {
            $(this._wrapper).animate({
                scrollTop: yPos
            }, {
                    duration: 500,
                    specialEasing: {
                        width: "linear",
                        height: "easeOutBounce"
                    }
                });
        } else {
            this._wrapper.scrollTop = yPos;
        }
    }
    protected setDataSource(v: ICollection<ICollectionItem>) {
        this._unbindDS();
        this._options.dataSource = v;
        const fn_init = () => {
            const ds = this._options.dataSource;
            if (!!ds && !ds.getIsStateDirty()) {
                this._updateContentOptions();
                this._bindDS();
                this._refresh(false);
            } else {
                this._clearGrid();
            }
        };

        if (!!this._options.syncSetDatasource) {
            fn_init();
        } else {
            this._dsDebounce.enque(fn_init);
        }
    }
    _getInternal(): IInternalDataGridMethods {
        return this._internal;
    }
    updateColumnsSize(): void {
        if (this.getIsStateDirty()) {
            return;
        }
        let width = 0;
        const header = this._header;
        this._columns.forEach((col) => {
            width += col.width;
        });

        header.style.width = (width + "px");

        this._columns.forEach((col) => {
            col.updateWidth();
        });
    }
    sortByColumn(column: DataColumn): IPromise<any> {
        const ds = this.dataSource;
        if (!ds) {
            return utils.defer.reject<void>("DataGrid's datasource is not set");
        }
        const sorts = column.sortMemberName.split(";");
        const promise = ds.sort(sorts, column.sortOrder);
        return promise;
    }
    selectRows(isSelect: boolean): void {
        this._rows.forEach((row) => {
            if (row.isDeleted) {
                return;
            }
            row.isSelected = isSelect;
        });
    }
    findRowByItem(item: ICollectionItem): Row {
        const row = this._rowMap[item._key];
        return (!row) ? null : row;
    }
    collapseDetails(): void {
        if (!this._details) {
            return;
        }
        const old = this._expandedRow;
        if (!!old) {
            this._expandDetails(old, false);
        }
    }
    getSelectedRows(): Row[] {
        const res: Row[] = [];
        this._rows.forEach((row) => {
            if (row.isDeleted) {
                return;
            }
            if (row.isSelected) {
                res.push(row);
            }
        });
        return res;
    }
    showEditDialog(): boolean {
        if (!this.isHasEditor || !this._editingRow) {
            return false;
        }
        let dialogOptions: IDialogConstructorOptions;
        const item = this._editingRow.item;
        if (!item._aspect.isEditing) {
            item._aspect.beginEdit();
        }
        if (!this._dialog) {
            dialogOptions = coreUtils.extend({
                dataContext: item,
                templateID: null
            }, this._options.editor);
            this._dialog = new DataEditDialog(dialogOptions);
        } else {
            this._dialog.dataContext = item;
        }
        this._dialog.canRefresh = !!this.dataSource.permissions.canRefreshRow && !item._aspect.isNew;
        this._dialog.show();
        return true;
    }
    scrollToRow(args: { row: Row; animate?: boolean; pos?: ROW_POSITION; }): void {
        if (!args || !args.row) {
            return;
        }
        const row = args.row,  viewport = this._wrapper;
        if (!!this._fillSpace) {
            // reset fillspace to calculate original table height
            this._fillSpace.height = 0;
        }
        const animate = !!args.animate,
            alignBottom = (args.pos === ROW_POSITION.Bottom),
            viewPortHeight = viewport.clientHeight, viewportRect = viewport.getBoundingClientRect(),
            rowHeight = row.height, currentScrollTop = viewport.scrollTop;
        let offsetDiff = currentScrollTop + row.rect.top - viewportRect.top;

        if (alignBottom) {
            offsetDiff = Math.floor(offsetDiff + 1);
        } else {
            offsetDiff = Math.floor(offsetDiff - 1);
        }

        // yOffset is needed to align row at  the bottom
        let contentHeight = rowHeight;
        if (row.isExpanded) {
            contentHeight = contentHeight + this._details.height;
        }

        contentHeight = Math.min(viewPortHeight, contentHeight);
        // the height of the viewport minus the row height which includes the details if expanded
        const yOffset = viewPortHeight - contentHeight;
        let yPos = offsetDiff, deltaY = 0;

        if (alignBottom) {
            yPos -= yOffset;
        }

        const maxScrollTop = this.table.offsetHeight - viewPortHeight + 1;

        if (yPos < 0) {
            yPos = 0;
        } else if (yPos > maxScrollTop) {
            deltaY = yPos - maxScrollTop;
        }

        if (!!this._fillSpace) {
            // add additional height to the table for scrolling further
            this._fillSpace.height = deltaY;
        }

        // console.log(strUtils.format("deltaY: {0} yPos: {1} ScrollTop: {2} offsetDiff: {3} (offsetDiff - yOffset): {4}",
            // deltaY, yPos, currentScrollTop, offsetDiff, (offsetDiff - yOffset)));

        // no need for scrolling if  the row is visible inside the viewport
        // but if the row details is expanded (args.pos === ROW_POSITION.Details) then always scroll the row to the top
        // in order to show the details in full
        if ((args.pos !== ROW_POSITION.Details) && (currentScrollTop < offsetDiff && currentScrollTop > (offsetDiff - yOffset))) {
            return;
        }

        this._scrollTo(yPos, animate);
    }
    scrollToCurrent(pos?: ROW_POSITION, animate?: boolean): void {
        this._scrollDebounce.enque(() => {
            this.scrollToRow({ row: this.currentRow, animate: animate, pos: pos });
        });
    }
    focus(): void {
        this.scrollToCurrent(ROW_POSITION.Up);
        boot.selectedControl = this;
    }
    addNew(): void {
        const ds = this.dataSource;
        try {
            ds.addNew();
            this.showEditDialog();
        } catch (ex) {
            ERROR.reThrow(ex, this.handleError(ex, this));
        }
    }
    addOnRowExpanded(fn: TEventHandler<DataGrid, { collapsedRow: Row; expandedRow: Row; isExpanded: boolean; }>, nmspace?: string, context?: any) {
        this.objEvents.on(GRID_EVENTS.row_expanded, fn, nmspace, context);
    }
    offOnRowExpanded(nmspace?: string) {
        this.objEvents.off(GRID_EVENTS.row_expanded, nmspace);
    }
    addOnRowSelected(fn: TEventHandler<DataGrid, { row: Row; }>, nmspace?: string, context?: any) {
        this.objEvents.on(GRID_EVENTS.row_selected, fn, nmspace, context);
    }
    offOnRowSelected(nmspace?: string) {
        this.objEvents.off(GRID_EVENTS.row_selected, nmspace);
    }
    addOnPageChanged(fn: TEventHandler<DataGrid, any>, nmspace?: string, context?: any) {
        this.objEvents.on(GRID_EVENTS.page_changed, fn, nmspace, context);
    }
    offOnPageChanged(nmspace?: string) {
        this.objEvents.off(GRID_EVENTS.page_changed, nmspace);
    }
    addOnRowStateChanged(fn: TEventHandler<DataGrid, { row: Row; val: any; css: string; }>, nmspace?: string, context?: any) {
        this.objEvents.on(GRID_EVENTS.row_state_changed, fn, nmspace, context);
    }
    offOnRowStateChanged(nmspace?: string) {
        this.objEvents.off(GRID_EVENTS.row_state_changed, nmspace);
    }
    addOnCellDblClicked(fn: TEventHandler<DataGrid, { cell: BaseCell<BaseColumn>; }>, nmspace?: string, context?: any) {
        this.objEvents.on(GRID_EVENTS.cell_dblclicked, fn, nmspace, context);
    }
    offOnCellDblClicked(nmspace?: string) {
        this.objEvents.off(GRID_EVENTS.cell_dblclicked, nmspace);
    }
    addOnRowAction(fn: TEventHandler<DataGrid, { row: Row; action: ROW_ACTION; }>, nmspace?: string, context?: any) {
        this.objEvents.on(GRID_EVENTS.row_action, fn, nmspace, context);
    }
    offOnRowAction(nmspace?: string) {
        this.objEvents.off(GRID_EVENTS.row_action, nmspace);
    }
    get selectable(): ISelectable {
        return this._selectable;
    }
    get table(): HTMLTableElement {
        return this._table;
    }
    get options() { return this._options; }
    get _tBodyEl() { return this.table.tBodies[0]; }
    get _tHeadEl() { return this.table.tHead; }
    get _tFootEl() { return this.table.tFoot; }
    get _tHeadRow(): HTMLTableRowElement {
        if (!this._tHeadEl) {
            return null;
        }
        const trs = this._tHeadEl.rows;
        if (trs.length === 0) {
            return null;
        }
        return <HTMLTableRowElement>trs[0];
    }
    get _tHeadCells() {
        const row = this._tHeadRow;
        return (!row) ? [] : utils.arr.fromList<HTMLTableHeaderCellElement>(row.cells);
    }
    get uniqueID() { return this._objId; }
    get name() { return this._name; }
    get dataSource(): ICollection<ICollectionItem> {
        return this._options.dataSource;
    }
    set dataSource(v: ICollection<ICollectionItem>) {
        if (v !== this.dataSource) {
            this.setDataSource(v);
            this.objEvents.raiseProp("dataSource");
        }
    }
    get rows() { return this._rows; }
    get columns() { return this._columns; }
    get currentItem() {
        const ds = this.dataSource;
        return (!ds) ? null : ds.currentItem;
    }
    set currentItem(item) {
        const ds = this.dataSource;
        if (!ds) {
            return;
        }
        ds.currentItem = item;
    }
    get currentRow() {
        const cur = this.currentItem;
        return (!cur) ? null : this._rowMap[cur._key];
    }
    set currentRow(row) {
        if (!!row && !row.getIsStateDirty()) {
            if (row.item !== this.currentItem) {
                this.currentItem = row.item;
            }
        } else {
            this.currentItem = null;
        }
    }
    get editingRow() {
        return this._editingRow;
    }
    get isHasEditor() {
        return (this._options.editor && this._options.editor.templateID);
    }
    get isCanEdit() {
        if (this._options.isCanEdit !== null) {
            return this._options.isCanEdit;
        }
        const ds = this.dataSource;
        return !!ds && ds.permissions.canEditRow;
    }
    get isCanDelete() {
        if (this._options.isCanDelete !== null) {
            return this._options.isCanDelete;
        }
        const ds = this.dataSource;
        return !!ds && ds.permissions.canDeleteRow;
    }
    get isCanAddNew() {
        const ds = this.dataSource;
        return !!ds && ds.permissions.canAddRow;
    }
    get isUseScrollInto() { return this._options.isUseScrollInto; }
    set isUseScrollInto(v) { this._options.isUseScrollInto = v; }
    get animation(): IDataGridAnimation {
        if (!this.options.animation) {
            this.options.animation = new DefaultAnimation();
        }
        return this.options.animation;
    }
}

export interface IDataGridViewOptions extends IDataGridOptions, IViewOptions {
}

export class DataGridElView extends BaseElView implements ISelectableProvider {
    private _grid: DataGrid;
    private _stateProvider: IRowStateProvider;
    private _stateDebounce: Debounce;

    constructor(options: IDataGridViewOptions) {
        super(options);
        this._stateProvider = null;
        this._stateDebounce = new Debounce();
        const opts = <IDataGridConstructorOptions>coreUtils.extend(
            {
                el: <HTMLTableElement>this.el,
                dataSource: null,
                animation: null
            }, options);

        this._grid = new DataGrid(opts);
        this._bindGridEvents();
    }
    toString() {
        return "DataGridElView";
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._stateDebounce.dispose();
        if (!this._grid.getIsStateDirty()) {
            this._grid.dispose();
        }
        this._stateProvider = null;
        super.dispose();
    }
    private _bindGridEvents() {
        const self = this;
        this._grid.addOnRowStateChanged((sender, args) => {
            if (!!self._stateProvider) {
                args.css = self._stateProvider.getCSS(args.row.item, args.val);
            }
        }, this.uniqueID);
        self._grid.objEvents.onProp("*", (sender, args) => {
            switch (args.property) {
                case "dataSource":
                    self.objEvents.raiseProp(args.property);
                    break;
            }
        }, self.uniqueID);
    }
    get dataSource(): ICollection<ICollectionItem> {
        return this.grid.dataSource;
    }
    set dataSource(v) {
        this.grid.dataSource = v;
    }
    get grid(): DataGrid {
        return this._grid;
    }
    get stateProvider(): IRowStateProvider {
        return this._stateProvider;
    }
    set stateProvider(v: IRowStateProvider) {
        if (v !== this._stateProvider) {
            this._stateProvider = v;
            this._stateDebounce.enque(() => {
                if (!this._grid || this._grid.getIsStateDirty()) {
                    return;
                }
                this._grid.rows.forEach((row) => {
                    row.updateUIState();
                });
            });
            this.objEvents.raiseProp("stateProvider");
        }
    }
    get animation(): IDataGridAnimation {
        return this._grid.options.animation;
    }
    set animation(v) {
        if (this.animation !== v) {
            this._grid.options.animation = v;
            this.objEvents.raiseProp("animation");
        }
    }
    get selectable(): ISelectable {
        return this._grid.selectable;
    }
}

boot.registerElView("table", DataGridElView);
boot.registerElView("datagrid", DataGridElView);
