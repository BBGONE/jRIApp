/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IValidationInfo, LocaleSTRS as STRS } from "jriapp_shared";
import { cssStyles, fn_addToolTip } from "../int";
import { DomUtils } from "jriapp/utils/dom";

const dom = DomUtils;

export function getErrorTipInfo(errors: IValidationInfo[]): string {
    const tip = ["<b>", STRS.VALIDATE.errorInfo, "</b>", "<br/>"];
    errors.forEach((info) => {
        let res = "";
        info.errors.forEach((str) => {
            res = res + " " + str;
        });
        tip.push(res);
        res = "";
    });
    return tip.join("");
}

function setError(el: HTMLElement, isError: boolean): void {
    dom.setClass([el], cssStyles.fieldError, !isError);
}

export function addError(el: HTMLElement): void {
    setError(el, true);
}

export function removeError(el: HTMLElement): void {
    setError(el, false);
}

export class ErrorHelper {
    static setErrors(el: HTMLElement, errors: IValidationInfo[], toolTip?: string): void {
        if (!!errors && errors.length > 0) {
            fn_addToolTip(el, getErrorTipInfo(errors), true);
            addError(el);
        } else {
            fn_addToolTip(el, toolTip);
            removeError(el);
        }
    }
}