/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "../jriapp_core/shared";
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { css, PROP_NAME } from "./elview";
import { InputElView } from "./input";

const dom = utils.dom, $ = dom.$;

export class CheckBoxElView extends InputElView {
    private _checked: boolean;

    constructor(options: IViewOptions) {
        super(options);
        let self = this, el: any = this.el;
        this._checked = el.checked;
        this.$el.on("change." + this.uniqueID, function (e) {
            e.stopPropagation();
            self._onChange(this.checked);
        });
        this._updateState();
    }
    protected _onChange(checked: boolean) {
        this.checked = checked;
    }
    protected _updateState() {
        dom.setClass(this.$el.toArray(), css.checkedNull, !utils.check.isNt(this.checked));
    }
    toString() {
        return "CheckBoxElView";
    }
    get checked() { return this._checked; }
    set checked(v) {
        let el: any = this.el;
        if (v !== null)
            v = !!v;
        if (v !== this._checked) {
            this._checked = v;
            el.checked = !!this._checked;
            this._updateState();
            this.raisePropertyChanged(PROP_NAME.checked);
        }
    }
}

bootstrap.registerElView("input:checkbox", CheckBoxElView);