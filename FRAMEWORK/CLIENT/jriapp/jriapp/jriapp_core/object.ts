/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IBaseObject, IIndexer, IList, IListNode, TEventHandler, TErrorHandler, TErrorArgs, TPropChangedHandler } from "shared";
import { ERRS } from "lang";
import { SysChecks, Checks as checks, StringUtils as strUtils, CoreUtils as coreUtils, ERROR, DEBUG } from "../jriapp_utils/coreutils";
import { ListHelper } from "../jriapp_utils/listhelper";

const OBJ_EVENTS = {
    error: "error",
    destroyed: "destroyed"
};

SysChecks._isBaseObj = function (obj: any): boolean {
    return (!!obj && obj instanceof BaseObject);
}

const enum ObjState { None = 0, DestroyCalled = 1, Destroyed = 2 }

export class BaseObject implements IBaseObject {
    private _obj_state: ObjState;
    private _events: IIndexer<IList>;

    constructor() {
        this._obj_state = ObjState.None;
        this._events = null;
    }

    private _removeNsHandler(ev: IIndexer<IList>, ns: string) {
        let keys = Object.keys(ev), key: string, list: IList;
        for (let i = 0, k = keys.length; i < k; ++i) {
            key = keys[i];
            list = ev[key];
            if (!!list) {
                ListHelper.removeNodes(list, ns);
            }
        }
    }
    protected _getEventNames(): string[] {
        return [OBJ_EVENTS.error, OBJ_EVENTS.destroyed];
    }
    protected _addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void {
        if (this._isDestroyed)
            return;

        if (!checks.isFunc(handler)) {
            throw new Error(ERRS.ERR_EVENT_INVALID_FUNC);
        }

        if (!name)
            throw new Error(strUtils.format(ERRS.ERR_EVENT_INVALID, name));

        if (this._events === null)
            this._events = {};
        let self = this, ev = self._events, n = name, ns = "*";

        if (!!nmspace)
            ns = "" + nmspace;

        let list = ev[n], node: IListNode = ListHelper.CreateNode(handler, ns, context);

        if (!list) {
            ev[n] = list = ListHelper.CreateList();
        }

        ListHelper.appendNode(list, node, ns, prepend);
    }
    protected _removeHandler(name?: string, nmspace?: string): void {
        let self = this, ev = self._events, ns = "*";
        if (!ev)
            return;

        if (!!nmspace)
            ns = "" + nmspace;
        let list: IList;

        //arguments supplied is name (and optionally nmspace)
        if (!!name) {
            list = ev[name];
            if (!list)
                return;
            if (ns === "*") {
                ListHelper.removeNodes(list, ns);
                ev[name] = null;
            }
            else {
                ListHelper.removeNodes(list, ns);
            }
            return;
        }

        this._removeNsHandler(ev, ns);

        if (ns === "*") {
            //no arguments supplied
            self._events = null;
        }
    }
    protected _raiseEvent(name: string, args: any): void {
        let self = this, ev = self._events;
        if (ev === null)
            return;
        if (ev === undefined) {
            throw new Error("The object's constructor has not been called!");
        }

        if (!!name) {
            let isPropChange = name.charAt(0) === "0", isAllProp = name === "0*";

            //if an object's property changed
            if (isPropChange && !isAllProp) {
                //recursive call
                //notify clients who subscribed for all property changes
                this._raiseEvent("0*", args);
            }

            let events = ListHelper.toArray(ev[name]), cur: IListNode;
            for (let i = 0; i < events.length; i++) {
                cur = events[i];
                cur.fn.apply(cur.context, [self, args]);
            }
        }
    }
    protected _checkEventName(name: string): void {
        let proto = Object.getPrototypeOf(this), map: IIndexer<boolean>;
        //cache events' names in object's prototype
        if (!proto.hasOwnProperty("__evMap")) {
            let evn = this._getEventNames();
            map = {};
            for (let i = 0; i < evn.length; i++) {
                map[evn[i]] = true;
            }
            proto.__evMap = map;
        }
        else
            map = proto.__evMap;

        if (!map[name]) {
            DEBUG.checkStartDebugger();
            let err = new Error(strUtils.format(ERRS.ERR_EVENT_INVALID, name));
            this.handleError(err, this);
            throw err;
        }
    }
    protected get _isDestroyed(): boolean {
        return this._obj_state === ObjState.Destroyed;
    }
    protected get _isDestroyCalled(): boolean {
        return this._obj_state !== ObjState.None;
    }
    protected set _isDestroyCalled(v) {
        if (this._obj_state === ObjState.Destroyed) {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "this._obj_state !== ObjState.Destroyed"));
        }
        this._obj_state = !v ? ObjState.None : ObjState.DestroyCalled;
    }
    _isHasProp(prop: string): boolean {
        return checks.isHasProp(this, prop);
    }
    handleError(error: any, source: any): boolean {
        if (ERROR.checkIsDummy(error)) {
            return true;
        }
        if (!error.message) {
            error = new Error("Unknown Error: " + error);
        }
        let args: TErrorArgs = { error: error, source: source, isHandled: false };
        this._raiseEvent(OBJ_EVENTS.error, args);
        return args.isHandled;
    }
    raisePropertyChanged(name: string): void {
        let data = { property: name };
        let parts = name.split("."), lastPropName = parts[parts.length - 1];
        if (parts.length > 1) {
            let obj = coreUtils.resolveOwner(this, name);
            if (DEBUG.isDebugging() && checks.isUndefined(obj)) {
                DEBUG.checkStartDebugger();
                throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, name));
            }
            if (obj instanceof BaseObject) {
                (<BaseObject>obj).raiseEvent("0" + lastPropName, data);
            }
        }
        else {
            if (DEBUG.isDebugging() && !this._isHasProp(lastPropName)) {
                DEBUG.checkStartDebugger();
                throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, lastPropName));
            }
            this.raiseEvent("0" + lastPropName, data);
        }
    }
    addHandler(name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void {
        this._checkEventName(name);
        this._addHandler(name, handler, nmspace, context, prepend);
    }
    removeHandler(name?: string, nmspace?: string): void {
        if (!!name) {
            this._checkEventName(name);
        }
        this._removeHandler(name, nmspace);
    }
    addOnDestroyed(handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject): void {
        this._addHandler(OBJ_EVENTS.destroyed, handler, nmspace, context, false);
    }
    removeOnDestroyed(nmspace?: string): void {
        this._removeHandler(OBJ_EVENTS.destroyed, nmspace);
    }
    addOnError(handler: TErrorHandler, nmspace?: string, context?: IBaseObject): void {
        this._addHandler(OBJ_EVENTS.error, handler, nmspace, context, false);
    }
    removeOnError(nmspace?: string): void {
        this._removeHandler(OBJ_EVENTS.error, nmspace);
    }
    //remove event handlers by their namespace
    removeNSHandlers(nmspace?: string): void {
        this._removeHandler(null, nmspace);
    }
    raiseEvent(name: string, args: any): void {
        if (!name)
            throw new Error(ERRS.ERR_EVENT_INVALID);
        if (name.charAt(0) !== "0")
            this._checkEventName(name);
        this._raiseEvent(name, args);
    }
    //to subscribe fortthe changes on all properties, pass in the prop parameter: '*'
    addOnPropertyChange(prop: string, handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void {
        if (!prop)
            throw new Error(ERRS.ERR_PROP_NAME_EMPTY);
        if (DEBUG.isDebugging() && prop !== "*" && !this._isHasProp(prop)) {
            DEBUG.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, prop));
        }
        prop = "0" + prop;
        this._addHandler(prop, handler, nmspace, context, false);
    }
    removeOnPropertyChange(prop?: string, nmspace?: string): void {
        if (!!prop) {
            if (DEBUG.isDebugging() && prop !== "*" && !this._isHasProp(prop)) {
                DEBUG.checkStartDebugger();
                throw new Error(strUtils.format(ERRS.ERR_PROP_NAME_INVALID, prop));
            }
            prop = "0" + prop;
        }
        this._removeHandler(prop, nmspace);
    }
    getIsDestroyed(): boolean {
        return this._obj_state === ObjState.Destroyed;
    }
    getIsDestroyCalled(): boolean {
        return this._obj_state !== ObjState.None;
    }
    destroy(): void {
        if (this._obj_state === ObjState.Destroyed)
            return;
        this._obj_state = ObjState.Destroyed;
        try {
            this._raiseEvent(OBJ_EVENTS.destroyed, {});
        }
        finally {
            this._removeHandler(null, null);
        }
    }
}