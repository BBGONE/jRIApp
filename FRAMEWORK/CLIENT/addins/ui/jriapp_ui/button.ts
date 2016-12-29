/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "jriapp/int";
import { DomUtils } from "jriapp/utils/dom";
import { bootstrap } from "jriapp/bootstrap";
import { css, PROP_NAME, IEventChangedArgs, EVENT_CHANGE_TYPE } from "./baseview";
import { ICommand } from "jriapp/mvvm";
import { CommandElView } from "./command";

const boot = bootstrap, dom = DomUtils;

export class ButtonElView extends CommandElView {
    private _isButton: boolean;

    constructor(options: IViewOptions) {
        super(options);
        const self = this;
        this._isButton = this.el.tagName.toLowerCase() === "button";
        dom.events.on(this.el, "click", function (e) {
            self._onClick(e);
        }, this.uniqueID);
    }
    protected _onClick(e: Event) {
        if (this.stopPropagation)
            e.stopPropagation();
        if (this.preventDefault)
            e.preventDefault();
        this.invokeCommand(null, true);
    }
    toString() {
        return "ButtonElView";
    }
    get value(): string {
        return this._isButton ? (<HTMLButtonElement>this.el).textContent : (<HTMLInputElement>this.el).value;
    }
    set value(v) {
        const x = this.value;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            if (this._isButton)
                (<HTMLButtonElement>this.el).textContent = v;
            else
                (<HTMLInputElement>this.el).value = v;

            this.raisePropertyChanged(PROP_NAME.value);
        }
    }
    get text() {
        return this.el.textContent;
    }
    set text(v) {
        let x = this.el.textContent;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            this.el.textContent = v;
            this.raisePropertyChanged(PROP_NAME.text);
        }
    }
    get html() {
        return this._isButton ? (<HTMLButtonElement>this.el).innerHTML : (<HTMLInputElement>this.el).value;
    }
    set html(v) {
        const x = this.html;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            if (this._isButton)
                (<HTMLButtonElement>this.el).innerHTML = v;
            else
                (<HTMLInputElement>this.el).value = v;
            this.raisePropertyChanged(PROP_NAME.html);
        }
    }
}

boot.registerElView("input:button", ButtonElView);
boot.registerElView("input:submit", ButtonElView);
boot.registerElView("button", ButtonElView);