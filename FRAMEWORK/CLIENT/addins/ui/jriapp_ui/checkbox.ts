/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { DomUtils } from "jriapp/utils/dom";
import { IViewOptions } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { css, PROP_NAME } from "./baseview";
import { InputElView } from "./input";

const dom = DomUtils, checks = Utils.check, boot = bootstrap;

export class CheckBoxElView extends InputElView {
    private _checked: boolean;

    constructor(options: IViewOptions) {
        super(options);
        const self = this, chk = <HTMLInputElement>this.el;
        this._checked = null;
        chk.checked = false;

        this.$el.on("change." + this.uniqueID, function (e) {
            e.stopPropagation();
            if (self.checked !== this.checked)
                self.checked = this.checked;
        });
        this._updateState();
    }
    protected _updateState() {
        dom.setClass([this.el], css.checkedNull, !checks.isNt(this.checked));
    }
    toString() {
        return "CheckBoxElView";
    }
    get checked(): boolean {
        return this._checked;
    }
    set checked(v: boolean) {
        if (this._checked !== v) {
            this._checked = v;
            const chk = <HTMLInputElement>this.el;
            chk.checked = !!v;
            this._updateState();
            this.raisePropertyChanged(PROP_NAME.checked);
        }
    }
}

boot.registerElView("input:checkbox", CheckBoxElView);
boot.registerElView("checkbox", CheckBoxElView);