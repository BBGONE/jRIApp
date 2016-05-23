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
import { BaseError } from "jriapp_core/shared";
import { Utils } from "jriapp_utils/utils";
import { IEntityItem } from "int";
import { DATA_OPER } from "const";

const strUtils = Utils.str;

export class DataOperationError extends BaseError {
    private _operationName: DATA_OPER;
    protected _origError: any;

    constructor(originalError: any, operationName: DATA_OPER) {
        let message: string;
        if (originalError instanceof Error)
            message = (<Error>originalError).message;
        else if (originalError instanceof BaseError)
            message = (<BaseError>originalError).message;

        if (!message)
            message = "" + originalError;
        super(message);
        this._origError = originalError;
        this._operationName = operationName;
   }
    get operationName() { return this._operationName; }

    get origError() {
        return this._origError;
   }
}
export class AccessDeniedError extends DataOperationError { }
export class ConcurrencyError extends DataOperationError { }
export class SvcValidationError extends DataOperationError { }
export class SubmitError extends DataOperationError {
    private _allSubmitted: IEntityItem[];
    private _notValidated: IEntityItem[];

    constructor(origError: any, allSubmitted: IEntityItem[], notValidated: IEntityItem[]) {
        let message = origError.message || ("" + origError);
        super(origError, DATA_OPER.Submit);
        this._origError = origError;
        this._allSubmitted = allSubmitted || [];
        this._notValidated = notValidated || [];
        if (this._notValidated.length > 0) {
            let res = [message + ":"];
            this._notValidated.forEach(function (item) {
                res.push(strUtils.format("item key:{0} errors:{1}", item._key, item._aspect.getErrorString()));
           });
            message = res.join("\r\n");
       }
   }
    get allSubmitted() { return this._allSubmitted; }
    get notValidated() { return this._notValidated; }
}