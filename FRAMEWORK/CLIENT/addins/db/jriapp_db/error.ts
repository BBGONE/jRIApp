/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BaseError, Utils } from "jriapp_shared";
import { IEntityItem } from "./int";
import { DATA_OPER } from "./const";

const { format } = Utils.str;

export class DataOperationError extends BaseError {
    private _operationName: DATA_OPER;
    protected _origError: any;

    constructor(originalError: any, operationName: DATA_OPER) {
        let message: string;
        if (originalError instanceof Error) {
            message = (<Error>originalError).message;
        } else if (originalError instanceof BaseError) {
            message = (<BaseError>originalError).message;
        }

        if (!message) {
            message = "" + originalError;
        }
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
            const res = [message + ":"];
            this._notValidated.forEach(function (item) {
                res.push(format("item key:{0} errors:{1}", item._key, item._aspect.getErrorString()));
           });
            message = res.join("\r\n");
       }
   }
    get allSubmitted() { return this._allSubmitted; }
    get notValidated() { return this._notValidated; }
}
