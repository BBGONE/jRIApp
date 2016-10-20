/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "../jriapp_core/shared";
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { css, PROP_NAME } from "./elview";
import { InputElView } from "./input";

const dom = utils.dom, $ = dom.$;

export class CheckBoxThreeStateElView extends InputElView {
    private _checked: boolean;
    private _val: number;

    constructor(options: IViewOptions) {
        super(options);
        let self = this, el: any = this.el;
        this._checked = el.checked;
        this._val = this._checked === null ? 1 : (!!this._checked ? 2 : 0);
        this.$el.on("change." + this.uniqueID, function (e) {
            e.stopPropagation();
            switch (self._val) {
                // unchecked, going indeterminate
                case 0:
                    self._val = 1;
                    break;
                // indeterminate, going checked
                case 1:
                    self._val = 2;
                    break;
                // checked, going unchecked
                default:
                    self._val = 0;
                    break;

            }
            self.checked = (self._val === 1) ? null : ((self._val === 2) ? true : false);
        });
    }
    toString() {
        return "CheckBoxThreeStateElView";
    }
    get checked() { return this._checked; }
    set checked(v) {
        let el: any = this.el;
        if (v !== this._checked) {
            this._checked = v;
            switch (this._checked) {
                case null:
                    el.indeterminate = true;
                    this._val = 1;
                    break;
                case true:
                    el.indeterminate = false;
                    el.checked = true;
                    this._val = 2;
                    break;
                default:
                    el.indeterminate = false;
                    el.checked = false;
                    this._val = 0;
                    break;
            }
            this.raisePropertyChanged(PROP_NAME.checked);
        }
    }
}

bootstrap.registerElView("threeState", CheckBoxThreeStateElView);
bootstrap.registerElView("checkbox", CheckBoxThreeStateElView);