/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IIndexer, LocaleERRS, Utils, createWeakMap, IWeakMap, TFunc } from "jriapp_shared";
import { DomEvents } from "./domevents";

const ERRS = LocaleERRS, arrHelper = Utils.arr, win = window, doc = win.document, queue = Utils.queue,
    hasClassList = (!!window.document.documentElement.classList), weakmap = createWeakMap();

export type TCheckDOMReady  = (closure: TFunc) => void;


const _checkDOMReady: TCheckDOMReady = (function () {
    let funcs: TFunc[] = [], hack = (<any>doc.documentElement).doScroll
        , domContentLoaded = 'DOMContentLoaded'
        , isDOMloaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState);

    if (!isDOMloaded) {
        let callback = () => {
            doc.removeEventListener(domContentLoaded, <any>callback);
            isDOMloaded = true;
            let fn_onloaded: TFunc = null;
            while (fn_onloaded = funcs.shift()) {
                queue.enque(fn_onloaded);
            }
        };

        doc.addEventListener(domContentLoaded, callback);
    }

    return function (fn: TFunc) {
        isDOMloaded ? queue.enque(fn) : funcs.push(fn);
    };
})();


/**
 * pure javascript methods for the DOM manipulation
*/
export class DomUtils {
    static readonly window: Window = win;
    static readonly document: Document = doc;
    static readonly ready = _checkDOMReady;
    static readonly events = DomEvents;

    static getData(el: Node, key: string): any {
        let map: any = weakmap.get(el);
        if (!map)
            return (void 0);
        return map[key];
    }
    static setData(el: Node, key: string, val: any): void {
        let map: any = weakmap.get(el);
        if (!map) {
            map = {};
            weakmap.set(el, map);
        }
        map[key] = val;
    }
    static removeData(el: Node, key?: string): void {
        let map: any = weakmap.get(el);
        if (!map) {
            return;
        }
        if (!key) {
            weakmap.delete(el);
        }
        else {
            delete map[key];
        }
    }
    static isContained(oNode: any, oCont: any) {
        if (!oNode)
            return false;
        while (!!(oNode = oNode.parentNode)) {
            if (oNode === oCont)
                return true;
        }

        return false;
    }
    static fromHTML(html: string): HTMLElement[] {
        let div = doc.createElement("div");
        div.innerHTML = html;
        return arrHelper.fromList<HTMLElement>(div.children);
    }
    static queryAll<T>(root: Document | Element, selector: string): T[] {
        let res = root.querySelectorAll(selector);
        return arrHelper.fromList<T>(res);
    }
    static queryOne<T extends Element>(root: Document | Element, selector: string): T {
        return <any>root.querySelector(selector);
    }
    static append(parent: Node, children: Node[]): void {
        if (!children)
            return;
        children.forEach((node) => {
            parent.appendChild(node);
        });
    }
    static prepend(parent: Node, child: Node): void {
        if (!child)
            return;
        let firstChild: Node = null
        if (!(firstChild = parent.firstChild))
            parent.appendChild(child);
        else
            parent.insertBefore(child, firstChild);
    }
    static removeNode(node: Node) {
        if (!node)
            return;
        const pnd = node.parentNode;
        if (!!pnd)
            pnd.removeChild(node);
    }
    static insertAfter(node: Node, refNode: Node) {
        const parent = refNode.parentNode;
        if (parent.lastChild === refNode)
            parent.appendChild(node);
        else
            parent.insertBefore(node, refNode.nextSibling);
    }
    static insertBefore(node: Node, refNode: Node) {
        const parent = refNode.parentNode;
        parent.insertBefore(node, refNode);
    }
    static wrap(elem: Element, wrapper: Element) {
        let parent = elem.parentElement, nsibling = elem.nextSibling;
        if (!parent)
            return;
        wrapper.appendChild(elem);
        (!nsibling) ? parent.appendChild(wrapper) : parent.insertBefore(wrapper, nsibling);
    }
    static unwrap(elem: Element) {
        let wrapper = elem.parentElement;
        if (!wrapper)
            return;
        let parent = wrapper.parentElement, nsibling = wrapper.nextSibling;
        if (!parent)
            return;
        parent.removeChild(wrapper);
        (!nsibling) ? parent.appendChild(elem) : parent.insertBefore(elem, nsibling);
    }

    private static getClassMap(el: Element): IIndexer<number> {
        let res: IIndexer<number> = {};
        if (!el)
            return res;
        let className = el.className;
        if (!className)
            return res;
        let arr: string[] = className.split(" ");
        for (let i = 0; i < arr.length; i += 1) {
            arr[i] = arr[i].trim();
            if (!!arr[i]) {
                res[arr[i]] = i;
            }
        }
        return res;
    }
    /**
       set all classes, where param classes is array of classnames: ["+clasName1", "-className2", "-className3"]
       + means to add the class name, and - means to remove the class name
       -* means to remove all classes
    */
    static setClasses(elems: Element[], classes: string[]): void {
        if (!elems.length || !classes.length)
            return;

        let toAdd: string[] = [], toRemove: string[] = [], removeAll = false;
        classes.forEach((v: string) => {
            if (!v)
                return;

            let name = v.trim();
            if (!name)
                return;
            let op = v.charAt(0);
            if (op == "+" || op == "-") {
                name = v.substr(1).trim();
            }
            if (!name)
                return;

            let arr: string[] = name.split(" ");
            for (let i = 0; i < arr.length; i += 1) {
                let v2 = arr[i].trim();
                if (!!v2) {
                    if (op != "-") {
                        toAdd.push(v2);
                    }
                    else {
                        if (name === "*")
                            removeAll = true;
                        else
                            toRemove.push(v2);
                    }
                }
            }
        });

        if (removeAll) {
            toRemove = [];
        }

        for (let j = 0; j < elems.length; j += 1) {
            let el = elems[j], map = DomUtils.getClassMap(el);
            if (removeAll) {
                map = {};
            }
            for (let i = 0; i < toRemove.length; i += 1) {
                delete map[toRemove[i]];
            }
            for (let i = 0; i < toAdd.length; i += 1) {
                map[toAdd[i]] = i + 1000;
            }
            let keys = Object.keys(map);
            el.className = keys.join(" ");
        }
    }
    static setClass(elems: Element[], css: string, remove: boolean = false): void {
        if (!elems.length)
            return;

        if (!css) {
            if (remove) {
                for (let j = 0; j < elems.length; j += 1) {
                    elems[j].className = "";
                }
            }
            return;
        }

        const _arr: string[] = css.split(" ");
        for (let i = 0; i < _arr.length; i += 1) {
            _arr[i] = _arr[i].trim();
        }
        const arr = _arr.filter((val) => !!val);

        if (hasClassList && arr.length === 1) {
            for (let j = 0; j < elems.length; j += 1) {
                let el = elems[j];
                if (remove)
                    el.classList.remove(arr[0]);
                else
                    el.classList.add(arr[0]);
            }
        }
        else {
            for (let j = 0; j < elems.length; j += 1) {
                let el = elems[j], map = DomUtils.getClassMap(el);
                for (let i = 0; i < arr.length; i += 1) {
                    if (remove)
                        delete map[arr[i]];
                    else
                        map[arr[i]] = i + 1000;
                }
                let keys = Object.keys(map);
                el.className = keys.join(" ");
            }
        }
    }
    static addClass(elems: Element[], css: string): void {
        DomUtils.setClass(elems || [], css, false);
    }
    static removeClass(elems: Element[], css: string): void {
        DomUtils.setClass(elems || [], css, true);
    }
}