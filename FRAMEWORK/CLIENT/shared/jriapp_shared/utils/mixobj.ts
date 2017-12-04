/** The MIT License (MIT) Copyright(c) 2017 Maxim V.Tsapov */
import {
    IBaseObject, TErrorArgs, IObjectEvents, TAnyConstructor
} from "../int";
import { Checks } from "./checks";
import { ERROR } from "./error";
import { createWeakMap } from "./weakmap";
import { objSignature, createObjectEvents, dummyEvents, OBJ_EVENTS, ObjState } from "../object";

const checks = Checks, signature = objSignature, weakmap = createWeakMap();

interface IObjState {
    objState: ObjState;
    events: IObjectEvents;
}

/**
 * The function is used to make any class which has a constructor to become a BaseObject 
 * it is done by the way of mixing IBaseObject into the class implementation
 * For example: export const SomeNewObject = MixObject(SomeObject);
 * @param Base
 */
export function MixObject<T extends TAnyConstructor<{}>>(Base: T) {
    return class extends Base implements IBaseObject {
        constructor(...args: any[]) {
            super(...args);
            weakmap.set(this, { objState: ObjState.None, events: null });
        }
        isHasProp(prop: string): boolean {
            return checks.isHasProp(this, prop);
        }
        handleError(error: any, source: any): boolean {
            if (ERROR.checkIsDummy(error)) {
                return true;
            }
            if (!error.message) {
                error = new Error("Error: " + error);
            }
            const args: TErrorArgs = { error: error, source: source, isHandled: false };
            this.objEvents.raise(OBJ_EVENTS.error, args);
            let isHandled = args.isHandled;

            if (!isHandled) {
                isHandled = ERROR.handleError(this, error, source);
            }

            return isHandled;
        }
        getIsDisposed(): boolean {
            const state = <IObjState>weakmap.get(this);
            return !state || state.objState === ObjState.Disposed;
        }
        getIsStateDirty(): boolean {
            const state = <IObjState>weakmap.get(this);
            return !state || state.objState !== ObjState.None;
        }
        dispose(): void {
            const state = <IObjState>weakmap.get(this);
            if (!state || state.objState === ObjState.Disposed) {
                return;
            }
            try {
                if (!!state.events) {
                    state.events.raise(OBJ_EVENTS.disposed, {});
                    state.events.off();
                    state.events = null;
                }
            } finally {
                state.objState = ObjState.Disposed;
                weakmap.delete(this);
            }
        }
        get objEvents(): IObjectEvents {
            const state = <IObjState>weakmap.get(this);
            if (!state || state.objState === ObjState.Disposed) {
                return dummyEvents;
            }
            if (!state.events) {
                state.events = createObjectEvents(this);
            }
            return state.events;
        }
        get __objSig(): object {
            return signature;
        }
    }
}