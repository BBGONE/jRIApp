/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject }  from "../jriapp_core/object";

import { ICollectionItem, ITEM_EVENTS } from "int";
import { ItemAspect } from "aspect";

export class CollectionItem<TAspect extends ItemAspect<ICollectionItem>> extends BaseObject implements ICollectionItem {
    private __aspect: TAspect;
    
    constructor(aspect: TAspect) {
        super();
        this.__aspect = aspect;
    }
    protected _fakeDestroy() {
        this.raiseEvent(ITEM_EVENTS.destroyed, {});
        this.removeNSHandlers();
    }
    get _aspect() { return this.__aspect; }
    get _key(): string { return !!this.__aspect ? this.__aspect.key : null; }
    set _key(v: string) { if (!this.__aspect) return; this.__aspect.key = v; }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this.__aspect && this.__aspect.isCached) {
            try {
                if (!this.__aspect.getIsDestroyCalled()) {
                    this.__aspect.destroy();
                }
                this._fakeDestroy();
            }
            finally {
                this._isDestroyCalled = false;
            }
            return;
        }
        super.destroy();
    }
    toString() {
        return "CollectionItem";
    }
}