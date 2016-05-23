import { IViewOptions } from "../jriapp_core/shared";
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { css, PROP_NAME } from "./elview";
import { InputElView } from "./input";

const $ = utils.dom.$;

export class RadioElView extends InputElView {
    private _val: boolean;

    constructor(options: IViewOptions) {
        super(options);
        let self = this;
        this._val = this.$el.prop("checked");
        this.$el.on("change." + this.uniqueID, function (e) {
            e.stopPropagation();
            self.checked = this.checked;
            self._updateGroup();
        });
    }
    protected _updateGroup() {
        let groupName = this.name, self = this;
        if (!groupName)
            return;
        let parent = this.el.parentElement;
        if (!parent)
            return;
        let selfEl = self.el;
        $('input[type="radio"][name="' + groupName + '"]', parent).each(function (index, el) {
            if (selfEl !== this) {
                let vw = <RadioElView>self.app.elViewFactory.store.getElView(<HTMLElement>this);
                if (!!vw) {
                    vw.checked = this.checked;
                }
            }
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
        return "RadioElView";
    }
    get checked() { return this._val; }
    set checked(v) {
        let el = this.el;
        if (v !== null)
            v = !!v;
        if (v !== this._val) {
            this._val = v;
            this.$el.prop("checked", !!this._val);
            if (utils.core.check.isNt(this._val)) {
                this.$el.css("opacity", 0.33);
            }
            else
                this.$el.css(css.opacity, 1.0);
            this.raisePropertyChanged(PROP_NAME.checked);
        }
    }
    get value(): string { return this.$el.val(); }
    set value(v) {
        let strv = "" + v;
        if (utils.core.check.isNt(v))
            strv = "";
        if (strv !== this.$el.val()) {
            this.$el.val(strv);
            this.raisePropertyChanged(PROP_NAME.value);
        }
    }
    get name(): string { return this.$el.prop("name"); }
}

bootstrap.registerElView("input:radio", RadioElView);