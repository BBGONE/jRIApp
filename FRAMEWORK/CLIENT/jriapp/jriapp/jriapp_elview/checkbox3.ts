/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "../jriapp_core/shared";
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { css, PROP_NAME } from "./elview";
import { InputElView } from "./input";

const dom = utils.dom, $ = dom.$;

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
        dom.setClass(this.$el.toArray(), css.checkedNull, !utils.check.isNt(this.checked));
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

bootstrap.registerElView("threeState", CheckBoxThreeStateElView);
bootstrap.registerElView("checkbox3", CheckBoxThreeStateElView);