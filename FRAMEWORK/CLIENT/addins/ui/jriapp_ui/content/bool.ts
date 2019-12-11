/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { DomUtils } from "jriapp/utils/dom";
import { IConstructorContentOptions } from "jriapp/int";
import { cssStyles } from "../int";
import { BasicContent, IContentView, getBindingOption, getView } from "./basic";


const dom = DomUtils, doc = dom.document;

export class BoolContent extends BasicContent {
    private _label: HTMLElement;

    constructor(options: IConstructorContentOptions) {
        super(options);
        this._label = null;
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        super.dispose();
        // do it at the end!
        if (!!this._label) {
            dom.removeNode(this._label);
            this._label = null;
        }
    }
    protected createCheckBoxView(): IContentView {
        const finf = this.getFieldInfo(), isNullable = !finf ? false: finf.isNullable;
        
        const chk = document.createElement("input");
        chk.setAttribute("type", "checkbox");
        dom.addClass([chk], cssStyles.checkbox);
        const view = isNullable ? getView(chk, "checkbox3", {}) : getView(chk, "checkbox", {});
        if (!!view) {
            this.lfScope.addObj(view);
        }
        const label = doc.createElement("label");
        dom.addClass([label], cssStyles.checkbox);
        label.appendChild(view.el);
        label.appendChild(doc.createElement("span"));
        this._label = label;

        const options = getBindingOption(true, this.options.fieldName, view, this.dataContext, "checked");
        this.lfScope.addObj(this.app.bind(options));
        return view;
    }
    // override
    protected createdEditingView(): IContentView {
        return this.createCheckBoxView();
    }
    // overrride
    protected createdReadingView(): IContentView {
        return this.createCheckBoxView();
    }
    // override
    protected beforeCreateView(): boolean {
        const res = !this.view && !!this.options.fieldName;
        if (!!this.view) {
            this.updateCss();
        }
        return res;
    }
    // override
    protected afterCreateView(): void {
        this.parentEl.appendChild(this._label);
    }
    // override
    protected updateCss() {
        super.updateCss();
        const el = <HTMLInputElement>this.el;
        if (this.isEditing && this.getIsCanBeEdited()) {
             el.disabled = false;
        } else {
             el.disabled = true;
        }
    }
    toString() {
        return "BoolContent";
    }
}
