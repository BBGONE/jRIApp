/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { LocaleERRS as ERRS, Utils } from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { KEYS } from "jriapp/consts";
import { IConstructorContentOptions } from "jriapp/int";
import { DomUtils } from "jriapp/utils/dom";
import { TextAreaElView } from "../textarea";

import { BasicContent, IContentView, getView, getBindingOption } from "./basic";

const utils = Utils, NAME = "multyline", { format } = utils.str, dom = DomUtils, doc = dom.document;

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
            throw new Error(format(ERRS.ERR_ASSERTION_FAILED, `contentOptions.name === '${NAME}'`));
        }
        super(options);
    }
    // override
    protected createdEditingView(): IContentView {
        const name = this.getViewName(true), el = doc.createElement("textarea"), options = this.options.options;
        const view = getView(el, name, options);
        if (!!view) {
            this.lfScope.addObj(view);
        }
        const bindOption = getBindingOption(true, this.options.fieldName, view, this.dataContext, "value", this.getConverter(true), this.getParam(true));
        this.lfScope.addObj(this.app.bind(bindOption));
        return view;
    }
    // override
    protected createdReadingView(): IContentView {
        const name = this.getViewName(false), el = doc.createElement("div");
        const view = getView(el, name, {});
        if (!!view) {
            this.lfScope.addObj(view);
        }
        const bindOption = getBindingOption(false, this.options.fieldName, view, this.dataContext, "value", this.getConverter(false), this.getParam(false));
        this.lfScope.addObj(this.app.bind(bindOption));
        return view;
    }
    // override
    protected createView(): void {
        super.createView();
        const self = this, fieldInfo = self.getFieldInfo();
        if (self.view instanceof TextAreaElView) {
            (<TextAreaElView>self.view).addOnKeyPress(function (_, args) {
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
