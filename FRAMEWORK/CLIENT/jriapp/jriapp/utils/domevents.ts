/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IIndexer, Utils, LocaleERRS, createWeakMap, IWeakMap
} from "jriapp_shared";

const utils = Utils, checks = utils.check, arrHelper = utils.arr,
    strUtils = utils.str, debug = utils.debug, ERRS = LocaleERRS;

//stores listener and event name
export type TEventNode = { fn: THandlerFunc; name: string; useCapture?: boolean };

export type TEventNodeArray = TEventNode[];

export interface INamespaceMap {
    [ns: string]: TEventNodeArray;
}

export type TEventList = INamespaceMap;

export class EventWrap {
    private _ev: Event;
    private _target: TDomElement;

    constructor(ev: Event, target: TDomElement) {
        this._ev = ev;
        this._target = target;
    }
    get type() {
        return this._ev.type;
    }
    get target() {
        return this._target;
    }
    get bubbles() {
        return this._ev.bubbles;
    }
    get defaultPrevented() {
        return this._ev.defaultPrevented;
    }
    get cancelable() {
        return this._ev.cancelable;
    }
    get isTrusted() {
        return this._ev.isTrusted;
    }
    get returnValue() {
        return this._ev.returnValue;
    }
    set returnValue(v: boolean) {
        this._ev.returnValue = v;
    }
    get srcElement() {
        return this._ev.srcElement;
    }
    get eventPhase() {
        return this._ev.eventPhase;
    }
    get cancelBubble() {
        return this._ev.cancelBubble;
    }
    set cancelBubble(v: boolean) {
        this._ev.cancelBubble = v;
    }
    get timeStamp() {
        return this._ev.timeStamp;
    }
    get currentTarget() {
        return this._ev.currentTarget;
    }
    get originalEvent() {
        return this._ev;
    }
    get AT_TARGET() {
        return this._ev.AT_TARGET;
    }
    get BUBBLING_PHASE() {
        return this._ev.BUBBLING_PHASE;
    }
    get CAPTURING_PHASE() {
        return this._ev.CAPTURING_PHASE;
    }

    preventDefault() { this._ev.preventDefault(); }
    stopPropagation() { this._ev.stopPropagation(); }
    stopImmediatePropagation() { this._ev.stopImmediatePropagation(); }
}

class EventHelper {
    static Node(handler: THandlerFunc, name: string, useCapture?: boolean): TEventNode {
        return { fn: handler, name: name, useCapture: useCapture };
    }
    static add(ev: TEventList, name: string, handler: THandlerFunc, nmspace: string, useCapture?: boolean): void {
        if (!ev) {
            debug.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "ev is a valid object"));
        }
        if (!checks.isFunc(handler)) {
            throw new Error(ERRS.ERR_EVENT_INVALID_FUNC);
        }

        if (!name)
            throw new Error(strUtils.format(ERRS.ERR_EVENT_INVALID, "[Empty]"));

        const ns = !nmspace ? "*" : "" + nmspace;

        let list = ev[ns], node: TEventNode = EventHelper.Node(handler, name, useCapture);

        if (!list) {
            ev[ns] = list = [];
        }

        list.push(node);
    }
    static getNS(ev: TEventList, ns: string): TEventNodeArray {
        if (!ev)
            return [];
        const res: TEventNodeArray = [], list = ev[ns];
        if (!list)
            return res;
        for (let k = 0; k < list.length; ++k) {
            res.push(list[k]);
        }
        return res;
    }
    static removeNS(ev: TEventList, name: string, ns: string): TEventNodeArray {
        if (!ev)
            return [];
        const res: TEventNodeArray = [], list = ev[ns];
        if (!list)
            return res;

        if (!name) {
            delete ev[ns];
            return list;
        }

        const newArr: TEventNodeArray = [];
        for (let k = 0; k < list.length; ++k) {
            if (list[k].name === name)
                res.push(list[k]);
            else
                newArr.push(list[k]);
        }

        if (newArr.length > 0)
            ev[ns] = newArr;
        else
            delete ev[ns];

        return res;
    }
    static remove(ev: TEventList, name?: string, nmspace?: string): TEventNodeArray {
        if (!ev)
            return [];
        const ns = !nmspace ? "*" : "" + nmspace, res: TEventNodeArray = [], arr: TEventNodeArray[] = [];

        if (ns === "*") {
            const ns_keys = Object.keys(ev);
            for (let i = 0; i < ns_keys.length; ++i) {
                arr.push(EventHelper.removeNS(ev, name, ns_keys[i]));
            }
            //return merged array
            return arrHelper.merge(arr);
        }
        else {
            return EventHelper.removeNS(ev, name, ns);
        }
    }
    static toArray(ev: TEventList): TEventNodeArray {
        if (!ev)
            return [];
        const ns_keys = Object.keys(ev), arr: TEventNodeArray[] = [];
        for (let i = 0; i < ns_keys.length; ++i) {
            arr.push(EventHelper.getNS(ev, ns_keys[i]));
        }

        //return merged array
        return arrHelper.merge(arr);
    }
    static getDelegateListener(root: TDomElement, fn_match: (el: TDomElement) => boolean, listener: THandlerFunc): (event: Event) => void {
        let res = (event: Event): void => {
            let target: TDomElement = <any>event.target;
            // go up to the parent node
            while (!!target && target !== root) {
                if (fn_match(target)) {
                    const eventCopy = new EventWrap(event, target);
                    listener.apply(target, [eventCopy]);
                    return;
                }
                
                target = (<Element><any>target).parentElement;
            }
        };
        return res;
    }
}

