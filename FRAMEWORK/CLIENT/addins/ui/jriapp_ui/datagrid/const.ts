/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IIndexer } from "jriapp_shared";

export const enum COLUMN_TYPE {
    DATA = "data",
    ROW_EXPANDER = "row_expander",
    ROW_ACTIONS = "row_actions",
    ROW_SELECTOR = "row_selector"
}

export const enum ROW_POSITION {
    Up = 0,
    Bottom = 1,
    Details = 2
}

export const enum ROW_ACTION {
    OK,
    EDIT,
    CANCEL,
    DELETE
}

export const enum css {
    container = "ria-table-container",
    dataTable = "ria-data-table",
    columnInfo = "ria-col-info",
    column = "ria-col-ex",
    headerDiv = "ria-table-header",
    wrapDiv = "ria-table-wrap",
    dataColumn = "ria-data-column",
    dataCell = "ria-data-cell",
    rowCollapsed = "ria-row-collapsed",
    rowExpanded = "ria-row-expanded",
    rowExpander = "ria-row-expander",
    columnSelected = "ria-col-selected",
    rowActions = "ria-row-actions",
    rowDetails = "ria-row-details",
    rowSelector = "ria-row-selector",
    rowHighlight = "ria-row-highlight",
    rowDeleted = "ria-row-deleted",
    rowError = "ria-row-error",
    fillVSpace = "ria-fill-vspace",
    nobr = "ria-nobr",
    colSortable = "ria-sortable",
    colSortAsc = "ria-sort-asc",
    colSortDesc = "ria-sort-desc"
}

export const txtMap: IIndexer<string> = {
    img_ok: "txtOk",
    img_cancel: "txtCancel",
    img_edit: "txtEdit",
    img_delete: "txtDelete"
};

export const enum PROP_NAME {
    isCurrent = "isCurrent",
    isSelected = "isSelected",
    sortOrder = "sortOrder",
    checked = "checked",
    editingRow = "editingRow",
    dataSource = "dataSource",
    currentRow = "currentRow",
    grid = "grid",
    animation = "animation",
    stateProvider = "stateProvider"
}
