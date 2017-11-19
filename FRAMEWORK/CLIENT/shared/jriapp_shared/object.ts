/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IBaseObject, IIndexer, TPriority, TEventHandler, TErrorHandler,
    TErrorArgs, TPropChangedHandler, TAnyConstructor
} from "./int";
import { ERRS } from "./lang";
import { SysUtils } from "./utils/sysutils";
import { Checks } from "./utils/checks";
import { StringUtils } from "./utils/strUtils";
import { CoreUtils } from "./utils/coreutils";
import { ERROR } from "./utils/error";
import { DEBUG } from "./utils/debug";
import { createWeakMap } from "./utils/weakmap";
import { EventHelper, IEventList } from "./utils/eventhelper";

const OBJ_EVENTS = {
    error: "error",
    destroyed: "destroyed"
};

const checks = Checks, strUtils = StringUtils, coreUtils = CoreUtils,
    evHelper = EventHelper, debug = DEBUG, sys = SysUtils, weakmap = createWeakMap();

sys.isBaseObj = function (obj: any): boolean {
    return (!!obj && !!weakmap.get(obj));
};

const enum ObjState { None = 0, DestroyCalled = 1, Destroyed = 2 }

interface IObjectState {
    objState: ObjState;
    events: IIndexer<IEventList>;
}

function fn_addHandler(obj: any, name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
    if (debug.isDebugging()) {
        if (!!name && obj._getEventNames().indexOf(name) < 0) {
            debug.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_EVENT_INVALID, name));
        }
    }
    const state = <IObjectState>weakmap.get(obj);
    if (state === void 0) {
        throw new Error("Using uninitialized object");
    }
    if (state.objState !== ObjState.None) {
        throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "this._obj_state !== ObjState.None"));
    }
    if (!state.events) {
        state.events = {};
    }
    evHelper.add(state.events, name, handler, nmspace, context, priority);
}

function fn_removeHandler(obj: any, name?: string, nmspace?: string): void {
    if (debug.isDebugging()) {
        if (!!name && obj._getEventNames().indexOf(name) < 0) {
            debug.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_EVENT_INVALID, name));
        }
    }
    const state = <IObjectState>weakmap.get(obj);
    evHelper.remove(state.events, name, nmspace);
}

function fn_isDestroyed(obj: any): boolean {
    const state = <IObjectState>weakmap.get(obj);
    return state.objState === ObjState.Destroyed;
}

function fn_isDestroyCalled(obj: any): boolean {
    const state = <IObjectState>weakmap.get(obj);
    return state.objState !== ObjState.None;
}

function fn_setIsDestroyCalled(obj: any, v: boolean) {
    const state = <IObjectState>weakmap.get(obj);
    if (state.objState === ObjState.Destroyed) {
        throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "this._obj_state !== ObjState.Destroyed"));
    }
    state.objState = !v ? ObjState.None : ObjState.DestroyCalled;
}

function fn_canRaiseEvent(obj: any,name: string): boolean {
    const state = <IObjectState>weakmap.get(obj);
    return evHelper.count(state.events, name) > 0;
}

function fn_raiseEvent(obj: any, name: string, args: any): void {
    const state = <IObjectState>weakmap.get(obj);
    if (!name) {
        throw new Error(ERRS.ERR_EVENT_INVALID);
    }
    evHelper.raise(obj, state.events, name, args);
}

function fn_raisePropChanged(obj: any, name: string): void {
    const state = <IObjectState>weakmap.get(obj);
    const data = { property: name }, parts = name.split("."), lastPropName = parts[parts.length - 1];
    if (parts.length > 1) {
        const owner = coreUtils.resolveOwner(obj, name);
        if (debug.isDebugging() && checks.isUndefined(owner)) {
            debug.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, name));
        }
        if (sys.isBaseObj(obj)) {
            (<IBaseObject>obj).raisePropertyChanged(lastPropName);
        }
    } else {
        if (debug.isDebugging() && !obj._isHasProp(lastPropName)) {
            debug.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, lastPropName));
        }
        evHelper.raiseProp(obj, state.events, lastPropName, data);
    }
}

