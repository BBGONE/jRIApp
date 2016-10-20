/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "../jriapp_core/shared";
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { css, PROP_NAME } from "./elview";
import { CheckBoxElView } from "./checkbox";

const dom = utils.dom, $ = dom.$;

export class RadioElView extends CheckBoxElView {
    protected _onChange(checked: boolean) {
        this.checked = checked;
        this._updateGroup();
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
    toString() {
        return "RadioElView";
    }
    get value(): string { return this.$el.val(); }
    set value(v) {
        let strv = utils.core.check.isNt(v)? "" : ("" + v);
        if (strv !== this.$el.val()) {
            this.$el.val(strv);
            this.raisePropertyChanged(PROP_NAME.value);
        }
    }
    get name(): string { return this.$el.prop("name"); }
}

bootstrap.registerElView("input:radio", RadioElView);