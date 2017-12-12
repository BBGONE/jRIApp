/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IElView } from "../int";

export class ViewChecks {
    static isElView: (obj: any) => boolean = () => { return false; };

    // DUMMY implementations template
    static isTemplateElView: (obj: any) => boolean = () => { return false; };

    // DUMMY implementations dataform
    static setIsInsideTemplate: (elView: IElView) => void = () => { };
    static isDataForm: (el: Element) => boolean = () => { return false; };
    static isInsideDataForm: (el: Element) => boolean = () => { return false; };
    static isInNestedForm: (root: any, forms: Element[], el: Element) => boolean = () => { return false; };
    static getParentDataForm: (rootForm: Element, el: Element) => Element = () => { return null; };
}
