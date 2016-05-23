import { SORT_ORDER } from "jriapp_core/const";
import { IIndexer, IBaseObject, IExternallyCachable } from "jriapp_core/shared";
import { Utils as utils } from "jriapp_utils/utils";

import { css, PROP_NAME } from "../const";
import { BaseColumn, IColumnInfo, ICellInfo } from "./base";
import { DataGrid } from "../datagrid";

const $ = utils.dom.$;

export class DataColumn extends BaseColumn {
    private _sortOrder: SORT_ORDER;
    private _objCache: IIndexer<IBaseObject>;

    constructor(grid: DataGrid, options: ICellInfo) {
        super(grid, options);
        //the DataCell caches here listbox (for the LookupContent)
        //so not to create it for every cell - it is only one per column!
        this._objCache = {};
        this.$col.addClass(css.dataColumn);
        this._sortOrder = null;
        if (this.isSortable) {
            this.$col.addClass(css.colSortable);
        }
    }
    protected _onColumnClicked() {
        if (this.isSortable && !!this.sortMemberName) {
            let sortOrd = this._sortOrder;
            this.grid._getInternal().resetColumnsSort();

            if (sortOrd === SORT_ORDER.ASC) {
                this.sortOrder = SORT_ORDER.DESC;
            }
            else if (sortOrd === SORT_ORDER.DESC) {
                this.sortOrder = SORT_ORDER.ASC;
            }
            else
                this.sortOrder = SORT_ORDER.ASC;
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
        let self = this;
        return function (content: IExternallyCachable) {
            content.addOnObjectCreated(function (sender, args) {
                self._cacheObject(args.objectKey, args.object);
                args.isCachedExternally = !!self._getCachedObject(args.objectKey);
            });
            content.addOnObjectNeeded(function (sender, args) {
                args.object = self._getCachedObject(args.objectKey);
            });
        };
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let self = this;
        utils.core.forEachProp(self._objCache, function (key) {
            self._objCache[key].destroy();
        });
        self._objCache = null;
        super.destroy();
    }
    toString() {
        return "DataColumn";
    }
    get isSortable() { return !!(this.options.sortable); }
    get sortMemberName() { return this.options.sortMemberName; }
    get sortOrder() { return this._sortOrder; }
    set sortOrder(v) {
        this.$col.removeClass([css.colSortAsc, css.colSortDesc].join(" "));
        switch (v) {
            case SORT_ORDER.ASC:
                this.$col.addClass(css.colSortAsc);
                break;
            case SORT_ORDER.DESC:
                this.$col.addClass(css.colSortDesc);
                break;
        }
        this._sortOrder = v;
        this.raisePropertyChanged(PROP_NAME.sortOrder);
    }
}