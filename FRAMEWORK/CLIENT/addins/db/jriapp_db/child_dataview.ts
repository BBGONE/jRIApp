/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils, Debounce } from "jriapp_shared";
import { COLL_CHANGE_REASON } from "jriapp_shared/collection/const";
import { ICollection } from "jriapp_shared/collection/int";
import { PROP_NAME } from "./const";
import { IEntityItem } from "./int";
import { Association } from "./association";
import { DataView, IDataViewOptions } from "./dataview";

const utils = Utils, coreUtils = utils.core;

export interface IChildDataViewOptions<TItem extends IEntityItem> {
    association: Association;
    fn_filter?: (item: TItem) => boolean;
    fn_sort?: (item1: TItem, item2: TItem) => number;
    parentItem?: IEntityItem;
    explicitRefresh?: boolean;
}

export class ChildDataView<TItem extends IEntityItem> extends DataView<TItem> {
    private _setParent: (parent: IEntityItem) => void;
    private _getParent: () => IEntityItem;
    private _association: Association;
    protected _parentDebounce: Debounce;

    constructor(options: IChildDataViewOptions<TItem>) {
        let parentItem: IEntityItem = !options.parentItem ? null : options.parentItem;
        const assoc = options.association,
            opts = <IDataViewOptions<TItem>>coreUtils.extend({}, options),
            oldFilter = opts.fn_filter;

        opts.dataSource = <ICollection<TItem>><any>assoc.childDS;
        opts.fn_itemsProvider = () => {
            if (!parentItem) {
                return [];
            }
            return <TItem[]>assoc.getChildItems(parentItem);
        };
        opts.fn_filter = (item) => {
            const isPC = assoc.isParentChild(parentItem, item);
            return isPC && (!oldFilter ? true : oldFilter(item));
        };
        super(opts);
        const self = this;

        this._getParent = () => {
            if (self.getIsStateDirty()) {
                return null;
            }
            return parentItem;
        };
        this._setParent = (v: IEntityItem) => {
            if (parentItem !== v) {
                parentItem = v;
                self.objEvents.raiseProp(PROP_NAME.parentItem);
            }
            if (self.getIsStateDirty()) {
                return;
            }
            if (self.items.length > 0) {
                self.clear();
                self._onViewRefreshed({});
            }

            self._parentDebounce.enque(() => {
                self._refresh(COLL_CHANGE_REASON.None);
            });
        };
        this._parentDebounce = new Debounce(350);
        this._association = assoc;
        if (!!parentItem && !options.explicitRefresh) {
            const queue = utils.defer.getTaskQueue();
            queue.enque(() => {
                self._refresh(COLL_CHANGE_REASON.None);
            });
        }
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._setParent(null);
        this._parentDebounce.dispose();
        this._parentDebounce = null;
        this._association = null;
        super.dispose();
    }
    toString() {
        return (!!this._association) ? ("ChildDataView for " + this._association.toString()) : "ChildDataView";
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
