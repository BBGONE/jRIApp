/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, BaseObject, IIndexer, TPriority, LocaleERRS as ERRS, Debounce
} from "jriapp_shared";
import {
    COLL_CHANGE_TYPE, ITEM_STATUS
} from "jriapp_shared/collection/const";
import {
    ICollChangedArgs, IFieldInfo
} from "jriapp_shared/collection/int";
import { DELETE_ACTION } from "./const";
import { IAssocConstructorOptions, IEntityItem } from "./int";
import { DbContext } from "./dbcontext";
import { TDbSet } from "./dbset";

const utils = Utils, strUtils = utils.str, coreUtils = utils.core, arrHelper = utils.arr;

export class Association extends BaseObject {
    private _objId: string;
    private _name: string;
    private _dbContext: DbContext;
    private _onDeleteAction: DELETE_ACTION;
    private _parentDS: TDbSet;
    private _childDS: TDbSet;
    private _parentFldInfos: IFieldInfo[];
    private _childFldInfos: IFieldInfo[];
    private _parentToChildrenName: string;
    private _childToParentName: string;
    private _parentMap: { [key: string]: IEntityItem; };
    private _childMap: { [key: string]: IEntityItem[]; };
    private _saveParentFKey: string;
    private _saveChildFKey: string;
    private _debounce: Debounce;
    private _notifyBound: () => void;
    private _changed: {
        [key: string]: {
            children: IIndexer<IEntityItem>;
            parent: IEntityItem;
        };
    };

