/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IDisposable } from "../int";

export type TValueFactory<T> = () => T;

export class Lazy<T> implements IDisposable {
    private _val: T = null;
    private _factory: TValueFactory<T>;

    constructor(factory: TValueFactory<T>) {
        this._factory = factory;
    }
    public get Value(): T {
        if (this._val === null) {
            this._val = this._factory();
        }

        return this._val;
    }
    public destroy() {
        if (this.IsValueCreated) {
            if ("destroy" in this._val) {
                (<any>this._val).destroy();
            }
            this._val = void 0;
        }
    }
    get IsValueCreated(): boolean {
        return !!this._val;
    }
}