/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { BaseObject }  from "../jriapp_core/object";

import { ICollectionItem, ITEM_EVENTS } from "int";
import { ItemAspect } from "aspect";

export class CollectionItem<TAspect extends ItemAspect<ICollectionItem>> extends BaseObject implements ICollectionItem {
    private __aspect: TAspect;
    private __isCached: boolean;
    private __isDetached: boolean;

    constructor(aspect: TAspect) {
        super();
        this.__aspect = aspect;
        this.__isCached = false;
        this.__isDetached = false;
    }
    protected _fakeDestroy() {
        this.raiseEvent(ITEM_EVENTS.destroyed, {});
        this.removeNSHandlers();
    }
    get _aspect() { return this.__aspect; }
    get _key(): string { return !!this.__aspect ? this.__aspect.key : null; }
    set _key(v: string) { if (!this.__aspect) return; this.__aspect.key = v; }
    get _isCached(): boolean { return this.__isCached; }
    set _isCached(v: boolean) { this.__isCached = v; }
    get _isDetached(): boolean { return this.__isDetached; }
    set _isDetached(v: boolean) { this.__isDetached = v; }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (this.__isCached) {
            try {
                if (!!this.__aspect && !this.__aspect.getIsDestroyCalled()) {
                    this.__aspect.destroy();
                }
                this._fakeDestroy();
            }
            finally {
                this._isDestroyCalled = false;
            }
            return;
        }
        this.__isCached = false;
        super.destroy();
    }
    toString() {
        return "CollectionItem";
    }
}