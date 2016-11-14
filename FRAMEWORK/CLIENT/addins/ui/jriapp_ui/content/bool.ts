/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BINDING_MODE } from "jriapp_core/const";
import { IElView } from "jriapp_core/shared";
import { LifeTimeScope } from "jriapp_utils/lifetime";
import { Utils } from "jriapp_utils/utils";
import { CheckBoxElView } from "../checkbox";

import { css } from "./int";
import { BasicContent } from "./basic";

const dom = Utils.dom, doc = dom.document;

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
        let chk = document.createElement("input");
        chk.setAttribute("type", "checkbox");
        dom.addClass([chk], css.checkbox);
        let chbxView = new CheckBoxElView({ el: chk });
        return chbxView;
    }
    protected createTargetElement(): IElView {
        let tgt = this._target;
        if (!tgt) {
            tgt = this.createCheckBoxView();
            this._el = tgt.el;
        }
        let label = doc.createElement("label");
        dom.addClass([label], css.checkbox);
        label.appendChild(this._el);
        label.appendChild(doc.createElement("span"));
        this._parentEl.appendChild(label);
        return tgt;
    }
    protected updateCss() {
        super.updateCss();
        let el = <HTMLInputElement>this._el;
        if (this.isEditing && this.getIsCanBeEdited()) {
             el.disabled = false;
        }
        else {
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