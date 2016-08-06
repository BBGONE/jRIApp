/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils as utils } from "../jriapp_utils/utils";
import { ERRS } from "../jriapp_core/lang";

import { IPropInfo } from "int";
import { BaseList, IListItem, IListItemConstructor } from "list";

const strUtils = utils.str, checks = utils.check;

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
            return null;
        }
        let key = (<any>item)[this._keyName];
        if (checks.isNt(key))
            throw new Error(strUtils.format(ERRS.ERR_DICTKEY_IS_EMPTY, this.keyName));
        return "" + key;
    }
    //override
    protected _onItemAdding(item: TItem) {
        super._onItemAdding(item);
        let key = (<any>item)[this._keyName];
        if (checks.isNt(key))
            throw new Error(strUtils.format(ERRS.ERR_DICTKEY_IS_EMPTY, this.keyName));
        item._aspect.key = key;
    }
    //override
    protected _onItemAdded(item: TItem) {
        super._onItemAdded(item);
        let key = (<any>item)[this._keyName];
        this.raisePropertyChanged("[" + key + "]");
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