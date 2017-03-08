/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DUMY_ERROR } from "./const";
import { SysUtils } from "./utils/sysutils";
import { IValidationInfo } from "./int";
import { ERRS, STRS } from "./lang";

const sys = SysUtils;

export class BaseError {
    private _message: string;

    constructor(message?: string) {
        this._message = message || "Error";
    }
    toString() {
        return this._message;
    }
    get isDummy() {
        return false;
    }
    get message() {
        return this._message;
    }
}

export class DummyError extends BaseError {
    private _origError: any;

    constructor(originalError: any) {
        super(DUMY_ERROR);
        this._origError = originalError;
    }
    get isDummy() {
        return true;
    }
    get origError() {
        return this._origError;
    }
}

export class AbortError extends BaseError {
    private _reason: string;

    constructor(reason?: string) {
        super(DUMY_ERROR);
        this._reason = reason || "Operation Aborted";
    }
    get isDummy() {
        return true;
    }
    get reason() {
        return this._reason;
    }
}

export class AggregateError extends BaseError {
    private _errors: any[];

    constructor(errors?: any[]) {
        super("AggregateError");
        this._errors = errors || [];
    }

    get errors() {
        return this._errors;
    }

    get count() {
        return this._errors.length;
    }

    get message() {
        const hashMap: {
            [name: string]: any;
        } = {};
        this._errors.forEach((err) => {
            if (!err) {
                return;
            }
            let str = "";
            if (err instanceof AggregateError) {
                str = (<AggregateError>err).message;
            } else if (err instanceof Error) {
                str = (<Error>err).message;
            } else if (!!err.message) {
                str = "" + err.message;
            } else {
                str = "" + err;
            }

            hashMap[str] = "";
        });

        let msg = "";
        const errs = Object.keys(hashMap);

        errs.forEach((err) => {
            if (!!msg) {
                msg += "\r\n";
            }
            msg += "" + err;
        });

        if (!msg) {
            msg = "Aggregate Error";
        }
        return msg;
    }

    toString() {
        return "AggregateError: " + "\r\n" + this.message;
    }
}


sys.isValidationError = (obj: any) => {
    return (!!obj && obj instanceof ValidationError);
};

export class ValidationError extends BaseError {
    private _validations: IValidationInfo[];
    private _item: any;

    constructor(validations: IValidationInfo[], item: any) {
        let message = ERRS.ERR_VALIDATION + "\r\n";
        validations.forEach(function (err, i) {
            if (i > 0) {
                message = message + "\r\n";
            }
            if (!!err.fieldName) {
                message = message + " " + STRS.TEXT.txtField + ": '" + err.fieldName + "'  " + err.errors.join(", ");
            } else {
                message = message + err.errors.join(", ");
            }
        });
        super(message);
        this._validations = validations;
        this._item = item;
    }
    get item(): any {
        return this._item;
    }
    get validations(): IValidationInfo[] {
        return this._validations;
    }
}
