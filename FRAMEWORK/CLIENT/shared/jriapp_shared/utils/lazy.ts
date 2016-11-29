/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { ILazyInitializer, IDisposable } from "../shared";

export class Lazy<T> implements IDisposable {
    private _val: T = null;
    private _factory: ILazyInitializer<T>;

    constructor(initializer: ILazyInitializer<T>) {
        this._factory = initializer;
    }
    public get Value(): T {
        if (this._val === null) {
            this._val = this._factory();
        }

        return this._val;
    }
    public destroy() {
        if (!this.getIsDestroyed()) {
            if ("destroy" in this._val) {
                (<any>this._val).destroy();
            }
            this._val = null;
        }
    }
    getIsDestroyed(): boolean {
        return this._val === null;
    }
    getIsDestroyCalled(): boolean {
        return this._val === null;
    }
}