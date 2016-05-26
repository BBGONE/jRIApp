/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "../jriapp_core/shared";
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { css, PROP_NAME } from "./elview";
import { InputElView } from "./input";

const $ = utils.dom.$;

export class CheckBoxThreeStateElView extends InputElView {
    private _val: boolean;
    private _cbxVal: number;

    constructor(options: IViewOptions) {
        super(options);
        let self = this;
        this._val = this.$el.prop("checked");
        this._cbxVal = this._val === null ? 1 : (!!this._val ? 2 : 0);
        let $el = this.$el;
        $el.on("change." + this.uniqueID, function (e) {
            e.stopPropagation();
            switch (self._cbxVal) {
                // unchecked, going indeterminate
                case 0:
                    self._cbxVal = 1;
                    break;
                // indeterminate, going checked
                case 1:
                    self._cbxVal = 2;
                    break;
                // checked, going unchecked
                default:
                    self._cbxVal = 0;
                    break;

            }
            self.checked = (self._cbxVal === 1) ? null : ((self._cbxVal === 2) ? true : false);
        });
    }
    protected _setFieldError(isError: boolean) {
        let $el = this.$el;
        if (isError) {
            let div = $("<div></div>").addClass(css.fieldError);
            $el.wrap(div);
        }
        else {
            if ($el.parent("." + css.fieldError).length > 0)
                $el.unwrap();
        }
    }
    toString() {
        return "CheckBoxThreeStateElView";
    }
    get checked() { return this._val; }
    set checked(v) {
        let $el = this.$el;
        if (v !== this._val) {
            this._val = v;
            switch (this._val) {
                case null:
                    $el.prop("indeterminate", true);
                    this._cbxVal = 1;
                    break;
                case true:
                    $el.prop("indeterminate", false);
                    $el.prop("checked", true);
                    this._cbxVal = 2;
                    break;
                default:
                    $el.prop("indeterminate", false);
                    $el.prop("checked", false);
                    this._cbxVal = 0;
                    break;
            }
            this.raisePropertyChanged(PROP_NAME.checked);
        }
    }
}

bootstrap.registerElView("threeState", CheckBoxThreeStateElView);
bootstrap.registerElView("checkbox", CheckBoxThreeStateElView);