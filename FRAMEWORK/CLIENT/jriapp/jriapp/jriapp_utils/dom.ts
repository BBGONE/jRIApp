/// <reference path="../jriapp_core/../../thirdparty/jquery.d.ts" />
/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { ERRS } from "../jriapp_core/lang";

if (!(<any>window).jQuery)
    throw new Error(ERRS.ERR_APP_NEED_JQUERY);

let _hasClassList: boolean = undefined;

export class DomUtils {
    static isContained(oNode: any, oCont: any) {
        if (!oNode) return false;
        while (!!(oNode = oNode.parentNode)) if (oNode === oCont) return true;
        return false;
    }
    static removeNode(node: Node) {
        if (!node)
            return;
        let pnd = node.parentNode;
        if (!!pnd)
            pnd.removeChild(node);
    }
    static insertAfter(referenceNode: Node, newNode: Node) {
        let parent = referenceNode.parentNode;
        if (parent.lastChild === referenceNode)
            parent.appendChild(newNode);
        else
            parent.insertBefore(newNode, referenceNode.nextSibling);
    }
    static $: JQueryStatic = jQuery;
    static destroyJQueryPlugin($el: JQuery, name: string): void {
        let plugin = $el.data(name);
        if (!!plugin) {
            $el[name]("destroy");
        }
    }
    static window: Window = window;
    static document: Document = window.document;
    /**
       set all classes, where param classes is array of classnames: ["+clasName1", "-className2", "-className3"]
       + means to add the class name, and - means to remove the class name
       -* means to remove all classes
    */
    static setClasses($el: JQuery, classes: string[]): void {
        if (!$el.length || !classes.length)
            return;
        if (_hasClassList === undefined) {
            _hasClassList = !!$el[0].classList;
        }

        let toAdd: string[] = [], toRemove: string[] = [], removeAll = false;
        classes.forEach((v: string) => {
            if (!v)
                return;

            let name = v.trim();
            if (!name)
                return;
            let op = v.charAt(0);
            if (op == "+" || op == "-") {
                name = v.substr(1);
            }
            if (op != "-") {
                toAdd.push(name);
            }
            else {
                if (name === "*")
                    removeAll = true;
                else
                    toRemove.push(name);
            }
        });

        if (removeAll) {
            toRemove = [];
        }

        if (!_hasClassList) {
            $el.each((index, el) => {
                if (removeAll) {
                    el.className = "";
                }
            });

            if (toRemove.length > 0) {
                $el.removeClass(toRemove.join(" "));
            }
            if (toAdd.length > 0) {
                $el.addClass(toAdd.join(" "));
            }
        }
        else {
            $el.each((index, el) => {
                if (removeAll) {
                    el.className = "";
                }

                for (let i = 0; i < toRemove.length; i += 1) {
                    el.classList.remove(toRemove[i]);
                }
                for (let i = 0; i < toAdd.length; i += 1) {
                    el.classList.add(toAdd[i]);
                }
            });
        }
    }
    static setClass($el: JQuery, css: string, remove: boolean = false): void {
        if (!$el.length)
            return;

        if (remove && !css) {
            $el.each((index, el) => {
                el.className = "";
            });
            return;
        }

        if (_hasClassList === undefined) {
            _hasClassList = !!$el[0].classList;
        }

        if (!_hasClassList) {
            if (remove) {
                $el.removeClass(css);
            }
            else {
                $el.addClass(css);
            }
            return;
        }

        let classes: string[] = [];
        css.split(" ").forEach((v: string) => {
            if (!v)
                return;

            let name = v.trim();
            if (!name)
                return;
            classes.push(name);
        });

        $el.each((index, el) => {
            for (let i = 0; i < classes.length; i += 1) {
                if (remove)
                    el.classList.remove(classes[i]);
                else
                    el.classList.add(classes[i]);
            }
        });
    }
    static addClass($el: JQuery, css: string): void {
        DomUtils.setClass($el, css, false);
    }
    static removeClass($el: JQuery, css: string): void {
        DomUtils.setClass($el, css, true);
    }
}