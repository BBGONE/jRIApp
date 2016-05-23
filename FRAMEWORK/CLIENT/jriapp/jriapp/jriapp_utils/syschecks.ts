/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import * as coreMOD from "../jriapp_core/shared";

export class SysChecks {
    //DUMMY implementations
    static _isBaseObj: (obj: any) => boolean = (obj) => { return false; };
    static _isElView: (obj: any) => boolean = (obj) => { return false; };
    static _isBinding: (obj: any) => boolean = (obj) => { return false; };
    static _isPropBag: (obj: any) => boolean = (obj) => { return false; };
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