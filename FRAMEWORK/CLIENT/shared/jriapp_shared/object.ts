/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IBaseObject, IIndexer, TPriority, TEventHandler, TErrorHandler,
    TErrorArgs, TPropChangedHandler
} from "./int";
import { ERRS } from "./lang";
import { SysUtils } from "./utils/sysutils";
import { Checks } from "./utils/checks";
import { StringUtils } from "./utils/strUtils";
import { CoreUtils } from "./utils/coreutils";
import { ERROR } from "./utils/error";
import { DEBUG } from "./utils/debug";
import { EventHelper, IEventList } from "./utils/eventhelper";

const OBJ_EVENTS = {
    error: "error",
    destroyed: "destroyed"
};

const checks = Checks, strUtils = StringUtils, coreUtils = CoreUtils,
    evHelper = EventHelper, debug = DEBUG, sys = SysUtils;

sys.isBaseObj = function (obj: any): boolean {
    return (!!obj && obj instanceof BaseObject);
};

const enum ObjState { None = 0, DestroyCalled = 1, Destroyed = 2 }

export class BaseObject implements IBaseObject {
    private _objState: ObjState;
    private _events: IIndexer<IEventList>;

    constructor() {
        this._objState = ObjState.None;
        this._events = null;
    }
    protected _getEventNames(): string[] {
        return [OBJ_EVENTS.error, OBJ_EVENTS.destroyed];
    }
    protected _addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
        if (this._objState === void 0) {
            throw new Error("Using uninitialized object");
        }
        if (this._objState !== ObjState.None) {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "this._obj_state !== ObjState.None"));
        }
        if (debug.isDebugging()) {
            if (!!name && this._getEventNames().indexOf(name) < 0) {
                debug.checkStartDebugger();
                throw new Error(strUtils.format(ERRS.ERR_EVENT_INVALID, name));
            }
        }
        if (!this._events) {
            this._events = {};
        }
        evHelper.add(this._events, name, handler, nmspace, context, priority);
    }
    protected _removeHandler(name?: string, nmspace?: string): void {
        evHelper.remove(this._events, name, nmspace);
    }
    protected get _isDestroyed(): boolean {
        return this._objState === ObjState.Destroyed;
    }
    protected get _isDestroyCalled(): boolean {
        return this._objState !== ObjState.None;
    }
    protected set _isDestroyCalled(v) {
        if (this._objState === ObjState.Destroyed) {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "this._obj_state !== ObjState.Destroyed"));
        }
        this._objState = !v ? ObjState.None : ObjState.DestroyCalled;
    }
    protected _canRaiseEvent(name: string): boolean {
        return evHelper.count(this._events, name) > 0;
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
        const args: TErrorArgs = { error: error, source: source, isHandled: false };
        evHelper.raise(this, this._events, OBJ_EVENTS.error, args);
        let isHandled = args.isHandled;

        if (!isHandled) {
            isHandled = ERROR.handleError(this, error, source);
        }

        return isHandled;
    }
    addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
        this._addHandler(name, handler, nmspace, context, priority);
    }
    removeHandler(name?: string, nmspace?: string): void {
        if (debug.isDebugging() && !!name && this._getEventNames().indexOf(name) < 0) {
            debug.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_EVENT_INVALID, name));
        }
        this._removeHandler(name, nmspace);
    }
    addOnDestroyed(handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
        this._addHandler(OBJ_EVENTS.destroyed, handler, nmspace, context, priority);
    }
    removeOnDestroyed(nmspace?: string): void {
        evHelper.remove(this._events, OBJ_EVENTS.destroyed, nmspace);
    }
    addOnError(handler: TErrorHandler, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
        this._addHandler(OBJ_EVENTS.error, handler, nmspace, context, priority);
    }
    removeOnError(nmspace?: string): void {
        evHelper.remove(this._events, OBJ_EVENTS.error, nmspace);
    }
    // remove event handlers by their namespace
    removeNSHandlers(nmspace?: string): void {
        evHelper.remove(this._events, null, nmspace);
    }
    raiseEvent(name: string, args: any): void {
        if (!name) {
            throw new Error(ERRS.ERR_EVENT_INVALID);
        }
        evHelper.raise(this, this._events, name, args);
    }
    raisePropertyChanged(name: string): void {
        const data = { property: name }, parts = name.split("."), lastPropName = parts[parts.length - 1];
        if (parts.length > 1) {
            const obj = coreUtils.resolveOwner(this, name);
            if (debug.isDebugging() && checks.isUndefined(obj)) {
                debug.checkStartDebugger();
                throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, name));
            }
            if (sys.isBaseObj(obj)) {
                (<IBaseObject>obj).raisePropertyChanged(lastPropName);
            }
        } else {
            if (debug.isDebugging() && !this._isHasProp(lastPropName)) {
                debug.checkStartDebugger();
                throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, lastPropName));
            }
            evHelper.raiseProp(this, this._events, lastPropName, data);
        }
    }
    // to subscribe for the changes on all properties, pass in the prop parameter: '*'
    addOnPropertyChange(prop: string, handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
        if (!prop) {
            throw new Error(ERRS.ERR_PROP_NAME_EMPTY);
        }
        if (debug.isDebugging() && prop !== "*" && !this._isHasProp(prop)) {
            debug.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, prop));
        }
        if (!this._events) {
            this._events = {};
        }
        evHelper.add(this._events, "0" + prop, handler, nmspace, context, priority);
    }
    removeOnPropertyChange(prop?: string, nmspace?: string): void {
        if (!!prop) {
            if (debug.isDebugging() && prop !== "*" && !this._isHasProp(prop)) {
                debug.checkStartDebugger();
                throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, prop));
            }
            evHelper.remove(this._events, "0" + prop, nmspace);
        } else {
            evHelper.removeNS(this._events, nmspace);
        }
    }
    getIsDestroyed(): boolean {
        return this._objState === ObjState.Destroyed;
    }
    getIsDestroyCalled(): boolean {
        return this._objState !== ObjState.None;
    }
    destroy(): void {
        if (this._objState === ObjState.Destroyed) {
            return;
        }
        this._objState = ObjState.Destroyed;
        try {
            evHelper.raise(this, this._events, OBJ_EVENTS.destroyed, {});
        } finally {
            this._events = null;
        }
    }
}
