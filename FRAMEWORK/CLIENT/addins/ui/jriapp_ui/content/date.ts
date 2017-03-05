/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IBaseObject, LocaleERRS as ERRS, Utils } from "jriapp_shared";
import { IConstructorContentOptions, IBindingInfo, IElView, IBindingOptions } from "jriapp/int";
import { DomUtils } from "jriapp/utils/dom";
import { BasicContent } from "./basic";

const utils = Utils, strUtils = utils.str, doc = DomUtils.document;

const NAME = "datepicker";

export class DateContent extends BasicContent {
    constructor(options: IConstructorContentOptions) {
        if (options.contentOptions.name !== NAME) {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, strUtils.format("contentOptions.name === '{0}'", NAME)));
        }
        super(options);
    }
    protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string): IBindingOptions {
        const options = super.getBindingOption(bindingInfo, tgt, dctx, targetPath);
        options.converter = this.app.getConverter("dateConverter");
        return options;
    }
    protected createTargetElement(): IElView {
        let el: HTMLElement;
        const info: { name: string; options: any; } = { name: null, options: null };
        if (this.isEditing && this.getIsCanBeEdited()) {
            el = doc.createElement("input");
            el.setAttribute("type", "text");
            info.options = this._options.options;
            info.name = NAME;
        } else {
            el = doc.createElement("span");
        }
        this.updateCss();
        this._el = el;
        return this.getElementView(this._el, info);
    }
    toString() {
        return "DateContent";
    }
}