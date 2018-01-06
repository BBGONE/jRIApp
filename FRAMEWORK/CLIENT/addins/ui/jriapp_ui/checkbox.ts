/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IViewOptions } from "jriapp/int";
import { Utils } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { SubscribeFlags } from "jriapp/const";
import { bootstrap, subscribeWeakMap } from "jriapp/bootstrap";
import { css } from "./baseview";
import { InputElView } from "./input";

const dom = DomUtils, checks = Utils.check, boot = bootstrap, subscribeMap = subscribeWeakMap;

export class CheckBoxElView extends InputElView {
    private _checked: boolean;

    constructor(options: IViewOptions) {
        super(options);
        const self = this, chk = <HTMLInputElement>this.el;
        this._checked = null;
        chk.checked = false;

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
    handle_change(e: Event): boolean {
        const chk = <HTMLInputElement>this.el;
        if (this.checked !== chk.checked) {
            this.checked = chk.checked;
        }
        // stop propagation
        return true;
    }
    protected _updateState(): void {
        dom.setClass([this.el], css.checkedNull, !checks.isNt(this.checked));
    }
    toString(): string {
        return "CheckBoxElView";
    }
    get checked(): boolean {
        return this._checked;
    }
    set checked(v: boolean) {
        if (this._checked !== v) {
            this._checked = v;
            const chk = <HTMLInputElement>this.el;
            chk.checked = !!v;
            this._updateState();
            this.objEvents.raiseProp("checked");
        }
    }
}

boot.registerElView("input:checkbox", CheckBoxElView);
boot.registerElView("checkbox", CheckBoxElView);