function fn_addOnPropertyChange(obj: any, prop: string, handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
    const state = <IObjectState>weakmap.get(obj);
    if (!prop) {
        throw new Error(ERRS.ERR_PROP_NAME_EMPTY);
    }
    if (debug.isDebugging() && prop !== "*" && !obj._isHasProp(prop)) {
        debug.checkStartDebugger();
        throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, prop));
    }
    if (!state.events) {
        state.events = {};
    }
    evHelper.add(state.events, "0" + prop, handler, nmspace, context, priority);
}

function fn_removeOnPropertyChange(obj: any, prop?: string, nmspace?: string): void {
    const state = <IObjectState>weakmap.get(obj);
    if(!!prop) {
        if (debug.isDebugging() && prop !== "*" && !obj._isHasProp(prop)) {
            debug.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, prop));
        }
        evHelper.remove(state.events, "0" + prop, nmspace);
    } else {
        evHelper.removeNS(state.events, nmspace);
    }
}

/**
 * The function is used to make any object which has a constructor as a Framework's BaseObject by the way of mixing IBaseObject into the implementation
 * For example: export const SomeNewObject = MixedBaseObject(SomeObject);
 * @param Base
 */
export function MixedBaseObject<T extends TAnyConstructor<{}>>(Base: T) {
    return class extends Base implements IBaseObject {
        constructor(...args: any[]) {
            super(...args);
            weakmap.set(this, { objState: ObjState.None, events: null });
        }
        get _isDestroyed(): boolean {
            return fn_isDestroyed(this);
        }
        get _isDestroyCalled(): boolean {
            return fn_isDestroyCalled(this);
        }
        set _isDestroyCalled(v: boolean) {
            fn_setIsDestroyCalled(this, v);
        }
        _canRaiseEvent(name: string): boolean {
            return fn_canRaiseEvent(this, name);
        }
        _getEventNames(): string[] {
            return [OBJ_EVENTS.error, OBJ_EVENTS.destroyed];
        }
        _isHasProp(prop: string): boolean {
            return checks.isHasProp(this, prop);
        }
        handleError(error: any, source: any): boolean {
            if (ERROR.checkIsDummy(error)) {
                return true;
            }
            if (!error.message) {
                error = new Error("Unexpected Error: " + error);
            }
            const args: TErrorArgs = { error: error, source: source, isHandled: false }, state = <IObjectState>weakmap.get(this);
            evHelper.raise(this, state.events, OBJ_EVENTS.error, args);
            let isHandled = args.isHandled;

            if (!isHandled) {
                isHandled = ERROR.handleError(this, error, source);
            }

            return isHandled;
        }
        addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
            fn_addHandler(this, name, handler, nmspace, context, priority);
        }
        removeHandler(name?: string, nmspace?: string): void {
            fn_removeHandler(this, name, nmspace);
        }
        addOnDestroyed(handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
            fn_addHandler(this, OBJ_EVENTS.destroyed, handler, nmspace, context, priority);
        }
        removeOnDestroyed(nmspace?: string): void {
            fn_removeHandler(this, OBJ_EVENTS.destroyed, nmspace);
        }
        addOnError(handler: TErrorHandler, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
            fn_addHandler(this, OBJ_EVENTS.error, handler, nmspace, context, priority);
        }
        removeOnError(nmspace?: string): void {
            fn_removeHandler(this, OBJ_EVENTS.error, nmspace);
        }
        // remove event handlers by their namespace
        removeNSHandlers(nmspace?: string): void {
            fn_removeHandler(this, null, nmspace);
        }
        raiseEvent(name: string, args: any): void {
            fn_raiseEvent(this, name, args);
        }
        raisePropertyChanged(name: string): void {
            fn_raisePropChanged(this, name);
        }
        // to subscribe for the changes on all properties, pass in the prop parameter: '*'
        addOnPropertyChange(prop: string, handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
            fn_addOnPropertyChange(this, prop, handler, nmspace, context, priority);
        }
        removeOnPropertyChange(prop?: string, nmspace?: string): void {
            fn_removeOnPropertyChange(this, prop, nmspace);
        }
        getIsDestroyed(): boolean {
            return fn_isDestroyed(this);
        }
        getIsDestroyCalled(): boolean {
            return fn_isDestroyCalled(this);
        }
        destroy(): void {
            const state = <IObjectState>weakmap.get(this);
            if (state.objState === ObjState.Destroyed) {
                return;
            }
            state.objState = ObjState.Destroyed;
            try {
                fn_raiseEvent(this, OBJ_EVENTS.destroyed, {});
            } finally {
                state.events = null;
            }
        }
    }
}

