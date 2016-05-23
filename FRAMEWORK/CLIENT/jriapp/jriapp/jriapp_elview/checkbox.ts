import { IViewOptions } from "../jriapp_core/shared";
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { css, PROP_NAME } from "./elview";
import { InputElView } from "./input";

const $ = utils.dom.$;

export class CheckBoxElView extends InputElView {
    private _val: boolean;

    constructor(options: IViewOptions) {
        super(options);
        let self = this;
        this._val = this.$el.prop("checked");
        this.$el.on("change." + this.uniqueID, function (e) {
            e.stopPropagation();
            self.checked = this.checked;
        });
    }
    protected _setFieldError(isError: boolean) {
        let $el = this.$el;
        if (isError) {
            let span = $("<div></div>").addClass(css.fieldError);
            $el.wrap(span);
        }
        else {
            if ($el.parent("." + css.fieldError).length > 0)
                $el.unwrap();
        }
    }
    toString() {
        return "CheckBoxElView";
    }
    get checked() { return this._val; }
    set checked(v) {
        if (v !== null)
            v = !!v;
        if (v !== this._val) {
            this._val = v;
            this.$el.prop("checked", !!this._val);
            if (utils.core.check.isNt(this._val)) {
                this.$el.css(css.opacity, 0.33);
            }
            else
                this.$el.css(css.opacity, 1.0);

            this.raisePropertyChanged(PROP_NAME.checked);
        }
    }
}

bootstrap.registerElView("input:checkbox", CheckBoxElView);