/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "../jriapp_core/shared";
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { css, PROP_NAME, IEventChangedArgs, EVENT_CHANGE_TYPE } from "./elview";
import { CommandElView } from "./command";
import { ICommand } from "../jriapp_core/mvvm";

const $ = utils.dom.$;

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

bootstrap.registerElView("input:button", ButtonElView);
bootstrap.registerElView("input:submit", ButtonElView);
bootstrap.registerElView("button", ButtonElView);