/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { SORT_ORDER } from "jriapp_core/const";
import { IIndexer, IBaseObject, IExternallyCachable } from "jriapp_core/shared";
import { Utils } from "jriapp_utils/utils";

import { css, PROP_NAME } from "../const";
import { BaseColumn, IColumnInfo, ICellInfo } from "./base";
import { DataGrid } from "../datagrid";

const utils = Utils, dom = utils.dom, $ = dom.$;

export class DataColumn extends BaseColumn {
    private _sortOrder: SORT_ORDER;
    private _objCache: IIndexer<IBaseObject>;

    constructor(grid: DataGrid, options: ICellInfo) {
        super(grid, options);
        //the DataCell caches here listbox (for the LookupContent)
        //so not to create it for every cell - it is only one per column!
        this._objCache = {};
        let colClass = css.dataColumn;
        this._sortOrder = null;
        if (this.isSortable) {
            colClass += (" " + css.colSortable);
        }
        dom.addClass(this.$col.toArray(), colClass);
    }
    protected _onColumnClicked() {
        if (this.isSortable && !!this.sortMemberName) {
            let sortOrd = this._sortOrder;
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
        if (this._sortOrder !== v) {
            this._sortOrder = v;
            let styles = [(v === SORT_ORDER.ASC ? "+" : "-") + css.colSortAsc, (v === SORT_ORDER.DESC ? "+" : "-") + css.colSortDesc];
            utils.dom.setClasses(this.$col.toArray(), styles);
            this.raisePropertyChanged(PROP_NAME.sortOrder);
        }
    }
}