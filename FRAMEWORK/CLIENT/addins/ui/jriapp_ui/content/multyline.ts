﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { LocaleERRS as ERRS, Utils } from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { KEYS } from "jriapp/const";
import { IConstructorContentOptions } from "jriapp/int";
import { DomUtils } from "jriapp/utils/dom";
import { TextAreaElView } from "../textarea";

import { BasicContent, IContentView } from "./basic";

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
    protected createTargetElement(): IContentView {
        let el: HTMLElement;
        const info: { name: string; options: any; } = { name: null, options: null };
        if (this.isEditing && this.getIsCanBeEdited()) {
            el = document.createElement("textarea");
            info.options = this._options.options;
            info.name = null;
        } else {
            el = document.createElement("div");
        }
        this.updateCss();
        this._el = el;
        return this.getElementView(this._el, info);
    }
    protected previewKeyPress(fieldInfo: IFieldInfo, keyCode: number, value: string): boolean {
        if (this.allowedKeys.indexOf(keyCode) > -1) {
            return true;
        }
        return !(fieldInfo.maxLength > 0 && value.length >= fieldInfo.maxLength);
    }
    render(): void {
        super.render();
        const self = this, fieldInfo = self.getFieldInfo();

        if (self._target instanceof TextAreaElView) {
            (<TextAreaElView>self._target).addOnKeyPress(function (sender, args) {
                args.isCancel = !self.previewKeyPress(fieldInfo, args.keyCode, args.value);
            });
        }
    }
    toString() {
        return "MultyLineContent";
    }
}
