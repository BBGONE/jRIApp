/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR, KEYS } from "jriapp_core/const";
import { IApplication, ISelectableProvider, TEventHandler, IIndexer, ISelectable, IViewOptions } from "jriapp_core/shared";
import { ERRS, STRS } from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { Utils as utils, Debounce, DblClick, ERROR } from "jriapp_utils/utils";
import { bootstrap } from "jriapp_core/bootstrap";
import { parser } from "jriapp_core/parser";
import { COLL_CHANGE_TYPE, ICollectionItem, ICollChangedArgs, ICollItemArgs, ICollection, ICollItemAddedArgs,
    COLL_CHANGE_REASON, ITEM_STATUS } from "jriapp_collection/collection";
import { BaseElView } from "jriapp_elview/elview";
import { parseContentAttr } from "jriapp_content/int";
import { IDialogConstructorOptions, DataEditDialog } from "dialog";

import { css, ROW_POSITION, COLUMN_TYPE, ROW_ACTION, PROP_NAME } from "./const";
import { IDataGridAnimation, DefaultAnimation } from "./animation";

import { BaseCell } from "./cells/base";
import { ExpanderCell } from "./cells/expander";
import { DataCell } from "./cells/data";
import { ActionsCell } from "./cells/actions";
import { DetailsCell } from "./cells/details";
import { RowSelectorCell } from "./cells/rowselector";
import { FillSpaceCell } from "./cells/fillspace";

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

const checks = utils.check, strUtils = utils.str, coreUtils = utils.core;
const $ = utils.dom.$, document = utils.dom.document;

let _columnWidthInterval: any, _gridsCount: number = 0;
let _created_grids: IIndexer<DataGrid> = { };

export function getDataGrids(): DataGrid[] {
    let keys = Object.keys(_created_grids);
    let res: DataGrid[] = [];
    for (let i = 0; i < keys.length; i += 1) {
        let grid = _created_grids[keys[i]];
        res.push(grid);
    }

    return res;
}

export function findDataGrid(gridName: string): DataGrid {
    let keys = Object.keys(_created_grids);
    for (let i = 0; i < keys.length; i += 1) {
        let grid = _created_grids[keys[i]];
        if (grid.$table.attr(DATA_ATTR.DATA_NAME) === gridName)
            return grid;
    }

    return null;
}

function _gridCreated(grid: DataGrid) {
    _created_grids[grid.uniqueID] = grid;
    _gridsCount += 1;
    if (_gridsCount === 1) {
        $(window).on('resize.datagrid', _checkGridWidth);
        //_columnWidthInterval = setInterval(_checkGridWidth, 250);
    }
}

function _gridDestroyed(grid: DataGrid) {
    delete _created_grids[grid.uniqueID];
    _gridsCount -= 1;
    if (_gridsCount === 0) {
        $(window).off('resize.datagrid');
        //clearInterval(_columnWidthInterval);
    }
}

function _checkGridWidth() {
    coreUtils.forEachProp(_created_grids, (id) => {
        let grid = _created_grids[id];
        if (grid.getIsDestroyCalled())
            return;
        grid._getInternal().columnWidthCheck();
    });
}

const GRID_EVENTS = {
    row_expanded: "row_expanded",
    row_selected: "row_selected",
    page_changed: "page_changed",
    row_state_changed: "row_state_changed",
    cell_dblclicked: "cell_dblclicked",
    row_action: "row_action"
};

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
    //if newly created items are prepended to the table (instead of appended)
    isPrependNewRows?: boolean;
    //if all additionally added rows are prepended to the table (instead of appended)
    isPrependAllRows?: boolean;
}


export interface IDataGridConstructorOptions extends IDataGridOptions {
    app: IApplication;
    el: HTMLTableElement;
    dataSource: ICollection<ICollectionItem>;
    animation: IDataGridAnimation;
}

export interface IInternalDataGridMethods {
    isRowExpanded(row: Row): boolean;
    get$Header(): JQuery;
    get$Container(): JQuery;
    get$Wrapper(): JQuery;
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
    private _$table: JQuery;
    private _table: HTMLTableElement;
    private _name: string;
    private _objId: string;
    private _rowMap: IIndexer<Row>;
    private _rows: Row[];
    private _columns: BaseColumn[];
    private _currentRow: Row;
    private _expandedRow: Row;
    private _details: DetailsRow;
    private _fillSpace: FillSpaceRow;
    private _expanderCol: ExpanderColumn;
    private _actionsCol: ActionsColumn;
    private _rowSelectorCol: RowSelectorColumn;
    private _currentColumn: BaseColumn;
    private _editingRow: Row;
    private _dialog: DataEditDialog;
    private _$header: JQuery;
    private _$wrapper: JQuery;
    private _$contaner: JQuery;
    private _columnWidthCheck: () => void;
    private _internal: IInternalDataGridMethods;
    private _selectable: ISelectable;
    private _colSizeDebounce: Debounce;
    private _scrollDebounce: Debounce;

