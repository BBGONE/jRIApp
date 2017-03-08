/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { KEYS } from "jriapp/const";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { TextBoxElView } from "../textbox";

import { BasicContent } from "./basic";

export class StringContent extends BasicContent {
    static _allowedKeys: number[] = null;

    private get allowedKeys() {
        if (!StringContent._allowedKeys) {
            StringContent._allowedKeys = [0, KEYS.backspace, KEYS.del, KEYS.left, KEYS.right, KEYS.end, KEYS.home, KEYS.tab, KEYS.esc, KEYS.enter];
        }
        return StringContent._allowedKeys;
    }
    protected previewKeyPress(fieldInfo: IFieldInfo, keyCode: number, value: string) {
        if (this.allowedKeys.indexOf(keyCode) > -1) {
            return true;
        }
        return !(fieldInfo.maxLength > 0 && value.length >= fieldInfo.maxLength);
    }
    render() {
        super.render();
        const self = this, fieldInfo = self.getFieldInfo();
        if (self._target instanceof TextBoxElView) {
            (<TextBoxElView>self._target).addOnKeyPress(function (sender, args) {
                args.isCancel = !self.previewKeyPress(fieldInfo, args.keyCode, args.value);
            });
        }
    }
    toString() {
        return "StringContent";
    }
}
