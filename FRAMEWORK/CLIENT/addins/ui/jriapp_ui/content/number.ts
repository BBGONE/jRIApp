/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_TYPE } from "jriapp_shared/collection/const";
import { IBaseObject } from "jriapp_shared";
import { KEYS } from "jriapp/const";
import { IBindingOptions, IBindingInfo }  from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { TextBoxElView } from "../textbox";

import { BasicContent } from "./basic";

export class NumberContent extends BasicContent {
    static _allowedKeys: number[] = null;
    private get allowedKeys() {
        if (!NumberContent._allowedKeys) {
            NumberContent._allowedKeys = [0, KEYS.backspace, KEYS.del, KEYS.left, KEYS.right, KEYS.end, KEYS.home, KEYS.tab, KEYS.esc, KEYS.enter];
        }
        return NumberContent._allowedKeys;
    }
    protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string): IBindingOptions {
        const options = super.getBindingOption(bindingInfo, tgt, dctx, targetPath), finf = this.getFieldInfo();
        switch (finf.dataType) {
            case DATA_TYPE.Integer:
                options.converter = this.app.getConverter("integerConverter");
                break;
            case DATA_TYPE.Decimal:
                options.converter = this.app.getConverter("decimalConverter");
                break;
            default:
                options.converter = this.app.getConverter("floatConverter");
                break;
        }
        return options;
    }
    protected previewKeyPress(keyCode: number, value: string) {
        const ch = String.fromCharCode(keyCode), digits = "1234567890", defaults = bootstrap.defaults, notAllowedChars = "~@#$%^&*()+=_";
        if (notAllowedChars.indexOf(ch) > -1) {
            return false;
        }
        if (this.allowedKeys.indexOf(keyCode) > -1) {
            return true;
        }
        if (ch === "-" && value.length === 0) {
            return true;
        }
        if (ch === defaults.decimalPoint) {
            return (value.length === 0) ? false : value.indexOf(ch) < 0;
        }

        return (ch === defaults.thousandSep) ? true : digits.indexOf(ch) > -1;
    }
    render() {
        super.render();
        const self = this;
        if (self._target instanceof TextBoxElView) {
            (<TextBoxElView>self._target).addOnKeyPress(function (sender, args) {
                args.isCancel = !self.previewKeyPress(args.keyCode, args.value);
            });
        }
    }
    toString() {
        return "NumberContent";
    }
}
