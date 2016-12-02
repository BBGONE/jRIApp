import { DUMY_ERROR } from "./const";

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
            if (!err)
                return;
            let str = "";
            if (err instanceof AggregateError) {
                str = (<AggregateError>err).message;
            }
            else if (err instanceof Error) {
                str = (<Error>err).message;
            }
            else if (!!err.message) {
                str = "" + err.message;
            }
            else
                str = "" + err;

            hashMap[str] = "";
        });

        let msg = "", errs = Object.keys(hashMap);

        errs.forEach((err) => {
            if (!!msg) {
                msg += "\r\n";
            }
            msg += "" + err;
        });

        if (!msg)
            msg = "Aggregate Error";
        return msg;
    }

    toString() {
        return "AggregateError: " + "\r\n" + this.message;
    }
}