    constructor(options: IAssocConstructorOptions) {
        super();
        const self = this;
        this._objId = coreUtils.getNewID("ass");
        const opts: IAssocConstructorOptions = coreUtils.extend({
            dbContext: null,
            parentName: "",
            childName: "",
            parentKeyFields: [],
            childKeyFields: [],
            parentToChildrenName: null,
            childToParentName: null,
            name: this._objId,
            onDeleteAction: DELETE_ACTION.NoAction
        }, options);

        this._name = opts.name;
        this._dbContext = opts.dbContext;
        this._onDeleteAction = opts.onDeleteAction;
        this._parentDS = opts.dbContext.getDbSet(opts.parentName);
        this._childDS = opts.dbContext.getDbSet(opts.childName);
        this._parentFldInfos = opts.parentKeyFields.map((name) => {
            return self._parentDS.getFieldInfo(name);
        });
        this._childFldInfos = opts.childKeyFields.map((name) => {
            return self._childDS.getFieldInfo(name);
        });
        this._parentToChildrenName = opts.parentToChildrenName;
        this._childToParentName = opts.childToParentName;
        this._parentMap = {};
        this._childMap = {};
        this._bindParentDS();
        const changed1 = this._mapParentItems(this._parentDS.items);
        this._bindChildDS();
        const changed2 = this._mapChildren(this._childDS.items);
        this._saveParentFKey = null;
        this._saveChildFKey = null;
        this._debounce = new Debounce();
        this._changed = {};
        this._notifyBound = self._notify.bind(self);
        self._notifyParentChanged(changed1);
        self._notifyChildrenChanged(changed2);
    }
    public handleError(error: any, source: any): boolean {
        if (!this._dbContext)
            return super.handleError(error, source);
        else
            return this._dbContext.handleError(error, source);
    }
    protected _bindParentDS() {
        const self = this, ds = this._parentDS;
        if (!ds)
            return;
        ds.addOnCollChanged((sender, args) => {
            self._onParentCollChanged(args);
        }, self._objId, null, TPriority.High);
        ds.addOnBeginEdit((sender, args) => {
            self._onParentEdit(args.item, true, false);
        }, self._objId, null, TPriority.High);
        ds.addOnEndEdit((sender, args) => {
            self._onParentEdit(args.item, false, args.isCanceled);
        }, self._objId, null, TPriority.High);
        ds.addOnItemDeleting((sender, args) => {
        }, self._objId, null, TPriority.High);
        ds.addOnStatusChanged((sender, args) => {
            self._onParentStatusChanged(args.item, args.oldStatus);
        }, self._objId, null, TPriority.High);
        ds.addOnCommitChanges((sender, args) => {
            self._onParentCommitChanges(args.item, args.isBegin, args.isRejected, args.status);
        }, self._objId, null, TPriority.High);
    }
    protected _bindChildDS() {
        const self = this, ds = this._childDS;
        if (!ds)
            return;
        ds.addOnCollChanged((sender, args) => {
            self._onChildCollChanged(args);
        }, self._objId, null, TPriority.High);
        ds.addOnBeginEdit((sender, args) => {
            self._onChildEdit(args.item, true, false);
        }, self._objId, null, TPriority.High);
        ds.addOnEndEdit((sender, args) => {
            self._onChildEdit(args.item, false, args.isCanceled);
        }, self._objId, null, TPriority.High);
        ds.addOnStatusChanged((sender, args) => {
            self._onChildStatusChanged(args.item, args.oldStatus);
        }, self._objId, null, TPriority.High);
        ds.addOnCommitChanges((sender, args) => {
            self._onChildCommitChanges(args.item, args.isBegin, args.isRejected, args.status);
        }, self._objId, null, TPriority.High);
    }
    protected _onParentCollChanged(args: ICollChangedArgs<IEntityItem>) {
        const self = this, changedKeys: any = {};
        let item: IEntityItem, changed: string[] = [];
        switch (args.changeType) {
            case COLL_CHANGE_TYPE.Reset:
                changed = self.refreshParentMap();
                break;
            case COLL_CHANGE_TYPE.Add:
                changed = self._mapParentItems(args.items);
                break;
            case COLL_CHANGE_TYPE.Remove:
                args.items.forEach((item) => {
                    const key = self._unMapParentItem(item);
                    if (!!key) {
                        changedKeys[key] = null;
                    }
                });
                changed = Object.keys(changedKeys);
                break;
            case COLL_CHANGE_TYPE.Remap:
                {
                    if (!!args.old_key) {
                        item = this._parentMap[args.old_key];
                        if (!!item) {
                            delete this._parentMap[args.old_key];
                            changed = this._mapParentItems([item]);
                        }
                    }
                }
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
        }
        self._notifyParentChanged(changed);
    }
    protected _onParentEdit(item: IEntityItem, isBegin: boolean, isCanceled: boolean) {
        const self = this;
        if (isBegin) {
            self._storeParentFKey(item);
        }
        else {
            if (!isCanceled)
                self._checkParentFKey(item);
            else
                self._saveParentFKey = null;
        }
    }
    protected _onParentCommitChanges(item: IEntityItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS) {
        const self = this;
        let fkey: string;
        if (isBegin) {
            if (isRejected && status === ITEM_STATUS.Added) {
                fkey = this._unMapParentItem(item);
                if (!!fkey)
                    self._notifyParentChanged([fkey]);
                return;
            } else if (!isRejected && status === ITEM_STATUS.Deleted) {
                fkey = this._unMapParentItem(item);
                if (!!fkey)
                    self._notifyParentChanged([fkey]);
                return;
            }

            self._storeParentFKey(item);
        }
        else {
            self._checkParentFKey(item);
        }
    }
    protected _storeParentFKey(item: IEntityItem) {
        const self = this, fkey = self.getParentFKey(item);
        if (fkey !== null && !!self._parentMap[fkey]) {
            self._saveParentFKey = fkey;
        }
    }
    protected _checkParentFKey(item: IEntityItem) {
        const self = this, savedKey = self._saveParentFKey;
        let fkey: string;
        self._saveParentFKey = null;
        fkey = self.getParentFKey(item);
        if (fkey !== savedKey) {
            if (!!savedKey) {
                // first notify
                self._notifyChildrenChanged([savedKey]);
                self._notifyParentChanged([savedKey]);
                // then delete mapping
                delete self._parentMap[savedKey];
            }

            if (!!fkey) {
                self._mapParentItems([item]);
                self._notifyChildrenChanged([fkey]);
                self._notifyParentChanged([fkey]);
            }
        }
    }
    protected _onParentStatusChanged(item: IEntityItem, oldStatus: ITEM_STATUS) {
        const self = this, newStatus = item._aspect.status;
        let fkey: string = null;
        let children: IEntityItem[];
        if (newStatus === ITEM_STATUS.Deleted) {
            children = self.getChildItems(item);
            fkey = this._unMapParentItem(item);
            switch (self.onDeleteAction) {
                case DELETE_ACTION.NoAction:
                    // nothing
                    break;
                case DELETE_ACTION.Cascade:
                    children.forEach((child) => {
                        child._aspect.deleteItem();
                    });
                    break;
                case DELETE_ACTION.SetNulls:
                    children.forEach((child) => {
                        const isEdit = child._aspect.isEditing;
                        if (!isEdit)
                            child._aspect.beginEdit();
                        try {
                            self._childFldInfos.forEach((f) => {
                                (<any>child)[f.fieldName] = null;
                            });
                            if (!isEdit)
                                child._aspect.endEdit();
                        }
                        finally {
                            if (!isEdit)
                                child._aspect.cancelEdit();
                        }
                    });
                    break;
            }
            if (!!fkey) {
                self._notifyParentChanged([fkey]);
            }
        }
    }
    protected _onChildCollChanged(args: ICollChangedArgs<IEntityItem>) {
        const self = this, items = args.items, changedKeys = {};
        let item: IEntityItem, changed: string[] = [];
        switch (args.changeType) {
            case COLL_CHANGE_TYPE.Reset:
                changed = self.refreshChildMap();
                break;
            case COLL_CHANGE_TYPE.Add:
                changed = self._mapChildren(items);
                break;
            case COLL_CHANGE_TYPE.Remove:
                items.forEach(function (item) {
                    const key = self._unMapChildItem(item);
                    if (!!key) {
                        (<any>changedKeys)[key] = null;
                    }
                });
                changed = Object.keys(changedKeys);
                break;
            case COLL_CHANGE_TYPE.Remap:
                {
                    if (!!args.old_key) {
                        item = items[0];
                        if (!!item) {
                            const parentKey = item._aspect._getFieldVal(this._childToParentName);
                            if (!!parentKey) {
                                delete this._childMap[parentKey];
                                item._aspect._clearFieldVal(this._childToParentName);
                            }
                            changed = this._mapChildren([item]);
                        }
                    }
                }
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
        }
        self._notifyChildrenChanged(changed);
    }
    protected _notifyChildrenChanged(changed: string[]) {
        this._notifyChanged([], changed);
    }
    protected _notifyParentChanged(changed: string[]) {
        this._notifyChanged(changed, []);
    }
    protected _notifyChanged(changed_pkeys: string[], changed_ckeys: string[]) {
        const self = this;
        if (changed_pkeys.length > 0 || changed_ckeys.length > 0) {
            // parentToChildren
            changed_pkeys.forEach((key) => {
                const res = self._changed[key] || { children: {}, parent: null };
                const arr = self._childMap[key];
                if (!!arr) {
                    for (let i = 0; i < arr.length; i += 1) {
                        res.children[arr[i]._key] = arr[i];
                    }
                }
                self._changed[key] = res;
            });
            // childrenToParent
            changed_ckeys.forEach((key) => {
                const res = self._changed[key] || { children: {}, parent: null };
                const item = self._parentMap[key];
                if (!!item) {
                    res.parent = item;
                }
                self._changed[key] = res;
            });

            this._debounce.enque(this._notifyBound);
        }
    }
    private _notify() {
        const self = this, changed = self._changed;
        self._changed = {};
        try {
            // for loop is more performant than forEach
            const fkeys = Object.keys(changed);
            for (let k = 0; k < fkeys.length; k += 1) {
                const fkey = fkeys[k], map = changed[fkey];
                self._onParentChanged(fkey, map.children);
                if (!!map.parent) {
                    self._onChildrenChanged(fkey, map.parent);
                }
            }
        }
        catch (err) {
            self.handleError(err, self);
        }
    }
    protected _onChildEdit(item: IEntityItem, isBegin: boolean, isCanceled: boolean): void {
        const self = this;
        if (isBegin) {
            self._storeChildFKey(item);
        } else {
            if (!isCanceled) {
                self._checkChildFKey(item);
            } else {
                self._saveChildFKey = null;
            }
        }
    }
    protected _onChildCommitChanges(item: IEntityItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void {
        const self = this;
        let fkey: string;
        if (isBegin) {
            if (isRejected && status === ITEM_STATUS.Added) {
                fkey = this._unMapChildItem(item);
                if (!!fkey)
                    self._notifyChildrenChanged([fkey]);
                return;
            } else if (!isRejected && status === ITEM_STATUS.Deleted) {
                fkey = self._unMapChildItem(item);
                if (!!fkey)
                    self._notifyChildrenChanged([fkey]);
                return;
            }

            self._storeChildFKey(item);
        } else {
            self._checkChildFKey(item);
        }
    }
    protected _storeChildFKey(item: IEntityItem): void {
        const self = this, fkey = self.getChildFKey(item);
       
        if (!!fkey) {
            const arr: IEntityItem[] = self._childMap[fkey];
            if (!!arr && arr.indexOf(item) > -1) {
                self._saveChildFKey = fkey;
            }
        }
    }
    protected _checkChildFKey(item: IEntityItem): void {
        const self = this, savedKey = self._saveChildFKey, fkey = self.getChildFKey(item);
        self._saveChildFKey = null;
        if (fkey !== savedKey) {
            if (!!savedKey) {
                // first notify
                self._notifyParentChanged([savedKey]);
                self._notifyChildrenChanged([savedKey]);
                // then delete mapping
                const arr: IEntityItem[] = self._childMap[savedKey];
                arrHelper.remove(arr, item);
                if (arr.length === 0) {
                    delete self._childMap[savedKey];
                }
            }

            if (!!fkey) {
                self._mapChildren([item]);
                self._notifyParentChanged([fkey]);
                self._notifyChildrenChanged([fkey]);
            }
        }
    }
    protected _onChildStatusChanged(item: IEntityItem, oldStatus: ITEM_STATUS): void {
        const self = this, newStatus = item._aspect.status;
        let fkey = self.getChildFKey(item);
        if (!fkey)
            return;
        if (newStatus === ITEM_STATUS.Deleted) {
            fkey = self._unMapChildItem(item);
            if (!!fkey)
                self._notifyChildrenChanged([fkey]);
        }
    }
    protected _getItemKey(finf: IFieldInfo[], ds: TDbSet, item: IEntityItem): string {
        const arr: string[] = [], internal = ds._getInternal(), len = finf.length;
        for (let i = 0; i < len; i += 1) {
            const val = (<any>item)[finf[i].fieldName];
            const strval = internal.getStrValue(val, finf[i]);
            if (strval === null)
                return null;
            arr.push(strval);
        }
        return arr.join(";");
    }
    protected _resetChildMap(): void {
        const self = this, fkeys = Object.keys(this._childMap);
        this._childMap = {};
        self._notifyChildrenChanged(fkeys);
    }
    protected _resetParentMap(): void {
        const self = this, fkeys = Object.keys(this._parentMap);
        this._parentMap = {};
        self._notifyParentChanged(fkeys);
    }
    protected _unMapChildItem(item: IEntityItem) {
        let fkey: string, arr: IEntityItem[], idx: number, changedKey: string = null;
        fkey = this.getChildFKey(item);
        if (!!fkey) {
            arr = this._childMap[fkey];
            if (!!arr) {
                idx = arrHelper.remove(arr, item);
                if (idx > -1) {
                    if (arr.length === 0)
                        delete this._childMap[fkey];
                    changedKey = fkey;
                }
            }
        }
        return changedKey;
    }
    protected _unMapParentItem(item: IEntityItem) {
        let fkey: string, changedKey: string = null;
        fkey = this.getParentFKey(item);
        if (!!fkey && !!this._parentMap[fkey]) {
            delete this._parentMap[fkey];
            changedKey = fkey;
        }
        return changedKey;
    }
    protected _mapParentItems(items: IEntityItem[]) {
        const chngedKeys: any = {}, len = items.length;
        for (let i = 0; i < len; i += 1) {
            const item: IEntityItem = items[i];
            const status: ITEM_STATUS = item._aspect.status;
            if (status === ITEM_STATUS.Deleted)
                continue;
            const fkey: string = this.getParentFKey(item);
            if (!!fkey) {
                const old: IEntityItem = this._parentMap[fkey];
                if (old !== item) {
                    // map items by foreign keys
                    this._parentMap[fkey] = item;
                    chngedKeys[fkey] = null;
                }
            }
        }
        return Object.keys(chngedKeys);
    }
    protected _onChildrenChanged(fkey: string, parent: IEntityItem) {
        if (!!fkey && !!this._parentToChildrenName && !parent.getIsDestroyCalled()) {
            parent.raisePropertyChanged(this._parentToChildrenName);
        }
    }
    protected _onParentChanged(fkey: string, map: IIndexer<IEntityItem>) {
        const self = this;

        if (!!fkey && !!this._childToParentName) {
            const keys = Object.keys(map);
            for (let k = 0; k < keys.length; k += 1) {
                const item: IEntityItem = map[keys[k]];
                if (!item.getIsDestroyCalled())
                    item.raisePropertyChanged(self._childToParentName);
            }
        }
    }
    protected _mapChildren(items: IEntityItem[]) {
        const chngedKeys: any = {}, len = items.length;

        for (let i = 0; i < len; i += 1) {
            const item: IEntityItem = items[i];
            const status: ITEM_STATUS = item._aspect.status;
            if (status === ITEM_STATUS.Deleted)
                continue;
            const fkey: string = this.getChildFKey(item);
            if (!!fkey) {
                let arr: IEntityItem[] = this._childMap[fkey];
                if (!arr) {
                    arr = [];
                    this._childMap[fkey] = arr;
                }

                if (arr.indexOf(item) < 0) {
                    arr.push(item);
                    if (!chngedKeys[fkey])
                        chngedKeys[fkey] = null;
                }
            }
        }
        return Object.keys(chngedKeys);
    }
    protected _unbindParentDS() {
        const self = this, ds = this.parentDS;
        if (!ds) 
            return;
        ds.removeNSHandlers(self._objId);
    }
    protected _unbindChildDS() {
        const self = this, ds = this.childDS;
        if (!ds) return;
        ds.removeNSHandlers(self._objId);
    }
    protected refreshParentMap() {
        this._resetParentMap();
        return this._mapParentItems(this._parentDS.items);
    }
    protected refreshChildMap() {
        this._resetChildMap();
        return this._mapChildren(this._childDS.items);
    }
    getParentFKey(item: IEntityItem): string {
        if (!!item && item._aspect.isNew)
            return item._key;
        return this._getItemKey(this._parentFldInfos, this._parentDS, item);
    }
    getChildFKey(item: IEntityItem): string {
        if (!!item && !!this._childToParentName) {
            // _getFieldVal for childToParentName can store temporary parent's key (which is generated on the client)
            // we first check if it returns it
            const parentKey = item._aspect._getFieldVal(this._childToParentName);
            if (!!parentKey) {
                return parentKey;
            }
        }
        // if keys are permanent (stored to the server), then return normal foreign keys
        return this._getItemKey(this._childFldInfos, this._childDS, item);
    }
    isParentChild(parent: IEntityItem, child: IEntityItem): boolean {
        if (!parent || !child)
            return false;
        const fkey1 = this.getParentFKey(parent);
        if (!fkey1)
            return false;
        const fkey2 = this.getChildFKey(child);
        if (!fkey2)
            return false;
        return fkey1 === fkey2;
    }
    // get all childrens for parent item
    getChildItems(parent: IEntityItem): IEntityItem[] {
        let arr: IEntityItem[] = [];
        if (!parent) {
            return arr;
        }
        try {
            const fkey = this.getParentFKey(parent);
            arr = this._childMap[fkey];
        } catch (err) {
            utils.err.reThrow(err, this.handleError(err, this));
        }
        return (!arr) ? [] : arr;
    }
    // get the parent for child item
    getParentItem(item: IEntityItem): IEntityItem {
        let obj: IEntityItem = null;
        if (!item) {
            return obj;
        }
        try {
            const fkey = this.getChildFKey(item);
            obj = this._parentMap[fkey];
        } catch (err) {
            utils.err.reThrow(err, this.handleError(err, this));
        }
        return (!obj) ? null : obj;
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        this._debounce.destroy();
        this._debounce = null;
        this._changed = {};
        this._unbindParentDS();
        this._unbindChildDS();
        this._parentMap = null;
        this._childMap = null;
        this._parentFldInfos = null;
        this._childFldInfos = null;
        super.destroy();
    }
    toString() {
        return this._name;
    }
    get name() { return this._name; }
    get parentToChildrenName(): string { return this._parentToChildrenName; }
    get childToParentName(): string { return this._childToParentName; }
    get parentDS(): TDbSet { return this._parentDS; }
    get childDS(): TDbSet { return this._childDS; }
    get parentFldInfos(): IFieldInfo[] { return this._parentFldInfos; }
    get childFldInfos(): IFieldInfo[] { return this._childFldInfos; }
    get onDeleteAction(): DELETE_ACTION { return this._onDeleteAction; }
}