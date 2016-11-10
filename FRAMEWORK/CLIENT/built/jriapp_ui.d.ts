/// <reference path="jriapp.d.ts" />
declare module "jriapp_ui/dialog" {
    import { ITemplate, ITemplateEvents, IApplication, IBaseObject, TEventHandler, IPromise } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { ViewModel } from "jriapp_core/mvvm";
    export const enum DIALOG_ACTION {
        Default = 0,
        StayOpen = 1,
    }
    export interface IDialogConstructorOptions {
        dataContext?: any;
        templateID: string;
        width?: any;
        height?: any;
        title?: string;
        submitOnOK?: boolean;
        canRefresh?: boolean;
        canCancel?: boolean;
        fn_OnClose?: (dialog: DataEditDialog) => void;
        fn_OnOK?: (dialog: DataEditDialog) => DIALOG_ACTION;
        fn_OnShow?: (dialog: DataEditDialog) => void;
        fn_OnCancel?: (dialog: DataEditDialog) => DIALOG_ACTION;
        fn_OnTemplateCreated?: (template: ITemplate) => void;
        fn_OnTemplateDestroy?: (template: ITemplate) => void;
    }
    export interface IButton {
        id: string;
        text: string;
        'class': string;
        click: () => void;
    }
    export class DataEditDialog extends BaseObject implements ITemplateEvents {
        private _objId;
        private _dataContext;
        private _templateID;
        private _submitOnOK;
        private _canRefresh;
        private _canCancel;
        private _fn_OnClose;
        private _fn_OnOK;
        private _fn_OnShow;
        private _fn_OnCancel;
        private _fn_OnTemplateCreated;
        private _fn_OnTemplateDestroy;
        private _isEditable;
        private _template;
        private _$dlgEl;
        private _result;
        private _options;
        private _fn_submitOnOK;
        private _app;
        private _currentSelectable;
        private _deferred;
        constructor(app: IApplication, options: IDialogConstructorOptions);
        handleError(error: any, source: any): boolean;
        addOnClose(fn: TEventHandler<DataEditDialog, any>, nmspace?: string, context?: IBaseObject): void;
        removeOnClose(nmspace?: string): void;
        addOnRefresh(fn: TEventHandler<DataEditDialog, {
            isHandled: boolean;
        }>, nmspace?: string, context?: IBaseObject): void;
        removeOnRefresh(nmspace?: string): void;
        protected _updateIsEditable(): void;
        protected _createDialog(): void;
        protected _getEventNames(): string[];
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
        protected _createTemplate(): ITemplate;
        protected _destroyTemplate(): void;
        protected _getButtons(): IButton[];
        protected _getOkButton(): JQuery;
        protected _getCancelButton(): JQuery;
        protected _getRefreshButton(): JQuery;
        protected _getAllButtons(): JQuery[];
        protected _disableButtons(isDisable: boolean): void;
        protected _onOk(): void;
        protected _onCancel(): void;
        protected _onRefresh(): void;
        protected _onClose(): void;
        protected _onShow(): void;
        show(): IPromise<DataEditDialog>;
        hide(): void;
        getOption(name: string): any;
        setOption(name: string, value: any): void;
        destroy(): void;
        readonly app: IApplication;
        dataContext: any;
        readonly result: "ok" | "cancel";
        readonly template: ITemplate;
        isSubmitOnOK: boolean;
        width: any;
        height: any;
        title: any;
        canRefresh: boolean;
        canCancel: boolean;
    }
    export class DialogVM extends ViewModel<IApplication> {
        private _factories;
        private _dialogs;
        constructor(app: IApplication);
        createDialog(name: string, options: IDialogConstructorOptions): () => DataEditDialog;
        showDialog(name: string, dataContext: any): DataEditDialog;
        getDialog(name: string): DataEditDialog;
        destroy(): void;
    }
}
declare module "jriapp_ui/dynacontent" {
    import { ITemplate, IVoidPromise, ITemplateEvents, IViewOptions } from "jriapp_core/shared";
    import { BaseElView } from "jriapp_elview/elview";
    export interface IDynaContentAnimation {
        beforeShow(template: ITemplate, isFirstShow: boolean): void;
        show(template: ITemplate, isFirstShow: boolean): IVoidPromise;
        beforeHide(template: ITemplate): void;
        hide(template: ITemplate): IVoidPromise;
        stop(): void;
        isAnimateFirstShow: boolean;
    }
    export interface IDynaContentOptions extends IViewOptions {
        animate?: string;
    }
    export class DynaContentElView extends BaseElView implements ITemplateEvents {
        private _dataContext;
        private _prevTemplateID;
        private _templateID;
        private _template;
        private _animation;
        constructor(options: IDynaContentOptions);
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
        private _templateChanging(oldName, newName);
        destroy(): void;
        readonly template: ITemplate;
        templateID: string;
        dataContext: any;
        animation: IDynaContentAnimation;
    }
}
declare module "jriapp_ui/datagrid/const" {
    import { IIndexer } from "jriapp_core/shared";
    export const COLUMN_TYPE: {
        DATA: string;
        ROW_EXPANDER: string;
        ROW_ACTIONS: string;
        ROW_SELECTOR: string;
    };
    export const enum ROW_POSITION {
        Up = 0,
        Bottom = 1,
        Details = 2,
    }
    export const enum ROW_ACTION {
        OK = 0,
        EDIT = 1,
        CANCEL = 2,
        DELETE = 3,
    }
    export const css: {
        container: string;
        dataTable: string;
        columnInfo: string;
        column: string;
        headerDiv: string;
        wrapDiv: string;
        dataColumn: string;
        dataCell: string;
        rowCollapsed: string;
        rowExpanded: string;
        rowExpander: string;
        columnSelected: string;
        rowActions: string;
        rowDetails: string;
        rowSelector: string;
        rowHighlight: string;
        rowDeleted: string;
        rowError: string;
        fillVSpace: string;
        nobr: string;
        colSortable: string;
        colSortAsc: string;
        colSortDesc: string;
    };
    export const actionsSelector: string;
    export const editSelector: string;
    export const deleteSelector: string;
    export const txtMap: IIndexer<string>;
    export const PROP_NAME: {
        isCurrent: string;
        isSelected: string;
        sortOrder: string;
        checked: string;
        editingRow: string;
        dataSource: string;
        currentRow: string;
        grid: string;
        animation: string;
        stateProvider: string;
    };
}
declare module "jriapp_ui/datagrid/animation" {
    import { BaseObject } from "jriapp_core/object";
    export interface IDataGridAnimation {
        beforeShow(el: HTMLElement): void;
        show(onEnd: () => void): void;
        beforeHide(el: HTMLElement): void;
        hide(onEnd: () => void): void;
        stop(): void;
    }
    export class DefaultAnimation extends BaseObject implements IDataGridAnimation {
        private _$el;
        constructor();
        beforeShow(el: HTMLElement): void;
        show(onEnd: () => void): void;
        beforeHide(el: HTMLElement): void;
        hide(onEnd: () => void): void;
        stop(): void;
        destroy(): void;
    }
}
declare module "jriapp_ui/datagrid/columns/base" {
    import { IContentOptions, ITemplateEvents, ITemplate } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
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
        private _grid;
        private _th;
        private _options;
        private _isSelected;
        private _objId;
        private _col;
        private _event_scope;
        private _template;
        constructor(grid: DataGrid, options: ICellInfo);
        destroy(): void;
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
        scrollIntoView(isUp: boolean): void;
        protected _onColumnClicked(): void;
        toString(): string;
        readonly uniqueID: string;
        readonly th: HTMLTableHeaderCellElement;
        readonly col: HTMLDivElement;
        readonly grid: DataGrid;
        readonly options: IColumnInfo;
        readonly title: string;
        isSelected: boolean;
    }
}
declare module "jriapp_ui/datagrid/columns/expander" {
    import { BaseColumn, ICellInfo } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class ExpanderColumn extends BaseColumn {
        constructor(grid: DataGrid, options: ICellInfo);
        toString(): string;
    }
}
declare module "jriapp_ui/datagrid/cells/expander" {
    import { BaseCell, ICellOptions } from "jriapp_ui/datagrid/cells/base";
    import { Row } from "jriapp_ui/datagrid/rows/row";
    import { ExpanderColumn } from "jriapp_ui/datagrid/columns/expander";
    export class ExpanderCell extends BaseCell<ExpanderColumn> {
        constructor(options: ICellOptions);
        protected _onCellClicked(row?: Row): void;
        toggleImage(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/datagrid/columns/data" {
    import { SORT_ORDER } from "jriapp_core/const";
    import { IBaseObject, IExternallyCachable } from "jriapp_core/shared";
    import { BaseColumn, ICellInfo } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class DataColumn extends BaseColumn {
        private _sortOrder;
        private _objCache;
        constructor(grid: DataGrid, options: ICellInfo);
        protected _onColumnClicked(): void;
        protected _cacheObject(key: string, obj: IBaseObject): void;
        protected _getCachedObject(key: string): IBaseObject;
        _getInitContentFn(): (content: IExternallyCachable) => void;
        destroy(): void;
        toString(): string;
        readonly isSortable: boolean;
        readonly sortMemberName: string;
        sortOrder: SORT_ORDER;
    }
}
declare module "jriapp_ui/datagrid/cells/data" {
    import { BaseCell, ICellOptions } from "jriapp_ui/datagrid/cells/base";
    import { DataColumn } from "jriapp_ui/datagrid/columns/data";
    export class DataCell extends BaseCell<DataColumn> {
        private _content;
        private _stateCss;
        constructor(options: ICellOptions);
        protected _initContent(): void;
        _beginEdit(): void;
        _endEdit(isCanceled: boolean): void;
        _setState(css: string): void;
        destroy(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/datagrid/columns/actions" {
    import { IColumnInfo, BaseColumn, ICellInfo } from "jriapp_ui/datagrid/columns/base";
    import { ActionsCell } from "jriapp_ui/datagrid/cells/actions";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export interface IActionsColumnInfo extends IColumnInfo {
    }
    export class ActionsColumn extends BaseColumn {
        private _event_act_scope;
        constructor(grid: DataGrid, options: ICellInfo);
        protected _onOk(cell: ActionsCell): void;
        protected _onCancel(cell: ActionsCell): void;
        protected _onDelete(cell: ActionsCell): void;
        protected _onEdit(cell: ActionsCell): void;
        toString(): string;
        destroy(): void;
    }
}
declare module "jriapp_ui/datagrid/cells/actions" {
    import { BaseCell, ICellOptions } from "jriapp_ui/datagrid/cells/base";
    import { ActionsColumn } from "jriapp_ui/datagrid/columns/actions";
    export class ActionsCell extends BaseCell<ActionsColumn> {
        private _isEditing;
        constructor(options: ICellOptions);
        destroy(): void;
        private _setupImages($images);
        protected readonly editImages: string;
        protected readonly viewImages: string;
        protected _createButtons(isEditing: boolean): void;
        update(): void;
        toString(): string;
        readonly isCanEdit: boolean;
        readonly isCanDelete: boolean;
    }
}
declare module "jriapp_ui/datagrid/columns/rowselector" {
    import { BaseColumn, ICellInfo } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class RowSelectorColumn extends BaseColumn {
        private _chk;
        private _event_chk_scope;
        private _onDespose;
        constructor(grid: DataGrid, options: ICellInfo);
        toString(): string;
        checked: any;
        destroy(): void;
    }
}
declare module "jriapp_ui/datagrid/cells/rowselector" {
    import { BaseCell, ICellOptions } from "jriapp_ui/datagrid/cells/base";
    import { RowSelectorColumn } from "jriapp_ui/datagrid/columns/rowselector";
    export class RowSelectorCell extends BaseCell<RowSelectorColumn> {
        private _$chk;
        constructor(options: ICellOptions);
        checked: any;
        destroy(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/datagrid/rows/row" {
    import { BaseObject } from "jriapp_core/object";
    import { ICollectionItem } from "jriapp_collection/collection";
    import { ROW_POSITION } from "jriapp_ui/datagrid/const";
    import { BaseCell } from "jriapp_ui/datagrid/cells/base";
    import { ExpanderCell } from "jriapp_ui/datagrid/cells/expander";
    import { ActionsCell } from "jriapp_ui/datagrid/cells/actions";
    import { BaseColumn } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class Row extends BaseObject {
        private _grid;
        private _tr;
        private _item;
        private _cells;
        private _objId;
        private _expanderCell;
        private _actionsCell;
        private _rowSelectorCell;
        private _isDeleted;
        private _isSelected;
        private _isDetached;
        constructor(grid: DataGrid, options: {
            tr: HTMLTableRowElement;
            item: ICollectionItem;
        });
        handleError(error: any, source: any): boolean;
        private _createCells();
        private _createCell(col, num);
        _setState(css: string): void;
        _onBeginEdit(): void;
        _onEndEdit(isCanceled: boolean): void;
        beginEdit(): boolean;
        endEdit(): boolean;
        cancelEdit(): boolean;
        destroy(): void;
        deleteRow(): void;
        updateErrorState(): void;
        scrollIntoView(animate?: boolean, pos?: ROW_POSITION): void;
        toString(): string;
        readonly tr: HTMLTableRowElement;
        readonly grid: DataGrid;
        readonly item: ICollectionItem;
        readonly cells: BaseCell<BaseColumn>[];
        readonly columns: BaseColumn[];
        readonly uniqueID: string;
        readonly itemKey: string;
        readonly isCurrent: boolean;
        isSelected: boolean;
        isExpanded: boolean;
        readonly expanderCell: ExpanderCell;
        readonly actionsCell: ActionsCell;
        isDeleted: boolean;
        isDetached: boolean;
        readonly isEditing: boolean;
        readonly isHasStateField: boolean;
    }
}
declare module "jriapp_ui/datagrid/cells/base" {
    import { BaseObject } from "jriapp_core/object";
    import { ICollectionItem } from "jriapp_collection/collection";
    import { DblClick } from "jriapp_utils/utils";
    import { Row } from "jriapp_ui/datagrid/rows/row";
    import { BaseColumn } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export interface ICellOptions {
        row: Row;
        td: HTMLTableCellElement;
        column: BaseColumn;
        num: number;
    }
    export class BaseCell<TColumn extends BaseColumn> extends BaseObject {
        private _row;
        private _td;
        private _column;
        protected _click: DblClick;
        private _num;
        constructor(options: ICellOptions);
        protected _onCellClicked(row?: Row): void;
        protected _onDblClicked(row?: Row): void;
        handleError(error: any, source: any): boolean;
        click(): void;
        scrollIntoView(): void;
        destroy(): void;
        toString(): string;
        readonly td: HTMLTableCellElement;
        readonly row: Row;
        readonly column: TColumn;
        readonly grid: DataGrid;
        readonly item: ICollectionItem;
        readonly uniqueID: string;
        readonly num: number;
    }
}
declare module "jriapp_ui/datagrid/rows/details" {
    import { BaseObject } from "jriapp_core/object";
    import { ICollectionItem } from "jriapp_collection/collection";
    import { Row } from "jriapp_ui/datagrid/rows/row";
    import { DetailsCell } from "jriapp_ui/datagrid/cells/details";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class DetailsRow extends BaseObject {
        private _grid;
        private _tr;
        private _item;
        private _cell;
        private _parentRow;
        private _objId;
        private _isFirstShow;
        constructor(options: {
            grid: DataGrid;
            tr: HTMLTableRowElement;
            details_id: string;
        });
        private _createCell(details_id);
        protected _setParentRow(row: Row): void;
        private _initShow();
        private _show(onEnd);
        private _hide(onEnd);
        destroy(): void;
        toString(): string;
        readonly tr: HTMLTableRowElement;
        readonly grid: DataGrid;
        item: ICollectionItem;
        readonly cell: DetailsCell;
        readonly uniqueID: string;
        readonly itemKey: string;
        parentRow: Row;
    }
}
declare module "jriapp_ui/datagrid/cells/details" {
    import { ITemplate } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { ICollectionItem } from "jriapp_collection/collection";
    import { DetailsRow } from "jriapp_ui/datagrid/rows/details";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class DetailsCell extends BaseObject {
        private _row;
        private _td;
        private _template;
        constructor(options: {
            row: DetailsRow;
            td: HTMLTableCellElement;
            details_id: string;
        });
        destroy(): void;
        toString(): string;
        readonly td: HTMLTableCellElement;
        readonly row: DetailsRow;
        readonly grid: DataGrid;
        item: ICollectionItem;
        readonly template: ITemplate;
    }
}
declare module "jriapp_ui/datagrid/rows/fillspace" {
    import { BaseObject } from "jriapp_core/object";
    import { FillSpaceCell } from "jriapp_ui/datagrid/cells/fillspace";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class FillSpaceRow extends BaseObject {
        private _grid;
        private _tr;
        private _$tr;
        private _cell;
        constructor(options: {
            grid: DataGrid;
            tr: HTMLTableRowElement;
        });
        private _createCell();
        destroy(): void;
        toString(): string;
        attach(): void;
        detach(): void;
        readonly tr: HTMLTableRowElement;
        readonly $tr: JQuery;
        readonly grid: DataGrid;
        readonly cell: FillSpaceCell;
        height: number;
    }
}
declare module "jriapp_ui/datagrid/cells/fillspace" {
    import { BaseObject } from "jriapp_core/object";
    import { FillSpaceRow } from "jriapp_ui/datagrid/rows/fillspace";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class FillSpaceCell extends BaseObject {
        private _row;
        private _td;
        private _div;
        constructor(options: {
            row: FillSpaceRow;
            td: HTMLTableCellElement;
        });
        destroy(): void;
        toString(): string;
        readonly td: HTMLTableCellElement;
        readonly row: FillSpaceRow;
        readonly grid: DataGrid;
        readonly div: HTMLElement;
        height: number;
    }
}
declare module "jriapp_ui/datagrid/datagrid" {
    import { IApplication, ISelectableProvider, TEventHandler, ISelectable, IViewOptions } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { ICollectionItem, ICollChangedArgs, ICollItemArgs, ICollection, ICollItemAddedArgs, ITEM_STATUS } from "jriapp_collection/collection";
    import { BaseElView } from "jriapp_elview/elview";
    import { IDialogConstructorOptions } from "jriapp_ui/dialog";
    import { ROW_POSITION, ROW_ACTION } from "jriapp_ui/datagrid/const";
    import { IDataGridAnimation } from "jriapp_ui/datagrid/animation";
    import { BaseCell } from "jriapp_ui/datagrid/cells/base";
    import { Row } from "jriapp_ui/datagrid/rows/row";
    import { DetailsRow } from "jriapp_ui/datagrid/rows/details";
    import { FillSpaceRow } from "jriapp_ui/datagrid/rows/fillspace";
    import { BaseColumn, IColumnInfo, ICellInfo } from "jriapp_ui/datagrid/columns/base";
    import { DataColumn } from "jriapp_ui/datagrid/columns/data";
    export type DataGridCell = BaseCell<BaseColumn>;
    export { Row as DataGridRow } from "jriapp_ui/datagrid/rows/row";
    export { BaseColumn as DataGridColumn } from "jriapp_ui/datagrid/columns/base";
    export { ROW_POSITION, COLUMN_TYPE, ROW_ACTION } from "jriapp_ui/datagrid/const";
    export { IDataGridAnimation, DefaultAnimation } from "jriapp_ui/datagrid/animation";
    export function getDataGrids(): DataGrid[];
    export function findDataGrid(gridName: string): DataGrid;
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
        details?: {
            templateID: string;
        };
        editor?: IDialogConstructorOptions;
        isPrependNewRows?: boolean;
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
        private _options;
        private _$table;
        private _table;
        private _name;
        private _objId;
        private _rowMap;
        private _rows;
        private _columns;
        private _expandedRow;
        private _details;
        private _fillSpace;
        private _expanderCol;
        private _actionsCol;
        private _rowSelectorCol;
        private _currentColumn;
        private _editingRow;
        private _dialog;
        private _$header;
        private _$wrapper;
        private _$contaner;
        private _internal;
        private _selectable;
        private _colSizeDebounce;
        private _scrollDebounce;
        constructor(options: IDataGridConstructorOptions);
        protected _getEventNames(): string[];
        addOnRowExpanded(fn: TEventHandler<DataGrid, {
            collapsedRow: Row;
            expandedRow: Row;
            isExpanded: boolean;
        }>, nmspace?: string, context?: any): void;
        removeOnRowExpanded(nmspace?: string): void;
        addOnRowSelected(fn: TEventHandler<DataGrid, {
            row: Row;
        }>, nmspace?: string, context?: any): void;
        removeOnRowSelected(nmspace?: string): void;
        addOnPageChanged(fn: TEventHandler<DataGrid, any>, nmspace?: string, context?: any): void;
        removeOnPageChanged(nmspace?: string): void;
        addOnRowStateChanged(fn: TEventHandler<DataGrid, {
            row: Row;
            val: any;
            css: string;
        }>, nmspace?: string, context?: any): void;
        removeOnRowStateChanged(nmspace?: string): void;
        addOnCellDblClicked(fn: TEventHandler<DataGrid, {
            cell: BaseCell<BaseColumn>;
        }>, nmspace?: string, context?: any): void;
        removeOnCellDblClicked(nmspace?: string): void;
        addOnRowAction(fn: TEventHandler<DataGrid, {
            row: Row;
            action: ROW_ACTION;
        }>, nmspace?: string, context?: any): void;
        removeOnRowAction(nmspace?: string): void;
        protected _onKeyDown(key: number, event: Event): void;
        protected _onKeyUp(key: number, event: Event): void;
        protected _isRowExpanded(row: Row): boolean;
        protected _setCurrentColumn(column: BaseColumn): void;
        protected _onRowStateChanged(row: Row, val: any): string;
        protected _onCellDblClicked(cell: BaseCell<BaseColumn>): void;
        protected _onRowSelectionChanged(row: Row): void;
        protected _resetColumnsSort(): void;
        protected _getLastRow(): Row;
        protected _removeRow(row: Row): void;
        protected _expandDetails(parentRow: Row, expanded: boolean): void;
        protected _parseColumnAttr(column_attr: string, content_attr: string): IColumnInfo;
        protected _findUndeleted(row: Row, isUp: boolean): Row;
        handleError(error: any, source: any): boolean;
        protected _onDSCurrentChanged(prevCurrent: ICollectionItem, newCurrent: ICollectionItem): void;
        protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>): void;
        protected _updateTableDisplay(): void;
        protected _onPageChanged(): void;
        protected _onItemEdit(item: ICollectionItem, isBegin: boolean, isCanceled: boolean): void;
        protected _onItemAdded(sender: any, args: ICollItemAddedArgs<ICollectionItem>): void;
        protected _onItemStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS): void;
        protected _onDSErrorsChanged(sender: any, args: ICollItemArgs<ICollectionItem>): void;
        protected _bindDS(): void;
        protected _unbindDS(): void;
        protected _clearGrid(): void;
        protected _wrapTable(): void;
        protected _unWrapTable(): void;
        protected _createColumns(): void;
        protected _createColumn(cellInfo: ICellInfo): BaseColumn;
        protected _appendItems(newItems: ICollectionItem[]): void;
        protected _refresh(isPageChanged: boolean): void;
        protected _createRowForItem(parent: Node, item: ICollectionItem, prepend?: boolean): Row;
        protected _createDetails(): DetailsRow;
        protected _createFillSpace(): FillSpaceRow;
        _getInternal(): IInternalDataGridMethods;
        updateColumnsSize(): void;
        getISelectable(): ISelectable;
        sortByColumn(column: DataColumn): void;
        selectRows(isSelect: boolean): void;
        findRowByItem(item: ICollectionItem): Row;
        collapseDetails(): void;
        getSelectedRows(): Row[];
        showEditDialog(): boolean;
        scrollToRow(args: {
            row: Row;
            animate?: boolean;
            pos?: ROW_POSITION;
        }): void;
        scrollToCurrent(pos?: ROW_POSITION, animate?: boolean): void;
        focus(): void;
        addNew(): void;
        destroy(): void;
        readonly $table: JQuery;
        readonly table: HTMLTableElement;
        readonly app: IApplication;
        readonly options: IDataGridConstructorOptions;
        readonly _tBodyEl: HTMLTableSectionElement;
        readonly _tHeadEl: HTMLTableSectionElement;
        readonly _tFootEl: HTMLTableSectionElement;
        readonly _tHeadRow: HTMLTableRowElement;
        readonly _tHeadCells: HTMLTableHeaderCellElement[];
        readonly uniqueID: string;
        readonly name: string;
        dataSource: ICollection<ICollectionItem>;
        readonly rows: Row[];
        readonly columns: BaseColumn[];
        currentItem: ICollectionItem;
        currentRow: Row;
        readonly editingRow: Row;
        readonly isHasEditor: string;
        readonly isCanEdit: boolean;
        readonly isCanDelete: boolean;
        readonly isCanAddNew: boolean;
        isUseScrollInto: boolean;
        readonly animation: IDataGridAnimation;
    }
    export interface IDataGridViewOptions extends IDataGridOptions, IViewOptions {
    }
    export class DataGridElView extends BaseElView {
        private _grid;
        private _options;
        private _stateProvider;
        constructor(options: IDataGridViewOptions);
        toString(): string;
        destroy(): void;
        private _createGrid();
        private _bindGridEvents();
        dataSource: any;
        readonly grid: DataGrid;
        stateProvider: IRowStateProvider;
        animation: any;
    }
}
declare module "jriapp_ui/pager" {
    import { IApplication, IViewOptions } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { ICollection, ICollectionItem } from "jriapp_collection/collection";
    import { BaseElView } from "jriapp_elview/elview";
    export interface IPagerOptions {
        showTip?: boolean;
        showInfo?: boolean;
        showNumbers?: boolean;
        showFirstAndLast?: boolean;
        showPreviousAndNext?: boolean;
        useSlider?: boolean;
        hideOnSinglePage?: boolean;
        sliderSize?: number;
    }
    export interface IPagerConstructorOptions extends IPagerOptions {
        app: IApplication;
        el: HTMLElement;
        dataSource: ICollection<ICollectionItem>;
    }
    export class Pager extends BaseObject {
        private _$el;
        private _objId;
        private _options;
        private _rowsPerPage;
        private _rowCount;
        private _currentPage;
        private _renderDebounce;
        constructor(options: IPagerConstructorOptions);
        protected _createElement(tag: string): JQuery;
        protected _render(): void;
        protected render(): void;
        protected _setDSPageIndex(page: number): void;
        protected _onPageSizeChanged(ds: ICollection<ICollectionItem>, args?: any): void;
        protected _onPageIndexChanged(ds: ICollection<ICollectionItem>, args?: any): void;
        protected _onTotalCountChanged(ds: ICollection<ICollectionItem>, args?: any): void;
        destroy(): void;
        protected _bindDS(): void;
        protected _unbindDS(): void;
        protected _clearContent(): void;
        protected _reset(): void;
        protected _createLink(page: number, text: string, tip?: string): JQuery;
        protected _createFirst(): JQuery;
        protected _createPrevious(): JQuery;
        protected _createCurrent(): JQuery;
        protected _createOther(page: number): JQuery;
        protected _createNext(): JQuery;
        protected _createLast(): JQuery;
        protected _buildTip(page: number): string;
        toString(): string;
        readonly app: IApplication;
        readonly el: HTMLElement;
        dataSource: ICollection<ICollectionItem>;
        readonly pageCount: number;
        rowCount: number;
        rowsPerPage: number;
        currentPage: number;
        useSlider: boolean;
        sliderSize: number;
        hideOnSinglePage: boolean;
        showTip: boolean;
        showInfo: boolean;
        showFirstAndLast: boolean;
        showPreviousAndNext: boolean;
        showNumbers: boolean;
    }
    export interface IPagerViewOptions extends IPagerOptions, IViewOptions {
    }
    export class PagerElView extends BaseElView {
        private _pager;
        constructor(options: IPagerViewOptions);
        destroy(): void;
        toString(): string;
        dataSource: any;
        readonly pager: Pager;
    }
}
declare module "jriapp_ui/listbox" {
    import { IBaseObject, TEventHandler, IExternallyCachable, IBinding, IConstructorContentOptions, IContentFactory, IApplication, IContentConstructor, IContent, IContentOptions, IViewOptions } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { ICollection, ICollectionItem, ICollChangedArgs, ITEM_STATUS } from "jriapp_collection/collection";
    import { BaseElView } from "jriapp_elview/elview";
    import { SpanElView } from "jriapp_elview/span";
    import { BasicContent } from "jriapp_content/basic";
    export interface IOptionStateProvider {
        getCSS(item: ICollectionItem, itemIndex: number, val: any): string;
    }
    export interface IOptionTextProvider {
        getText(item: ICollectionItem, itemIndex: number, text: string): string;
    }
    export interface IListBoxOptions {
        valuePath: string;
        textPath: string;
        statePath?: string;
    }
    export interface IListBoxConstructorOptions extends IListBoxOptions {
        app: IApplication;
        el: HTMLSelectElement;
        dataSource: ICollection<ICollectionItem>;
    }
    export interface IMappedItem {
        item: ICollectionItem;
        op: HTMLOptionElement;
    }
    export class ListBox extends BaseObject {
        private _$el;
        private _objId;
        private _isRefreshing;
        private _selectedItem;
        private _prevSelected;
        private _keyMap;
        private _valMap;
        private _savedValue;
        private _tempValue;
        private _options;
        private _fn_state;
        private _textProvider;
        private _stateProvider;
        constructor(options: IListBoxConstructorOptions);
        destroy(): void;
        protected _getEventNames(): string[];
        addOnRefreshed(fn: TEventHandler<ListBox, {}>, nmspace?: string, context?: any): void;
        removeOnRefreshed(nmspace?: string): void;
        protected _onChanged(): void;
        protected _getStringValue(item: ICollectionItem): string;
        protected _getValue(item: ICollectionItem): any;
        protected _getText(item: ICollectionItem, index: number): string;
        protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>): void;
        protected _onEdit(item: ICollectionItem, isBegin: boolean, isCanceled: boolean): void;
        protected _onStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS): void;
        protected _onCommitChanges(item: ICollectionItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void;
        protected _onOptionStateChanged(data: IMappedItem): string;
        private _bindDS();
        private _unbindDS();
        private _addOption(item, first);
        private _mapByValue();
        private _resetText();
        private _removeOption(item);
        private _clear(isDestroy);
        private _refresh();
        private _findItemIndex(item);
        protected _setIsEnabled(el: HTMLSelectElement, v: boolean): void;
        protected _getIsEnabled(el: HTMLSelectElement): boolean;
        clear(): void;
        findItemByValue(val: any): ICollectionItem;
        getTextByValue(val: any): string;
        toString(): string;
        dataSource: ICollection<ICollectionItem>;
        selectedValue: any;
        selectedItem: ICollectionItem;
        valuePath: string;
        textPath: string;
        readonly statePath: string;
        isEnabled: boolean;
        textProvider: IOptionTextProvider;
        stateProvider: IOptionStateProvider;
        readonly el: HTMLSelectElement;
    }
    export interface IListBoxViewOptions extends IListBoxOptions, IViewOptions {
    }
    export class ListBoxElView extends BaseElView {
        private _listBox;
        constructor(options: IListBoxViewOptions);
        destroy(): void;
        toString(): string;
        isEnabled: boolean;
        dataSource: ICollection<ICollectionItem>;
        selectedValue: any;
        selectedItem: ICollectionItem;
        valuePath: string;
        textPath: string;
        textProvider: IOptionTextProvider;
        stateProvider: IOptionStateProvider;
        readonly listBox: ListBox;
    }
    export interface ILookupOptions {
        dataSource: string;
        valuePath: string;
        textPath: string;
        statePath?: string;
    }
    export type TObjCreatedArgs = {
        objectKey: string;
        object: IBaseObject;
        isCachedExternally: boolean;
    };
    export type TObjNeededArgs = {
        objectKey: string;
        object: IBaseObject;
    };
    export class LookupContent extends BasicContent implements IExternallyCachable {
        private _spanView;
        private _valBinding;
        private _listBinding;
        private _listBoxElView;
        private _isListBoxCachedExternally;
        private _value;
        private _objId;
        constructor(options: IConstructorContentOptions);
        protected init(): void;
        protected _getEventNames(): string[];
        addOnObjectCreated(fn: (sender: any, args: TObjCreatedArgs) => void, nmspace?: string): void;
        removeOnObjectCreated(nmspace?: string): void;
        addOnObjectNeeded(fn: (sender: any, args: TObjNeededArgs) => void, nmspace?: string): void;
        removeOnObjectNeeded(nmspace?: string): void;
        protected getListBoxElView(): ListBoxElView;
        protected onListRefreshed(): void;
        protected createListBoxElView(lookUpOptions: ILookupOptions): ListBoxElView;
        protected updateTextValue(): void;
        protected getLookupText(): string;
        protected getSpanView(): SpanElView;
        protected render(): void;
        protected createTargetElement(): BaseElView;
        protected cleanUp(): void;
        protected updateBindingSource(): void;
        protected bindToValue(): IBinding;
        protected bindToList(selectView: ListBoxElView): IBinding;
        destroy(): void;
        toString(): string;
        value: any;
        readonly uniqueID: string;
    }
    export class ContentFactory implements IContentFactory {
        private _nextFactory;
        constructor(nextFactory?: IContentFactory);
        getContentType(options: IContentOptions): IContentConstructor;
        createContent(options: IConstructorContentOptions): IContent;
        isExternallyCachable(contentType: IContentConstructor): boolean;
    }
}
declare module "jriapp_ui/stackpanel" {
    import { IApplication, ITemplate, ISelectable, IViewOptions, TEventHandler, ISelectableProvider, IBaseObject } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { ICollection, ICollectionItem, ICollChangedArgs, ITEM_STATUS } from "jriapp_collection/collection";
    import { BaseElView } from "jriapp_elview/elview";
    export interface IStackPanelOptions {
        templateID: string;
        orientation?: "vertical" | "horizontal";
    }
    export interface IStackPanelConstructorOptions extends IStackPanelOptions {
        app: IApplication;
        el: HTMLElement;
        dataSource: ICollection<ICollectionItem>;
    }
    export class StackPanel extends BaseObject implements ISelectableProvider {
        private _$el;
        private _objId;
        private _currentItem;
        private _itemMap;
        private _options;
        private _selectable;
        private _item_tag;
        private _event_scope;
        private _isKeyNavigation;
        constructor(options: IStackPanelConstructorOptions);
        protected _getEventNames(): string[];
        addOnItemClicked(fn: TEventHandler<StackPanel, {
            item: ICollectionItem;
        }>, nmspace?: string, context?: IBaseObject): void;
        removeOnItemClicked(nmspace?: string): void;
        protected _getContainerEl(): HTMLElement;
        protected _onKeyDown(key: number, event: Event): void;
        protected _onKeyUp(key: number, event: Event): void;
        protected _updateCurrent(item: ICollectionItem, withScroll: boolean): void;
        protected _onDSCurrentChanged(sender: any, args: any): void;
        protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>): void;
        protected _onItemStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS): void;
        protected _createTemplate(item: ICollectionItem): ITemplate;
        protected _appendItems(newItems: ICollectionItem[]): void;
        protected _appendItem(item: ICollectionItem): void;
        protected _bindDS(): void;
        protected _unbindDS(): void;
        protected _onItemClicked(div: HTMLElement, item: ICollectionItem): void;
        protected _clearContent(): void;
        protected _removeItemByKey(key: string): void;
        protected _removeItem(item: ICollectionItem): void;
        protected _refresh(): void;
        destroy(): void;
        getISelectable(): ISelectable;
        scrollToItem(item: ICollectionItem, isUp?: boolean): void;
        scrollToCurrent(isUp?: boolean): void;
        focus(): void;
        getDivElementByItem(item: ICollectionItem): HTMLElement;
        toString(): string;
        readonly app: IApplication;
        readonly el: HTMLElement;
        readonly uniqueID: string;
        readonly orientation: "vertical" | "horizontal";
        readonly templateID: string;
        dataSource: ICollection<ICollectionItem>;
        readonly currentItem: ICollectionItem;
    }
    export interface IStackPanelViewOptions extends IStackPanelOptions, IViewOptions {
    }
    export interface IPanelEvents {
        onItemClicked(item: ICollectionItem): void;
    }
    export class StackPanelElView extends BaseElView {
        private _panel;
        private _panelEvents;
        constructor(options: IStackPanelViewOptions);
        private _createPanel(opts);
        destroy(): void;
        toString(): string;
        dataSource: ICollection<ICollectionItem>;
        panelEvents: IPanelEvents;
        readonly panel: StackPanel;
    }
}
declare module "jriapp_ui/tabs" {
    import { IViewOptions } from "jriapp_core/shared";
    import { BaseElView } from "jriapp_elview/elview";
    export interface ITabs {
        readonly uniqueID: string;
        readonly el: HTMLElement;
        readonly $el: JQuery;
        tabIndex: number;
        isVisible: boolean;
        dataName: string;
        css: string;
    }
    export interface ITabsEvents {
        addTabs(tabs: ITabs): void;
        removeTabs(): void;
        onTabSelected(tabs: ITabs): void;
    }
    export class TabsElView extends BaseElView implements ITabs {
        private _tabOpts;
        private _tabsEvents;
        private _tabsCreated;
        constructor(options: IViewOptions);
        protected _createTabs(): void;
        protected _destroyTabs(): void;
        protected _onTabsCreated(): void;
        destroy(): void;
        toString(): string;
        tabsEvents: ITabsEvents;
        tabIndex: number;
    }
}
declare module "jriapp_ui" {
    export { DIALOG_ACTION, IDialogConstructorOptions, DataEditDialog, DialogVM } from "jriapp_ui/dialog";
    export { DynaContentElView, IDynaContentAnimation, IDynaContentOptions } from "jriapp_ui/dynacontent";
    export { DataGrid, DataGridCell, DataGridColumn, DataGridRow, DataGridElView, IDataGridViewOptions, ROW_POSITION, IRowStateProvider, findDataGrid, getDataGrids } from "jriapp_ui/datagrid/datagrid";
    export * from "jriapp_ui/pager";
    export { ListBox, ListBoxElView, LookupContent, IListBoxViewOptions, IOptionStateProvider, IOptionTextProvider } from "jriapp_ui/listbox";
    export * from "jriapp_ui/stackpanel";
    export * from "jriapp_ui/tabs";
}
