/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { LocaleERRS as ERRS, Utils } from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { KEYS } from "jriapp/const";
import { IConstructorContentOptions } from "jriapp/int";
import { DomUtils } from "jriapp/utils/dom";
import { TextAreaElView } from "../textarea";

import { BasicContent, IContentView, getView, getBindingOption } from "./basic";

const utils = Utils, NAME = "multyline", strUtils = utils.str, dom = DomUtils, document = dom.document;

export class MultyLineContent extends BasicContent {
    static _allowedKeys: number[] = null;

    private get allowedKeys() {
        if (!MultyLineContent._allowedKeys) {
            MultyLineContent._allowedKeys = [0, KEYS.backspace, KEYS.del, KEYS.left, KEYS.right, KEYS.end, KEYS.home, KEYS.tab, KEYS.esc, KEYS.enter];
        }
        return MultyLineContent._allowedKeys;
    }
    constructor(options: IConstructorContentOptions) {
        if (options.contentOptions.name !== NAME) {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, strUtils.format("contentOptions.name === '{0}'", NAME)));
        }
        super(options);
    }
    // override
    protected createdEditingView(): IContentView {
        const info: { name: string; options: any; } = { name: this.getViewName(true), options: this.options.options };
        const el = document.createElement("textarea");
        const view = getView(el, info);
        if (!!view) {
            this.lfScope.addObj(view);
        }
        const options = getBindingOption(true, this.options.fieldName, view, this.dataContext, "value", this.getConverter(true), this.getParam(true));
        this.lfScope.addObj(this.app.bind(options));
        return view;
    }
    // override
    protected createdReadingView(): IContentView {
        const info: { name: string; options: any; } = { name: this.getViewName(false), options: null };
        const el = document.createElement("div");
        const view = getView(el, info);
        if (!!view) {
            this.lfScope.addObj(view);
        }
        const options = getBindingOption(false, this.options.fieldName, view, this.dataContext, "value", this.getConverter(false), this.getParam(false));
        this.lfScope.addObj(this.app.bind(options));
        return view;
    }
    // override
    protected createView(): void {
        super.createView();
        const self = this, fieldInfo = self.getFieldInfo();
        if (self.view instanceof TextAreaElView) {
            (<TextAreaElView>self.view).addOnKeyPress(function (sender, args) {
                args.isCancel = !self.previewKeyPress(fieldInfo, args.keyCode, args.value);
            });
        }
    }
    protected previewKeyPress(fieldInfo: IFieldInfo, keyCode: number, value: string): boolean {
        if (this.allowedKeys.indexOf(keyCode) > -1) {
            return true;
        }
        return !(fieldInfo.maxLength > 0 && value.length >= fieldInfo.maxLength);
    }
    toString() {
        return "MultyLineContent";
    }
}
