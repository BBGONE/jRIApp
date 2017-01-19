/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject } from "../object";
import { ICollectionItem, ITEM_EVENTS } from "./int";
import { ItemAspect } from "./aspect";

export class CollectionItem<TAspect extends ItemAspect<ICollectionItem, any>> extends BaseObject implements ICollectionItem {
    private __aspect: TAspect;

    constructor(aspect: TAspect) {
        super();
        this.__aspect = aspect;
    }
    get _aspect() { return this.__aspect; }
    get _key(): string { return !this.__aspect ? null : this.__aspect.key; }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        const aspect = this.__aspect;
        
        if (!!aspect) {
            if (!aspect.getIsDestroyCalled()) {
                aspect.destroy();
            }
        }

        super.destroy();
    }
    toString() {
        return "CollectionItem";
    }
}