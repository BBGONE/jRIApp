import { IValidationInfo } from "jriapp_shared";
import { IViewErrorsService } from "jriapp/int";

export interface IFormErrorsService {
    setFormErrors(el: HTMLElement, errors: IValidationInfo[]): void;
}

export interface IUIErrorsService extends IViewErrorsService, IFormErrorsService {
}

export const enum cssStyles {
    fieldError = "ria-field-error",
    content = "ria-content-field",
    required = "ria-required-field",
    editMode = "ria-edit-mode",
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