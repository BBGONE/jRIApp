/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IDisposable } from "../int";
import { Checks } from "./checks";

const { isNt } = Checks;

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
    dispose(): void {
        if (this.IsValueCreated) {
            if ("dispose" in this._val) {
                (<any>this._val).dispose();
            }
        }
        this._val = void 0;
        this._factory = null;
    }
    get Value(): T {
        if (this._val === null) {
            this._val = this._factory();
            if (isNt(this._val)) {
                throw new Error("Lazy: the value factory did'not returned an object");
            }
            // release the reference
            this._factory = null;
        }

        return this._val;
    }
    get IsValueCreated(): boolean {
        return !isNt(this._val);
    }
    getIsDisposed(): boolean {
        return this._val === void 0;
    }
}
