/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DomUtils } from "jriapp/utils/dom";
import { SubscribeFlags } from "jriapp/const";
import { bootstrap, subscribeWeakMap } from "jriapp/bootstrap";
import { PROP_NAME } from "./baseview";
import { CommandElView, ICommandViewOptions } from "./command";

const boot = bootstrap, dom = DomUtils, subscribeMap = subscribeWeakMap;

export class ButtonElView extends CommandElView {
    private _isButton: boolean;

    constructor(options: ICommandViewOptions) {
        super(options);
        const self = this;
        this._isButton = this.el.tagName.toLowerCase() === "button";
        if (this.isDelegationOn) {
            subscribeMap.set(this.el, this);
            this._setIsSubcribed(SubscribeFlags.click);
        } else {
            dom.events.on(this.el, "click", (e) => {
                self.handle_click(e);
            }, this.uniqueID);
        }
    }
    handle_click(e: Event): void {
        if (this.stopPropagation) {
            e.stopPropagation();
        }
        if (this.preventDefault) {
            e.preventDefault();
        }
        this.onClick();
    }
    onClick(): void {
        this.invokeCommand(null, true);
    }
    toString(): string {
        return "ButtonElView";
    }
    get value(): string {
        return this._isButton ? (<HTMLButtonElement>this.el).textContent : (<HTMLInputElement>this.el).value;
    }
    set value(v: string) {
        const x = this.value;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            if (this._isButton) {
                (<HTMLButtonElement>this.el).textContent = v;
            } else {
                (<HTMLInputElement>this.el).value = v;
            }

            this.objEvents.raiseProp(PROP_NAME.value);
        }
    }
    get text(): string {
        return this.el.textContent;
    }
    set text(v: string) {
        const x = this.el.textContent;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            this.el.textContent = v;
            this.objEvents.raiseProp(PROP_NAME.text);
        }
    }
    get html(): string {
        return this._isButton ? (<HTMLButtonElement>this.el).innerHTML : (<HTMLInputElement>this.el).value;
    }
    set html(v: string) {
        const x = this.html;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            if (this._isButton) {
                (<HTMLButtonElement>this.el).innerHTML = v;
            } else {
                (<HTMLInputElement>this.el).value = v;
            }
            this.objEvents.raiseProp(PROP_NAME.html);
        }
    }
}

boot.registerElView("input:button", ButtonElView);
boot.registerElView("input:submit", ButtonElView);
boot.registerElView("button", ButtonElView);
