/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    TPriority, IIndexer, TEventHandler
} from "../int";
import { ERRS } from "../lang";
import { Checks } from "./checks";
import { StringUtils } from "./strutils";
import { CoreUtils } from "./coreutils";
import { DEBUG } from "./debug";

const { Indexer } = CoreUtils, { isFunc } = Checks, { format } = StringUtils, debug = DEBUG;


export type TEventNode = {
    context: any
    fn: TEventHandler;
};

export type TEventNodeArray = TEventNode[];

export interface INamespaceMap {
    [ns: string]: TEventNodeArray;
}

export interface IEventList {
    [priority: number]: INamespaceMap;
}

class EventList {
    static Create(): IEventList {
        return {};
    }
    static Node(handler: TEventHandler, context?: any): TEventNode {
        return { fn: handler, context: !context ? null : context };
    }
    static count(list: IEventList): number {
        if (!list) {
            return 0;
        }
        let nsKeys: string[], cnt: number = 0, obj: INamespaceMap;
        for (let j = TPriority.Normal; j <= TPriority.High; ++j) {
            obj = list[j];
            if (!!obj) {
                nsKeys = Object.keys(obj);
                for (let i = 0; i < nsKeys.length; ++i) {
                    cnt += obj[nsKeys[i]].length;
                }
            }
        }
        return cnt;
    }
    static append(list: IEventList, node: TEventNode, ns: string, priority: TPriority = TPriority.Normal): void {
        if (!ns) {
            ns = "*";
        }
        let obj = list[priority];
        if (!obj) {
            list[priority] = obj = Indexer();
        }

        let arr = obj[ns];
        if (!arr) {
            obj[ns] = arr = [];
        }
        arr.push(node);
    }
    static remove(list: IEventList, ns: string): void {
        if (!list) {
            return;
        }
        let nsKeys: string[], obj: INamespaceMap;
        if (!ns) {
            ns = "*";
        }
        for (let j = TPriority.Normal; j <= TPriority.High; ++j) {
            obj = list[j];
            if (!!obj) {
                if (ns === "*") {
                    nsKeys = Object.keys(obj);
                    for (let i = 0; i < nsKeys.length; ++i) {
                        delete obj[nsKeys[i]];
                    }
                } else {
                    delete obj[ns];
                }
            }
        }
    }
    static toArray(list: IEventList): TEventNode[] {
        if (!list) {
            return [];
        }
        const res: TEventNodeArray = [];
        // from highest priority to the lowest
        for (let k = TPriority.High; k >= TPriority.Normal; k -= 1) {
            const obj: INamespaceMap = list[k];
            if (!!obj) {
                const nsKeys = Object.keys(obj);
                for (let i = 0; i < nsKeys.length; ++i) {
                    const arr: TEventNodeArray = obj[nsKeys[i]];
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

export class EventHelper {
    static removeNS(ev: IIndexer<IEventList>, ns?: string): void {
        if (!ev) {
            return;
        }
        if (!ns) {
            ns = "*";
        }
        const keys = Object.keys(ev);
        for (let i = 0; i < keys.length; i += 1) {
            if (ns === "*") {
                delete ev[keys[i]];
            } else {
                evList.remove(ev[keys[i]], ns);
            }
        }
    }
    static add(ev: IIndexer<IEventList>, name: string, handler: TEventHandler, nmspace?: string, context?: object, priority?: TPriority): void {
        if (!ev) {
            debug.checkStartDebugger();
            throw new Error(format(ERRS.ERR_ASSERTION_FAILED, "ev is a valid object"));
        }
        if (!isFunc(handler)) {
            throw new Error(ERRS.ERR_EVENT_INVALID_FUNC);
        }

        if (!name) {
            throw new Error(format(ERRS.ERR_EVENT_INVALID, "[Empty]"));
        }

        const n = name, ns = !nmspace ? "*" : "" + nmspace;

        let list = ev[n];
        const node: TEventNode = evList.Node(handler, context);

        if (!list) {
            ev[n] = list = evList.Create();
        }

        evList.append(list, node, ns, priority);
    }
    static remove(ev: IIndexer<IEventList>, name?: string, nmspace?: string): void {
        if (!ev) {
            return null;
        }
        const ns = !nmspace ? "*" : "" + nmspace;

        if (!name) {
            EventHelper.removeNS(ev, ns);
        } else {
            // arguments supplied is name (and optionally nmspace)
            if (ns === "*") {
                delete ev[name];
            } else {
                evList.remove(ev[name], ns);
            }
        }
    }
    static count(ev: IIndexer<IEventList>, name: string): number {
        if (!ev) {
            return 0;
        }
        return (!name) ? 0 : evList.toArray(ev[name]).length;
    }
    static raise(sender: any, ev: IIndexer<IEventList>, name: string, args: any): void {
        if (!ev) {
            return;
        }
        if (!!name) {
            const arr = evList.toArray(ev[name]), len = arr.length;

            for (let i = 0; i < len; i++) {
                const node: TEventNode = arr[i];
                node.fn.apply(node.context, [sender, args]);
            }
        }
    }
    static raiseProp(sender: any, ev: IIndexer<IEventList>, prop: string, args: any): void {
        if (!ev) {
            return;
        }
        if (!!prop) {
            const isAllProp = prop === "*";

            if (!isAllProp) {
                // notify clients who subscribed for all properties changes
                EventHelper.raise(sender, ev, "0*", args);
            }

            EventHelper.raise(sender, ev, "0" + prop, args);
        }
    }
}
