/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject } from "../object";
import { ICollectionItem } from "./int";
import { ItemAspect } from "./aspect";

export class CollectionItem<TAspect extends ItemAspect<ICollectionItem, any>> extends BaseObject implements ICollectionItem {
    private _aspectPrivate: TAspect;

    constructor(aspect: TAspect) {
        super();
        this._aspectPrivate = aspect;
    }
    get _aspect(): TAspect { return this._aspectPrivate; }
    get _key(): string { return !this._aspectPrivate ? null : this._aspectPrivate.key; }

    destroy(): void {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        const aspect: TAspect = this._aspectPrivate;
        if (!!aspect) {
            if (!aspect.getIsDestroyCalled()) {
                aspect.destroy();
            }
        }
        super.destroy();
    }
    toString(): string {
        return "CollectionItem";
    }
}
