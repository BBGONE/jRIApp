/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as langMOD from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { Debounce } from "jriapp_utils/debounce";
import { Utils } from "jriapp_utils/utils";
import { COLL_CHANGE_REASON, ICollection } from "jriapp";
import { PROP_NAME } from "const";
import { IEntityItem } from "int";
import { Association } from "association";
import { DataView, IDataViewOptions } from "dataview";

const utils = Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core;

export interface IChildDataViewOptions<TItem extends IEntityItem> {
    association: Association;
    fn_filter?: (item: TItem) => boolean;
    fn_sort?: (item1: TItem, item2: TItem) => number;
    parentItem?: IEntityItem;
}

export class ChildDataView<TItem extends IEntityItem> extends DataView<TItem> {
    private _setParent: (parent: IEntityItem) => void;
    private _getParent: () => IEntityItem;
    private _association: Association;
    protected _parentDebounce: Debounce;

    constructor(options: IChildDataViewOptions<TItem>) {
        let parentItem: IEntityItem = !options.parentItem ? null : options.parentItem,
            assoc = options.association,
            opts = <IDataViewOptions<TItem>>coreUtils.extend({}, options),
            oldFilter = opts.fn_filter;

        opts.dataSource = <ICollection<TItem>><any>assoc.childDS;
        opts.fn_itemsProvider = function (ds) {
            if (!parentItem) {
                return [];
            }
            let items = <TItem[]>assoc.getChildItems(parentItem);
            return items;
        };
        opts.fn_filter = function (item) {
            return assoc.isParentChild(parentItem, item);
        };
        super(opts);
        let self = this;

        this._getParent = function () {
            if (self.getIsDestroyCalled())
                return null;
            return parentItem;
        };
        this._setParent = function (v: IEntityItem) {
            if (parentItem !== v) {
                parentItem = v;
                self.raisePropertyChanged(PROP_NAME.parentItem);
            }
            if (self.getIsDestroyCalled())
                return;
            if (self.items.length > 0) {
                self.clear();
                self._onViewRefreshed({});
            }

            self._parentDebounce.enqueue(() => {
                self._refresh(COLL_CHANGE_REASON.None);
            });
        };
        this._parentDebounce = new Debounce(350);
        this._association = assoc;
        if (!!parentItem) {
            const queue = utils.defer.getTaskQueue();
            queue.enque(() => {
                self._refresh(COLL_CHANGE_REASON.None);
            });
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._setParent(null);
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
    get parentItem() {
        return this._getParent();
    }
    set parentItem(v: IEntityItem) {
        this._setParent(v);
    }
    get association() { return this._association; }
}

export type TChildDataView = ChildDataView<IEntityItem>;