const helper = EventHelper;

const weakmap: IWeakMap = createWeakMap();

export type TDomElement = Element | Document | Window;

export type TEventsArgs = {
    nmspace?: string;
    useCapture?: boolean;
};

//used for delegation to match the element
export type TEventsDelegateArgs = {
    nmspace: string;
    matchElement: (el: Element) => boolean;
};

export type TEventsArgsOrNamespace = TEventsArgs | string;

function isDelegateArgs(a: any): a is TEventsDelegateArgs {
    if (!a) return false;
    return checks.isFunc(a.matchElement);
}

export type THandlerFunc = (evt: Event | EventWrap) => void;

export class DomEvents {
    private static getEvents(el: Element): IIndexer<TEventList> {
        return weakmap.get(el);
    }
    static on(el: TDomElement, type: "MSContentZoom", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSGestureChange", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSGestureDoubleTap", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSGestureEnd", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSGestureHold", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSGestureStart", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSGestureTap", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSInertiaStart", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSManipulationStateChanged", listener: (ev: MSManipulationEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSPointerCancel", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSPointerDown", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSPointerEnter", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSPointerLeave", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSPointerMove", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSPointerOut", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSPointerOver", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "MSPointerUp", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "abort", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "activate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "beforeactivate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "beforedeactivate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "blur", listener: (ev: FocusEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "canplay", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "canplaythrough", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "change", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "click", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "contextmenu", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "dblclick", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "deactivate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "drag", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "dragend", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "dragenter", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "dragleave", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "dragover", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "dragstart", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "drop", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "durationchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "emptied", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "ended", listener: (ev: MediaStreamErrorEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "error", listener: (ev: ErrorEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "focus", listener: (ev: FocusEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "fullscreenchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "fullscreenerror", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "input", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "invalid", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "keydown", listener: (ev: KeyboardEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "keypress", listener: (ev: KeyboardEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "keyup", listener: (ev: KeyboardEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "load", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "loadeddata", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "loadedmetadata", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "loadstart", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "mousedown", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "mousemove", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "mouseout", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "mouseover", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "mouseup", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "mousewheel", listener: (ev: WheelEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "mssitemodejumplistitemremoved", listener: (ev: MSSiteModeEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "msthumbnailclick", listener: (ev: MSSiteModeEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "pause", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "play", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "playing", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "pointercancel", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "pointerdown", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "pointerenter", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "pointerleave", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "pointerlockchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "pointerlockerror", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "pointermove", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "pointerout", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "pointerover", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "pointerup", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "progress", listener: (ev: ProgressEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "ratechange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "readystatechange", listener: (ev: ProgressEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "reset", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "scroll", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "seeked", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "seeking", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "select", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "selectionchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "selectstart", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "stalled", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "stop", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "submit", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "suspend", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "timeupdate", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "touchcancel", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "touchend", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "touchmove", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "touchstart", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "volumechange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "waiting", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "webkitfullscreenchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "webkitfullscreenerror", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: "wheel", listener: (ev: WheelEvent) => any, args?: TEventsArgsOrNamespace): void;
    static on(el: TDomElement, type: string, listener: (ev: EventWrap) => any, args: TEventsDelegateArgs): void;
    static on(el: TDomElement, type: string, listener: EventListenerOrEventListenerObject, args?: TEventsArgsOrNamespace): void;
    //on implementation
    static on(el: TDomElement, type: string, listener: THandlerFunc, args?: TEventsArgsOrNamespace | TEventsDelegateArgs): void {
        let events: TEventList = weakmap.get(el), ns: string, useCapture: boolean;
        if (!events) {
            events = <any>{};
            weakmap.set(el, events);
        }

        if (!!args) {
            if (checks.isString(args)) {
                ns = args;
            }
            else if (isDelegateArgs(args)) {
                ns = args.nmspace;
                listener = helper.getDelegateListener(el, args.matchElement, listener);
            }
            else {
                ns = args.nmspace, useCapture = args.useCapture;
            }
        }

        helper.add(events, type, listener, ns, useCapture);
        el.addEventListener(type, listener, useCapture);
    }
    static off(el: TDomElement, type?: string, nmspace?: string, useCapture?: boolean): void {
        const ev: TEventList = weakmap.get(el);
        if (!ev) {
            return;
        }
        const handlers = helper.remove(ev, type, nmspace);
        for (let i = 0; i < handlers.length; i += 1) {
            let handler = handlers[i];
            el.removeEventListener(handler.name, handler.fn, handler.useCapture);
        }
    }
    static offNS(el: TDomElement, nmspace?: string): void {
        DomEvents.off(el, null, nmspace);
    }
}