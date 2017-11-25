/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IBaseObject, IIndexer, TPriority, TEventHandler, TErrorHandler,
    TErrorArgs, TPropChangedHandler, IObjectEvents, IWeakMap
} from "./int";
import { ERRS } from "./lang";
import { SysUtils } from "./utils/sysutils";
import { Checks } from "./utils/checks";
import { StringUtils } from "./utils/strUtils";
import { CoreUtils } from "./utils/coreutils";
import { ERROR } from "./utils/error";
import { createWeakMap } from "./utils/weakmap";
import { EventHelper, IEventList } from "./utils/eventhelper";

const enum OBJ_EVENTS {
    error = "error",
    destroyed = "destroyed"
}

const checks = Checks, strUtils = StringUtils, coreUtils = CoreUtils,
    evHelper = EventHelper, sys = SysUtils, weakmap = createWeakMap();
//can be used in external IBaseObject implementations
export const objStateMap: IWeakMap = weakmap;

sys.isBaseObj = function (obj: any): boolean {
    return (!!obj && !!weakmap.get(obj));
};

const enum ObjState { None = 0, Disposing = 1, Disposed = 2 }

interface IObjState {
    objState: ObjState;
    events: IObjectEvents;
}

export class ObjectEvents implements IObjectEvents {
    private _events: IIndexer<IEventList>;
    private _owner: IBaseObject;

    constructor(owner: IBaseObject) {
        this._events = null;
        this._owner = owner;
    }
    canRaise(name: string): boolean {
        return evHelper.count(this._events, name) > 0;
    }
    on(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: object, priority?: TPriority): void {
        if (!this._events) {
            this._events = {};
        }
        evHelper.add(this._events, name, handler, nmspace, context, priority);
    }
    off(name?: string, nmspace?: string): void {
        if (!name && !nmspace) {
            this._events = null;
            return;
        }
        evHelper.remove(this._events, name, nmspace);
    }
    // remove event handlers by their namespace
    offNS(nmspace?: string): void {
        this.off(null, nmspace);
    }
    raise(name: string, args: any): void {
        if (!name) {
            throw new Error(ERRS.ERR_EVENT_INVALID);
        }
        evHelper.raise(this._owner, this._events, name, args);
    }
    raiseProp(name: string): void {
        if (!name) {
            throw new Error(ERRS.ERR_PROP_NAME_EMPTY);
        }
        //in case of complex name like: prop1.prop2.prop3
        const data = { property: name }, parts = name.split("."),
            lastProp = parts[parts.length - 1];
        if (parts.length > 1) {
            const owner = coreUtils.resolveOwner(this._owner, name);
            const state = <IObjState>weakmap.get(owner);
            if (!!state && !!state.events) {
                state.events.raiseProp(lastProp);
            }
        } else {
            evHelper.raiseProp(this._owner, this._events, lastProp, data);
        }
    }
    // to subscribe for changes on all properties, pass in the prop parameter: '*'
    onProp(prop: string, handler: TPropChangedHandler, nmspace?: string, context?: object, priority?: TPriority): void {
        if (!prop) {
            throw new Error(ERRS.ERR_PROP_NAME_EMPTY);
        }
        if (!this._events) {
            this._events = {};
        }
        evHelper.add(this._events, "0" + prop, handler, nmspace, context, priority);
    }
    offProp(prop?: string, nmspace?: string): void {
        if (!!prop) {
            evHelper.remove(this._events, "0" + prop, nmspace);
        } else {
            evHelper.removeNS(this._events, nmspace);
        }
    }
    addOnDisposed(handler: TEventHandler<any, any>, nmspace?: string, context?: object, priority?: TPriority): void {
        this.on(OBJ_EVENTS.destroyed, handler, nmspace, context, priority);
    }
    removeOnDisposed(nmspace?: string): void {
        this.off(OBJ_EVENTS.destroyed, nmspace);
    }
    addOnError(handler: TErrorHandler, nmspace?: string, context?: object, priority?: TPriority): void {
        this.on(OBJ_EVENTS.error, handler, nmspace, context, priority);
    }
    removeOnError(nmspace?: string): void {
        this.off(OBJ_EVENTS.error, nmspace);
    }
    get owner(): IBaseObject {
        return this._owner;
    }
}

export class BaseObject implements IBaseObject {
    constructor() {
        weakmap.set(this, { objState: ObjState.None, events: null });
    }
    protected setDisposing() {
        const state = <IObjState>weakmap.get(this);
        if (state.objState === ObjState.Disposed) {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "objState !== ObjState.Disposed"));
        }
        state.objState = ObjState.Disposing;
    }
    protected _createObjEvents(): IObjectEvents {
        return new ObjectEvents(this);
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
        return state.objState == ObjState.Disposed;
    }
    getIsStateDirty(): boolean {
        const state = <IObjState>weakmap.get(this);
        return state.objState !== ObjState.None;
    }
    dispose(): void {
        const state = <IObjState>weakmap.get(this);
        if (state.objState === ObjState.Disposed) {
            return;
        }
        state.objState = ObjState.Disposed;
        if (!!state.events) {
            try {
                state.events.raise(OBJ_EVENTS.destroyed, {});
            } finally {
                state.events.off();
            }
        }
    }
    get objEvents(): IObjectEvents {
        const state = <IObjState>weakmap.get(this);
        if (!state.events) {
            state.events = this._createObjEvents();
        }
        return state.events;
    }
}