/**
 * Instead of mixing IBaseObject into some class You can derive your class from this BaseObject
 */
export class BaseObject implements IBaseObject {
    constructor() {
        weakmap.set(this, { objState: ObjState.None, events: null });
    }
    protected get _isDestroyed(): boolean {
        return fn_isDestroyed(this);
    }
    protected get _isDestroyCalled(): boolean {
        return fn_isDestroyCalled(this);
    }
    protected set _isDestroyCalled(v: boolean) {
        fn_setIsDestroyCalled(this, v);
    }
    protected _canRaiseEvent(name: string): boolean {
        return fn_canRaiseEvent(this, name);
    }
    _getEventNames(): string[] {
        return [OBJ_EVENTS.error, OBJ_EVENTS.destroyed];
    }
    _isHasProp(prop: string): boolean {
        return checks.isHasProp(this, prop);
    }
    handleError(error: any, source: any): boolean {
        if (ERROR.checkIsDummy(error)) {
            return true;
        }
        if (!error.message) {
            error = new Error("Unexpected Error: " + error);
        }
        const args: TErrorArgs = { error: error, source: source, isHandled: false }, state = <IObjectState>weakmap.get(this);
        evHelper.raise(this, state.events, OBJ_EVENTS.error, args);
        let isHandled = args.isHandled;

        if (!isHandled) {
            isHandled = ERROR.handleError(this, error, source);
        }

        return isHandled;
    }
    addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
        fn_addHandler(this, name, handler, nmspace, context, priority);
    }
    removeHandler(name?: string, nmspace?: string): void {
        fn_removeHandler(this, name, nmspace);
    }
    addOnDestroyed(handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
        fn_addHandler(this, OBJ_EVENTS.destroyed, handler, nmspace, context, priority);
    }
    removeOnDestroyed(nmspace?: string): void {
        fn_removeHandler(this, OBJ_EVENTS.destroyed, nmspace);
    }
    addOnError(handler: TErrorHandler, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
        fn_addHandler(this, OBJ_EVENTS.error, handler, nmspace, context, priority);
    }
    removeOnError(nmspace?: string): void {
        fn_removeHandler(this, OBJ_EVENTS.error, nmspace);
    }
    // remove event handlers by their namespace
    removeNSHandlers(nmspace?: string): void {
        fn_removeHandler(this, null, nmspace);
    }
    raiseEvent(name: string, args: any): void {
        fn_raiseEvent(this, name, args);
    }
    raisePropertyChanged(name: string): void {
        fn_raisePropChanged(this, name);
    }
    // to subscribe for the changes on all properties, pass in the prop parameter: '*'
    addOnPropertyChange(prop: string, handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
        fn_addOnPropertyChange(this, prop, handler, nmspace, context, priority);
    }
    removeOnPropertyChange(prop?: string, nmspace?: string): void {
        fn_removeOnPropertyChange(this, prop, nmspace);
    }
    getIsDestroyed(): boolean {
        return fn_isDestroyed(this);
    }
    getIsDestroyCalled(): boolean {
        return fn_isDestroyCalled(this);
    }
    destroy(): void {
        const state = <IObjectState>weakmap.get(this);
        if (state.objState === ObjState.Destroyed) {
            return;
        }
        state.objState = ObjState.Destroyed;
        try {
            fn_raiseEvent(this, OBJ_EVENTS.destroyed, {});
        } finally {
            state.events = null;
        }
    }
  }