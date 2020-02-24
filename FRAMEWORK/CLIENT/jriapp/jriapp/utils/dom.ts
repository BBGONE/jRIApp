/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IIndexer, Utils, createWeakMap, TFunc } from "jriapp_shared";
import { DomEvents } from "./domevents";

const utils = Utils, { fromList } = utils.arr, { fastTrim } = utils.str, win = window, doc = win.document,
    queue = Utils.queue, { Indexer } = utils.core,
    hasClassList = ("classList" in window.document.documentElement), weakmap = createWeakMap();

export type TCheckDOMReady  = (closure: TFunc) => void;

let _isTemplateTagAvailable = false;

const _checkDOMReady: TCheckDOMReady = (function () {
    const funcs: TFunc[] = [], hack = (<any>doc.documentElement).doScroll,
        domContentLoaded = "DOMContentLoaded";
    let isDOMloaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState);

    if (!isDOMloaded) {
        const callback = () => {
            doc.removeEventListener(domContentLoaded, <any>callback);
            isDOMloaded = true;

            let fnOnloaded: TFunc = null;
            while (fnOnloaded = funcs.shift()) {
                queue.enque(fnOnloaded);
            }
        };

        doc.addEventListener(domContentLoaded, callback);
    }

    return function (fn: TFunc) {
        isDOMloaded ? queue.enque(fn) : funcs.push(fn);
    };
})();

_checkDOMReady(() => { _isTemplateTagAvailable = ('content' in doc.createElement('template')); });

function getElementContent(root: Element): DocumentFragment {
    const frag = doc.createDocumentFragment();
    let child: Node = null;

    while (!!(child = root.firstChild)) {
        // root.removeChild(child);
        frag.appendChild(child);
    }
    return frag;
}

/**
 * pure javascript methods for the DOM manipulation
*/
export class DomUtils {
    static readonly window: Window = win;
    static readonly document: Document = doc;
    static readonly ready = _checkDOMReady;
    static readonly events = DomEvents;

    static isTemplateTagAvailable(): boolean {
        return _isTemplateTagAvailable;
    }
    static getData(el: Node, key: string): any {
        const map: any = weakmap.get(el);
        if (!map) {
            return (void 0);
        }
        return map[key];
    }
    static setData(el: Node, key: string, val: any): void {
        let map: any = weakmap.get(el);
        if (!map) {
            map = Indexer();
            weakmap.set(el, map);
        }
        map[key] = val;
    }
    static removeData(el: Node, key?: string): void {
        const map: any = weakmap.get(el);
        if (!map) {
            return;
        }
        if (!key) {
            weakmap.delete(el);
        } else {
            delete map[key];
        }
    }
    static isContained(node: Node, container: Node): boolean {
        if (!node) {
            return false;
        }
        const contains = container.contains;
        if (!!contains) {
            return contains.call(container, node);
        }

        while (!!(node = node.parentNode)) {
            if (node === container) {
                return true;
            }
        }

        return false;
    }
    static getDocFragment(html: string): DocumentFragment {
        if (_isTemplateTagAvailable) {
            const t = doc.createElement('template'); 
            t.innerHTML = html;
            return t.content;
        } else {
            const t = doc.createElement('div');
            t.innerHTML = html;
            return getElementContent(t);
        }
    }
    static fromHTML(html: string): HTMLElement[] {
        const div = doc.createElement("div");
        div.innerHTML = html;
        return fromList<HTMLElement>(div.children);
    }
    static queryAll<T>(root: Document | Element, selector: string): T[] {
        const res = root.querySelectorAll(selector);
        return fromList<T>(res);
    }
    static queryOne<T extends Element>(root: Document | Element, selector: string): T {
        return <any>root.querySelector(selector);
    }
    static append(parent: Node, children: Node[]): void {
        if (!children) {
            return;
        }
        for (const node of children)
        {
            parent.appendChild(node);
        }
    }
    static prepend(parent: Node, child: Node): void {
        if (!child) {
            return;
        }
        let firstChild: Node = null;
        if (!(firstChild = parent.firstChild)) {
            parent.appendChild(child);
        } else {
            parent.insertBefore(child, firstChild);
        }
    }
    static removeNode(node: Node): void {
        if (!node) {
            return;
        }
        const pnd = node.parentNode;
        if (!!pnd) {
            pnd.removeChild(node);
        }
    }
    static insertAfter(node: Node, refNode: Node): void {
        const parent = refNode.parentNode;
        if (parent.lastChild === refNode) {
            parent.appendChild(node);
        } else {
            parent.insertBefore(node, refNode.nextSibling);
        }
    }
    static insertBefore(node: Node, refNode: Node): Node {
        const parent = refNode.parentNode;
        return parent.insertBefore(node, refNode);
    }
    static wrap(elem: Element, wrapper: Element): void {
        const parent = elem.parentElement, nsibling = elem.nextSibling;
        if (!parent) {
            return;
        }
        wrapper.appendChild(elem);
        (!nsibling) ? parent.appendChild(wrapper) : parent.insertBefore(wrapper, nsibling);
    }
    static unwrap(elem: Element): void {
        const wrapper = elem.parentElement;
        if (!wrapper) {
            return;
        }
        const parent = wrapper.parentElement, nsibling = wrapper.nextSibling;
        if (!parent) {
            return;
        }
        parent.removeChild(wrapper);
        (!nsibling) ? parent.appendChild(elem) : parent.insertBefore(elem, nsibling);
    }

