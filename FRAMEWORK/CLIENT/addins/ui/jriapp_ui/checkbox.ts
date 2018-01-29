/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IValidationInfo, Utils } from "jriapp_shared";
import { IViewOptions } from "jriapp/int";
import { DomUtils } from "jriapp/utils/dom";
import { SubscribeFlags } from "jriapp/const";
import { bootstrap, subscribeWeakMap } from "jriapp/bootstrap";
import { cssStyles } from "./int";
import { InputElView } from "./input";

const dom = DomUtils, checks = Utils.check, boot = bootstrap, subscribeMap = subscribeWeakMap;

export class CheckBoxElView extends InputElView<HTMLInputElement> {
    private _checked: boolean;

    constructor(chk: HTMLInputElement, options?: IViewOptions) {
        super(chk, options);
        const self = this;
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
        const chk = this.el;
        if (this.checked !== chk.checked) {
            this.checked = chk.checked;
        }
        // stop propagation
        return true;
    }
    protected _updateState(): void {
        dom.setClass([this.el], cssStyles.checkedNull, !checks.isNt(this.checked));
    }
    // override
    protected _setErrors(el: HTMLElement, errors: IValidationInfo[]): void {
        const parent = el.parentElement;
        const mainEl = (!!parent && parent.tagName.toLowerCase() === "label") ? parent : el;
        super._setErrors(mainEl, errors);
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
            const chk = this.el;
            chk.checked = !!v;
            this._updateState();
            this.objEvents.raiseProp("checked");
        }
    }
}

boot.registerElView("input:checkbox", CheckBoxElView);
boot.registerElView("checkbox", CheckBoxElView);
