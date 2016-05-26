/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { KEYS } from "../jriapp_core/const";
import { ERRS } from "../jriapp_core/lang";
import { IApplication, IElView, IConstructorContentOptions, IFieldInfo }  from "../jriapp_core/shared";
import { Utils as utils } from "../jriapp_utils/utils";
import { TextAreaElView } from "../jriapp_elview/textarea";

import { css } from "./int";
import { BasicContent } from "./basic";

const NAME = "multyline", strUtils = utils.str, document = utils.dom.document;

export class MultyLineContent extends BasicContent {
    static __allowedKeys: number[] = null;
    private get _allowedKeys() {
        if (!MultyLineContent.__allowedKeys) {
            MultyLineContent.__allowedKeys = [0, KEYS.backspace, KEYS.del, KEYS.left, KEYS.right, KEYS.end, KEYS.home, KEYS.tab, KEYS.esc, KEYS.enter];
        }
        return MultyLineContent.__allowedKeys;
    }
    constructor(options: IConstructorContentOptions) {
        if (options.contentOptions.name !== NAME) {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, strUtils.format("contentOptions.name === '{0}'", NAME)));
        }
        super(options);
    }
    protected createTargetElement(): IElView {
        let el: HTMLElement, info: { name: string; options: any; } = { name: null, options: null };
        if (this.isEditing && this.getIsCanBeEdited()) {
            el = document.createElement("textarea");
            info.options = this._options.options;
            info.name = null;
        }
        else {
            el = document.createElement("div");
        }
        this.updateCss();
        this._el = el;
        return this.getElementView(this._el, info);
    }
    protected render() {
        super.render();
        let self = this, fieldInfo = self.getFieldInfo();

        if (self._target instanceof TextAreaElView) {
            (<TextAreaElView>self._target).addOnKeyPress(function (sender, args) {
                args.isCancel = !self.previewKeyPress(fieldInfo, args.keyCode, args.value);
            });
        }
    }
    protected previewKeyPress(fieldInfo: IFieldInfo, keyCode: number, value: string) {
        if (this._allowedKeys.indexOf(keyCode) > -1)
            return true;
        return !(fieldInfo.maxLength > 0 && value.length >= fieldInfo.maxLength);
    }
    toString() {
        return "MultyLineContent";
    }
}