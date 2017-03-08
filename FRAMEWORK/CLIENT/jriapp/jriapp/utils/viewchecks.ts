/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IElView } from "../int";

export class ViewChecks {
    static isElView: (obj: any) => boolean = () => { return false; };

    // DUMMY implementations template
    static isTemplateElView: (obj: any) => boolean = () => { return false; };

    // DUMMY implementations dataform
    static setIsInsideTemplate: (elView: IElView) => void = () => { };
    static isDataForm: (el: HTMLElement) => boolean = () => { return false; };
    static isInsideDataForm: (el: HTMLElement) => boolean = () => { return false; };
    static isInNestedForm: (root: any, forms: HTMLElement[], el: HTMLElement) => boolean = () => { return false; };
    static getParentDataForm: (rootForm: HTMLElement, el: HTMLElement) => HTMLElement = () => { return null; };
}
