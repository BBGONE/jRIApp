/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "../utils/utils";
import { ERRS } from "../lang";
import {
    COLL_CHANGE_REASON, COLL_CHANGE_TYPE, COLL_CHANGE_OPER
} from "./const";
import { IPropInfo, ICollectionItem } from "./int";
import { BaseCollection } from "./base";
import { BaseList, IListItem, IListItemConstructor } from "./list";

const utils = Utils, strUtils = utils.str, checks = utils.check, sys = utils.sys;

sys.getItemByProp = (obj: any, prop: string) => {
    if (obj instanceof BaseDictionary) {
        return (<BaseDictionary<IListItem, any>>obj).getItemByKey(prop);
    }
    else if (obj instanceof BaseCollection) {
        (<BaseCollection<ICollectionItem>>obj).getItemByPos(parseInt(prop, 10));
    }
    else
        return null;
};


export class BaseDictionary<TItem extends IListItem, TObj> extends BaseList<TItem, TObj>{
    private _keyName: string;
    constructor(itemType: IListItemConstructor<TItem, TObj>, keyName: string, props: IPropInfo[]) {
        if (!keyName)
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "keyName", keyName));
        super(itemType, props);
        this._keyName = keyName;
        let keyFld = this.getFieldInfo(keyName);
        if (!keyFld)
            throw new Error(strUtils.format(ERRS.ERR_DICTKEY_IS_NOTFOUND, keyName));
        keyFld.isPrimaryKey = 1;
    }
    protected _getNewKey(item: TItem) {
        if (!item || item._aspect.isNew) {
            return super._getNewKey(item);
        }
        let key = (<any>item)[this._keyName];
        if (checks.isNt(key))
            throw new Error(strUtils.format(ERRS.ERR_DICTKEY_IS_EMPTY, this.keyName));
        return "" + key;
    }
    //override
    protected _onItemAdded(item: TItem) {
        super._onItemAdded(item);
        let key = (<any>item)[this._keyName], self = this;
        if (checks.isNt(key))
            throw new Error(strUtils.format(ERRS.ERR_DICTKEY_IS_EMPTY, this.keyName));

        let oldkey = item._key, newkey = "" + key;
        if (oldkey !== newkey) {
            delete self._itemsByKey[oldkey];
            item._aspect.key = newkey;
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
        this.raisePropertyChanged("[" + item._key + "]");
    }
    //override
    protected _onRemoved(item: TItem, pos: number) {
        let key = (<any>item)[this._keyName];
        super._onRemoved(item, pos);
        this.raisePropertyChanged("[" + key + "]");
    }
    get keyName() {
        return this._keyName;
    }
    toString() {
        return "BaseDictionary";
    }
}