/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils } from "../utils/utils";
import { ERRS } from "../lang";
import {
    COLL_CHANGE_REASON, COLL_CHANGE_TYPE, COLL_CHANGE_OPER
} from "./const";
import { IPropInfo, ICollectionItem } from "./int";
import { CollUtils } from "./utils";
import { BaseCollection } from "./base";
import { BaseList, IListItem, ListItemAspect } from "./list";

const utils = Utils, strUtils = utils.str, checks = utils.check, sys = utils.sys, collUtils = CollUtils;

sys.getItemByProp = (obj: any, prop: string) => {
    if (obj instanceof BaseDictionary) {
        return (<BaseDictionary<IListItem, any>>obj).getItemByKey(prop);
    } else if (obj instanceof BaseCollection) {
        return (<BaseCollection<ICollectionItem>>obj).getItemByPos(parseInt(prop, 10));
    } else {
        return null;
    }
};


export abstract class BaseDictionary<TItem extends IListItem, TObj> extends BaseList<TItem, TObj> {
    private _keyName: string;

    constructor(keyName: string, props: IPropInfo[]) {
        if (!keyName) {
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "keyName", keyName));
        }
        super(props);
        this._keyName = keyName;
        const keyFld = this.getFieldInfo(keyName);
        if (!keyFld) {
            throw new Error(strUtils.format(ERRS.ERR_DICTKEY_IS_NOTFOUND, keyName));
        }
        keyFld.isPrimaryKey = 1;
    }
    // override
    protected createItem(obj?: TObj): TItem {
        const isNew = !obj, vals: any = isNew ? collUtils.initVals(this.getFieldInfos(), {}) : obj;
        let key: string;
        if (isNew) {
            key = this._getNewKey();
        } else {
            if (checks.isNt(vals[this._keyName])) {
                throw new Error(strUtils.format(ERRS.ERR_DICTKEY_IS_EMPTY, this._keyName));
            }
            key = "" + vals[this._keyName];
        }
        const aspect = new ListItemAspect<TItem, TObj>(this, vals, key, isNew);
        return aspect.item;
    }
    // override
    protected _onItemAdded(item: TItem) {
        super._onItemAdded(item);
        const key = (<any>item)[this._keyName], self = this;
        if (checks.isNt(key)) {
            throw new Error(strUtils.format(ERRS.ERR_DICTKEY_IS_EMPTY, this._keyName));
        }

        const oldkey = item._key, newkey = "" + key;
        if (oldkey !== newkey) {
            delete self._itemsByKey[oldkey];
            item._aspect._setKey(newkey);
            self._itemsByKey[item._key] = item;
            self._onCollectionChanged({
                changeType: COLL_CHANGE_TYPE.Remap,
                reason: COLL_CHANGE_REASON.None,
                oper: COLL_CHANGE_OPER.Commit,
                items: [item],
                old_key: oldkey,
                new_key: newkey
            });
        }
        this.objEvents.raiseProp(<any>`[${item._key}]`);
    }
    // override
    protected _onRemoved(item: TItem, pos: number) {
        const key = (<any>item)[this._keyName];
        super._onRemoved(item, pos);
        this.objEvents.raiseProp(<any>`[${key}]`);
    }
    get keyName() {
        return this._keyName;
    }
    toString() {
        return "BaseDictionary";
    }
}
