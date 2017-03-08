/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IDisposable } from "../int";
import { Checks } from "./checks";

const checks = Checks;

export type TValueFactory<T> = () => T;

export class Lazy<T> implements IDisposable {
    private _val: T = null;
    private _factory: TValueFactory<T>;

    constructor(factory: TValueFactory<T>) {
        this._factory = factory;
        if (!this._factory) {
            throw new Error("Lazy: Invalid value factory");
        }
    }
    public get Value(): T {
        if (this._val === null) {
            this._val = this._factory();
            if (checks.isNt(this._val)) {
                throw new Error("Lazy: the value factory did'not returned an object");
            }
            // release the reference
            this._factory = null;
        }

        return this._val;
    }
    public destroy() {
        if (this.IsValueCreated) {
            if ("destroy" in this._val) {
                (<any>this._val).destroy();
            }
        }
        this._val = void 0;
        this._factory = null;
    }
    get IsValueCreated(): boolean {
        return !checks.isNt(this._val);
    }
    get IsDestroyed(): boolean {
        return this._val === void 0;
    }
}
