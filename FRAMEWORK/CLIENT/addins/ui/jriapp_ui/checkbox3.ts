/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IViewOptions } from "jriapp/int";
import { Utils } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { SubscribeFlags } from "jriapp/const";
import { bootstrap, subscribeWeakMap } from "jriapp/bootstrap";
import { InputElView } from "./input";
import { css } from "./baseview";

const checks = Utils.check, dom = DomUtils, boot = bootstrap, subscribeMap = subscribeWeakMap;

export class CheckBoxThreeStateElView extends InputElView {
    private _checked: boolean;

    constructor(options: IViewOptions) {
        super(options);
        const self = this, chk = <HTMLInputElement>this.el;
        this._checked = null;
        chk.checked = false;
        chk.indeterminate = this._checked === null;

        if (this.isDelegationOn) {
            subscribeMap.set(this.el, this);
            this._setIsSubcribed(SubscribeFlags.change);
        } else {
            dom.events.on(this.el, "change", (e) => {
                e.stopPropagation();
                self.handle_change(e);
            }, this.uniqueID);
        }
        this._updateState();
    }
    handle_change(e: Event) {
        if (this.checked === null) {
            this.checked = true;
        } else {
            this.checked = !this.checked ? null : false;
        }
    }
    protected _updateState() {
        dom.setClass([this.el], css.checkedNull, !checks.isNt(this.checked));
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
            const chk = <HTMLInputElement>this.el;
            chk.checked = !!v;
            chk.indeterminate = this._checked === null;
            this._updateState();
            this.objEvents.raiseProp("checked");
        }
    }
}

boot.registerElView("threeState", CheckBoxThreeStateElView);
boot.registerElView("checkbox3", CheckBoxThreeStateElView);
