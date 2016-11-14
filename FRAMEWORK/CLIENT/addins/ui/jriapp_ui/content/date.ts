/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IApplication, IConstructorContentOptions, IBindingInfo, IBindingOptions,
    IElView, IBaseObject
} from "jriapp_core/shared";
import { ERRS } from "jriapp_core/lang";
import { Utils } from "jriapp_utils/utils";

import { css } from "./int";
import { BasicContent } from "./basic";

const utils = Utils, strUtils = utils.str, doc = utils.dom.document;

const NAME = "datepicker";

export class DateContent extends BasicContent {
    constructor(options: IConstructorContentOptions) {
        if (options.contentOptions.name !== NAME) {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, strUtils.format("contentOptions.name === '{0}'", NAME)));
        }
        super(options);
    }
    protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string) {
        let options = super.getBindingOption(bindingInfo, tgt, dctx, targetPath);
        options.converter = this.app.getConverter("dateConverter");
        return options;
    }
    protected createTargetElement(): IElView {
        let el: HTMLElement, info: { name: string; options: any; } = { name: null, options: null };
        if (this.isEditing && this.getIsCanBeEdited()) {
            el = doc.createElement("input");
            el.setAttribute("type", "text");
            info.options = this._options.options;
            info.name = NAME;
        }
        else {
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