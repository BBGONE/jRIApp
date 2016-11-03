/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as constsMOD from "../jriapp_core/const";
import * as coreMOD from "../jriapp_core/shared";

export class ListHelper {
    static CreateList(): coreMOD.IList {
        return {};
    }
    static CreateNode(handler: coreMOD.TErrorHandler, ns: string, context?: any): coreMOD.IListNode {
        return { fn: handler, next: null, context: !context ? null : context };
    }
    static countNodes(list: coreMOD.IList): number {
        if (!list)
            return 0;
        let ns_keys: string[], cnt: number = 0, obj: { [ns: string]: coreMOD.IListBucket; };
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
    static appendNode(list: coreMOD.IList, node: coreMOD.IListNode, ns: string, priority: coreMOD.TPriority = "0"): void {
        let obj: { [ns: string]: coreMOD.IListBucket; };
        if (!ns)
            ns = "*";
        obj = list[priority];
        if (!obj) {
            list[priority] = obj = {};
        }
      
        let bucket = obj[ns];
        if (!bucket)
            obj[ns] = bucket = [];
        bucket.push(node);
    }
    static removeNodes(list: coreMOD.IList, ns: string): void {
        if (!list)
            return;
        let ns_key: string, ns_keys: string[], obj: coreMOD.INamespaceMap;
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
    static toArray(list: coreMOD.IList): coreMOD.IListNode[] {
        if (!list)
            return [];
        let res: coreMOD.IListNode[] = [], bucket: coreMOD.IListBucket, cur: coreMOD.IListNode,
            obj: { [ns: string]: coreMOD.IListBucket; };
        // from highest priority to the lowest
        for (let k = 2; k >= 0 ; k -= 1) {
            obj = list[k];
            if (!!obj) {
                let ns_keys = Object.keys(obj);
                for (let i = 0; i < ns_keys.length; ++i) {
                    bucket = obj[ns_keys[i]];
                    for (let j = 0; j < bucket.length; ++j) {
                        res.push(bucket[j]);
                    }
                }
            }
        }
        return res;
    }
}