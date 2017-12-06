/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "jriapp/int";
import { DomUtils } from "jriapp/utils/dom";
import { bootstrap, delegateWeakMap, DelegateFlags } from "jriapp/bootstrap";
import { PROP_NAME } from "./baseview";
import { InputElView } from "./input";

const dom = DomUtils, delegateMap = delegateWeakMap;

const enum TXTBOX_EVENTS {
    keypress = "keypress"
}

export interface ITextBoxOptions extends IViewOptions {
    updateOnKeyUp?: boolean;
}

export type TKeyPressArgs = {
    keyCode: number;
    value: string;
    isCancel: boolean;
};

export class TextBoxElView extends InputElView {
    constructor(options: ITextBoxOptions) {
        super(options);
        const self = this;
        if (this.isDelegationOn) {
            delegateMap.set(this.el, this);
            this._setIsDelegated(DelegateFlags.change);
            this._setIsDelegated(DelegateFlags.keypress);
            if (!!options.updateOnKeyUp) {
                this._setIsDelegated(DelegateFlags.keyup);
            }
        } else {
            dom.events.on(this.el, "change", (e) => {
                e.stopPropagation();
                self.handle_change(e);
            }, this.uniqueID);
            dom.events.on(this.el, "keypress", (e) => {
                self.handle_keypress(e);
            }, this.uniqueID);
            if (!!options.updateOnKeyUp) {
                dom.events.on(this.el, "keyup", (e) => {
                    self.handle_keyup(e);
                }, this.uniqueID);
            }
        }
    }
    handle_change(e: Event): void {
        this.objEvents.raiseProp(PROP_NAME.value);
    }
    handle_keypress(e: KeyboardEvent): void {
        const args: TKeyPressArgs = {
            keyCode: e.which,
            value: (<HTMLInputElement | HTMLTextAreaElement>e.target).value,
            isCancel: false
        };
        this.objEvents.raise(TXTBOX_EVENTS.keypress, args);
        if (args.isCancel) {
            e.preventDefault();
        }
    }
    handle_keyup(e: KeyboardEvent): void {
        this.objEvents.raiseProp(PROP_NAME.value);
    }
    addOnKeyPress(fn: (sender: TextBoxElView, args: TKeyPressArgs) => void, nmspace?: string) {
        this.objEvents.on(TXTBOX_EVENTS.keypress, fn, nmspace);
    }
    offOnKeyPress(nmspace?: string) {
        this.objEvents.off(TXTBOX_EVENTS.keypress, nmspace);
    }
    toString() {
        return "TextBoxElView";
    }
    get color() {
        return this.el.style.color;
    }
    set color(v) {
        const x = this.el.style.color;
        if (v !== x) {
            this.el.style.color = v;
            this.objEvents.raiseProp(PROP_NAME.color);
        }
    }
}

bootstrap.registerElView("input:text", TextBoxElView);
