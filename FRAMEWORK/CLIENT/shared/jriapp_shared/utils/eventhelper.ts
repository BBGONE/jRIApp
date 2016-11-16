/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    TErrorHandler, TPriority, IIndexer, IBaseObject, TEventHandler
} from "../shared";
import { ERRS } from "../lang";
import { Checks } from "./checks";
import { StringUtils } from "./strutils";
import { DEBUG } from "./debug";

const checks = Checks, strUtils = StringUtils, debug = DEBUG;


export interface IEventNode {
    context: any
    fn: TEventHandler<any, any>;
    next: IEventNode;
}

export type IEventNodeArray = IEventNode[];

export interface INamespaceMap {
    [ns: string]: IEventNodeArray;
}

export interface IEventList {
    [priority: number]: INamespaceMap;
}

class EventList {
    static Create(): IEventList {
        return {};
    }
    static Node(handler: TErrorHandler, ns: string, context?: any): IEventNode {
        return { fn: handler, next: null, context: !context ? null : context };
    }
    static count(list: IEventList): number {
        if (!list)
            return 0;
        let ns_keys: string[], cnt: number = 0, obj: INamespaceMap;
        for (let j = TPriority.Normal; j <= TPriority.High; ++j) {
            obj = list[j];
            if (!!obj) {
                ns_keys = Object.keys(obj);
                for (let i = 0; i < ns_keys.length; ++i) {
                    cnt += obj[ns_keys[i]].length;
                }
            }
        }
        return cnt;
    }
    static append(list: IEventList, node: IEventNode, ns: string, priority: TPriority = TPriority.Normal): void {
        if (!ns)
            ns = "*";
        let obj = list[priority];
        if (!obj) {
            list[priority] = obj = {};
        }
      
        let arr = obj[ns];
        if (!arr)
            obj[ns] = arr = [];
        arr.push(node);
    }
    static remove(list: IEventList, ns: string): void {
        if (!list)
            return;
        let ns_keys: string[], obj: INamespaceMap;
        if (!ns)
            ns = "*";
        for (let j = TPriority.Normal; j <= TPriority.High; ++j) {
            obj = list[j];
            if (!!obj) {
                if (ns === "*") {
                    ns_keys = Object.keys(obj);
                    for (let i = 0; i < ns_keys.length; ++i) {
                        delete obj[ns_keys[i]];
                    }
                }
                else {
                    delete obj[ns];
                }
            }
        }
    }
    static toArray(list: IEventList): IEventNode[] {
        if (!list)
            return [];
        let res: IEventNodeArray = [], arr: IEventNodeArray, cur: IEventNode,
            obj: INamespaceMap;

        // from highest priority to the lowest
        for (let k = TPriority.High; k >= TPriority.Normal; k -= 1) {
            obj = list[k];
            if (!!obj) {
                let ns_keys = Object.keys(obj);
                for (let i = 0; i < ns_keys.length; ++i) {
                    arr = obj[ns_keys[i]];
                    for (let j = 0; j < arr.length; ++j) {
                        res.push(arr[j]);
                    }
                }
            }
        }
        return res;
    }
}

const evList = EventList;

export class EventHelper
{
    static removeNs(ev: IIndexer<IEventList>, ns?: string): void {
        if (!ev)
            return;
        if (!ns)
            ns = "*";
        const keys = Object.keys(ev);
        for (let i = 0; i < keys.length; i += 1) {
            if (ns === "*") {
                delete ev[keys[i]];
            }
            else {
                evList.remove(ev[keys[i]], ns);
            }
        }
    }
    static add(ev: IIndexer<IEventList>, name: string, handler: TEventHandler<any, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void {
        if (!ev) {
            debug.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "ev is a valid object"));
        }
        if (!checks.isFunc(handler)) {
            throw new Error(ERRS.ERR_EVENT_INVALID_FUNC);
        }

        if (!name)
            throw new Error(strUtils.format(ERRS.ERR_EVENT_INVALID, "[Empty]"));

        const self = this, n = name, ns = !nmspace ? "*" : "" + nmspace;

        let list = ev[n], node: IEventNode = evList.Node(handler, ns, context);

        if (!list) {
            ev[n] = list = evList.Create();
        }

        evList.append(list, node, ns, priority);
    }
    static remove(ev: IIndexer<IEventList>, name?: string, nmspace?: string): void {
        if (!ev)
            return null;
        const self = this, ns = !nmspace ? "*" : "" + nmspace;

        if (!name) {
            EventHelper.removeNs(ev, ns);
        }
        else {
            //arguments supplied is name (and optionally nmspace)
            if (ns === "*") {
                delete ev[name];
            }
            else {
                evList.remove(ev[name], ns);
            }
        }
    }
    static raise(sender: any, ev: IIndexer<IEventList>, name: string, args: any): void {
        if (!ev)
            return;
        if (!!name) {
            const arr = evList.toArray(ev[name]);
            let node: IEventNode;
            for (let i = 0; i < arr.length; i++) {
                node = arr[i];
                node.fn.apply(node.context, [sender, args]);
            }
        }
    }
    static raiseProp(sender: any, ev: IIndexer<IEventList>, prop: string, args: any): void {
        if (!ev)
            return;
        if (!!prop) {
            const isAllProp = prop === "*";

            if (!isAllProp) {
                //notify clients who subscribed for all properties changes
                EventHelper.raise(sender, ev, "0*", args);
            }

            EventHelper.raise(sender, ev, "0" + prop, args);
        }
    }
}