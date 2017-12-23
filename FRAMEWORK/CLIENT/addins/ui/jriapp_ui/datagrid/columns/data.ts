/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IIndexer, IBaseObject, Utils } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { SORT_ORDER } from "jriapp_shared/collection/const";
import { IExternallyCachable } from "jriapp/int";

import { css, PROP_NAME } from "../const";
import { BaseColumn, ICellInfo } from "./base";
import { DataGrid } from "../datagrid";

const utils = Utils, dom = DomUtils;

export class DataColumn extends BaseColumn {
    private _sortOrder: SORT_ORDER;
    private _objCache: IIndexer<IBaseObject>;

    constructor(grid: DataGrid, options: ICellInfo) {
        super(grid, options);
        // the DataCell caches here listbox (for the LookupContent)
        // so not to create it for every cell - it is only one per column!
        this._objCache = {};
        let colClass: string = css.dataColumn;
        this._sortOrder = null;
        if (this.isSortable) {
            colClass += (" " + css.colSortable);
        }
        dom.addClass([this.col], colClass);
    }
    protected _onColumnClicked() {
        if (this.isSortable && !!this.sortMemberName) {
            const sortOrd = this._sortOrder;
            this.grid._getInternal().resetColumnsSort();

            this.sortOrder = (sortOrd === SORT_ORDER.ASC) ? SORT_ORDER.DESC : SORT_ORDER.ASC;
            this.grid.sortByColumn(this);
        }
    }
    protected _cacheObject(key: string, obj: IBaseObject) {
        this._objCache[key] = obj;
    }
    protected _getCachedObject(key: string) {
        return this._objCache[key];
    }
    _getInitContentFn(): (content: IExternallyCachable) => void {
        const self = this;
        return (content: IExternallyCachable) => {
            content.addOnObjectCreated((sender, args) => {
                self._cacheObject(args.objectKey, args.result);
                args.isCachedExternally = !!self._getCachedObject(args.objectKey);
            });
            content.addOnObjectNeeded((sender, args) => {
                args.result = self._getCachedObject(args.objectKey);
            });
        };
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        const self = this;
        utils.core.forEachProp(self._objCache, (key) => {
            self._objCache[key].dispose();
        });
        self._objCache = null;
        super.dispose();
    }
    toString() {
        return "DataColumn";
    }
    get isSortable() { return !!(this.options.sortable); }
    get sortMemberName() { return this.options.sortMemberName; }
    get sortOrder() { return this._sortOrder; }
    set sortOrder(v) {
        if (this._sortOrder !== v) {
            this._sortOrder = v;
            const styles = [(v === SORT_ORDER.ASC ? "+" : "-") + css.colSortAsc, (v === SORT_ORDER.DESC ? "+" : "-") + css.colSortDesc];
            dom.setClasses([this.col], styles);
            this.objEvents.raiseProp(PROP_NAME.sortOrder);
        }
    }
}