    constructor(options: IDataGridConstructorOptions) {
        super();
        let self = this;
        options = coreUtils.merge(options,
            {
                app: null,
                el: null,
                dataSource: null,
                animation: null,
                isUseScrollInto: true,
                isUseScrollIntoDetails: true,
                containerCss: null, //div that wraps all table and header
                wrapCss: null, //div that wraps only table without header
                headerCss: null, //div inside which are column cells
                rowStateField: null,
                isCanEdit: null,
                isCanDelete: null,
                isHandleAddNew: false,
                isPrependNewRows: false,
                isPrependAllRows: false
            });

        if (!!options.dataSource && !checks.isCollection(options.dataSource))
            throw new Error(ERRS.ERR_GRID_DATASRC_INVALID);
        this._options = options;
        this._columnWidthCheck = () => { };
        let $t = $(this._options.el);
        this._table = this._options.el;
        this._$table = $t;
        $t.addClass(css.dataTable);
        this._name = $t.attr(DATA_ATTR.DATA_NAME);
        this._objId = "grd" + coreUtils.getNewID();
        this._rowMap = {};
        this._rows = [];
        this._columns = [];
        this._currentRow = null;
        this._expandedRow = null;
        this._details = null;
        this._fillSpace = null;
        this._expanderCol = null;
        this._actionsCol = null;
        this._rowSelectorCol = null;
        this._currentColumn = null;
        this._editingRow = null;
        this._dialog = null;
        this._$header = null;
        this._$wrapper = null;
        this._$contaner = null;
        this._wrapTable();
        this._colSizeDebounce = new Debounce();
        this._scrollDebounce = new Debounce();
        this._selectable = {
            getContainerEl: () => {
                return self._$contaner[0];
            },
            getUniqueID: () => {
                return self.uniqueID;
            },
            onKeyDown: (key: number, event: Event) => {
                self._onKeyDown(key, event);
            },
            onKeyUp: (key: number, event: Event) => {
                self._onKeyUp(key, event);
            }
        };
        this._internal = {
            isRowExpanded: (row: Row) => {
                return self._isRowExpanded(row);
            },
            get$Header: () => {
                return self._$header;
            },
            get$Container: () => {
                return self._$contaner;
            },
            get$Wrapper: () => {
                return self._$wrapper;
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
                self._columnWidthCheck();
            }
        };
        this._createColumns();
        this._bindDS();
        bootstrap._getInternal().trackSelectable(this);
        _gridCreated(this);

        setTimeout(() => {
            self._columnWidthCheck();
        }, 0);
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        let events = Object.keys(GRID_EVENTS).map((key, i, arr) => { return <string>(<any>GRID_EVENTS)[key]; });
        return events.concat(base_events);
    }
    addOnRowExpanded(fn: TEventHandler<DataGrid, { collapsedRow: Row; expandedRow: Row; isExpanded: boolean; }>, nmspace?: string, context?: any) {
        this._addHandler(GRID_EVENTS.row_expanded, fn, nmspace, context);
    }
    removeOnRowExpanded(nmspace?: string) {
        this._removeHandler(GRID_EVENTS.row_expanded, nmspace);
    }
    addOnRowSelected(fn: TEventHandler<DataGrid, { row: Row; }>, nmspace?: string, context?: any) {
        this._addHandler(GRID_EVENTS.row_selected, fn, nmspace, context);
    }
    removeOnRowSelected(nmspace?: string) {
        this._removeHandler(GRID_EVENTS.row_selected, nmspace);
    }
    addOnPageChanged(fn: TEventHandler<DataGrid, any>, nmspace?: string, context?: any) {
        this._addHandler(GRID_EVENTS.page_changed, fn, nmspace, context);
    }
    removeOnPageChanged(nmspace?: string) {
        this._removeHandler(GRID_EVENTS.page_changed, nmspace);
    }
    addOnRowStateChanged(fn: TEventHandler<DataGrid, { row: Row; val: any; css: string; }>, nmspace?: string, context?: any) {
        this._addHandler(GRID_EVENTS.row_state_changed, fn, nmspace, context);
    }
    removeOnRowStateChanged(nmspace?: string) {
        this._removeHandler(GRID_EVENTS.row_state_changed, nmspace);
    }
    addOnCellDblClicked(fn: TEventHandler<DataGrid, { cell: BaseCell<BaseColumn>; }>, nmspace?: string, context?: any) {
        this._addHandler(GRID_EVENTS.cell_dblclicked, fn, nmspace, context);
    }
    removeOnCellDblClicked(nmspace?: string) {
        this._removeHandler(GRID_EVENTS.cell_dblclicked, nmspace);
    }
    addOnRowAction(fn: TEventHandler<DataGrid, { row: Row; action: ROW_ACTION; }>, nmspace?: string, context?: any) {
        this._addHandler(GRID_EVENTS.row_action, fn, nmspace, context);
    }
    removeOnRowAction(nmspace?: string) {
        this._removeHandler(GRID_EVENTS.row_action, nmspace);
    }
    protected _onKeyDown(key: number, event: Event): void {
        let ds = this.dataSource, self = this;
        if (!ds)
            return;
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
                if (ds.pageIndex > 0)
                    ds.pageIndex = ds.pageIndex - 1;
                break;
            case KEYS.pageUp:
                event.preventDefault();
                ds.pageIndex = ds.pageIndex + 1;
                break;
            case KEYS.enter:
                if (!!this._currentRow && !!this._actionsCol) {
                    event.preventDefault();
                }
                break;
            case KEYS.esc:
                if (!!this._currentRow && !!this._actionsCol) {
                    if (this._currentRow.isEditing) {
                        event.preventDefault();
                    }
                }
                break;
            case KEYS.space:
                if (!!this._rowSelectorCol && !!this._currentRow && (!this._currentRow.isExpanded && !this._currentRow.isEditing))
                    event.preventDefault();
                break;
        }
    }
    protected _onKeyUp(key: number, event: Event): void {
        let ds = this.dataSource;
        if (!ds)
            return;
        switch (key) {
            case KEYS.enter:
                if (!!this._currentRow && !!this._actionsCol) {
                    event.preventDefault();
                    if (this._currentRow.isEditing) {
                        this.raiseEvent(GRID_EVENTS.row_action, { row: this._currentRow, action: ROW_ACTION.OK });
                    }
                    else {
                        this.raiseEvent(GRID_EVENTS.row_action, { row: this._currentRow, action: ROW_ACTION.EDIT });
                    }
                }
                break;
            case KEYS.esc:
                if (!!this._currentRow && !!this._actionsCol) {
                    if (this._currentRow.isEditing) {
                        event.preventDefault();
                        this.raiseEvent(GRID_EVENTS.row_action, { row: this._currentRow, action: ROW_ACTION.CANCEL });
                    }
                }
                break;
            case KEYS.space:
                if (!!this._rowSelectorCol && !!this._currentRow && (!this._currentRow.isExpanded && !this._currentRow.isEditing)) {
                    event.preventDefault();
                    this._currentRow.isSelected = !this._currentRow.isSelected;
                }
                break;
        }
    }
    protected _isRowExpanded(row: Row): boolean {
        return this._expandedRow === row;
    }
    protected _setCurrentColumn(column: BaseColumn): void {
        if (!!this._currentColumn)
            this._currentColumn.isSelected = false;
        this._currentColumn = column;
        if (!!this._currentColumn)
            this._currentColumn.isSelected = true;
    }
    protected _onRowStateChanged(row: Row, val: any): string {
        let args = { row: row, val: val, css: <string>null };
        this.raiseEvent(GRID_EVENTS.row_state_changed, args);
        return args.css;
    }
    protected _onCellDblClicked(cell: BaseCell<BaseColumn>): void {
        let args = { cell: cell };
        this.raiseEvent(GRID_EVENTS.cell_dblclicked, args);
    }
    protected _onRowSelectionChanged(row: Row): void {
        this.raiseEvent(GRID_EVENTS.row_selected, { row: row });
    }
    protected _resetColumnsSort(): void {
        this.columns.forEach(function (col) {
            if (col instanceof DataColumn) {
                (<DataColumn>col).sortOrder = null;
            }
        });
    }
    protected _getLastRow(): Row {
        if (this._rows.length === 0)
            return null;
        let i = this._rows.length - 1, row = this._rows[i];
        while (row.isDeleted && i > 0) {
            i -= 1;
            row = this._rows[i];
        }
        if (row.isDeleted)
            return null;
        else
            return row;
    }
    protected _removeRow(row: Row): void {
        if (this._isRowExpanded(row)) {
            this.collapseDetails();
        }
        if (this._rows.length === 0)
            return;
        let rowkey = row.itemKey, i = utils.arr.remove(this._rows, row), oldRow: Row;
        try {
            if (i > -1) {
                oldRow = row;
                if (!oldRow.getIsDestroyCalled())
                    oldRow.destroy();
            }
        }
        finally {
            if (!!this._rowMap[rowkey])
                delete this._rowMap[rowkey];
        }
    }
    protected _expandDetails(parentRow: Row, expanded: boolean): void {
        if (!this._options.details)
            return;
        if (!this._details) {
            this._details = this._createDetails();
            this._fillSpace = this._createFillSpace();
        }
        let old = this._expandedRow;
        if (old === parentRow) {
            if (!!old && expanded)
                return;
        }
        this._expandedRow = null;
        this._details.parentRow = null;

        if (expanded) {
            this._expandedRow = parentRow;
            this._details.parentRow = parentRow;
            this._expandedRow.expanderCell.toggleImage();
            this._fillSpace.attach();
        }
        else {
            this._expandedRow = null;
            this._details.parentRow = null;
            if (!!old) {
                old.expanderCell.toggleImage();
            }
            this._fillSpace.detach();
            this._fillSpace.height = 0;
        }
        if (old !== parentRow) {
            if (!!old)
                old.expanderCell.toggleImage();
        }
        this.raiseEvent(GRID_EVENTS.row_expanded, { collapsedRow: old, expandedRow: parentRow, isExpanded: expanded });
    }
    protected _parseColumnAttr(column_attr: string, content_attr: string) {
        const defaultOp: IColumnInfo = {
            "type": COLUMN_TYPE.DATA, //default column type
            title: null,
            sortable: false,
            sortMemberName: null,
            content: null
        };
        let options: IColumnInfo;

        let temp_opts = parser.parseOptions(column_attr);
        if (temp_opts.length > 0)
            options = coreUtils.extend(defaultOp, temp_opts[0]);
        else
            options = defaultOp;

        if (!!content_attr) {
            options.content = parseContentAttr(content_attr);
            if (!options.sortMemberName && !!options.content.fieldName)
                options.sortMemberName = options.content.fieldName;
        }

        return options;
    }
    protected _findUndeleted(row: Row, isUp: boolean) {
        if (!row)
            return null;
        if (!row.isDeleted)
            return row;
        //find nearest nondeleted row (search up and down)
        let delIndex = this.rows.indexOf(row), i = delIndex, len = this.rows.length;
        if (!isUp) {
            i -= 1;
            if (i >= 0)
                row = this.rows[i];
            while (i >= 0 && row.isDeleted) {
                i -= 1;
                if (i >= 0)
                    row = this.rows[i];
            }
            if (row.isDeleted)
                row = null;
        }
        else {
            i += 1;
            if (i < len)
                row = this.rows[i];
            while (i < len && row.isDeleted) {
                i += 1;
                if (i < len)
                    row = this.rows[i];
            }
            if (row.isDeleted)
                row = null;
        }
        return row;
    }
    protected _updateCurrent(row: Row, withScroll: boolean) {
        this.currentRow = row;
        if (withScroll && !!row && !row.isDeleted)
            this.scrollToCurrent();
    }
    public handleError(error: any, source: any): boolean {
        let isHandled = super.handleError(error, source);
        if (!isHandled) {
            return bootstrap.handleError(error, source);
        }
        return isHandled;
    }
    protected _onDSCurrentChanged(sender?: any, args?: any) {
        let ds = this.dataSource, cur: ICollectionItem;
        if (!!ds)
            cur = ds.currentItem;
        if (!cur)
            this._updateCurrent(null, false);
        else {
            this._updateCurrent(this._rowMap[cur._key], false);
        }
    }
    protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>) {
        let self = this, row: Row, items = args.items;
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
                    items.forEach(function (item) {
                        let row = self._rowMap[item._key];
                        if (!!row) {
                            self._removeRow(row);
                        }
                    });
                    self._updateTableDisplay();
                }
                break;
            case COLL_CHANGE_TYPE.Remap:
                {
                    row = self._rowMap[args.old_key];
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
        if (!this.dataSource || this.dataSource.count === 0)
            this.$table.css("visibility", "hidden");
        else
            this.$table.css("visibility", "visible");
    }
    protected _onPageChanged() {
        if (!!this._rowSelectorCol) {
            this._rowSelectorCol.checked = false;
        }
        this.raiseEvent(GRID_EVENTS.page_changed, {});
    }
    protected _onItemEdit(item: ICollectionItem, isBegin: boolean, isCanceled: boolean) {
        let row = this._rowMap[item._key];
        if (!row)
            return;
        if (isBegin) {
            row._onBeginEdit();
            this._editingRow = row;
        }
        else {
            row._onEndEdit(isCanceled);
            this._editingRow = null;
        }
        this.raisePropertyChanged(PROP_NAME.editingRow);
    }
    protected _onItemAdded(sender: any, args: ICollItemAddedArgs<ICollectionItem>) {
        let item = args.item, row = this._rowMap[item._key];
        if (!row)
            return;
        this._updateCurrent(row, true);
        //row.isExpanded = true;
        if (this._options.isHandleAddNew && !args.isAddNewHandled) {
            args.isAddNewHandled = this.showEditDialog();
        }
    }
    protected _onItemStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS) {
        let newStatus: ITEM_STATUS = item._aspect.status, ds = this.dataSource;
        let row = this._rowMap[item._key];
        if (!row)
            return;
        if (newStatus === ITEM_STATUS.Deleted) {
            row.isDeleted = true;
            let row2 = this._findUndeleted(row, true);
            if (!row2) {
                row2 = this._findUndeleted(row, false);
            }
            if (!!row2) {
                ds.currentItem = row2.item;
            }
        }
        else if (oldStatus === ITEM_STATUS.Deleted) {
            row.isDeleted = false;
        }
    }
    protected _onDSErrorsChanged(sender: any, args: ICollItemArgs<ICollectionItem>) {
        let row = this._rowMap[args.item._key];
        if (!row)
            return;
        row.updateErrorState();
    }
    protected _bindDS() {
        let self = this, ds = this.dataSource;
        if (!ds) {
            this._updateTableDisplay();
            return;
        }
        ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
        ds.addOnCurrentChanged(self._onDSCurrentChanged, self._objId, self);
        ds.addOnBeginEdit(function (sender, args) {
            self._onItemEdit(args.item, true, false);
        }, self._objId);
        ds.addOnEndEdit(function (sender, args) {
            self._onItemEdit(args.item, false, args.isCanceled);
        }, self._objId);
        ds.addOnErrorsChanged(self._onDSErrorsChanged, self._objId, self);
        ds.addOnStatusChanged(function (sender, args) {
            self._onItemStatusChanged(args.item, args.oldStatus);
        }, self._objId);
        ds.addOnItemAdded(self._onItemAdded, self._objId, self);
        ds.addOnItemAdding((s, a) => {
            self.collapseDetails();
        }, self._objId);
        this._refresh(false);
        this._onDSCurrentChanged();
    }
    protected _unbindDS() {
        let self = this, ds = this.dataSource;
        this._updateTableDisplay();
        if (!ds) return;
        ds.removeNSHandlers(self._objId);
    }
    protected _clearGrid() {
        if (this._rows.length === 0)
            return;
        this.collapseDetails();
        let self = this, tbody = self._tBodyEl, newTbody = document.createElement("tbody");
        this._table.replaceChild(newTbody, tbody);
        let rows = this._rows;
        this._rows = [];
        this._rowMap = {};
        rows.forEach(function (row) {
            row.isDetached = true;
            row.destroy();
        });
        this._currentRow = null;
    }
    protected _wrapTable() {
        let $table = this._$table, $headerDiv: JQuery, $wrapDiv: JQuery, $container: JQuery, self = this,
            doc = utils.dom.document;

        $table.wrap($("<div></div>").addClass(css.wrapDiv));
        $wrapDiv = $table.parent();
        $wrapDiv.wrap($("<div></div>").addClass(css.container));
        $container = $wrapDiv.parent();

        $headerDiv = $("<div></div>").addClass(css.headerDiv).insertBefore($wrapDiv);
        $(this._tHeadRow).addClass(css.columnInfo);

        this._$wrapper = $wrapDiv;
        this._$header = $headerDiv;
        this._$contaner = $container;

        if (this._options.containerCss) {
            $container.addClass(this._options.containerCss);
        }

        if (this._options.wrapCss) {
            $wrapDiv.addClass(this._options.wrapCss);
        }
        if (this._options.headerCss) {
            $headerDiv.addClass(this._options.headerCss);
        }
        let tw = $table.width();

        self._columnWidthCheck = function () {
            if (self.getIsDestroyCalled())
                return;
            let test = $table.width();
            if (tw !== test) {
                tw = test;
                self.updateColumnsSize();
            }
        };
    }
    protected _unWrapTable() {
        let $table = this._$table;
        if (!this._$header)
            return;
        this._columnWidthCheck = () => { };
        this._$header.remove();
        this._$header = null;
        //remove wrapDiv
        $table.unwrap();
        this._$wrapper = null;
        //remove container
        $table.unwrap();
        this._$contaner = null;
    }
    protected _createColumns() {
        let self = this, headCells = this._tHeadCells, cellInfos: ICellInfo[] = [];
        const cnt = headCells.length;

        for (let i = 0; i < cnt; i += 1) {
            let th = headCells[i];
            let attr = this._parseColumnAttr(th.getAttribute(DATA_ATTR.DATA_COLUMN), th.getAttribute(DATA_ATTR.DATA_CONTENT));
            cellInfos.push({ th: th, colInfo: attr });
        }

        cellInfos.forEach(function (cellInfo) {
            let col = self._createColumn(cellInfo);
            if (!!col)
                self._columns.push(col);
        });
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
        if (this.getIsDestroyCalled())
            return;
        let self = this, item: ICollectionItem, tbody = this._tBodyEl;
        for (let i = 0, k = newItems.length; i < k; i += 1) {
            item = newItems[i];
            if (!self._rowMap[item._key]) {
                let isPrepend = self.options.isPrependAllRows || (self.options.isPrependNewRows && item._aspect.isNew);
                self._createRowForItem(tbody, item, isPrepend);
            }
        }
        this._colSizeDebounce.enqueue(() => {
            self.updateColumnsSize();
        });
    }
    protected _refresh(isPageChanged: boolean) {
        let self = this, ds = this.dataSource;
        if (self.getIsDestroyCalled())
            return;
        self._clearGrid();
        if (!ds) return;
        let docFr = document.createDocumentFragment(), oldTbody = this._tBodyEl, newTbody = document.createElement("tbody");
        ds.items.forEach(function (item, index) {
            self._createRowForItem(docFr, item, false);
        });
        newTbody.appendChild(docFr);
        self._table.replaceChild(newTbody, oldTbody);
        if (isPageChanged) {
            self._onPageChanged();
        }
        this._scrollDebounce.enqueue(() => {
            if (this.getIsDestroyCalled())
                return;
            if (this.isUseScrollInto)
                this.scrollToCurrent();
        });
        this._colSizeDebounce.enqueue(() => {
            self.updateColumnsSize();
            self._updateTableDisplay();
        });
    }
    protected _createRowForItem(parent: Node, item: ICollectionItem, prepend?: boolean) {
        let self = this, tr = document.createElement("tr");
        let gridRow = new Row(self, { tr: tr, item: item });
        self._rowMap[item._key] = gridRow;
        self._rows.push(gridRow);
        if (!prepend) {
            parent.appendChild(gridRow.tr);
        }
        else {
            if (!parent.firstChild)
                parent.appendChild(gridRow.tr);
            else
                parent.insertBefore(gridRow.tr, parent.firstChild);
        }

        return gridRow;
    }
    protected _createDetails() {
        let details_id = this._options.details.templateID;
        let tr: HTMLTableRowElement = <HTMLTableRowElement>document.createElement("tr");
        return new DetailsRow({ grid: this, tr: tr, details_id: details_id });
    }
    protected _createFillSpace() {
        let tr: HTMLTableRowElement = <HTMLTableRowElement>document.createElement("tr");
        return new FillSpaceRow({ grid: this, tr: tr });
    }
    _getInternal(): IInternalDataGridMethods {
        return this._internal;
    }
    updateColumnsSize() {
        if (this.getIsDestroyCalled())
            return;
        let width = 0, headerDiv = this._$header;
        this._columns.forEach(function (col) {
            width += col.th.offsetWidth;
        });
        headerDiv.width(width);
        this._columns.forEach(function (col) {
            col.$col.css("width", col.th.offsetWidth);
        });
    }
    getISelectable(): ISelectable {
        return this._selectable;
    }
    sortByColumn(column: DataColumn) {
        let self = this, ds = this.dataSource;
        if (!ds)
            return;
        let sorts = column.sortMemberName.split(";");
        let promise = ds.sort(sorts, column.sortOrder);
    }
    selectRows(isSelect: boolean) {
        this._rows.forEach(function (row) {
            if (row.isDeleted)
                return;
            row.isSelected = isSelect;
        });
    }
    findRowByItem(item: ICollectionItem) {
        let row = this._rowMap[item._key];
        if (!row)
            return null;
        return row;
    }
    collapseDetails() {
        if (!this._details)
            return;
        let old = this._expandedRow;
        if (!!old) {
            this._expandDetails(old, false);
        }
    }
    getSelectedRows() {
        let res: Row[] = [];
        this._rows.forEach(function (row) {
            if (row.isDeleted)
                return;
            if (row.isSelected) {
                res.push(row);
            }
        });
        return res;
    }
    showEditDialog() {
        if (!this.isHasEditor || !this._editingRow)
            return false;
        let dialogOptions: IDialogConstructorOptions,
            item = this._editingRow.item;
        if (!item._aspect.isEditing)
            item._aspect.beginEdit();
        if (!this._dialog) {
            dialogOptions = coreUtils.extend({
                dataContext: item,
                templateID: null
            }, this._options.editor);
            this._dialog = new DataEditDialog(this.app, dialogOptions);
        }
        else
            this._dialog.dataContext = item;
        this._dialog.canRefresh = !!this.dataSource.permissions.canRefreshRow && !item._aspect.isNew;
        this._dialog.show();
        return true;
    }
    scrollToRow(args: { row: Row; animate?: boolean; pos?: ROW_POSITION; }) {
        if (!args || !args.row)
            return;
        if (!!this._fillSpace) {
            //reset fillspace to calculate original table height
            this._fillSpace.height = 0;
        }
        let $tr = args.row.$tr, animate = !!args.animate, alignBottom = (args.pos === ROW_POSITION.Bottom),
            viewPortHeight = this._$wrapper.innerHeight(), rowHeight = $tr.outerHeight(), currentScrollTop = this._$wrapper.scrollTop(),
            offsetDiff = currentScrollTop + $tr.offset().top - this._$wrapper.offset().top;

        if (alignBottom) {
            offsetDiff = Math.floor(offsetDiff + 1);
        }
        else {
            offsetDiff = Math.floor(offsetDiff - 1);
        }

        //yOffset is needed to align row at  the bottom
        let contentHeight = rowHeight;
        if (args.row.isExpanded) {
            contentHeight = contentHeight + this._details.$tr.outerHeight();
        }
        contentHeight = Math.min(viewPortHeight, contentHeight);
        //the height of the viewport minus the row height which includes the details if expanded
        let yOffset = viewPortHeight - contentHeight;

        let yPos = offsetDiff;
        if (alignBottom)
            yPos -= yOffset

        let maxScrollTop = this.$table.outerHeight() - viewPortHeight + 1, deltaY = 0;

        if (yPos < 0) {
            yPos = 0;
        }
        else if (yPos > maxScrollTop) {
            deltaY = yPos - maxScrollTop;
        }

     
        if (!!this._fillSpace) {
            //add additional height to the table for scrolling further
            this._fillSpace.height = deltaY;
        }

        //console.log(strUtils.format("deltaY: {0} yPos: {1} ScrollTop: {2} offsetDiff: {3} (offsetDiff - yOffset): {4}",
            //deltaY, yPos, currentScrollTop, offsetDiff, (offsetDiff - yOffset)));

        //no need for scrolling if  the row is visible inside the viewport
        //but if the row details is expanded (args.pos === ROW_POSITION.Details) then always scroll the row to the top
        //in order to show the details in full
        if ((args.pos !== ROW_POSITION.Details) && (currentScrollTop < offsetDiff && currentScrollTop > (offsetDiff - yOffset)))
            return;

        if (animate) {
            this._$wrapper.animate({
                scrollTop: yPos
            }, {
                    duration: 500,
                    specialEasing: {
                        width: "linear",
                        height: "easeOutBounce"
                    }
                });
        }
        else
            this._$wrapper.scrollTop(yPos);
    }
    scrollToCurrent(pos?: ROW_POSITION, animate?: boolean) {
        this.scrollToRow({ row: this.currentRow, animate: animate, pos: pos });
    }
    focus() {
        this.scrollToCurrent(ROW_POSITION.Up);
        bootstrap.currentSelectable = this;
    }
    addNew() {
        let ds = this.dataSource;
        try {
            ds.addNew();
            this.showEditDialog();
        } catch (ex) {
            ERROR.reThrow(ex, this.handleError(ex, this));
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._clearGrid();
        _gridDestroyed(this);
        bootstrap._getInternal().untrackSelectable(this);
        this._colSizeDebounce.destroy();
        this._scrollDebounce.destroy();
        if (!!this._details) {
            this._details.destroy();
            this._details = null;
        }
        if (!!this._fillSpace) {
            this._fillSpace.destroy();
            this._fillSpace = null;
        }
        if (this._options.animation) {
            this._options.animation.stop();
            this._options.animation = null;
        }
        if (!!this._dialog) {
            this._dialog.destroy();
            this._dialog = null;
        }
        this.dataSource = null;
        this._unWrapTable();
        this._$table.removeClass(css.dataTable);
        $(this._tHeadRow).removeClass(css.columnInfo);
        this._table = null;
        this._$table = null;
        this._options.app = null;
        this._options = <any>{};
        this._selectable = null;
        super.destroy();
    }
    get $table(): JQuery {
        return this._$table;
    }
    get app() { return this._options.app; }
    get options() { return this._options; }
    get _tBodyEl() { return this._table.tBodies[0]; }
    get _tHeadEl() { return this._table.tHead; }
    get _tFootEl() { return this._table.tFoot; }
    get _tHeadRow(): HTMLTableRowElement {
        if (!this._tHeadEl)
            return null;
        let trs = this._tHeadEl.rows;
        if (trs.length === 0)
            return null;
        return <HTMLTableRowElement>trs[0];
    }
    get _tHeadCells() {
        let row = this._tHeadRow;
        if (!row)
            return [];
        return utils.arr.fromList<HTMLTableHeaderCellElement>(row.cells);
    }
    get uniqueID() { return this._objId; }
    get name() { return this._name; }
    get dataSource() { return this._options.dataSource; }
    set dataSource(v) {
        if (v === this.dataSource)
            return;
        if (!!this.dataSource) {
            this._unbindDS();
        }
        this._clearGrid();
        this._options.dataSource = v;
        if (!!this.dataSource)
            this._bindDS();
        this.raisePropertyChanged(PROP_NAME.dataSource);
    }
    get rows() { return this._rows; }
    get columns() { return this._columns; }
    get currentRow() { return this._currentRow; }
    set currentRow(row) {
        let ds = this.dataSource, old = this._currentRow, isChanged = false;
        if (!ds)
            return;
        if (old !== row) {
            this._currentRow = row;
            if (!!old) {
                old.isCurrent = false;
            }
            if (!!row)
                row.isCurrent = true;
            isChanged = true;
        }
        if (!!row) {
            if (row.item !== ds.currentItem)
                ds.currentItem = row.item;
        }
        else
            ds.currentItem = null;
        if (isChanged)
            this.raisePropertyChanged(PROP_NAME.currentRow);
    }
    get editingRow() { return this._editingRow; }
    get isHasEditor() {
        return (this._options.editor && this._options.editor.templateID);
    }
    get isCanEdit() {
        if (this._options.isCanEdit !== null)
            return this._options.isCanEdit;
        let ds = this.dataSource;
        return !!ds && ds.permissions.canEditRow;
    }
    get isCanDelete() {
        if (this._options.isCanDelete !== null)
            return this._options.isCanDelete;
        let ds = this.dataSource;
        return !!ds && ds.permissions.canDeleteRow;
    }
    get isCanAddNew() {
        let ds = this.dataSource;
        return !!ds && ds.permissions.canAddRow;
    }
    get isUseScrollInto() { return this._options.isUseScrollInto; }
    set isUseScrollInto(v) { this._options.isUseScrollInto = v; }
    get animation() {
        if (!this.options.animation) {
            this.options.animation = new DefaultAnimation();
        }
        return this.options.animation;
    }
}

