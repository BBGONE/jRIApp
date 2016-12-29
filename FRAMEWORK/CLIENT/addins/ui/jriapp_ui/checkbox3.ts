/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { IViewOptions } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { InputElView } from "./input";
import { css, PROP_NAME } from "./baseview";

const checks = Utils.check, dom = DomUtils, boot = bootstrap;

export class CheckBoxThreeStateElView extends InputElView {
    private _checked: boolean;

    constructor(options: IViewOptions) {
        super(options);
        const self = this, chk = <HTMLInputElement>this.el;
        this._checked = null;
        chk.checked = false;
        chk.indeterminate = this._checked === null;

        dom.events.on(this.el, "click", function (e) {
            e.stopPropagation();
            if (self.checked === null)
                self.checked = true;
            else
                self.checked = !self.checked ? null : false;
        }, this.uniqueID);

        this._updateState();
    }
    protected _updateState() {
        dom.setClass([this.el], css.checkedNull, !checks.isNt(this.checked));
    }
    toString() {
        return "CheckBoxThreeStateElView";
    }
    get checked(): boolean {
        return this._checked;
    }
    set checked(v: boolean) {
        if (this._checked !== v) {
            this._checked = v;
            const chk = <HTMLInputElement>this.el;
            chk.checked = !!v;
            chk.indeterminate = this._checked === null;
            this._updateState();
            this.raisePropertyChanged(PROP_NAME.checked);
        }
    }
}

boot.registerElView("threeState", CheckBoxThreeStateElView);
boot.registerElView("checkbox3", CheckBoxThreeStateElView);