    private static getClassMap(el: Element): IIndexer<number> {
        const res: IIndexer<number> = Indexer();
        if (!el) {
            return res;
        }
        const className = el.className;
        if (!className) {
            return res;
        }
        const arr: string[] = className.split(" ");
        for (let i = 0; i < arr.length; i += 1) {
            arr[i] = fastTrim(arr[i]);
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
        if (!elems.length || !classes.length) {
            return;
        }

        const toAdd: string[] = [];
        let toRemove: string[] = [], removeAll = false;
        classes.forEach((v: string) => {
            if (!v) {
                return;
            }

            let name = fastTrim(v);
            if (!name) {
                return;
            }
            const op = v.charAt(0);
            if (op == "+" || op == "-") {
                name = fastTrim(v.substr(1));
            }
            if (!name) {
                return;
            }

            const arr: string[] = name.split(" ");
            for (let i = 0; i < arr.length; i += 1) {
                const v2 = fastTrim(arr[i]);
                if (!!v2) {
                    if (op != "-") {
                        toAdd.push(v2);
                    } else {
                        if (name === "*") {
                            removeAll = true;
                        } else {
                            toRemove.push(v2);
                        }
                    }
                }
            }
        });

        if (removeAll) {
            toRemove = [];
        }

        for (let j = 0; j < elems.length; j += 1) {
            const el = elems[j];
            let map = DomUtils.getClassMap(el);
            if (removeAll) {
                map = Indexer();
            }
            for (let i = 0; i < toRemove.length; i += 1) {
                delete map[toRemove[i]];
            }
            for (let i = 0; i < toAdd.length; i += 1) {
                map[toAdd[i]] = i + 1000;
            }
            const keys = Object.keys(map);
            el.className = keys.join(" ");
        }
    }
    static setClass(elems: Element[], css: string, remove: boolean = false): void {
        if (!elems.length) {
            return;
        }

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
            _arr[i] = fastTrim(_arr[i]);
        }
        const arr = _arr.filter((val) => !!val);

        if (hasClassList && arr.length === 1) {
            for (let j = 0; j < elems.length; j += 1) {
                const el = elems[j];
                if (remove) {
                    el.classList.remove(arr[0]);
                } else {
                    el.classList.add(arr[0]);
                }
            }
        } else {
            for (let j = 0; j < elems.length; j += 1) {
                const el = elems[j], map = DomUtils.getClassMap(el);
                for (let i = 0; i < arr.length; i += 1) {
                    if (remove) {
                        delete map[arr[i]];
                    } else {
                        map[arr[i]] = i + 1000;
                    }
                }
                const keys = Object.keys(map);
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