export interface IDataGridViewOptions extends IDataGridOptions, IViewOptions {
}

export class DataGridElView extends BaseElView {
    private _grid: DataGrid;
    private _options: IDataGridViewOptions;
    private _stateProvider: IRowStateProvider;

    constructor(options: IDataGridViewOptions) {
        super(options);
        this._stateProvider = null;
        this._grid = null;
        this._options = options;
        this._createGrid();
    }
    toString() {
        return "DataGridElView";
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._grid && !this._grid.getIsDestroyCalled()) {
            this._grid.destroy();
        }
        this._grid = null;
        this._stateProvider = null;
        super.destroy();
    }
    private _createGrid() {
        let options = <IDataGridConstructorOptions>coreUtils.extend(
            {
                app: this.app,
                el: <HTMLTableElement>this.el,
                dataSource: null,
                animation: null
            }, this._options);

        this._grid = new DataGrid(options);
        this._bindGridEvents();
    }
    private _bindGridEvents() {
        if (!this._grid)
            return;
        this._grid.addOnRowStateChanged(function (s, args) {
            let self: DataGridElView = this;
            if (!!self._stateProvider) {
                args.css = self._stateProvider.getCSS(args.row.item, args.val);
            }
        }, this.uniqueID, this);
        this._grid.addOnDestroyed(function (s, args) {
            let self: DataGridElView = this;
            self._grid = null;
            self.invokePropChanged(PROP_NAME.grid);
            self.raisePropertyChanged(PROP_NAME.grid);
        }, this.uniqueID, this);

    }
    get dataSource() {
        if (this._isDestroyCalled)
            return undefined;
        return this.grid.dataSource;
    }
    set dataSource(v) {
        if (this._isDestroyCalled)
            return;
        if (this.dataSource !== v) {
            this.grid.dataSource = v;
            this.raisePropertyChanged(PROP_NAME.dataSource);
        }
    }
    get grid() { return this._grid; }
    get stateProvider() { return this._stateProvider; }
    set stateProvider(v: IRowStateProvider) {
        if (v !== this._stateProvider) {
            this._stateProvider = v;
            this.raisePropertyChanged(PROP_NAME.stateProvider);
        }
    }
    get animation() {
        if (this._isDestroyCalled)
            return undefined;
        return this._grid.options.animation;
    }
    set animation(v) {
        if (this._isDestroyCalled)
            return;
        if (this.animation !== v) {
            this._grid.options.animation = v;
            this.raisePropertyChanged(PROP_NAME.animation);
        }
    }
}

bootstrap.registerElView("table", DataGridElView);
bootstrap.registerElView("datagrid", DataGridElView);

//Load Stylesheet for the bundle
bootstrap.loadOwnStyle("jriapp_ui");