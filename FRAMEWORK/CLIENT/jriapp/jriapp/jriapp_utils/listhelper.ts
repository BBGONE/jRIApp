/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as constsMOD from "../jriapp_core/const";
import * as coreMOD from "../jriapp_core/shared";

export class ListHelper {
    static CreateList(): coreMOD.IList {
        return { one: null, two: null };
    }
    static CreateNode(handler: coreMOD.TErrorHandler, ns: string, context?: any): coreMOD.IListNode {
        let node: coreMOD.IListNode = { fn: handler, next: null, context: !context ? null : context };
        return node;
    }
    static countNodes(list: coreMOD.IList): number {
        let ns_keys: string[], cnt: number, i: number, j: number, obj: { [ns: string]: coreMOD.IListBucket; };
        cnt = 0;
        if (!list)
            return cnt;
        for (j = 0; j < 2; ++j) {
            obj = j === 0 ? list.one : list.two;
            if (!!obj) {
                ns_keys = Object.keys(obj);
                for (i = 0; i < ns_keys.length; ++i) {
                    cnt += obj[ns_keys[i]].length;
                }
            }
        }
        return cnt;
    }
    static appendNode(list: coreMOD.IList, node: coreMOD.IListNode, ns: string, highPrior: boolean): void {
        let bucket: coreMOD.IListNode[], obj: { [ns: string]: coreMOD.IListBucket; };
        if (!ns)
            ns = "*";
        if (!highPrior) {
            obj = list.two;
            if (!obj)
                list.two = obj = {};
        }
        else {
            obj = list.one;
            if (!obj)
                list.one = obj = {};
        }
        bucket = obj[ns];
        if (!bucket)
            obj[ns] = bucket = [];
        bucket.push(node);
    }
    static removeNodes(list: coreMOD.IList, ns: string): void {
        let ns_key: string, ns_keys: string[], i: number, j: number, obj: { [ns: string]: coreMOD.IListBucket; };
        if (!list)
            return;
        if (!ns)
            ns = "*";
        for (j = 0; j < 2; ++j) {
            obj = j === 0 ? list.one : list.two;
            if (!!obj) {
                if (ns === "*") {
                    ns_keys = Object.keys(obj);
                    for (i = 0; i < ns_keys.length; ++i) {
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
        let res: coreMOD.IListNode[] = [], i: number, j: number, bucket: coreMOD.IListBucket, cur: coreMOD.IListNode,
            k: number, obj: { [ns: string]: coreMOD.IListBucket; };
        if (!list)
            return res;
        for (k = 0; k < 2; ++k) {
            obj = k === 0 ? list.one : list.two;
            if (!!obj) {
                let ns_keys = Object.keys(obj);
                for (i = 0; i < ns_keys.length; ++i) {
                    bucket = obj[ns_keys[i]];
                    for (j = 0; j < bucket.length; ++j) {
                        res.push(bucket[j]);
                    }
                }
            }
        }
        return res;
    }
}