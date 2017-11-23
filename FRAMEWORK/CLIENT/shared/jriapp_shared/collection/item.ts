/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject } from "../object";
import { ICollectionItem } from "./int";
import { ItemAspect } from "./aspect";
import { createWeakMap } from "../utils/weakmap";

const weakmap = createWeakMap();

export class CollectionItem<TAspect extends ItemAspect<ICollectionItem, any>> extends BaseObject implements ICollectionItem {
    constructor(aspect: TAspect) {
        super();
        weakmap.set(this, aspect);
    }
    get _aspect(): TAspect {
        return <TAspect>weakmap.get(this);
    }
    get _key(): string {
        return this._aspect.key;
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        const aspect = this._aspect;
        if (!aspect.getIsStateDirty()) {
            aspect.dispose();
        }
        super.dispose();
    }
    toString(): string {
        return "CollectionItem";
    }
}
