import { ITooltipService } from "jriapp/int";
import { TOOLTIP_SVC } from "jriapp/const";
import { bootstrap } from "jriapp/bootstrap";

const boot = bootstrap;

export function fn_addToolTip(el: Element, tip: string, isError?: boolean, pos?: string) {
    const svc = boot.getSvc<ITooltipService>(TOOLTIP_SVC);
    svc.addToolTip(el, tip, isError, pos);
}

export const enum cssStyles {
    fieldError = "ria-field-error",
    content = "ria-content-field",
    required = "ria-required-field",
    checkbox = "ria-checkbox",
    commandLink = "ria-command-link",
    checkedNull = "ria-checked-null",
    dataform = "ria-dataform",
    error = "ria-form-error",
    disabled = "disabled",
    opacity = "opacity",
    color = "color",
    fontSize = "font-size"
}