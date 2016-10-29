/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as langMOD from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { Utils as utils, Debounce, ERROR } from "jriapp_utils/utils";
import { COLL_CHANGE_REASON, ICollection } from "jriapp_collection/collection";
import { PROP_NAME } from "const";
import { IEntityItem } from "int";
import { Association } from "association";
import { DataView, IDataViewOptions } from "dataview";

const checks = utils.check, strUtils = utils.str, coreUtils = utils.core;

export interface IChildDataViewOptions<TItem extends IEntityItem> {
    association: Association;
    fn_filter?: (item: TItem) => boolean;
    fn_sort?: (item1: TItem, item2: TItem) => number;
}

export class ChildDataView<TItem extends IEntityItem> extends DataView<TItem> {
    private _parentItem: IEntityItem;
    private _association: Association;
    protected _parentDebounce: Debounce;

    constructor(options: IChildDataViewOptions<TItem>) {
        let prev_filter = options.fn_filter, ds = <ICollection<TItem>><any>options.association.childDS,
            opts = <IDataViewOptions<TItem>>coreUtils.extend({
                dataSource: ds,
                fn_filter: (item: TItem): boolean => { return true },
                fn_sort: null,
                fn_itemsProvider: null
            }, options);
        super(opts);
        this._parentItem = null;
        this._parentDebounce = new Debounce(350);
        this._association = options.association;
        let self = this, assoc = this._association;
        this._fn_filter = function (item) {
            if (!self._parentItem)
                return false;
            let ok = assoc.isParentChild(self._parentItem, item);
            return ok && (!prev_filter || prev_filter(item));
        };
    }
    protected _refresh(reason: COLL_CHANGE_REASON): void {
        let self = this;
        let ds = self.dataSource;
        if (!ds || ds.getIsDestroyCalled()) {
            this.clear();
            this._onViewRefreshed({});
            return;
        }

        try {
            if (!!self._parentItem) {
                let items = <TItem[]>self._association.getChildItems(self._parentItem);
                if (!!self.fn_filter) {
                    items = items.filter(self.fn_filter);
                }
                if (!!self.fn_sort) {
                    items = items.sort(self.fn_sort);
                }
                self._fillItems({ items: items, reason: reason, clear: true, isAppend: false });
            }
            else {
                this.clear();
            }

            self._onViewRefreshed({});
        }
        catch (ex) {
            ERROR.reThrow(ex, self.handleError(ex, this));
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._parentDebounce.destroy();
        this._parentDebounce = null;
        this._association = null;
        super.destroy();
    }
    toString() {
        if (!!this._association)
            return "ChildDataView for " + this._association.toString();
        return "ChildDataView";
    }
    get parentItem() { return this._parentItem; }
    set parentItem(v: IEntityItem) {
        if (this._parentItem !== v) {
            this._parentItem = v;
            this.raisePropertyChanged(PROP_NAME.parentItem);
        }
        if (this.items.length > 0) {
            this.clear();
            this._onViewRefreshed({});
        }

        this._parentDebounce.enqueue(() => {
            this._refresh(COLL_CHANGE_REASON.None);
        });
    }
    get association() { return this._association; }
}

export type TChildDataView = ChildDataView<IEntityItem>;