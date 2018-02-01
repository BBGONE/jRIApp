/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IElView } from "../int";

function dummyIsElView(obj: any): obj is IElView {
    return false;
}

export class ViewChecks {
    static isElView: (obj: any) => obj is IElView = dummyIsElView;

    // DUMMY implementations template
    static isTemplateElView: (obj: any) => boolean = () => { return false; };

    // DUMMY implementations dataform
    static isDataForm: (el: Element) => boolean = () => { return false; };
    static isInsideDataForm: (el: Element) => boolean = () => { return false; };
    static isInNestedForm: (root: any, forms: Element[], el: Element) => boolean = () => { return false; };
    static getParentDataForm: (rootForm: HTMLElement, el: HTMLElement) => HTMLElement = () => { return null; };
}
