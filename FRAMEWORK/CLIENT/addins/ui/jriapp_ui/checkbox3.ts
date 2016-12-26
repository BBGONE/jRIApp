/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
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
        let self = this;
        let chk = <HTMLInputElement>this.el;
        this._checked = null;
        chk.checked = false;
        chk.indeterminate = this._checked === null;

        this.$el.on("click." + this.uniqueID, function (e) {
            e.stopPropagation();
            if (self.checked === null)
                self.checked = true;
            else
                self.checked = !self.checked ? null : false;
        });
        this._updateState();
    }
    protected _updateState() {
        dom.setClass(this.$el.toArray(), css.checkedNull, !checks.isNt(this.checked));
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
            let chk = <HTMLInputElement>this.el;
            chk.checked = !!v;
            chk.indeterminate = this._checked === null;
            this._updateState();
            this.raisePropertyChanged(PROP_NAME.checked);
        }
    }
}

boot.registerElView("threeState", CheckBoxThreeStateElView);
boot.registerElView("checkbox3", CheckBoxThreeStateElView);