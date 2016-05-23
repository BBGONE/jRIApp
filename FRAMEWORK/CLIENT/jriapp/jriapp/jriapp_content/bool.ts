import { BINDING_MODE } from "../jriapp_core/const";
import { IElView }  from "../jriapp_core/shared";
import { LifeTimeScope } from "../jriapp_utils/utils";
import { CheckBoxElView } from "../jriapp_elview/checkbox";

import { css } from "./int";
import { BasicContent } from "./basic";

export class BoolContent extends BasicContent {
    protected init() {
        this._target = this.createTargetElement();
        let bindingInfo = this._options.bindingInfo;
        if (!!bindingInfo) {
            this.updateCss();
            this._lfScope = new LifeTimeScope();
            let options = this.getBindingOption(bindingInfo, this._target, this._dataContext, "checked");
            options.mode = BINDING_MODE.TwoWay;
            this._lfScope.addObj(this.app.bind(options));
        }
    }
    //override
    protected cleanUp(): void {
        //noop
    }
    protected createCheckBoxView() {
        let el = document.createElement("input");
        el.setAttribute("type", "checkbox");
        let chbxView = new CheckBoxElView({ app: this.app, el: el });
        return chbxView;
    }
    protected createTargetElement(): IElView {
        let tgt = this._target;
        if (!tgt) {
            tgt = this.createCheckBoxView();
            this._el = tgt.el;
        }
        this._parentEl.appendChild(this._el);
        return tgt;
    }
    protected updateCss() {
        super.updateCss();
        let el = <HTMLInputElement>this._el;
        if (this.isEditing && this.getIsCanBeEdited()) {
            if (el.disabled)
                el.disabled = false;
        }
        else {
            if (!el.disabled)
                el.disabled = true;
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._lfScope) {
            this._lfScope.destroy();
            this._lfScope = null;
        }
        if (!!this._target) {
            this._target.destroy();
            this._target = null;
        }
        super.destroy();
    }
    render() {
        this.cleanUp();
        this.updateCss();
    }
    toString() {
        return "BoolContent";
    }
}