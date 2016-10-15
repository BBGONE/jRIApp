/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as coreMOD from "../jriapp_core/shared";

export class SysChecks {
    //DUMMY implementations
    static _isBaseObj: (obj: any) => boolean = (obj) => { return false; };
    static _isElView: (obj: any) => boolean = (obj) => { return false; };
    static _isBinding: (obj: any) => boolean = (obj) => { return false; };
    static _isPropBag: (obj: any) => boolean = (obj) => {
        return SysChecks._isBaseObj(obj) && obj.toString() === "IPBag";
    };
    static _isEventStore: (obj: any) => boolean = (obj) => { return false; };
    
    //DUMMY implementations collection
    static _isCollection: (obj: any) => boolean = (obj) => { return false; };
    static _getItemByProp: (obj: any, prop: string) => any = (obj, prop) => { return null; };
    static _isValidationError: (obj: any) => boolean = (obj) => { return false; };

    //DUMMY implementations template
    static _isTemplateElView: (obj: any) => boolean = (obj) => { return false; };

    //DUMMY implementations dataform
    static _setIsInsideTemplate: (elView: coreMOD.IElView) => void = (elView) => { };
    static _isDataForm: (el: HTMLElement) => boolean = (el) => { return false; };
    static _isInsideDataForm: (el: HTMLElement) => boolean = (el) => { return false; };
    static _isInNestedForm: (root: any, forms: HTMLElement[], el: HTMLElement) => boolean = (root: any, forms: HTMLElement[], el: HTMLElement) => { return false; };
    static _getParentDataForm: (rootForm: HTMLElement, el: HTMLElement) => HTMLElement = (rootForm: HTMLElement, el: HTMLElement) => { return null; };
}