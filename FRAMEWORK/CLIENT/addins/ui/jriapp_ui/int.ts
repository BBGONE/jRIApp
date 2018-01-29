import { IValidationInfo } from "jriapp_shared";

export const UIERRORS_SVC = "IUIErrorsService";

export interface IUIErrorsService {
    setErrors(el: HTMLElement, errors: IValidationInfo[], toolTip?: string): void;
    setFormErrors(el: HTMLElement, errors: IValidationInfo[]): void;
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