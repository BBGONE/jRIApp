/// <reference path="../jriapp_core/../../thirdparty/jquery.d.ts" />
/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { ERRS } from "../jriapp_core/lang";

if (!(<any>window).jQuery)
    throw new Error(ERRS.ERR_APP_NEED_JQUERY);

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
}