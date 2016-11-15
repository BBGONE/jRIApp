/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "jriapp_core/shared";
import { DomUtils } from "jriapp_utils/dom";
import { bootstrap } from "jriapp_core/bootstrap";
import { css, PROP_NAME, IEventChangedArgs, EVENT_CHANGE_TYPE } from "./generic";
import { ICommand } from "jriapp_core/mvvm";
import { CommandElView } from "./command";

const $ = DomUtils.$, boot = bootstrap;

export class ButtonElView extends CommandElView {
    constructor(options: IViewOptions) {
        super(options);
        let self = this;
        this.$el.on("click." + this.uniqueID, function (e) {
            self._onClick(e);
        });
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
        return this.$el.val();
    }
    set value(v) {
        let x = this.$el.val();
        if (v === null)
            v = "";
        else
            v = "" + v;
        if (x !== v) {
            this.$el.val(v);
            this.raisePropertyChanged(PROP_NAME.value);
        }
    }
    get text() {
        return this.$el.text();
    }
    set text(v) {
        let x = this.$el.text();
        if (v === null)
            v = "";
        else
            v = "" + v;
        if (x !== v) {
            this.$el.text(v);
            this.raisePropertyChanged(PROP_NAME.text);
        }
    }
    get html() {
        return this.$el.html();
    }
    set html(v) {
        let x = this.$el.html();
        if (v === null)
            v = "";
        else
            v = "" + v;
        if (x !== v) {
            this.$el.html(v);
            this.raisePropertyChanged(PROP_NAME.html);
        }
    }
}

boot.registerElView("input:button", ButtonElView);
boot.registerElView("input:submit", ButtonElView);
boot.registerElView("button", ButtonElView);