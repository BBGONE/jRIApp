/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    IBaseObject, IIndexer, TPriority, TEventHandler, TErrorHandler,
    TErrorArgs, TPropChangedHandler, IObjectEvents
} from "./int";
import { ERRS } from "./lang";
import { SysUtils } from "./utils/sysutils";
import { CoreUtils } from "./utils/coreutils";
import { Checks } from "./utils/checks";
import { ERROR } from "./utils/error";
import { EventHelper, IEventList } from "./utils/eventhelper";

const { isHasProp } = Checks, evHelper = EventHelper, sys = SysUtils, { Indexer } = CoreUtils,
    signature = { signature: "BaseObject" };

// it can be used in external IBaseObject implementations
export const objSignature: object = signature;

sys.isBaseObj = (obj: any): obj is IBaseObject => {
    return (!!obj && obj.__objSig === signature);
};

export const enum ObjState { None = 0, Disposing = 1, Disposed = 2 }

export const enum OBJ_EVENTS {
    error = "error",
    disposed = "disposed"
}

export function createObjectEvents(owner: IBaseObject): IObjectEvents {
    return new ObjectEvents(owner);
}

export const dummyEvents: IObjectEvents = {
    canRaise: (_name: string) => false,
    on: (_name: string, _handler: TEventHandler, _nmspace?: string, _context?: object, _priority?: TPriority): void => {
        throw new Error("Object disposed");
    },
    off: (_name?: string, _nmspace?: string): void => void 0,
    // remove event handlers by their namespace
    offNS: (_nmspace?: string): void => void 0,
    raise: (_name: string, _args: any): void => void 0,
    raiseProp: (_name: string): void => void 0,
    // to subscribe for changes on all properties, pass in the prop parameter: '*'
    onProp: (_prop: string, _handler: TPropChangedHandler, _nmspace?: string, _context?: object, _priority?: TPriority): void => {
        throw new Error("Object disposed");
    },
    offProp: (_prop?: string, _nmspace?: string): void => void 0,
    addOnDisposed: (_handler: TEventHandler<IBaseObject>, _nmspace?: string, _context?: object, _priority?: TPriority): void => {
        throw new Error("Object disposed");
    },
    offOnDisposed: (_nmspace?: string): void => {
        throw new Error("Object disposed");
    },
    addOnError: (_handler: TErrorHandler<IBaseObject>, _nmspace?: string, _context?: object, _priority?: TPriority): void => {
        throw new Error("Object disposed");
    },
    offOnError: (_nmspace?: string): void => {
        throw new Error("Object disposed");
    },
    get owner(): IBaseObject {
        return null;
    }
} as const;

export class ObjectEvents implements IObjectEvents {
    private _events: IIndexer<IEventList>;
    private _owner: IBaseObject;

    constructor(owner: IBaseObject) {
        this._events = null;
        this._owner = owner;
    }
    canRaise(name: string): boolean {
        return !!this._events && evHelper.count(this._events, name) > 0;
    }
    on(name: string, handler: TEventHandler, nmspace?: string, context?: object, priority?: TPriority): void {
        if (!this._events) {
            this._events = Indexer();
        }
        evHelper.add(this._events, name, handler, nmspace, context, priority);
    }
    off(name?: string, nmspace?: string): void {
        evHelper.remove(this._events, name, nmspace);
        if (!name && !nmspace) {
            this._events = null;
        }
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
        evHelper.raiseProp(this._owner, this._events, name, { property: name });
    }
    // to subscribe for changes on all properties, pass in the prop parameter: '*'
    onProp(prop: string, handler: TPropChangedHandler, nmspace?: string, context?: object, priority?: TPriority): void {
        if (!prop) {
            throw new Error(ERRS.ERR_PROP_NAME_EMPTY);
        }
        if (!this._events) {
            this._events = Indexer();
        }
        evHelper.add(this._events, "0" + prop, handler, nmspace, context, priority);
    }
    offProp(prop?: string, nmspace?: string): void {
        if (this._owner.getIsDisposed()) {
            return;
        }
        if (!!prop) {
            evHelper.remove(this._events, "0" + prop, nmspace);
        } else {
            evHelper.removeNS(this._events, nmspace);
        }
    }
    addOnDisposed(handler: TEventHandler<IBaseObject>, nmspace?: string, context?: object, priority?: TPriority): void {
        this.on(OBJ_EVENTS.disposed, handler, nmspace, context, priority);
    }
    offOnDisposed(nmspace?: string): void {
        this.off(OBJ_EVENTS.disposed, nmspace);
    }
    addOnError(handler: TErrorHandler<IBaseObject>, nmspace?: string, context?: object, priority?: TPriority): void {
        this.on(OBJ_EVENTS.error, handler, nmspace, context, priority);
    }
    offOnError(nmspace?: string): void {
        this.off(OBJ_EVENTS.error, nmspace);
    }
    get owner(): IBaseObject {
        return this._owner;
    }
}

export class BaseObject implements IBaseObject {
    private _objState: ObjState;
    private _objEvents: IObjectEvents;

    constructor() {
        this._objState = ObjState.None;
        this._objEvents = null;
    }
    protected setDisposing() {
        this._objState = ObjState.Disposing;
    }
    protected _createObjEvents(): IObjectEvents {
        return new ObjectEvents(this);
    }
    isHasProp(prop: string): boolean {
        return isHasProp(this, prop);
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
        return this._objState === ObjState.Disposed;
    }
    getIsStateDirty(): boolean {
        return this._objState !== ObjState.None;
    }
    dispose(): void {
        if (this._objState === ObjState.Disposed) {
            return;
        }
        try {
            if (!!this._objEvents) {
                this._objEvents.raise(OBJ_EVENTS.disposed, {});
                this._objEvents.off();
                this._objEvents = null;
            }
        } finally {
            this._objState = ObjState.Disposed;
        }
    }
    get objEvents(): IObjectEvents<this> {
        if (this._objState === ObjState.Disposed) {
            return dummyEvents;
        }
        if (!this._objEvents) {
            this._objEvents = this._createObjEvents();
        }
        return this._objEvents;
    }
    get __objSig(): object {
        return signature;
    }
}
