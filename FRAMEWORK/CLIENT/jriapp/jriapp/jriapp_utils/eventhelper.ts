/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IEventNode, IEventNodeArray, IEventList, INamespaceMap, TErrorHandler, TPriority } from "../jriapp_core/shared";

export class EventHelper {
    static CreateList(): IEventList {
        return {};
    }
    static CreateNode(handler: TErrorHandler, ns: string, context?: any): IEventNode {
        return { fn: handler, next: null, context: !context ? null : context };
    }
    static countNodes(list: IEventList): number {
        if (!list)
            return 0;
        let ns_keys: string[], cnt: number = 0, obj: INamespaceMap;
        for (let j = 0; j < 3; ++j) {
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
    static appendNode(list: IEventList, node: IEventNode, ns: string, priority: TPriority = TPriority.Normal): void {
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
    static removeNodes(list: IEventList, ns: string): void {
        if (!list)
            return;
        let ns_key: string, ns_keys: string[], obj: INamespaceMap;
        if (!ns)
            ns = "*";
        for (let j = 0; j < 3; ++j) {
            obj = list[j];
            if (!!obj) {
                if (ns === "*") {
                    ns_keys = Object.keys(obj);
                    for (let i = 0; i < ns_keys.length; ++i) {
                        ns_key = ns_keys[i];
                        delete obj[ns_key];
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
        for (let k = 2; k >= 0 ; k -= 1) {
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