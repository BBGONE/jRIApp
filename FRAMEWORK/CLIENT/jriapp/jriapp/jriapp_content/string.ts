/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { KEYS } from "../jriapp_core/const";
import { IFieldInfo }  from "../jriapp_core/shared";
import { TextBoxElView } from "../jriapp_elview/textbox";

import { css } from "./int";
import { BasicContent } from "./basic";

export class StringContent extends BasicContent {
    static __allowedKeys: number[] = null;
    private get _allowedKeys() {
        if (!StringContent.__allowedKeys) {
            StringContent.__allowedKeys = [0, KEYS.backspace, KEYS.del, KEYS.left, KEYS.right, KEYS.end, KEYS.home, KEYS.tab, KEYS.esc, KEYS.enter];
        }
        return StringContent.__allowedKeys;
    }
    protected render() {
        super.render();
        let self = this, fieldInfo = self.getFieldInfo();
        if (self._target instanceof TextBoxElView) {
            (<TextBoxElView>self._target).addOnKeyPress(function (sender, args) {
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
        return "StringContent";
    }

}