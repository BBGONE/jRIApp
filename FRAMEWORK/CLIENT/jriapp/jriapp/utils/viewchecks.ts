/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IElView } from "../shared";

export class ViewChecks {
    static isElView: (obj: any) => boolean = (obj) => { return false; };

    //DUMMY implementations template
    static isTemplateElView: (obj: any) => boolean = (obj) => { return false; };

    //DUMMY implementations dataform
    static setIsInsideTemplate: (elView: IElView) => void = (elView) => { };
    static isDataForm: (el: HTMLElement) => boolean = (el) => { return false; };
    static isInsideDataForm: (el: HTMLElement) => boolean = (el) => { return false; };
    static isInNestedForm: (root: any, forms: HTMLElement[], el: HTMLElement) => boolean = (root: any, forms: HTMLElement[], el: HTMLElement) => { return false; };
    static getParentDataForm: (rootForm: HTMLElement, el: HTMLElement) => HTMLElement = (rootForm: HTMLElement, el: HTMLElement) => { return null; };
}