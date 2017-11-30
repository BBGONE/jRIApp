/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject } from "../object";
import { ICollectionItem } from "./int";
import { ItemAspect } from "./aspect";

export class CollectionItem<TAspect extends ItemAspect<ICollectionItem, any>> extends BaseObject implements ICollectionItem {
    private __aspect: TAspect;

    constructor(aspect: TAspect) {
        super();
        this.__aspect = aspect;
    }
    get _aspect(): TAspect {
        return this.__aspect;
    }
    get _key(): string {
        return this.__aspect.key;
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        const aspect = this.__aspect;
        if (!aspect.getIsStateDirty()) {
            aspect.dispose();
        }
        super.dispose();
    }
    toString(): string {
        return "CollectionItem";
    }
}
